import { GoogleGenAI } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { evaluateLyricsWithCritic } from './critic';
import { executeTargetedRewrite } from './targetedRewrite';
import { executeLyricCraftEditorialPass, LyricCraftEditorialReport } from './editor';
import { executeFinalQA, FinalQAReport } from './qa';
import {
  CriticReport,
  SongwritingCriticRewriteResult,
} from './types';

export * from './types';
export * from './rules';
export * from './critic';
export * from './targetedRewrite';
export * from './editor';
export * from './profiles';
export * from './qa';
export * from './blueprint';
export * from './hookCraft';
export * from './roles/schema';
export * from './roles/registry';
export * from './roles/resolver';
export * from './roles/promptAdapter';

/**
 * Orchestrator: Songwriting Critic + Targeted Rewrite + Lyric Craft Editor Layer
 */
export async function runSongwritingCriticAndRewrite(
  draft: { sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> },
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: { maxRounds?: number; protectedHookLines?: string[] } = {}
): Promise<SongwritingCriticRewriteResult> {
  if (!draft || !draft.sections || draft.sections.length === 0) {
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
      },
      rewriteRecords: [] as any[],
      totalRewrittenLines: 0,
      roundsExecuted: 0,
      finalQA: {
        passed: defaultQA.passed,
        issuesFound: defaultQA.issuesFound,
        qaScore: defaultQA.qaScore,
      },
    } as SongwritingCriticRewriteResult;
  }

  console.log(`[SongCritic Pipeline] Step 1: Evaluating draft lyrics with Songwriting Critic...`);
  const criticReport = await evaluateLyricsWithCritic(draft, context, ai);

  if (options.protectedHookLines && options.protectedHookLines.length > 0) {
    const hookLinesSet = new Set(options.protectedHookLines.map((h) => h.trim().toLowerCase()));
    draft.sections.forEach((sec, sIdx) => {
      (sec.lyrics || []).forEach((line, lIdx) => {
        if (hookLinesSet.has(line.trim().toLowerCase())) {
          criticReport.protectedLines.push({
            sectionIndex: sIdx,
            sectionType: sec.type,
            lineIndex: lIdx,
            text: line,
            reason: 'Selected Primary Hook Line from Hook Craft (PROTECTED)',
          });
        }
      });
    });
  }

  let finalLyrics = draft.sections;
  let rewriteRecords: any[] = [];
  let totalRewrittenLines = 0;
  let roundsExecuted = 0;

  if (criticReport.overallStatus !== 'PASS' && criticReport.rewriteTargets.length > 0) {
    console.log(`[SongCritic Pipeline] Step 2: Executing Targeted Rewrite on ${criticReport.rewriteTargets.length} target(s)...`);
    const rewriteResult = await executeTargetedRewrite(
      draft,
      criticReport,
      context,
      ai,
      { maxRounds: options.maxRounds || 1 }
    );
    finalLyrics = rewriteResult.finalLyrics;
    rewriteRecords = rewriteResult.records;
    totalRewrittenLines = rewriteResult.totalRewrittenLines;
    roundsExecuted = rewriteResult.roundsExecuted;
  } else {
    console.log(`[SongCritic Pipeline] Step 2: Preserving draft lyrics without modification.`);
  }

  console.log(`[SongCritic Pipeline] Step 2.5: Executing Lyric Craft Editorial Pass...`);
  let editorialReport: LyricCraftEditorialReport | undefined;
  try {
    const craftEditorialResult = await executeLyricCraftEditorialPass(
      { sections: finalLyrics },
      context,
      ai,
      { protectedHookLines: options.protectedHookLines }
    );
    finalLyrics = craftEditorialResult.updatedSections;
    editorialReport = craftEditorialResult.report;
  } catch (editorErr: any) {
    console.warn(`[SongCritic Pipeline] Warning in Editorial pass: ${editorErr.message}`);
  }

  const finalQA = executeFinalQA(finalLyrics, context);
  console.log(`[SongCritic Pipeline] Step 3: Final QA complete. Passed: ${finalQA.passed}, QA Score: ${finalQA.qaScore}/100.`);

  return {
    originalLyrics: draft.sections,
    finalLyrics,
    criticReport,
    rewriteRecords: rewriteRecords as any,
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