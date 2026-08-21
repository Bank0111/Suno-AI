import { GoogleGenAI } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';

import { evaluateLyricsWithCritic } from './critic';
import { executeTargetedRewrite } from './targetedRewrite';
import {
  executeLyricCraftEditorialPass,
  LyricCraftEditorialReport,
} from './editor';
import { executeFinalQA } from './qa';

import {
  CriticReport,
  SongwritingCriticRewriteResult,
} from './types';

export * from './types';
export * from './rules';
export * from './critic';
export * from './targetedRewrite';
export * from './editor';
export * from './editorRewrite';
export * from './profiles';
export * from './qa';
export * from './blueprint';
export * from './hookCraft';
export * from './roles/schema';
export * from './roles/registry';
export * from './roles/resolver';
export * from './roles/promptAdapter';

type SongSection = {
  type: string;
  performanceDirection?: string;
  musicDirection?: string;
  lyrics: string[];
};

type SongDraft = {
  sections: SongSection[];
};

type PipelineOptions = {
  maxRounds?: number;
  protectedHookLines?: string[];
};

/**
 * Songwriting Critic Pipeline
 *
 * Pipeline:
 *
 * 1. Critic
 * 2. Targeted Rewrite
 * 3. Lyric Craft Editorial
 * 4. Final QA
 *
 * The orchestrator does not generate lyrics itself.
 * It coordinates the specialized songwriting layers.
 */
export async function runSongwritingCriticAndRewrite(
  draft: SongDraft,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: PipelineOptions = {}
): Promise<SongwritingCriticRewriteResult> {
  // ------------------------------------------------------------
  // 0. INPUT VALIDATION
  // ------------------------------------------------------------

  if (!draft || !Array.isArray(draft.sections) || draft.sections.length === 0) {
    const defaultQA = executeFinalQA([], context);

    return {
      originalLyrics: draft?.sections || [],
      finalLyrics: draft?.sections || [],

      criticReport: {
        evaluationType: 'LLM-based automated evaluation',
        overallStatus: 'PASS',
        overallScore: 5.0,

        sections: [],
        globalIssues: [],
        protectedLines: [],
        protectedSections: [],
        rewriteTargets: [],

        timestamp: new Date().toISOString(),

        rubricBreakdown: {
          naturalnessScore: 5.0,
          personaScore: 5.0,
          storyProgressionScore: 5.0,
          lexicalFitScore: 5.0,
          clicheAvoidanceScore: 5.0,
          singabilityFlowScore: 5.0,
          hookStrengthScore: 5.0,
          sectionFunctionScore: 5.0,
        },
      } as CriticReport,

      rewriteRecords: [],
      totalRewrittenLines: 0,
      roundsExecuted: 0,

      finalQA: {
        passed: defaultQA.passed,
        issuesFound: defaultQA.issuesFound,
        qaScore: defaultQA.qaScore,
      },
    } as SongwritingCriticRewriteResult;
  }

  // ------------------------------------------------------------
  // 1. NORMALIZE OPTIONS
  // ------------------------------------------------------------

  const maxRounds = Math.max(
    1,
    Math.min(
      options.maxRounds ?? 2,
      3
    )
  );

  const protectedHookLines = Array.isArray(options.protectedHookLines)
    ? options.protectedHookLines
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  console.log('');
  console.log('============================================================');
  console.log('             SONGWRITING CRITIC PIPELINE');
  console.log('============================================================');
  console.log(`Sections              : ${draft.sections.length}`);
  console.log(`Protected hook lines  : ${protectedHookLines.length}`);
  console.log(`Maximum rewrite rounds: ${maxRounds}`);
  console.log('============================================================');
  console.log('');

  // ------------------------------------------------------------
  // 2. CRITIC
  // ------------------------------------------------------------

  console.log(
    '[SongCritic Pipeline] Step 1: Evaluating draft lyrics with Songwriting Critic...'
  );

  const criticReport = await evaluateLyricsWithCritic(
    draft,
    context,
    ai
  );

  // ------------------------------------------------------------
  // 2.1 PROTECT PRIMARY HOOK
  // ------------------------------------------------------------

  if (protectedHookLines.length > 0) {
    const hookLinesSet = new Set(
      protectedHookLines.map((line) => line.toLowerCase())
    );

    for (let sectionIndex = 0; sectionIndex < draft.sections.length; sectionIndex++) {
      const section = draft.sections[sectionIndex];

      for (let lineIndex = 0; lineIndex < section.lyrics.length; lineIndex++) {
        const line = section.lyrics[lineIndex];

        if (!line || !line.trim()) {
          continue;
        }

        const normalizedLine = line.trim().toLowerCase();

        if (hookLinesSet.has(normalizedLine)) {
          const alreadyProtected = criticReport.protectedLines.some(
            (protectedLine) =>
              protectedLine.sectionIndex === sectionIndex &&
              protectedLine.lineIndex === lineIndex &&
              protectedLine.text.trim().toLowerCase() === normalizedLine
          );

          if (!alreadyProtected) {
            criticReport.protectedLines.push({
              sectionIndex,
              sectionType: section.type,
              lineIndex,
              text: line,
              reason:
                'Selected Primary Hook Line from Hook Craft (PROTECTED)',
            });
          }
        }
      }
    }
  }

  console.log(
    `[SongCritic Pipeline] Critic status: ${criticReport.overallStatus}`
  );

  console.log(
    `[SongCritic Pipeline] Critic score: ${criticReport.overallScore}`
  );

  console.log(
    `[SongCritic Pipeline] Rewrite targets: ${criticReport.rewriteTargets.length}`
  );

  // ------------------------------------------------------------
  // 3. TARGETED REWRITE
  // ------------------------------------------------------------

  let finalLyrics: SongSection[] = draft.sections;
  let rewriteRecords: any[] = [];
  let totalRewrittenLines = 0;
  let roundsExecuted = 0;

  const shouldRewrite =
    criticReport.overallStatus !== 'PASS' &&
    criticReport.rewriteTargets.length > 0;

  if (shouldRewrite) {
    console.log('');
    console.log(
      `[SongCritic Pipeline] Step 2: Executing Targeted Rewrite`
    );

    console.log(
      `[SongCritic Pipeline] Targets: ${criticReport.rewriteTargets.length}`
    );

    console.log(
      `[SongCritic Pipeline] Max rounds: ${maxRounds}`
    );

    const rewriteResult = await executeTargetedRewrite(
      draft,
      criticReport,
      context,
      ai,
      {
        maxRounds,
      }
    );

    if (
      rewriteResult &&
      Array.isArray(rewriteResult.finalLyrics)
    ) {
      finalLyrics = rewriteResult.finalLyrics;
    }

    rewriteRecords = Array.isArray(rewriteResult?.records)
      ? rewriteResult.records
      : [];

    totalRewrittenLines =
      typeof rewriteResult?.totalRewrittenLines === 'number'
        ? rewriteResult.totalRewrittenLines
        : 0;

    roundsExecuted =
      typeof rewriteResult?.roundsExecuted === 'number'
        ? rewriteResult.roundsExecuted
        : 0;

    console.log(
      `[SongCritic Pipeline] Rewrite rounds executed: ${roundsExecuted}`
    );

    console.log(
      `[SongCritic Pipeline] Lines rewritten: ${totalRewrittenLines}`
    );
  } else {
    console.log('');
    console.log(
      '[SongCritic Pipeline] Step 2: No targeted rewrite required.'
    );
  }

  // ------------------------------------------------------------
  // 4. LYRIC CRAFT EDITORIAL PASS
  // ------------------------------------------------------------

  console.log('');
  console.log(
    '[SongCritic Pipeline] Step 2.5: Executing Lyric Craft Editorial Pass...'
  );

  let editorialReport: LyricCraftEditorialReport | undefined;

  try {
    const craftEditorialResult =
      await executeLyricCraftEditorialPass(
        {
          sections: finalLyrics,
        },
        context,
        ai,
        {
          protectedHookLines,
        }
      );

    if (
      craftEditorialResult &&
      Array.isArray(craftEditorialResult.updatedSections)
    ) {
      finalLyrics = craftEditorialResult.updatedSections;
    }

    editorialReport = craftEditorialResult?.report;

    console.log(
      '[SongCritic Pipeline] Editorial pass complete.'
    );
  } catch (editorErr: unknown) {
    const message =
      editorErr instanceof Error
        ? editorErr.message
        : String(editorErr);

    console.warn(
      `[SongCritic Pipeline] Editorial pass warning: ${message}`
    );

    console.warn(
      '[SongCritic Pipeline] Continuing with current lyrics.'
    );
  }

  // ------------------------------------------------------------
  // 5. FINAL QA
  // ------------------------------------------------------------

  console.log('');
  console.log(
    '[SongCritic Pipeline] Step 3: Running Final QA...'
  );

  const finalQA = executeFinalQA(
    finalLyrics,
    context
  );

  console.log(
    `[SongCritic Pipeline] Final QA passed: ${finalQA.passed}`
  );

  console.log(
    `[SongCritic Pipeline] Final QA score: ${finalQA.qaScore}/100`
  );

  console.log(
    `[SongCritic Pipeline] Final QA issues: ${finalQA.issuesFound.length}`
  );

  // ------------------------------------------------------------
  // 6. FINAL RESULT
  // ------------------------------------------------------------

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    '             SONGWRITING PIPELINE COMPLETE'
  );
  console.log(
    '============================================================'
  );

  console.log(
    `Rewrite rounds : ${roundsExecuted}`
  );

  console.log(
    `Lines rewritten: ${totalRewrittenLines}`
  );

  console.log(
    `Editorial      : ${editorialReport ? 'OK' : 'SKIPPED/FAILED'}`
  );

  console.log(
    `Final QA       : ${finalQA.passed ? 'PASS' : 'FAIL'}`
  );

  console.log(
    `QA Score       : ${finalQA.qaScore}/100`
  );

  console.log(
    '============================================================'
  );
  console.log('');

  return {
    originalLyrics: draft.sections,

    finalLyrics,

    criticReport,

    rewriteRecords,

    totalRewrittenLines,

    roundsExecuted,

    editorialReport,

    finalQA: {
      passed: finalQA.passed,
      issuesFound: finalQA.issuesFound,
      qaScore: finalQA.qaScore,
    },
  } as SongwritingCriticRewriteResult;
}