import {
  LexicalCandidate,
  LexicalContextVector,
  LexicalRegister,
  AvoidTier,
  EvidenceTier,
  VocabularyItem,
} from './types';

/**
 * Thematic Semantic Domains for Thai Songwriting
 */
interface ThematicDomainCluster {
  domain: string;
  keywords: string[];
  relatedTerms: string[];
}

const THEMATIC_DOMAINS: ThematicDomainCluster[] = [
  {
    domain: 'rural_farming_nature',
    keywords: [
      'ทุ่งนา', 'บ้านนอก', 'ชนบท', 'ฟาง', 'กลิ่นฟาง', 'ฟางข้าว', 'ควันไฟ', 'คันไถนา',
      'นกเอี้ยง', 'เถียงนา', 'เกี่ยวข้าว', 'รวงข้าว', 'ควาย', 'วัว', 'กลิ่นดิน', 'กระท่อม',
      'กองฟาง', 'โคลน', 'หลังสู้ฟ้า', 'เหงื่อ', 'อีสาน', 'บ้านนา', 'ลูกทุ่ง', 'เพื่อชีวิต',
      'ต้นตาล', 'นกเขา', 'เตาฟืน'
    ],
    relatedTerms: [
      'สายลมยามเย็น', 'กลิ่นฝน', 'กอดเสาเถียง', 'คิดฮอด', 'ตะวัน', 'ดงพงพี', 'รอนแรม',
      'สุกในดง', 'ผิวคล้ำ', 'ดอกไม้', 'ไออุ่น', 'จันทร์เจ้าเอย', 'ท้องฟ้า', 'กำลังใจ',
      'เหนื่อยล้า', 'รอคอย', 'มองดู', 'เฝ้ามอง', 'สัญญา', 'รักแท้', 'โอบกอด', 'เคียงข้าง',
      'กาลครั้งหนึ่ง', 'ภาพจำ'
    ]
  },
  {
    domain: 'urban_city_modern',
    keywords: [
      'คอนโด', 'ตึกสูง', 'ถนน', 'ไฟท้าย', 'รถติด', 'ป้ายรถเมล์', 'รถไฟฟ้า', 'บีทีเอส',
      'สถานี', 'ทางข้าม', 'ไฟแดง', 'คาเฟ่', 'เมืองหลวง', 'กรุงเทพ', 'คนเมือง', 'สตรีท',
      'ฮิปฮอป', 'ห้องเดิม', 'ดึกสงัด', 'เที่ยงคืน', 'แสงสี', 'เมืองใหญ่'
    ],
    relatedTerms: [
      'แสงไฟเมืองหลวง', 'รถติด', 'กาแฟแก้วโปรด', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา',
      'เหงา', 'เงียบเหงา', 'ความเงียบงัน', 'จังหวะหัวใจ', 'โทรหา', 'น่าขัน', 'ลองดู',
      'ความรู้สึก', 'ห้องสี่เหลี่ยม'
    ]
  },
  {
    domain: 'intimate_longing_memory',
    keywords: [
      'คิดถึง', 'คิดฮอด', 'คนไกล', 'จากลา', 'จากไป', 'รอคอย', 'ความทรงจำ', 'วันวาน',
      'ภาพจำ', 'สัญญา', 'ความรัก', 'ผูกพัน', 'ห่วงใย', 'อดีต', 'ที่เดิม', 'ร่ำลา',
      'ลาก่อน', 'คนรัก', 'แฟน', 'แอบมอง', 'สบตา'
    ],
    relatedTerms: [
      'กาลครั้งหนึ่ง', 'ภาพจำ', 'ย้อนเวลา', 'ห้วงคำนึง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน',
      'จันทร์ดวงน้อย', 'แสงนวล', 'เฝ้ามอง', 'ตามหา', 'เวลา', 'รอนาน', 'โอบกอด', 'เคียงข้าง',
      'แววตา', 'ไออุ่น', 'สัญญา', 'คุณค่าทางใจ', 'รักแท้', 'ให้ใจ', 'หัวใจ', 'ความรัก'
    ]
  },
  {
    domain: 'heartbreak_sorrow_loss',
    keywords: [
      'อกหัก', 'เสียใจ', 'น้ำตา', 'ผิดหวัง', 'ทิ้ง', 'เลิก', 'เจ็บ', 'หลอก',
      'ใจร้าย', 'พราก', 'สิ้นสุด', 'จบ', 'ร้องไห้', 'บาดแผล'
    ],
    relatedTerms: [
      'สุดท้าย', 'เสียใจ', 'เสียน้ำตา', 'เหงา', 'ใจร้าย', 'ครั้งสุดท้าย', 'เศร้าใจ',
      'เงียบเหงา', 'เงียบงัน', 'ไม่ไหว', 'พรากเจ้าไกล', 'ไม่มีเธอ', 'ลาลับไกล', 'เหี่ยวเฉา',
      'นั่งเศร้า', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน', 'แตกสลาย', 'ท้องฟ้าสีหม่น'
    ]
  },
  {
    domain: 'hope_motivation_faith',
    keywords: [
      'หวัง', 'สู้', 'กำลังใจ', 'อดทน', 'ก้าวไป', 'ศรัทธา', 'เริ่มต้นใหม่', 'ความฝัน',
      'พรุ่งนี้', 'แสงสว่าง', 'ฟ้าใหม่', 'แรงใจ'
    ],
    relatedTerms: [
      'กำลังใจ', 'ก้าวข้าม', 'อรุณรุ่ง', 'ปีกแห่งความฝัน', 'ส่องแสงเต็มฟ้า', 'ดั่งหวัง',
      'เชื่อ', 'ทุ่มเท', 'รักแท้', 'เชื่อใจ', 'ยิ้ม', 'อธิษฐาน', 'เทวดา', 'สมดัง',
      'ปรารถนา', 'จงเข้ามา', 'ตั้งจิต', 'ภาวนา', 'ฝากชีวิต'
    ]
  }
];

/**
 * Evaluates language compatibility between candidate term and target language.
 */
export function evaluateLanguageFit(term: string, item: VocabularyItem | undefined, vector: LexicalContextVector): number {
  const isThaiAlphabet = /[\u0E00-\u0E7F]/.test(term);
  const isEnglishAlphabet = /^[a-zA-Z\s\d.,'!-]+$/.test(term);

  if (vector.isTargetThai) {
    if (isThaiAlphabet) return 1.0;
    // Allow minimal universal English words if hip-hop or modern slang
    if (isEnglishAlphabet) {
      if (vector.characterVoice.isUrbanOrModern) return 0.4;
      return 0.1; // heavily penalized for rustic / folk Thai
    }
    return 0.8;
  } else {
    // Target is English or other
    if (vector.targetLanguage.toLowerCase() === 'english') {
      if (isEnglishAlphabet) return 1.0;
      return 0.0; // Strictly zero for Thai words in English target
    }
    return 0.5;
  }
}

/**
 * Evaluates Register and Formality fit against speaker character voice
 */
export function evaluateRegisterAndPersonaFit(
  term: string,
  itemRegister: LexicalRegister | undefined,
  vector: LexicalContextVector
): { registerFit: number; personaFit: number; formalityRisk: number; reason: string } {
  const targetRegister = vector.characterVoice.targetRegister;
  const isPlayful = vector.characterVoice.isPlayfulOrHumorous;
  const isRustic = vector.characterVoice.isRusticOrAuthentic;
  const isUrban = vector.characterVoice.isUrbanOrModern;

  const candidateRegister: LexicalRegister = itemRegister || inferTermRegister(term);

  let registerFit = 0.7;
  let personaFit = 0.7;
  let formalityRisk = 0.2;
  let reason = 'Normal conversational compatibility';

  // 1. Casual / Rustic / Playful Speaker Voice
  if (isRustic && isPlayful) {
    if (candidateRegister === 'spoken' || candidateRegister === 'conversational') {
      registerFit = 0.95;
      personaFit = 0.95;
      formalityRisk = 0.05;
      reason = 'เหมาะกับสำเนียงบ้าน ๆ ขี้เล่น เป็นธรรมชาติ';
    } else if (candidateRegister === 'dialect' && vector.region === 'isan') {
      registerFit = 0.90;
      personaFit = 0.90;
      reason = 'เข้ากับบรรยากาศภาษาถิ่นอีสาน';
    } else if (candidateRegister === 'literary' || candidateRegister === 'poetic' || candidateRegister === 'formal') {
      registerFit = 0.15;
      personaFit = 0.10;
      formalityRisk = 0.90;
      reason = 'ภาษาเป็นทางการ/วรรณคดีเกินไป ไม่เข้ากับเสียงของหนุ่มบ้าน ๆ ขี้เล่น';
    }
  }
  // 2. Modern Urban / Hip-hop Voice
  else if (isUrban) {
    if (candidateRegister === 'spoken' || candidateRegister === 'conversational') {
      registerFit = 0.90;
      personaFit = 0.90;
      formalityRisk = 0.10;
      reason = 'เข้ากับสไตล์คนเมืองร่วมสมัย';
    } else if (candidateRegister === 'formal' || candidateRegister === 'poetic') {
      registerFit = 0.25;
      personaFit = 0.20;
      formalityRisk = 0.85;
      reason = 'ศัพท์เป็นทางการขัดแย้งกับสไตล์คนเมือง/สตรีท';
    }
  }
  // 3. Poetic / Classical Voice
  else if (targetRegister === 'poetic' || targetRegister === 'literary') {
    if (candidateRegister === 'poetic' || candidateRegister === 'literary') {
      registerFit = 0.95;
      personaFit = 0.95;
      formalityRisk = 0.10;
      reason = 'ภาษาสวยงาม มีชั้นเชิงกวีนิพนธ์';
    } else if (candidateRegister === 'spoken') {
      registerFit = 0.50;
      personaFit = 0.50;
      reason = 'ภาษาพูดธรรมดาในบริบทเพลงกวี';
    }
  }
  // 4. Default Conversational
  else {
    if (candidateRegister === 'conversational' || candidateRegister === 'spoken' || candidateRegister === 'neutral') {
      registerFit = 0.90;
      personaFit = 0.85;
      reason = 'ภาษาพูดเป็นธรรมชาติ';
    } else if (candidateRegister === 'poetic' || candidateRegister === 'literary') {
      registerFit = 0.40;
      personaFit = 0.40;
      formalityRisk = 0.60;
      reason = 'ศัพท์วรรณศิลป์ค่อนข้างสูงสำหรับเพลงพูดทั่วไป';
    }
  }

  return { registerFit, personaFit, formalityRisk, reason };
}

/**
 * Infers register for terms that don't have explicit metadata
 */
export function inferTermRegister(term: string): LexicalRegister {
  const poeticIndicators = ['ดั่ง', 'พิศมัย', 'ภิรมย์', 'นฤมิต', 'สุวรรณ', 'สวรรค์', 'สรวง', 'ประจักษ์', 'ตรึงตรา', 'นภา', 'ทิวา', 'ราตรี', 'ธิดา', 'พารา', 'กมล'];
  const spokenIndicators = ['ป่ะ', 'ดิ', 'ไง', 'เหรอ', 'มั้ย', 'นะเนี่ย', 'เข้าตา', 'จริงใจ', 'จัง', 'เลย', 'แอบชอบ', 'แฟน'];
  const dialectIndicators = ['คิดฮอด', 'เพิ่น', 'บ่', 'อ้าย', 'ข่อย', 'พ้อ', 'ความฮัก', 'ขี้จุ๊', 'อู้', 'แหลง', 'แค่ๆ', 'หื้อ'];
  const formalIndicators = ['ข้าพเจ้า', 'ประการ', 'อนุเคราะห์', 'ศักราช', 'พระองค์'];

  if (poeticIndicators.some((p) => term.includes(p))) return 'poetic';
  if (dialectIndicators.some((d) => term.includes(d))) return 'dialect';
  if (spokenIndicators.some((s) => term.includes(s))) return 'spoken';
  if (formalIndicators.some((f) => term.includes(f))) return 'formal';

  return 'conversational';
}

/**
 * Layered Semantic Matching:
 * Evaluates semantic fit across Exact, Phrase, Scene Object, Visual Motif, Thematic Domain, and Concept clusters.
 */
export function evaluateLayeredSemanticFit(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector
): {
  semanticFit: number;
  exactMatch: boolean;
  matchLayer: 'exact' | 'collocation' | 'scene_object' | 'visual_motif' | 'domain' | 'mood' | 'baseline';
  reason: string;
} {
  const storyLower = (vector.storyContext?.storyText || '').toLowerCase();
  const termLower = term.toLowerCase();

  // Layer A: Exact Match in story text or story tokens
  if (storyLower.includes(termLower)) {
    return { semanticFit: 1.0, exactMatch: true, matchLayer: 'exact', reason: 'ตรงกับคำในเนื้อเรื่องโดยตรง' };
  }
  if (vector.storyContext?.storyTokens?.some((t) => t.toLowerCase() === termLower)) {
    return { semanticFit: 1.0, exactMatch: true, matchLayer: 'exact', reason: 'ตรงกับ Story Token' };
  }

  // Layer B: Phrase / Collocation Match (candidate is substring or shares noun phrase)
  const isCollocation = vector.storyContext?.storyTokens?.some(
    (t) => t.length >= 3 && (t.includes(termLower) || termLower.includes(t))
  );
  if (isCollocation) {
    return { semanticFit: 0.92, exactMatch: false, matchLayer: 'collocation', reason: 'สอดคล้องกับวลีในเนื้อเรื่อง' };
  }

  // Layer C: Scene Object & Sensory Signal Match
  const matchesSceneObject = vector.sceneObjects?.some((obj) => {
    const oLower = obj.toLowerCase();
    return oLower.includes(termLower) || termLower.includes(oLower);
  });
  const matchesSensory = vector.sensorySignals?.some((cue) => {
    const cLower = cue.toLowerCase();
    return cLower.includes(termLower) || termLower.includes(cLower);
  });

  if (matchesSceneObject || matchesSensory) {
    return { semanticFit: 0.90, exactMatch: false, matchLayer: 'scene_object', reason: 'เชื่อมโยงกับฉากและผัสสะของเรื่อง' };
  }

  // Layer D: Visual Motif & Narrative Intent Match
  const matchesVisual = vector.visualSignals?.some((motif) => {
    const mLower = motif.toLowerCase();
    return mLower.includes(termLower) || termLower.includes(mLower);
  });
  const matchesNarrative = vector.narrativeSignals?.some((sig) => {
    const sLower = sig.toLowerCase();
    return sLower.includes(termLower) || termLower.includes(sLower);
  });

  if (matchesVisual || matchesNarrative) {
    return { semanticFit: 0.88, exactMatch: false, matchLayer: 'visual_motif', reason: 'ตรงกับสัญญะภาพหรือแก่นเรื่อง' };
  }

  // Layer E: Thematic Domain Match
  const activeDomains = THEMATIC_DOMAINS.filter((d) => {
    const domainKeywordMatches = d.keywords.some((kw) => storyLower.includes(kw.toLowerCase()));
    const domainGenreMatches = vector.genres.some((g) => {
      const gLower = g.toLowerCase();
      if (d.domain === 'rural_farming_nature' && (gLower.includes('folk') || gLower.includes('country') || gLower.includes('ลูกทุ่ง') || gLower.includes('เพื่อชีวิต'))) return true;
      if (d.domain === 'urban_city_modern' && (gLower.includes('city pop') || gLower.includes('hip-hop') || gLower.includes('rap') || gLower.includes('r&b') || gLower.includes('pop'))) return true;
      return false;
    });
    return domainKeywordMatches || domainGenreMatches;
  });

  const isInActiveDomain = activeDomains.some((d) =>
    d.keywords.includes(term) || d.relatedTerms.includes(term)
  );

  if (isInActiveDomain) {
    return { semanticFit: 0.82, exactMatch: false, matchLayer: 'domain', reason: 'อยู่ในเครือข่ายความหมายของฉากและแนวเพลง' };
  }

  // Layer F: Mood / Emotion Overlap
  const itemMoods = [
    ...(item?.emotions || []),
    ...(item?.suitableMoods || []),
  ].map((m) => m.toLowerCase());

  if (itemMoods.length > 0) {
    const moodMatched = vector.moods.some((m) =>
      itemMoods.some((im) => im.includes(m.toLowerCase()) || m.toLowerCase().includes(im))
    );
    if (moodMatched) {
      return { semanticFit: 0.72, exactMatch: false, matchLayer: 'mood', reason: 'ตรงกับอารมณ์เพลง' };
    }
  }

  // Layer G: Baseline Neutral
  return { semanticFit: 0.40, exactMatch: false, matchLayer: 'baseline', reason: 'ความเข้ากันได้ตามมาตรฐาน' };
}

/**
 * Scene Grounding Score:
 * Measures whether candidate term directly or conceptually relates to sceneObjects, sensorySignals, visualSignals, or concrete setting.
 */
export function evaluateSceneGrounding(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector
): number {
  const termLower = term.toLowerCase();

  // 1. Direct match with scene objects / places (weight: 0.40)
  const sceneObjectMatch = vector.sceneObjects?.some((obj) => {
    const oLower = obj.toLowerCase();
    return oLower.includes(termLower) || termLower.includes(oLower);
  });

  // 2. Direct match with sensory cues / time cues (weight: 0.35)
  const sensoryMatch = vector.sensorySignals?.some((cue) => {
    const cLower = cue.toLowerCase();
    return cLower.includes(termLower) || termLower.includes(cLower);
  });

  // 3. Direct match with visual motifs (weight: 0.25)
  const visualMatch = vector.visualSignals?.some((motif) => {
    const mLower = motif.toLowerCase();
    return mLower.includes(termLower) || termLower.includes(mLower);
  });

  if (sceneObjectMatch && (sensoryMatch || visualMatch)) return 1.0;
  if (sceneObjectMatch) return 0.95;
  if (sensoryMatch) return 0.90;
  if (visualMatch) return 0.85;

  // Check thematic domain alignment with song's scene world
  const isRuralStory = (vector.sceneObjects?.some((o) => ['ทุ่งนา', 'ฟาง', 'ควันไฟ', 'คันไถนา', 'เถียงนา', 'บ้านนอก'].some((k) => o.includes(k))) ?? false) ||
    vector.storyContext.storyText.includes('ทุ่งนา') ||
    vector.storyContext.storyText.includes('ฟาง') ||
    vector.storyContext.storyText.includes('บ้านนอก');

  const isUrbanStory = (vector.sceneObjects?.some((o) => ['คอนโด', 'ตึกสูง', 'ถนน', 'รถติด', 'คาเฟ่'].some((k) => o.includes(k))) ?? false) ||
    vector.storyContext.storyText.includes('คอนโด') ||
    vector.storyContext.storyText.includes('รถติด') ||
    vector.storyContext.storyText.includes('เมืองหลวง');

  if (isRuralStory) {
    const ruralWords = ['สายลมยามเย็น', 'กลิ่นฝน', 'กอดเสาเถียง', 'คิดฮอด', 'ตะวัน', 'ดงพงพี', 'รอนแรม', 'สุกในดง', 'ผิวคล้ำ', 'ดอกไม้', 'ไออุ่น', 'จันทร์เจ้าเอย', 'ท้องฟ้า', 'กำลังใจ'];
    if (ruralWords.includes(term)) return 0.85;
  }

  if (isUrbanStory) {
    const urbanWords = ['แสงไฟเมืองหลวง', 'รถติด', 'กาแฟแก้วโปรด', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา', 'เหงา', 'จังหวะหัวใจ'];
    if (urbanWords.includes(term)) return 0.85;
  }

  // Abstract / General emotional words get baseline scene grounding
  const abstractTerms = ['หัวใจ', 'ความรัก', 'สัญญา', 'เวลา', 'เชื่อ', 'ให้ใจ', 'ความรู้สึก', 'มองดู'];
  if (abstractTerms.includes(term)) return 0.45;

  // Unrelated or discordant physical objects get low scene grounding
  return 0.15;
}

/**
 * Affinity Boost:
 * Soft positive boost for stylistic synergy between genre + setting + lexical archetype.
 */
export function evaluateAffinityBoost(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector
): number {
  const genres = vector.genres.map((g) => g.toLowerCase());
  const isFolkOrCountry = genres.some((g) => g.includes('folk') || g.includes('country') || g.includes('ลูกทุ่ง') || g.includes('เพื่อชีวิต'));
  const isUrbanGenre = genres.some((g) => g.includes('city pop') || g.includes('hip-hop') || g.includes('rap') || g.includes('r&b') || g.includes('indie'));
  const isAcousticBallad = genres.some((g) => g.includes('acoustic') || g.includes('ballad') || g.includes('lo-fi'));

  const ruralTerms = ['สายลมยามเย็น', 'กลิ่นฝน', 'กอดเสาเถียง', 'คิดฮอด', 'ตะวัน', 'ดงพงพี', 'รอนแรม', 'สุกในดง', 'ผิวคล้ำ', 'ดอกไม้', 'ไออุ่น', 'จันทร์เจ้าเอย'];
  const urbanTerms = ['แสงไฟเมืองหลวง', 'รถติด', 'กาแฟแก้วโปรด', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา', 'จังหวะหัวใจ', 'โทรหา'];
  const acousticTerms = ['โอบกอด', 'เคียงข้าง', 'ภาพจำ', 'กาลครั้งหนึ่ง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน', 'ไออุ่น', 'แววตา', 'สายลมยามเย็น'];

  if (isFolkOrCountry && ruralTerms.includes(term)) return 0.95;
  if (isUrbanGenre && urbanTerms.includes(term)) return 0.95;
  if (isAcousticBallad && acousticTerms.includes(term)) return 0.90;

  return 0.40;
}

/**
 * Section Fit:
 * Evaluates term suitability for specific section types (Verse vs Chorus vs Pre-Chorus vs Bridge vs Outro).
 */
export function evaluateSectionFit(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector,
  sectionType?: string
): number {
  const targetSection = sectionType || vector.sectionType;
  if (!targetSection) return 0.80; // neutral global fit

  const sectionNormalized = targetSection.toLowerCase();

  const isImageryWord = ['สายลมยามเย็น', 'กลิ่นฝน', 'กอดเสาเถียง', 'ตะวัน', 'ดงพงพี', 'สุกในดง', 'ผิวคล้ำ', 'ดอกไม้', 'แสงไฟเมืองหลวง', 'รถติด', 'กาแฟแก้วโปรด', 'มองดู', 'เฝ้ามอง'].includes(term);
  const isChorusCoreWord = ['หัวใจ', 'ความรัก', 'คิดถึง', 'คิดฮอด', 'สัญญา', 'รักแท้', 'โอบกอด', 'เคียงข้าง', 'ไม่ไหว', 'กำลังใจ', 'เชื่อ', 'ให้ใจ'].includes(term);
  const isTransitionWord = ['หวั่นไหว', 'เริ่ม', 'ก้าวข้าม', 'ตามหา', 'เสียใจ', 'เวลา', 'รอนาน', 'จังหวะหัวใจ'].includes(term);
  const isBridgeReflectionWord = ['ภาพจำ', 'กาลครั้งหนึ่ง', 'ย้อนเวลา', 'ห้วงคำนึง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน', 'สุดท้าย', 'ครั้งสุดท้าย'].includes(term);

  if (sectionNormalized.includes('verse')) {
    if (isImageryWord) return 0.95;
    if (isChorusCoreWord) return 0.75;
    return 0.80;
  }

  if (sectionNormalized.includes('pre-chorus') || sectionNormalized.includes('prechorus')) {
    if (isTransitionWord) return 0.95;
    if (isChorusCoreWord) return 0.85;
    return 0.80;
  }

  if (sectionNormalized.includes('chorus') || sectionNormalized.includes('hook')) {
    if (isChorusCoreWord) return 0.95;
    if (isImageryWord) return 0.70;
    return 0.80;
  }

  if (sectionNormalized.includes('bridge')) {
    if (isBridgeReflectionWord) return 0.95;
    return 0.80;
  }

  if (sectionNormalized.includes('outro')) {
    if (isBridgeReflectionWord || isChorusCoreWord) return 0.95;
    return 0.80;
  }

  return 0.80;
}

/**
 * Checks cliché risk and specific awkward phrasing
 */
export function evaluateClicheAndContextualAvoidance(
  term: string,
  vector: LexicalContextVector
): { clicheRisk: number; avoidTier: AvoidTier; avoidReason?: string } {
  const lower = term.toLowerCase();

  // Known forced / awkward math / robotic metaphors in songs
  const awkwardMathPhrases = ['คูณสอง', 'บวกหนึ่ง', 'หารสอง', 'เปอร์เซ็นต์', 'สแควร์รูท'];
  const awkwardForcedSlang = ['วิ่งแส่', 'แส่หา', 'ตกหลุมความน่ารัก', 'ใจมันพองโตขึ้นมา'];
  const extremeCliches = [
    'รักเธอสุดหัวใจ',
    'น้ำตาริน',
    'ใจสลาย',
    'คิดถึงเธอเหลือเกิน',
    'ขาดเธอไม่ได้',
    'ฟ้าหลังฝน',
    'รักนิรันดร์',
    'โลกทั้งใบของฉัน',
  ];

  if (awkwardMathPhrases.some((a) => lower.includes(a))) {
    return {
      clicheRisk: 0.9,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'สำนวนแปลกและไม่เป็นธรรมชาติในเพลงรักทั่วไป (Awkward math/robotic metaphor)',
    };
  }

  if (awkwardForcedSlang.some((a) => lower.includes(a))) {
    return {
      clicheRisk: 0.85,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'รูปประโยคหรือสำนวนแปลกที่อาจขัดกับการร้องลื่นไหล (Awkward phrasing)',
    };
  }

  if (extremeCliches.some((c) => lower.includes(c))) {
    return {
      clicheRisk: 0.8,
      avoidTier: 'LOW_PREFERENCE',
      avoidReason: 'วลีสำเร็จรูปซ้ำซาก (Overused cliché)',
    };
  }

  return {
    clicheRisk: 0.1,
    avoidTier: 'PREFERRED',
  };
}

/**
 * Phase 5.5B: Determine Evidence Tier for Lexical Candidate
 * TIER_1_USER_GROUNDED: Sourced directly from User Story, User Prompt, User-defined facts
 * TIER_2_CONTEXT_SUPPORTED: Reasonably inferred from Blueprint, Song World, setting, mood, narrative signals
 * TIER_3_GENRE_DECORATION: Suggested solely from genre stereotypes without story evidence
 */
export function determineEvidenceTier(
  term: string,
  vector: LexicalContextVector
): EvidenceTier {
  const termLower = term.toLowerCase();

  // Tier 1 Check: User Story Text & Direct User Grounded Evidence
  const matchesUserEvidence = (vector.userGroundedEvidence || []).some((e) => {
    const eLower = e.toLowerCase();
    return eLower.includes(termLower) || termLower.includes(eLower);
  });
  const inStoryText = vector.storyContext.storyText && vector.storyContext.storyText.toLowerCase().includes(termLower);

  if (matchesUserEvidence || inStoryText) {
    return 'TIER_1_USER_GROUNDED';
  }

  // Tier 2 Check: Context Supported (Blueprint, Song World, Sensory Signals, Visual Signals, Narrative Signals)
  const matchesContextEvidence = (vector.contextSupportedEvidence || []).some((e) => {
    const eLower = e.toLowerCase();
    return eLower.includes(termLower) || termLower.includes(eLower);
  });
  const matchesSceneObject = (vector.sceneObjects || []).some((o) => {
    const oLower = o.toLowerCase();
    return oLower.includes(termLower) || termLower.includes(oLower);
  });
  const matchesSensory = (vector.sensorySignals || []).some((s) => {
    const sLower = s.toLowerCase();
    return sLower.includes(termLower) || termLower.includes(sLower);
  });
  const matchesVisual = (vector.visualSignals || []).some((v) => {
    const vLower = v.toLowerCase();
    return vLower.includes(termLower) || termLower.includes(vLower);
  });
  const matchesNarrative = (vector.narrativeSignals || []).some((n) => {
    const nLower = n.toLowerCase();
    return nLower.includes(termLower) || termLower.includes(nLower);
  });

  if (matchesContextEvidence || matchesSceneObject || matchesSensory || matchesVisual || matchesNarrative) {
    return 'TIER_2_CONTEXT_SUPPORTED';
  }

  // Default: Tier 3 Genre Decoration
  return 'TIER_3_GENRE_DECORATION';
}

/**
 * Phase 5.5B: Narrative Utility Evaluation
 * Evaluates whether candidate word/phrase has active storytelling utility:
 * (Establish Scene, Characterize Speaker, Advance Story, Reveal Memory, Change Emotion, Support Hook, Reinforce Theme, Create Symbolic Meaning)
 */
export function evaluateNarrativeUtility(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector,
  evidenceTier: EvidenceTier,
  sectionType?: string
): { narrativeUtility: number; reason: string } {
  const termLower = term.toLowerCase();
  const targetSection = (sectionType || vector.sectionType || '').toLowerCase();

  // Tier 1 User Grounded has highest innate narrative utility
  if (evidenceTier === 'TIER_1_USER_GROUNDED') {
    return {
      narrativeUtility: 0.95,
      reason: 'ยึดโยงกับข้อเท็จจริงและเจตนาหลักของเรื่องราวโดยตรง (Direct User Evidence)',
    };
  }

  // Tier 2 Context Supported has strong narrative utility when section-aligned
  if (evidenceTier === 'TIER_2_CONTEXT_SUPPORTED') {
    if (targetSection.includes('verse') || targetSection.includes('intro')) {
      return {
        narrativeUtility: 0.90,
        reason: 'ช่วยสร้างภาพฉากและผัสสะที่ชัดเจนในท่อนเล่าเรื่อง (Scene Setting Utility)',
      };
    }
    if (targetSection.includes('chorus') || targetSection.includes('hook')) {
      return {
        narrativeUtility: 0.85,
        reason: 'เสริมพลังอารมณ์และแก่นเรื่องในท่อนจำ (Hook Support Utility)',
      };
    }
    return {
      narrativeUtility: 0.80,
      reason: 'สนับสนุนบริบทของโลกเพลงอย่างสมเหตุสมผล (Context Supported Utility)',
    };
  }

  // Tier 3 Genre Decoration: evaluate if it serves character voice or is pure decorative dump
  const isCharacterVoiceMatch = vector.characterVoice.personaType &&
    (vector.characterVoice.isRusticOrAuthentic || vector.characterVoice.isUrbanOrModern);

  // Ungrounded concrete physical objects (e.g., buffalo, firewood, shack when not in story)
  const ungroundedPhysicalObjects = ['ควาย', 'วัว', 'นกเอี้ยง', 'เตาฟืน', 'กระท่อม', 'คอนโด', 'รถไฟฟ้า', 'ป้ายรถเมล์'];
  if (ungroundedPhysicalObjects.some((obj) => termLower.includes(obj))) {
    return {
      narrativeUtility: 0.20,
      reason: 'เป็นวัตถุตกแต่งตามแนวเพลงที่ไม่มีหลักฐานในเรื่อง (Unsupported Genre Decoration)',
    };
  }

  if (isCharacterVoiceMatch) {
    return {
      narrativeUtility: 0.50,
      reason: 'มีประโยชน์ด้านการรักษาบุคลิกตัวละคร แต่ต้องระวังไม่ให้เป็นสูตรสำเร็จ (Voice Fit / Caution)',
    };
  }

  return {
    narrativeUtility: 0.35,
    reason: 'มีหน้าที่ทางการเล่าเรื่องต่ำ (Low Narrative Utility)',
  };
}

/**
 * Phase 5.5B: Genericness vs Specificity Evaluation
 * Detects interchangeable generic emotional lines vs song-specific anchored details.
 */
export function evaluateGenericnessAndSpecificity(
  term: string,
  vector: LexicalContextVector,
  evidenceTier: EvidenceTier
): { specificityScore: number; genericnessRisk: number; reason: string } {
  const termLower = term.toLowerCase();

  // Known interchangeable generic song phrases
  const genericInterchangeablePhrases = [
    'รักเธอสุดหัวใจ',
    'คิดถึงเธอสุดหัวใจ',
    'รอวันเธอกลับมา',
    'ใจดวงน้อย',
    'ใจยังเหมือนเดิม',
    'โลกมืดมน',
    'คิดถึงทุกนาที',
    'เหงาเหลือเกิน',
    'ขาดเธอไม่ได้',
    'ไม่เหลือใคร',
    'ใจสลาย',
    'น้ำตาริน',
    'ฟ้าหลังฝน',
    'รักนิรันดร์',
    'โลกทั้งใบ',
  ];

  if (genericInterchangeablePhrases.some((g) => termLower.includes(g))) {
    return {
      specificityScore: 0.20,
      genericnessRisk: 0.90,
      reason: 'วลีสำเร็จรูปทั่วไปที่ใช้ในเพลงใดก็ได้ ขาดความเป็นเอกลักษณ์ของเรื่อง (High Genericness Risk)',
    };
  }

  if (evidenceTier === 'TIER_1_USER_GROUNDED') {
    return {
      specificityScore: 0.95,
      genericnessRisk: 0.10,
      reason: 'มีความเฉพาะเจาะจงสูงตามเรื่องเล่าของผู้ใช้ (High Specificity)',
    };
  }

  if (evidenceTier === 'TIER_2_CONTEXT_SUPPORTED') {
    return {
      specificityScore: 0.85,
      genericnessRisk: 0.20,
      reason: 'มีความเฉพาะเจาะจงตามบริบทและโลกของเพลง (Context Specificity)',
    };
  }

  return {
    specificityScore: 0.50,
    genericnessRisk: 0.60,
    reason: 'คำศัพท์ระดับทั่วไป (General Register)',
  };
}

/**
 * Core Ranking Function: Scores and sorts Lexical Candidates with Phase 5.5B Evidence-Grounded Ranking
 * Priority Order for Thai Songwriting:
 * Naturalness (L3 > L2 > L1) > Semantic Correctness > Character Voice > Scene Evidence Grounding (Tier 1 > Tier 2 > Tier 3) > Narrative Utility > Section Fit > Singability > Rhyme Convenience
 */
export function rankLexicalCandidate(
  item: VocabularyItem,
  vector: LexicalContextVector,
  sectionType?: string
): LexicalCandidate {
  const term = item.word;

  // 1. Language Fit (Naturalness base)
  const languageFit = evaluateLanguageFit(term, item, vector);

  // 2. Register & Persona Fit (Character Voice base)
  const { registerFit, personaFit, formalityRisk, reason: personaReason } = evaluateRegisterAndPersonaFit(
    term,
    item.register,
    vector
  );

  // 2b. Region & Dialect Fit
  let regionFit = 0.8;
  const itemRegion = item.regional || item.regionalTag;
  if (itemRegion && itemRegion !== 'general' && itemRegion !== 'central') {
    const isIsan = itemRegion === 'isan';
    const isNorth = itemRegion === 'north' || itemRegion === 'northern';
    const isSouth = itemRegion === 'south' || itemRegion === 'southern';

    if (isIsan && vector.region === 'isan') {
      regionFit = 1.0;
    } else if (isNorth && vector.region === 'northern') {
      regionFit = 1.0;
    } else if (isSouth && vector.region === 'southern') {
      regionFit = 1.0;
    } else {
      // Dialect word in non-dialect context -> heavily penalize
      regionFit = 0.1;
    }
  }

  // 3. Evidence Tier Determination (Phase 5.5B Fact Safety)
  const evidenceTier = determineEvidenceTier(term, vector);

  // 4. Narrative Utility Evaluation (Useful Specificity > Decorative Specificity)
  const { narrativeUtility, reason: utilityReason } = evaluateNarrativeUtility(
    term,
    item,
    vector,
    evidenceTier,
    sectionType
  );

  // 5. Genericness vs Specificity Evaluation
  const { specificityScore, genericnessRisk, reason: genericnessReason } = evaluateGenericnessAndSpecificity(
    term,
    vector,
    evidenceTier
  );

  // 6. Genre Fit & Fact Safety Control
  let genreFit = 0.5;
  const itemGenres = [
    ...(item.genres || []),
    ...(item.suitableGenres || []),
  ].map((g) => g.toLowerCase());

  if (itemGenres.length > 0) {
    const matched = vector.genres.some((g) =>
      itemGenres.some((ig) => ig.includes(g.toLowerCase()) || g.toLowerCase().includes(ig))
    );
    // Fact safety: If tier 3 genre decoration, do not give unchecked positive genre boost
    if (matched) {
      genreFit = evidenceTier === 'TIER_3_GENRE_DECORATION' ? 0.60 : 0.90;
    } else {
      genreFit = 0.40;
    }
  } else {
    genreFit = 0.60; // neutral if not genre-constrained
  }

  // 7. Layered Semantic Matching
  const { semanticFit, exactMatch, matchLayer, reason: semanticReason } = evaluateLayeredSemanticFit(
    term,
    item,
    vector
  );

  // 8. Scene Grounding Score
  const sceneGrounding = evaluateSceneGrounding(term, item, vector);

  // 9. Section Fit
  const sectionFit = evaluateSectionFit(term, item, vector, sectionType);

  // 10. Affinity Boost
  const affinityBoost = evaluateAffinityBoost(term, item, vector);

  // 11. Cliché & Contextual Avoidance
  const { clicheRisk, avoidTier, avoidReason } = evaluateClicheAndContextualAvoidance(term, vector);

  // 12. Singability & Natural Flow
  const singability = item.weight ? item.weight / 10 : 0.8;

  // Composite Score Formula (Evidence-Grounded, Persona & Naturalness First)
  let compositeScore =
    languageFit * 15 +
    personaFit * 18 +
    registerFit * 10 +
    semanticFit * 12 +
    sceneGrounding * 12 +
    narrativeUtility * 12 +
    specificityScore * 8 +
    sectionFit * 8 +
    genreFit * 5 +
    singability * 5 +
    affinityBoost * 5 -
    clicheRisk * 20 -
    genericnessRisk * 15;

  // Evidence Tier Adjustments (Fact Safety):
  if (evidenceTier === 'TIER_1_USER_GROUNDED') {
    compositeScore += 15;
  } else if (evidenceTier === 'TIER_2_CONTEXT_SUPPORTED') {
    compositeScore += 10;
  } else if (evidenceTier === 'TIER_3_GENRE_DECORATION') {
    // Ungrounded physical tropes get penalized
    if (narrativeUtility <= 0.25) {
      compositeScore -= 15;
    }
  }

  if (regionFit <= 0.2) {
    compositeScore -= 30; // heavy penalty for mismatched dialect words
  }

  if (avoidTier === 'CONTEXTUAL_AVOID') {
    compositeScore -= 35;
  } else if (avoidTier === 'LOW_PREFERENCE') {
    compositeScore -= 15;
  }

  // Strict clamp
  compositeScore = Math.max(0, Math.min(100, Math.round(compositeScore)));

  const register = item.register || inferTermRegister(term);

  // Debug trace log
  logLexicalSceneGrounding(term, {
    exactMatch,
    semanticMatch: semanticFit,
    sceneGrounding,
    sectionFit,
    personaFit,
    genreFit,
    evidenceTier,
    narrativeUtility,
    finalScore: compositeScore,
  });

  return {
    term,
    register,
    semanticTags: item.tags || [],
    genreFit,
    personaFit,
    languageFit,
    singability,
    clicheRisk,
    formalityRisk,
    source: evidenceTier === 'TIER_1_USER_GROUNDED' ? 'scene-grounded' : (sceneGrounding >= 0.85 ? 'scene-grounded' : 'curated'),
    avoidTier,
    avoidReason,
    score: compositeScore,
    reason: `${personaReason} (${semanticReason}; Tier: ${evidenceTier}; Utility: ${utilityReason})`,
    sceneGrounding,
    sectionFit,
    affinityBoost,
    exactMatch,
    semanticMatch: semanticFit,
    evidenceTier,
    narrativeUtility,
    specificityScore,
    genericnessRisk,
  };
}

/**
 * Debug Trace Logger for Scene Grounding Calibration
 */
export function logLexicalSceneGrounding(
  term: string,
  data: {
    exactMatch: boolean;
    semanticMatch: number;
    sceneGrounding: number;
    sectionFit: number;
    personaFit: number;
    genreFit: number;
    evidenceTier?: EvidenceTier;
    narrativeUtility?: number;
    finalScore: number;
  }
): void {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LEXICAL === 'true') {
    console.log(
      `[LexicalEvidenceGrounding] term: "${term}" | tier: ${data.evidenceTier || 'N/A'} | utility: ${data.narrativeUtility?.toFixed(2) ?? 'N/A'} | exactMatch: ${data.exactMatch} | semanticMatch: ${data.semanticMatch.toFixed(2)} | sceneGrounding: ${data.sceneGrounding.toFixed(2)} | sectionFit: ${data.sectionFit.toFixed(2)} | personaFit: ${data.personaFit.toFixed(2)} | genreFit: ${data.genreFit.toFixed(2)} | finalScore: ${data.finalScore}`
    );
  }
}

/**
 * Trace Logger for Development Audit (Backward Compatible)
 */
export function logLexicalSelection(
  intent: string,
  candidate: string,
  selected: boolean,
  metadata: {
    register?: string;
    genreFit?: number;
    personaFit?: number;
    clicheRisk?: number;
    score?: number;
    reason?: string;
  }
): void {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LEXICAL === 'true') {
    console.log(
      `[LexicalSelection] intent: "${intent}" | candidate: "${candidate}" | selected: ${selected} | register: ${metadata.register || 'N/A'} | genreFit: ${metadata.genreFit ?? 'N/A'} | personaFit: ${metadata.personaFit ?? 'N/A'} | clicheRisk: ${metadata.clicheRisk ?? 'N/A'} | score: ${metadata.score ?? 'N/A'} | reason: ${metadata.reason || 'N/A'}`
    );
  }
}
