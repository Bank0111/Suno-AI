import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import { validateLyricPhrasing } from './validator';

export interface PhrasingRefinementOptions {
  targetSectionIndex?: number;
  targetSectionType?: string;
  endpoint?: string;
}

export async function refineSongLyricPhrasing(
  songData: { title: string; stylePrompt: string; sections: any[] },
  context: BuiltCreativeContext,
  ai: GoogleGenAI,
  options?: PhrasingRefinementOptions
): Promise<{ sections: any[]; phrasingReport: any }> {
  const initialSections = songData.sections || [];
  if (initialSections.length === 0) {
    return { sections: initialSections, phrasingReport: validateLyricPhrasing(initialSections) };
  }

  // Pre-clean initial sections: strip any accidental annotations or markdown syntax from lyrics lines
  const cleanedSections = initialSections.map((sec) => ({
    ...sec,
    lyrics: (sec.lyrics || []).map((l: string) => {
      let line = l.replace(/\s*\(\d+\s*syllables?\)/gi, '')
                  .replace(/\s*\[.*?\]/g, '')
                  .trim();
      return line;
    }).filter((l: string) => l.length > 0),
  }));

  // === CONDITIONAL BYPASS TOKEN OPTIMIZATION ===
  // ตรวจสอบคุณภาพเนื้อเพลงรอบแรก หากคะแนนสูงและไม่มีปัญหาเรื่องความยาววรรค ให้ข้ามการเรียก LLM ซ้ำเพื่อประหยัด Token
  const initialReport = validateLyricPhrasing(cleanedSections, context);
  const hasCriticalLengthIssues = initialReport.issues.some((i: any) => i.type === 'too_long' || i.type === 'line_length_outlier');
  
  if (initialReport.score >= 85 && !hasCriticalLengthIssues && options?.targetSectionIndex === undefined) {
    console.log(`[LyricPhrasingEngine] Conditional Bypass Activated! Score is ${initialReport.score}/100 with no critical length issues. Skipping LLM Pass 2 refinement to save tokens.`);
    return {
      sections: cleanedSections,
      phrasingReport: initialReport,
    };
  }
  // =============================================

  try {
    const isSingleSection = options?.targetSectionIndex !== undefined && options.targetSectionIndex >= 0;
    
    const systemInstruction = `คุณคือ Intelligent AI Lyric Phrasing & Singability Specialist (ผู้เชี่ยวชาญด้านการจัดวรรคคำร้องและจังหวะการร้องจริงระดับครูเพลง)

หน้าที่ของคุณคือ "PASS 2: ตรวจและจัด Phrasing & Line Breaks" ให้เนื้อเพลงร้องเข้าปากได้อย่างเป็นธรรมชาติและสมบูรณ์แบบสูงสุด

กฎเหล็กสำคัญที่สุดของ PASS 2:
1. ห้ามเปลี่ยน Story, Core Meaning, Hook Identity หรือ POV เด็ดขาด!
2. [สำคัญที่สุด] ห้ามร้อยแก้วยาวๆ: ตรวจสอบและซอยบรรทัดที่ยาวเกินไป บังคับให้ทุกบรรทัดมีความยาว 6-10 พยางค์ เท่านั้น
3. จัดจังหวะสัมผัส (Rhyme Flow): ปรับคำเชื่อมและคำลงท้ายให้คล้องจองกันข้ามบรรทัด เพื่อให้ร้องลื่นไหลตาม Tempo
4. Chorus: ต้องจัดวรรคให้เน้น Hook ชัดเจน คำกระชับ ทรงพลัง อ่านและร้องตามได้ทันที
5. ห้ามใส่ตัวเลขนับพยางค์ (Syllable Count) หรือ Metadata ลงใน 'lyrics'
6. รักษาชื่อ type, performanceDirection, และ musicDirection ไว้ตามเดิม`;

    const sectionsJsonForPrompt = JSON.stringify(cleanedSections, null, 2);

    const prompt = `โปรดตรวจและจัด Phrasing (Pass 2) สำหรับเนื้อเพลงนี้:

${context.userCreativeSettingsBlock}

${context.lyricPhrasingBlock || context.styleExecutionBlock}

=== PASS 1 LYRICS (เนื้อเพลงตั้งต้นที่ต้องนำมาจัด Phrasing & Line Breaks) ===
${sectionsJsonForPrompt}

${isSingleSection ? `* หมายเหตุ: โฟกัสการจัด Phrasing ให้สมบูรณ์แบบเป็นพิเศษในท่อน [${options.targetSectionType || `Section ${options.targetSectionIndex! + 1}`}] โดยรักษาท่อนอื่นให้คงเดิม` : ''}

โปรดส่งคืน JSON ของ sections ทั้งหมด ที่ผ่านการจัด Phrasing และ Line Breaks ให้พร้อมสำหรับการร้องและ Suno อย่างสมบูรณ์แบบ`;

    const { response } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  performanceDirection: { type: Type.STRING },
                  musicDirection: { type: Type.STRING },
                  lyrics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "บรรทัดคำร้องที่จัดวรรคถูกต้องตามหลัก Phrasing และ Singability พร้อมร้องจริง",
                  },
                },
                required: ["type", "lyrics"],
              },
            },
          },
          required: ["sections"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      // Ensure directions are preserved if Pass 2 omitted any
      const finalSections = parsed.sections.map((refinedSec: any, idx: number) => {
        const origSec = cleanedSections[idx] || {};
        return {
          type: refinedSec.type || origSec.type,
          performanceDirection: refinedSec.performanceDirection || origSec.performanceDirection || "",
          musicDirection: refinedSec.musicDirection || origSec.musicDirection || "",
          lyrics: (refinedSec.lyrics || origSec.lyrics || []).map((l: string) => l.trim()).filter((l: string) => l.length > 0),
        };
      });

      const phrasingReport = validateLyricPhrasing(finalSections, context);
      console.log(`[LyricPhrasingEngine] Pass 2 Completed (${options?.endpoint || 'generate-song'}). Validation Score: ${phrasingReport.score}/100, Issues: ${phrasingReport.issues.length}`);
      return {
        sections: finalSections,
        phrasingReport,
      };
    }
  } catch (err: any) {
    console.warn("[LyricPhrasingEngine] Pass 2 refinement skipped or failed, using Pass 1 fallback:", err.message);
  }

  const fallbackReport = validateLyricPhrasing(cleanedSections, context);
  return {
    sections: cleanedSections,
    phrasingReport: fallbackReport,
  };
}
