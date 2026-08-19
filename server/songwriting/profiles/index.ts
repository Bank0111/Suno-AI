import { LanguageLyricProfile } from './types';
import { ThaiLyricProfile } from './thaiProfile';
import { EnglishLyricProfile } from './englishProfile';
import { createGenericLyricProfile } from './genericProfile';

export * from './types';
export * from './thaiProfile';
export * from './englishProfile';
export * from './genericProfile';

/**
 * Resolves the appropriate LanguageLyricProfile for a given target language.
 * Ensures language isolation: Never applies Thai rules to English, or vice versa (Phase 5.7 Gate).
 */
export function getLanguageProfile(language?: string): LanguageLyricProfile {
  if (!language || !language.trim()) {
    return ThaiLyricProfile; // default system language
  }

  const normalized = language.trim().toLowerCase();

  if (
    normalized === 'th' ||
    normalized === 'thai' ||
    normalized === 'ภาษาไทย' ||
    normalized === 'ไทย' ||
    normalized.includes('thai') ||
    normalized.includes('ไทย')
  ) {
    return ThaiLyricProfile;
  }

  if (
    normalized === 'en' ||
    normalized === 'english' ||
    normalized === 'อังกฤษ' ||
    normalized.includes('english') ||
    normalized.includes('eng')
  ) {
    return EnglishLyricProfile;
  }

  // Unsupported or Dynamic languages (Japanese, Korean, Spanish, Chinese, French, etc.)
  return createGenericLyricProfile(language.trim());
}