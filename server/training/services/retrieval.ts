import {
  GoodLyricExemplar,
  BadLyricExemplar,
  LyricCorrectionPair,
  AvoidanceRuleEntry,
  PersonaProfile,
  GenreLanguageProfile,
  LyricGenreKey,
  SectionType,
} from '../types';
import { datasetLoader } from '../loaders/datasetLoader';

export interface RetrievalParams {
  language?: string;
  customLanguage?: string;
  genres?: string[];
  genre?: string;
  moods?: string[];
  mood?: string;
  persona?: string;
  personaKey?: string;
  sectionType?: SectionType | string;
  songwritingStyle?: string;
  pointOfView?: string;
  lexicalContext?: any;
  story?: string;
}

export interface RetrievedTrainingContext {
  targetLanguage: string;
  isTargetThai: boolean;
  isTargetEnglish: boolean;
  genreKey?: LyricGenreKey;
  personaProfile?: PersonaProfile;
  genreProfile?: GenreLanguageProfile;
  goodExemplars: GoodLyricExemplar[];
  badExemplars: BadLyricExemplar[];
  correctionPairs: LyricCorrectionPair[];
  relevantAvoidanceRules: AvoidanceRuleEntry[];
  promptGuidanceBlock: string;
  hasData: boolean;
}

/**
 * Maps arbitrary user/preset genre input strings to standardized LyricGenreKey
 */
export function normalizeGenreKey(
  genresInput?: string[] | string,
  targetLanguage?: string
): LyricGenreKey {
  const isEnglish =
    targetLanguage?.toLowerCase() === 'english' ||
    targetLanguage?.toLowerCase() === 'en';

  if (isEnglish) {
    return 'English Pop';
  }

  const rawGenres: string[] = Array.isArray(genresInput)
    ? genresInput
    : typeof genresInput === 'string'
    ? [genresInput]
    : [];

  const combined = rawGenres.join(' ').toLowerCase();

  if (combined.includes('country') || combined.includes('folk') || combined.includes('เพื่อชีวิต')) {
    return 'Country / Folk';
  }
  if (combined.includes('ลูกทุ่ง') || combined.includes('lukthung')) {
    return 'Lukthung';
  }
  if (combined.includes('r&b') || combined.includes('soul') || combined.includes('rnb') || combined.includes('neo-soul')) {
    return 'R&B / Soul';
  }
  if (combined.includes('hip-hop') || combined.includes('rap') || combined.includes('hiphop') || combined.includes('trap')) {
    return 'Hip-Hop / Rap';
  }
  if (combined.includes('indie') || combined.includes('อินดี้') || combined.includes('dream pop')) {
    return 'Indie / Pop';
  }
  if (combined.includes('rock') || combined.includes('ร็อก') || combined.includes('metal')) {
    return 'Rock';
  }
  if (combined.includes('city pop') || combined.includes('citypop')) {
    return 'City Pop';
  }
  if (combined.includes('english pop') || combined.includes('english')) {
    return 'English Pop';
  }

  return 'Pop';
}

/**
 * Normalizes section name string to SectionType
 */
export function normalizeSectionType(section?: string): SectionType | undefined {
  if (!section) return undefined;
  const s = section.toLowerCase();
  if (s.includes('intro')) return 'Intro';
  if (s.includes('verse')) return 'Verse';
  if (s.includes('pre-chorus') || s.includes('pre chorus')) return 'Pre-Chorus';
  if (s.includes('chorus') && !s.includes('pre')) return 'Chorus';
  if (s.includes('hook')) return 'Hook';
  if (s.includes('bridge')) return 'Bridge';
  if (s.includes('outro')) return 'Outro';
  return undefined;
}

/**
 * Context-Aware Few-Shot Retrieval Function
 * Retrieves relevant exemplars, correction pairs, and avoidance rules with strict language isolation.
 */
export function retrieveTrainingContext(params: RetrievalParams): RetrievedTrainingContext {
  const targetLanguage = params.language || 'ไทย';
  const isTargetEnglish =
    targetLanguage.toLowerCase() === 'english' ||
    params.customLanguage?.toLowerCase() === 'english';
  const isTargetThai = !isTargetEnglish && (targetLanguage === 'ไทย' || targetLanguage.toLowerCase().includes('thai'));

  const genreKey = normalizeGenreKey(params.genres || params.genre, targetLanguage);
  const normalizedSection = normalizeSectionType(params.sectionType);

  const bundle = datasetLoader.getBundle();

  // 1. Language Filtered Pool
  let goodPool = bundle.goodExemplars;
  let badPool = bundle.badExemplars;
  let pairPool = bundle.correctionPairs;
  let rulePool = bundle.avoidanceRules;

  if (isTargetEnglish) {
    goodPool = goodPool.filter((g) => g.genre === 'English Pop');
    badPool = badPool.filter((b) => b.genre === 'English Pop');
    pairPool = pairPool.filter((p) => p.context.genre === 'English Pop');
    rulePool = rulePool.filter((r) => r.contextConditions.genres?.includes('English Pop') || r.tier === 'HARD_BLOCK');
  } else {
    // Thai and other languages: strictly exclude English Pop
    goodPool = goodPool.filter((g) => g.genre !== 'English Pop');
    badPool = badPool.filter((b) => b.genre !== 'English Pop');
    pairPool = pairPool.filter((p) => p.context.genre !== 'English Pop');
  }

  // 2. Score and Rank Good Exemplars (2 to 4 max)
  const scoredGood = goodPool.map((item) => {
    let score = 0;
    if (item.genre === genreKey) score += 10;
    if (normalizedSection) {
      if (item.sectionType === normalizedSection) {
        score += 6;
      } else if ((normalizedSection === 'Chorus' && item.sectionType === 'Hook') || (normalizedSection === 'Hook' && item.sectionType === 'Chorus')) {
        score += 5;
      }
    }
    if (params.personaKey && item.personaKey === params.personaKey) score += 4;
    return { item, score };
  });
  scoredGood.sort((a, b) => b.score - a.score);
  const selectedGood = scoredGood.slice(0, 3).map((s) => s.item);

  // 3. Score and Rank Bad Exemplars (1 to 3 max)
  const scoredBad = badPool.map((item) => {
    let score = 0;
    if (item.genre === genreKey) score += 10;
    if (normalizedSection && item.sectionType === normalizedSection) score += 4;
    return { item, score };
  });
  scoredBad.sort((a, b) => b.score - a.score);
  const selectedBad = scoredBad.slice(0, 2).map((s) => s.item);

  // 4. Score and Rank Correction Pairs (1 to 3 max)
  const scoredPairs = pairPool.map((item) => {
    let score = 0;
    if (item.context.genre === genreKey) score += 10;
    if (normalizedSection && item.context.section === normalizedSection) score += 5;
    if (params.personaKey && item.context.personaKey === params.personaKey) score += 4;
    return { item, score };
  });
  scoredPairs.sort((a, b) => b.score - a.score);
  const selectedPairs = scoredPairs.slice(0, 2).map((s) => s.item);

  // 5. Relevant Avoidance Rules (Contextual & Section-Aware)
  const selectedRules = rulePool.filter((rule) => {
    if (rule.tier === 'HARD_BLOCK') return false; // Handled in core safety

    // Genre matching
    if (rule.contextConditions.genres && rule.contextConditions.genres.length > 0) {
      if (!rule.contextConditions.genres.includes(genreKey)) return false;
    }

    // Section matching (e.g. Mechanical tool dumping only banned in Chorus/Hook/Bridge)
    if (rule.contextConditions.sections && rule.contextConditions.sections.length > 0) {
      if (!normalizedSection || !rule.contextConditions.sections.includes(normalizedSection)) {
        return false;
      }
    }

    return true;
  }).slice(0, 4);

  // Profiles
  const genreProfile = datasetLoader.getGenreProfile(genreKey);
  const personaProfile = params.personaKey ? datasetLoader.getPersonaProfile(params.personaKey) : undefined;

  const hasData =
    selectedGood.length > 0 ||
    selectedBad.length > 0 ||
    selectedPairs.length > 0 ||
    selectedRules.length > 0;

  // Format Prompt Guidance Block
  const promptGuidanceBlock = formatPromptGuidance({
    isTargetEnglish,
    genreKey,
    goodExemplars: selectedGood,
    badExemplars: selectedBad,
    correctionPairs: selectedPairs,
    avoidanceRules: selectedRules,
    genreProfile,
    personaProfile,
  });

  return {
    targetLanguage,
    isTargetThai,
    isTargetEnglish,
    genreKey,
    personaProfile,
    genreProfile,
    goodExemplars: selectedGood,
    badExemplars: selectedBad,
    correctionPairs: selectedPairs,
    relevantAvoidanceRules: selectedRules,
    promptGuidanceBlock,
    hasData,
  };
}

/**
 * Formats retrieved exemplars and rules into a structured, low-noise prompt block.
 */
function formatPromptGuidance(data: {
  isTargetEnglish: boolean;
  genreKey: LyricGenreKey;
  goodExemplars: GoodLyricExemplar[];
  badExemplars: BadLyricExemplar[];
  correctionPairs: LyricCorrectionPair[];
  avoidanceRules: AvoidanceRuleEntry[];
  genreProfile?: GenreLanguageProfile;
  personaProfile?: PersonaProfile;
}): string {
  const { isTargetEnglish, genreKey, goodExemplars, correctionPairs, avoidanceRules, genreProfile } = data;

  if (goodExemplars.length === 0 && correctionPairs.length === 0 && avoidanceRules.length === 0) {
    return '';
  }

  const lines: string[] = [];

  if (isTargetEnglish) {
    lines.push(`=== FEW-SHOT CRAFTSMANSHIP & BEHAVIOR GUIDANCE (${genreKey}) ===`);
    lines.push(
      `[CRITICAL INSTRUCTION: Learn phrasing rhythm, concrete imagery pacing, and natural character voice from the examples below. DO NOT copy phrases, hook lines, or specific words directly.]`
    );

    if (goodExemplars.length > 0) {
      lines.push(`\n[GOOD EXEMPLARS - Natural Singable Phrasing]:`);
      goodExemplars.forEach((ex, idx) => {
        lines.push(`• Example ${idx + 1} (${ex.sectionType}):`);
        ex.lines.forEach((l) => lines.push(`  "${l}"`));
        lines.push(`  Craft Insight: ${ex.whyItWorks.characterConsistency} (${ex.whyItWorks.singabilityPacing})`);
      });
    }

    if (correctionPairs.length > 0) {
      lines.push(`\n[CORRECTION PAIR - Transforming Generic Cliché to Concrete Detail]:`);
      correctionPairs.forEach((pair) => {
        lines.push(`• Flawed / Cliché: "${pair.originalFlawed}"`);
        lines.push(`  Diagnosis: ${pair.diagnosis}`);
        lines.push(`  Natural Refinement: "${pair.correctedNatural}"`);
        lines.push(`  Technique: ${pair.improvementTechnique}`);
      });
    }

    if (avoidanceRules.length > 0) {
      lines.push(`\n[AVOIDANCE CONSTRAINTS]:`);
      avoidanceRules.forEach((rule) => {
        lines.push(`• Avoid: "${rule.termOrPhrase}" -> Reason: ${rule.reason}`);
        if (rule.suggestedAlternatives.length > 0) {
          lines.push(`  Alternatives: ${rule.suggestedAlternatives.join(', ')}`);
        }
      });
    }
  } else {
    // Thai Guidance
    lines.push(`=== FEW-SHOT CRAFTSMANSHIP & BEHAVIOR GUIDANCE (${genreKey}) ===`);
    lines.push(
      `[คำสั่งกำกับสำคัญ: ศึกษาตัวอย่างเพื่อทำความเข้าใจลักษณะการจัดวางจังหวะคำ (cadence), น้ำเสียงตัวละคร (character voice), และการใช้ภาพรูปธรรม (concrete imagery) เท่านั้น ห้ามคัดลอกคำ วลี ท่อนฮุก หรือประโยคจากตัวอย่างโดยเด็ดขาด]`
    );

    if (genreProfile) {
      lines.push(`\n[GENRE LANGUAGE CHARACTERISTICS - ${genreProfile.displayName}]:`);
      lines.push(`- การดำเนินเรื่อง: ${genreProfile.narrativePacing}`);
      lines.push(`- สัมผัสและจังหวะ: ${genreProfile.rhymeDensityPreference}`);
      if (genreProfile.recommendedVerbs.length > 0) {
        lines.push(`- กริยารูปธรรมที่แนะนำ: ${genreProfile.recommendedVerbs.slice(0, 6).join(', ')}`);
      }
    }

    if (goodExemplars.length > 0) {
      lines.push(`\n[GOOD EXEMPLARS - ตัวอย่างวรรคทองและการวางจังหวะภาษาที่ถูกต้อง]:`);
      goodExemplars.forEach((ex, idx) => {
        lines.push(`• ตัวอย่างที่ ${idx + 1} [${ex.sectionType}] (${ex.personaVoice}):`);
        ex.lines.forEach((l) => lines.push(`  "${l}"`));
        lines.push(`  เหตุผลที่ได้ผล: ${ex.whyItWorks.characterConsistency} (${ex.whyItWorks.singabilityPacing})`);
      });
    }

    if (correctionPairs.length > 0) {
      lines.push(`\n[CORRECTION PAIRS - ตัวอย่างการแก้ปัญหาภาษาห้วน/ประดิษฐ์/Cliché เป็นภาษาเพลงจริง]:`);
      correctionPairs.forEach((pair) => {
        lines.push(`• ประโยคที่มีปัญหา: "${pair.originalFlawed}"`);
        lines.push(`  การวินิจฉัย: ${pair.diagnosis}`);
        lines.push(`  ประโยคที่ขัดเกลาแล้ว: "${pair.correctedNatural}"`);
        lines.push(`  เทคนิคที่ใช้: ${pair.improvementTechnique}`);
      });
    }

    if (avoidanceRules.length > 0) {
      lines.push(`\n[CONTEXTUAL AVOIDANCE - ข้อควรระวังและสำนวนที่ต้องหลีกเลี่ยงสำหรับ ${genreKey}]:`);
      avoidanceRules.forEach((rule) => {
        lines.push(`• เลี่ยง: "${rule.termOrPhrase}" -> เหตุผล: ${rule.reason}`);
        if (rule.suggestedAlternatives.length > 0) {
          lines.push(`  คำทดแทนที่แนะนำ: ${rule.suggestedAlternatives.join(', ')}`);
        }
      });
    }
  }

  return lines.join('\n');
}