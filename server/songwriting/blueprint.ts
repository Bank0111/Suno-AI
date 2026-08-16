import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import {
  BlueprintValidationResult,
  SectionBlueprintPlan,
  SongBlueprint,
  SongWorld,
  SpeakerVoiceContract,
  TitleStrategyType,
} from './types';

// In-memory Blueprint Cache: cacheKey -> { blueprint: SongBlueprint, timestamp: number }
const blueprintCache = new Map<string, { blueprint: SongBlueprint; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function generateBlueprintCacheKey(context: BuiltCreativeContext, songId?: string): string {
  if (songId) return `song-${songId}`;
  const rawKey = `${context.story || ''}|${context.genresStr}|${context.moodsStr}|${context.targetContentLanguage}|${context.structureStr}`;
  return `hash-${Buffer.from(rawKey).toString('base64').slice(0, 48)}`;
}

export function invalidateBlueprintCache(songId?: string): void {
  if (songId) {
    blueprintCache.delete(`song-${songId}`);
  }
}

/**
 * Validate that a SongBlueprint meets all compositional integrity requirements.
 */
export function validateSongBlueprint(blueprint: SongBlueprint): BlueprintValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!blueprint.coreTruth || blueprint.coreTruth.trim().length === 0) {
    errors.push('Missing coreTruth in SongBlueprint');
  }
  if (!blueprint.centralConflict || blueprint.centralConflict.trim().length === 0) {
    errors.push('Missing centralConflict in SongBlueprint');
  }
  if (!blueprint.speaker || !blueprint.speaker.identity) {
    errors.push('Missing speaker identity in SongBlueprint');
  }
  if (!blueprint.sectionPlans || blueprint.sectionPlans.length === 0) {
    errors.push('Missing sectionPlans in SongBlueprint');
  }

  // Check section-specific compositional obligations
  let hasVerse2 = false;
  let verse2HasNewInfo = false;
  let hasBridge = false;
  let bridgeHasShift = false;
  let hasChorus = false;

  blueprint.sectionPlans.forEach((plan) => {
    const typeNorm = plan.sectionType.toLowerCase();
    if (!plan.purpose || !plan.narrativeJob) {
      errors.push(`Empty purpose or narrativeJob in section: ${plan.sectionType}`);
    }

    if (typeNorm.includes('verse 2')) {
      hasVerse2 = true;
      if (plan.informationToReveal && plan.informationToReveal.length > 0) {
        verse2HasNewInfo = true;
      }
      if (!plan.mustNotRepeat || plan.mustNotRepeat.length === 0) {
        warnings.push('Verse 2 should have explicit mustNotRepeat constraints against Verse 1');
      }
    }

    if (typeNorm.includes('bridge')) {
      hasBridge = true;
      if (
        plan.narrativeJob.toLowerCase().includes('shift') ||
        plan.narrativeJob.toLowerCase().includes('realization') ||
        plan.narrativeJob.toLowerCase().includes('perspective') ||
        plan.emotionalJob.toLowerCase().includes('shift') ||
        plan.emotionalJob.toLowerCase().includes('contrast') ||
        plan.purpose.toLowerCase().includes('shift')
      ) {
        bridgeHasShift = true;
      }
    }

    if (typeNorm.includes('chorus')) {
      hasChorus = true;
    }
  });

  if (hasVerse2 && !verse2HasNewInfo) {
    errors.push('Verse 2 must specify new informationToReveal (anti-repetition rule)');
  }
  if (hasBridge && !bridgeHasShift) {
    warnings.push('Bridge should specify an emotional or perspective shift job');
  }
  if (!hasChorus) {
    warnings.push('SongBlueprint does not contain a Chorus section plan');
  }

  // Phase 5.7: Composition validation
  if (!blueprint.narrativeCompression?.chosenDramaticMoments || blueprint.narrativeCompression.chosenDramaticMoments.length === 0) {
    warnings.push('SongBlueprint should have chosenDramaticMoments in narrativeCompression');
  }
  if (!blueprint.bridgeEpiphany?.psychologicalShift) {
    warnings.push('SongBlueprint should specify bridgeEpiphany psychological shift');
  }
  if (!blueprint.outroClosure?.finalLingeringImage) {
    warnings.push('SongBlueprint should specify outroClosure final lingering image');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * SONG BLUEPRINT ENGINE
 * Constructs a structured compositional blueprint prior to lyric drafting.
 */
export async function buildSongBlueprint(
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: { songId?: string; forceRefresh?: boolean } = {}
): Promise<SongBlueprint> {
  const cacheKey = generateBlueprintCacheKey(context, options.songId);
  const cached = blueprintCache.get(cacheKey);

  if (!options.forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[SongBlueprint] Using cached blueprint for key: ${cacheKey}`);
    return cached.blueprint;
  }

  console.log(`[SongBlueprint] Building compositional blueprint for song...`);

  const systemInstruction = `คุณคือ "Executive Song Architect & Master Lyric Dramaturg" สตูดิโอออกแบบโครงสร้างเพลงชั้นครู
หน้าที่ของคุณคือสร้าง "SONG BLUEPRINT" (แผนผังการประพันธ์เพลงเชิงสถาปัตยกรรมและการกลั่นกรองบทกวี) ก่อนที่นักแต่งเพลงจะลงมือเขียนเนื้อร้อง

กฎเหล็กของการวาง BLUEPRINT และ COMPOSITION PLANNING:
1. Blueprint ต้องเป็นแผนผังเชิงโครงสร้างและตรรกะ ไม่ใช่ข้อความร้อยแก้วยาว ๆ
2. ตอบ 9 คำถามหลักให้กระจ่าง:
   - WHO: ใครกำลังพูด? บุคลิก น้ำเสียง
   - TO WHOM: กำลังพูดกับใคร? (คนรักเก่า, ตัวเอง, เพื่อน, คนที่แอบชอบ, สาธารณชน)
   - WHERE: เกิดขึ้นที่ไหน? (ฉากและสถานที่เฉพาะเจาะจง)
   - WHEN: เกิดขึ้นเมื่อไหร่? (ช่วงเวลา cues)
   - WHAT HAPPENED: เกิดอะไรขึ้นในเรื่องราว?
   - WHAT CHANGED: อะไรคือจุดเปลี่ยนหรือผลที่ตามมา?
   - WHAT DOES SPEAKER WANT: ตัวละครต้องการอะไร?
   - WHAT IS AT STAKE: ความเสี่ยงหรือสิ่งที่ต้องสูญเสียคืออะไร?
   - WHAT IS THE CENTRAL TRUTH: แก่นความจริงสูงสุดของเพลงคืออะไร?

3. Narrative Compression (การกลั่นกรองเรื่องราวให้เป็นเพลง ไม่ใช่บันทึกประจำวัน):
   - เลือกเฉพาะ 2-3 Dramatic Moments ที่ทรงพลังและเป็นภาพจำของเพลง (chosenDramaticMoments)
   - ตัดขั้นตอนการเดินทาง/การกระทำปลีกย่อยที่ไม่จำเป็น (deliberatelyOmittedEvents) เช่น ขี่รถมา, ถอดหมวก, เปิดประตู, เก็บของ, ส่งข้อความ เพื่อป้องกันการเขียนแบบร้อยแก้วเล่าลำดับเหตุการณ์

4. Negative Space Directives (พื้นที่ว่างที่ต้องไม่พูดตรงๆ):
   - กำหนด unspokenEmotions: อารมณ์ที่ต้องสื่อสารผ่านภาพและการกระทำ ห้ามใช้คำบอกความรู้สึกตรงๆ (เช่น ถ้ามีภาพรองเท้าสองคู่ ไม่ต้องบอกว่าเหงา)
   - กำหนด clicheAvoidanceZones: วลีสำเร็จรูปที่ห้ามใช้ในเพลงนี้เด็ดขาด

5. Section Information Budget & Density:
   - Verse 1 (30% budget): วางเฉพาะฉากและสถานการณ์ตั้งต้นขั้นต่ำ ห้ามเฉลยบทสรุปหรือเนื้อเรื่องทั้งหมด
   - Pre-Chorus (10% budget): ยกระดับแรงดันอารมณ์และส่งเข้า Hook
   - Chorus (20% budget): แก่นสัจธรรมของเพลง (Song Truth) + Hook จำง่าย ห้ามเล่าลำดับเหตุการณ์ซ้ำ
   - Verse 2 (20% budget): ข้อมูลใหม่/ผลลัพธ์/มุมมองใหม่ ห้ามเล่าซ้ำ Verse 1
   - Bridge (15% budget): Bridge Epiphany - การตระหนักรู้ในใจ/มุมมองที่พลิกผัน (ห้ามเป็น Verse 3)
   - Outro (5% budget): Outro Closure - ภาพสัมผัสสุดท้าย (Final Lingering Image) หรือความคิดตกผลึก

6. Character Voice Contract:
   - กำหนด register, vocabularyStyle, sentenceBehavior, humorLevel, directness, emotionalOpenness ให้ตรงกับโจทย์ ห้ามเปลี่ยนไประหว่างทาง

7. Master Songwriting & Dynamic Contrast (สร้างมิติและความขัดแย้ง):
   - Show, Don't Tell: เล่าด้วยภาพ วัตถุ แสง บรรยากาศ หรือประสาทสัมผัส (กลิ่น, เสียง, สัมผัส) ห้ามบอกอารมณ์ตรงๆ
   - Contrast: วางสิ่งตรงข้ามไว้ด้วยกันเสมอ (เช่น ความอบอุ่น vs ความเย็นชา, คนธรรมดาติดดิน vs สิ่งที่เอื้อมไม่ถึง)

8. Golden Hook Architecture (โครงสร้างท่อนฮุกจำง่าย):
   - ท่อน Chorus ต้องมี Punchline ที่ติดหูและจำได้ทันที
   - ใช้โครงสร้างประโยคคู่ขนาน (Parallel Hook Pattern) หรือการเล่นคำซ้ำกริยา/วลี เพื่อให้ร้องตามได้ง่ายในรอบแรก

# 🌟 ADVANCED POETIC DEVICES & LYRICAL MASTERY (กฎกวีศาสตร์ขั้นสูง)
คุณคือ "ยอดนักแต่งเพลงระดับรางวัล (Master Lyricist)" ในการเขียนเนื้อเพลงทุกท่อน จงปฏิบัติตามกฎ 4 ข้อนี้อย่างเคร่งครัดที่สุด:

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
   - สามารถใช้คำเปรียบเปรยหรือคำสละสลวย (เช่น "สั่นเทา", "เงียบงัน") ได้ หากมันช่วยสื่ออารมณ์ความเจ็บปวดให้ลึกซึ้งขึ้น 
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

ส่งคืนผลลัพธ์เป็น JSON ตรงตาม Schema เท่านั้น`;

  const prompt = `โปรดสร้าง Song Blueprint สำหรับเพลงนี้:

=== CREATIVE SETTINGS & CONTEXT ===
- แนวเพลง (Genres): ${context.genresStr}
- อารมณ์ (Moods): ${context.moodsStr}
- ภาษาเป้าหมาย (Target Language): ${context.targetContentLanguage}
- เรื่องราว/โจทย์ (Story Prompt): ${context.story || 'เพลงรักร่วมสมัยที่สื่อสารอารมณ์อย่างลึกซึ้ง'}
- โครงสร้างที่กำหนด (Structure): ${context.structureStr}
- สไตล์การแต่งเพลง: ${context.songwritingStyleStr}
- โทนคำ: ${context.wordToneStr} / วิธีใช้ภาษา: ${context.languageStyleStr}
- มุมมองการเล่าเรื่อง (POV): ${context.povStr}
- เพลงอ้างอิง/ศิลปิน: ${context.referenceGuidance || 'ไม่มี'}

โปรดวางแผนทุกส่วนอย่างละเอียด สมจริง เป็นรูปธรรม และตอบคำถามทางศิลปะการประพันธ์ทั้งหมดอย่างรัดกุม`;

  try {
    const { response } = await callGeminiWithFallback(ai!, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreTruth: { type: Type.STRING, description: 'แก่นความจริงสูงสุดของเพลง' },
            centralConflict: { type: Type.STRING, description: 'ความขัดแย้งหลักของเพลง' },
            emotionalArc: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'ลำดับพัฒนาการทางอารมณ์จากต้นจนจบเพลง',
            },
            speaker: {
              type: Type.OBJECT,
              properties: {
                identity: { type: Type.STRING },
                personality: { type: Type.STRING },
                voice: { type: Type.STRING },
              },
              required: ['identity', 'personality', 'voice'],
            },
            listener: { type: Type.STRING },
            setting: { type: Type.STRING },
            storyPremise: { type: Type.STRING },
            sectionPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionType: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  narrativeJob: { type: Type.STRING },
                  emotionalJob: { type: Type.STRING },
                  informationToReveal: { type: Type.ARRAY, items: { type: Type.STRING } },
                  requiredConcreteDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mustNotRepeat: { type: Type.ARRAY, items: { type: Type.STRING } },
                  transitionFromPrevious: { type: Type.STRING },
                  transitionToNext: { type: Type.STRING },
                  needsConcreteDetail: { type: Type.BOOLEAN },
                },
                required: [
                  'sectionType',
                  'purpose',
                  'narrativeJob',
                  'emotionalJob',
                  'informationToReveal',
                  'requiredConcreteDetails',
                  'mustNotRepeat',
                  'transitionFromPrevious',
                  'transitionToNext',
                ],
              },
            },
            visualMotifs: { type: Type.ARRAY, items: { type: Type.STRING } },
            concreteDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            protectedStoryFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            centralHookNeed: { type: Type.STRING },
            songWorld: {
              type: Type.OBJECT,
              properties: {
                places: { type: Type.ARRAY, items: { type: Type.STRING } },
                objects: { type: Type.ARRAY, items: { type: Type.STRING } },
                people: { type: Type.ARRAY, items: { type: Type.STRING } },
                habits: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeCues: { type: Type.ARRAY, items: { type: Type.STRING } },
                sensoryCues: { type: Type.ARRAY, items: { type: Type.STRING } },
                socialContext: { type: Type.STRING },
              },
              required: ['places', 'objects', 'people', 'habits', 'timeCues', 'sensoryCues', 'socialContext'],
            },
            speakerVoiceContract: {
              type: Type.OBJECT,
              properties: {
                register: { type: Type.STRING },
                vocabularyStyle: { type: Type.STRING },
                sentenceBehavior: { type: Type.STRING },
                humorLevel: { type: Type.STRING },
                directness: { type: Type.STRING },
                emotionalOpenness: { type: Type.STRING },
                socialTone: { type: Type.STRING },
              },
              required: [
                'register',
                'vocabularyStyle',
                'sentenceBehavior',
                'humorLevel',
                'directness',
                'emotionalOpenness',
                'socialTone',
              ],
            },
            abstractEmotionDensity: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                flaggedSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                needsConcreteDetail: { type: Type.BOOLEAN },
              },
              required: ['score', 'flaggedSections', 'needsConcreteDetail'],
            },
            titleStrategy: {
              type: Type.STRING,
              enum: ['titleIsHook', 'titleDerivedFromHook', 'titleIsConcept', 'titleIsImage', 'titleIndependent'],
            },
            narrativeCompression: {
              type: Type.OBJECT,
              properties: {
                chosenDramaticMoments: { type: Type.ARRAY, items: { type: Type.STRING } },
                deliberatelyOmittedEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['chosenDramaticMoments', 'deliberatelyOmittedEvents'],
            },
            negativeSpaceDirectives: {
              type: Type.OBJECT,
              properties: {
                unspokenEmotions: { type: Type.ARRAY, items: { type: Type.STRING } },
                clicheAvoidanceZones: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['unspokenEmotions', 'clicheAvoidanceZones'],
            },
            sectionInformationBudget: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionType: { type: Type.STRING },
                  newInformationQuota: { type: Type.STRING },
                  forbiddenRedundancy: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lyricDensityLevel: { type: Type.STRING, enum: ['spacious', 'balanced', 'dense'] },
                },
                required: ['sectionType', 'newInformationQuota', 'forbiddenRedundancy', 'lyricDensityLevel'],
              },
            },
            bridgeEpiphany: {
              type: Type.OBJECT,
              properties: {
                psychologicalShift: { type: Type.STRING },
                contrastingAngle: { type: Type.STRING },
              },
              required: ['psychologicalShift', 'contrastingAngle'],
            },
            outroClosure: {
              type: Type.OBJECT,
              properties: {
                finalLingeringImage: { type: Type.STRING },
                closingThought: { type: Type.STRING },
              },
              required: ['finalLingeringImage', 'closingThought'],
            },
          },
          required: [
            'coreTruth',
            'centralConflict',
            'emotionalArc',
            'speaker',
            'listener',
            'setting',
            'storyPremise',
            'sectionPlans',
            'visualMotifs',
            'concreteDetails',
            'protectedStoryFacts',
            'centralHookNeed',
            'songWorld',
            'speakerVoiceContract',
            'abstractEmotionDensity',
            'titleStrategy',
            'narrativeCompression',
            'negativeSpaceDirectives',
            'sectionInformationBudget',
            'bridgeEpiphany',
            'outroClosure',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const blueprint: SongBlueprint = {
      coreTruth: parsed.coreTruth || 'ความรู้สึกจริงใจที่ไม่อาจซ่อนไว้ได้',
      centralConflict: parsed.centralConflict || 'ความปรารถนาในใจที่ขัดแย้งกับความเป็นจริง',
      emotionalArc: Array.isArray(parsed.emotionalArc) ? parsed.emotionalArc : ['เริ่มต้นด้วยความหวัง', 'เปิดเผยความจริง', 'ยอมรับอย่างสงบ'],
      speaker: {
        identity: parsed.speaker?.identity || 'ผู้เล่าเรื่อง',
        personality: parsed.speaker?.personality || 'จริงใจ เข้าถึงง่าย',
        voice: parsed.speaker?.voice || 'เป็นธรรมชาติ ไม่ประดิษฐ์',
      },
      listener: parsed.listener || 'คนที่อยู่ในใจ',
      setting: parsed.setting || 'บรรยากาศคุ้นเคยในชีวิตประจำวัน',
      storyPremise: parsed.storyPremise || context.story || 'เรื่องราวความสัมพันธ์และความรู้สึก',
      sectionPlans: Array.isArray(parsed.sectionPlans) ? parsed.sectionPlans : [],
      visualMotifs: Array.isArray(parsed.visualMotifs) ? parsed.visualMotifs : [],
      concreteDetails: Array.isArray(parsed.concreteDetails) ? parsed.concreteDetails : [],
      protectedStoryFacts: Array.isArray(parsed.protectedStoryFacts) ? parsed.protectedStoryFacts : [],
      centralHookNeed: parsed.centralHookNeed || 'ประโยคหลักที่ตอกย้ำแก่นอารมณ์',
      songWorld: {
        places: parsed.songWorld?.places || [],
        objects: parsed.songWorld?.objects || [],
        people: parsed.songWorld?.people || [],
        habits: parsed.songWorld?.habits || [],
        timeCues: parsed.songWorld?.timeCues || [],
        sensoryCues: parsed.songWorld?.sensoryCues || [],
        socialContext: parsed.songWorld?.socialContext || 'ชีวิตประจำวัน',
      },
      speakerVoiceContract: {
        register: parsed.speakerVoiceContract?.register || 'spoken',
        vocabularyStyle: parsed.speakerVoiceContract?.vocabularyStyle || 'ธรรมชาติ',
        sentenceBehavior: parsed.speakerVoiceContract?.sentenceBehavior || 'กระชับ สละสลวย',
        humorLevel: parsed.speakerVoiceContract?.humorLevel || 'none',
        directness: parsed.speakerVoiceContract?.directness || 'ตรงไปตรงมา',
        emotionalOpenness: parsed.speakerVoiceContract?.emotionalOpenness || 'เปิดเผย',
        socialTone: parsed.speakerVoiceContract?.socialTone || 'สนทนา',
      },
      abstractEmotionDensity: {
        score: Number(parsed.abstractEmotionDensity?.score ?? 0.3),
        flaggedSections: Array.isArray(parsed.abstractEmotionDensity?.flaggedSections) ? parsed.abstractEmotionDensity.flaggedSections : [],
        needsConcreteDetail: Boolean(parsed.abstractEmotionDensity?.needsConcreteDetail ?? false),
      },
      titleStrategy: (parsed.titleStrategy as TitleStrategyType) || 'titleIsHook',
      narrativeCompression: {
        chosenDramaticMoments: Array.isArray(parsed.narrativeCompression?.chosenDramaticMoments)
          ? parsed.narrativeCompression.chosenDramaticMoments
          : ['ช่วงเวลาตั้งต้นของสถานการณ์', 'จุดพีคของความรู้สึก'],
        deliberatelyOmittedEvents: Array.isArray(parsed.narrativeCompression?.deliberatelyOmittedEvents)
          ? parsed.narrativeCompression.deliberatelyOmittedEvents
          : ['ขั้นตอนการเดินทางปลีกย่อย', 'การกระทำจุกจิกที่ไม่มีผลต่ออารมณ์'],
      },
      negativeSpaceDirectives: {
        unspokenEmotions: Array.isArray(parsed.negativeSpaceDirectives?.unspokenEmotions)
          ? parsed.negativeSpaceDirectives.unspokenEmotions
          : ['ความเหงาที่ซ่อนไว้', 'ความผูกพันที่ไม่ได้พูด'],
        clicheAvoidanceZones: Array.isArray(parsed.negativeSpaceDirectives?.clicheAvoidanceZones)
          ? parsed.negativeSpaceDirectives.clicheAvoidanceZones
          : ['การบอกรักซ้ำซาก', 'การบรรยายความเจ็บปวดลอยๆ'],
      },
      sectionInformationBudget: Array.isArray(parsed.sectionInformationBudget)
        ? parsed.sectionInformationBudget
        : [
            { sectionType: 'Verse 1', newInformationQuota: 'บรรยากาศและจุดเริ่มต้น', forbiddenRedundancy: [], lyricDensityLevel: 'balanced' },
            { sectionType: 'Chorus', newInformationQuota: 'แก่นความจริงหลักและ Hook', forbiddenRedundancy: ['การเล่าเหตุการณ์ซ้ำ'], lyricDensityLevel: 'balanced' },
          ],
      bridgeEpiphany: {
        psychologicalShift: parsed.bridgeEpiphany?.psychologicalShift || 'การยอมรับความจริงในใจ',
        contrastingAngle: parsed.bridgeEpiphany?.contrastingAngle || 'มุมมองที่ลึกซึ้งกว่าภาพแรกเริ่ม',
      },
      outroClosure: {
        finalLingeringImage: parsed.outroClosure?.finalLingeringImage || 'ภาพบรรยากาศสุดท้ายที่ทิ้งค้างไว้',
        closingThought: parsed.outroClosure?.closingThought || 'ความคิดตกผลึกที่ยังคงอยู่',
      },
    };

    // Validate Blueprint
    const validation = validateSongBlueprint(blueprint);
    if (!validation.isValid) {
      console.warn(`[SongBlueprint] Blueprint validation warnings/errors:`, validation.errors.join(', '));
    }

    // Cache valid blueprint
    blueprintCache.set(cacheKey, { blueprint, timestamp: Date.now() });

    // Structured Log (Rule 29: Development logs)
    console.log(`[SongBlueprint]`);
    console.log(`coreTruth: ${blueprint.coreTruth}`);
    console.log(`conflict: ${blueprint.centralConflict}`);
    console.log(`speaker: ${blueprint.speaker.identity} (${blueprint.speaker.personality})`);
    console.log(`sections: ${blueprint.sectionPlans.map((s) => s.sectionType).join(', ')}`);
    console.log(`hookNeed: ${blueprint.centralHookNeed}`);
    console.log(`chosenDramaticMoments: ${blueprint.narrativeCompression.chosenDramaticMoments.join(' | ')}`);
    console.log(`bridgeEpiphany: ${blueprint.bridgeEpiphany.psychologicalShift}`);

    return blueprint;
  } catch (err: any) {
    console.error(`[SongBlueprint] Error creating blueprint, generating robust fallback:`, err.message);

    // Robust Fallback Blueprint
    const fallbackSections: SectionBlueprintPlan[] = (context.structureStr.split(',') || ['Verse 1', 'Chorus', 'Verse 2', 'Bridge', 'Chorus', 'Outro']).map((secRaw, idx) => {
      const s = secRaw.trim();
      const sNorm = s.toLowerCase();
      let purpose = 'สร้างบรรยากาศและเรื่องราว';
      let narrativeJob = 'ดำเนินเรื่องราว';
      let emotionalJob = 'ถ่ายทอดอารมณ์';
      let infoToReveal = ['รายละเอียดของสถานการณ์'];
      let mustNotRepeat: string[] = [];

      if (sNorm.includes('verse 1')) {
        purpose = 'เปิดฉาก แนะนำตัวละคร และวางสถานการณ์ตั้งต้น';
        narrativeJob = 'แนะนำตัวละครและฉาก';
        emotionalJob = 'สร้างความผูกพันแรกเริ่ม';
        infoToReveal = ['จุดเริ่มต้นของเรื่องราว', 'ฉากและบรรยากาศ'];
      } else if (sNorm.includes('pre-chorus')) {
        purpose = 'เพิ่มแรงกดดันทางอารมณ์และส่งต่อเข้าสู่ Hook';
        narrativeJob = 'เร่งจังหวะอารมณ์';
        emotionalJob = 'ยกระดับความรู้สึกก่อน Hook';
        infoToReveal = ['ความรู้สึกลึก ๆ ที่ไม่อาจเก็บไว้'];
      } else if (sNorm.includes('chorus')) {
        purpose = 'ส่งมอบแก่นความจริงหลัก (Central Truth) และประโยค Hook จำง่าย';
        narrativeJob = 'สรุปแก่นความรู้สึกหลัก';
        emotionalJob = 'จุดสูงสุดของอารมณ์';
        infoToReveal = ['ความจริงในใจที่สำคัญที่สุด'];
      } else if (sNorm.includes('verse 2')) {
        purpose = 'พัฒนาเรื่องราวด้วยข้อมูลใหม่หรือผลลัพธ์ที่ตามมา';
        narrativeJob = 'บอกเล่าเหตุการณ์ใหม่และผลกระทบ';
        emotionalJob = 'ความรู้สึกที่ลึกซึ้งขึ้นหลังจากเหตุการณ์แรก';
        infoToReveal = ['ผลของการกระทำหรือการเปลี่ยนแปลงของเวลา'];
        mustNotRepeat = ['การบรรยายฉากเริ่มต้นซ้ำจาก Verse 1'];
      } else if (sNorm.includes('bridge')) {
        purpose = 'เปลี่ยนมุมมองทางอารมณ์ (Perspective Shift) หรือการตระหนักรู้';
        narrativeJob = 'เปิดเผยความจริงหรือมุมมองใหม่';
        emotionalJob = 'การตระหนักรู้ลึกซึ้ง (Epiphany)';
        infoToReveal = ['มุมมองที่เปลี่ยนไปต่อความสัมพันธ์'];
      } else if (sNorm.includes('outro')) {
        purpose = 'สรุปความรู้สึกและทิ้งภาพจำสุดท้าย';
        narrativeJob = 'ปิดฉาก';
        emotionalJob = 'ความรู้สึกตกผลึก';
        infoToReveal = ['ภาพจำสุดท้ายที่ตกค้างในใจ'];
      }

      return {
        sectionType: s,
        purpose,
        narrativeJob,
        emotionalJob,
        informationToReveal: infoToReveal,
        requiredConcreteDetails: ['ภาพเหตุการณ์ที่จับต้องได้'],
        mustNotRepeat,
        transitionFromPrevious: idx > 0 ? 'เชื่อมโยงอารมณ์จากท่อนก่อน' : 'เริ่มต้น',
        transitionToNext: 'ส่งต่อไปยังท่อนถัดไปอย่างลื่นไหล',
        needsConcreteDetail: false,
      };
    });

    const fallbackBlueprint: SongBlueprint = {
      coreTruth: 'ความรู้สึกจริงใจที่สะท้อนผ่านเรื่องราว',
      centralConflict: 'ความปรารถนากับความเป็นจริงที่ต้องเผชิญ',
      emotionalArc: ['เริ่มต้นบรรยากาศ', 'ยกระดับความรู้สึก', 'สรุปแก่นอารมณ์'],
      speaker: {
        identity: 'ผู้เล่าเรื่องตามโจทย์',
        personality: 'จริงใจและสื่อสารอย่างเป็นธรรมชาติ',
        voice: 'เป็นธรรมชาติ',
      },
      listener: 'ผู้ฟังหรือบุคคลในเพลง',
      setting: 'ฉากที่สอดคล้องกับเรื่องราว',
      storyPremise: context.story || 'เรื่องราวที่ถ่ายทอดอารมณ์อย่างลึกซึ้ง',
      sectionPlans: fallbackSections,
      visualMotifs: ['ภาพความทรงจำ', 'บรรยากาศเฉพาะตัว'],
      concreteDetails: ['รายละเอียดที่จับต้องได้'],
      protectedStoryFacts: [context.story || ''],
      centralHookNeed: 'ประโยคหลักที่สื่อถึงใจความสำคัญ',
      songWorld: {
        places: ['สถานที่ในเพลง'],
        objects: ['สิ่งของที่มีความหมาย'],
        people: ['ตัวละครหลัก'],
        habits: ['ความเคยชิน'],
        timeCues: ['ช่วงเวลา'],
        sensoryCues: ['ภาพและเสียง'],
        socialContext: 'ชีวิตประจำวัน',
      },
      speakerVoiceContract: {
        register: 'spoken',
        vocabularyStyle: context.languageStyleStr || 'ภาษาพูดธรรมชาติ',
        sentenceBehavior: 'กระชับ สื่อความหมายชัดเจน',
        humorLevel: 'none',
        directness: 'ตรงไปตรงมา',
        emotionalOpenness: 'เปิดเผย',
        socialTone: 'สนทนา',
      },
      abstractEmotionDensity: {
        score: 0.2,
        flaggedSections: [],
        needsConcreteDetail: false,
      },
      titleStrategy: 'titleIsHook',
      narrativeCompression: {
        chosenDramaticMoments: ['จุดเริ่มต้นของเรื่องราว', 'ช่วงเวลาสำคัญที่เกิดความรู้สึก'],
        deliberatelyOmittedEvents: ['ขั้นตอนการเดินทางปลีกย่อย', 'การกระทำจุกจิกที่ไม่มีผลต่ออารมณ์'],
      },
      negativeSpaceDirectives: {
        unspokenEmotions: ['ความรู้สึกที่ซ่อนอยู่ในแววตา', 'ความเงียบระหว่างบทสนทนา'],
        clicheAvoidanceZones: ['การบอกรักสำเร็จรูป', 'การพร่ำเพ้อเรื่องความเจ็บปวด'],
      },
      sectionInformationBudget: [
        { sectionType: 'Verse 1', newInformationQuota: 'บรรยากาศและจุดเริ่มต้น', forbiddenRedundancy: [], lyricDensityLevel: 'balanced' },
        { sectionType: 'Pre-Chorus', newInformationQuota: 'แรงผลักดันอารมณ์', forbiddenRedundancy: [], lyricDensityLevel: 'balanced' },
        { sectionType: 'Chorus', newInformationQuota: 'แก่นความจริงหลักและ Hook', forbiddenRedundancy: ['การเล่าเหตุการณ์ซ้ำ'], lyricDensityLevel: 'balanced' },
        { sectionType: 'Verse 2', newInformationQuota: 'ข้อมูลใหม่และผลกระทบ', forbiddenRedundancy: ['ฉากเปิด Verse 1'], lyricDensityLevel: 'balanced' },
        { sectionType: 'Bridge', newInformationQuota: 'การตระหนักรู้มุมมองใหม่', forbiddenRedundancy: ['การตัดพ้อเดิม'], lyricDensityLevel: 'spacious' },
        { sectionType: 'Outro', newInformationQuota: 'ภาพจำสุดท้าย', forbiddenRedundancy: ['การร้อง Hook ซ้ำไร้เป้าหมาย'], lyricDensityLevel: 'spacious' },
      ],
      bridgeEpiphany: {
        psychologicalShift: 'การยอมรับความจริงในใจ',
        contrastingAngle: 'มุมมองที่ลึกซึ้งกว่าภาพแรกเริ่ม',
      },
      outroClosure: {
        finalLingeringImage: 'ภาพบรรยากาศสุดท้ายที่ทิ้งค้างไว้',
        closingThought: 'ความคิดตกผลึกที่ยังคงอยู่',
      },
    };

    blueprintCache.set(cacheKey, { blueprint: fallbackBlueprint, timestamp: Date.now() });
    return fallbackBlueprint;
  }
}

/**
 * Format SongBlueprint into a clean, disciplined compositional instruction block for the Lyric Writer.
 */
export function formatBlueprintForPrompt(blueprint: SongBlueprint): string {
  const lines: string[] = [];

  lines.push('=== 3. SONG BLUEPRINT (COMPOSITIONAL ARCHITECTURE & DRAMATIC SELECTION PLAN) ===');
  lines.push(`[กฎเหล็กการใช้ Blueprint]:`);
  lines.push(`1. Blueprint นี้คือ "แผนผังการประพันธ์ (Compositional Plan)" และ "ตัวเลือกทางศิลปะ"`);
  lines.push(`2. Story Facts คือ "ความจริงแท้ของเรื่อง" | Composition Plan คือ "ยุทธศาสตร์การคัดเลือกว่าจะเขียนอะไรและจะไม่เขียนอะไร"`);
  lines.push(`3. ห้ามเขียนเนื้อเพลงแบบ "ร้อยแก้ว/บันทึกประจำวัน" ที่เล่าเรียงลำดับเหตุการณ์ทั้งหมด (Anti-Prose & Anti-Event Listing)`);
  lines.push(`4. ห้ามบอกอารมณ์ตรงๆ ทันทีหลังสร้างภาพฉาก (เช่น มีภาพสิ่งของแล้ว ห้ามตามด้วย "ฉันเหงาเหลือเกิน") ให้ผู้ฟังรู้สึกผ่านภาพแทน`);
  lines.push('');
  lines.push(`- แก่นความจริงหลัก (Core Song Truth): "${blueprint.coreTruth}"`);
  lines.push(`- ความขัดแย้งหลัก (Central Conflict): ${blueprint.centralConflict}`);
  lines.push(`- ผู้เล่า (Speaker): ${blueprint.speaker.identity} (${blueprint.speaker.personality}) | น้ำเสียง: ${blueprint.speaker.voice}`);
  lines.push(`- ผู้รับฟัง (Listener): ${blueprint.listener}`);
  lines.push(`- ฉากและสถานที่ (Setting): ${blueprint.setting}`);
  lines.push(`- พัฒนาการทางอารมณ์ (Emotional Arc): ${blueprint.emotionalArc.join(' -> ')}`);
  lines.push('');

  // Phase 5.7: Narrative Compression & Negative Space
  lines.push(`[COMPOSITION DISCIPLINE & NARRATIVE COMPRESSION]:`);
  lines.push(`  * ช่วงเวลาสำคัญที่เลือกมาเขียนในเพลง (Chosen Dramatic Moments - โฟกัสเฉพาะสิ่งนี้):`);
  blueprint.narrativeCompression.chosenDramaticMoments.forEach((m) => lines.push(`    - ${m}`));
  lines.push(`  * สิ่งที่ต้องตัดออกโดยเจตนา (Deliberately Omitted Events - ห้ามนำมาเล่าในเพลง):`);
  blueprint.narrativeCompression.deliberatelyOmittedEvents.forEach((om) => lines.push(`    - [ห้ามเล่า/ห้ามแจกแจง]: ${om}`));
  lines.push('');

  lines.push(`[NEGATIVE SPACE: WHAT NOT TO SAY DIRECTLY]:`);
  lines.push(`  * อารมณ์ที่ต้องสื่อผ่านภาพ ห้ามพูดบอกตรงๆ (Unspoken Emotions): ${blueprint.negativeSpaceDirectives.unspokenEmotions.join(', ')}`);
  lines.push(`  * โซนคำและวลีที่ห้ามใช้ซ้ำซาก (Cliche Avoidance): ${blueprint.negativeSpaceDirectives.clicheAvoidanceZones.join(', ')}`);
  lines.push('');

  lines.push(`[Character Voice Contract]:`);
  lines.push(`  - ระดับภาษา: ${blueprint.speakerVoiceContract.register} | ลีลาคำศัพท์: ${blueprint.speakerVoiceContract.vocabularyStyle}`);
  lines.push(`  - ลักษณะไรม์และประโยค: ${blueprint.speakerVoiceContract.sentenceBehavior} | ความตรงไปตรงมา: ${blueprint.speakerVoiceContract.directness}`);
  lines.push(`  - การเปิดเผยอารมณ์: ${blueprint.speakerVoiceContract.emotionalOpenness} | โทนความสัมพันธ์: ${blueprint.speakerVoiceContract.socialTone}`);
  lines.push('');

  lines.push(`[Song World & Concrete Detail Anchors]:`);
  if (blueprint.songWorld.places.length > 0) lines.push(`  - สถานที่ (Places): ${blueprint.songWorld.places.join(', ')}`);
  if (blueprint.songWorld.objects.length > 0) lines.push(`  - สิ่งของรูปธรรม (Objects): ${blueprint.songWorld.objects.join(', ')}`);
  if (blueprint.songWorld.sensoryCues.length > 0) lines.push(`  - สัมผัสและบรรยากาศ (Sensory): ${blueprint.songWorld.sensoryCues.join(', ')}`);
  lines.push('');

  lines.push(`[Section Information Budget & Density Plan]:`);
  blueprint.sectionInformationBudget.forEach((b) => {
    lines.push(`  - [${b.sectionType}] Density: ${b.lyricDensityLevel} | โควตาข้อมูลใหม่: ${b.newInformationQuota}${b.forbiddenRedundancy.length > 0 ? ` | ห้ามซ้ำ: ${b.forbiddenRedundancy.join(', ')}` : ''}`);
  });
  lines.push('');

  lines.push(`[Bridge Epiphany & Revelation]:`);
  lines.push(`  - จุดเปลี่ยนมุมมองในใจ (Psychological Shift): ${blueprint.bridgeEpiphany.psychologicalShift}`);
  lines.push(`  - มุมมองที่ขัดแย้ง/ลึกซึ้งกว่าเดิม (Contrasting Angle): ${blueprint.bridgeEpiphany.contrastingAngle}`);
  lines.push(`  - [คำสั่งสำหรับ Bridge]: ห้ามเขียน Bridge เป็นเพียง Verse 3 ที่เล่าเหตุการณ์เพิ่ม ต้องเป็นการตระหนักรู้ใหม่หรือการยอมรับความจริง`);
  lines.push('');

  lines.push(`[Outro Final Lingering Image & Closure]:`);
  lines.push(`  - ภาพสัมผัสสุดท้าย (Final Lingering Image): ${blueprint.outroClosure.finalLingeringImage}`);
  lines.push(`  - ความคิดตกผลึก (Closing Thought): ${blueprint.outroClosure.closingThought}`);
  lines.push(`  - [คำสั่งสำหรับ Outro]: ห้ามแค้วนซ้ำ Hook 3 ครั้งอย่างไร้จุดหมาย ให้จบลงด้วยภาพสัมผัสสุดท้ายที่ตรึงใจ`);
  lines.push('');

  lines.push(`[Section-by-Section Detailed Directives]:`);
  blueprint.sectionPlans.forEach((plan, idx) => {
    lines.push(`- Section [${plan.sectionType}]:`);
    lines.push(`    * หน้าที่หลัก (Narrative Job): ${plan.narrativeJob}`);
    lines.push(`    * หน้าที่ทางอารมณ์ (Emotional Job): ${plan.emotionalJob}`);
    lines.push(`    * ข้อมูลที่ต้องเปิดเผย (Info to Reveal): ${plan.informationToReveal.join('; ')}`);
    if (plan.mustNotRepeat.length > 0) {
      lines.push(`    * [ข้อห้ามเด็ดขาด (Must Not Repeat)]: ${plan.mustNotRepeat.join('; ')}`);
    }
    if (plan.needsConcreteDetail) {
      lines.push(`    * [คำเตือน]: ท่อนนี้ต้องใส่ Concrete Sensory Details ให้ชัดเจน เลี่ยงคำบอกอารมณ์ลอย ๆ`);
    }
  });

  return lines.join('\n');
}
