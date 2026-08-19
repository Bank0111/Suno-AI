import { LanguageLyricProfile, LanguageSpecificScores, CraftIssue } from './types';

/**
 * Creates a fallback generic lyric profile for any language lacking dedicated rules.
 * Enforces Phase 5.7 universal quality gates (anti-prose and universal length balance).
 */
export function createGenericLyricProfile(targetLanguage: string): LanguageLyricProfile {
  const cleanLang = (targetLanguage || 'Universal').trim();
  const langCode = cleanLang.toLowerCase().slice(0, 5);

  return {
    languageCode: langCode,
    languageName: cleanLang,
    isSupported: false,
    notes: `Language-specific lexical quality profile unavailable for "${cleanLang}". Operating in Generic Language Mode (Universal Craft Evaluation Only).`,

    registerModel: {
      allowedRegisters: ['spoken', 'conversational', 'neutral', 'poetic', 'literary'],
      defaultRegister: 'neutral',
    },

    naturalnessRules: [
      'Maintain natural language flow according to target language grammatical conventions.',
      'Avoid machine-translation artifacts, robotic sentence structures, or unnatural syntax.',
      'Ensure 1 line represents 1 singable phrase with balanced phrasing.',
    ],

    collocationRules: [
      'Avoid unidiomatic phrasing, synthetic vocabulary combinations, or awkward literal translations.',
    ],

    clichePatterns: [],

    avoidanceRules: [
      'Do not force Thai or English specific rhyme constraints onto this language.',
      'Avoid academic jargon, clinical reporting, or overly dense prose phrases.',
      'Avoid mechanical or tool listing dumps in chorus and hook sections.',
    ],

    rhymeProsodyGuidance: 'Follow native prosody, syllable stress, and natural rhythm conventions for this language.',

    evaluateLanguageSpecifics: (line, sectionType, context) => {
      const trimmed = line.trim();
      const issues: CraftIssue[] = [];

      let naturalness = 4.8;
      let collocationFit = 4.8;
      let syntaxIntegrity = 4.8;
      let rhymeProsodyFit = 4.8;
      let clicheAvoidance = 4.8;
      let languageIntegrityScore = 5.0;

      // 1. Line Length / Overcrowding Sanity Check
      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length > 14) {
        naturalness -= 1.5;
        syntaxIntegrity -= 1.0;
        issues.push({
          type: 'overcrowded-meter',
          severity: 'warning',
          diagnosis: `Line contains ${words.length} words, which may overcrowd the musical bar in ${cleanLang}.`,
          evidence: trimmed,
          suggestedAction: 'Trim or split into two natural singable phrases.',
          strategy: 'improve_conversational_authenticity',
        });
      }

      // 2. Pure Punctuation / Empty Artifact Check
      if (/^[.,!?;:\-–—\s]+$/.test(trimmed)) {
        languageIntegrityScore -= 3.0;
        issues.push({
          type: 'formatting-artifact',
          severity: 'critical',
          diagnosis: 'Detected punctuation-only line artifact.',
          evidence: trimmed,
          suggestedAction: 'Provide meaningful lyrical content or remove line.',
          strategy: 'improve_conversational_authenticity',
        });
      }

      const scores: LanguageSpecificScores = {
        naturalness: Math.max(1.0, Math.min(5.0, naturalness)),
        collocationFit: Math.max(1.0, Math.min(5.0, collocationFit)),
        syntaxIntegrity: Math.max(1.0, Math.min(5.0, syntaxIntegrity)),
        rhymeProsodyFit: Math.max(1.0, Math.min(5.0, rhymeProsodyFit)),
        clicheAvoidance: Math.max(1.0, Math.min(5.0, clicheAvoidance)),
        languageIntegrityScore: Math.max(1.0, Math.min(5.0, languageIntegrityScore)),
      };

      return { scores, issues };
    },
  };
}