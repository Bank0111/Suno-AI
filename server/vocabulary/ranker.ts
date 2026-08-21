import {
  LexicalCandidate,
  LexicalContextVector,
  LexicalRegister,
  AvoidTier,
  EvidenceTier,
  VocabularyItem,
} from './types';

/**
 * Thematic Semantic Domains for Thai Songwriting (Phase 5.7 Standard)
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
      'ทุ่งนา', 'บ้านนอก', 'ชนบท', 'ฟาง', 'กลิ่นฟาง', 'ฟางข้าว', 'ควันไฟ', 'คันนา', 'คันไถนา',
      'นกเอี้ยง', 'เถียงนา', 'เกี่ยวข้าว', 'รวงข้าว', 'ควาย', 'วัว', 'กลิ่นดิน', 'กระท่อม',
      'กองฟาง', 'โคลน', 'เหงื่อ', 'อีสาน', 'บ้านนา', 'ลูกทุ่ง', 'เพื่อชีวิต', 'ต้นตาล', 'เตาฟืน'
    ],
    relatedTerms: [
      'สายลมยามเย็น', 'กลิ่นฝน', 'คิดฮอด', 'ตะวัน', 'ดอกไม้', 'ไออุ่น', 'ท้องฟ้า', 'กำลังใจ',
      'เหนื่อยล้า', 'รอคอย', 'มองดู', 'เฝ้ามอง', 'สัญญา', 'รักแท้', 'โอบกอด', 'เคียงข้าง',
      'ภาพจำ', 'สองมือ', 'หยาดเหงื่อ', 'ขี่มอไซค์'
    ]
  },
  {
    domain: 'urban_city_modern',
    keywords: [
      'คอนโด', 'ตึกสูง', 'ถนน', 'ไฟท้าย', 'รถติด', 'ป้ายรถเมล์', 'รถไฟฟ้า', 'บีทีเอส',
      'สถานี', 'ทางข้าม', 'ไฟแดง', 'คาเฟ่', 'เมืองหลวง', 'กรุงเทพ', 'คนเมือง', 'สตรีท',
      'ฮิปฮอป', 'ห้องเช่า', 'ดึกสงัด', 'เที่ยงคืน', 'แสงสี', 'เมืองใหญ่', 'สะพานลอย'
    ],
    relatedTerms: [
      'แสงไฟเมืองหลวง', 'รถติด', 'แก้วกาแฟ', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา',
      'เหงา', 'เงียบเหงา', 'ความเงียบงัน', 'จังหวะหัวใจ', 'โทรหา', 'ความรู้สึก', 'หน้าต่าง',
      'แสงไฟนีออน', 'เก้าอี้ว่าง', 'หูฟัง'
    ]
  },
  {
    domain: 'intimate_longing_memory',
    keywords: [
      'คิดถึง', 'คิดฮอด', 'คนไกล', 'จากลา', 'จากไป', 'รอคอย', 'ความทรงจำ', 'วันวาน',
      'ภาพจำ', 'สัญญา', 'ความรัก', 'ผูกพัน', 'ห่วงใย', 'อดีต', 'ที่เดิม', 'ร่ำลา',
      'คนรัก', 'แอบมอง', 'สบตา', 'รูปถ่าย', 'ข้อความ'
    ],
    relatedTerms: [
      'กาลครั้งหนึ่ง', 'ภาพจำ', 'ย้อนเวลา', 'ห้วงคำนึง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน',
      'เฝ้ามอง', 'ตามหา', 'เวลา', 'โอบกอด', 'เคียงข้าง', 'แววตา', 'ไออุ่น', 'สัญญา',
      'รักแท้', 'ให้ใจ', 'หัวใจ', 'ความรัก', 'สมุดบันทึก'
    ]
  },
  {
    domain: 'heartbreak_sorrow_loss',
    keywords: [
      'อกหัก', 'เสียใจ', 'น้ำตา', 'ผิดหวัง', 'ทิ้ง', 'เลิก', 'เจ็บ', 'หลอก',
      'ใจร้าย', 'พราก', 'สิ้นสุด', 'จบ', 'ร้องไห้', 'บาดแผล', 'ความเงียบ'
    ],
    relatedTerms: [
      'สุดท้าย', 'เสียใจ', 'เสียน้ำตา', 'เหงา', 'ใจร้าย', 'ครั้งสุดท้าย', 'เศร้าใจ',
      'เงียบเหงา', 'เงียบงัน', 'ไม่มีเธอ', 'ร่องรอย', 'เจือจาง', 'แตกสลาย', 'ท้องฟ้าสีหม่น',
      'ปล่อยมือ', 'ความจริง', 'ตัดใจ', 'เก้าอี้ว่าง'
    ]
  },
  {
    domain: 'hope_motivation_faith',
    keywords: [
      'หวัง', 'สู้', 'กำลังใจ', 'อดทน', 'ก้าวไป', 'ศรัทธา', 'เริ่มต้นใหม่', 'ความฝัน',
      'พรุ่งนี้', 'แสงสว่าง', 'ฟ้าใหม่', 'แรงใจ', 'สองมือ'
    ],
    relatedTerms: [
      'กำลังใจ', 'ก้าวข้าม', 'เชื่อ', 'ทุ่มเท', 'รักแท้', 'เชื่อใจ', 'ยิ้ม', 'สองมือ',
      'หยาดเหงื่อ', 'ไม่ยอมแพ้', 'พิสูจน์'
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
    if (isEnglishAlphabet) {
      if (vector.characterVoice.isUrbanOrModern) return 0.4;
      return 0.1;
    }
    return 0.8;
  } else {
    if (vector.targetLanguage.toLowerCase() === 'english') {
      if (isEnglishAlphabet) return 1.0;
      return 0.0;
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
  const formalIndicators = ['ข้าพเจ้า', 'ประการ', 'อนุเคราะห์', 'ศักราช', 'พระองค์', 'บริบท', 'ขับเคลื่อน', 'มิติ'];

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

  // Layer B: Phrase / Collocation Match
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

  // 1. Direct match with scene objects / places
  const sceneObjectMatch = vector.sceneObjects?.some((obj) => {
    const oLower = obj.toLowerCase();
    return oLower.includes(termLower) || termLower.includes(oLower);
  });

  // 2. Direct match with sensory cues / time cues
  const sensoryMatch = vector.sensorySignals?.some((cue) => {
    const cLower = cue.toLowerCase();
    return cLower.includes(termLower) || termLower.includes(cLower);
  });

  // 3. Direct match with visual motifs
  const visualMatch = vector.visualSignals?.some((motif) => {
    const mLower = motif.toLowerCase();
    return mLower.includes(termLower) || termLower.includes(mLower);
  });

  if (sceneObjectMatch && (sensoryMatch || visualMatch)) return 1.0;
  if (sceneObjectMatch) return 0.95;
  if (sensoryMatch) return 0.90;
  if (visualMatch) return 0.85;

  const isRuralStory = (vector.sceneObjects?.some((o) => ['ทุ่งนา', 'ฟาง', 'ควันไฟ', 'คันนา', 'คันไถนา', 'เถียงนา', 'บ้านนอก'].some((k) => o.includes(k))) ?? false) ||
    vector.storyContext.storyText.includes('ทุ่งนา') ||
    vector.storyContext.storyText.includes('ฟาง') ||
    vector.storyContext.storyText.includes('บ้านนอก');

  const isUrbanStory = (vector.sceneObjects?.some((o) => ['คอนโด', 'ตึกสูง', 'ถนน', 'รถติด', 'คาเฟ่'].some((k) => o.includes(k))) ?? false) ||
    vector.storyContext.storyText.includes('คอนโด') ||
    vector.storyContext.storyText.includes('รถติด') ||
    vector.storyContext.storyText.includes('เมืองหลวง');

  if (isRuralStory) {
    const ruralWords = ['สายลมยามเย็น', 'กลิ่นฝน', 'คิดฮอด', 'ตะวัน', 'ดอกไม้', 'ไออุ่น', 'ท้องฟ้า', 'กำลังใจ'];
    if (ruralWords.includes(term)) return 0.85;
  }

  if (isUrbanStory) {
    const urbanWords = ['แสงไฟเมืองหลวง', 'รถติด', 'แก้วกาแฟ', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา', 'เหงา', 'จังหวะหัวใจ'];
    if (urbanWords.includes(term)) return 0.85;
  }

  const abstractTerms = ['หัวใจ', 'ความรัก', 'สัญญา', 'เวลา', 'เชื่อ', 'ให้ใจ', 'ความรู้สึก', 'มองดู'];
  if (abstractTerms.includes(term)) return 0.45;

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

  const ruralTerms = ['สายลมยามเย็น', 'กลิ่นฝน', 'คิดฮอด', 'ตะวัน', 'ดอกไม้', 'ไออุ่น', 'จันทร์เจ้าเอย'];
  const urbanTerms = ['แสงไฟเมืองหลวง', 'รถติด', 'แก้วกาแฟ', 'ห้วงคำนึง', 'ภาพจำ', 'ย้อนเวลา', 'แววตา', 'จังหวะหัวใจ', 'โทรหา'];
  const acousticTerms = ['โอบกอด', 'เคียงข้าง', 'ภาพจำ', 'กาลครั้งหนึ่ง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน', 'ไออุ่น', 'แววตา', 'สายลมยามเย็น'];

  if (isFolkOrCountry && ruralTerms.includes(term)) return 0.95;
  if (isUrbanGenre && urbanTerms.includes(term)) return 0.95;
  if (isAcousticBallad && acousticTerms.includes(term)) return 0.90;

  return 0.40;
}

/**
 * Section Fit (Phase 5.7 Section-Aware Constraint Gate):
 * Evaluates term suitability for specific section types (Verse vs Chorus vs Pre-Chorus vs Bridge vs Outro).
 */
export function evaluateSectionFit(
  term: string,
  item: VocabularyItem | undefined,
  vector: LexicalContextVector,
  sectionType?: string,
  evidenceTier?: EvidenceTier
): number {
  const targetSection = sectionType || vector.sectionType;
  if (!targetSection) return 0.80;

  const sectionNormalized = targetSection.toLowerCase();
  const termLower = term.toLowerCase();

  // Vocational Tools / Mechanical Equipment: NOT a categorical ban from Hook/Chorus/Bridge.
  // If the term is directly grounded in the user's own story (TIER_1_USER_GROUNDED),
  // it is a legitimate Vocational Detail (e.g. a single symbolic closing image) and only
  // gets a mild discount. Ungrounded/decorative use of the same term still gets the harsh
  // penalty, since that's when it reads as random Vocational Dump rather than story truth.
  const vocationalTools = ['ประแจ', 'น็อต', 'ชุดเซฟตี้', 'หัวเทียน', 'สายพาน', 'คราบน้ำมัน', 'สว่าน'];
  const isTool = vocationalTools.some((t) => termLower.includes(t));
  const isStoryGrounded = evidenceTier === 'TIER_1_USER_GROUNDED';

  const isImageryWord = ['สายลมยามเย็น', 'กลิ่นฝน', 'ตะวัน', 'ดอกไม้', 'แสงไฟเมืองหลวง', 'รถติด', 'แก้วกาแฟ', 'มองดู', 'เฝ้ามอง', 'หน้าต่าง', 'โต๊ะไม้'].includes(term);
  const isChorusCoreWord = ['หัวใจ', 'ความรัก', 'คิดถึง', 'คิดฮอด', 'สัญญา', 'รักแท้', 'โอบกอด', 'เคียงข้าง', 'ไม่ไหว', 'กำลังใจ', 'เชื่อ', 'ให้ใจ', 'สองมือ', 'ความจริง'].includes(term);
  const isTransitionWord = ['หวั่นไหว', 'เริ่ม', 'ก้าวข้าม', 'ตามหา', 'เสียใจ', 'เวลา', 'รอนาน', 'จังหวะหัวใจ'].includes(term);
  const isBridgeReflectionWord = ['ภาพจำ', 'กาลครั้งหนึ่ง', 'ย้อนเวลา', 'ห้วงคำนึง', 'ร่องรอย', 'เจือจาง', 'ความเงียบงัน', 'สุดท้าย', 'ครั้งสุดท้าย', 'เข้าใจ', 'ยอมรับ'].includes(term);

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
    if (isTool) return isStoryGrounded ? 0.55 : 0.10; // Harsh penalty only when NOT story-grounded
    if (isChorusCoreWord) return 0.98;
    if (isImageryWord) return 0.65;
    return 0.80;
  }

  if (sectionNormalized.includes('bridge')) {
    if (isTool) return isStoryGrounded ? 0.55 : 0.15;
    if (isBridgeReflectionWord) return 0.98;
    return 0.80;
  }

  if (sectionNormalized.includes('outro')) {
    if (isBridgeReflectionWord || isChorusCoreWord) return 0.95;
    return 0.80;
  }

  return 0.80;
}

/**
 * Checks cliché risk and specific awkward phrasing (Phase 5.7 Standard)
 */
export function evaluateClicheAndContextualAvoidance(
  term: string,
  vector: LexicalContextVector
): { clicheRisk: number; avoidTier: AvoidTier; avoidReason?: string } {
  const lower = term.toLowerCase();

  // 1. Math / Robotic Metaphors
  const awkwardMathPhrases = ['คูณสอง', 'บวกหนึ่ง', 'หารสอง', 'เปอร์เซ็นต์', 'สแควร์รูท', '100%', 'ตัวคูณ'];
  if (awkwardMathPhrases.some((a) => lower.includes(a))) {
    return {
      clicheRisk: 0.95,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'คำศัพท์คณิตศาสตร์/หุ่นยนต์ที่ทำลายความเป็นธรรมชาติ (Robotic Math Metaphor)',
    };
  }

  // 2. Academic Jargon & Research Tone (Phase 5.7 Gate)
  const academicJargon = ['บริบท', 'มิติใหม่', 'กำแพงชนชั้น', 'ขับเคลื่อน', 'โครงสร้างทางสังคม', 'ปัจจัย', 'มิติ'];
  if (academicJargon.some((j) => lower.includes(j))) {
    return {
      clicheRisk: 0.95,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'ศัพท์รายงานวิชาการ/บทความวิจัยที่ขัดกับภาษาเพลง (Academic Jargon)',
    };
  }

  // 3. Narrative Prose Reporting (Phase 5.7 Gate)
  const proseReportingPhrases = ['จากนั้นก็', 'แล้วจึง', 'ขั้นตอนต่อไป'];
  if (proseReportingPhrases.some((p) => lower.includes(p))) {
    return {
      clicheRisk: 0.90,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'สำนวนแจกแจงลำดับเหตุการณ์แบบร้อยแก้ว (Narrative Prose Reporting)',
    };
  }

  // 4. Forced / Awkward Slang
  const awkwardForcedSlang = ['วิ่งแส่', 'แส่หา', 'ตกหลุมความน่ารัก', 'ใจมันพองโตขึ้นมา', 'มูฟออน', 'อันฟอล'];
  if (awkwardForcedSlang.some((a) => lower.includes(a))) {
    return {
      clicheRisk: 0.85,
      avoidTier: 'CONTEXTUAL_AVOID',
      avoidReason: 'รูปประโยคหรือสแลงแปลกที่ขัดกับการร้องลื่นไหล (Awkward phrasing)',
    };
  }

  // 5. Extreme Clichés
  const extremeCliches = [
    'รักเธอสุดหัวใจ',
    'น้ำตาริน',
    'ใจสลาย',
    'คิดถึงเธอเหลือเกิน',
    'ขาดเธอไม่ได้',
    'ฟ้าหลังฝน',
    'รักนิรันดร์',
    'โลกทั้งใบของฉัน',
    'น้ำตารินไหลอาบสองแก้ม',
    'ชั่วฟ้าดินสลาย',
    'ดวงใจดวงน้อย',
  ];

  if (extremeCliches.some((c) => lower.includes(c))) {
    return {
      clicheRisk: 0.85,
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
 */
export function determineEvidenceTier(
  term: string,
  vector: LexicalContextVector
): EvidenceTier {
  const termLower = term.toLowerCase();

  const matchesUserEvidence = (vector.userGroundedEvidence || []).some((e) => {
    const eLower = e.toLowerCase();
    return eLower.includes(termLower) || termLower.includes(eLower);
  });
  const inStoryText = vector.storyContext.storyText && vector.storyContext.storyText.toLowerCase().includes(termLower);

  if (matchesUserEvidence || inStoryText) {
    return 'TIER_1_USER_GROUNDED';
  }

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

  return 'TIER_3_GENRE_DECORATION';
}

/**
 * Phase 5.5B: Narrative Utility Evaluation
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

  if (evidenceTier === 'TIER_1_USER_GROUNDED') {
    return {
      narrativeUtility: 0.95,
      reason: 'ยึดโยงกับข้อเท็จจริงและเจตนาหลักของเรื่องราวโดยตรง (Direct User Evidence)',
    };
  }

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

  const isCharacterVoiceMatch = vector.characterVoice.personaType &&
    (vector.characterVoice.isRusticOrAuthentic || vector.characterVoice.isUrbanOrModern);

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
 */
export function evaluateGenericnessAndSpecificity(
  term: string,
  vector: LexicalContextVector,
  evidenceTier: EvidenceTier
): { specificityScore: number; genericnessRisk: number; reason: string } {
  const termLower = term.toLowerCase();

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
 * Core Ranking Function: Scores and sorts Lexical Candidates with Phase 5.7 Multi-Gate Calibration
 */
export function rankLexicalCandidate(
  item: VocabularyItem,
  vector: LexicalContextVector,
  sectionType?: string
): LexicalCandidate {
  const term = item.word;

  // 1. Language Fit
  const languageFit = evaluateLanguageFit(term, item, vector);

  // 2. Register & Persona Fit
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
      regionFit = 0.1;
    }
  }

  // 3. Evidence Tier Determination
  const evidenceTier = determineEvidenceTier(term, vector);

  // 4. Narrative Utility Evaluation
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
    if (matched) {
      genreFit = evidenceTier === 'TIER_3_GENRE_DECORATION' ? 0.60 : 0.90;
    } else {
      genreFit = 0.40;
    }
  } else {
    genreFit = 0.60;
  }

  // 7. Layered Semantic Matching
  const { semanticFit, exactMatch, matchLayer, reason: semanticReason } = evaluateLayeredSemanticFit(
    term,
    item,
    vector
  );

  // 8. Scene Grounding Score
  const sceneGrounding = evaluateSceneGrounding(term, item, vector);

  // 9. Section Fit (Phase 5.7 Gate)
  const sectionFit = evaluateSectionFit(term, item, vector, sectionType, evidenceTier);

  // 10. Affinity Boost
  const affinityBoost = evaluateAffinityBoost(term, item, vector);

  // 11. Cliché & Contextual Avoidance
  const { clicheRisk, avoidTier, avoidReason } = evaluateClicheAndContextualAvoidance(term, vector);

  // 12. Singability & Natural Flow
  const singability = item.weight ? item.weight / 10 : 0.8;

  // Composite Score Formula
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

  // Evidence Tier Adjustments:
  if (evidenceTier === 'TIER_1_USER_GROUNDED') {
    compositeScore += 15;
  } else if (evidenceTier === 'TIER_2_CONTEXT_SUPPORTED') {
    compositeScore += 10;
  } else if (evidenceTier === 'TIER_3_GENRE_DECORATION') {
    if (narrativeUtility <= 0.25) {
      compositeScore -= 15;
    }
  }

  if (regionFit <= 0.2) {
    compositeScore -= 30;
  }

  if (avoidTier === 'CONTEXTUAL_AVOID') {
    compositeScore -= 35;
  } else if (avoidTier === 'LOW_PREFERENCE') {
    compositeScore -= 15;
  }

  // Strict clamp
  compositeScore = Math.max(0, Math.min(100, Math.round(compositeScore)));

  const register = item.register || inferTermRegister(term);

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