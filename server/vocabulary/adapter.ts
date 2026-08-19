import { SmartVocabularyResult } from './types';

/**
 * Formats Context-Aware & Scene-Grounded SmartVocabularyResult into structured prompt guidance text
 * suitable for injection into Gemini songwriting prompts (Phase 5.7 Standard).
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
    hookCoreTerms,
  } = result;

  // 1. Structured Section Guidance (Phase 5.7)
  const defaultSensoryWords = [
    'สายลมยามเย็น',
    'กลิ่นฝน',
    'แสงไฟนีออน',
    'หน้าต่าง',
    'โต๊ะไม้',
    'แสงไฟเมืองหลวง',
    'รถติด',
    'แก้วกาแฟ',
    'ถนน',
    'เงียบงัน',
    'รูปถ่าย',
    'เสียงเพลง',
  ];

  const verseImageryList =
    verseImagery && verseImagery.length > 0
      ? verseImagery
      : supporting
          .filter((w) => defaultSensoryWords.includes(w))
          .concat(supporting.slice(0, 5));

  const sectionEmotionList =
    sectionEmotion && sectionEmotion.length > 0
      ? sectionEmotion
      : core.slice(0, 6);

  const hookTermsList =
    hookCoreTerms && hookCoreTerms.length > 0
      ? hookCoreTerms
      : core
          .filter((w) => ['หัวใจ', 'ความรัก', 'สัญญา', 'ความจริง', 'โอบกอด', 'คิดฮอด', 'เคียงข้าง', 'สองมือ', 'หยาดเหงื่อ'].includes(w))
          .concat(core.slice(0, 3));

  const verseImageryText =
    Array.from(new Set(verseImageryList)).length > 0
      ? Array.from(new Set(verseImageryList)).join(', ')
      : 'คำบรรยายภาพ วัตถุ ผัสสะ และบรรยากาศของฉากที่เป็นรูปธรรม';

  const sectionEmotionText =
    Array.from(new Set(sectionEmotionList)).length > 0
      ? Array.from(new Set(sectionEmotionList)).join(', ')
      : 'คำสื่ออารมณ์ การเคลื่อนไหวของความรู้สึก และจุดเปลี่ยนมุมมอง';

  const hookTermsText =
    Array.from(new Set(hookTermsList)).length > 0
      ? Array.from(new Set(hookTermsList)).join(', ')
      : 'คำแก่นแท้ สัจธรรมชีวิต และประโยคจำหลักของเพลง';

  const optionalText =
    optional.length > 0 ? optional.join(', ') : 'คำทางเลือกสำหรับจังหวะและสัมผัสเสียง';

  // 2. Multi-tiered Avoidance
  const hardBannedText =
    avoid.hardBanned.length > 0 ? avoid.hardBanned.join(', ') : 'ไม่มีคำต้องห้ามพิเศษ';
  const overusedText =
    avoid.overused.length > 0 ? avoid.overused.join(', ') : 'ไม่มี';
  const contextClashText =
    avoid.contextClash.length > 0 ? avoid.contextClash.join(', ') : 'ไม่มีคำขัดสไตล์';

  const registerInfo = contextVector?.characterVoice
    ? `- Register ภาษาที่ต้องใช้: "${contextVector.characterVoice.targetRegister}" (${contextVector.characterVoice.personaType})\n- โทนเสียงตัวละคร (Character Voice): ${contextVector.characterVoice.toneDescription}`
    : '- Register ภาษา: เป็นธรรมชาติ เข้าถึงง่าย (Natural Spoken / Conversational)';

  const sceneInfo =
    contextVector?.sceneObjects && contextVector.sceneObjects.length > 0
      ? `\n- โลกของเพลงและฉาก (Scene World): ${contextVector.sceneObjects.join(', ')}`
      : '';

  const contextualAvoidNotes =
    avoid.contextualAvoidanceNotes && avoid.contextualAvoidanceNotes.length > 0
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
1. [HARD_BLOCK] คำต้องห้ามเด็ดขาด (หยาบคาย/ผิดกฎหมาย/สแลงฉาบฉวย): ${hardBannedText}
2. [CONTEXTUAL_AVOID] หลีกเลี่ยงตามบริบทเพลง:
${contextualAvoidNotes}
  • คำที่ขัดแย้งกับ Genre/Mood: ${contextClashText}
  • [NO VOCATIONAL DUMP IN HOOK]: ห้ามยัดรายชื่ออุปกรณ์ช่าง/เครื่องมือใน Chorus หรือ Bridge (เช่น ประแจ, น็อต, สายพาน) ให้ใช้พื้นที่ฮุกถ่ายทอดแก่นอารมณ์และสัจธรรม
  • [NO ACADEMIC JARGON]: ห้ามใช้ภาษาบทความวิจัย/รายงานข่าว (เช่น บริบท, มิติ, กำแพงชนชั้น, ขับเคลื่อน, ปัจจัย)
  • [NO PROSE REPORTING]: ห้ามแจกแจงขั้นตอนเหมือนบันทึกประจำวัน (เช่น จากนั้นก็... แล้วจึง... ขั้นตอนต่อไป)
3. [LOW_PREFERENCE] ลดการใช้วลีสำเร็จรูปซ้ำซาก (Overused Clichés): ${overusedText}

[LEXICAL PRIORITIZATION & EVIDENCE-GROUNDED PRINCIPLES]:
1. ลำดับความสำคัญสูงสุด: Naturalness (L3 ความคมจำได้ > L2 ความสมจริงของตัวละคร > L1 ไวยากรณ์) > Semantic Correctness > Character Voice > Evidence Grounding (Tier 1 > Tier 2 > Tier 3) > Narrative Utility > Negative Space > Singability
2. [FACT SAFETY & EVIDENCE TIERS]: ให้ความสำคัญกับข้อเท็จจริงในเรื่อง (Tier 1) และบริบทของโลกเพลง (Tier 2) ห้ามนำคำศัพท์ตามสูตรสำเร็จของแนวเพลง (Tier 3 เช่น ควาย, เตาฟืน, เถียงนา) มายัดเยียดถ้าเรื่องไม่ได้ระบุ
3. [SPECIFICITY != OBJECT DUMP]: ความเฉพาะเจาะจงต้องรับใช้การเล่าเรื่อง (Narrative Utility) ให้สมดุลระหว่าง ภาพฉาก + การกระทำ + อารมณ์ + ภาษาพูด ไม่ใช่การร่ายรายชื่อสิ่งของ
4. [SHOW DON'T TELL & NEGATIVE SPACE]: เมื่อวางภาพฉากแล้ว ห้ามเขียนประโยคบอกอารมณ์ตรงๆ ซ้ำซ้อน (เช่น "ภาพนี้ทำให้ฉันรู้สึกเศร้า") จงเปิดพื้นที่ว่างให้ผู้ฟังคิดตาม
5. [RHYME CADENCE VARIETY]: หลีกเลี่ยงการลงท้ายวรรคด้วยคำซ้ำหรือสระเดิมติดกันเกิน 2 ครั้งในท่อนเดียวกัน และห้ามเลือกคำเพียงเพราะสัมผัสหากทำให้ภาษาพูดผิดธรรมชาติ
6. คำที่ใช้ในฉาก (Scene Words) ต้องกลมกลืนกับภาษาพูดตามธรรมชาติ หากคำใดร้องสะดุดหรือไม่เข้าปาก ให้เลือกใช้ภาษาพูดที่เป็นธรรมชาติแทนทันที
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