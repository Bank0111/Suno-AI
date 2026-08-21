import { AvoidClassification, VocabularyValidationReport } from './types';

/**
 * Validates generated lyrics against multi-tiered vocabulary avoid constraints
 * and Phase 5.7 Critical Quality Gates.
 */
export function validateSongVocabulary(
  lyricsText: string,
  avoid: AvoidClassification
): VocabularyValidationReport {
  if (!lyricsText) {
    return {
      isValid: true,
      score: 100,
      hardBannedFound: [],
      overusedFound: [],
      contextClashFound: [],
      academicJargonFound: [],
      vocationalDumpFound: [],
      proseReportingFound: [],
      feedback: ['ไม่มีเนื้อเพลงสำหรับตรวจสอบ'],
    };
  }

  const cleanLyrics = lyricsText.toLowerCase();
  const hardBannedFound: string[] = [];
  const overusedFound: string[] = [];
  const contextClashFound: string[] = [];
  const academicJargonFound: string[] = [];
  const vocationalDumpFound: string[] = [];
  const proseReportingFound: string[] = [];
  const feedback: string[] = [];

  // 1. Check Hard-Banned Words (Strict Failure)
  for (const word of avoid.hardBanned) {
    if (word && cleanLyrics.includes(word.toLowerCase())) {
      hardBannedFound.push(word);
    }
  }

  // 2. Check Overused Clichés (Warning/Score Reduction)
  for (const cliche of avoid.overused) {
    if (cliche && cleanLyrics.includes(cliche.toLowerCase())) {
      overusedFound.push(cliche);
    }
  }

  // 3. Check Context Clash Words (Warning/Score Reduction)
  for (const clashWord of avoid.contextClash) {
    if (clashWord && cleanLyrics.includes(clashWord.toLowerCase())) {
      contextClashFound.push(clashWord);
    }
  }

  // 4. Check Academic Jargon & Research Tone (Phase 5.7 Gate)
  const academicJargonList = [
    'บริบท',
    'มิติใหม่',
    'กำแพงชนชั้น',
    'ขับเคลื่อน',
    'โครงสร้างทางสังคม',
    'ปัจจัย',
  ];
  for (const jargon of academicJargonList) {
    if (cleanLyrics.includes(jargon)) {
      academicJargonFound.push(jargon);
    }
  }

  // 5. Check Narrative Prose Reporting (Phase 5.7 Gate)
  const proseReportingList = ['จากนั้นก็', 'แล้วจึง', 'ขั้นตอนต่อไป'];
  for (const prose of proseReportingList) {
    if (cleanLyrics.includes(prose)) {
      proseReportingFound.push(prose);
    }
  }

  // 6. Check Vocational Tool Dumping in Chorus/Hook/Bridge (Phase 5.7 Gate)
  //    NOT a single-word ban: a lone, functional vocational word (e.g. one symbolic
  //    closing image) is legitimate craft ("Vocational Detail") and should NOT be
  //    penalized. Only when 2+ DISTINCT occupational/tool terms cluster together in
  //    the same Chorus/Hook/Bridge space does it read as "Vocational Dump" (Story
  //    detail stuffing). This mirrors the density threshold used in editor.ts / qa.ts / ranker.ts.
  const vocationalTools = ['ประแจ', 'น็อต', 'ไขควง', 'ชุดเซฟตี้', 'หัวเทียน', 'สายพาน', 'คราบน้ำมัน', 'น้ำมันเครื่อง', 'สว่าน', 'เครื่องจักร', 'อู่ซ่อมรถ', 'แม่กุญแจ', 'เครื่องยนต์', 'อะไหล่รถ'];
  const chorusOrHookSections = extractSectionsByTags(lyricsText, ['chorus', 'hook', 'bridge']);
  const vocationalToolsPresent: string[] = [];
  for (const tool of vocationalTools) {
    if (chorusOrHookSections.toLowerCase().includes(tool)) {
      vocationalToolsPresent.push(tool);
    }
  }
  // Only treat as a genuine "dump" when 2+ distinct terms cluster together.
  // A single grounded term is fine and is intentionally NOT added to vocationalDumpFound.
  if (vocationalToolsPresent.length >= 2) {
    vocationalDumpFound.push(...vocationalToolsPresent);
  }

  // Calculate Quality Score (Base 100)
  let score = 100;

  if (hardBannedFound.length > 0) {
    score -= hardBannedFound.length * 40;
    feedback.push(`พบคำต้องห้ามเด็ดขาด (Hard Banned): ${hardBannedFound.join(', ')}`);
  }

  if (academicJargonFound.length > 0) {
    score -= academicJargonFound.length * 25;
    feedback.push(`พบศัพท์วิชาการ/รายงานข่าว (Academic Jargon): ${academicJargonFound.join(', ')}`);
  }

  if (vocationalDumpFound.length > 0) {
    score -= vocationalDumpFound.length * 20;
    feedback.push(`พบการยัดเยียดชื่ออุปกรณ์ช่างในท่อนฮุก/บริดจ์ (Vocational Dump in Hook): ${vocationalDumpFound.join(', ')}`);
  }

  if (proseReportingFound.length > 0) {
    score -= proseReportingFound.length * 15;
    feedback.push(`พบสำนวนแจกแจงลำดับแบบร้อยแก้ว (Narrative Prose Reporting): ${proseReportingFound.join(', ')}`);
  }

  if (contextClashFound.length > 0) {
    score -= contextClashFound.length * 15;
    feedback.push(`พบคำที่ขัดกับ Genre/Mood (Context Clash): ${contextClashFound.join(', ')}`);
  }

  if (overusedFound.length > 0) {
    score -= overusedFound.length * 5;
    feedback.push(`พบคำสำนวนซ้ำซาก (Overused Clichés): ${overusedFound.join(', ')}`);
  }

  score = Math.max(0, Math.min(100, score));
  const isValid = hardBannedFound.length === 0 && academicJargonFound.length === 0;

  if (isValid && feedback.length === 0) {
    feedback.push('เนื้อเพลงผ่านการตรวจสอบคลังคำศัพท์และข้อจำกัดภาษาอย่างสมบูรณ์');
  }

  return {
    isValid,
    score,
    hardBannedFound,
    overusedFound,
    contextClashFound,
    academicJargonFound,
    vocationalDumpFound,
    proseReportingFound,
    feedback,
  };
}

/**
 * Extracts text within specific section header tags (e.g., [Chorus], [Hook], [Bridge])
 */
function extractSectionsByTags(lyrics: string, tags: string[]): string {
  const lines = lyrics.split('\n');
  const matchedLines: string[] = [];
  let isCapturing = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const header = trimmed.slice(1, -1).toLowerCase();
      isCapturing = tags.some((t) => header.includes(t));
      continue;
    }

    if (isCapturing) {
      matchedLines.push(trimmed);
    }
  }

  return matchedLines.join('\n');
}