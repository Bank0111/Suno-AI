import { SongInput, StepValidation } from '../types/songwriting';

export function validateSongInput(input: SongInput): StepValidation {
  const missingFields: string[] = [];

  const storyLength = (input.story || '').trim().length;
  if (storyLength < 10) {
    missingFields.push(
      storyLength === 0
        ? 'เรื่องราว / Prompt (ต้องการอย่างน้อย 10 ตัวอักษร)'
        : `เรื่องราว / Prompt (เรื่องราวสั้นเกินไป: ปัจจุบัน ${storyLength}/10 ตัวอักษร)`
    );
  }

  if (input.genres.length === 0 && (!input.customGenre || !input.customGenre.trim())) {
    missingFields.push('แนวเพลง (Genre)');
  }

  if (input.moods.length === 0) {
    missingFields.push('อารมณ์เพลง (Mood)');
  }

  if (!input.language) {
    missingFields.push('ภาษาของเนื้อเพลง');
  }

  if (!input.structure || input.structure.length < 3) {
    missingFields.push('โครงสร้างเพลง (อย่างน้อย 3 ส่วน)');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

export function validateApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length > 15; // Basic sanity check for Gemini API key
}
