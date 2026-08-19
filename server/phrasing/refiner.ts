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
  // ปิด bypass ชั่วคราว (false &&) เพื่อบังคับให้ Pass 2 เข้ามาตรวจทานสัมผัสและขัดเกลาคำซ้ำทุกครั้ง
  const initialReport = validateLyricPhrasing(cleanedSections, context);
  const hasCriticalLengthIssues = initialReport.issues.some((i: any) => i.type === 'too_long' || i.type === 'line_length_outlier');
  
  if (false && initialReport.score >= 85 && !hasCriticalLengthIssues && options?.targetSectionIndex === undefined) {
    console.log(`[LyricPhrasingEngine] Conditional Bypass Activated! Score is ${initialReport.score}/100 with no critical length issues. Skipping LLM Pass 2 refinement to save tokens.`);
    return {
      sections: cleanedSections,
      phrasingReport: initialReport,
    };
  }
  // =============================================

  try {
    const isSingleSection = options?.targetSectionIndex !== undefined && options.targetSectionIndex >= 0;
    
    const systemInstruction = `คุณคือ Intelligent AI Master Songwriter & Lyric Phrasing Specialist (ครูเพลงและผู้เชี่ยวชาญด้านฉันทลักษณ์และจังหวะคำร้องระดับชั้นครู)

หน้าที่ของคุณคือ "PASS 2: ตรวจทานสัมผัส จัด Phrasing และยกระดับภาษา (Poetic Elevation)" ให้เนื้อเพลงร้องเข้าปาก ไพเราะ และไม่มีจุดสะดุด

กฎเหล็กสำคัญของ PASS 2:
1. ห้ามเปลี่ยน Story, Core Meaning, หรือ POV หลักเด็ดขาด
2. [ตรวจคำท้ายซ้ำ - ห้ามเด็ดขาด]: ตรวจดูคำลงท้ายวรรคในท่อนเดียวกัน ห้ามลงท้ายด้วย "คำเดิมซ้ำกัน" เกิน 1 ครั้ง (เช่น ห้าม เล่น-เล่น-เล่น หรือ เดิม-เดิม) หากพบ ให้เปลี่ยนเป็นคำอื่นในมาตราตัวสะกดและสระเดียวกันทันที
3. [ผังบังคับสัมผัส (Rhyme Scheme)]:
   - คำท้ายวรรค 2 ต้องส่งสัมผัสสระและมาตราตัวสะกดเดียวกัน ไปยังคำท้ายวรรค 3 (หรือคำที่ 3 ของวรรค 4) เสมอ
   - สัมผัสใน (Internal Rhyme): เติมแต่งเสียงสระหรือพยัญชนะคู่ชิดกลางวรรค (เช่น ขาดสาย-กราย, เรรวน-ชวน, เปียกฝน-ลมหนาว) ให้เกิดกรูฟคำที่ร้องเอื้อนได้ลื่นไหล
4. [ยกระดับคลังคำ (Vocabulary Upgrade)]:
   - หลีกเลี่ยงภาษาทางการ/วิชาการ (เช่น "คนชั้นแรงงาน") ให้เปลี่ยนเป็นภาษาพูดซื่อๆ ที่จริงใจ ("คนสู้งาน", "คนหาเช้ากินค่ำ")
   - ใช้ภาพเปรียบเทียบรูปธรรมที่บาดลึก (Visceral Metaphor) เช่น รอยแผล, น้ำตาบนตัก, สายลมหนาว
5. [คุมความยาววรรค]: ตัดทอนคำฟุ่มเฟือย ให้ทุกวรรคมีความยาวประมาณ 6-8 พยางค์ (ไม่เกิน 9 พยางค์) ร้องสบาย ไม่แน่นห้องดนตรี
6. ห้ามใส่ตัวเลขนับพยางค์ (Syllable Count) หรือ Metadata ลงใน 'lyrics'
7. รักษาชื่อ type, performanceDirection, และ musicDirection ไว้ตามเดิม`;

    const sectionsJsonForPrompt = JSON.stringify(cleanedSections, null, 2);

    const prompt = `โปรดตรวจทานสัมผัส จัด Phrasing และยกระดับภาษา (Pass 2) สำหรับเนื้อเพลงนี้:

${context.userCreativeSettingsBlock}

${context.lyricPhrasingBlock || context.styleExecutionBlock}

=== PASS 1 LYRICS (เนื้อเพลงตั้งต้นที่ต้องนำมาจัด Phrasing, ตรวจสัมผัส และแก้คำซ้ำ) ===
${sectionsJsonForPrompt}

${isSingleSection ? `* หมายเหตุ: โฟกัสการจัด Phrasing และแก้คำสัมผัสให้สมบูรณ์แบบเป็นพิเศษในท่อน [${options.targetSectionType || `Section ${options.targetSectionIndex! + 1}`}] โดยรักษาท่อนอื่นให้คงเดิม` : ''}

โปรดส่งคืน JSON ของ sections ทั้งหมด ที่ผ่านการตรวจสัมผัสและเกลาคำร้องให้พร้อมสำหรับการร้องจริงอย่างสมบูรณ์แบบ`;

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