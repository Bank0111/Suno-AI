import { SmartVocabularyResult } from './types';

/**
 * Formats Context-Aware & Scene-Grounded SmartVocabularyResult into structured prompt guidance text
 * suitable for injection into Gemini songwriting prompts.
 */
export function formatVocabularyPromptGuidance(result: SmartVocabularyResult): string {
  const {
    core,
    supporting,
    optional,
    avoid,
    contextVector,
    verseImagery,
    sectionEmotion,
    hookCoreTerms
  } = result;

  // 1. Structured Section Guidance (Phase 5.5A)
  const verseImageryList = (verseImagery && verseImagery.length > 0)
    ? verseImagery
    : supporting.filter((w) => ['สายลมยามเย็น', 'กลิ่นฝน', 'กอดเสาเถียง', 'ตะวัน', 'ดงพงพี', 'รอนแรม', 'สุกในดง', 'ผิวคล้ำ', 'ดอกไม้', 'แสงไฟเมืองหลวง', 'รถติด', 'กาแฟแก้วโปรด'].includes(w)).concat(supporting.slice(0, 5));

  const sectionEmotionList = (sectionEmotion && sectionEmotion.length > 0)
    ? sectionEmotion
    : core.slice(0, 6);

  const hookTermsList = (hookCoreTerms && hookCoreTerms.length > 0)
    ? hookCoreTerms
    : core.filter((w) => ['หัวใจ', 'ความรัก', 'สัญญา', 'รักแท้', 'โอบกอด', 'คิดฮอด', 'เคียงข้าง'].includes(w)).concat(core.slice(0, 3));

  const verseImageryText = Array.from(new Set(verseImageryList)).length > 0
    ? Array.from(new Set(verseImageryList)).join(', ')
    : 'คำบรรยายภาพ วัตถุ และบรรยากาศของฉากที่เป็นรูปธรรม';

  const sectionEmotionText = Array.from(new Set(sectionEmotionList)).length > 0
    ? Array.from(new Set(sectionEmotionList)).join(', ')
    : 'คำสื่ออารมณ์และการเปลี่ยนแปลงความรู้สึกในแต่ละท่อน';

  const hookTermsText = Array.from(new Set(hookTermsList)).length > 0
    ? Array.from(new Set(hookTermsList)).join(', ')
    : 'คำแก่นแท้และจุดจำของเพลง';

  const optionalText = optional.length > 0
    ? optional.join(', ')
    : 'คำทางเลือกสำหรับจังหวะและสัมผัส';

  // 2. Multi-tiered Avoidance
  const hardBannedText = avoid.hardBanned.length > 0 ? avoid.hardBanned.join(', ') : 'ไม่มีคำต้องห้ามพิเศษ';
  const overusedText = avoid.overused.length > 0 ? avoid.overused.join(', ') : 'ไม่มี';
  const contextClashText = avoid.contextClash.length > 0 ? avoid.contextClash.join(', ') : 'ไม่มีคำขัดสไตล์';

  const registerInfo = contextVector?.characterVoice
    ? `- Register ภาษาที่ต้องใช้: "${contextVector.characterVoice.targetRegister}" (${contextVector.characterVoice.personaType})\n- โทนเสียงตัวละคร (Character Voice): ${contextVector.characterVoice.toneDescription}`
    : '- Register ภาษา: เป็นธรรมชาติ เข้าถึงง่าย (Natural Conversational)';

  const sceneInfo = (contextVector?.sceneObjects && contextVector.sceneObjects.length > 0)
    ? `\n- โลกของเพลงและฉาก (Scene World): ${contextVector.sceneObjects.join(', ')}`
    : '';

  const contextualAvoidNotes = avoid.contextualAvoidanceNotes && avoid.contextualAvoidanceNotes.length > 0
    ? avoid.contextualAvoidanceNotes.map((n) => `  • ${n}`).join('\n')
    : '  • หลีกเลี่ยงการใช้คำศัพท์หรือสำนวนที่ไม่สอดคล้องกับบุคลิกตัวละคร';

  return `
[CONTEXT-AWARE & SCENE-GROUNDED LEXICAL GUIDANCE]
${registerInfo}${sceneInfo}

• LEXICAL INSPIRATION & DIRECTION (เป็นแนวทางสร้างสรรค์ ไม่ใช่การบังคับยัดเยียดทุกบรรทัด):
  [VERSE IMAGERY & SCENE DETAILS] (ฉาก วัตถุ สัมผัส ในท่อนเล่าเรื่อง):
  👉 ${verseImageryText}

  [SECTION EMOTION & NARRATIVE TRANSITION] (อารมณ์ การเปลี่ยนผ่าน ปมความรู้สึก):
  👉 ${sectionEmotionText}

  [HOOK & CORE TERMS] (คำแก่นแท้ สัจธรรม วลีจำใน Chorus):
  👉 ${hookTermsText}

  [CADENCE & RHYME OPTIONS] (ทางเลือกจังหวะและสัมผัส):
  👉 ${optionalText}

[LEXICAL CONSTRAINTS & MULTI-TIERED AVOIDANCE]
1. [HARD_BLOCK] คำต้องห้ามเด็ดขาด (หยาบคาย/ผิดกฎหมาย/คำห้าม): ${hardBannedText}
2. [CONTEXTUAL_AVOID] หลีกเลี่ยงตามบริบทเพลง:
${contextualAvoidNotes}
  • คำที่ขัดแย้งกับ Genre/Mood: ${contextClashText}
3. [LOW_PREFERENCE] ลดการใช้วลีสำเร็จรูปซ้ำซาก (Overused Clichés): ${overusedText}

[LEXICAL PRIORITIZATION & EVIDENCE-GROUNDED PRINCIPLES]:
1. ลำดับความสำคัญสูงสุด: Naturalness (L3 ความคมจำได้ > L2 ความสมจริงของตัวละคร > L1 ไวยากรณ์) > Semantic Correctness > Character Voice > Evidence Grounding (Tier 1 > Tier 2 > Tier 3) > Narrative Utility > Section Fit > Singability
2. [FACT SAFETY & EVIDENCE TIERS]: ให้ความสำคัญกับข้อเท็จจริงในเรื่อง (Tier 1) และบริบทของโลกเพลง (Tier 2) ห้ามนำคำศัพท์ตามสูตรสำเร็จของแนวเพลง (Tier 3 เช่น ควาย, เตาฟืน, เถียงนา) มายัดเยียดถ้าเรื่องไม่ได้ระบุ
3. [SPECIFICITY != OBJECT DUMP]: ความเฉพาะเจาะจงต้องรับใช้การเล่าเรื่อง (Narrative Utility) ให้สมดุลระหว่าง ภาพฉาก + การกระทำ + อารมณ์ + ภาษาพูด ไม่ใช่การร่ายรายชื่อสิ่งของ
4. [GENERICNESS CRITIC]: หลีกเลี่ยงประโยคบอกรัก/คิดถึงสำเร็จรูปที่สลับไปใส่เพลงไหนก็ได้ (เช่น "รักเธอสุดหัวใจ", "คิดถึงเธอเหลือเกิน", "รอวันเธอกลับมา", "ใจดวงน้อย") ให้เล่าผ่านภาพหรือความรู้สึกที่ผูกกับเรื่องนี้เท่านั้น
5. คำที่ใช้ในฉาก (Scene Words) ต้องกลมกลืนกับภาษาพูดตามธรรมชาติ หากคำใดร้องสะดุดหรือไม่เข้าปาก ให้เลือกใช้ภาษาพูดที่เป็นธรรมชาติแทนทันที
6. ห้ามเลือกคำเพียงเพราะ "สัมผัสคล้องจอง" ถ้าคำนั้นทำลายความเป็นธรรมชาติหรือทำให้บุคลิกตัวละครผิดเพี้ยน
`.trim();
}

/**
 * Creates a clean summary object for logging or diagnostic output.
 */
export function formatVocabularySummary(result: SmartVocabularyResult) {
  return {
    source: result.metadata.source,
    targetLanguage: result.metadata.targetLanguage,
    songId: result.metadata.songId || 'N/A',
    coreCount: result.core.length,
    supportingCount: result.supporting.length,
    optionalCount: result.optional.length,
    avoidCount: {
      hardBanned: result.avoid.hardBanned.length,
      overused: result.avoid.overused.length,
      contextClash: result.avoid.contextClash.length,
    },
    sampleCore: result.core.slice(0, 5),
    generatedAt: result.metadata.generatedAt,
  };
}
