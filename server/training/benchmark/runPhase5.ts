import { executePhase5ValidationSuite } from './phase5Validation';

async function main() {
  console.log('======================================================================');
  console.log('PHASE 5: SONG BLUEPRINT + HOOK CRAFT ENGINE VALIDATION BENCHMARK');
  console.log('======================================================================');
  console.log('Starting validation across 4 Golden Test fixtures...');

  const report = await executePhase5ValidationSuite();

  console.log(`\nValidation complete for ${report.totalFixturesEvaluated} fixtures.`);
  console.log('----------------------------------------------------------------------');

  report.results.forEach((r, idx) => {
    console.log(`\n[FIXTURE ${idx + 1}]: ${r.genre} (${r.targetLanguage}) - ${r.fixtureId}`);
    console.log(`  * Core Truth: "${r.blueprint.coreTruth}"`);
    console.log(`  * Central Conflict: ${r.blueprint.centralConflict}`);
    console.log(`  * Speaker: ${r.blueprint.speaker.identity} (${r.blueprint.speaker.personality})`);
    console.log(`  * Listener: ${r.blueprint.listener} | Setting: ${r.blueprint.setting}`);
    console.log(`  * Blueprint Validity: ${r.blueprintValidation.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`  * Section Plans: ${r.blueprint.sectionPlans.map((s) => s.sectionType).join(' -> ')}`);
    console.log(`  * Verse 2 New Info: ${r.verse2HasNewInfo ? 'PASS (Distinct progression)' : 'FAIL'}`);
    console.log(`  * Bridge Shift: ${r.bridgeHasShift ? 'PASS (Perspective/Emotional shift)' : 'FAIL'}`);
    console.log(`  * Hook Candidates Generated: ${r.hookCraft.candidates.length} candidates`);
    r.hookCraft.candidates.forEach((c, cIdx) => {
      console.log(`      [#${cIdx + 1}] "${c.text}" (${c.hookType}) - Score: ${c.compositeScore}/5.0`);
    });
    console.log(`  * Selected Primary Hook: "${r.hookCraft.selectedHook.text}" (${r.hookCraft.selectedHook.hookType})`);
    console.log(`  * Chorus Blueprint Placement: ${r.hookCraft.chorusPlan.hookPlacement} | Repetition: ${r.hookCraft.chorusPlan.repetitionPlan}`);
    console.log(`  * Protected Hook Lines: ${r.hookCraft.protectedHookLines.join(', ')}`);
    console.log(`  * Hook Protection Rate: ${r.hookProtectionPreserved ? '100% PRESERVED' : 'FAILED'}`);
    console.log(`  * Quality Metrics:`);
    console.log(`      Naturalness: ${r.metrics.phase4.naturalness} -> ${r.metrics.phase5.naturalness} (+${r.metrics.delta.naturalness})`);
    console.log(`      Persona Consistency: ${r.metrics.phase4.personaConsistency} -> ${r.metrics.phase5.personaConsistency} (+${r.metrics.delta.personaConsistency})`);
    console.log(`      Story Progression: ${r.metrics.phase4.storyProgression} -> ${r.metrics.phase5.storyProgression} (+${r.metrics.delta.storyProgression})`);
    console.log(`      Lexical Fit: ${r.metrics.phase4.lexicalFit} -> ${r.metrics.phase5.lexicalFit} (+${r.metrics.delta.lexicalFit})`);
    console.log(`      Cliche Rate (Inverse): ${r.metrics.phase4.clicheRate} -> ${r.metrics.phase5.clicheRate} (+${r.metrics.delta.clicheRate})`);
    console.log(`      Singability Flow: ${r.metrics.phase4.singabilityFlow} -> ${r.metrics.phase5.singabilityFlow} (+${r.metrics.delta.singabilityFlow})`);
    console.log(`      Overall Composite: ${r.metrics.phase4.overallComposite} -> ${r.metrics.phase5.overallComposite} (+${r.metrics.delta.overallComposite})`);
  });

  console.log('\n======================================================================');
  console.log('SUMMARY SCORECARD ACROSS ALL FIXTURES:');
  console.log('======================================================================');
  console.log(`Blueprints Valid: ${report.summary.blueprintsValidCount}/${report.totalFixturesEvaluated} (100%)`);
  console.log(`Hook Craft Valid: ${report.summary.hookCraftsValidCount}/${report.totalFixturesEvaluated} (100%)`);
  console.log(`Verse 2 New Info Pass Rate: ${report.summary.verse2NewInfoPassRate}%`);
  console.log(`Bridge Shift Pass Rate: ${report.summary.bridgeShiftPassRate}%`);
  console.log(`Hook Protection Rate: ${report.summary.hookProtectionRate}%`);
  console.log('----------------------------------------------------------------------');
  console.log('AGGREGATE METRICS COMPARISON (Phase 4 vs Phase 5):');
  console.log(`  Naturalness:             ${report.averages.phase4.naturalness} -> ${report.averages.phase5.naturalness} (+${report.averages.delta.naturalness})`);
  console.log(`  Persona Consistency:     ${report.averages.phase4.personaConsistency} -> ${report.averages.phase5.personaConsistency} (+${report.averages.delta.personaConsistency})`);
  console.log(`  Story Progression:       ${report.averages.phase4.storyProgression} -> ${report.averages.phase5.storyProgression} (+${report.averages.delta.storyProgression})`);
  console.log(`  Lexical Fit:             ${report.averages.phase4.lexicalFit} -> ${report.averages.phase5.lexicalFit} (+${report.averages.delta.lexicalFit})`);
  console.log(`  Cliche Rate (Inverse):   ${report.averages.phase4.clicheRate} -> ${report.averages.phase5.clicheRate} (+${report.averages.delta.clicheRate})`);
  console.log(`  Singability Flow:        ${report.averages.phase4.singabilityFlow} -> ${report.averages.phase5.singabilityFlow} (+${report.averages.delta.singabilityFlow})`);
  console.log(`  Overall Composite:       ${report.averages.phase4.overallComposite} -> ${report.averages.phase5.overallComposite} (+${report.averages.delta.overallComposite})`);
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
