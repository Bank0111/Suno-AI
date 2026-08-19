import { GoldenTestFixture } from '../types';
import {
  BenchmarkMetrics,
  CriticalFailureFlag,
  MetricEvaluationEvidence,
} from './types';

/**
 * Blind Automated Evaluator
 * Evaluates anonymized lyric samples against Golden Test Fixture criteria
 * using linguistic rules, failure flag detectors, and theme coverage metrics.
 */
export function evaluateBlindedLyrics(
  lyrics: string[],
  fixture: GoldenTestFixture,
  sampleLabel: string = 'Sample'
): { metrics: BenchmarkMetrics; evidence: MetricEvaluationEvidence } {
  const fullText = lyrics.join(' ');
  const lowerText = fullText.toLowerCase();

  const detectedFailures: CriticalFailureFlag[] = [];
  const failureDetails: string[] = [];
  const passedChecks: string[] = [];

  // ==========================================
  // 1. Critical Failure Flag Detection
  // ==========================================

  // (a) Language Contamination
  if (fixture.targetLanguage === 'English') {
    const hasThaiScript = /[\u0E00-\u0E7F]/.test(fullText);
    if (hasThaiScript) {
      detectedFailures.push('language-contamination');
      failureDetails.push(`[${sampleLabel}] Detected Thai script in English Pop lyric.`);
    } else {
      passedChecks.push(`[${sampleLabel}] Strict English language isolation confirmed (0 Thai script contamination).`);
    }
  }

  // (b) Robotic Metaphors & Math Terms
  const roboticTerms = ['คูณสอง', 'บวกหนึ่ง', 'เปอร์เซ็นต์', 'อัลกอริทึม', 'ดาวน์โหลด', 'สูตรคูณ', '100%'];
  const foundRobotic = roboticTerms.filter((term) => fullText.includes(term));
  if (foundRobotic.length > 0) {
    detectedFailures.push('robotic-metaphor');
    failureDetails.push(`[${sampleLabel}] Found robotic/math metaphor: "${foundRobotic.join(', ')}"`);
  }

  // (c) Persona Break & Archaic Register Mismatch
  const archaicTerms = ['ข้าพเจ้า', 'สุริยัน', 'นภา', 'ภิรมย์', 'นฤมิต', 'ธารกำนัล', 'ดวงฤทัย', 'ดาวดึงส์', 'สุรีย์'];
  if (fixture.id === 'golden-test-hiphop' || fixture.id === 'golden-test-country-folk') {
    const foundArchaic = archaicTerms.filter((term) => fullText.includes(term));
    if (foundArchaic.length > 0) {
      detectedFailures.push('persona-break');
      failureDetails.push(`[${sampleLabel}] Persona break: Archaic/formal term used in ${fixture.config.genre}: "${foundArchaic.join(', ')}"`);
    }
  }

  // (d) Awkward Collocations & Filler Lines
  const awkwardTerms = ['วิ่งแส่', 'ใจมันพองโตขึ้นมา', 'กอดเสาเถียง'];
  const foundAwkward = awkwardTerms.filter((term) => fullText.includes(term));
  if (foundAwkward.length > 0) {
    detectedFailures.push('awkward-collocation');
    failureDetails.push(`[${sampleLabel}] Awkward collocation/filler: "${foundAwkward.join(', ')}"`);
  }

  // (e) Generic Emotional Filler & Cliché Overload
  const genericFillers = [
    'น้ำตารินไหลอาบแก้ม',
    'รักเธอสุดหัวใจ',
    'คิดถึงเธอสุดหัวใจ',
    'ขาดเธอไม่ได้',
    'รอวันเธอกลับมา',
    'ใจดวงน้อย',
    'โลกมืดมน',
    'ใจยังเหมือนเดิม',
    'bottom of my heart',
    'tears falling down like waterfalls',
    'miss you with all my heart',
  ];
  const foundGenericFillers = genericFillers.filter((c) => fullText.includes(c) || lowerText.includes(c.toLowerCase()));
  if (foundGenericFillers.length > 0) {
    detectedFailures.push('generic-emotional-filler');
    failureDetails.push(`[${sampleLabel}] Generic emotional filler detected: "${foundGenericFillers.join(', ')}"`);
  }

  // (f) Unsupported Genre Decoration
  const genreDecorations = ['พญานาค', 'เตาฟืน', 'ควายเฒ่า'];
  const foundUnsupportedDecorations = genreDecorations.filter((w) => {
    const inFixture = (fixture.config.story || '').includes(w) || fixture.expectedLexicalBehavior.mustIncludeSemanticThemes.includes(w);
    return !inFixture && fullText.includes(w);
  });
  if (foundUnsupportedDecorations.length > 0) {
    detectedFailures.push('unsupported-genre-decoration');
    failureDetails.push(`[${sampleLabel}] Unsupported genre decoration without story ground: "${foundUnsupportedDecorations.join(', ')}"`);
  }

  // (g) Narrative Prose Reporting (Phase 5.7)
  const proseReportingPhrases = ['จากนั้นก็เดิน', 'แล้วจึงหยิบ', 'ขั้นตอนต่อไป', 'ลำดับแรก'];
  const foundProse = proseReportingPhrases.filter((p) => fullText.includes(p));
  if (foundProse.length > 0) {
    detectedFailures.push('narrative-prose-reporting');
    failureDetails.push(`[${sampleLabel}] Narrative prose reporting detected: "${foundProse.join(', ')}"`);
  }

  // (h) Emotional Over-Explanation (Phase 5.7)
  const overExplanationPhrases = ['ทำให้ฉันรู้สึกเศร้า', 'บอกตรงๆ ว่าเหงาใจ', 'อธิบายความเจ็บ'];
  const foundOverExplanation = overExplanationPhrases.filter((p) => fullText.includes(p));
  if (foundOverExplanation.length > 0) {
    detectedFailures.push('emotional-over-explanation');
    failureDetails.push(`[${sampleLabel}] Emotional over-explanation detected: "${foundOverExplanation.join(', ')}"`);
  }

  // (i) Forced Rhyme & Phrasing Bloat
  let rhythmStumbles = 0;
  lyrics.forEach((line) => {
    const words = line.trim().split(/\s+/);
    if (line.length > 75 || words.length > 18) {
      rhythmStumbles++;
      failureDetails.push(`[${sampleLabel}] Line excessive cadence length (>75 chars): "${line.slice(0, 32)}..."`);
    }
  });
  if (rhythmStumbles > 0) {
    detectedFailures.push('forced-rhyme');
  }

  // (j) Repeated Ideas / Section Redundancy
  const uniqueLines = new Set(lyrics.map((l) => l.trim().toLowerCase()));
  if (lyrics.length > 3 && uniqueLines.size < lyrics.length - 1) {
    detectedFailures.push('repeated-idea');
    failureDetails.push(`[${sampleLabel}] Detected repetitive phrasing without dynamic progression.`);
  }

  // Check specific avoidance patterns from fixture
  fixture.expectedLexicalBehavior.mustAvoidPatterns.forEach((avoid) => {
    if (avoid !== 'Thai script' && (fullText.includes(avoid) || lowerText.includes(avoid.toLowerCase()))) {
      if (!failureDetails.some((d) => d.includes(avoid))) {
        failureDetails.push(`[${sampleLabel}] Used fixture-avoided pattern: "${avoid}"`);
      }
    }
  });

  // ==========================================
  // 2. Semantic Theme Coverage (Lexical Fit)
  // ==========================================
  let matchedThemesCount = 0;
  const targetThemes = fixture.expectedLexicalBehavior.mustIncludeSemanticThemes;

  targetThemes.forEach((theme) => {
    const isThemePresent =
      fullText.includes(theme) ||
      lowerText.includes(theme.toLowerCase()) ||
      hasSemanticConcept(fullText, lowerText, theme);

    if (isThemePresent) {
      matchedThemesCount++;
      passedChecks.push(`[${sampleLabel}] Expressed expected theme: "${theme}"`);
    }
  });

  const themeCoverageRatio = targetThemes.length > 0
    ? matchedThemesCount / targetThemes.length
    : 1.0;

  // ==========================================
  // 3. Quantitative Metric Calculations (1–10)
  // ==========================================

  // (1) Cliché & Genericness Rate
  const totalGenericFlags = foundGenericFillers.length + foundRobotic.length + foundAwkward.length;
  const rawClicheScore = 10.0 - totalGenericFlags * 2.0;
  const clicheRate = Number(Math.max(1.0, Math.min(10.0, rawClicheScore)).toFixed(1));

  // (2) Persona Consistency
  let rawPersona = 9.4;
  if (detectedFailures.includes('persona-break')) rawPersona -= 3.0;
  if (detectedFailures.includes('language-contamination')) rawPersona -= 4.0;
  if (foundRobotic.length > 0) rawPersona -= 2.0;
  if (foundAwkward.length > 0) rawPersona -= 1.5;
  const personaConsistency = Number(Math.max(1.0, Math.min(10.0, rawPersona)).toFixed(1));

  // (3) Naturalness
  let rawNaturalness = 9.5;
  if (detectedFailures.includes('robotic-metaphor')) rawNaturalness -= 3.0;
  if (detectedFailures.includes('awkward-collocation')) rawNaturalness -= 2.0;
  if (detectedFailures.includes('forced-rhyme')) rawNaturalness -= 1.5;
  if (detectedFailures.includes('language-contamination')) rawNaturalness -= 4.0;
  if (detectedFailures.includes('generic-emotional-filler')) rawNaturalness -= 1.0;
  const naturalness = Number(Math.max(1.0, Math.min(10.0, rawNaturalness)).toFixed(1));

  // (4) Story Progression & Narrative Utility
  let rawStory = 9.0;
  if (detectedFailures.includes('repeated-idea')) rawStory -= 2.0;
  if (detectedFailures.includes('semantic-drift')) rawStory -= 2.0;
  if (detectedFailures.includes('generic-emotional-filler')) rawStory -= 1.5;
  if (detectedFailures.includes('narrative-prose-reporting')) rawStory -= 2.0;
  const storyProgression = Number(Math.max(1.0, Math.min(10.0, rawStory)).toFixed(1));

  // (5) Lexical Fit & Evidence Grounding
  let rawLexical = (themeCoverageRatio * 7.0) + 2.5 - (detectedFailures.includes('persona-break') ? 1.5 : 0);
  if (detectedFailures.includes('unsupported-genre-decoration')) rawLexical -= 2.0;
  const lexicalFit = Number(Math.max(1.0, Math.min(10.0, rawLexical)).toFixed(1));

  // (6) Singability & Flow
  let rawSingability = 9.3;
  if (detectedFailures.includes('forced-rhyme')) rawSingability -= 2.0;
  if (rhythmStumbles > 0) rawSingability -= rhythmStumbles * 1.0;
  const singabilityFlow = Number(Math.max(1.0, Math.min(10.0, rawSingability)).toFixed(1));

  // (7) Specificity Score
  const rawSpecificity = Number((Math.min(10.0, (themeCoverageRatio * 6.0) + 3.5 - (foundGenericFillers.length * 1.5))).toFixed(1));
  const specificityScore = Math.max(1.0, rawSpecificity);

  // (8) Narrative Utility Score
  const narrativeUtilityScore = Number(Math.max(1.0, Math.min(10.0, storyProgression * 0.6 + lexicalFit * 0.4)).toFixed(1));

  // (9) Genericness Risk
  const genericnessRisk = Number(Math.max(1.0, Math.min(10.0, 10.0 - foundGenericFillers.length * 2.5)).toFixed(1));

  // (10) Evidence Grounding
  let rawEvidence = 9.5;
  if (detectedFailures.includes('unsupported-genre-decoration')) rawEvidence -= 3.0;
  if (detectedFailures.includes('semantic-drift')) rawEvidence -= 2.5;
  const evidenceGroundingScore = Number(Math.max(1.0, Math.min(10.0, rawEvidence)).toFixed(1));

  // (11) Naturalness Levels
  const naturalnessL2 = personaConsistency;
  const naturalnessL3 = Number(Math.max(1.0, Math.min(10.0, naturalness * 0.7 + genericnessRisk * 0.3)).toFixed(1));

  // (12) Universal Craft Dimensions
  const semanticPrecision = Number(Math.max(1.0, Math.min(10.0, naturalness * 0.5 + lexicalFit * 0.5)).toFixed(1));
  const imageryQuality = specificityScore;
  const emotionalSpecificity = Number(Math.max(1.0, Math.min(10.0, 10.0 - (10.0 - genericnessRisk) * 0.8)).toFixed(1));
  const contextualFit = evidenceGroundingScore;
  const memorability = naturalnessL3;
  const craftQuality = Number(
    (
      (semanticPrecision + imageryQuality + emotionalSpecificity + contextualFit + memorability + narrativeUtilityScore) /
      6.0
    ).toFixed(1)
  );

  // (13) Overall Composite
  const overallComposite = Number(
    ((naturalness * 1.5 + personaConsistency + storyProgression + lexicalFit + clicheRate + singabilityFlow + specificityScore + narrativeUtilityScore + evidenceGroundingScore + craftQuality) / 10.5).toFixed(2)
  );

  const metrics: BenchmarkMetrics = {
    naturalness,
    personaConsistency,
    storyProgression,
    lexicalFit,
    clicheRate,
    singabilityFlow,
    specificityScore,
    narrativeUtilityScore,
    genericnessRisk,
    evidenceGroundingScore,
    naturalnessL2,
    naturalnessL3,
    craftQuality,
    semanticPrecision,
    imageryQuality,
    emotionalSpecificity,
    memorability,
    contextualFit,
    overallComposite,
  };

  const rationale = `Evaluated blinded ${sampleLabel} across 6 dimensions. Detected ${detectedFailures.length} critical failure flag(s), passed ${passedChecks.length} thematic verification check(s). Overall composite: ${overallComposite}/10.`;

  return {
    metrics,
    evidence: {
      passedChecks,
      detectedFailures,
      failureDetails,
      rationale,
    },
  };
}

/**
 * Helper to match contextual semantic concepts
 */
function hasSemanticConcept(fullText: string, lowerText: string, theme: string): boolean {
  if (theme === 'ความแอบชอบ') {
    return fullText.includes('แอบ') || fullText.includes('ชอบ') || fullText.includes('แซว') || fullText.includes('มอง');
  }
  if (theme === 'วิถีชีวิตข้างบ้าน') {
    return fullText.includes('บ้าน') || fullText.includes('มอเตอร์ไซค์') || fullText.includes('รั้ว') || fullText.includes('ซอย');
  }
  if (theme === 'ความเขิน') {
    return fullText.includes('เขิน') || fullText.includes('เซ') || fullText.includes('เต้น') || fullText.includes('ตึกตัก');
  }
  if (theme === 'ความจริงใจ') {
    return fullText.includes('จริง') || fullText.includes('ใจ') || fullText.includes('รัก');
  }
  if (theme === 'ความทรงจำ') {
    return fullText.includes('ทรงจำ') || fullText.includes('รูปถ่าย') || fullText.includes('เมื่อวาน') || fullText.includes('เงา');
  }
  if (theme === 'ไออุ่น') {
    return fullText.includes('ไออุ่น') || fullText.includes('กาแฟ') || fullText.includes('โซฟา') || fullText.includes('สัมผัส');
  }
  if (theme === 'ความเงียบ') {
    return fullText.includes('เงียบ') || fullText.includes('สลัว') || fullText.includes('ดับ') || fullText.includes('ค่ำคืน');
  }
  if (theme === 'การต่อสู้' || theme === 'ความฝัน') {
    return fullText.includes('สู้') || fullText.includes('ห้องเช่า') || fullText.includes('ไรม์') || fullText.includes('เวที') || fullText.includes('ฝัน');
  }
  if (theme === 'หยาดเหงื่อ' || theme === 'สองมือ') {
    return fullText.includes('เหงื่อ') || fullText.includes('สองมือ') || fullText.includes('ไมค์') || fullText.includes('สมุด');
  }
  if (theme === 'coast' || theme === 'drive') {
    return lowerText.includes('coast') || lowerText.includes('drive') || lowerText.includes('highway') || lowerText.includes('asphalt');
  }
  return false;
}