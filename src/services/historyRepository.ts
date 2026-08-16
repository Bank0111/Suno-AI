import { HistoryRecord } from '../types/history';
import { SongInput, SongResult } from '../types/songwriting';

const HISTORY_STORAGE_KEY = 'ai_song_writer_persistent_history_v1';
const MAX_HISTORY_ITEMS = 100;

/**
 * Sanitize song configuration to ensure no sensitive secrets or keys are stored in history
 */
function sanitizeSongInput(input: SongInput): SongInput {
  const sanitized = JSON.parse(JSON.stringify(input));
  // Ensure no sensitive fields if any were added
  delete (sanitized as any).apiKey;
  delete (sanitized as any).token;
  delete (sanitized as any).secret;
  return sanitized;
}

/**
 * Sanitize song result to avoid storing unnecessary metadata
 */
function sanitizeSongResult(result: SongResult): SongResult {
  const sanitized: SongResult = {
    title: result.title || 'Untitled Song',
    stylePrompt: result.stylePrompt || '',
    sections: result.sections || [],
    fullLyricsFormatted: result.fullLyricsFormatted || '',
    fullStylePromptFormatted: result.fullStylePromptFormatted || '',
    createdAt: result.createdAt || new Date().toISOString(),
  };
  return sanitized;
}

/**
 * Load all History Records from persistent storage
 */
export function getHistoryRecords(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Sort by newest first
      return parsed.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
    }
    return [];
  } catch (error) {
    console.error('Failed to load song history from persistent storage:', error);
    return [];
  }
}

/**
 * Get a single History Record by ID
 */
export function getHistoryRecordById(id: string): HistoryRecord | null {
  const records = getHistoryRecords();
  return records.find((r) => r.id === id) || null;
}

/**
 * Save a newly generated song or create a new history record
 */
export function saveHistoryRecord(
  input: SongInput,
  result: SongResult,
  customId?: string
): HistoryRecord {
  const sanitizedInput = sanitizeSongInput(input);
  const sanitizedResult = sanitizeSongResult(result);

  const id = customId || `song_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const record: HistoryRecord = {
    id,
    title: result.title || 'เพลงไม่มีชื่อ',
    createdAt: result.createdAt || now,
    updatedAt: now,

    // Core Song Configurations
    songConfig: sanitizedInput,
    creativeDirection: sanitizedInput.creativeDirection,
    reference: sanitizedInput.reference,

    // Specific context fields for quick lookup and display
    story: sanitizedInput.story || '',
    genre: sanitizedInput.genres || [],
    customGenre: sanitizedInput.customGenre,
    mood: sanitizedInput.moods || [],
    customMood: sanitizedInput.customMood,
    language: sanitizedInput.language || 'ไทย',
    customLanguage: sanitizedInput.customLanguage,
    wordTone: sanitizedInput.wordTone || 'เป็นธรรมชาติ เข้าใจง่าย',
    languageStyle: sanitizedInput.languageStyle || 'ตรงไปตรงมา',
    songwritingStyle: sanitizedInput.songwritingStyle,
    customSongwritingStyle: sanitizedInput.customSongwritingStyle,
    pointOfView: sanitizedInput.pointOfView || 'auto',
    rhymeStyle: sanitizedInput.rhymeStyle || 'ให้ AI เลือกให้เหมาะสม',
    tempo: sanitizedInput.tempo || 'ปานกลาง (80–100 BPM)',
    bpm: sanitizedInput.bpm ?? 90,
    rhythmCharacteristics: sanitizedInput.rhythmCharacteristics || [],
    vocalType: sanitizedInput.vocalType || 'หญิง',
    vocalCustomDescription: sanitizedInput.vocalCustomDescription,

    // Lyrical & Structure Output
    structure: sanitizedInput.structure || [],
    sections: sanitizedResult.sections || [],
    lyrics: sanitizedResult.fullLyricsFormatted || '',
    stylePrompt: sanitizedResult.stylePrompt || '',

    // Full Song Result
    songResult: sanitizedResult,
  };

  try {
    const existing = getHistoryRecords();
    // Filter out if duplicate id exists
    const filtered = existing.filter((r) => r.id !== id);
    // Add new to top and cap at max items
    const updated = [record, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save song record to persistent storage:', error);
  }

  return record;
}

/**
 * Update an existing history record (e.g. after Refine, Section Rewrite, or manual edits)
 */
export function updateHistoryRecord(
  id: string,
  updatedResult: SongResult,
  updatedInput?: SongInput
): HistoryRecord | null {
  try {
    const existing = getHistoryRecords();
    const index = existing.findIndex((r) => r.id === id);

    if (index === -1) {
      // If not found, save as new record
      if (updatedInput) {
        return saveHistoryRecord(updatedInput, updatedResult, id);
      }
      return null;
    }

    const currentRecord = existing[index];
    const sanitizedResult = sanitizeSongResult(updatedResult);
    const sanitizedInput = updatedInput
      ? sanitizeSongInput(updatedInput)
      : currentRecord.songConfig;

    const updatedRecord: HistoryRecord = {
      ...currentRecord,
      title: sanitizedResult.title || currentRecord.title,
      updatedAt: new Date().toISOString(),
      songConfig: sanitizedInput,
      creativeDirection: sanitizedInput.creativeDirection || currentRecord.creativeDirection,
      reference: sanitizedInput.reference || currentRecord.reference,
      structure: sanitizedInput.structure || currentRecord.structure,
      sections: sanitizedResult.sections || currentRecord.sections,
      lyrics: sanitizedResult.fullLyricsFormatted || currentRecord.lyrics,
      stylePrompt: sanitizedResult.stylePrompt || currentRecord.stylePrompt,
      songResult: sanitizedResult,
    };

    existing[index] = updatedRecord;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(existing));
    return updatedRecord;
  } catch (error) {
    console.error('Failed to update song history record:', error);
    return null;
  }
}

/**
 * Delete a single History Record by ID
 */
export function deleteHistoryRecord(id: string): boolean {
  try {
    const existing = getHistoryRecords();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete history record:', error);
    return false;
  }
}

/**
 * Clear all History Records from persistent storage
 */
export function clearAllHistory(): boolean {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear history records:', error);
    return false;
  }
}
