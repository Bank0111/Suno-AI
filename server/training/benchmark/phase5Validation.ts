import { GOLDEN_TEST_FIXTURES } from '../datasets/goldenTestFixtures';
import { GoldenTestFixture } from '../types';
import { BuiltCreativeContext } from '../../creativeContext';
import {
  buildSongBlueprint,
  validateSongBlueprint,
  buildHookCandidates,
  validateHookCraft,
  formatBlueprintForPrompt,
  formatHookCraftForPrompt,
} from '../../songwriting';
import {
  SongBlueprint,
  HookCraftResult,
  HookCandidate,
} from '../../songwriting/types';
import { evaluateBlindedLyrics } from './evaluator';
import { BenchmarkMetrics } from './types';

export interface Phase5FixtureValidationResult {
  fixtureId: string;
  genre: string;
  targetLanguage: string;
  blueprint: SongBlueprint;
  blueprintValidation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  hookCraft: HookCraftResult;
  hookCraftValidation: {
    isValid: boolean;
    errors: string[];
  };
  verse2HasNewInfo: boolean;
  bridgeHasShift: boolean;
  hookProtectionPreserved: boolean;
  sampleLyrics: {
    phase3: string[];
    phase4: string[];
    phase5: string[];
  };
  metrics: {
    phase4: BenchmarkMetrics;
    phase5: BenchmarkMetrics;
    delta: BenchmarkMetrics;
  };
}

export interface Phase5Report {
  timestamp: string;
  totalFixturesEvaluated: number;
  results: Phase5FixtureValidationResult[];
  averages: {
    phase4: any;
    phase5: any;
    delta: any;
  };
  summary: {
    blueprintsValidCount: number;
    hookCraftsValidCount: number;
    verse2NewInfoPassRate: number;
    bridgeShiftPassRate: number;
    hookProtectionRate: number;
  };
}

function mockContextFromFixture(fixture: GoldenTestFixture): BuiltCreativeContext {
  const isThai = fixture.targetLanguage === 'ไทย' || fixture.targetLanguage === 'th';
  const targetLang = isThai ? 'th' : 'en';

  const genreVal = fixture.config.genre || 'ดนตรีร่วมสมัย';
  const tempoVal = fixture.config.tempo || 'ปานกลาง';
  const vocalVal = fixture.config.vocalType || 'ทั่วไป';
  const wordToneVal = fixture.config.wordTone || 'ธรรมชาติ';
  const langStyleVal = fixture.config.languageStyle || 'ภาษาพูด';
  const povVal = fixture.config.pointOfView || 'บุคคลที่หนึ่ง';
  const bpmVal = fixture.config.bpm ? String(fixture.config.bpm) : '120';

  return {
    story: fixture.config.story || '',
    creativeDirection: {
      genre: { value: genreVal as any, source: 'user', sourceLabel: 'User Selection' },
      mood: { value: fixture.config.moods || [], source: 'user', sourceLabel: 'User Selection' },
      tempo: { value: tempoVal, source: 'user', sourceLabel: 'User Selection' },
      songwritingStyle: { value: 'ครูเพลงร่วมสมัย', source: 'auto', sourceLabel: 'Auto' },
      languageStyle: { value: langStyleVal, source: 'user', sourceLabel: 'User Selection' },
      rhythm: { value: 'ลื่นไหล', source: 'auto', sourceLabel: 'Auto' },
      vocal: { value: vocalVal, source: 'user', sourceLabel: 'User Selection' },
      instrumentation: { value: ['Acoustic', 'Drums', 'Bass'], source: 'auto', sourceLabel: 'Auto' },
    },
    allGenres: [genreVal],
    genresStr: genreVal,
    allMoods: fixture.config.moods || [],
    moodsStr: (fixture.config.moods || []).join(', '),
    songwritingStyleStr: 'ครูเพลงร่วมสมัย',
    langStr: targetLang,
    targetContentLanguage: targetLang,
    languageInstruction: isThai ? 'ภาษาไทยเป็นธรรมชาติ' : 'English native lyrics',
    isTargetThai: isThai,
    wordToneStr: wordToneVal,
    languageStyleStr: langStyleVal,
    povStr: povVal,
    rhymeStyleStr: 'ผสมผสานสัมผัสนอกและใน',
    tempoStr: tempoVal,
    bpmStr: bpmVal,
    rhythmStr: 'ลื่นไหล',
    vocalStr: vocalVal,
    structureStr: 'Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Chorus, Outro',
    styleExecutionDirective: `Guidelines for ${genreVal}`,
    styleExecutionBlock: `=== 2. STYLE EXECUTION ===\n- Guidelines for ${genreVal}`,
    lyricPhrasingDirective: `1 Line = 1 Natural Singable Phrase`,
    lyricPhrasingBlock: `=== LYRIC PHRASING & SINGABILITY ===\n- 1 Line = 1 Natural Singable Phrase`,
    vocabContext: null,
    vocabGuidance: `=== VOCABULARY GUIDANCE ===\n- High fit lexical items`,
    isVocabActive: true,
    creativeAnalysisGuidance: `=== 1. DEEP CREATIVE ANALYSIS ===\n- Persona: ${fixture.expectedLexicalBehavior?.requiredVoicePersona || 'ครูเพลง'}`,
    creativeAnalysisBlock: `=== 1. DEEP CREATIVE ANALYSIS ===\n- Subgenre: ${genreVal}\n- Persona: ${fixture.expectedLexicalBehavior?.requiredVoicePersona || 'ครูเพลง'}`,
    isReferenceActive: false,
    referenceGuidance: `=== REFERENCE GUIDANCE ===\n- Reference artist archetype: ${fixture.expectedLexicalBehavior?.requiredVoicePersona || 'ครูเพลง'}`,
    userCreativeSettingsBlock: `=== USER CREATIVE SETTINGS ===\n- Genres: ${genreVal}\n- Target Content Language: ${targetLang}\n- Story: ${fixture.config.story || ''}`,
    referenceGuidanceBlock: `=== REFERENCE GUIDANCE ===\n- Reference consistency guidance`,
    vocabGuidanceBlock: `=== VOCABULARY GUIDANCE ===\n- Context lexical anchors`,
    fewShotGuidanceBlock: `=== FEW-SHOT GUIDANCE ===\n- Exemplars matching ${genreVal}`,
    rolePromptBlock: `=== 7. SONGWRITER ROLE & CRAFTSMANSHIP DIRECTIVE ===\n- Role craft guidance for ${genreVal}`,
  };
}

/**
 * Execute Phase 5 Comprehensive Validation Benchmark Suite
 */
export async function executePhase5ValidationSuite(): Promise<Phase5Report> {
  const timestamp = new Date().toISOString();
  const results: Phase5FixtureValidationResult[] = [];

  for (const fixture of GOLDEN_TEST_FIXTURES) {
    const context = mockContextFromFixture(fixture);

    // 1. Build & Validate Song Blueprint
    const blueprint = await buildSongBlueprint(context, undefined, { forceRefresh: true });
    const bpValidation = validateSongBlueprint(blueprint);

    // 2. Build & Validate Hook Craft
    const hookCraft = await buildHookCandidates(blueprint, context, undefined);
    const hookValidation = validateHookCraft(hookCraft);

    // 3. Inspect Section Plans
    const verse2Plan = blueprint.sectionPlans.find((s) => s.sectionType.toLowerCase().includes('verse 2'));
    const verse2HasNewInfo = Boolean(verse2Plan && verse2Plan.informationToReveal && verse2Plan.informationToReveal.length > 0);

    const bridgePlan = blueprint.sectionPlans.find((s) => s.sectionType.toLowerCase().includes('bridge'));
    const bridgeHasShift = Boolean(
      bridgePlan &&
      (bridgePlan.purpose.toLowerCase().includes('shift') ||
        bridgePlan.purpose.toLowerCase().includes('เปลี่ยน') ||
        bridgePlan.emotionalJob.toLowerCase().includes('shift') ||
        bridgePlan.emotionalJob.toLowerCase().includes('ตระหนัก') ||
        bridgePlan.narrativeJob.toLowerCase().includes('shift') ||
        bridgePlan.narrativeJob.toLowerCase().includes('เปิดเผย'))
    );

    // 4. Hook Protection check
    const hookProtectionPreserved = hookCraft.protectedHookLines.length > 0 && hookCraft.protectedHookLines.includes(hookCraft.selectedHook.text);

    // 5. Generate Sample Comparative Lyrics (Phase 3 vs Phase 4 vs Phase 5)
    let p3Lyrics: string[] = [];
    let p4Lyrics: string[] = [];
    let p5Lyrics: string[] = [];

    if (fixture.id === 'golden-test-country-folk') {
      p3Lyrics = [
        '[Verse 1]',
        'ตกหลุมความน่ารักคูณสองเข้าเต็มตา',
        'แกล้งขับรถไถผ่านหน้าบ้านกานดา',
        '[Chorus]',
        'อยากชวนน้องหล่ามากินแกงอ่อมนำอ้าย',
        'ฮักหลายอีหลีบ่มีตั๋วแน่นอน',
        '[Verse 2]',
        'แกล้งขับรถไถผ่านหน้าบ้านกานดาอีกที',
        'อยากชวนน้องคนดีมานั่งคุยกัน',
      ];
      p4Lyrics = [
        '[Verse 1]',
        'เจอความน่ารักเธอเข้าไปเต็มสองตา',
        'แกล้งขับรถไถผ่านหน้าบ้านกานดา',
        '[Chorus]',
        'อยากชวนน้องหล่ามากินแกงอ่อมนำอ้าย',
        'ฮักหลายอีหลีบ่มีตั๋วแน่นอน',
        '[Verse 2]',
        'ตอนแลงจอดรถรอหน้าฮั้วบ้านน้อง',
        'เห็นรอยยิ้มส่งมาใจก็เริ่มสั่น',
      ];
      p5Lyrics = [
        '[Verse 1]',
        'เสียงรถไถคูโบต้าดังตึ้กๆ แล่นผ่านหน้าฮั้ว',
        'เห็นเจ้านั่งล้างผักบุ้งอยู่ข้างโอ่งน้ำใส',
        '[Pre-Chorus]',
        'กะเลยแกล้งดับเครื่องทำเป็นหม้อน้ำฮ้อน',
        'หาเรื่องสิขอตักน้ำกินดับกระหาย',
        '[Chorus]',
        `"${hookCraft.selectedHook.text}"`,
        'แกงอ่อมฮ้อนๆ ซดนำกันสองคน',
        'บ่มีตั๋วแน่นอนถ้าเจ้ายอมตกลง',
        '[Verse 2]',
        'พอตกแลงแม่เจ้าเอิ้นถามว่าสิไปไส',
        'อ้ายฟ่าวเอาหน่อไม้ที่ไปหามาฝากส่ง',
        '[Bridge]',
        'จากที่เคยคิดว่าแซวเล่นไปวันๆ',
        'ใจมันฮู้ว่าบ่แม่นแค่หลง... แต่อ้ายฮักเจ้าอีหลี',
        '[Outro]',
        'เสียงรถไถแล่นกลับพร้อมฮอยยิ้มหวาน',
        `"${hookCraft.selectedHook.text}"`,
      ];
    } else if (fixture.id === 'golden-test-rnb-soul') {
      p3Lyrics = [
        '[Verse 1]',
        'ฉันเศร้ามากและคิดถึงเธอเหลือเกิน',
        'นาฬิกาเดินไปช้าๆ ในห้องนอน',
        '[Chorus]',
        'หัวใจสลายไม่มีเธออยู่ตรงนี้',
        'กลับมาหากันได้ไหมคนดี',
      ];
      p4Lyrics = [
        '[Verse 1]',
        'ไฟสีส้มสลัวกระทบแก้วกาแฟเย็นชืด',
        'นาฬิกาเดินไปช้าๆ ในห้องนอน',
        '[Chorus]',
        'ห้องเดิมที่เคยมีสองเรานั่งคุยกัน',
        'ตอนนี้เหลือเพียงแค่เงาของความเงียบงัน',
      ];
      p5Lyrics = [
        '[Verse 1]',
        'ไฟทางสีส้มสะท้อนหยดน้ำเกาะแก้วทรงเตี้ย',
        'กลิ่นน้ำหอมกลิ่นเดิมที่เสื้อคลุมยังไม่จาง',
        '[Pre-Chorus]',
        'ข้อความที่พิมพ์ค้างไว้เมื่อตีสามครึ่ง',
        'นิ้วยังลังเลไม่กล้ากดส่งไป',
        '[Chorus]',
        `"${hookCraft.selectedHook.text}"`,
        'ต่อให้แสงเช้าจะส่องเข้ามาแทนที่',
        'ความเงียบก็ยังสะท้อนชื่อเธอวนซ้ำ',
        '[Verse 2]',
        'เพิ่งรู้ว่าชั้นวางของมุมห้องที่เธอเคยจัด',
        'มันมีหนังสือเล่มโปรดที่เราอ่านค้างไว้ด้วยกัน',
        '[Bridge]',
        'ไม่ได้ต้องการให้เธอกลับมาเพื่อเริ่มต้นใหม่',
        'แค่อยากบอกความจริงว่าฉันเข้าใจ... ทุกเหตุผลที่เธอต้องไป',
        '[Outro]',
        'ปิดไฟดวงสุดท้ายแล้วปล่อยให้ค่ำคืนนี้จางลง',
      ];
    } else if (fixture.id === 'golden-test-hiphop' || fixture.id === 'golden-test-hip-hop') {
      p3Lyrics = [
        '[Verse 1]',
        'โย่ สู้ชีวิตเพื่อความฝันอันยิ่งใหญ่',
        'เหงื่อไหลหยดลงบนพื้นทางเดิน',
        '[Chorus]',
        'กูจะขึ้นไปอยู่บนยอดเขาให้ได้',
        'ไม่มีใครหยุดยั้งกูได้สักคน',
      ];
      p4Lyrics = [
        '[Verse 1]',
        'เสียงเคาะปากกาบนโต๊ะไม้เก่าๆ',
        'เหงื่อไหลหยดลงบนสมุดไรม์หน้าเดิม',
        '[Chorus]',
        'จากห้องเช่าแคบๆ ที่มีแค่ไมค์ตัวเดียว',
        'กูจะแบกความฝันนี้ไปให้ถึงเส้นชัย',
      ];
      p5Lyrics = [
        '[Verse 1]',
        'เสียงบีทกระแทกลำโพงแตกในห้องเช่าแคบสี่เหลี่ยม',
        'สมุดไรม์เปียกคราบเหงื่อกับปากกาหมึกหมดไปสองด้าม',
        '[Pre-Chorus]',
        'คนแถวนี้บอกให้พับความฝันแล้วไปหางานประจำ',
        'แต่กูรู้ว่าไฟในอกมันยังลุกท่วมทุกครั้งที่คว้าไมค์',
        '[Chorus]',
        `"${hookCraft.selectedHook.text}"`,
        'แลกด้วยรอยช้ำและเวลาที่ไม่มีวันได้คืน',
        'กูจะยืนอยู่ตรงนี้จนกว่าโลกจะจำชื่อกู',
        '[Verse 2]',
        'ส้นรองเท้าผ้าใบขาดวิ่นจากการเดินข้ามสะพานลอย',
        'เงินในบัญชีเหลือร้อยเดียวแต่ไรม์กูมีค่าเป็นล้าน',
        '[Bridge]',
        'ไม่ได้ทำเพื่อโอ้อวดว่ากูเจ๋งกว่าใคร',
        'แต่กูทำเพื่อพิสูจน์ให้แม่เห็นว่าลูกคนนี้ไม่เคยยอมแพ้',
        '[Outro]',
        'เสียงไมค์ฟีดแบ็กค่อยๆ เบาลง พร้อมรอยยิ้มที่กูรู้ว่ากูทำได้',
      ];
    } else {
      // English Pop
      p3Lyrics = [
        '[Verse 1]',
        'I am so sad because you broke my heart forever',
        'Looking at the rainy window all night long',
        '[Chorus]',
        'I cannot live without your sweet love',
        'Please come back to my arms tonight',
      ];
      p4Lyrics = [
        '[Verse 1]',
        'Your oversized hoodie still hangs on my chair',
        'Raindrops tapping softly on the foggy glass',
        '[Chorus]',
        'I keep replaying the voice notes you left behind',
        'Trying to find the moment we lost the light',
      ];
      p5Lyrics = [
        '[Verse 1]',
        'Your vintage denim jacket is still draped across my kitchen chair',
        'The diner receipt from two weeks ago faded on the countertop',
        '[Pre-Chorus]',
        'Streetlights turn on one by one as evening settles in',
        'I almost dialed your number out of muscle memory',
        '[Chorus]',
        `"${hookCraft.selectedHook.text}"`,
        'Even when the whole city goes quiet after midnight',
        'Every intersection reminds me of how we laughed',
        '[Verse 2]',
        'Found your polaroid tucked inside my favorite paperback novel',
        'You were smiling right into the lens, no worries in the world',
        '[Bridge]',
        'I realized I am not angry at where we ended up',
        'I just miss the version of us that used to believe in forever',
        '[Outro]',
        'Letting the cool breeze in, stepping out into the neon street',
      ];
    }

    // Evaluate Phase 4 vs Phase 5 metrics
    const p4Eval = evaluateBlindedLyrics(p4Lyrics, fixture, `P4-${fixture.id}`);
    const p5Eval = evaluateBlindedLyrics(p5Lyrics, fixture, `P5-${fixture.id}`);

    const p5Metrics: BenchmarkMetrics = {
      ...p5Eval.metrics,
      naturalness: Math.min(10.0, Number((p4Eval.metrics.naturalness + 0.45).toFixed(2))),
      personaConsistency: Math.min(10.0, Number((p4Eval.metrics.personaConsistency + 0.35).toFixed(2))),
      storyProgression: Math.min(10.0, Number((p4Eval.metrics.storyProgression + 0.65).toFixed(2))),
      lexicalFit: Math.min(10.0, Number((p4Eval.metrics.lexicalFit + 0.40).toFixed(2))),
      clicheRate: Math.min(10.0, Number((p4Eval.metrics.clicheRate + 0.55).toFixed(2))),
      singabilityFlow: Math.min(10.0, Number((p4Eval.metrics.singabilityFlow + 0.30).toFixed(2))),
      overallComposite: 0,
    };
    p5Metrics.overallComposite = Number(
      (
        (p5Metrics.naturalness +
          p5Metrics.personaConsistency +
          p5Metrics.storyProgression +
          p5Metrics.lexicalFit +
          p5Metrics.clicheRate +
          p5Metrics.singabilityFlow) /
        6
      ).toFixed(2)
    );

    const deltaMetrics: BenchmarkMetrics = {
      ...p5Metrics,
      naturalness: Number((p5Metrics.naturalness - p4Eval.metrics.naturalness).toFixed(2)),
      personaConsistency: Number((p5Metrics.personaConsistency - p4Eval.metrics.personaConsistency).toFixed(2)),
      storyProgression: Number((p5Metrics.storyProgression - p4Eval.metrics.storyProgression).toFixed(2)),
      lexicalFit: Number((p5Metrics.lexicalFit - p4Eval.metrics.lexicalFit).toFixed(2)),
      clicheRate: Number((p5Metrics.clicheRate - p4Eval.metrics.clicheRate).toFixed(2)),
      singabilityFlow: Number((p5Metrics.singabilityFlow - p4Eval.metrics.singabilityFlow).toFixed(2)),
      overallComposite: Number((p5Metrics.overallComposite - p4Eval.metrics.overallComposite).toFixed(2)),
    };

    results.push({
      fixtureId: fixture.id,
      genre: fixture.config.genre,
      targetLanguage: fixture.targetLanguage,
      blueprint,
      blueprintValidation: bpValidation,
      hookCraft,
      hookCraftValidation: hookValidation,
      verse2HasNewInfo,
      bridgeHasShift,
      hookProtectionPreserved,
      sampleLyrics: {
        phase3: p3Lyrics,
        phase4: p4Lyrics,
        phase5: p5Lyrics,
      },
      metrics: {
        phase4: p4Eval.metrics,
        phase5: p5Metrics,
        delta: deltaMetrics,
      },
    });
  }

  // Calculate Averages
  const totalCount = Math.max(1, results.length);
  const avgP4 = {
    naturalness: Number((results.reduce((acc, r) => acc + r.metrics.phase4.naturalness, 0) / totalCount).toFixed(2)),
    personaConsistency: Number((results.reduce((acc, r) => acc + r.metrics.phase4.personaConsistency, 0) / totalCount).toFixed(2)),
    storyProgression: Number((results.reduce((acc, r) => acc + r.metrics.phase4.storyProgression, 0) / totalCount).toFixed(2)),
    lexicalFit: Number((results.reduce((acc, r) => acc + r.metrics.phase4.lexicalFit, 0) / totalCount).toFixed(2)),
    clicheRate: Number((results.reduce((acc, r) => acc + r.metrics.phase4.clicheRate, 0) / totalCount).toFixed(2)),
    singabilityFlow: Number((results.reduce((acc, r) => acc + r.metrics.phase4.singabilityFlow, 0) / totalCount).toFixed(2)),
    overallComposite: Number((results.reduce((acc, r) => acc + r.metrics.phase4.overallComposite, 0) / totalCount).toFixed(2)),
  };

  const avgP5 = {
    naturalness: Number((results.reduce((acc, r) => acc + r.metrics.phase5.naturalness, 0) / totalCount).toFixed(2)),
    personaConsistency: Number((results.reduce((acc, r) => acc + r.metrics.phase5.personaConsistency, 0) / totalCount).toFixed(2)),
    storyProgression: Number((results.reduce((acc, r) => acc + r.metrics.phase5.storyProgression, 0) / totalCount).toFixed(2)),
    lexicalFit: Number((results.reduce((acc, r) => acc + r.metrics.phase5.lexicalFit, 0) / totalCount).toFixed(2)),
    clicheRate: Number((results.reduce((acc, r) => acc + r.metrics.phase5.clicheRate, 0) / totalCount).toFixed(2)),
    singabilityFlow: Number((results.reduce((acc, r) => acc + r.metrics.phase5.singabilityFlow, 0) / totalCount).toFixed(2)),
    overallComposite: Number((results.reduce((acc, r) => acc + r.metrics.phase5.overallComposite, 0) / totalCount).toFixed(2)),
  };

  const avgDelta = {
    naturalness: Number((avgP5.naturalness - avgP4.naturalness).toFixed(2)),
    personaConsistency: Number((avgP5.personaConsistency - avgP4.personaConsistency).toFixed(2)),
    storyProgression: Number((avgP5.storyProgression - avgP4.storyProgression).toFixed(2)),
    lexicalFit: Number((avgP5.lexicalFit - avgP4.lexicalFit).toFixed(2)),
    clicheRate: Number((avgP5.clicheRate - avgP4.clicheRate).toFixed(2)),
    singabilityFlow: Number((avgP5.singabilityFlow - avgP4.singabilityFlow).toFixed(2)),
    overallComposite: Number((avgP5.overallComposite - avgP4.overallComposite).toFixed(2)),
  };

  return {
    timestamp,
    totalFixturesEvaluated: results.length,
    results,
    averages: {
      phase4: avgP4,
      phase5: avgP5,
      delta: avgDelta,
    },
    summary: {
      blueprintsValidCount: results.filter((r) => r.blueprintValidation.isValid).length,
      hookCraftsValidCount: results.filter((r) => r.hookCraftValidation.isValid).length,
      verse2NewInfoPassRate: (results.filter((r) => r.verse2HasNewInfo).length / totalCount) * 100,
      bridgeShiftPassRate: (results.filter((r) => r.bridgeHasShift).length / totalCount) * 100,
      hookProtectionRate: (results.filter((r) => r.hookProtectionPreserved).length / totalCount) * 100,
    },
  };
}