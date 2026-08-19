import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import {
  CandidateEvaluation,
  CriticReport,
  RewriteTarget,
} from './types';

/**
 * TARGETED REWRITE LAYER
 * Replaces ONLY the problematic lines identified by Critic while strictly preserving
 * protected lines, core semantic intent, character voice, and surrounding context.
 */
export async function executeTargetedRewrite(
  draft: { sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> },
  criticReport: CriticReport,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: { maxRounds?: number } = {}
): Promise<{
  finalLyrics: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>;
  records: any[];
  totalRewrittenLines: number;
  roundsExecuted: number;
}> {
  const maxRounds = Math.min(2, Math.max(1, options.maxRounds || 1));
  let currentSections = JSON.parse(JSON.stringify(draft.sections));
  const records: any[] = [];
  let totalRewrittenLines = 0;

  // Build Protected Line Index Map
  const protectedMap = new Set<string>();
  (criticReport.protectedLines || []).forEach((p) => {
    protectedMap.add(`${p.sectionIndex}-${p.lineIndex}`);
  });

  // Build Protected Section Set
  const protectedSectionsSet = new Set<number>();
  (criticReport.protectedSections || []).forEach((ps) => {
    protectedSectionsSet.add(ps.sectionIndex);
  });

  // Filter valid targets
  const actionableTargets: RewriteTarget[] = (criticReport.rewriteTargets || []).filter((target) => {
    if (protectedSectionsSet.has(target.sectionIndex)) {
      console.log(`[TargetedRewrite] Skipping target in protected section #${target.sectionIndex} (${target.sectionType})`);
      return false;
    }
    const hasProtectedOverlap = target.lineIndices.some((lIdx) => protectedMap.has(`${target.sectionIndex}-${lIdx}`));
    if (hasProtectedOverlap) {
      console.log(`[TargetedRewrite] Skipping target #${target.targetId} due to overlap with protected lines.`);
      return false;
    }
    return true;
  });

  if (actionableTargets.length === 0) {
    console.log('[TargetedRewrite] No actionable targets to rewrite. Retaining original lyrics.');
    return {
      finalLyrics: currentSections,
      records: [],
      totalRewrittenLines: 0,
      roundsExecuted: 1,
    };
  }

  console.log(`[TargetedRewrite] Executing targeted rewrite on ${actionableTargets.length} specific target(s)...`);

  for (const target of actionableTargets) {
    const sec = currentSections[target.sectionIndex];
    if (!sec || !sec.lyrics) continue;

    const originalLines = target.lineIndices.map((idx) => sec.lyrics[idx] || '').filter(Boolean);
    if (originalLines.length === 0) continue;

    const contextBefore = target.lineIndices[0] > 0
      ? sec.lyrics.slice(Math.max(0, target.lineIndices[0] - 2), target.lineIndices[0])
      : [];
    const lastLineIdx = target.lineIndices[target.lineIndices.length - 1];
    const contextAfter = lastLineIdx < sec.lyrics.length - 1
      ? sec.lyrics.slice(lastLineIdx + 1, lastLineIdx + 3)
      : [];

    const issuesSummary = target.issues.map((i) => `- [${i.type} / ${i.severity}]: ${i.diagnosis} (หลักฐาน: "${i.evidence}")`).join('\n');
    const voiceInfo = target.speakerVoice ? `\n- เสียงตัวละคร: ${target.speakerVoice}` : '';
    const preferredInfo = target.preferredLexicalCandidates && target.preferredLexicalCandidates.length > 0
      ? `\n- คลังคำศัพท์ที่เหมาะสม: ${target.preferredLexicalCandidates.join(', ')}`
      : '';
    const avoidInfo = target.contextualAvoidance && target.contextualAvoidance.length > 0
      ? `\n- คำที่ควรหลีกเลี่ยง: ${target.contextualAvoidance.join(', ')}`
      : '';

    const systemInstruction = `คุณคือ "Master Song Lyric Polisher & Targeted Rewrite Specialist"
หน้าที่ของคุณคือแต่งประโยคทางเลือก (2-4 Rewrite Candidates) เพื่อแก้ปัญหาเฉพาะบรรทัดที่ได้รับมอบหมาย ให้ไพเราะ คมคาย และเข้ากับแนวดนตรี "${context.genresStr || 'ดนตรีร่วมสมัย'}"

กฎเหล็กของการปรับแก้เฉพาะจุด (Targeted Rewrite):
1. แต่งเฉพาะ ${target.lineIndices.length} บรรทัดนี้เท่านั้น
2. คงความหมายหลัก, เรื่องราว, อารมณ์, และบุคลิกตัวละครเดิมไว้
3. ปรับสำนวนตามแนวดนตรี (Genre-Adaptive Voice)
4. ห้ามนำชื่ออุปกรณ์ช่างหรือสิ่งของเฉพาะทางมายัดเยียดแทนความรู้สึก
5. คำสุดท้ายของ Candidate ต้องส่งหรือรับสัมผัสสระกับบรรทัดข้างเคียงอย่างลงตัว
6. ภาษาเป้าหมาย: แต่งเป็นภาษา "${context.targetContentLanguage}" เท่านั้น`;

    const prompt = `โปรดสร้าง 2 ถึง 4 Rewrite Candidates ที่ดีที่สุดเพื่อแทนที่บรรทัดที่มีปัญหา:

=== ข้อมูลบริบทเพลง ===
- แนวดนตรี: ${context.genresStr}
- อารมณ์เพลง: ${context.moodsStr}
- ภาษา: ${context.targetContentLanguage}${voiceInfo}${preferredInfo}${avoidInfo}

=== ตำแหน่งที่ต้องแก้ไข ===
- ส่วน: [${target.sectionType}] (บรรทัดที่ ${target.lineIndices.join(', ')})
- บรรทัดเดิม:
${originalLines.map((l, i) => `  [${i + 1}] "${l}"`).join('\n')}

=== บริบทแวดล้อม ===
- บรรทัดก่อนหน้า: ${contextBefore.map((l: string) => `"${l}"`).join(' | ') || '(ต้นท่อน)'}
- บรรทัดถัดไป: ${contextAfter.map((l: string) => `"${l}"`).join(' | ') || '(ท้ายท่อน)'}

=== ข้อบกพร่องที่ต้องแก้ ===
${issuesSummary}
คำแนะนำเพิ่มเติม: ${target.instructions}

โปรดส่งคืนเป็น JSON ตาม Schema`;

    try {
      const { response } = await callGeminiWithFallback(ai!, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    candidateText: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    naturalness: { type: Type.NUMBER },
                    semanticPreservation: { type: Type.NUMBER },
                    personaFit: { type: Type.NUMBER },
                    genreFit: { type: Type.NUMBER },
                    singability: { type: Type.NUMBER },
                    originality: { type: Type.NUMBER },
                    isBetterThanOriginal: { type: Type.BOOLEAN },
                    rationale: { type: Type.STRING },
                  },
                  required: ['candidateText', 'naturalness', 'semanticPreservation', 'personaFit', 'genreFit', 'singability', 'originality', 'isBetterThanOriginal', 'rationale'],
                },
              },
              recommendedCandidateIndex: { type: Type.INTEGER },
              decisionRationale: { type: Type.STRING },
            },
            required: ['candidates', 'recommendedCandidateIndex', 'decisionRationale'],
          },
        },
      });

      const parsedRewrite = JSON.parse(response.text?.trim() || '{}');
      const candidates: CandidateEvaluation[] = (parsedRewrite.candidates || []).map((c: any) => ({
        candidateText: Array.isArray(c.candidateText) ? c.candidateText : [String(c.candidateText || '')],
        naturalness: Number(c.naturalness || 4),
        semanticPreservation: Number(c.semanticPreservation || 4),
        personaFit: Number(c.personaFit || 4),
        genreFit: Number(c.genreFit || 4),
        singability: Number(c.singability || 4),
        originality: Number(c.originality || 4),
        specificityScore: Number(c.specificityScore || 4),
        narrativeUtilityScore: Number(c.narrativeUtilityScore || 4),
        evidenceGroundingScore: Number(c.evidenceGroundingScore || 4),
        compositeScore: Number(((Number(c.naturalness || 4) + Number(c.semanticPreservation || 4) + Number(c.personaFit || 4) + Number(c.genreFit || 4) + Number(c.singability || 4)) / 5).toFixed(2)),
        isBetterThanOriginal: Boolean(c.isBetterThanOriginal ?? true),
        rationale: c.rationale || '',
      }));

      let chosenCandidate: CandidateEvaluation | null = null;
      const recIdx = Number(parsedRewrite.recommendedCandidateIndex ?? -1);

      if (recIdx >= 0 && recIdx < candidates.length && candidates[recIdx].isBetterThanOriginal) {
        chosenCandidate = candidates[recIdx];
      } else {
        const viable = candidates.filter((c) => c.isBetterThanOriginal && c.candidateText.length === target.lineIndices.length);
        if (viable.length > 0) {
          chosenCandidate = viable[0];
        }
      }

      const targetIdStr = String(target.targetId || `target-${target.sectionIndex}-${target.lineIndices.join('-')}`);

      if (chosenCandidate && chosenCandidate.candidateText.length === target.lineIndices.length) {
        target.lineIndices.forEach((lineIdx, idxInTarget) => {
          sec.lyrics[lineIdx] = chosenCandidate!.candidateText[idxInTarget];
        });
        totalRewrittenLines += target.lineIndices.length;

        records.push({
          targetId: targetIdStr,
          sectionIndex: target.sectionIndex,
          sectionType: target.sectionType,
          originalLines,
          candidatesEvaluated: candidates,
          selectedLines: chosenCandidate.candidateText,
          wasOriginalRetained: false,
          reason: chosenCandidate.rationale || parsedRewrite.decisionRationale || 'Candidate improved naturalness.',
        });
      } else {
        records.push({
          targetId: targetIdStr,
          sectionIndex: target.sectionIndex,
          sectionType: target.sectionType,
          originalLines,
          candidatesEvaluated: candidates,
          selectedLines: originalLines,
          wasOriginalRetained: true,
          reason: 'Good original preserved.',
        });
      }
    } catch (err: any) {
      console.error(`[TargetedRewrite] Error on target #${target.targetId}:`, err.message);
      records.push({
        targetId: String(target.targetId || 'target-err'),
        sectionIndex: target.sectionIndex,
        sectionType: target.sectionType,
        originalLines,
        candidatesEvaluated: [],
        selectedLines: originalLines,
        wasOriginalRetained: true,
        reason: `Encountered error (${err.message}). Retained original.`,
      });
    }
  }

  return {
    finalLyrics: currentSections,
    records,
    totalRewrittenLines,
    roundsExecuted: 1,
  };
}