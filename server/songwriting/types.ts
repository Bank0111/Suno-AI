import { CriticalFailureFlag } from '../training/benchmark/types';
import type { LyricCraftEditorialReport } from './editor';

export type CriticStatus = 'PASS' | 'REVIEW' | 'FAIL';
export type IssueSeverity = 'critical' | 'warning' | 'info';

export type SectionFunctionType =
  | 'scene-setup'
  | 'emotional-lift'
  | 'central-hook'
  | 'escalation-new-info'
  | 'perspective-shift'
  | 'closure-afterglow';

export type HookType =
  | 'phrase_hook'
  | 'statement_hook'
  | 'conversational_hook'
  | 'image_hook'
  | 'title_hook'
  | 'question_hook'
  | 'contrast_hook'
  | 'chant_hook';

export type TitleStrategyType =
  | 'titleIsHook'
  | 'titleDerivedFromHook'
  | 'titleIsConcept'
  | 'titleIsImage'
  | 'titleIndependent';

export interface SpeakerVoiceContract {
  register: string; // e.g. 'spoken', 'casual', 'street', 'literary'
  vocabularyStyle: string; // e.g. 'simple everyday Thai', 'street hip-hop slang', 'poetic acoustic'
  sentenceBehavior: string; // e.g. 'direct short punchy sentences', 'conversational with particles'
  humorLevel: string; // e.g. 'none', 'playful/self-deprecating', 'witty'
  directness: string; // e.g. 'blunt/straightforward', 'shy/hesitant', 'introspective'
  emotionalOpenness: string; // e.g. 'raw and vulnerable', 'guarded', 'carefree'
  socialTone: string; // e.g. 'intimate one-on-one confession', 'talking with friends', 'public declaration'
}

export interface SongWorld {
  places: string[];
  objects: string[];
  people: string[];
  habits: string[];
  timeCues: string[];
  sensoryCues: string[];
  socialContext: string;
}

export interface SectionBlueprintPlan {
  sectionType: string;
  purpose: string;
  narrativeJob: string;
  emotionalJob: string;
  informationToReveal: string[];
  requiredConcreteDetails: string[];
  mustNotRepeat: string[];
  transitionFromPrevious: string;
  transitionToNext: string;
  needsConcreteDetail?: boolean;
}

export interface NarrativeCompression {
  chosenDramaticMoments: string[];
  deliberatelyOmittedEvents: string[];
}

export interface NegativeSpaceDirectives {
  unspokenEmotions: string[];
  clicheAvoidanceZones: string[];
}

export interface SectionInformationBudget {
  sectionType: string;
  newInformationQuota: string;
  forbiddenRedundancy: string[];
  lyricDensityLevel: 'spacious' | 'balanced' | 'dense';
}

export interface BridgeEpiphany {
  psychologicalShift: string;
  contrastingAngle: string;
}

export interface OutroClosure {
  finalLingeringImage: string;
  closingThought: string;
}

export interface SongBlueprint {
  coreTruth: string;
  centralConflict: string;
  emotionalArc: string[];
  speaker: {
    identity: string;
    personality: string;
    voice: string;
  };
  listener: string;
  setting: string;
  storyPremise: string;
  sectionPlans: SectionBlueprintPlan[];
  visualMotifs: string[];
  concreteDetails: string[];
  protectedStoryFacts: string[];
  centralHookNeed: string;
  songWorld: SongWorld;
  speakerVoiceContract: SpeakerVoiceContract;
  abstractEmotionDensity: {
    score: number; // 0.0 - 1.0
    flaggedSections: string[];
    needsConcreteDetail: boolean;
  };
  titleStrategy: TitleStrategyType;
  // Phase 5.7 Composition Enhancement
  narrativeCompression: NarrativeCompression;
  negativeSpaceDirectives: NegativeSpaceDirectives;
  sectionInformationBudget: SectionInformationBudget[];
  bridgeEpiphany: BridgeEpiphany;
  outroClosure: OutroClosure;
}

export interface HookCandidate {
  text: string;
  hookType: HookType;
  emotionalCore: string;
  memorabilityReason: string;
  storyFit: number; // 1 - 5
  personaFit: number; // 1 - 5
  genreFit: number; // 1 - 5
  singability: number; // 1 - 5
  naturalness: number; // 1 - 5
  emotionalImpact: number; // 1 - 5
  originality: number; // 1 - 5
  compositeScore: number; // 1 - 5
  isUserOriginated?: boolean;
  rationale: string;
}

export interface ChorusBlueprint {
  hookPlacement: 'start' | 'end' | 'framing';
  setupLine: string;
  hookLine: string;
  reinforcementLine: string;
  emotionalPayoff: string;
  repetitionPlan: 'exact_repeat' | 'controlled_variation';
  variationRationale?: string;
}

export interface HookCraftResult {
  candidates: HookCandidate[];
  selectedHook: HookCandidate;
  chorusPlan: ChorusBlueprint;
  protectedHookLines: string[];
  titleRelationship: {
    strategy: TitleStrategyType;
    recommendedTitle: string;
    consistencyNote: string;
  };
}

export interface BlueprintValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CriticIssue {
  type: CriticalFailureFlag | string;
  severity: IssueSeverity;
  lineIndices: number[]; // 0-based index in the section
  diagnosis: string;
  evidence: string;
  suggestedAction: string;
}

export interface ProtectedItem {
  sectionIndex: number;
  sectionType: string;
  lineIndex: number;
  text: string;
  reason: string;
}

export interface ProtectedSection {
  sectionIndex: number;
  sectionType: string;
  reason: string;
}

export interface CriticSectionAnalysis {
  sectionIndex: number;
  sectionType: string;
  functionExpected: SectionFunctionType;
  status: CriticStatus;
  score: number; // 1.0 - 5.0 (Rubric scale)
  issues: CriticIssue[];
  protectedLines: number[]; // 0-based line indices in this section
  narrativeFunctionMet: boolean;
  notes?: string;
}

export interface RewriteTarget {
  targetId: string;
  sectionIndex: number;
  sectionType: string;
  lineIndices: number[]; // Specific 0-based line indices to rewrite
  targetLyrics: string[]; // Exact original text of the lines to rewrite
  surroundingContextBefore: string[];
  surroundingContextAfter: string[];
  issues: CriticIssue[];
  instructions: string;
  // Phase 5.5B Rich Context for Targeted Surgery
  speakerVoice?: string;
  relevantSceneEvidence?: string[];
  evidenceTier?: 'TIER_1_USER_GROUNDED' | 'TIER_2_CONTEXT_SUPPORTED' | 'TIER_3_GENRE_DECORATION';
  narrativeUtility?: string;
  preferredLexicalCandidates?: string[];
  contextualAvoidance?: string[];
  protectedHookState?: boolean;
  rewriteStrategy?: 'increase_specificity' | 'fix_awkward_collocation' | 'remove_genre_decoration' | 'reframe_narrative' | 'keep_original';
}

export interface CriticReport {
  evaluationType: 'LLM-based automated evaluation';
  overallStatus: CriticStatus;
  overallScore: number; // 1.0 - 5.0 (Rubric scale)
  sections: CriticSectionAnalysis[];
  globalIssues: CriticIssue[];
  protectedLines: ProtectedItem[];
  protectedSections: ProtectedSection[];
  rewriteTargets: RewriteTarget[];
  timestamp: string;
  modelUsed?: string;
  rubricBreakdown: {
    naturalnessScore: number; // 1 - 5
    personaScore: number; // 1 - 5
    storyProgressionScore: number; // 1 - 5
    lexicalFitScore: number; // 1 - 5
    clicheAvoidanceScore: number; // 1 - 5
    singabilityFlowScore: number; // 1 - 5
    hookStrengthScore: number; // 1 - 5
    sectionFunctionScore: number; // 1 - 5
    specificityScore?: number; // 1 - 5
    narrativeUtilityScore?: number; // 1 - 5
    genericnessRiskScore?: number; // 1 - 5
    evidenceGroundingScore?: number; // 1 - 5
    naturalnessL2Score?: number; // 1 - 5 (persona realism)
    naturalnessL3Score?: number; // 1 - 5 (lyrical memorability & sharpness)
  };
}

export interface CandidateEvaluation {
  candidateText: string[];
  naturalness: number; // 1 - 5
  semanticPreservation: number; // 1 - 5
  personaFit: number; // 1 - 5
  genreFit: number; // 1 - 5
  singability: number; // 1 - 5
  originality: number; // 1 - 5
  specificityScore?: number;
  narrativeUtilityScore?: number;
  evidenceGroundingScore?: number;
  compositeScore: number; // Mean of dimensions
  isBetterThanOriginal: boolean;
  rationale: string;
}

export interface Tar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8 {
  targetId: string;
  sectionIndex: number;
  sectionType: string;
  originalLines: string[];
  candidatesEvaluated: CandidateEvaluation[];
  selectedLines: string[];
  wasOriginalRetained: boolean;
  reason: string;
}

// Type Aliases for Backward Compatibility
export type TarahJ91ZuNL8Y2px8iYciYeHN8sfSh5eXH8 = Tar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8;
export type TargetedRewriteRecord = Tar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8;

export interface SongwritingCriticRewriteResult {
  originalLyrics: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>;
  finalLyrics: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>;
  criticReport: CriticReport;
  rewriteRecords: Tar9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8[];
  totalRewrittenLines: number;
  roundsExecuted: number;
  editorialReport?: LyricCraftEditorialReport;
  finalQA: {
    passed: boolean;
    issuesFound: string[];
    qaScore: number;
  };
}