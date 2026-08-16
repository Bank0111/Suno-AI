import { LexicalRegister } from '../../vocabulary/types';

export type SupportedLanguageCode = 'th' | 'en' | 'generic';

export interface CraftIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  diagnosis: string;
  evidence: string;
  suggestedAction: string;
  strategy: CraftStrategyType;
}

export type CraftStrategyType =
  | 'increase_specificity'
  | 'increase_character_voice'
  | 'replace_generic_emotion'
  | 'improve_image'
  | 'reduce_decoration'
  | 'improve_semantic_precision'
  | 'improve_conversational_authenticity'
  | 'improve_memorability'
  | 'simplify'
  | 'preserve_original';

export type EditorLineDecision = 'PASS' | 'REVIEW' | 'REWRITE' | 'PROTECTED_KEEP';

export interface UniversalCraftScores {
  semanticPrecision: number;     // 1.0 - 5.0
  contextualFit: number;         // 1.0 - 5.0
  characterVoice: number;        // 1.0 - 5.0
  narrativeUtility: number;      // 1.0 - 5.0
  imageryQuality: number;        // 1.0 - 5.0
  emotionalSpecificity: number;  // 1.0 - 5.0
  memorability: number;          // 1.0 - 5.0
  craftQuality: number;          // 1.0 - 5.0 (Composite of universal dimensions)
}

export interface LanguageSpecificScores {
  naturalness: number;           // 1.0 - 5.0
  collocationFit: number;        // 1.0 - 5.0
  syntaxIntegrity: number;       // 1.0 - 5.0
  rhymeProsodyFit: number;       // 1.0 - 5.0
  clicheAvoidance: number;       // 1.0 - 5.0
  languageIntegrityScore: number;// 1.0 - 5.0
}

export interface LanguageLyricProfile {
  languageCode: string;
  languageName: string;
  isSupported: boolean;
  notes?: string;

  registerModel: {
    allowedRegisters: LexicalRegister[];
    defaultRegister: LexicalRegister;
  };

  naturalnessRules: string[];
  collocationRules: string[];
  clichePatterns: Array<{
    pattern: string;
    category: string;
    suggestedAlternativeCategory: string;
  }>;
  avoidanceRules: string[];
  rhymeProsodyGuidance: string;

  /**
   * Evaluate a single lyric line according to language-specific rules.
   */
  evaluateLanguageSpecifics: (
    line: string,
    sectionType: string,
    context: {
      story?: string;
      genres?: string[];
      moods?: string[];
      characterVoice?: string;
      targetContentLanguage?: string;
    }
  ) => {
    scores: LanguageSpecificScores;
    issues: CraftIssue[];
  };
}
