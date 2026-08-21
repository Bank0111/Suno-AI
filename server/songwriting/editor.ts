import { GoogleGenAI } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import {
  LanguageLyricProfile,
  UniversalCraftScores,
  LanguageSpecificScores,
  CraftIssue,
  CraftStrategyType,
  EditorLineDecision,
} from './profiles/types';
import { getLanguageProfile } from './profiles';
import { buildLexicalContextVector } from '../vocabulary/contextVector';
import { determineEvidenceTier, evaluateGenericnessAndSpecificity, evaluateNarrativeUtility } from '../vocabulary/ranker';

export interface LineCraftAssessment {
  lineIndex: number;
  sectionIndex: number;
  sectionType: string;
  originalText: string;
  status: EditorLineDecision;
  universalScores: UniversalCraftScores;
  languageScores: LanguageSpecificScores;
  issues: CraftIssue[];
  rewriteRecommendation?: {
    reason: string;
    strategy: CraftStrategyType;
    suggestedDirection?: string;
  };
  isProtected: boolean;
  selectedText?: string;
}

export interface SectionCraftAssessment {
  sectionIndex: number;
  sectionType: string;
  lines: LineCraftAssessment[];
  sectionStatus: 'PASS' | 'REVIEW' | 'REWRITE';
  sectionCraftScore: number;
}

export interface LyricCraftEditorialReport {
  language: string;
  languageProfileUsed: string;
  isLanguageProfileAvailable: boolean;
  overallStatus: 'PASS' | 'REVIEW' | 'REWRITE';
  overallCraftScore: number; // 1.0 - 5.0
  sections: SectionCraftAssessment[];
  totalLinesEvaluated: number;
  linesKeptOriginal: number;
  linesReviewed: number;
  linesRewritten: number;
  universalSummary: UniversalCraftScores;
  languageSummary: LanguageSpecificScores;
  timestamp: string;
}

export interface LyricCraftExecutionResult {
  updatedSections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>;
  report: LyricCraftEditorialReport;
}

/**
 * Section-specific craft weighting and purpose guidelines (Genre-Aware).
 */
interface SectionCraftExpectation {
  primaryGoal: string;
  expectedTension: string;
  specificityWeight: number;
  memorabilityWeight: number;
  narrativeWeight: number;
}

function getSectionExpectation(sectionType: string, genre: string = ''): SectionCraftExpectation {
  const norm = sectionType.toLowerCase();
  const gNorm = genre.toLowerCase();
  const isEDMOrDance = gNorm.includes('edm') || gNorm.includes('dance') || gNorm.includes('house');

  if (norm.includes('verse')) {
    return {
      primaryGoal: 'Storytelling, concrete sensory anchoring, and progression',
      expectedTension: 'Moderate / Grounded scene setup',
      specificityWeight: isEDMOrDance ? 1.0 : 1.3,
      memorabilityWeight: 0.9,
      narrativeWeight: isEDMOrDance ? 0.9 : 1.4,
    };
  }
  if (norm.includes('pre-chorus') || norm.includes('prechorus') || norm.includes('lift')) {
    return {
      primaryGoal: 'Tension build-up, emotional escalation, and dynamic transition',
      expectedTension: 'Rising / Anticipatory',
      specificityWeight: 1.0,
      memorabilityWeight: 1.1,
      narrativeWeight: 1.2,
    };
  }
  if (norm.includes('chorus') || norm.includes('hook')) {
    return {
      primaryGoal: 'Core emotional truth, universal resonance, and peak memorability',
      expectedTension: 'Peak / Direct catharsis',
      specificityWeight: 0.9,
      memorabilityWeight: 1.6,
      narrativeWeight: 0.9,
    };
  }
  if (norm.includes('bridge')) {
    return {
      primaryGoal: 'Perspective shift, critical realization, and fresh emotional contrast',
      expectedTension: 'Intense / Reflective contrast',
      specificityWeight: 1.1,
      memorabilityWeight: 1.2,
      narrativeWeight: 1.2,
    };
  }
  if (norm.includes('outro')) {
    return {
      primaryGoal: 'Emotional closure, fading sensory imagery, and lingering afterglow',
      expectedTension: 'Releasing / Atmospheric',
      specificityWeight: 1.1,
      memorabilityWeight: 1.2,
      narrativeWeight: 1.0,
    };
  }
  return {
    primaryGoal: 'General lyrical balance',
    expectedTension: 'Balanced',
    specificityWeight: 1.0,
    memorabilityWeight: 1.0,
    narrativeWeight: 1.0,
  };
}

/**
 * ดึงคำท้ายวรรคภาษาไทยเพื่อตรวจสอบคำลงท้ายซ้ำ
 */
function extractEndWord(line: string): string {
  const clean = line.replace(/[\s\.,\!\?\(\)\[\]"]/g, '').trim();
  if (!clean) return '';
  return clean.slice(-3); // เปรียบเทียบ 3 ตัวอักษรท้ายของวรรค
}

/**
 * VOCATIONAL / TOOL TERM DETECTION
 * -----------------------------------------------------------
 * IMPORTANT: This regex is used to MEASURE DENSITY, not to ban words outright.
 * A single, well-placed vocational word (e.g. "ประแจ" used once as a symbolic
 * closing image) is legitimate craft ("Vocational Detail"). Only when several
 * of these terms are clustered together in the same section with no narrative
 * function does it become "Vocational Dump". See getSectionVocationalDumpVerdict().
 */
const VOCATIONAL_TERM_REGEX = /(ประแจ|น็อต|ไขควง|คราบน้ำมัน|น้ำมันเครื่อง|ชุดเซฟตี้|หัวเทียน|สายพาน|เครื่องจักร|อู่ซ่อมรถ|แม่กุญแจ|เครื่องยนต์|อะไหล่รถ)/gi;

function countVocationalHits(text: string): number {
  const matches = text.match(VOCATIONAL_TERM_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Decide, at the SECTION level, whether repeated vocational/tool terms constitute
 * a genuine "dump" (many terms crammed in with no function) rather than a single
 * grounded detail. Chorus/Bridge get a stricter (lower) tolerance because those
 * sections are meant to carry Core Truth, not occupational inventory.
 */
function getSectionVocationalDumpVerdict(sectionVocationalHits: number, isChorusOrBridge: boolean): boolean {
  const dumpThreshold = isChorusOrBridge ? 2 : 3;
  return sectionVocationalHits >= dumpThreshold;
}

/**
 * Universal Line-Level Craft Evaluator
 */
function evaluateUniversalLineCraft(
  line: string,
  sectionType: string,
  context: BuiltCreativeContext,
  languageProfile: LanguageLyricProfile,
  sectionVocationalHits: number = 0
): { scores: UniversalCraftScores; issues: CraftIssue[]; recommendedStrategy: CraftStrategyType; reason: string } {
  const trimmed = line.trim();
  const issues: CraftIssue[] = [];
  const expectation = getSectionExpectation(sectionType, context.genresStr);

  // Baseline scores (5.0 scale)
  let semanticPrecision = 4.8;
  let contextualFit = 4.8;
  let characterVoice = 4.8;
  let narrativeUtility = 4.7;
  let imageryQuality = 4.7;
  let emotionalSpecificity = 4.6;
  let memorability = 4.6;

  let recommendedStrategy: CraftStrategyType = 'preserve_original';
  let reason = 'Line demonstrates strong craft, naturalness, and narrative grounding.';

  const isThai = languageProfile.languageCode === 'th';
  const isChorusOrBridge = sectionType.toLowerCase().includes('chorus') || sectionType.toLowerCase().includes('bridge');

  // 1. Vocational Detail vs Vocational Dump (density-based, NOT a single-word ban)
  //    A lone, functional occupational word is legitimate craft. Only a genuine
  //    cluster of such terms in one section is penalized as critical.
  const vocationalHitsInLine = countVocationalHits(trimmed);
  if (vocationalHitsInLine > 0) {
    const isDump = getSectionVocationalDumpVerdict(sectionVocationalHits, isChorusOrBridge);

    if (isDump) {
      contextualFit -= 2.2;
      emotionalSpecificity -= 1.6;
      issues.push({
        type: 'inappropriate-vocational-dump',
        severity: 'critical',
        diagnosis: `ท่อน ${sectionType} มีคำศัพท์เฉพาะอาชีพ/อุปกรณ์ปรากฏรวมกัน ${sectionVocationalHits} ครั้งในท่อนเดียวกัน เข้าข่าย Vocational Dump (ยัดศัพท์เพื่อให้ Story ดูตรง) ไม่ใช่รายละเอียดที่มีหน้าที่จริง`,
        evidence: trimmed,
        suggestedAction: 'เก็บไว้เพียง 1 คำที่มีความหมายเชิงภาพ/สัญลักษณ์ชัดเจนที่สุด แล้วเปลี่ยนคำอื่นเป็นอารมณ์หรือการกระทำแทน',
        strategy: 'reduce_decoration',
      });
      recommendedStrategy = 'reduce_decoration';
      reason = `Vocational dump detected: ${sectionVocationalHits} occupational terms clustered in ${sectionType}.`;
    } else if (isChorusOrBridge) {
      // Single/occasional vocational detail in Chorus/Bridge: nudge gently, but let the
      // evidence-tier grounding check below make the real call instead of forcing a rewrite.
      contextualFit -= 0.3;
    }
  }

  // 2. Scene & Contextual Grounding via Evidence Tier
  if (isThai) {
    const songConfigForVector = {
      story: context.story,
      genres: context.allGenres || [],
      moods: context.allMoods || [],
      songwritingStyle: context.songwritingStyleStr || '',
      wordTone: context.wordToneStr || '',
      languageStyle: context.languageStyleStr || '',
      language: context.targetContentLanguage || 'ไทย',
      bpm: Number(context.bpmStr) || 100,
      vocal: context.vocalStr || '',
      rhythm: context.rhythmStr || '',
      structure: context.structureStr || '',
    };
    const vector = buildLexicalContextVector(songConfigForVector as any);
    const tier = determineEvidenceTier(trimmed, vector);
    const utility = evaluateNarrativeUtility(trimmed, undefined, vector, tier);
    const genericness = evaluateGenericnessAndSpecificity(trimmed, vector, tier);

    narrativeUtility = Math.max(1.0, utility.narrativeUtility * 5.0);
    imageryQuality = Math.max(1.0, genericness.specificityScore * 5.0);
    emotionalSpecificity = Math.max(1.0, (1.0 - genericness.genericnessRisk) * 5.0 + 1.0);

    if (tier === 'TIER_3_GENRE_DECORATION' && utility.narrativeUtility < 0.35) {
      contextualFit -= 1.8;
      imageryQuality -= 1.5;
      issues.push({
        type: 'unsupported-genre-decoration',
        severity: 'warning',
        diagnosis: `Line contains ungrounded genre decoration (${utility.reason})`,
        evidence: trimmed,
        suggestedAction: 'Replace decorative object with concrete story action or emotional anchor.',
        strategy: 'reduce_decoration',
      });
      if (recommendedStrategy === 'preserve_original') {
        recommendedStrategy = 'reduce_decoration';
        reason = 'Contains decorative trope not grounded in user story facts.';
      }
    }

    if (genericness.genericnessRisk >= 0.6) {
      emotionalSpecificity -= 1.8;
      memorability -= 1.2;
      issues.push({
        type: 'generic-emotional-filler',
        severity: 'warning',
        diagnosis: `Line is overly generic/flat: ${genericness.reason}`,
        evidence: trimmed,
        suggestedAction: 'Elevate with personal story specificity.',
        strategy: 'replace_generic_emotion',
      });
      if (recommendedStrategy === 'preserve_original') {
        recommendedStrategy = 'replace_generic_emotion';
        reason = 'Generic emotional statement lacking distinct song identity.';
      }
    }
  } else {
    // English Generic Phrase Detection
    const lower = trimmed.toLowerCase();
    const genericEnglishPhrases = [
      'i miss you so much',
      'thinking of you all night',
      'love you forever',
      'nothing feels the same',
      'sitting in the dark',
      'tears in my eyes',
      'can\'t get you out of my head',
      'time goes by so slow',
    ];

    for (const gep of genericEnglishPhrases) {
      if (lower.includes(gep)) {
        emotionalSpecificity -= 1.5;
        memorability -= 1.2;
        issues.push({
          type: 'generic-emotional-filler',
          severity: 'warning',
          diagnosis: `Line uses standard generic filler phrase ("${gep}")`,
          evidence: gep,
          suggestedAction: 'Replace with specific situational action or distinct sensory observation.',
          strategy: 'replace_generic_emotion',
        });
        recommendedStrategy = 'replace_generic_emotion';
        reason = 'Formulaic emotional phrase lacking distinct situational imagery.';
        break;
      }
    }
  }

  // Calculate Weighted Universal Craft Quality
  const craftQuality = Number(
    (
      (semanticPrecision * 1.0 +
        contextualFit * 1.1 +
        characterVoice * 1.1 +
        narrativeUtility * expectation.narrativeWeight +
        imageryQuality * expectation.specificityWeight +
        emotionalSpecificity * 1.1 +
        memorability * expectation.memorabilityWeight) /
      (1.0 + 1.1 + 1.1 + expectation.narrativeWeight + expectation.specificityWeight + 1.1 + expectation.memorabilityWeight)
    ).toFixed(2)
  );

  const scores: UniversalCraftScores = {
    semanticPrecision: Number(Math.max(1.0, Math.min(5.0, semanticPrecision)).toFixed(1)),
    contextualFit: Number(Math.max(1.0, Math.min(5.0, contextualFit)).toFixed(1)),
    characterVoice: Number(Math.max(1.0, Math.min(5.0, characterVoice)).toFixed(1)),
    narrativeUtility: Number(Math.max(1.0, Math.min(5.0, narrativeUtility)).toFixed(1)),
    imageryQuality: Number(Math.max(1.0, Math.min(5.0, imageryQuality)).toFixed(1)),
    emotionalSpecificity: Number(Math.max(1.0, Math.min(5.0, emotionalSpecificity)).toFixed(1)),
    memorability: Number(Math.max(1.0, Math.min(5.0, memorability)).toFixed(1)),
    craftQuality: Number(Math.max(1.0, Math.min(5.0, craftQuality)).toFixed(2)),
  };

  return { scores, issues, recommendedStrategy, reason };
}

/**
 * Execute the Language-Agnostic Lyric Craft Editorial Pass
 */
export async function executeLyricCraftEditorialPass(
  draft: { sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> },
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: { protectedHookLines?: string[] } = {}
): Promise<LyricCraftExecutionResult> {
  const targetLanguage = context.targetContentLanguage || 'ไทย';
  const languageProfile = getLanguageProfile(targetLanguage);

  console.log(`[Lyric Craft Editor] Initiating editorial pass for language: "${targetLanguage}" using profile: "${languageProfile.languageName}"`);

  const protectedSet = new Set((options.protectedHookLines || []).map((h) => h.trim().toLowerCase()));
  if (context.creativeAnalysis?.imageryAnchors) {
    context.creativeAnalysis.imageryAnchors.forEach((anchor) => protectedSet.add(anchor.trim().toLowerCase()));
  }
  if (context.creativeAnalysis?.keyMotifs) {
    context.creativeAnalysis.keyMotifs.forEach((motif) => protectedSet.add(motif.trim().toLowerCase()));
  }

  const evaluatedSections: SectionCraftAssessment[] = [];
  let totalLines = 0;
  let keptOriginal = 0;
  let reviewed = 0;
  let rewritten = 0;

  const sumUniversal: UniversalCraftScores = {
    semanticPrecision: 0,
    contextualFit: 0,
    characterVoice: 0,
    narrativeUtility: 0,
    imageryQuality: 0,
    emotionalSpecificity: 0,
    memorability: 0,
    craftQuality: 0,
  };

  const sumLanguage: LanguageSpecificScores = {
    naturalness: 0,
    collocationFit: 0,
    syntaxIntegrity: 0,
    rhymeProsodyFit: 0,
    clicheAvoidance: 0,
    languageIntegrityScore: 0,
  };

  const updatedSections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> = [];

  for (let sIdx = 0; sIdx < draft.sections.length; sIdx++) {
    const sec = draft.sections[sIdx];
    const evaluatedLines: LineCraftAssessment[] = [];
    const updatedLyrics: string[] = [];

    // นับคำลงท้ายซ้ำใน Section เดียวกัน
    const endWordFrequency = new Map<string, number>();
    (sec.lyrics || []).forEach((line) => {
      const endWord = extractEndWord(line);
      if (endWord && endWord.length >= 2) {
        endWordFrequency.set(endWord, (endWordFrequency.get(endWord) || 0) + 1);
      }
    });

    // นับความหนาแน่นของคำศัพท์เฉพาะอาชีพ/อุปกรณ์ทั้ง Section (ใช้แยก Dump vs Detail)
    const sectionVocationalHits = (sec.lyrics || []).reduce(
      (total, line) => total + countVocationalHits(line),
      0
    );

    for (let lIdx = 0; lIdx < (sec.lyrics || []).length; lIdx++) {
      const lineText = sec.lyrics[lIdx];
      totalLines++;

      const isProtected = protectedSet.has(lineText.trim().toLowerCase());

      // 1. Universal Craft Assessment
      const universalResult = evaluateUniversalLineCraft(lineText, sec.type, context, languageProfile, sectionVocationalHits);

      // 2. Language-Specific Assessment
      const languageResult = languageProfile.evaluateLanguageSpecifics(lineText, sec.type, {
        story: context.story,
        genres: context.allGenres,
        moods: context.allMoods,
        characterVoice: context.wordToneStr || context.languageStyleStr,
        targetContentLanguage: targetLanguage,
      });

      const combinedIssues = [...universalResult.issues, ...languageResult.issues];

      // 3. ตรวจจับคำลงท้ายซ้ำในระดับ Section
      const endWord = extractEndWord(lineText);
      const isRepeatedEnd = endWord && (endWordFrequency.get(endWord) || 0) > 1 && !isProtected;
      if (isRepeatedEnd) {
        combinedIssues.push({
          type: 'repetitive-end-rhyme',
          severity: 'critical',
          diagnosis: `วรรคนี้ลงท้ายด้วยเสียง "${endWord}" ซ้ำกับวรรคอื่นในท่อนเดียวกัน`,
          evidence: lineText,
          suggestedAction: 'เปลี่ยนคำลงท้ายเป็นคำสัมผัสสระอื่นเพื่อความหลากหลายของสัมผัส',
          strategy: 'increase_specificity',
        });
      }

      // Tally Scores
      Object.keys(sumUniversal).forEach((k) => {
        (sumUniversal as any)[k] += (universalResult.scores as any)[k];
      });
      Object.keys(sumLanguage).forEach((k) => {
        (sumLanguage as any)[k] += (languageResult.scores as any)[k];
      });

      // 4. Determine Line Editorial Status
      let status: EditorLineDecision = 'PASS';
      if (isProtected) {
        status = 'PROTECTED_KEEP';
        keptOriginal++;
      } else if (combinedIssues.some((i) => i.severity === 'critical')) {
        status = 'REWRITE';
        rewritten++;
      } else if (combinedIssues.length > 0 || universalResult.scores.craftQuality < 3.8) {
        status = 'REVIEW';
        reviewed++;
      } else {
        status = 'PASS';
        keptOriginal++;
      }

      const assessment: LineCraftAssessment = {
        lineIndex: lIdx,
        sectionIndex: sIdx,
        sectionType: sec.type,
        originalText: lineText,
        status,
        universalScores: universalResult.scores,
        languageScores: languageResult.scores,
        issues: combinedIssues,
        isProtected,
        selectedText: lineText,
      };

      if (status === 'REVIEW' || status === 'REWRITE') {
        assessment.rewriteRecommendation = {
          reason: isRepeatedEnd ? 'แก้คำลงท้ายซ้ำในท่อนเดียวกัน' : universalResult.reason,
          strategy: universalResult.recommendedStrategy,
          suggestedDirection: combinedIssues[0]?.suggestedAction || 'Refine line for optimal emotional precision and naturalness',
        };
      }

      evaluatedLines.push(assessment);
      updatedLyrics.push(lineText);
    }

    const secScores = evaluatedLines.map((l) => l.universalScores.craftQuality);
    const avgSecScore = secScores.length > 0 ? Number((secScores.reduce((a, b) => a + b, 0) / secScores.length).toFixed(2)) : 5.0;
    const hasRewrites = evaluatedLines.some((l) => l.status === 'REWRITE');
    const hasReviews = evaluatedLines.some((l) => l.status === 'REVIEW');

    evaluatedSections.push({
      sectionIndex: sIdx,
      sectionType: sec.type,
      lines: evaluatedLines,
      sectionStatus: hasRewrites ? 'REWRITE' : hasReviews ? 'REVIEW' : 'PASS',
      sectionCraftScore: avgSecScore,
    });

    updatedSections.push({
      ...sec,
      lyrics: updatedLyrics,
    });
  }

  // Summary Metrics
  const totalCount = Math.max(1, totalLines);
  const universalSummary: UniversalCraftScores = {
    semanticPrecision: Number((sumUniversal.semanticPrecision / totalCount).toFixed(2)),
    contextualFit: Number((sumUniversal.contextualFit / totalCount).toFixed(2)),
    characterVoice: Number((sumUniversal.characterVoice / totalCount).toFixed(2)),
    narrativeUtility: Number((sumUniversal.narrativeUtility / totalCount).toFixed(2)),
    imageryQuality: Number((sumUniversal.imageryQuality / totalCount).toFixed(2)),
    emotionalSpecificity: Number((sumUniversal.emotionalSpecificity / totalCount).toFixed(2)),
    memorability: Number((sumUniversal.memorability / totalCount).toFixed(2)),
    craftQuality: Number((sumUniversal.craftQuality / totalCount).toFixed(2)),
  };

  const languageSummary: LanguageSpecificScores = {
    naturalness: Number((sumLanguage.naturalness / totalCount).toFixed(2)),
    collocationFit: Number((sumLanguage.collocationFit / totalCount).toFixed(2)),
    syntaxIntegrity: Number((sumLanguage.syntaxIntegrity / totalCount).toFixed(2)),
    rhymeProsodyFit: Number((sumLanguage.rhymeProsodyFit / totalCount).toFixed(2)),
    clicheAvoidance: Number((sumLanguage.clicheAvoidance / totalCount).toFixed(2)),
    languageIntegrityScore: Number((sumLanguage.languageIntegrityScore / totalCount).toFixed(2)),
  };

  const overallStatus = evaluatedSections.some((s) => s.sectionStatus === 'REWRITE')
    ? 'REWRITE'
    : evaluatedSections.some((s) => s.sectionStatus === 'REVIEW')
    ? 'REVIEW'
    : 'PASS';

  const report: LyricCraftEditorialReport = {
    language: targetLanguage,
    languageProfileUsed: languageProfile.languageName,
    isLanguageProfileAvailable: languageProfile.isSupported,
    overallStatus,
    overallCraftScore: universalSummary.craftQuality,
    sections: evaluatedSections,
    totalLinesEvaluated: totalLines,
    linesKeptOriginal: keptOriginal,
    linesReviewed: reviewed,
    linesRewritten: rewritten,
    universalSummary,
    languageSummary,
    timestamp: new Date().toISOString(),
  };

  console.log(`[Lyric Craft Editor] Completed Editorial Pass. Overall Craft Score: ${report.overallCraftScore}/5.0. Status: ${report.overallStatus} (Kept: ${keptOriginal}, Reviewed: ${reviewed}, Rewritten: ${rewritten})`);

  return {
    updatedSections,
    report,
  };
}