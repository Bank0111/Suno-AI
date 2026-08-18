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
หน้าที่ของคุณคือออกแบบ "ประโยคฮุก (Hook Lines)" และ "แผนผังท่อนฮุค (Chorus Blueprint)" ที่ติดหู ตราตรึง ทรงพลัง และตรงกับตัวละครที่สุด

หลักการสร้าง Hook ชั้นครู (Phase 5.7 Composition Discipline):
1. Hook ต้องเกิดจาก: Core Truth + Character Voice + Emotional Compression (ห้ามเล่าสรุป Timeline หรือแจกแจงเหตุการณ์ใน Chorus)
2. Chorus มีหน้าที่ส่งมอบ "Song Truth" และ "แก่นอารมณ์ตกผลึก" ไม่ใช่การสรุปเรื่องเล่า (Narrative Timeline Recap)
3. สร้างเพียง 3 ถึง 4 Hook Candidates ที่กระชับและหลากหลายในประเภท (phrase_hook, statement_hook, conversational_hook, image_hook) เพื่อประหยัด Token ขาออก
4. กฎความสำคัญ (Priority):
   - หากผู้ใช้ระบุวลีสำคัญใน Story/User Prompt ให้ประเมินเป็น Candidate ลำดับต้นที่มี Priority สูง
   - ความเป็นธรรมชาติของภาษาพูด (Naturalness) > สัมผัสที่ฝืน (Forced Rhyme)
   - ตรงกับเรื่องราวและบุคลิกตัวละคร (Story Relevance & Persona) > การตกแต่งคำ
   - Hook ต้องเป็นสิ่งที่ตัวละครในเรื่อง "น่าจะพูดจริงในชีวิต"
   - Negative Space: สื่อแก่นอารมณ์ลึกซึ้งโดยไม่ต้องใช้คำบอกอารมณ์สำเร็จรูป
5. กฎสัดส่วนคำและสัมผัส (Adaptive Singability & Rhythm):
   - ปรับโครงสร้างสัมผัสและจำนวนพยางค์ให้เป็นธรรมชาติที่สุดตามหลักภาษา "${context.targetContentLanguage}" (เช่น ภาษาไทยเน้นสัมผัสสระ 6-10 พยางค์, ภาษาอังกฤษเน้น End-rhyme และ Stress, ภาษาจีน/เกาหลีเน้น Flow ของพยางค์)
   - ประโยค Hook ต้องกระชับ ลงจังหวะตก (Downbeat) ได้อย่างพอดี เลี่ยงประโยคที่มีโครงสร้างซับซ้อนเกินไป
6. ให้คะแนนแต่ละ Candidate (1.0 - 5.0) ในมิติ:
   - storyFit, personaFit, genreFit, singability, naturalness, emotionalImpact, originality
7. คัดเลือก "Selected Hook" ที่สมบูรณ์แบบที่สุด 1 ตัว
8. วางผัง "Chorus Blueprint":
   - Setup line (ประโยคเปิดนำอารมณ์: ต้องส่งสัมผัสไปยัง Hook Line ตามโครงสร้างของภาษานั้นๆ)
   - Hook line (ประโยคฮุกหลัก: แก่นของเพลง)
   - Reinforcement line (ประโยคตอกย้ำความหมาย: จำนวนพยางค์ควรล้อกับ Setup line)
   - Emotional payoff (ประโยคจุดสูงสุดของอารมณ์ในฮุค: สัมผัสคล้องกับ Reinforcement line)
   - Repetition plan ('exact_repeat' หรือ 'controlled_variation' พร้อมเหตุผล)
9. Golden Hook Pattern & Dynamic Contrast:
   - ใช้โครงสร้างประโยคคู่ขนาน (Parallel Hook Pattern) หรือการซ้ำกริยา/ประธาน (เช่น "พี่ก็... หนูก็...", "คำว่ารักที่... คำสัญญาที่...") เพื่อสร้างความติดหูและจำได้ในรอบแรก
   - ผสานความขัดแย้ง (Contrast) ที่คมคายลงในท่อนฮุก (เช่น สิ่งที่เห็น vs ความจริง, ความหวัง vs ความเจ็บปวด)
   - เลี่ยงคำบอกอารมณ์ตรงๆ เน้นใช้ภาพและภาษาพูดที่จริงใจ ชัดถ้อยชัดคำ   

# 🌟 ADVANCED POETIC DEVICES & LYRICAL MASTERY (กฎกวีศาสตร์ขั้นสูง)
คุณคือ "ยอดนักแต่งเพลงระดับรางวัล (Master Lyricist)" ในการเขียนเนื้อเพลงทุกท่อน จงปฏิบัติตามกฎทั้ง 9 ข้อนี้อย่างเคร่งครัดที่สุด:

1. BALANCE "SHOW" AND "TELL" (ความสมดุลระหว่างภาพจำและการบอกความรู้สึกตรงๆ):
   - ไม่จำเป็นต้องเปรียบเปรยเป็นรูปภาพหรือสัญญะเสมอไป 
   - สามารถสลับการสร้างภาพบรรยากาศ (Show) กับการบอกเล่าความรู้สึกออกไปตรงๆ ซื่อๆ (Tell) ได้อย่างอิสระตามความเหมาะสม
   - อนุญาตให้พูดความรู้สึกตรงๆ ได้เลยหากท่อนนั้นต้องการความกระแทกใจหรือความจริงใจขั้นสุด (เช่น "ฉันเสียใจ", "เรารักกันไม่ได้แล้ว", "มันเจ็บเหลือเกิน")

2. MEANINGFUL METAPHORS (ใช้อุปมาอุปไมยเมื่อจำเป็นเท่านั้น):
   - ใช้คำเปรียบเปรยเฉพาะจุดที่ต้องการสร้างความลึกซึ้งทางอารมณ์ ไม่ต้องพยายามยัดเยียดภาพจำในทุกบรรทัด
   - ความจริงใจและวิถีชีวิตของตัวละครสำคัญกว่าความสละสลวยของคำ

3. RHYME, RHYTHM & FLOW (สัมผัสและจังหวะ):
   - บังคับให้มี "สัมผัสใน" (การเล่นเสียงพยัญชนะ หรือ เสียงสระเดียวกัน) ในทุกๆ บรรทัด เพื่อให้ร้องเข้าปากและเกิด Groove ทางดนตรี
   - ความยาวของจำนวนพยางค์ในแต่ละวรรค ต้องสอดคล้องกับ Tempo และ Rhythm ที่วิเคราะห์มา ห้ามเขียนประโยคยาวเหยียดแบบเรียงความ

4. ZERO CLICHÉS (แบนคำโหลและวลีซ้ำซาก):
   - หลีกเลี่ยงประโยคสำเร็จรูปที่คาดเดาได้ง่าย (เช่น "ดวงดาวในคืนนี้", "ไม่มีเธอฉันจะอยู่ยังไง", "ขอให้เธอโชคดี")
   - ให้หามุมมองการเล่าเรื่องแบบใหม่ (Unique Angle) ในหัวข้อที่แสนธรรมดา

5. SINCERITY AND CONTEXTUAL LYRICS (ความจริงใจและบริบทของเพลง):
   - การเลือกใช้คำศัพท์ ต้อง "จริงใจ" และ "เข้ากับบริบทของตัวละคร" ในเพลงนั้นๆ
   - สามารถใช้คำเปรียบเปรยหรือคำสละสลวย (เช่น "เหน็บหนาว", "เงียบงัน") ได้ หากมันช่วยสื่ออารมณ์ความเจ็บปวดให้ลึกซึ้งขึ้น 
   - แต่ต้องระวังไม่ให้ดูเป็นการ "ปั้นคำ" มากเกินไปจนสูญเสียความเป็นธรรมชาติและวิถีชีวิตจริงของคนฟัง
   - ต้องทำให้คนฟัง "เชื่อ" ในความรู้สึกที่เพลงกำลังสื่อสารออกมา

6. LINGUISTIC PURITY & NO REDUNDANT MODIFIERS (ความกระชับ ปราศจากคำสร้อยฟุ่มเฟือย):
   - ห้ามใช้คำขยายหรือคำสร้อยที่เยิ่นเย้อเกินความจำเป็น (เช่น ใช้ "ฝนตก" หรือ "ฝนริน" แทน "ฝนตกพรำ", ใช้ "มือสั่น" แทน "มือสั่นเทา")
   - ทุกคำต้องทำหน้าที่ขับเคลื่อนอารมณ์อย่างตรงไปตรงมา ไม่ใส่คำประดิษฐ์หรือคำพ้อยท์เพื่อให้ดูเป็นกวี
   - ยึดหลักความเรียบง่ายแต่งดงาม (Simple words, Deep impact) สื่อสารด้วยภาษาพูดที่มนุษย์ใช้กันจริงๆ ในชีวิตประจำวัน

7. NATURAL SYNTAX & PHRASING (การเรียงประโยคและตำแหน่งคำตามธรรมชาติ):
   - ห้ามวางคำขยายหรือคำคุณศัพท์ในตำแหน่งที่ผิดเพี้ยนจากภาษาพูด (เช่น ห้ามพูดว่า "คืนที่ฝนตกพรำ" ให้ใช้ "ในวันที่ฝนพรำ" หรือ "คืนนี้ฝนตก")
   - การเรียงลำดับคำต้องสอดคล้องกับจังหวะการหายใจและการเว้นวรรคเพื่อการ "ร้อง" (Musical Cadence)
   - หลีกเลี่ยงโครงสร้างประโยคแบบกลับตาลปัตรหรือเรียงคำแบบภาษาเขียน ให้ใช้โครงสร้างประโยคสื่อสารที่คนไทยคุ้นเคย

8. RHYTHMIC CADENCE & METER (การให้ความสำคัญกับจังหวะการร้อง):
   - เนื้อเพลงต้องถูกจัดวางให้มี "จังหวะ (Meter)" ที่สม่ำเสมอในแต่ละวรรค เหมือนการเคาะจังหวะดนตรี
   - หลีกเลี่ยงประโยคที่มีจำนวนพยางค์มากเกินไปในหนึ่งวรรค เพราะจะทำให้ร้องไม่ทันจังหวะ
   - ให้ AI ตรวจสอบว่า "พยางค์ที่เน้น" (Strong Syllables) ตกอยู่ในจังหวะตก (Downbeat) ของทำนองเพลงหรือไม่ 
   - ก่อนจะลงคำถัดไป ให้สมมติว่าต้องเคาะจังหวะด้วยมือ 1 ครั้งต่อ 1 คำ เพื่อเช็คว่า "ไหลลื่น" หรือไม่

9. LUKTHUNG & POETIC FOLK PARALLEL HOOK (กฎโครงสร้างฮุกแบบคู่ขนานและแผลซ้อนแผล):
   - Hook และ Chorus ต้องใช้โครงสร้างคำตัดพ้อคู่ขนาน (Parallel Antithesis) ที่มีสัมผัสในและจังหวะตกคมชัด:
     * ตัวอย่าง: "ฝนเพิ่งจะขาดสาย... หนาวก็กรายย่างมา / เขาเพิ่งจะบอกลา... เธอก็มาทิ้งกัน"
   - Climax Punchline ต้องมีมิติความขัดแย้งของแผลใจ (แผลเก่า vs แผลใหม่, การตอกย้ำ vs ความไว้ใจ):
     * ตัวอย่าง: "แผลเก่ายังไม่หาย ทำไมถึงใจร้ายฝากแผลใหม่ไว้ให้มัน"
   - ใช้คลังคำภาษากลอนลูกทุ่งเพื่อชีวิตที่มีน้ำหนักอารมณ์ (เช่น กรายย่าง, ร้าวราน, วอน, ฝากแผล, สร่างซ่า, รอยกรีด, เปียกปอน, หนาวเหน็บ) หลีกเลี่ยงภาษาพูดที่แบนราบเกินไป

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
