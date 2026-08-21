import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import { generateDynamicLexiconPalette } from '../lexicon/lexiconEngine';
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

// วางต่อจากบรรทัดที่ 27 ใน server/songwriting/blueprint.ts

/**
 * 🌟 Universal Dynamic Genre Persona
 * ปรับบทบาทครูเพลงตามทุกแนวดนตรีบนโลกโดยอัตโนมัติ
 */
function resolveGenrePersonaDoctrine(genresStr: string = '', moodsStr: string = ''): string {
  const targetGenre = genresStr.trim() || 'ดนตรีร่วมสมัยสากล';
  const targetMood = moodsStr.trim() || 'สะท้อนอารมณ์ลึกซึ้ง';

  return `[UNIVERSAL MASTER SONGWRITER PERSONA]
- บทบาทของคุณ: คุณคือ "บรมครูและโปรดิวเซอร์นักแต่งเพลงระดับตำนาน" ผู้เชี่ยวชาญศาสตร์แห่งแนวดนตรี "${targetGenre}" โดยเฉพาะ
- อารมณ์เพลงหลัก: ${targetMood}

กฎการปรับสำนวนตามแนวดนตรีอัตโนมัติ (Genre-Adaptive Mastery):
1. [ขนบและจริตเฉพาะของแนวเพลง]: ปรับวิถีการใช้คำ กรูฟจังหวะ และฉันทลักษณ์ให้เข้ากับจิตวิญญาณดั้งเดิมของแนว "${targetGenre}" อย่างแท้จริง
2. [Natural Vocal Phrasing]: ออกแบบวรรคคำให้สอดรับกับเครื่องดนตรีและจังหวะตก (Downbeat/Groove) ของแนวนี้โดยธรรมชาติ
3. [Authentic Imagery]: เลือกใช้ภาพจำ บรรยากาศ และสัจธรรมความรู้สึกที่ผู้ฟังแนวดนตรีนี้เชื่อมโยงถึงได้ทันที
4. [Anti-Cliche & Anti-Jargon]: หลีกเลี่ยงศัพท์วิชาการ/ภาษาทางการ และห้ามยัดเยียดอุปกรณ์สิ่งของหากไม่เข้ากับบริบทของเรื่อง`;
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

  // 🌟 เรียกใช้ตรงนี้
  const genrePersonaDoctrine = resolveGenrePersonaDoctrine(context.genresStr, context.moodsStr);

  const systemInstruction = `คุณคือ "Executive Master Songwriter & Lyrical Architect"
หน้าที่ของคุณคือสร้าง "SONG BLUEPRINT" (แผนผังการประพันธ์เพลง) โดยสวมบทบาทตามแนวดนตรีที่ระบุอย่างสมบูรณ์แบบ:

${genrePersonaDoctrine}

=======================================================
หลักการออกแบบพิมพ์เขียวเพลง (Compositional Architecture)
=======================================================
1. 9 มิติของเรื่องราว:
   - ผู้เล่า (WHO), ผู้ฟัง (TO WHOM), บรรยากาศ/สถานที่ (WHERE/WHEN)
   - ปมความขัดแย้ง (CONFLICT) และ แก่นความจริงสูงสุด (CORE TRUTH)

2. ยุทธศาสตร์พัฒนาการของเพลง (Scene & Emotion Progression):
   - Verse 1: ปูอารมณ์ จุดเกิดเหตุ หรือสถานการณ์ตั้งต้น
   - Pre-Chorus / Build-up: ยกระดับแรงดันอารมณ์ หรือเร่งจังหวะส่งเข้าฮุก
   - Chorus / Drop: แก่นสัจธรรมของเพลง + ประโยคจดจำ (Golden Punchline)
   - Verse 2: บังคับเปลี่ยนมุมมอง เล่าผลกระทบ ความทรงจำ หรือก้าวต่อไป (ห้ามใช้ภาพและฉากซ้ำจาก Verse 1)
   - Bridge: จุดตระหนักรู้ การยอมรับความจริง หรือการระเบิดอารมณ์
   - Outro: ภาพจำสุดท้ายที่ตกผลึกในใจผู้ฟัง

3. กฎเหล็กของภาษาและการเลือกภาพ:
   - ใช้ภาษาเพลงที่มนุษย์สื่อสารจริงตามจริตของแนวดนตรีนั้นๆ
   - ห้ามใช้ศัพท์วิชาการ/บทความ (เช่น กำแพงชนชั้น, ปัจจัย, มิติ)
   - ห้ามยัดเยียดอุปกรณ์เฉพาะทางหรือเครื่องมือช่างลงในช่อง dramatic moments, speaker หรือ epiphany
   - เน้นภาพจำเชิงอารมณ์ สภาพแวดล้อม และพฤติกรรมมนุษย์

ส่งคืนผลลัพธ์เป็น JSON ตรงตาม Schema เท่านั้น`;

  const prompt = `โปรดสร้าง Song Blueprint สำหรับเพลงนี้:

=== CREATIVE SETTINGS & CONTEXT ===
- แนวดนตรีหลัก (Genres): ${context.genresStr}
- อารมณ์เพลง (Moods): ${context.moodsStr}
- ภาษาเป้าหมาย (Language): ${context.targetContentLanguage}
- เรื่องราว/โจทย์ (Story Prompt): ${context.story || 'เพลงที่ถ่ายทอดอารมณ์อย่างลึกซึ้ง'}
- โครงสร้างท่อน (Structure): ${context.structureStr}
- สไตล์การประพันธ์: ${context.songwritingStyleStr}
- เพลงอ้างอิง/แนวทาง: ${context.referenceGuidance || 'ไม่มี'}

${generateDynamicLexiconPalette(context.story || '', context.targetContentLanguage || 'th')}

--- 🎯 DIRECTIVE CONSTRAINTS ---
1. วางแผนให้ตรงกับจิตวิญญาณของแนวดนตรี [${context.genresStr}] อย่างแท้จริง
2. Chorus ต้องสั้น กระชับ คมคาย และเป็นแก่นหลักของเพลง
3. วาง dramatic moments และ bridge epiphany ให้เป็นภาพอารมณ์ ไม่ใช่การแจกแจงอุปกรณ์สิ่งของ

โปรดวางแผนทุกส่วนอย่างละเอียด สมจริง และพร้อมสำหรับการประพันธ์คำร้อง`;

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
            { sectionType: 'Chorus', newInformationQuota: 'แก่นความจริงหลักและ Hook', forbiddenRedundancy: ['การเล่าเหตุการณ์ซ้ำ', 'การยัดเยียดคำศัพท์เครื่องมือช่าง/อุปกรณ์เฉพาะทางหลายคำติดกันโดยไม่มีหน้าที่ทางอารมณ์'], lyricDensityLevel: 'balanced' },
            { sectionType: 'Verse 2', newInformationQuota: 'ข้อมูลใหม่และผลกระทบ', forbiddenRedundancy: ['ฉากเปิด Verse 1', 'อุปกรณ์และสิ่งของที่ใช้ไปแล้วใน Verse 1'], lyricDensityLevel: 'balanced' },
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

    // Cache valid blueprint
    blueprintCache.set(cacheKey, { blueprint, timestamp: Date.now() });

    console.log(`[SongBlueprint] Generated successfully for genre: ${context.genresStr}`);
    console.log(`coreTruth: ${blueprint.coreTruth}`);
    console.log(`hookNeed: ${blueprint.centralHookNeed}`);

    return blueprint;
  } catch (err: any) {
    console.error(`[SongBlueprint] Error creating blueprint:`, err.message);
    throw err;
  }
}

/**
 * Format SongBlueprint into a clean instruction block for the Lyric Writer.
 */
export function formatBlueprintForPrompt(blueprint: SongBlueprint): string {
  const lines: string[] = [];

  lines.push('=== 3. SONG BLUEPRINT (COMPOSITIONAL ARCHITECTURE) ===');
  lines.push(`- แก่นความจริงหลัก (Core Truth): "${blueprint.coreTruth}"`);
  lines.push(`- ความขัดแย้งหลัก (Conflict): ${blueprint.centralConflict}`);
  lines.push(`- ผู้เล่า (Speaker): ${blueprint.speaker.identity} (${blueprint.speaker.personality}) | น้ำเสียง: ${blueprint.speaker.voice}`);
  lines.push(`- ผู้รับฟัง (Listener): ${blueprint.listener}`);
  lines.push(`- ฉาก/บรรยากาศ (Setting): ${blueprint.setting}`);
  lines.push(`- พัฒนาการทางอารมณ์: ${blueprint.emotionalArc.join(' -> ')}`);
  lines.push('');

  lines.push(`[COMPOSITION DISCIPLINE & DRAMATIC MOMENTS]:`);
  blueprint.narrativeCompression.chosenDramaticMoments.forEach((m) => lines.push(`  - [โฟกัสฉากนี้]: ${m}`));
  blueprint.narrativeCompression.deliberatelyOmittedEvents.forEach((om) => lines.push(`  - [ห้ามเล่า/ห้ามแจกแจง]: ${om}`));
  lines.push('');

  lines.push(`[Character Voice Contract]:`);
  lines.push(`  - ระดับภาษา: ${blueprint.speakerVoiceContract.register} | ลีลาคำศัพท์: ${blueprint.speakerVoiceContract.vocabularyStyle}`);
  lines.push(`  - การเปิดเผยอารมณ์: ${blueprint.speakerVoiceContract.emotionalOpenness} | โทน: ${blueprint.speakerVoiceContract.socialTone}`);
  lines.push('');

  lines.push(`[Section-by-Section Plan]:`);
  blueprint.sectionPlans.forEach((plan) => {
    lines.push(`- Section [${plan.sectionType}]: ${plan.narrativeJob} | ${plan.emotionalJob}`);
    if (plan.mustNotRepeat.length > 0) {
      lines.push(`    * [ห้ามซ้ำ]: ${plan.mustNotRepeat.join('; ')}`);
    }
  });

  return lines.join('\n');
}