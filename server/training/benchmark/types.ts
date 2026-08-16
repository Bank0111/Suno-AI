export type CriticalFailureFlag =
  | 'forced-rhyme'
  | 'awkward-collocation'
  | 'robotic-metaphor'
  | 'filler-line'
  | 'persona-break'
  | 'semantic-drift'
  | 'genre-mismatch'
  | 'language-contamination'
  | 'repeated-idea'
  | 'section-redundancy'
  | 'generic-emotional-filler'
  | 'unsupported-genre-decoration'
  | 'awkward-word-order'
  | 'narrative-prose-reporting'
  | 'emotional-over-explanation';

export interface BenchmarkMetrics {
  naturalness: number;        // 1 - 10
  personaConsistency: number; // 1 - 10
  storyProgression: number;   // 1 - 10
  lexicalFit: number;         // 1 - 10
  clicheRate: number;         // 1 - 10 (10 = zero cliches, lower is worse)
  singabilityFlow: number;    // 1 - 10
  overallComposite: number;   // Arithmetic Mean: (naturalness + persona + story + lexical + cliche + singability) / 6
  // Phase 5.5B Granular Metrics
  specificityScore?: number;        // 1 - 10
  narrativeUtilityScore?: number;   // 1 - 10
  evidenceGroundingScore?: number;  // 1 - 10
  genericnessRisk?: number;         // 1 - 10 (10 = safest / lowest risk, 1 = high risk generic)
  naturalnessL2?: number;           // 1 - 10 (Persona realism)
  naturalnessL3?: number;           // 1 - 10 (Lyrical sharpness & memorability)
  // Phase 5.6 Universal Craft & Editorial Metrics
  craftQuality?: number;            // 1 - 10 (Overall Craftsmanship)
  semanticPrecision?: number;       // 1 - 10
  imageryQuality?: number;          // 1 - 10
  emotionalSpecificity?: number;    // 1 - 10
  memorability?: number;            // 1 - 10
  contextualFit?: number;           // 1 - 10
}

export interface MetricEvaluationEvidence {
  passedChecks: string[];
  detectedFailures: CriticalFailureFlag[];
  failureDetails: string[];
  rationale: string;
}

export interface BenchmarkRunRecord {
  id: string;
  testId: string;
  testTitle: string;
  genre: string;
  targetLanguage: string;
  version: 'Version A (Baseline)' | 'Version B (Enhanced Few-Shot)';
  versionKey: 'A' | 'B';
  runId: 1 | 2 | 3;
  timestamp: string;
  model: string;
  generationConfig: {
    genre: string;
    moods: string[];
    story: string;
    pointOfView: string;
    wordTone: string;
    languageStyle: string;
    bpm: number;
    vocalType: string;
    fewShotContextInjected: boolean;
  };
  lyrics: string[];
  metrics: BenchmarkMetrics;
  evaluationEvidence: MetricEvaluationEvidence;
  criticalFailureCount: number;
}

export interface MetricStatistics {
  baseline: {
    mean: number;
    min: number;
    max: number;
  };
  enhanced: {
    mean: number;
    min: number;
    max: number;
  };
  deltaMean: number; // enhanced.mean - baseline.mean
}

export interface BenchmarkSummaryReport {
  evaluationType: 'Automated (Rule & Heuristic Evaluation)' | 'Human Evaluation';
  humanEvaluationStatus: 'NOT AVAILABLE';
  timestamp: string;
  totalFixtures: number;
  runsPerVersionPerFixture: number;
  totalRuns: number;
  runs: BenchmarkRunRecord[];
  fixtureAverages: Array<{
    testId: string;
    testTitle: string;
    genre: string;
    baselineAverage: BenchmarkMetrics & { failureCount: number };
    enhancedAverage: BenchmarkMetrics & { failureCount: number };
    deltas: BenchmarkMetrics & { failureCount: number };
  }>;
  metricStatistics: {
    naturalness: MetricStatistics;
    personaConsistency: MetricStatistics;
    storyProgression: MetricStatistics;
    lexicalFit: MetricStatistics;
    clicheRate: MetricStatistics;
    singabilityFlow: MetricStatistics;
    overallComposite: MetricStatistics;
  };
  criticalFailureBreakdown: {
    totalFailuresBaseline: number;
    totalFailuresEnhanced: number;
    failureTypesCountBaseline: Record<CriticalFailureFlag, number>;
    failureTypesCountEnhanced: Record<CriticalFailureFlag, number>;
  };
  regressionGuardAnalysis: {
    hasRegressions: boolean;
    tradeOffNotes: string[];
  };
  decision: {
    verdict: 'PROMOTE' | 'HOLD' | 'REJECT';
    justification: string;
  };
}
