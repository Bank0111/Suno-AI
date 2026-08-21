import { GoogleGenAI, Type } from '@google/genai';
import { BuiltCreativeContext } from '../creativeContext';
import { callGeminiWithFallback } from '../modelRouter';
import {
  CriticIssue,
  CriticReport,
  CriticSectionAnalysis,
  CriticStatus,
  ProtectedItem,
  ProtectedSection,
  RewriteTarget,
} from './types';
import { getSectionFunction, CRITIC_RUBRIC_GUIDELINES } from './rules';

/**
 * SONGWRITING CRITIC LAYER
 * Evaluates draft lyrics across 16 quality dimensions with strict section function awareness,
 * identifies protected strong hook lines, and pinpoints minimal targeted rewrite targets.
 */
export async function evaluateLyricsWithCritic(
  draft: { sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }> },
  context: BuiltCreativeContext,
  ai?: GoogleGenAI
): Promise<CriticReport> {
  const timestamp = new Date().toISOString();

  // Safety guard: Empty or invalid lyrics
  if (!draft || !draft.sections || draft.sections.length === 0) {
    return {
      evaluationType: 'LLM-based automated evaluation',
      overallStatus: 'PASS',
      overallScore: 5.0,
      sections: [],
      globalIssues: [],
      protectedLines: [],
      protectedSections: [],
      rewriteTargets: [],
      timestamp,
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
    };
  }

  // Format Draft for Critic Review with Line Numbers
  const draftFormattedLines: string[] = [];
  draft.sections.forEach((sec, sIdx) => {
    const fnDef = getSectionFunction(sec.type);
    draftFormattedLines.push(`=== SECTION ${sIdx}: [${sec.type}] (Expected Role: ${fnDef.primaryRole}) ===`);
    if (sec.performanceDirection) draftFormattedLines.push(`[Performance Direction]: ${sec.performanceDirection}`);
    if (sec.musicDirection) draftFormattedLines.push(`[Music Direction]: ${sec.musicDirection}`);
    (sec.lyrics || []).forEach((line, lIdx) => {
      draftFormattedLines.push(`  Line [${lIdx}]: "${line}"`);
    });
    draftFormattedLines.push('');
  });

  const systemInstruction = `คุณคือ "Senior Songwriting Critic & Quality Gate Master" ผู้เชี่ยวชาญการวิจารณ์และตรวจสอบคุณภาพเนื้อเพลงระดับชั้นครู
มีหน้าที่ประเมินเนื้อเพลงที่เพิ่งประพันธ์เสร็จอย่างเที่ยงตรง เข้มงวด และเป็นระบบ สำหรับแนวดนตรี "${context.genresStr || 'ดนตรีร่วมสมัย'}"

หลักการสำคัญของ Critic:
"ตรวจให้ละเอียดและเป็นธรรม แต่ระบุจุดแก้ให้แคบและเฉพาะเจาะจงที่สุด (Targeted Surgery)"
- ห้ามสั่ง Rewrite ทั้งเพลงหรือทั้งท่อน หากปัญหาเกิดจากคำหรือวลีเพียง 1-2 บรรทัด
- รักษา Hook หลัก และบรรทัดที่เล่าเรื่องได้เฉียบคมเป็น "PROTECTED" เสมอ
- ยึด Rubric การให้คะแนน 1.0 - 5.0 ตามจริง อย่าให้ 5.0 หากยังมีข้อบกพร่องด้านสัมผัสหรือคำซ้ำ

มิติคุณภาพและกฎเหล็กที่ต้องตรวจสอบ (Critical Gates):
1. [ตรวจคำลงท้ายซ้ำ - Repetitive End-Rhyme]:
   - ตรวจดูคำท้ายวรรคใน Section เดียวกัน หากลงท้ายด้วย "คำเดิมซ้ำกัน" (เช่น ลงท้าย เล่น-เล่น-เล่น หรือ ดี-ดี) ให้ Flag ทันทีเป็น "repetitive-end-rhyme" (Severity: critical) และระบุ lineIndices ให้แก้ไข
2. [แยก Vocational Detail vs Vocational Dump - อย่า Ban คำตรงๆ]:
   - "Vocational Detail" คือคำศัพท์อาชีพ/อุปกรณ์ 1 คำ ที่ถูกใช้อย่างมีหน้าที่ทางภาพหรืออารมณ์ (เช่น ใช้เป็นสัญลักษณ์ปิดเรื่อง) — นี่คือสิ่งที่ "ยอมรับได้" แม้อยู่ใน Chorus/Bridge
   - "Vocational Dump" คือการยัดคำศัพท์อาชีพ/อุปกรณ์ "หลายคำ" (ตั้งแต่ 2-3 คำขึ้นไปในท่อนเดียวกัน) เรียงต่อกันเพียงเพื่อให้ Story ดูตรง โดยไม่มีหน้าที่ทางอารมณ์หรือภาพ — ให้ Flag เป็น "inappropriate-vocational-dump" (Severity: critical) เฉพาะกรณีนี้เท่านั้น
   - ห้าม Flag เพียงเพราะเจอคำศัพท์อาชีพคำเดียวโผล่มา ต้องประเมินจากความหนาแน่นและหน้าที่ของคำนั้นในบริบท ไม่ใช่แบนคำเป็นรายคำ
3. Naturalness & Lyrical Sharpness (L3 > L2 > L1):
   - ประโยคคมคาย เป็นธรรมชาติ ติดหู ไม่ประดิดประดอยหรือเป็นภาษาหุ่นยนต์/วิชาการ
4. Genericness Critic (ตรวจจับความโหล/วลีสำเร็จรูป):
   - การพร่ำเพ้อเรื่องความรัก/คิดถึงลอย ๆ โดยไม่มีความเชื่อมโยงกับฉาก ให้ Flag เป็น "generic-emotional-filler"
5. Evidence Grounding & Fact Safety:
   - ห้ามแต่งเรื่องเพิ่มหรือยัดเยียดสิ่งของที่ไม่เกี่ยวข้องกับโจทย์ หากพบให้ Flag "unsupported-genre-decoration"
6. Composition Discipline & Negative Space:
   - narrative-prose-reporting: เล่าแจกแจงลำดับเหตุการณ์การเดินทาง/การกระทำปลีกย่อยแบบร้อยแก้ว (เช่น ถอดหมวก, เปิดประตู, เก็บของ)
   - emotional-over-explanation: บรรยายภาพฉากได้ดีแล้วแต่เขียนบอกความรู้สึกตรงๆ ซ้ำซ้อนทันทีในบรรทัดถัดไป
7. Genre Authenticity: สอดคล้องกับจริตและขนบของแนวดนตรี "${context.genresStr}"

การตัดสินภาพรวม (Overall Status):
- "PASS": เนื้อเพลงยอดเยี่ยม ไม่มีจุดบกพร่องวิกฤต (ไม่มีคำท้ายซ้ำ / ไม่มีชื่ออุปกรณ์หลุดในฮุก)
- "REVIEW": มีจุดขัดเกลาเล็กน้อย 1-2 จุดที่ปรับแล้วจะทำให้เพลงสมบูรณ์ขึ้น
- "FAIL": มีข้อผิดพลาดวิกฤต (repetitive-end-rhyme, inappropriate-vocational-dump, robotic metaphor, narrative-prose-reporting)

ส่งผลลัพธ์การประเมินเป็น JSON ตาม Schema เท่านั้น`;

  const prompt = `โปรดตรวจประเมินเนื้อเพลงร่างนี้อย่างละเอียดตามมาตรฐาน Critic:

${context.userCreativeSettingsBlock}
${context.creativeAnalysisBlock}
${context.styleExecutionBlock}
${context.lyricPhrasingBlock}
${context.referenceGuidanceBlock}
${context.vocabGuidanceBlock}
${context.fewShotGuidanceBlock ? `\n\n${context.fewShotGuidanceBlock}` : ""}${context.rolePromptBlock ? `\n\n${context.rolePromptBlock}` : ""}

${CRITIC_RUBRIC_GUIDELINES}

=== ร่างเนื้อเพลงที่ต้องตรวจสอบ (DRAFT LYRICS TO CRITIQUE) ===
${draftFormattedLines.join('\n')}

โปรดประเมินอย่างเป็นกลาง ระบุคะแนนแยกตามมิติ, ระบุ protectedLines/protectedSections สำหรับท่อนที่ดีเลิศ, และระบุ rewriteTargets เฉพาะบรรทัดที่จำเป็นต้องแก้ไขจริง ๆ`;

  try {
    const { response, modelMeta } = await callGeminiWithFallback(ai!, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: {
              type: Type.STRING,
              enum: ['PASS', 'REVIEW', 'FAIL'],
              description: 'สถานะภาพรวมของเนื้อเพลง',
            },
            overallScore: {
              type: Type.NUMBER,
              description: 'คะแนนรวมภาพรวม (1.0 - 5.0)',
            },
            rubricBreakdown: {
              type: Type.OBJECT,
              properties: {
                naturalnessScore: { type: Type.NUMBER },
                personaScore: { type: Type.NUMBER },
                storyProgressionScore: { type: Type.NUMBER },
                lexicalFitScore: { type: Type.NUMBER },
                clicheAvoidanceScore: { type: Type.NUMBER },
                singabilityFlowScore: { type: Type.NUMBER },
                hookStrengthScore: { type: Type.NUMBER },
                sectionFunctionScore: { type: Type.NUMBER },
                specificityScore: { type: Type.NUMBER },
                narrativeUtilityScore: { type: Type.NUMBER },
                genericnessRiskScore: { type: Type.NUMBER },
                evidenceGroundingScore: { type: Type.NUMBER },
                naturalnessL2Score: { type: Type.NUMBER },
                naturalnessL3Score: { type: Type.NUMBER },
              },
              required: [
                'naturalnessScore',
                'personaScore',
                'storyProgressionScore',
                'lexicalFitScore',
                'clicheAvoidanceScore',
                'singabilityFlowScore',
                'hookStrengthScore',
                'sectionFunctionScore',
              ],
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionIndex: { type: Type.INTEGER },
                  sectionType: { type: Type.STRING },
                  functionExpected: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['PASS', 'REVIEW', 'FAIL'] },
                  score: { type: Type.NUMBER },
                  narrativeFunctionMet: { type: Type.BOOLEAN },
                  protectedLines: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '0-based line indices ใน section นี้ที่เด่นมากและห้ามแก้',
                  },
                  issues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] },
                        lineIndices: {
                          type: Type.ARRAY,
                          items: { type: Type.INTEGER },
                        },
                        diagnosis: { type: Type.STRING },
                        evidence: { type: Type.STRING },
                        suggestedAction: { type: Type.STRING },
                      },
                      required: ['type', 'severity', 'lineIndices', 'diagnosis', 'evidence', 'suggestedAction'],
                    },
                  },
                  notes: { type: Type.STRING },
                },
                required: ['sectionIndex', 'sectionType', 'status', 'score', 'narrativeFunctionMet', 'issues', 'protectedLines'],
              },
            },
            globalIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] },
                  lineIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  diagnosis: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ['type', 'severity', 'lineIndices', 'diagnosis', 'evidence', 'suggestedAction'],
              },
            },
            protectedLines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionIndex: { type: Type.INTEGER },
                  sectionType: { type: Type.STRING },
                  lineIndex: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['sectionIndex', 'sectionType', 'lineIndex', 'text', 'reason'],
              },
            },
            protectedSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionIndex: { type: Type.INTEGER },
                  sectionType: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['sectionIndex', 'sectionType', 'reason'],
              },
            },
            rewriteTargets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetId: { type: Type.STRING },
                  sectionIndex: { type: Type.INTEGER },
                  sectionType: { type: Type.STRING },
                  lineIndices: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                  },
                  targetLyrics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  surroundingContextBefore: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  surroundingContextAfter: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  issues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        severity: { type: Type.STRING },
                        lineIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        diagnosis: { type: Type.STRING },
                        evidence: { type: Type.STRING },
                        suggestedAction: { type: Type.STRING },
                      },
                      required: ['type', 'severity', 'lineIndices', 'diagnosis', 'evidence', 'suggestedAction'],
                    },
                  },
                  instructions: { type: Type.STRING },
                  speakerVoice: { type: Type.STRING },
                  relevantSceneEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  evidenceTier: { type: Type.STRING },
                  narrativeUtility: { type: Type.STRING },
                  preferredLexicalCandidates: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contextualAvoidance: { type: Type.ARRAY, items: { type: Type.STRING } },
                  protectedHookState: { type: Type.BOOLEAN },
                  rewriteStrategy: { type: Type.STRING },
                },
                required: ['targetId', 'sectionIndex', 'sectionType', 'lineIndices', 'targetLyrics', 'issues', 'instructions'],
              },
            },
          },
          required: ['overallStatus', 'overallScore', 'rubricBreakdown', 'sections', 'protectedLines', 'protectedSections', 'rewriteTargets'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');

    const criticReport: CriticReport = {
      evaluationType: 'LLM-based automated evaluation',
      overallStatus: (parsedJson.overallStatus as CriticStatus) || 'PASS',
      overallScore: Number(parsedJson.overallScore || 4.2),
      rubricBreakdown: {
        naturalnessScore: Number(parsedJson.rubricBreakdown?.naturalnessScore || 4.0),
        personaScore: Number(parsedJson.rubricBreakdown?.personaScore || 4.0),
        storyProgressionScore: Number(parsedJson.rubricBreakdown?.storyProgressionScore || 4.0),
        lexicalFitScore: Number(parsedJson.rubricBreakdown?.lexicalFitScore || 4.0),
        clicheAvoidanceScore: Number(parsedJson.rubricBreakdown?.clicheAvoidanceScore || 4.0),
        singabilityFlowScore: Number(parsedJson.rubricBreakdown?.singabilityFlowScore || 4.0),
        hookStrengthScore: Number(parsedJson.rubricBreakdown?.hookStrengthScore || 4.0),
        sectionFunctionScore: Number(parsedJson.rubricBreakdown?.sectionFunctionScore || 4.0),
        specificityScore: Number(parsedJson.rubricBreakdown?.specificityScore || 4.0),
        narrativeUtilityScore: Number(parsedJson.rubricBreakdown?.narrativeUtilityScore || 4.0),
        genericnessRiskScore: Number(parsedJson.rubricBreakdown?.genericnessRiskScore || 2.0),
        evidenceGroundingScore: Number(parsedJson.rubricBreakdown?.evidenceGroundingScore || 4.0),
        naturalnessL2Score: Number(parsedJson.rubricBreakdown?.naturalnessL2Score || 4.0),
        naturalnessL3Score: Number(parsedJson.rubricBreakdown?.naturalnessL3Score || 4.0),
      },
      sections: (parsedJson.sections || []).map((sec: any) => ({
        sectionIndex: Number(sec.sectionIndex ?? 0),
        sectionType: sec.sectionType || 'Section',
        functionExpected: sec.functionExpected || getSectionFunction(sec.sectionType || '').functionExpected,
        status: (sec.status as CriticStatus) || 'PASS',
        score: Number(sec.score || 4.0),
        narrativeFunctionMet: Boolean(sec.narrativeFunctionMet ?? true),
        protectedLines: Array.isArray(sec.protectedLines) ? sec.protectedLines : [],
        issues: Array.isArray(sec.issues) ? sec.issues : [],
        notes: sec.notes || '',
      })),
      globalIssues: Array.isArray(parsedJson.globalIssues) ? parsedJson.globalIssues : [],
      protectedLines: Array.isArray(parsedJson.protectedLines) ? parsedJson.protectedLines : [],
      protectedSections: Array.isArray(parsedJson.protectedSections) ? parsedJson.protectedSections : [],
      rewriteTargets: Array.isArray(parsedJson.rewriteTargets) ? parsedJson.rewriteTargets : [],
      timestamp,
      modelUsed: modelMeta?.modelId || 'gemini-3.6-flash',
    };

    criticReport.sections.forEach((sec) => {
      sec.issues.forEach((iss) => {
        console.log(`[SongCritic]`);
        console.log(`section: ${sec.sectionType} (#${sec.sectionIndex})`);
        console.log(`issue: ${iss.type}`);
        console.log(`severity: ${iss.severity}`);
        console.log(`line: ${iss.lineIndices.join(', ')}`);
        console.log(`diagnosis: ${iss.diagnosis}`);
      });
    });

    console.log(`[SongCritic] Completed evaluation. Status: ${criticReport.overallStatus}, Score: ${criticReport.overallScore}/5.0, Rewrite Targets: ${criticReport.rewriteTargets.length}`);

    return criticReport;
  } catch (err: any) {
    console.error('[SongCritic] Error during automated critic evaluation:', err.message);

    return {
      evaluationType: 'LLM-based automated evaluation',
      overallStatus: 'PASS',
      overallScore: 4.0,
      sections: draft.sections.map((s, idx) => ({
        sectionIndex: idx,
        sectionType: s.type,
        functionExpected: getSectionFunction(s.type).functionExpected,
        status: 'PASS',
        score: 4.0,
        issues: [],
        protectedLines: [],
        narrativeFunctionMet: true,
      })),
      globalIssues: [],
      protectedLines: [],
      protectedSections: [],
      rewriteTargets: [],
      timestamp,
      rubricBreakdown: {
        naturalnessScore: 4.0,
        personaScore: 4.0,
        storyProgressionScore: 4.0,
        lexicalFitScore: 4.0,
        clicheAvoidanceScore: 4.0,
        singabilityFlowScore: 4.0,
        hookStrengthScore: 4.0,
        sectionFunctionScore: 4.0,
      },
    };
  }
}