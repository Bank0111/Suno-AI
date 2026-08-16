export type SourceType =
  | 'synthetic-expert'
  | 'original-curated'
  | 'synthetic-failure-case'
  | 'fair-use-structural-pattern'
  | 'user-accepted-correction';

export type LyricRegister =
  | 'spoken'
  | 'conversational'
  | 'neutral'
  | 'literary'
  | 'poetic'
  | 'formal'
  | 'dialect';

export type LyricGenreKey =
  | 'Country / Folk'
  | 'R&B / Soul'
  | 'Hip-Hop / Rap'
  | 'Indie / Pop'
  | 'Rock'
  | 'Pop'
  | 'City Pop'
  | 'Lukthung'
  | 'English Pop';

export type SectionType =
  | 'Intro'
  | 'Verse'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Bridge'
  | 'Outro'
  | 'Hook';

export type AvoidTier =
  | 'HARD_BLOCK'
  | 'CONTEXTUAL_AVOID'
  | 'LOW_PREFERENCE';

export type FailureFlawType =
  | 'forced-rhyme'
  | 'robotic-metaphor'
  | 'cliche-overload'
  | 'persona-break'
  | 'rhythm-stumble'
  | 'awkward-collocation'
  | 'filler-line'
  | 'semantic-drift'
  | 'register-mismatch'
  | 'generic-emotion';

/**
 * A. Thai Lyric Knowledge Base Model
 */
export interface ThaiLyricKnowledgeEntry {
  id: string;
  phrase: string;
  syllableCount: number;
  rhythmicStress: string; // e.g. "0-1-0-1", "1-0-1-0"
  naturalRegister: LyricRegister;
  semanticDomains: string[];
  rhymeEnding: {
    vowelGroup: string;
    toneCategory: 'สามัญ' | 'เอก' | 'โท' | 'ตรี' | 'จัตวา';
  };
  collocationPairs: string[];
  sourceType: SourceType;
}

/**
 * B. Good Lyrics Exemplar Model
 */
export interface GoodLyricExemplar {
  id: string;
  genre: LyricGenreKey;
  personaVoice: string;
  personaKey?: string;
  sectionType: SectionType;
  lines: string[];
  whyItWorks: {
    naturalnessScore: number; // 1 to 10
    imageryType: 'concrete' | 'emotional' | 'narrative' | 'sensory';
    characterConsistency: string;
    singabilityPacing: string;
  };
  sourceType: SourceType;
}

/**
 * C. Bad Lyrics Exemplar Model
 */
export interface BadLyricExemplar {
  id: string;
  genre: LyricGenreKey;
  sectionType: SectionType;
  flawedLines: string[];
  flawType: FailureFlawType;
  rootCause: string;
  detectedSignals: string[];
  sourceType: SourceType;
}

/**
 * D. Correction Pair Model
 */
export interface LyricCorrectionPair {
  id: string;
  context: {
    genre: LyricGenreKey;
    persona: string;
    personaKey?: string;
    mood: string;
    section: SectionType;
  };
  originalFlawed: string;
  diagnosis: string;
  correctedNatural: string;
  improvementTechnique: string;
  sourceType: SourceType;
}

/**
 * E. Persona Profile Model
 */
export interface PersonaProfile {
  personaKey: string;
  displayName: string;
  description: string;
  primaryRegisters: LyricRegister[];
  speechTraits: {
    colloquialLevel: 'high' | 'medium' | 'low';
    isPlayful: boolean;
    isRustic: boolean;
    isUrban: boolean;
    particles: string[]; // e.g. ["เนี่ย", "เลยนะ", "ดิ", "ล่ะ"]
  };
  vocabularyAllowance: {
    preferredWords: string[];
    forbiddenRegisters: LyricRegister[];
    forbiddenMetaphors: string[];
  };
  sourceType: SourceType;
}

/**
 * F. Genre-Specific Language Profile Model
 */
export interface GenreLanguageProfile {
  genreKey: LyricGenreKey;
  displayName: string;
  narrativePacing: string;
  imageryFocus: 'everyday-objects' | 'sensory-touch' | 'street-cadence' | 'nostalgic-memory' | 'melodic-pop';
  rhymeDensityPreference: 'strict' | 'conversational-free' | 'internal-assonance' | 'natural-cadence';
  recommendedVerbs: string[];
  bannedTropes: string[];
  sourceType: SourceType;
}

/**
 * G. Cliché / Avoidance Rule Entry Model
 */
export interface AvoidanceRuleEntry {
  id: string;
  termOrPhrase: string;
  tier: AvoidTier;
  contextConditions: {
    genres?: LyricGenreKey[];
    personas?: string[];
    sections?: SectionType[];
  };
  reason: string;
  suggestedAlternatives: string[];
  sourceType: SourceType;
}

/**
 * H. Golden Test Fixture Model
 */
export interface GoldenTestFixture {
  id: string;
  title: string;
  targetLanguage: string;
  config: {
    genre: LyricGenreKey;
    moods: string[];
    story: string;
    pointOfView: string;
    wordTone: string;
    languageStyle: string;
    bpm?: number;
    tempo?: string;
    vocalType?: string;
  };
  expectedLexicalBehavior: {
    requiredVoicePersona: string;
    targetRegister: LyricRegister;
    mustIncludeSemanticThemes: string[];
    mustAvoidPatterns: string[];
  };
  knownFailurePatternsToDetect: string[];
  sourceType: SourceType;
}

/**
 * Dataset Bundle Summary
 */
export interface TrainingDatasetBundle {
  thaiLyricKnowledge: ThaiLyricKnowledgeEntry[];
  goodExemplars: GoodLyricExemplar[];
  badExemplars: BadLyricExemplar[];
  correctionPairs: LyricCorrectionPair[];
  avoidanceRules: AvoidanceRuleEntry[];
  personaProfiles: PersonaProfile[];
  genreProfiles: GenreLanguageProfile[];
  goldenTestFixtures: GoldenTestFixture[];
}

export interface DatasetValidationReport {
  isValid: boolean;
  totalRecords: number;
  breakdown: Record<string, number>;
  sourceTypeDistribution: Record<SourceType, number>;
  errors: string[];
  warnings: string[];
}
