import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import {
  CandidateEvaluation,
  CriticReport,
  RewriteTarget,
  TargetedRewriteExecutionRecord,
} from './types';

/**
 * TARGETED REWRITE LAYER
 * Replaces ONLY the problematic lines identified by Critic while strictly preserving
 * protected lines, core semantic intent, character voice, and surrounding context.
 *
 * Core Rule: "GOOD ORIGINAL > WEAKER REWRITE" - If candidates do not beat original, KEEP ORIGINAL.
 */
export async function executeTargetedRewrite(
  draft: { sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> },
  criticReport: CriticReport,
  context: BuiltCreativeContext,
  ai?: GoogleGenAI,
  options: { maxRounds?: number } = {}
): Promise<{
  finalLyrics: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>;
  records: TargetedRewriteExecutionRecord[];
  totalRewrittenLines: number;
  roundsExecuted: number;
}> {
  const maxRounds = Math.min(2, Math.max(1, options.maxRounds || 1));
  let currentSections = JSON.parse(JSON.stringify(draft.sections));
  const records: TargetedRewriteExecutionRecord[] = [];
  let totalRewrittenLines = 0;

  // Build Protected Line Index Map: "sectionIdx-lineIdx" -> Reason
  const protectedMap = new Set<string>();
  criticReport.protectedLines.forEach((p) => {
    protectedMap.add(`${p.sectionIndex}-${p.lineIndex}`);
  });

  // Build Protected Section Set
  const protectedSectionsSet = new Set<number>();
  criticReport.protectedSections.forEach((ps) => {
    protectedSectionsSet.add(ps.sectionIndex);
  });

  // Filter valid targets (must not touch protected lines or protected sections)
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

  // Execute Targeted Rewrite for each target sequentially to maintain context integrity
  for (const target of actionableTargets) {
    const sec = currentSections[target.sectionIndex];
    if (!sec || !sec.lyrics) continue;

    const originalLines = target.lineIndices.map((idx) => sec.lyrics[idx] || '').filter(Boolean);
    if (originalLines.length === 0) continue;

    // Surrounding context lines for seamless cohesion
    const contextBefore = target.lineIndices[0] > 0
      ? sec.lyrics.slice(Math.max(0, target.lineIndices[0] - 2), target.lineIndices[0])
      : [];
    const lastLineIdx = target.lineIndices[target.lineIndices.length - 1];
    const contextAfter = lastLineIdx < sec.lyrics.length - 1
      ? sec.lyrics.slice(lastLineIdx + 1, lastLineIdx + 3)
      : [];

    const issuesSummary = target.issues.map((i) => `- [${i.type} / ${i.severity}]: ${i.diagnosis} (หลักฐาน: "${i.evidence}")`).join('\n');

    const evidenceInfo = target.relevantSceneEvidence && target.relevantSceneEvidence.length > 0
      ? `\n- ข้อมูลหลักฐานในฉาก/เรื่อง (Scene Evidence): ${target.relevantSceneEvidence.join(', ')}`
      : '';
    const voiceInfo = target.speakerVoice ? `\n- เสียงตัวละคร (Speaker Voice): ${target.speakerVoice}` : '';
    const preferredInfo = target.preferredLexicalCandidates && target.preferredLexicalCandidates.length > 0
      ? `\n- คลังคำศัพท์ที่เหมาะสม (Preferred Lexical): ${target.preferredLexicalCandidates.join(', ')}`
      : '';
    const avoidInfo = target.contextualAvoidance && target.contextualAvoidance.length > 0
      ? `\n- คำที่ควรหลีกเลี่ยง (Avoid Words): ${target.contextualAvoidance.join(', ')}`
      : '';
    const strategyInfo = target.rewriteStrategy ? `\n- กลยุทธ์การปรับแก้ (Strategy): ${target.rewriteStrategy}` : '';

    const systemInstruction = `คุณคือ "Master Song Lyric Polisher & Targeted Rewrite Specialist"
หน้าที่ของคุณคือแต่งประโยคทางเลือก (2-4 Rewrite Candidates) เพื่อแก้ปัญหาเฉพาะบรรทัดที่ได้รับมอบหมาย โดยไม่เปลี่ยนโครงสร้างของส่วนอื่น ตามหลักการ Evidence-Grounded Specificity (Phase 5.5B)

กฎเหล็กของการปรับแก้เฉพาะจุด (Targeted Rewrite):
1. แก้ให้น้อยที่สุด (Minimal Surgery): แต่งเฉพาะ \${target.lineIndices.length} บรรทัดนี้เท่านั้น
2. รักษาเจตนาเดิม (Preserve Semantic Intent): คงความหมายหลัก, มุมมองผู้เล่า (POV), เรื่องราว, อารมณ์, และบุคลิกตัวละครเดิมไว้
3. Evidence-Grounded Fact Safety: ยึดโยงกับหลักฐานของเรื่อง (Tier 1) และโลกของเพลง (Tier 2) ห้ามนำคำตามสูตรสำเร็จของแนวเพลง (Tier 3) มายัดเยียดถ้าเรื่องไม่ได้ระบุ
4. Useful Specificity (Specificity != Object Dump): บรรยายภาพที่เป็นรูปธรรมและมีบทบาทต่อการเล่าเรื่อง (Narrative Utility) ห้ามร่ายชื่อสิ่งของติดกันลอย ๆ
5. Anti-Genericness: หลีกเลี่ยงประโยคสำเร็จรูปที่สลับไปใส่เพลงไหนก็ได้ (เช่น "รักเธอสุดหัวใจ", "คิดถึงเธอเหลือเกิน", "รอวันเธอกลับมา", "ใจดวงน้อย")
6. Naturalness Hierarchy (L3 > L2 > L1): ประโยคต้องคมคาย น่าจดจำ และเป็นภาษาที่ตัวละครพูดจริง ไม่ประดิดประดอยหรือเป็นภาษาหุ่นยนต์
7. รักษาสัมผัสและจังหวะ (Prosody & Rhyme Match): 
   - [สำคัญ] ต้องนับจำนวนพยางค์ให้ใกล้เคียงกับประโยคเดิมที่ถูกลบไป หรือล้อไปกับ "บรรทัดก่อนหน้า/ถัดไป" 
   - [สำคัญ] คำสุดท้ายของ Candidate ต้องส่งสัมผัสสระ (Rhyme) ไปยังบรรทัดถัดไป หรือรับสัมผัสจากบรรทัดก่อนหน้าให้ลงตัว
8. ร้อยเรียงไร้รอยต่อ (Contextual Flow): คำลงท้ายและจังหวะต้องเชื่อมโยงกับบริบทก่อนหน้า (\${contextBefore.join(' / ') || 'ไม่มี'}) และบริบทถัดไป (\${contextAfter.join(' / ') || 'ไม่มี'}) ได้อย่างลื่นไหล
9. ภาษาเป้าหมาย: แต่งเป็นภาษา "\${context.targetContentLanguage}" เท่านั้น`;

    const prompt = `โปรดสร้าง 2 ถึง 4 Rewrite Candidates ที่ดีที่สุดเพื่อแทนที่บรรทัดที่มีปัญหา:

=== ข้อมูลบริบทเพลง ===
- แนวเพลง: ${context.genresStr}
- อารมณ์: ${context.moodsStr}
- ภาษา: ${context.targetContentLanguage}
- โทนคำ & บุคลิก: ${context.wordToneStr || 'ธรรมชาติ'} / ${context.languageStyleStr || 'ภาษาพูด'}${voiceInfo}${evidenceInfo}${preferredInfo}${avoidInfo}${strategyInfo}${context.rolePromptBlock ? `\n\n${context.rolePromptBlock}` : ''}

=== ตำแหน่งที่ต้องแก้ไข ===
- ส่วน: [${target.sectionType}] (บรรทัดที่ ${target.lineIndices.join(', ')})
- บรรทัดเดิม (Original Lines):
${originalLines.map((l, i) => `  [${i + 1}] "${l}"`).join('\n')}

=== บริบทแวดล้อม (Context) ===
- บรรทัดก่อนหน้า: ${contextBefore.map((l) => `"${l}"`).join(' | ') || '(ต้นท่อน)'}
- บรรทัดถัดไป: ${contextAfter.map((l) => `"${l}"`).join(' | ') || '(ท้ายท่อน)'}

=== ข้อบกพร่องที่ Critic วินิจฉัย (Issues to Fix) ===
${issuesSummary}
คำแนะนำเพิ่มเติม: ${target.instructions}

โปรดสร้าง Candidate พร้อมประเมินคุณภาพในแต่ละด้าน (1-5) และระบุว่า Candidate ใดดีกว่าบรรทัดเดิมอย่างแท้จริง ส่งคืนเป็น JSON`;

    try {
      const { response } = await callGeminiWithFallback(ai, {
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
                      description: `จำนวนบรรทัดต้องเท่ากับ ${target.lineIndices.length} บรรทัดพอดี`,
                    },
                    naturalness: { type: Type.NUMBER, description: 'ความเป็นธรรมชาติ 1-5' },
                    semanticPreservation: { type: Type.NUMBER, description: 'รักษาความหมายเดิม 1-5' },
                    personaFit: { type: Type.NUMBER, description: 'ตรงกับบุคลิกตัวละคร 1-5' },
                    genreFit: { type: Type.NUMBER, description: 'ตรงกับแนวเพลง 1-5' },
                    singability: { type: Type.NUMBER, description: 'ความเข้าปากเวลาร้อง 1-5' },
                    originality: { type: Type.NUMBER, description: 'ความคมคายของภาพ 1-5' },
                    specificityScore: { type: Type.NUMBER, description: 'ความเฉพาะเจาะจงของเรื่อง 1-5' },
                    narrativeUtilityScore: { type: Type.NUMBER, description: 'ประโยชน์ต่อการเล่าเรื่อง 1-5' },
                    evidenceGroundingScore: { type: Type.NUMBER, description: 'ความมีหลักฐานรองรับ 1-5' },
                    isBetterThanOriginal: { type: Type.BOOLEAN },
                    rationale: { type: Type.STRING },
                  },
                  required: [
                    'candidateText',
                    'naturalness',
                    'semanticPreservation',
                    'personaFit',
                    'genreFit',
                    'singability',
                    'originality',
                    'isBetterThanOriginal',
                    'rationale',
                  ],
                },
              },
              recommendedCandidateIndex: {
                type: Type.INTEGER,
                description: '0-based index ของ candidate ที่ดีที่สุด หรือ -1 หากไม่มีอันไหนดีกว่าต้นฉบับ',
              },
              decisionRationale: { type: Type.STRING },
            },
            required: ['candidates', 'recommendedCandidateIndex', 'decisionRationale'],
          },
        },
      });

      const parsedRewrite = JSON.parse(response.text?.trim() || '{}');
      const candidates: CandidateEvaluation[] = (parsedRewrite.candidates || []).map((c: any) => {
        const nat = Number(c.naturalness || 3);
        const sem = Number(c.semanticPreservation || 3);
        const per = Number(c.personaFit || 3);
        const gen = Number(c.genreFit || 3);
        const sing = Number(c.singability || 3);
        const orig = Number(c.originality || 3);
        const spec = Number(c.specificityScore || nat);
        const util = Number(c.narrativeUtilityScore || sem);
        const ev = Number(c.evidenceGroundingScore || 4);
        const composite = Number(((nat * 1.5 + sem + per + gen + sing + orig + spec + util + ev) / 9.5).toFixed(2));
        return {
          candidateText: Array.isArray(c.candidateText) ? c.candidateText : [String(c.candidateText || '')],
          naturalness: nat,
          semanticPreservation: sem,
          personaFit: per,
          genreFit: gen,
          singability: sing,
          originality: orig,
          specificityScore: spec,
          narrativeUtilityScore: util,
          evidenceGroundingScore: ev,
          compositeScore: composite,
          isBetterThanOriginal: Boolean(c.isBetterThanOriginal ?? (composite >= 4.0)),
          rationale: c.rationale || '',
        };
      });

      let chosenCandidate: CandidateEvaluation | null = null;
      const recIdx = Number(parsedRewrite.recommendedCandidateIndex ?? -1);

      if (recIdx >= 0 && recIdx < candidates.length && candidates[recIdx].isBetterThanOriginal) {
        chosenCandidate = candidates[recIdx];
      } else {
        // Fallback: Pick highest composite score that is marked better
        const viable = candidates.filter((c) => c.isBetterThanOriginal && c.candidateText.length === target.lineIndices.length);
        if (viable.length > 0) {
          viable.sort((a, b) => b.compositeScore - a.compositeScore);
          chosenCandidate = viable[0];
        }
      }

      // Check Decision Rule: Good Original > Weaker Rewrite
      if (chosenCandidate && chosenCandidate.candidateText.length === target.lineIndices.length) {
        // Apply rewrite to target line indices
        target.lineIndices.forEach((lineIdx, idxInTarget) => {
          sec.lyrics[lineIdx] = chosenCandidate!.candidateText[idxInTarget];
        });
        totalRewrittenLines += target.lineIndices.length;

        records.push({
          targetId: target.targetId,
          sectionIndex: target.sectionIndex,
          sectionType: target.sectionType,
          originalLines,
          candidatesEvaluated: candidates,
          selectedLines: chosenCandidate.candidateText,
          wasOriginalRetained: false,
          reason: chosenCandidate.rationale || parsedRewrite.decisionRationale || 'Candidate improved naturalness and resolved flagged issues.',
        });

        // Audit Logging (Rule: [TargetedRewrite] log format)
        console.log(`[TargetedRewrite]`);
        console.log(`section: ${target.sectionType} (#${target.sectionIndex})`);
        console.log(`original: "${originalLines.join(' / ')}"`);
        console.log(`candidate: "${chosenCandidate.candidateText.join(' / ')}"`);
        console.log(`selected: REWRITTEN (${chosenCandidate.compositeScore}/5.0)`);
        console.log(`reason: ${chosenCandidate.rationale || parsedRewrite.decisionRationale}`);
      } else {
        // Retain Original
        records.push({
          targetId: target.targetId,
          sectionIndex: target.sectionIndex,
          sectionType: target.sectionType,
          originalLines,
          candidatesEvaluated: candidates,
          selectedLines: originalLines,
          wasOriginalRetained: true,
          reason: 'No generated candidate surpassed the original line in quality. Retained original as per safety rubric.',
        });

        console.log(`[TargetedRewrite]`);
        console.log(`section: ${target.sectionType} (#${target.sectionIndex})`);
        console.log(`original: "${originalLines.join(' / ')}"`);
        console.log(`candidate: None superior`);
        console.log(`selected: RETAINED ORIGINAL`);
        console.log(`reason: Good original preserved (Rule 15: No Forced Rewrite)`);
      }
    } catch (err: any) {
      console.error(`[TargetedRewrite] Error executing rewrite on target #${target.targetId}:`, err.message);
      // Safe fallback: Retain original line on error
      records.push({
        targetId: target.targetId,
        sectionIndex: target.sectionIndex,
        sectionType: target.sectionType,
        originalLines,
        candidatesEvaluated: [],
        selectedLines: originalLines,
        wasOriginalRetained: true,
        reason: `Rewrite process encountered error (${err.message}). Retained original.`,
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
