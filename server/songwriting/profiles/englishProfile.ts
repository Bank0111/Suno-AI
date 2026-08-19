import { LanguageLyricProfile, LanguageSpecificScores, CraftIssue } from './types';

export const EnglishLyricProfile: LanguageLyricProfile = {
  languageCode: 'en',
  languageName: 'English',
  isSupported: true,
  notes: 'Standard & Conversational English songwriting rules with idiom and cliché verification (Phase 5.7 Gate Compliant)',

  registerModel: {
    allowedRegisters: ['spoken', 'conversational', 'neutral', 'poetic', 'literary'],
    defaultRegister: 'conversational',
  },

  naturalnessRules: [
    'Lines must sound like natural English speech with organic stress patterns (iambic/trochaic flow).',
    'Avoid awkward inversions or forced rhymes (e.g. "To you my heart I give").',
    'Do not mix overly archaic or Victorian poetic terms into modern pop/rock/indie styles.',
    'Keep contractions natural (e.g. "I\'m", "don\'t", "won\'t") unless formal diction is explicitly required.',
  ],

  collocationRules: [
    'Adhere to standard English verb-noun collocations (e.g. "make a mistake", not "do a mistake").',
    'Prepositional integrity: Ensure natural prepositions (e.g. "waiting on the corner", "looking in your eyes").',
  ],

  clichePatterns: [
    { pattern: 'from the bottom of my heart', category: 'generic_love', suggestedAlternativeCategory: 'specific physical cue or action' },
    { pattern: 'tears falling down like rain', category: 'generic_sadness', suggestedAlternativeCategory: 'quiet physical reaction' },
    { pattern: 'broken heart inside my chest', category: 'generic_heartbreak', suggestedAlternativeCategory: 'sensory anchor' },
    { pattern: 'can\'t live without you', category: 'generic_dependency', suggestedAlternativeCategory: 'specific memory or void' },
    { pattern: 'forever and a day', category: 'generic_eternity', suggestedAlternativeCategory: 'concrete timeline or commitment' },
    { pattern: 'every single day and night', category: 'generic_time', suggestedAlternativeCategory: 'specific time marker' },
    { pattern: 'spread my wings and fly', category: 'generic_freedom', suggestedAlternativeCategory: 'tangible departure detail' },
    { pattern: 'world is spinning around', category: 'generic_confusion', suggestedAlternativeCategory: 'concrete sensory cue' },
  ],

  avoidanceRules: [
    'Avoid rhyming basic pairs repeatedly without fresh imagery (e.g. fire/desire, love/above, heart/apart).',
    'Avoid non-English token contamination unless a bilingual genre is explicitly intended.',
    'Avoid academic, clinical, or research jargon (e.g., context, paradigm, societal structure, driving factor).',
    'Avoid narrative prose reporting phrases (e.g., and then, after that, the next step).',
    'Avoid dumping vocational tools or mechanical lists in Chorus / Hook / Bridge.',
  ],

  rhymeProsodyGuidance: 'Prefer imperfect / slant rhymes and assonance when exact rhymes force awkward syntax or cliché word choices.',

  evaluateLanguageSpecifics: (line, sectionType, context) => {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    const issues: CraftIssue[] = [];

    let naturalness = 5.0;
    let collocationFit = 5.0;
    let syntaxIntegrity = 5.0;
    let rhymeProsodyFit = 5.0;
    let clicheAvoidance = 5.0;
    let languageIntegrityScore = 5.0;

    // 1. Language Contamination Check (Non-English characters in pure English mode)
    if (/[\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(trimmed)) {
      languageIntegrityScore -= 3.0;
      issues.push({
        type: 'language-contamination',
        severity: 'critical',
        diagnosis: 'Detected foreign non-English characters in an English songwriting context.',
        evidence: trimmed,
        suggestedAction: 'Translate or rewrite into natural English.',
        strategy: 'improve_conversational_authenticity',
      });
    }

    // 2. English Clichés Check
    for (const cp of EnglishLyricProfile.clichePatterns) {
      if (lower.includes(cp.pattern.toLowerCase())) {
        clicheAvoidance -= 2.0;
        naturalness -= 0.5;
        issues.push({
          type: 'generic-emotional-filler',
          severity: 'warning',
          diagnosis: `Detected overused English cliché: "${cp.pattern}" which lacks song-specific grounding.`,
          evidence: cp.pattern,
          suggestedAction: `Ground the line in specific imagery (${cp.suggestedAlternativeCategory}).`,
          strategy: 'replace_generic_emotion',
        });
      }
    }

    // 3. Forced Inversion Detection (e.g. "my love I give to you", "so blue was the sky")
    if (/\b(to you my|my love I|so [a-z]+ was the|in the rain did I|forever will I)\b/i.test(trimmed)) {
      syntaxIntegrity -= 1.5;
      naturalness -= 1.0;
      issues.push({
        type: 'awkward-word-order',
        severity: 'warning',
        diagnosis: 'Detected archaic or inverted word order that compromises conversational authenticity.',
        evidence: trimmed,
        suggestedAction: 'Reorder words into natural modern conversational syntax.',
        strategy: 'improve_conversational_authenticity',
      });
    }

    // 4. Academic Jargon & Research Tone Check (Phase 5.7 Gate)
    const academicTerms = ['context', 'paradigm', 'societal structure', 'driving factor', 'socioeconomic', 'dimensions of'];
    for (const term of academicTerms) {
      if (lower.includes(term)) {
        naturalness -= 2.0;
        issues.push({
          type: 'academic-jargon',
          severity: 'critical',
          diagnosis: `Detected academic / research jargon: "${term}" which clashes with poetic songcraft.`,
          evidence: term,
          suggestedAction: 'Replace academic abstractions with sensory imagery and grounded human emotion.',
          strategy: 'improve_conversational_authenticity',
        });
      }
    }

    // 5. Narrative Prose Reporting Check (Phase 5.7 Gate)
    const prosePatterns = ['and then I', 'and then we', 'after that I', 'after that we', 'the next step was'];
    for (const p of prosePatterns) {
      if (lower.includes(p)) {
        naturalness -= 1.5;
        issues.push({
          type: 'narrative-prose-reporting',
          severity: 'warning',
          diagnosis: `Detected prose-like timeline reporting: "${p}".`,
          evidence: p,
          suggestedAction: 'Condense into rhythmic poetic cadence rather than diary-style reporting.',
          strategy: 'improve_conversational_authenticity',
        });
      }
    }

    // 6. Vocational Tool Dumping in Hook/Chorus (Phase 5.7 Gate)
    const isHookSection = sectionType && /^(chorus|hook|bridge)$/i.test(sectionType);
    if (isHookSection) {
      const toolTerms = ['wrench', 'bolts', 'safety gear', 'spark plug', 'socket set', 'tool belt'];
      for (const tool of toolTerms) {
        if (lower.includes(tool)) {
          naturalness -= 2.0;
          issues.push({
            type: 'vocational-dump-in-hook',
            severity: 'critical',
            diagnosis: `Detected mechanical/vocational object dumping in ${sectionType}: "${tool}".`,
            evidence: tool,
            suggestedAction: 'Reserve Hook and Chorus for universal emotional truth and relational themes.',
            strategy: 'replace_generic_emotion',
          });
        }
      }
    }

    return {
      scores: {
        naturalness: Math.max(1.0, Math.min(5.0, naturalness)),
        collocationFit: Math.max(1.0, Math.min(5.0, collocationFit)),
        syntaxIntegrity: Math.max(1.0, Math.min(5.0, syntaxIntegrity)),
        rhymeProsodyFit: Math.max(1.0, Math.min(5.0, rhymeProsodyFit)),
        clicheAvoidance: Math.max(1.0, Math.min(5.0, clicheAvoidance)),
        languageIntegrityScore: Math.max(1.0, Math.min(5.0, languageIntegrityScore)),
      },
      issues,
    };
  },
};