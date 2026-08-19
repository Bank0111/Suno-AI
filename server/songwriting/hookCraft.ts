import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import { generateDynamicLexiconPalette } from '../lexicon/lexiconEngine';
import {
  ChorusBlueprint,
  HookCandidate,
  HookCraftResult,
  HookType,
  SongBlueprint,
  TitleStrategyType,
} from './types';

/**
 * Validate Hook Craft result
 */
export function validateHookCraft(hookResult: HookCraftResult): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!hookResult.candidates || hookResult.candidates.length === 0) {
    errors.push('No hook candidates generated');
  }
  if (!hookResult.selectedHook || !hookResult.selectedHook.text) {
    errors.push('No selected hook line defined');
  }
  if (!hookResult.chorusPlan || !hookResult.chorusPlan.hookLine) {
    errors.push('Missing chorus plan or hookLine in chorusPlan');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * HOOK CRAFT ENGINE
 * ออกแบบท่อนฮุกและ Chorus Blueprint ให้ทรงพลังตามจริตของทุกแนวดนตรี
 */
export async function buildHookCandidates(
  blueprint: SongBlueprint,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI
): Promise<HookCraftResult> {
  console.log(`[HookCraft] Generating 3-4 hook candidates based on Blueprint Core Truth: "${blueprint.coreTruth}" for genre: "${context.genresStr}"...`);

  const systemInstruction = `คุณคือ "Master Hook Architect & Global Hit Melodic Crafter"
หน้าที่ของคุณคือออกแบบ "ประโยคฮุก (Hook Lines)" และ "แผนผังท่อนฮุก (Chorus Blueprint)" ที่ติดหู ตราตรึง ทรงพลัง ร้องเข้าปาก และตรงกับจิตวิญญาณของแนวดนตรี "${context.genresStr || 'ดนตรีร่วมสมัย'}"

=======================================================
PART 1: HOOK DISCIPLINE & CHORUS BLUEPRINT
=======================================================
1. Core Truth & Emotional Compression:
   - Hook ต้องกลั่นจาก: Core Truth + Character Voice + Emotional Compression
   - Chorus มีหน้าที่ส่งมอบ "Song Truth" และ "แก่นอารมณ์ตกผลึก" ห้ามเล่าสรุป Timeline หรือบรรยายเหตุการณ์ซ้ำ

2. Hook Candidates Strategy (สร้าง 3-4 ตัวเลือก):
   - สร้าง 3 ถึง 4 Hook Candidates ที่มีมิติต่างกัน (phrase_hook, statement_hook, conversational_hook, image_hook)
   - หากผู้ใช้ระบุวลีสำคัญใน Story/Prompt ให้ประเมินเป็น Candidate ที่มี Priority สูงสุด

3. Dynamic Genre-Adaptive Phrasing:
   - เพลงลูกทุ่ง/เพื่อชีวิต: เน้นภาษาพูดซื่อตรง ตัดพ้อบาดลึก สัมผัสในลื่นไหล ร้องเอื้อนเข้าปาก
   - เพลง Pop/T-Pop/Indie: เน้น Earworm Melody ประโยคจำง่าย ติดหูตั้งแต่ฟังครั้งแรก
   - เพลง EDM/Dance/House: เน้นวลีสั้น กระชับ ทรงพลัง (Punchy & Hypnotic Anthem) ร้องตะโกนตามได้ทันที
   - เพลง Hip-Hop/R&B: เน้น Punchline คมกริบ และสัมผัสจังหวะคำที่มี Groove ชัดเจน
   - เพลง Rock/Alternative: เน้น Statement ทรงพลังที่พร้อมระเบิดเสียงร้อง

4. Chorus Blueprint Architecture:
   - Setup line (ประโยคเปิดนำอารมณ์)
   - Hook line (ประโยคฮุกหลัก: แก่นของเพลงที่จำง่ายที่สุด)
   - Reinforcement line (ประโยคตอกย้ำความหมาย: ล้อสัมผัสกับ Hook Line)
   - Emotional payoff (ประโยคจุดสูงสุดของอารมณ์: จบด้วย Punchline คมคาย)

=======================================================
PART 2: กฎกวีศาสตร์และข้อห้ามสากล
=======================================================
1. STRICT NARRATIVE LOGIC: ตรรกะของท่อนฮุกต้องสมเหตุสมผลและตรงกับปมขัดแย้งของเรื่อง 100%
2. NO ACADEMIC JARGON: ห้ามใช้ศัพท์วิชาการ/ภาษาบทความ (เช่น บริบท, มิติ, กำแพงสังคม)
3. NO MECHANICAL ITEM DUMP: ท่อนฮุกต้องเป็น "ความรู้สึกและสัจธรรมชีวิต" เท่านั้น ห้ามนำรายชื่อสิ่งของ อุปกรณ์การทำงาน หรือเครื่องมือเฉพาะทางมายัดเยียดใน 4 วรรคของฮุก
4. NATURAL CADENCE: วางจังหวะวรรคให้พอดีกับลมหายใจและห้องดนตรีของแนวนั้น ๆ อย่างเป็นธรรมชาติ

ส่งคืนผลลัพธ์เป็น JSON ตรงตาม Schema เท่านั้น`;

  const prompt = `โปรดสร้าง Hook Candidates 3-4 ตัว และวาง Chorus Blueprint ตามข้อมูลต่อไปนี้:

--- ข้อมูล SONG BLUEPRINT & COMPOSITION PLAN ---
- แก่นความจริงสูงสุด (Core Truth): "${blueprint.coreTruth}"
- ความขัดแย้งหลัก (Central Conflict): ${blueprint.centralConflict}
- ผู้เล่า (Speaker Voice): ${blueprint.speaker.identity} | น้ำเสียง: ${blueprint.speaker.voice}
- ผู้ฟัง (Listener): ${blueprint.listener}
- ฉาก/สถานที่ (Setting): ${blueprint.setting}
- ความต้องการของ Hook (Central Hook Need): ${blueprint.centralHookNeed}
- แนวดนตรี: ${context.genresStr}
- อารมณ์เพลง: ${context.moodsStr}
- ภาษาเป้าหมาย: ${context.targetContentLanguage || 'th'}
- โจทย์/เรื่องราว: ${context.story || 'เพลงที่ถ่ายทอดอารมณ์อย่างลึกซึ้ง'}

${generateDynamicLexiconPalette(context.story || '', context.targetContentLanguage || 'th')}

--- 🎯 DIRECTIVE CONSTRAINTS ---
1. ออกแบบประโยคฮุกให้เข้ากับจังหวะและจริตของแนวเพลง [${context.genresStr}]
2. คุมสัมผัสสระและคำลงท้ายให้ร้องลื่นไหล ไม่ติดขัด
3. โฟกัสที่แก่นอารมณ์และ Punchline ที่จำติดหูทันที`;

  try {
    const { response } = await callGeminiWithFallback(ai!, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: 'ประโยคฮุก' },
                  hookType: {
                    type: Type.STRING,
                    enum: [
                      'phrase_hook',
                      'statement_hook',
                      'conversational_hook',
                      'image_hook',
                      'title_hook',
                      'question_hook',
                      'contrast_hook',
                      'chant_hook',
                    ],
                  },
                  emotionalCore: { type: Type.STRING },
                  memorabilityReason: { type: Type.STRING },
                  storyFit: { type: Type.NUMBER },
                  personaFit: { type: Type.NUMBER },
                  genreFit: { type: Type.NUMBER },
                  singability: { type: Type.NUMBER },
                  naturalness: { type: Type.NUMBER },
                  emotionalImpact: { type: Type.NUMBER },
                  originality: { type: Type.NUMBER },
                  isUserOriginated: { type: Type.BOOLEAN },
                  rationale: { type: Type.STRING },
                },
                required: [
                  'text',
                  'hookType',
                  'emotionalCore',
                  'memorabilityReason',
                  'storyFit',
                  'personaFit',
                  'genreFit',
                  'singability',
                  'naturalness',
                  'emotionalImpact',
                  'originality',
                  'rationale',
                ],
              },
            },
            selectedIndex: { type: Type.INTEGER, description: '0-based index ของ candidate ที่เลือกเป็น Primary Hook' },
            chorusPlan: {
              type: Type.OBJECT,
              properties: {
                hookPlacement: { type: Type.STRING, enum: ['start', 'end', 'framing'] },
                setupLine: { type: Type.STRING },
                hookLine: { type: Type.STRING },
                reinforcementLine: { type: Type.STRING },
                emotionalPayoff: { type: Type.STRING },
                repetitionPlan: { type: Type.STRING, enum: ['exact_repeat', 'controlled_variation'] },
                variationRationale: { type: Type.STRING },
              },
              required: ['hookPlacement', 'setupLine', 'hookLine', 'reinforcementLine', 'emotionalPayoff', 'repetitionPlan'],
            },
            titleRelationship: {
              type: Type.OBJECT,
              properties: {
                strategy: {
                  type: Type.STRING,
                  enum: ['titleIsHook', 'titleDerivedFromHook', 'titleIsConcept', 'titleIsImage', 'titleIndependent'],
                },
                recommendedTitle: { type: Type.STRING },
                consistencyNote: { type: Type.STRING },
              },
              required: ['strategy', 'recommendedTitle', 'consistencyNote'],
            },
          },
          required: ['candidates', 'selectedIndex', 'chorusPlan', 'titleRelationship'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const rawCandidates: any[] = Array.isArray(parsed.candidates) ? parsed.candidates : [];

    const candidates: HookCandidate[] = rawCandidates.map((c: any) => {
      const sFit = Number(c.storyFit || 4);
      const pFit = Number(c.personaFit || 4);
      const gFit = Number(c.genreFit || 4);
      const sing = Number(c.singability || 4);
      const nat = Number(c.naturalness || 4);
      const emo = Number(c.emotionalImpact || 4);
      const orig = Number(c.originality || 4);
      const composite = Number(((sFit + pFit + gFit + sing + nat + emo + orig) / 7.0).toFixed(2));

      return {
        text: String(c.text || '').trim(),
        hookType: (c.hookType as HookType) || 'phrase_hook',
        emotionalCore: c.emotionalCore || blueprint.coreTruth,
        memorabilityReason: c.memorabilityReason || 'ประโยคกระชับ ติดหู',
        storyFit: sFit,
        personaFit: pFit,
        genreFit: gFit,
        singability: sing,
        naturalness: nat,
        emotionalImpact: emo,
        originality: orig,
        compositeScore: composite,
        isUserOriginated: Boolean(c.isUserOriginated ?? false),
        rationale: c.rationale || '',
      };
    });

    let selIdx = Number(parsed.selectedIndex ?? 0);
    if (selIdx < 0 || selIdx >= candidates.length) {
      selIdx = 0;
    }

    const selectedHook = candidates[selIdx] || {
      text: blueprint.coreTruth,
      hookType: 'phrase_hook',
      emotionalCore: blueprint.coreTruth,
      memorabilityReason: 'แก่นอารมณ์หลักของเพลง',
      storyFit: 5,
      personaFit: 5,
      genreFit: 5,
      singability: 5,
      naturalness: 5,
      emotionalImpact: 5,
      originality: 4,
      compositeScore: 4.86,
      rationale: 'Primary Hook selected based on core emotional truth.',
    };

    const chorusPlan: ChorusBlueprint = {
      hookPlacement: (parsed.chorusPlan?.hookPlacement as any) || 'end',
      setupLine: parsed.chorusPlan?.setupLine || 'ทุกค่ำคืนที่ใจยังคงคิดถึง',
      hookLine: selectedHook.text,
      reinforcementLine: parsed.chorusPlan?.reinforcementLine || 'ต่อให้เวลาจะหมุนผ่านไปเท่าไร',
      emotionalPayoff: parsed.chorusPlan?.emotionalPayoff || 'รักเธอเสมอไม่เคยเปลี่ยนไป',
      repetitionPlan: (parsed.chorusPlan?.repetitionPlan as any) || 'exact_repeat',
      variationRationale: parsed.chorusPlan?.variationRationale || 'รักษาความคุ้นเคยของประโยค Hook หลัก',
    };

    const titleRel = {
      strategy: (parsed.titleRelationship?.strategy as TitleStrategyType) || 'titleIsHook',
      recommendedTitle: parsed.titleRelationship?.recommendedTitle || selectedHook.text.slice(0, 30),
      consistencyNote: parsed.titleRelationship?.consistencyNote || 'ชื่อเพลงสอดคล้องกับประโยคฮุกหลัก',
    };

    const result: HookCraftResult = {
      candidates,
      selectedHook,
      chorusPlan,
      protectedHookLines: [selectedHook.text, chorusPlan.hookLine].filter(Boolean),
      titleRelationship: titleRel,
    };

    console.log(`[HookCraft]`);
    console.log(`candidateCount: ${candidates.length}`);
    console.log(`selected: "${selectedHook.text}" (${selectedHook.hookType})`);
    console.log(`score: ${selectedHook.compositeScore}/5.0`);

    return result;
  } catch (err: any) {
    console.error(`[HookCraft] Error crafting hooks, generating fallback:`, err.message);

    const fallbackHookText = blueprint.coreTruth || 'ใจมันยังคิดถึงเธอทุกนาที';
    const fallbackCandidate: HookCandidate = {
      text: fallbackHookText,
      hookType: 'phrase_hook',
      emotionalCore: blueprint.coreTruth,
      memorabilityReason: 'แก่นความจริงหลักของเพลง',
      storyFit: 4.5,
      personaFit: 4.5,
      genreFit: 4.5,
      singability: 4.5,
      naturalness: 4.5,
      emotionalImpact: 4.5,
      originality: 4.0,
      compositeScore: 4.43,
      rationale: 'Fallback Hook derived from Blueprint Core Truth.',
    };

    const fallbackChorus: ChorusBlueprint = {
      hookPlacement: 'end',
      setupLine: 'แม้เวลาจะผ่านไปนานแค่ไหน',
      hookLine: fallbackHookText,
      reinforcementLine: 'ความรู้สึกข้างในไม่เคยจางหาย',
      emotionalPayoff: 'ยังคงมีเธออยู่ในใจเสมอ',
      repetitionPlan: 'exact_repeat',
    };

    return {
      candidates: [fallbackCandidate],
      selectedHook: fallbackCandidate,
      chorusPlan: fallbackChorus,
      protectedHookLines: [fallbackHookText],
      titleRelationship: {
        strategy: 'titleIsHook',
        recommendedTitle: fallbackHookText.slice(0, 30),
        consistencyNote: 'ชื่อเพลงสอดคล้องกับประโยคฮุกหลัก',
      },
    };
  }
}

/**
 * Format HookCraftResult into a prompt block for the Lyric Writer
 */
export function formatHookCraftForPrompt(hookResult: HookCraftResult): string {
  const lines: string[] = [];

  lines.push('=== 4. HOOK CRAFT & CHORUS ARCHITECTURE PLAN ===');
  lines.push(`[คำสั่งสำคัญ]: ได้รับการออกแบบ Hook และ Chorus Blueprint ไว้ล่วงหน้าแล้ว โปรดนำประโยคฮุกหลักไปบรรเลงเป็นจุดศูนย์กลางของท่อน Chorus`);
  lines.push('');
  lines.push(`- ประโยคฮุกหลักที่คัดเลือก (Selected Primary Hook): "${hookResult.selectedHook.text}"`);
  lines.push(`  (ประเภท: ${hookResult.selectedHook.hookType} | แก่นอารมณ์: ${hookResult.selectedHook.emotionalCore} | คะแนนความลงตัว: ${hookResult.selectedHook.compositeScore}/5.0)`);
  lines.push('');
  lines.push(`[Chorus Blueprint & Hook Placement]:`);
  lines.push(`  - การวางตำแหน่ง Hook: ${hookResult.chorusPlan.hookPlacement}`);
  lines.push(`  - Setup Line (เกริ่นนำอารมณ์): "${hookResult.chorusPlan.setupLine}"`);
  lines.push(`  - Main Hook Line (ประโยคฮุกหลัก): "${hookResult.chorusPlan.hookLine}" (PROTECTED LINE)`);
  lines.push(`  - Reinforcement Line (ตอกย้ำความหมาย): "${hookResult.chorusPlan.reinforcementLine}"`);
  lines.push(`  - Emotional Payoff Line (ปิดท้ายฮุค): "${hookResult.chorusPlan.emotionalPayoff}"`);
  lines.push(`  - Repetition Plan: ${hookResult.chorusPlan.repetitionPlan}`);
  lines.push('');
  lines.push(`[Title & Hook Consistency Strategy]:`);
  lines.push(`  - กลยุทธ์ชื่อเพลง: ${hookResult.titleRelationship.strategy}`);
  lines.push(`  - ชื่อเพลงที่แนะนำ: "${hookResult.titleRelationship.recommendedTitle}"`);

  return lines.join('\n');
}