import { GoogleGenAI } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import {
  LyricCraftEditorialReport,
  LineCraftAssessment,
} from './editor';

export interface LyricRewriteRecord {
  sectionIndex: number;
  sectionType: string;
  lineIndex: number;
  originalText: string;
  rewrittenText: string;
  strategy: string;
  reason: string;
}

export interface LyricRewriteExecutionResult {
  updatedSections: Array<{
    type: string;
    performanceDirection?: string;
    musicDirection?: string;
    lyrics: string[];
  }>;
  records: LyricRewriteRecord[];
  totalRewrittenLines: number;
  roundsExecuted: number;
}

interface RewriteItem {
  lineIndex: number;
  text: string;
}

interface RewriteResponse {
  rewrites: RewriteItem[];
}

function cleanJsonResponse(text: string): string {
  let value = text.trim();

  if (value.startsWith('```')) {
    value = value
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  const firstBrace = value.indexOf('{');
  const lastBrace = value.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    value = value.slice(firstBrace, lastBrace + 1);
  }

  return value;
}

function normalizeText(text: string): string {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRewriteTargets(
  report: LyricCraftEditorialReport,
  sectionIndex: number,
): LineCraftAssessment[] {
  const section = report.sections.find(
    (s) => s.sectionIndex === sectionIndex,
  );

  if (!section) return [];

  return section.lines.filter(
    (line) =>
      !line.isProtected &&
      (line.status === 'REVIEW' || line.status === 'REWRITE'),
  );
}

function buildRewritePrompt(
  section: {
    type: string;
    lyrics: string[];
  },
  targets: LineCraftAssessment[],
  context: BuiltCreativeContext,
): string {
  const targetLanguage = context.targetContentLanguage || 'ไทย';

  const targetIndexes = targets.map((x) => x.lineIndex);

  const issueData = targets.map((target) => ({
    lineIndex: target.lineIndex,
    originalText: target.originalText,
    status: target.status,
    strategy: target.rewriteRecommendation?.strategy || 'improve',
    reason:
      target.rewriteRecommendation?.reason ||
      'Improve lyrical craft.',
    suggestedDirection:
      target.rewriteRecommendation?.suggestedDirection || '',
    issues: target.issues.map((issue) => ({
      type: issue.type,
      severity: issue.severity,
      diagnosis: issue.diagnosis,
      suggestedAction: issue.suggestedAction,
    })),
    universalScores: target.universalScores,
    languageScores: target.languageScores,
  }));

  return `
You are the FINAL PROFESSIONAL LYRIC EDITOR for an AI songwriting system.

Your task is to rewrite ONLY the flagged lyric lines.

DO NOT rewrite the whole song.
DO NOT invent a different story.
DO NOT change section order.
DO NOT add or remove lines.
DO NOT change the number of lines.
DO NOT rewrite protected hook lines.
DO NOT insert explanations.
DO NOT return markdown.

TARGET LANGUAGE:
${targetLanguage}

SECTION:
${section.type}

FULL SECTION LYRICS:
${JSON.stringify(section.lyrics, null, 2)}

FLAGGED LINE INDEXES:
${JSON.stringify(targetIndexes)}

SONG CONTEXT:
Story:
${context.story || ''}

Genres:
${(context.allGenres || []).join(', ')}

Moods:
${(context.allMoods || []).join(', ')}

Songwriting style:
${context.songwritingStyleStr || ''}

Word tone:
${context.wordToneStr || ''}

Language style:
${context.languageStyleStr || ''}

Rhythm:
${context.rhythmStr || ''}

BPM:
${context.bpmStr || ''}

Structure:
${context.structureStr || ''}

EDITORIAL ANALYSIS:
${JSON.stringify(issueData, null, 2)}

REWRITE PRINCIPLES:

1. Natural language comes first.
2. The lyric must sound like something a real songwriter would actually write and sing.
3. Preserve the original meaning unless the editorial issue specifically requires clarification.
4. Preserve the emotional perspective and story.
5. Replace generic emotional filler with concrete human details.
6. Prefer specific imagery over decorative clichés.
7. Use words that naturally belong together in the target language.
8. Avoid awkward translated-language constructions.
9. Avoid unnecessary metaphors.
10. Avoid random objects that are not grounded in the story.
11. Avoid repeating the same ending word unnecessarily.
12. Keep the line singable.
13. Respect the section function.
14. Verse = story and concrete details.
15. Pre-Chorus = escalation and anticipation.
16. Chorus = memorable emotional truth and hook.
17. Bridge = perspective shift or realization.
18. Outro = emotional closure.
19. Do not make every line rhyme artificially.
20. Do not force rhyme at the expense of natural language.
21. Keep approximately similar line length unless changing it clearly improves singability.
22. Do not make the lyrics sound like an AI-generated poem.
23. Do not use stock phrases merely because they sound poetic.
24. Preserve strong original lines whenever possible.
25. If a flagged line is already good except for one small issue, make the smallest possible correction.

IMPORTANT:
Only return replacements for the flagged line indexes.

OUTPUT EXACTLY THIS JSON FORMAT:

{
  "rewrites": [
    {
      "lineIndex": 0,
      "text": "rewritten lyric"
    }
  ]
}

Every flagged line must have exactly one replacement.
Do not return any other fields.
`;
}

async function rewriteSection(
  section: {
    type: string;
    lyrics: string[];
  },
  targets: LineCraftAssessment[],
  context: BuiltCreativeContext,
  ai: GoogleGenAI,
): Promise<RewriteItem[]> {
  if (targets.length === 0) {
    return [];
  }

  const prompt = buildRewritePrompt(section, targets, context);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.65,
    },
  });

  const rawText = response.text || '';

  if (!rawText.trim()) {
    throw new Error('AI returned an empty rewrite response.');
  }

  const parsed = JSON.parse(cleanJsonResponse(rawText)) as RewriteResponse;

  if (!parsed || !Array.isArray(parsed.rewrites)) {
    throw new Error('Invalid rewrite response: rewrites[] missing.');
  }

  const targetSet = new Set(targets.map((x) => x.lineIndex));
  const result: RewriteItem[] = [];

  for (const item of parsed.rewrites) {
    if (
      typeof item?.lineIndex !== 'number' ||
      !targetSet.has(item.lineIndex)
    ) {
      continue;
    }

    const text = normalizeText(item.text);

    if (!text) {
      continue;
    }

    result.push({
      lineIndex: item.lineIndex,
      text,
    });
  }

  return result;
}

export async function executeLyricCraftRewritePass(
  draft: {
    sections: Array<{
      type: string;
      performanceDirection?: string;
      musicDirection?: string;
      lyrics: string[];
    }>;
  },
  report: LyricCraftEditorialReport,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: {
    maxRounds?: number;
  } = {},
): Promise<LyricRewriteExecutionResult> {
  const updatedSections = draft.sections.map((section) => ({
    ...section,
    lyrics: [...section.lyrics],
  }));

  const records: LyricRewriteRecord[] = [];

  if (!ai) {
    console.warn(
      '[Lyric Craft Rewrite] AI client unavailable. Keeping original lyrics.',
    );

    return {
      updatedSections,
      records,
      totalRewrittenLines: 0,
      roundsExecuted: 0,
    };
  }

  const maxRounds = Math.max(1, options.maxRounds || 1);

  let totalRewrittenLines = 0;
  let roundsExecuted = 0;

  for (let round = 1; round <= maxRounds; round++) {
    let roundChanged = false;

    console.log(
      `[Lyric Craft Rewrite] Round ${round}/${maxRounds}`,
    );

    for (
      let sectionIndex = 0;
      sectionIndex < updatedSections.length;
      sectionIndex++
    ) {
      const section = updatedSections[sectionIndex];

      const targets = getRewriteTargets(report, sectionIndex);

      if (targets.length === 0) {
        continue;
      }

      console.log(
        `[Lyric Craft Rewrite] ${section.type}: rewriting ${targets.length} line(s)...`,
      );

      let replacements: RewriteItem[] = [];

      try {
        replacements = await rewriteSection(
          section,
          targets,
          context,
          ai,
        );
      } catch (error: any) {
        console.warn(
          `[Lyric Craft Rewrite] ${section.type} failed: ${error?.message || error}`,
        );
        continue;
      }

      const targetMap = new Map(
        targets.map((target) => [target.lineIndex, target]),
      );

      for (const replacement of replacements) {
        const target = targetMap.get(replacement.lineIndex);

        if (!target) {
          continue;
        }

        if (
          replacement.lineIndex < 0 ||
          replacement.lineIndex >= section.lyrics.length
        ) {
          continue;
        }

        const originalText = section.lyrics[replacement.lineIndex];

        if (
          normalizeText(originalText).toLowerCase() ===
          replacement.text.toLowerCase()
        ) {
          continue;
        }

        section.lyrics[replacement.lineIndex] = replacement.text;

        records.push({
          sectionIndex,
          sectionType: section.type,
          lineIndex: replacement.lineIndex,
          originalText,
          rewrittenText: replacement.text,
          strategy:
            target.rewriteRecommendation?.strategy ||
            'improve',
          reason:
            target.rewriteRecommendation?.reason ||
            'Editorial improvement',
        });

        totalRewrittenLines++;
        roundChanged = true;
      }
    }

    roundsExecuted = round;

    if (!roundChanged) {
      break;
    }
  }

  console.log(
    `[Lyric Craft Rewrite] Complete. Rewritten lines: ${totalRewrittenLines}`,
  );

  return {
    updatedSections,
    records,
    totalRewrittenLines,
    roundsExecuted,
  };
}