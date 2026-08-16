import { GoogleGenAI } from '@google/genai';
import { SongConfig } from '../../src/types/songwriting';
import {
  SmartVocabularyResult,
  VocabularyEngineConfig,
} from './types';
import { matchRuleBasedVocabulary } from './matcher';
import { callGeminiWithFallback } from '../modelRouter';
import { buildLexicalContextVector } from './contextVector';

/**
 * In-memory Cache Store for Vocabulary Context per Song/Session
 */
interface CacheEntry {
  result: SmartVocabularyResult;
  timestamp: number;
}

const vocabularyCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

/**
 * Generates a unique cache key based on SongConfig or songId
 */
function getCacheKey(config: SongConfig, songId?: string): string {
  if (songId) return `song_${songId}`;

  const allGenres = Array.from(
    new Set([
      ...(config.genres || []),
      ...(config.customGenre ? config.customGenre.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );
  const allMoods = Array.from(
    new Set([
      ...(config.moods || []),
      ...(config.customMood ? config.customMood.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );

  const targetLang = config.language === 'Custom' && config.customLanguage
    ? config.customLanguage.trim()
    : (config.language?.trim() || 'ไทย');

  const keyBase = [
    targetLang,
    config.story || '',
    allGenres.join(','),
    allMoods.join(','),
    config.languageStyle || '',
    config.wordTone || '',
    config.pointOfView || 'auto',
  ].join('|');

  return `config_${Buffer.from(keyBase).toString('base64').substring(0, 32)}`;
}

/**
 * Main Context-Aware Lexical Engine Entry Point
 * 1. Checks cache by songId/config key
 * 2. Runs Context-Aware Candidate Matching & Ranking
 * 3. Lazy/Optional Gemini Smart Selection if candidates are sparse or explicitly enabled
 * 4. Caches result for subsequent song generation/refinement calls
 */
export async function getVocabularyContext(
  songConfig: SongConfig,
  options?: VocabularyEngineConfig,
  aiClient?: GoogleGenAI
): Promise<SmartVocabularyResult> {
  const songId = options?.songId;
  const cacheKey = getCacheKey(songConfig, songId);

  // 1. Check Cache
  if (!options?.forceRefresh && vocabularyCache.has(cacheKey)) {
    const entry = vocabularyCache.get(cacheKey)!;
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.result;
    }
  }

  // 2. Context-Aware Candidate Matching & Ranking
  let result = matchRuleBasedVocabulary(songConfig, options);

  // 3. Optional/Lazy Gemini Smart Selection
  // Only executed if explicitly requested or candidates are sparse, and target language is Thai and aiClient is provided
  const isCandidateSparse = result.core.length < 3 || result.metadata.candidateCount < 5;
  const shouldRunSmartSelector = options?.enableSmartSelector || isCandidateSparse;

  if (shouldRunSmartSelector && aiClient && result.contextVector?.isTargetThai) {
    try {
      const vector = result.contextVector || buildLexicalContextVector(songConfig);
      const prompt = `
คุณคือ Master Songwriting Vocabulary Specialist (ผู้เชี่ยวชาญการคัดเลือกคำศัพท์เพลงตามบริบท)
กรุณาวิเคราะห์เรื่องราว บุคลิกตัวละคร และแนวเพลง เพื่อเสนอชุดคำศัพท์ที่เป็น "ภาษาธรรมชาติ" ไม่เป็นคำสำเร็จรูป

[ข้อมูลบริบทเพลง]:
- เรื่องราว: "${songConfig.story || ''}"
- บุคลิกเสียงตัวละคร (Character Voice): ${vector.characterVoice.personaType} (Register: ${vector.characterVoice.targetRegister})
- โทนคำและสไตล์ภาษา: ${vector.wordTone} / ${vector.languageStyle}
- แนวเพลง: ${vector.genres.join(', ')}
- อารมณ์เพลง: ${vector.moods.join(', ')}

[คำคัดเลือกเบื้องต้นจากระบบ]:
Core: ${result.core.join(', ')}
Supporting: ${result.supporting.join(', ')}

[โจทย์]:
ตอบเป็น JSON สั้นๆ (5-8 คำต่อหมวด ห้ามใช้คำหยาบหรือวลีซ้ำซาก Cliché):
{
  "core": ["คำหลัก 4-6 คำที่เป็นธรรมชาติและเข้ากับตัวละคร"],
  "supporting": ["คำบรรยายภาพ/สิ่งของที่เป็นรูปธรรม 4-6 คำ"],
  "optional": ["คำทางเลือกสำหรับลงจังหวะสัมผัส 3-5 คำ"]
}
`.trim();

      const { response } = await callGeminiWithFallback(aiClient, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const jsonText = response.text || '';
      const parsed = JSON.parse(jsonText);

      if (parsed && Array.isArray(parsed.core)) {
        const enhancedCore = Array.from(new Set([...result.core, ...parsed.core])).slice(0, options?.maxCoreWords || 8);
        const enhancedSupporting = Array.from(new Set([...result.supporting, ...(parsed.supporting || [])])).slice(0, options?.maxSupportingWords || 10);
        const enhancedOptional = Array.from(new Set([...result.optional, ...(parsed.optional || [])])).slice(0, options?.maxOptionalWords || 6);

        result = {
          core: enhancedCore,
          supporting: enhancedSupporting,
          optional: enhancedOptional,
          verseImagery: result.verseImagery || enhancedSupporting,
          sectionEmotion: result.sectionEmotion || enhancedCore,
          hookCoreTerms: result.hookCoreTerms || enhancedCore.slice(0, 4),
          intentGroups: result.intentGroups,
          avoid: result.avoid,
          contextVector: result.contextVector,
          metadata: {
            source: 'gemini-enhanced',
            songId,
            generatedAt: new Date().toISOString(),
            candidateCount: (parsed.core?.length || 0) + (parsed.supporting?.length || 0),
            targetLanguage: vector.targetLanguage,
          },
        };
      }
    } catch (err: any) {
      console.info(`[VocabularyEngine] Gemini Smart Selection skipped, using Context-Aware Rule result:`, err?.message || err);
    }
  }

  // 4. Save to Cache
  vocabularyCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Clears cached vocabulary context for a specific songId or all cache entries.
 */
export function clearVocabularyCache(songId?: string) {
  if (songId) {
    const key = `song_${songId}`;
    vocabularyCache.delete(key);
    console.log(`[VocabularyEngine] Cache cleared for songId: ${songId}`);
  } else {
    vocabularyCache.clear();
    console.log(`[VocabularyEngine] All vocabulary caches cleared.`);
  }
}
