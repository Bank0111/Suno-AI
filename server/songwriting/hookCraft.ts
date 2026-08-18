import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
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
 * Generates 5-8 rich, memorable hook candidates grounded in Core Truth and Character Voice,
 * scores them on naturalness, memorability, and story fit, and designs a cohesive Chorus Blueprint.
 */
export async function buildHookCandidates(
  blueprint: SongBlueprint,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI
): Promise<HookCraftResult> {
  console.log(`[HookCraft] Generating 3-4 hook candidates based on Blueprint Core Truth: "${blueprint.coreTruth}"...`);

  const systemInstruction = `คุณคือ "Master Hook Architect & Platinum Song Crafter"
หน้าที่ของคุณคือออกแบบ "ประโยคฮุก (Hook Lines)" และ "แผนผังท่อนฮุค (Chorus Blueprint)" ที่ติดหู ตราตรึง ทรงพลัง ร้องเข้าปาก และตรงกับตัวละครที่สุด

=======================================================
PART 1: HOOK DISCIPLINE & CHORUS BLUEPRINT (ผังท่อนฮุก)
=======================================================
1. Core Truth & Emotional Compression:
   - Hook ต้องเกิดจาก: Core Truth + Character Voice + Emotional Compression
   - Chorus มีหน้าที่ส่งมอบ "Song Truth" และ "แก่นอารมณ์ตกผลึก" ห้ามเล่าสรุป Timeline หรือแจกแจงเหตุการณ์ซ้ำ

2. Hook Candidates Strategy (สร้าง 3-4 ตัวเลือก):
   - สร้าง 3 ถึง 4 Hook Candidates ที่กระชับและหลากหลาย (phrase_hook, statement_hook, conversational_hook, image_hook)
   - หากผู้ใช้ระบุวลีสำคัญใน Story/User Prompt ให้ประเมินเป็น Candidate ที่มี Priority สูงสุด
   - Hook ต้องเป็นประโยคที่ตัวละครในเรื่อง "น่าจะพูดจริงในชีวิต"

3. Scoring & Selection (การประเมินและคัดเลือก):
   - ให้คะแนนแต่ละ Candidate (1.0 - 5.0) ในมิติ: storyFit, personaFit, genreFit, singability, naturalness, emotionalImpact, originality
   - คัดเลือก "Selected Hook" ที่สมบูรณ์แบบที่สุด 1 ตัว

4. Chorus Blueprint Architecture (ผัง 4 บรรทัดมาตรฐาน):
   - Setup line (ประโยคเปิดนำอารมณ์: ส่งสัมผัสไปยัง Hook Line)
   - Hook line (ประโยคฮุกหลัก: แก่นของเพลงที่จำง่ายที่สุด)
   - Reinforcement line (ประโยคตอกย้ำความหมาย: จำนวนพยางค์ล้อกับ Setup line)
   - Emotional payoff (ประโยคจุดสูงสุดของอารมณ์: สัมผัสคล้องกับ Reinforcement line)
   - Repetition plan ('exact_repeat' หรือ 'controlled_variation' พร้อมเหตุผล)

=======================================================
PART 2: 🌟 ADVANCED POETIC DEVICES & LYRICAL MASTERY (กฎกวีศาสตร์ขั้นสูง)
=======================================================
1. STRICT NARRATIVE LOGIC (ตรรกะเนื้อเรื่องต้องสมเหตุสมผล 100%):
   - ตรรกะของท่อนฮุกต้องตรงกับปมขัดแย้งของเรื่อง ห้ามใช้คำขัดแย้งผิดความหมาย (เช่น คนจนแพ้คนรวย คือแพ้ความสบาย/เงินตรา ไม่ใช่แพ้ความลำบาก)

2. NATURAL PHRASING & NO ACADEMIC JARGON (ภาษาคนพูดจริง):
   - ใช้ภาษาพูดและภาษาเพลงที่มนุษย์ใช้จริง ซื่อ ตรง และแทงใจดำ
   - ห้ามใช้ศัพท์วิชาการ ภาษาบทความ หรือภาษาแปลเด็ดขาด (ห้ามใช้ "กำแพงทางสังคม", "บริบท", "ขับเคลื่อน")
   - ห้ามสร้างรูปประโยคไวยากรณ์แปลกที่คนไทยไม่ใช้ (เช่น "แลกความรักพ้นผ่านไปไม่ได้")

3. 4/4 RHYTHMIC CADENCE & METER (จังหวะเคาะลงห้องดนตรี):
   - แต่ละวรรคต้องมีความยาว 6-8 คำ (พยางค์) เพื่อให้ลงจังหวะตก (Downbeat) ของห้องดนตรี 4/4 พอดี ไม่เขียนยาวเป็นร้อยแก้ว
   - ก่อนลงคำ ให้เช็คเสมอว่าเคาะจังหวะ 1 คำต่อ 1 เคาะแล้วลื่นไหล ไม่ต้องรัวคำ

4. RHYME & INTERNAL FLOW (สัมผัสในและสัมผัสนอก):
   - คำท้ายวรรคต้องส่ง-รับสัมผัสสระกันอย่างลงตัวตามฉันทลักษณ์
   - บังคับให้มี "สัมผัสใน" (เสียงสระ/พยัญชนะคู่ชิด) ในทุกวรรคเพื่อให้ร้องเข้าปากและเกิด Groove

5. BALANCE SHOW & TELL:
   - สลับภาพจำจากสิ่งของจริง (Show) กับคำพูดตัดพ้อความรู้สึกตรงๆ (Tell) เช่น "ใจมันเจ็บ", "สู้เขาไม่ไหว"

6. ZERO CLICHÉS & LINGUISTIC PURITY:
   - เลี่ยงคำบอกอารมณ์สำเร็จรูปโหลๆ (เช่น "ดวงดาวในคืนนี้", "ไม่มีเธอจะอยู่ยังไง")
   - ตัดคำสร้อยฟุ่มเฟือย ใช้คำง่ายแต่กินใจ (Simple words, Deep impact)

7. LUKTHUNG & POETIC FOLK PARALLEL HOOK (โครงสร้างคู่ขนานลูกทุ่งเพื่อชีวิต):
   - ใช้โครงสร้างประโยคตัดพ้อคู่ขนาน (Parallel Antithesis) เช่น:
     * "มือพี่เปื้อนคราบน้ำมัน... มือเขามีแหวนเพชรให้เธอ"
     * "เหงื่อทั้งปีแลกได้แค่ค่าห้อง... เงินเขากองซื้อใจเธอไป"
   - Climax Punchline ต้องขยี้แผลใจและความเหลื่อมล้ำอย่างคมคาย

ส่งคืนผลลัพธ์เป็น JSON ตรงตาม Schema เท่านั้น`;

  const prompt = `โปรดสร้าง Hook Candidates 3-4 ตัว และวาง Chorus Blueprint ตามข้อมูลต่อไปนี้:

=== ข้อมูล SONG BLUEPRINT & COMPOSITION PLAN ===
- แก่นความจริงสูงสุด (Core Truth): "${blueprint.coreTruth}"
- ความขัดแย้งหลัก (Central Conflict): ${blueprint.centralConflict}
- ผู้เล่า (Speaker Voice): ${blueprint.speaker.identity} | น้ำเสียง: ${blueprint.speaker.voice}
- ผู้รับฟัง (Listener): ${blueprint.listener}
- ฉาก/สถานที่ (Setting): ${blueprint.setting}
- สิ่งของและภาพ Sensory (Visual/Objects): ${[...blueprint.songWorld.objects, ...blueprint.visualMotifs].join(', ') || 'ตามความเหมาะสม'}
- จุด Dramatic ที่เลือกเน้น (Chosen Dramatic Moments): ${blueprint.narrativeCompression?.chosenDramaticMoments?.join(' | ') || 'ตามแก่นเรื่อง'}
- สิ่งที่ต้องหลีกเลี่ยง (Negative Space & Clichés): ${blueprint.negativeSpaceDirectives?.clicheAvoidanceZones?.join(', ') || 'คำบอกอารมณ์สำเร็จรูป'}
- ความต้องการของ Hook (Central Hook Need): ${blueprint.centralHookNeed}
- แนวเพลง: ${context.genresStr}
- อารมณ์: ${context.moodsStr}
- ภาษาเป้าหมาย: ${context.targetContentLanguage}
- โจทย์/เรื่องราว: ${context.story || 'เพลงรักร่วมสมัย'}

[คำสั่งเน้นย้ำ]: Hook และ Chorus ต้องสะท้อน Core Truth และเป็น Emotional Compression ไม่เล่าเหตุการณ์ตามลำดับเวลา`;

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

    // Structured Log (Rule 29: Development logs)
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
