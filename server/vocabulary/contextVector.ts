import { SongConfig } from '../../src/types/songwriting';
import { LexicalContextVector, LexicalRegister } from './types';

/**
 * Common concrete Thai scene and physical entity anchors
 */
const KNOWN_SCENE_ANCHORS = [
  // Countryside / Folk / Nature
  'ทุ่งนา', 'คันไถนา', 'กลิ่นฟาง', 'ฟางข้าว', 'กองฟาง', 'ฟาง', 'ควันไฟ', 'เตาฟืน', 'เตาถ่าน',
  'นกเอี้ยง', 'นกเขา', 'ต้นตาล', 'เถียงนา', 'กระท่อม', 'ควาย', 'วัว', 'โคลน', 'กลิ่นโคลน',
  'รวงข้าว', 'เกี่ยวข้าว', 'สายลม', 'ลมหนาว', 'ลมเย็น', 'แดดบ่าย', 'แดดร่ม', 'พลบค่ำ',
  'ยามเย็น', 'ตอนเย็น', 'ค่ำลง', 'แม่น้ำ', 'ลำธาร', 'ต้นไม้', 'ใบไม้', 'ดอกหญ้า', 'บ้านนอก',
  'ชนบท', 'บ้านนา', 'กลิ่นดิน', 'หยาดเหงื่อ', 'หยดเหงื่อ', 'ตะวัน', 'ดอกไม้', 'กลิ่นฝน',

  // Urban / Modern / Transit
  'คอนโด', 'ตึกสูง', 'ถนน', 'ไฟท้าย', 'รถติด', 'ป้ายรถเมล์', 'รถไฟฟ้า', 'บีทีเอส', 'สถานี',
  'ทางข้าม', 'ไฟแดง', 'สี่แยก', 'แก้วกาแฟ', 'คาเฟ่', 'ห้องสี่เหลี่ยม', 'หน้าต่าง', 'ระเบียง',
  'ฝนตก', 'ดึกสงัด', 'เที่ยงคืน', 'หูฟัง', 'มือถือ', 'หน้าจอ', 'แสงไฟ', 'เมืองหลวง', 'กรุงเทพ',
  'แสงสี', 'ห้องนอน', 'ร้านกาแฟ',

  // Intimate / Memory / Relics
  'รูปถ่าย', 'จดหมาย', 'ข้อความ', 'เสื้อตัวเก่า', 'กลิ่นหอม', 'สัมผัส', 'สายตา', 'รอยยิ้ม',
  'เสียงหัวเราะ', 'น้ำตา', 'นาฬิกา', 'เวลา', 'ปฏิทิน', 'วันวาน', 'คืนนั้น', 'ที่เดิม',
  'โต๊ะตัวเดิม', 'มุมเดิม', 'คำสัญญา', 'แววตา', 'ไออุ่น'
];

/**
 * Sensory cue trigger terms
 */
const KNOWN_SENSORY_CUES = [
  'กลิ่น', 'เสียง', 'ไออุ่น', 'หนาว', 'ร้อน', 'เย็น', 'อบอุ่น', 'ควัน', 'ฝน', 'แดด',
  'สายลม', 'ลมพัด', 'กลิ่นฝน', 'กลิ่นฟาง', 'กลิ่นดิน', 'กลิ่นหอม', 'แสง', 'เงา', 'มืด',
  'สว่าง', 'เงียบ', 'ดัง', 'เสียงคลื่น', 'เสียงนก'
];

/**
 * Extracts story tokens for lexical matching
 */
export function extractStoryKeywords(storyText: string): string[] {
  if (!storyText) return [];
  const cleaned = storyText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'""'']/g, ' ')
    .toLowerCase();

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  return Array.from(new Set(tokens));
}

/**
 * Extracts concrete scene objects from blueprint, creative analysis, and story text
 */
export function extractSceneObjects(
  storyText: string,
  creativeAnalysis?: any,
  songWorld?: any,
  concreteDetails?: string[]
): string[] {
  const objectsSet = new Set<string>();

  // 1. Ingest from SongWorld if provided by Blueprint
  if (songWorld) {
    if (Array.isArray(songWorld.objects)) {
      songWorld.objects.forEach((obj: string) => { if (obj && typeof obj === 'string') objectsSet.add(obj.trim()); });
    }
    if (Array.isArray(songWorld.places)) {
      songWorld.places.forEach((p: string) => { if (p && typeof p === 'string') objectsSet.add(p.trim()); });
    }
  }

  // 2. Ingest from concreteDetails array
  if (Array.isArray(concreteDetails)) {
    concreteDetails.forEach((d: string) => { if (d && typeof d === 'string') objectsSet.add(d.trim()); });
  }

  // 3. Ingest from CreativeAnalysis imageryAnchors
  if (creativeAnalysis?.imageryAnchors && Array.isArray(creativeAnalysis.imageryAnchors)) {
    creativeAnalysis.imageryAnchors.forEach((a: string) => { if (a && typeof a === 'string') objectsSet.add(a.trim()); });
  }

  // 4. Extract known concrete anchors present in storyText
  if (storyText) {
    for (const anchor of KNOWN_SCENE_ANCHORS) {
      if (storyText.includes(anchor)) {
        objectsSet.add(anchor);
      }
    }
  }

  return Array.from(objectsSet);
}

/**
 * Extracts sensory signals from blueprint, creative analysis, and story text
 */
export function extractSensorySignals(
  storyText: string,
  creativeAnalysis?: any,
  songWorld?: any
): string[] {
  const sensorySet = new Set<string>();

  if (songWorld?.sensoryCues && Array.isArray(songWorld.sensoryCues)) {
    songWorld.sensoryCues.forEach((c: string) => { if (c && typeof c === 'string') sensorySet.add(c.trim()); });
  }
  if (songWorld?.timeCues && Array.isArray(songWorld.timeCues)) {
    songWorld.timeCues.forEach((t: string) => { if (t && typeof t === 'string') sensorySet.add(t.trim()); });
  }

  if (storyText) {
    for (const cue of KNOWN_SENSORY_CUES) {
      if (storyText.includes(cue)) {
        sensorySet.add(cue);
      }
    }
  }

  return Array.from(sensorySet);
}

/**
 * Extracts visual signals and motifs
 */
export function extractVisualSignals(
  storyText: string,
  creativeAnalysis?: any,
  visualMotifs?: string[]
): string[] {
  const visualSet = new Set<string>();

  if (Array.isArray(visualMotifs)) {
    visualMotifs.forEach((m: string) => { if (m && typeof m === 'string') visualSet.add(m.trim()); });
  }

  if (creativeAnalysis?.keyMotifs && Array.isArray(creativeAnalysis.keyMotifs)) {
    creativeAnalysis.keyMotifs.forEach((k: string) => { if (k && typeof k === 'string') visualSet.add(k.trim()); });
  }

  return Array.from(visualSet);
}

/**
 * Extracts narrative signals (core message, conflict, truth)
 */
export function extractNarrativeSignals(
  storyText: string,
  creativeAnalysis?: any,
  coreTruth?: string,
  centralConflict?: string
): string[] {
  const narrativeSet = new Set<string>();

  if (coreTruth) narrativeSet.add(coreTruth.trim());
  if (centralConflict) narrativeSet.add(centralConflict.trim());

  if (creativeAnalysis?.coreMessage) narrativeSet.add(creativeAnalysis.coreMessage.trim());
  if (creativeAnalysis?.primaryConflict) narrativeSet.add(creativeAnalysis.primaryConflict.trim());
  if (creativeAnalysis?.centralHookIdea) narrativeSet.add(creativeAnalysis.centralHookIdea.trim());

  return Array.from(narrativeSet);
}

/**
 * Builds section lexical intent mapping from blueprint or standard structure
 */
export function buildSectionLexicalIntent(
  sectionPlans?: any[],
  creativeAnalysis?: any
): Record<string, { purpose: string; sensoryFocus?: string[]; emotionalFocus?: string[] }> {
  const intentMap: Record<string, { purpose: string; sensoryFocus?: string[]; emotionalFocus?: string[] }> = {
    Verse: {
      purpose: 'ปูเรื่องราว สร้างภาพบรรยากาศและสิ่งรอบตัวที่เป็นรูปธรรม',
      sensoryFocus: ['ภาพสถานที่', 'สิ่งของ', 'สัมผัส', 'การกระทำ'],
      emotionalFocus: ['ความรู้สึกเริ่มต้น', 'ความจริงใจ'],
    },
    'Pre-Chorus': {
      purpose: 'ส่งอารมณ์ เพิ่มความตึงเครียดหรือความคาดหวัง นำเข้าสู่จุดไคลแมกซ์',
      sensoryFocus: ['ความเปลี่ยนแปลง', 'การเคลื่อนไหว'],
      emotionalFocus: ['ความหวั่นไหว', 'ความอัดอั้น', 'การตัดสินใจ'],
    },
    Chorus: {
      purpose: 'แก่นแท้ สัจธรรมความรู้สึก ท่อนจำและวลีเด็ด',
      sensoryFocus: ['หัวใจ', 'ความจริง'],
      emotionalFocus: ['อารมณ์สูงสุด', 'ข้อความหลัก'],
    },
    Bridge: {
      purpose: 'มุมมองใหม่ การตระหนักรู้ หรือจุดหักเหของเรื่องราว',
      sensoryFocus: ['กาลเวลา', 'ความทรงจำ'],
      emotionalFocus: ['การยอมรับ', 'การเข้าใจความจริง'],
    },
    Outro: {
      purpose: 'ทิ้งความรู้สึก ทวนประโยคจำ และสรุปจบอย่างน่าประทับใจ',
      sensoryFocus: ['ภาพสุดท้ายที่เลือนหาย'],
      emotionalFocus: ['ความหวัง', 'ความอาลัย', 'ความสงบ'],
    },
  };

  if (Array.isArray(sectionPlans)) {
    for (const plan of sectionPlans) {
      if (plan && plan.sectionType) {
        intentMap[plan.sectionType] = {
          purpose: plan.purpose || intentMap[plan.sectionType]?.purpose || 'ขับเคลื่อนเรื่องราว',
          sensoryFocus: plan.requiredConcreteDetails || intentMap[plan.sectionType]?.sensoryFocus,
          emotionalFocus: plan.emotionalJob ? [plan.emotionalJob] : intentMap[plan.sectionType]?.emotionalFocus,
        };
      }
    }
  }

  return intentMap;
}

/**
 * Infers speaker persona, tone, and appropriate register from SongConfig
 */
export function inferCharacterVoice(config: SongConfig): {
  personaType: string;
  targetRegister: LexicalRegister;
  toneDescription: string;
  colloquialLevel: 'high' | 'medium' | 'low';
  isPlayfulOrHumorous: boolean;
  isRusticOrAuthentic: boolean;
  isUrbanOrModern: boolean;
} {
  const story = (config.story || '').toLowerCase();
  const genres = (config.genres || []).map((g) => g.toLowerCase());
  const moods = (config.moods || []).map((m) => m.toLowerCase());
  const wordTone = (config.wordTone || '').toLowerCase();
  const langStyle = (config.languageStyle || '').toLowerCase();

  const isPlayful =
    moods.some((m) => m.includes('ขี้เล่น') || m.includes('playful') || m.includes('สนุก') || m.includes('ตลก') || m.includes('humor')) ||
    wordTone.includes('ขี้เล่น') ||
    story.includes('ขี้เล่น') ||
    story.includes('แกล้ง') ||
    story.includes('หยอก');

  const isRustic =
    genres.some((g) => g.includes('ลูกทุ่ง') || g.includes('lukthung') || g.includes('เพื่อชีวิต') || g.includes('folk') || g.includes('อีสาน') || g.includes('หมอลำ')) ||
    story.includes('บ้านนอก') ||
    story.includes('ชนบท') ||
    story.includes('ท้องนา') ||
    story.includes('ทุ่งนา') ||
    story.includes('กลิ่นฟาง') ||
    story.includes('อีสาน');

  const isUrban =
    genres.some((g) => g.includes('hip-hop') || g.includes('rap') || g.includes('r&b') || g.includes('city pop') || g.includes('indie')) ||
    langStyle.includes('สตรีท') ||
    langStyle.includes('ทันสมัย');

  // Determine target register
  let targetRegister: LexicalRegister = 'conversational';
  let colloquialLevel: 'high' | 'medium' | 'low' = 'medium';

  if (isRustic && isPlayful) {
    targetRegister = 'spoken';
    colloquialLevel = 'high';
  } else if (isUrban && (genres.some((g) => g.includes('hip-hop') || g.includes('rap')) || langStyle.includes('สตรีท'))) {
    targetRegister = 'spoken';
    colloquialLevel = 'high';
  } else if (genres.some((g) => g.includes('traditional') || g.includes('วรรณคดี') || g.includes('คลาสสิก'))) {
    targetRegister = 'poetic';
    colloquialLevel = 'low';
  } else if (langStyle.includes('กวี') || langStyle.includes('เปรียบเทียบ')) {
    targetRegister = 'poetic';
    colloquialLevel = 'low';
  } else if (langStyle.includes('ตรงไปตรงมา') || wordTone.includes('เข้าถึงง่าย') || wordTone.includes('เป็นกันเอง')) {
    targetRegister = 'conversational';
    colloquialLevel = 'high';
  } else {
    // Default for Thai music is natural conversational
    targetRegister = 'conversational';
    colloquialLevel = 'medium';
  }

  // Persona summary
  let personaType = 'ผู้เล่าทั่วไป (General Narrator)';
  if (isRustic && isPlayful) {
    personaType = 'หนุ่มบ้าน ๆ จริงใจ ขี้เล่น ตรงไปตรงมา (Playful & Sincere Folk Narrator)';
  } else if (isRustic) {
    personaType = 'คนจริงใจ เล่าเรื่องชีวิตจริง (Sincere Rustic Storyteller)';
  } else if (isUrban && isPlayful) {
    personaType = 'คนเมืองรุ่นใหม่ อารมณ์ดี มีลูกเล่น (Playful Modern Urban Speaker)';
  } else if (isUrban) {
    personaType = 'คนเมืองร่วมสมัย ถ่ายทอดความรู้สึกลึกซึ้ง (Modern Urban Narrator)';
  }

  const toneDescription = `${wordTone || 'เข้าถึงง่าย เป็นธรรมชาติ'} / ${langStyle || 'ภาษาพูดสนทนา'}`;

  return {
    personaType,
    targetRegister,
    toneDescription,
    colloquialLevel,
    isPlayfulOrHumorous: isPlayful,
    isRusticOrAuthentic: isRustic,
    isUrbanOrModern: isUrban,
  };
}

/**
 * Builds LexicalContextVector from SongConfig, Blueprint, and creative context
 */
export function buildLexicalContextVector(
  config: SongConfig,
  blueprint?: any,
  sectionType?: string
): LexicalContextVector {
  const targetLanguage = config.language === 'Custom' && config.customLanguage
    ? config.customLanguage.trim()
    : (config.language?.trim() || 'ไทย');

  const isTargetThai = targetLanguage === 'ไทย' || targetLanguage.toLowerCase() === 'thai';

  const rawGenres = Array.from(
    new Set([
      ...(config.genres || []),
      ...(config.customGenre ? config.customGenre.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );

  const rawMoods = Array.from(
    new Set([
      ...(config.moods || []),
      ...(config.customMood ? config.customMood.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );

  // Region detection
  const story = (config.story || '').toLowerCase();
  let region: 'isan' | 'northern' | 'southern' | 'central' | 'general' | null = null;
  if (story.includes('อีสาน') || story.includes('คิดฮอด') || rawGenres.some((g) => g.toLowerCase().includes('หมอลำ') || g.toLowerCase().includes('อีสาน'))) {
    region = 'isan';
  } else if (story.includes('เชียงใหม่') || story.includes('เหนือ') || story.includes('คำเมือง')) {
    region = 'northern';
  } else if (story.includes('ใต้') || story.includes('ปักษ์ใต้') || rawGenres.some((g) => g.toLowerCase().includes('ใต้'))) {
    region = 'southern';
  } else {
    region = 'general';
  }

  const characterVoice = inferCharacterVoice(config);
  const storyTokens = extractStoryKeywords(config.story || '');

  // Extract Scene-Grounded Signals (from Blueprint, CreativeAnalysis, or Story)
  const activeBlueprint = blueprint || (config as any).blueprint || (config as any).creativeAnalysis;
  const creativeAnalysis = config.creativeAnalysis || (config as any).creativeAnalysis;
  const songWorld = activeBlueprint?.songWorld || (config as any).songWorld;
  const concreteDetails = activeBlueprint?.concreteDetails;
  const visualMotifs = activeBlueprint?.visualMotifs;
  const coreTruth = activeBlueprint?.coreTruth;
  const centralConflict = activeBlueprint?.centralConflict;
  const sectionPlans = activeBlueprint?.sectionPlans;

  const sceneObjects = extractSceneObjects(config.story || '', creativeAnalysis, songWorld, concreteDetails);
  const sensorySignals = extractSensorySignals(config.story || '', creativeAnalysis, songWorld);
  const visualSignals = extractVisualSignals(config.story || '', creativeAnalysis, visualMotifs);
  const narrativeSignals = extractNarrativeSignals(config.story || '', creativeAnalysis, coreTruth, centralConflict);
  const sectionLexicalIntent = buildSectionLexicalIntent(sectionPlans, creativeAnalysis);

  // Phase 5.5B Evidence Classification:
  // Tier 1: User-Grounded Evidence (Strictly sourced from user story, user-protected facts, explicit user inputs)
  const userEvidenceSet = new Set<string>();
  storyTokens.forEach((t) => userEvidenceSet.add(t));
  if (config.story) {
    // Extract explicitly stated nouns/anchors in story
    for (const anchor of KNOWN_SCENE_ANCHORS) {
      if (config.story.includes(anchor)) userEvidenceSet.add(anchor);
    }
    for (const cue of KNOWN_SENSORY_CUES) {
      if (config.story.includes(cue)) userEvidenceSet.add(cue);
    }
  }
  if (Array.isArray((config as any).protectedStoryFacts)) {
    (config as any).protectedStoryFacts.forEach((f: string) => { if (f) userEvidenceSet.add(f.trim()); });
  }

  // Tier 2: Context-Supported Evidence (Inferred from Blueprint, SongWorld, concreteDetails, visualMotifs)
  const contextEvidenceSet = new Set<string>();
  sceneObjects.forEach((o) => { if (!userEvidenceSet.has(o)) contextEvidenceSet.add(o); });
  sensorySignals.forEach((s) => { if (!userEvidenceSet.has(s)) contextEvidenceSet.add(s); });
  visualSignals.forEach((v) => { if (!userEvidenceSet.has(v)) contextEvidenceSet.add(v); });
  narrativeSignals.forEach((n) => { if (!userEvidenceSet.has(n)) contextEvidenceSet.add(n); });

  if (songWorld?.places && Array.isArray(songWorld.places)) {
    songWorld.places.forEach((p: string) => { if (p && !userEvidenceSet.has(p)) contextEvidenceSet.add(p.trim()); });
  }
  if (songWorld?.objects && Array.isArray(songWorld.objects)) {
    songWorld.objects.forEach((o: string) => { if (o && !userEvidenceSet.has(o)) contextEvidenceSet.add(o.trim()); });
  }

  const userGroundedEvidence = Array.from(userEvidenceSet);
  const contextSupportedEvidence = Array.from(contextEvidenceSet);

  // Extract core theme signals
  const coreThemes: string[] = [];
  if (rawMoods.length > 0) coreThemes.push(...rawMoods);
  if (rawGenres.length > 0) coreThemes.push(...rawGenres);

  const songwritingStyle = (typeof config.songwritingStyle === 'string' && config.songwritingStyle)
    ? config.songwritingStyle
    : 'Storytelling';

  const reference = config.reference;
  let refDirection: { genre?: string[]; mood?: string[]; tempo?: string; groove?: string } | undefined = undefined;

  if (reference && reference.applied && (reference.creativeDirection || reference.analysis)) {
    const rawRefGenre = reference.creativeDirection?.genre?.value || reference.analysis?.genre;
    const refGenreArr = Array.isArray(rawRefGenre)
      ? rawRefGenre.map(String)
      : (rawRefGenre ? [String(rawRefGenre)] : undefined);

    const rawRefMood = reference.creativeDirection?.mood?.value || reference.analysis?.mood;
    const refMoodArr = Array.isArray(rawRefMood)
      ? rawRefMood.map(String)
      : (rawRefMood ? [String(rawRefMood)] : undefined);

    const rawRefTempo = reference.creativeDirection?.tempo?.value || reference.analysis?.tempo;
    const refTempoStr = typeof rawRefTempo === 'string' ? rawRefTempo : undefined;

    const rawRefGroove = reference.creativeDirection?.rhythm?.value;
    const refGrooveStr = Array.isArray(rawRefGroove) ? rawRefGroove.join(', ') : (rawRefGroove ? String(rawRefGroove) : undefined);

    refDirection = {
      genre: refGenreArr,
      mood: refMoodArr,
      tempo: refTempoStr,
      groove: refGrooveStr,
    };
  }

  return {
    targetLanguage,
    isTargetThai,
    genres: rawGenres.length > 0 ? rawGenres : ['Pop'],
    songwritingStyle,
    moods: rawMoods.length > 0 ? rawMoods : ['อบอุ่น (Warm)'],
    pointOfView: config.pointOfView || 'auto',
    wordTone: config.wordTone || 'เข้าถึงง่าย เป็นธรรมชาติ',
    languageStyle: config.languageStyle || 'ภาษาพูดเป็นธรรมชาติ',
    tempo: config.tempo || 'ปานกลาง (80–100 BPM)',
    bpm: config.bpm ?? undefined,
    vocalType: config.vocalType || 'ชาย',
    referenceDerivedDirection: refDirection,
    characterVoice,
    region,
    storyContext: {
      storyText: config.story || '',
      storyTokens,
      coreThemes,
    },
    sceneObjects,
    sensorySignals,
    visualSignals,
    narrativeSignals,
    sectionType,
    sectionLexicalIntent,
    userGroundedEvidence,
    contextSupportedEvidence,
  };
}

