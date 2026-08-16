import {
  TrainingDatasetBundle,
  DatasetValidationReport,
  SourceType,
} from './types';
import { datasetLoader } from './loaders/datasetLoader';

const VALID_SOURCE_TYPES: SourceType[] = [
  'synthetic-expert',
  'original-curated',
  'synthetic-failure-case',
  'fair-use-structural-pattern',
  'user-accepted-correction',
];

/**
 * DATASET INTEGRITY VALIDATOR
 * Runs structural and semantic verification across all knowledge and training datasets.
 */
export function validateTrainingDatasets(customBundle?: TrainingDatasetBundle): DatasetValidationReport {
  const bundle = customBundle || datasetLoader.getBundle();
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  const sourceTypeDistribution: Record<SourceType, number> = {
    'synthetic-expert': 0,
    'original-curated': 0,
    'synthetic-failure-case': 0,
    'fair-use-structural-pattern': 0,
    'user-accepted-correction': 0,
  };

  const tallySourceType = (type: SourceType, id: string) => {
    if (!VALID_SOURCE_TYPES.includes(type)) {
      errors.push(`[Invalid SourceType] Record ${id} has invalid sourceType: "${type}"`);
    } else {
      sourceTypeDistribution[type] = (sourceTypeDistribution[type] || 0) + 1;
    }
  };

  const checkId = (id: string, datasetName: string) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      errors.push(`[Empty ID] Found empty or missing ID in dataset ${datasetName}`);
      return;
    }
    if (seenIds.has(id)) {
      errors.push(`[Duplicate ID] Found duplicate ID: "${id}" in dataset ${datasetName}`);
    } else {
      seenIds.add(id);
    }
  };

  // 1. Validate Thai Lyric Knowledge Base
  for (const item of bundle.thaiLyricKnowledge) {
    checkId(item.id, 'ThaiLyricKnowledge');
    tallySourceType(item.sourceType, item.id);

    if (!item.phrase || item.phrase.trim().length === 0) {
      errors.push(`[Empty Phrase] Record ${item.id} has empty phrase.`);
    }
    if (!item.syllableCount || item.syllableCount <= 0) {
      errors.push(`[Invalid SyllableCount] Record ${item.id} syllableCount must be > 0.`);
    }
    if (!item.semanticDomains || item.semanticDomains.length === 0) {
      warnings.push(`[Missing Semantic Domains] Record ${item.id} has no semantic domains specified.`);
    }
  }

  // 2. Validate Good Exemplars
  for (const ex of bundle.goodExemplars) {
    checkId(ex.id, 'GoodExemplars');
    tallySourceType(ex.sourceType, ex.id);

    if (!ex.lines || !Array.isArray(ex.lines) || ex.lines.length === 0) {
      errors.push(`[Empty Lines] Good exemplar ${ex.id} must contain at least 1 line.`);
    }
    if (typeof ex.whyItWorks?.naturalnessScore !== 'number' || ex.whyItWorks.naturalnessScore < 1 || ex.whyItWorks.naturalnessScore > 10) {
      errors.push(`[Impossible Score] Good exemplar ${ex.id} naturalnessScore (${ex.whyItWorks?.naturalnessScore}) must be between 1 and 10.`);
    }
    if (!ex.whyItWorks?.characterConsistency) {
      errors.push(`[Missing Explanation] Good exemplar ${ex.id} missing characterConsistency explanation.`);
    }
  }

  // 3. Validate Bad Exemplars
  for (const bad of bundle.badExemplars) {
    checkId(bad.id, 'BadExemplars');
    tallySourceType(bad.sourceType, bad.id);

    if (!bad.flawedLines || bad.flawedLines.length === 0) {
      errors.push(`[Empty Flawed Lines] Bad exemplar ${bad.id} must contain flawedLines.`);
    }
    if (!bad.rootCause || bad.rootCause.trim().length === 0) {
      errors.push(`[Missing RootCause] Bad exemplar ${bad.id} missing rootCause.`);
    }
    if (!bad.detectedSignals || bad.detectedSignals.length === 0) {
      warnings.push(`[Missing Signals] Bad exemplar ${bad.id} has no detectedSignals listed.`);
    }
  }

  // 4. Validate Correction Pairs
  for (const pair of bundle.correctionPairs) {
    checkId(pair.id, 'CorrectionPairs');
    tallySourceType(pair.sourceType, pair.id);

    if (!pair.originalFlawed || pair.originalFlawed.trim().length === 0) {
      errors.push(`[Empty Original] Correction pair ${pair.id} missing originalFlawed.`);
    }
    if (!pair.correctedNatural || pair.correctedNatural.trim().length === 0) {
      errors.push(`[Empty Corrected] Correction pair ${pair.id} missing correctedNatural.`);
    }
    if (!pair.diagnosis || pair.diagnosis.trim().length === 0) {
      errors.push(`[Missing Diagnosis] Correction pair ${pair.id} missing diagnosis.`);
    }
  }

  // 5. Validate Avoidance Rules
  for (const rule of bundle.avoidanceRules) {
    checkId(rule.id, 'AvoidanceRules');
    tallySourceType(rule.sourceType, rule.id);

    if (!rule.termOrPhrase || rule.termOrPhrase.trim().length === 0) {
      errors.push(`[Empty Term] Avoidance rule ${rule.id} has empty termOrPhrase.`);
    }
    if (!rule.tier || !['HARD_BLOCK', 'CONTEXTUAL_AVOID', 'LOW_PREFERENCE'].includes(rule.tier)) {
      errors.push(`[Invalid Tier] Avoidance rule ${rule.id} has invalid tier: "${rule.tier}"`);
    }
  }

  // 6. Validate Personas
  const seenPersonaKeys = new Set<string>();
  for (const p of bundle.personaProfiles) {
    if (seenPersonaKeys.has(p.personaKey)) {
      errors.push(`[Duplicate PersonaKey] Duplicate personaKey: "${p.personaKey}"`);
    } else {
      seenPersonaKeys.add(p.personaKey);
    }
    tallySourceType(p.sourceType, p.personaKey);
  }

  // 7. Validate Genre Profiles
  for (const g of bundle.genreProfiles) {
    tallySourceType(g.sourceType, g.genreKey);
  }

  // 8. Validate Golden Test Fixtures
  for (const fixture of bundle.goldenTestFixtures) {
    checkId(fixture.id, 'GoldenTestFixtures');
    tallySourceType(fixture.sourceType, fixture.id);
  }

  const breakdown: Record<string, number> = {
    thaiLyricKnowledge: bundle.thaiLyricKnowledge.length,
    goodExemplars: bundle.goodExemplars.length,
    badExemplars: bundle.badExemplars.length,
    correctionPairs: bundle.correctionPairs.length,
    avoidanceRules: bundle.avoidanceRules.length,
    personaProfiles: bundle.personaProfiles.length,
    genreProfiles: bundle.genreProfiles.length,
    goldenTestFixtures: bundle.goldenTestFixtures.length,
  };

  const totalRecords = Object.values(breakdown).reduce((acc, count) => acc + count, 0);

  return {
    isValid: errors.length === 0,
    totalRecords,
    breakdown,
    sourceTypeDistribution,
    errors,
    warnings,
  };
}
