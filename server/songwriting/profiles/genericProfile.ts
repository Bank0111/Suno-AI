import { LanguageLyricProfile, LanguageSpecificScores, CraftIssue } from './types';

export function createGenericLyricProfile(targetLanguage: string): LanguageLyricProfile {
  return {
    languageCode: targetLanguage.toLowerCase(),
    languageName: targetLanguage,
    isSupported: false,
    notes: `Language-specific lexical quality profile unavailable for "${targetLanguage}". Operating in Generic Language Mode (Universal Craft Evaluation Only).`,

    registerModel: {
      allowedRegisters: ['spoken', 'conversational', 'neutral', 'poetic'],
      defaultRegister: 'neutral',
    },

    naturalnessRules: [
      'Maintain natural language flow according to target language grammatical conventions.',
      'Avoid machine-translation artifacts or unnatural syntax.',
    ],

    collocationRules: [
      'Avoid unidiomatic phrasing or synthetic vocabulary combinations.',
    ],

    clichePatterns: [],

    avoidanceRules: [
      'Do not apply Thai or English specific rules to this language.',
    ],

    rhymeProsodyGuidance: 'Follow native prosody and rhythm conventions for this language.',

    evaluateLanguageSpecifics: (line, sectionType, context) => {
      // Neutral baseline for generic/unsupported languages
      const scores: LanguageSpecificScores = {
        naturalness: 4.5,
        collocationFit: 4.5,
        syntaxIntegrity: 4.5,
        rhymeProsodyFit: 4.5,
        clicheAvoidance: 4.5,
        languageIntegrityScore: 4.5,
      };

      const issues: CraftIssue[] = [];
      return { scores, issues };
    },
  };
}
