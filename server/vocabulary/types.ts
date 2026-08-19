import { SongConfig } from '../../src/types/songwriting';

export type LexicalRegister =
  | 'spoken'         // ภาษาพูดทั่วไป เป็นธรรมชาติในชีวิตประจำวัน
  | 'conversational' // ภาษาพูดสนทนา เล่าเรื่อง สื่อสารตรงไปตรงมา
  | 'neutral'        // ภาษามาตรฐาน สุภาพ ทั่วไป
  | 'literary'       // ภาษาวรรณศิลป์ งดงาม มีชั้นเชิง
  | 'poetic'         // ภาษากวี บทกวี สัมผัสวิจิตร
  | 'formal'         // ภาษาทางการ ราชการ ราชาศัพท์
  | 'dialect';       // ภาษาถิ่น (อีสาน, เหนือ, ใต้ ฯลฯ)

export type AvoidTier =
  | 'HARD_BLOCK'        // คำหยาบ คำผิดกฎหมาย หรือคำต้องห้ามเด็ดขาด
  | 'CONTEXTUAL_AVOID'  // คำที่ขัดแย้งกับบริบท/สไตล์เพลง/อารมณ์เพลง
  | 'LOW_PREFERENCE'    // คำสำเร็จรูปซ้ำซาก (Clichés) ที่ควรลดการใช้
  | 'PREFERRED';        // คำแนะนำที่เหมาะสมกับบริบทอย่างยิ่ง

export type EvidenceTier =
  | 'TIER_1_USER_GROUNDED'      // ข้อมูลที่มาจาก User Story, Prompt, User Facts, Explicit Creative Analysis
  | 'TIER_2_CONTEXT_SUPPORTED'  // ข้อมูลที่อนุมานได้อย่างสมเหตุสมผลจาก Blueprint, Song World, setting, mood
  | 'TIER_3_GENRE_DECORATION';  // ข้อมูลที่ถูกแนะนำเพียงเพราะ Genre stereotype / generic cultural association

export type SourceSemanticCategory =
  | 'love'
  | 'heartbreak'
  | 'longing'
  | 'sadness'
  | 'hope'
  | 'faith'
  | 'nostalgia'
  | 'motivation'
  | 'isan'
  | 'northern'
  | 'southern'
  | 'modern'
  | 'traditional'
  | 'nature'
  | 'humor';

export type SemanticCategory =
  | SourceSemanticCategory
  | 'Love & Connection'
  | 'Heartbreak & Loneliness'
  | 'Nostalgia & Memory'
  | 'Urban & Modern Life'
  | 'Nature & Atmosphere'
  | 'Hope & Empowerment'
  | 'Sensory & Abstract'
  | 'Poetic & Metaphorical'
  | 'Thai Regional & Dialect'
  | 'Rhythm & Cadence Fillers';

/**
 * Rich Lexical Candidate Model
 */
export interface LexicalCandidate {
  term: string;
  register?: LexicalRegister;
  semanticTags?: string[];
  genreFit?: number;      // 0.0 to 1.0
  personaFit?: number;    // 0.0 to 1.0
  languageFit?: number;   // 0.0 to 1.0
  regionFit?: number;     // 0.0 to 1.0
  singability?: number;   // 0.0 to 1.0
  clicheRisk?: number;    // 0.0 (safe) to 1.0 (extreme cliché)
  formalityRisk?: number; // 0.0 (casual) to 1.0 (overly formal/stiff)
  source?: 'curated' | 'semantic-intent' | 'contextual-retrieval' | 'gemini-specialist' | 'scene-grounded';
  avoidTier?: AvoidTier;
  avoidReason?: string;
  score?: number;
  reason?: string;
  sceneGrounding?: number;  // 0.0 to 1.0
  sectionFit?: number;      // 0.0 to 1.0
  affinityBoost?: number;   // 0.0 to 1.0
  exactMatch?: boolean;
  semanticMatch?: number;   // 0.0 to 1.0
  // Phase 5.5B / 5.7 Evidence-Grounded & Narrative Utility Fields
  evidenceTier?: EvidenceTier;
  narrativeUtility?: number;  // 0.0 to 1.0 (Useful specificity vs decorative specificity)
  specificityScore?: number;  // 0.0 to 1.0
  genericnessRisk?: number;   // 0.0 (unique/specific) to 1.0 (interchangeable cliché)
}

/**
 * Existing Vocabulary Database Item Model
 */
export interface VocabularyItem {
  id?: string;
  word: string;
  category?: SemanticCategory;
  categories?: (SemanticCategory | string)[];
  emotions?: string[];
  tags?: string[];
  genres?: string[];
  suitableGenres?: string[];
  suitableMoods?: string[];
  suitableLanguageStyles?: string[];
  regional?: 'isan' | 'northern' | 'southern' | 'central' | 'english' | null;
  regionalTag?: 'isan' | 'north' | 'south' | 'general' | 'northern' | 'southern' | 'central' | 'english' | null;
  register?: LexicalRegister;
  rhymingTone?: string;
  priority?: number;
  weight?: number;
  clicheRisk?: number;
  personaCompatibility?: string[];
}

/**
 * Context Vector capturing full creative environment
 */
export interface LexicalContextVector {
  targetLanguage: string;
  isTargetThai: boolean;
  genres: string[];
  songwritingStyle: string;
  moods: string[];
  pointOfView: string;
  wordTone: string;
  languageStyle: string;
  tempo: string;
  bpm?: number;
  vocalType: string;
  referenceDerivedDirection?: {
    genre?: string[];
    mood?: string[];
    tempo?: string;
    groove?: string;
  };
  characterVoice: {
    personaType: string;
    targetRegister: LexicalRegister;
    toneDescription: string;
    colloquialLevel: 'high' | 'medium' | 'low';
    isPlayfulOrHumorous: boolean;
    isRusticOrAuthentic: boolean;
    isUrbanOrModern: boolean;
  };
  region?: 'isan' | 'northern' | 'southern' | 'central' | 'general' | null;
  storyContext: {
    storyText: string;
    storyTokens: string[];
    coreThemes: string[];
  };
  // Phase 5.5A Scene-Grounded Lexical Fields
  sceneObjects: string[];
  sensorySignals: string[];
  visualSignals: string[];
  narrativeSignals: string[];
  sectionType?: string;
  sectionLexicalIntent?: Record<string, {
    purpose: string;
    sensoryFocus?: string[];
    emotionalFocus?: string[];
  }>;
  // Phase 5.5B Evidence Tracking
  userGroundedEvidence?: string[];      // Tier 1: User story, user prompt, explicit user facts
  contextSupportedEvidence?: string[];  // Tier 2: Blueprint, SongWorld, setting, mood
}

export interface AvoidClassification {
  /** Hard-banned words (offensive, illegal, vulgar, strict prohibited terms) */
  hardBanned: string[];
  /** Overused cliché words/phrases that AI should minimize */
  overused: string[];
  /** Words that clash with selected genre/mood/language style */
  contextClash: string[];
  /** Specific contextual guidance on avoided patterns */
  contextualAvoidanceNotes?: string[];
}

export interface LexicalIntentGroup {
  intent: string;
  description: string;
  candidates: LexicalCandidate[];
}

export interface SmartVocabularyResult {
  /** Core words directly reflecting main story themes & emotions */
  core: string[];
  /** Supporting imagery and atmospheric words */
  supporting: string[];
  /** Optional alternatives for rhyme, cadence, and variation */
  optional: string[];
  /** Phase 5.5A Structured Guidance: Concrete imagery for verses */
  verseImagery?: string[];
  /** Phase 5.5A Structured Guidance: Emotional progression for sections */
  sectionEmotion?: string[];
  /** Phase 5.5A Structured Guidance: Core terms for hook / chorus */
  hookCoreTerms?: string[];
  /** Intent-based candidate groupings (Context-Aware Lexical Engine) */
  intentGroups?: LexicalIntentGroup[];
  /** Classification of words to avoid or minimize */
  avoid: AvoidClassification;
  /** Context vector used to generate this selection */
  contextVector?: LexicalContextVector;
  /** Metadata on how the vocabulary context was constructed */
  metadata: {
    source: 'rule-based' | 'hybrid' | 'gemini-enhanced' | 'context-aware-engine';
    songId?: string;
    generatedAt: string;
    candidateCount: number;
    targetLanguage: string;
  };
}

export interface VocabularyEngineConfig {
  /** Whether to invoke Gemini Smart Selector if rule-based candidates are sparse or story is complex */
  enableSmartSelector?: boolean;
  /** Maximum number of Core words to select */
  maxCoreWords?: number;
  /** Maximum number of Supporting words to select */
  maxSupportingWords?: number;
  /** Maximum number of Optional words to select */
  maxOptionalWords?: number;
  /** Song ID or session key for caching lexical context */
  songId?: string;
  /** Force bypass cache refresh */
  forceRefresh?: boolean;
  /** Phase 5.5A: Blueprint object for scene world, concrete details, section plans */
  blueprint?: any;
  /** Phase 5.5A: Specific section type being generated/refined (e.g. Verse, Chorus) */
  sectionType?: string;
}

export interface VocabularyValidationReport {
  isValid: boolean;
  score: number; // 0-100 quality score
  hardBannedFound: string[];
  overusedFound: string[];
  contextClashFound: string[];
  academicJargonFound?: string[];
  vocationalDumpFound?: string[];
  proseReportingFound?: string[];
  feedback: string[];
}