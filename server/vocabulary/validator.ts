import { AvoidClassification, VocabularyValidationReport } from './types';

/**
 * Validates generated lyrics against multi-tiered vocabulary avoid constraints.
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
      feedback: ['ไม่มีเนื้อเพลงสำหรับตรวจสอบ'],
    };
  }

  const cleanLyrics = lyricsText.toLowerCase();
  const hardBannedFound: string[] = [];
  const overusedFound: string[] = [];
  const contextClashFound: string[] = [];
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

  // Calculate Quality Score (Base 100)
  let score = 100;

  if (hardBannedFound.length > 0) {
    score -= hardBannedFound.length * 40;
    feedback.push(`พบคำต้องห้ามเด็ดขาด (Hard Banned): ${hardBannedFound.join(', ')}`);
  }

  if (overusedFound.length > 0) {
    score -= overusedFound.length * 5; // Moderate penalty for cliché phrases
    feedback.push(`พบคำสำนวนซ้ำซาก (Overused Clichés): ${overusedFound.join(', ')}`);
  }

  if (contextClashFound.length > 0) {
    score -= contextClashFound.length * 15;
    feedback.push(`พบคำที่ขัดกับ Genre/Mood (Context Clash): ${contextClashFound.join(', ')}`);
  }

  score = Math.max(0, Math.min(100, score));
  const isValid = hardBannedFound.length === 0; // Hard banned fail instantly

  if (isValid && feedback.length === 0) {
    feedback.push('เนื้อเพลงผ่านการตรวจสอบคลังคำศัพท์และข้อจำกัดภาษาอย่างสมบูรณ์');
  }

  return {
    isValid,
    score,
    hardBannedFound,
    overusedFound,
    contextClashFound,
    feedback,
  };
}
