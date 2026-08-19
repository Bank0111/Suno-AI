// scripts/testSongGenerationIntegration.ts
import { 
  getLanguageData, 
  getLanguageVocabulary, 
  getLanguageDomains, 
  getLanguageRhymes 
} from '../server/lexicon/lexiconEngine';
import { resolve } from 'path';

const SUPPORTED_LANGUAGES = [
  'th', 'en', 'zh', 'ja', 'ko', 'de', 'es', 
  'fr', 'pt', 'id', 'vi', 'hi', 'ar', 'lo'
] as const;

type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface TestResult {
  language: SupportedLanguage;
  vocabularyLoaded: number;
  domainsCount: number;
  rhymeGroupsCount: number;
  sampleRhymeKey: string;
  sampleWordsCount: number;
  paletteGenerationStatus: 'PASS' | 'FAIL';
  errorMessage?: string;
}

async function run14LanguageIntegrationTest() {
  console.log('====================================================');
  console.log('🚀 RUNNING 14-LANGUAGE SONG GENERATION INTEGRATION TEST');
  console.log('====================================================\n');

  const results: TestResult[] = [];
  let passedCount = 0;

  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      // 1. ตรวจสอบการโหลดข้อมูลแยกรายภาษา
      const vocab = getLanguageVocabulary(lang);
      const domains = getLanguageDomains(lang);
      const rhymes = getLanguageRhymes(lang);

      const rhymeKeys = Object.keys(rhymes);
      const sampleKey = rhymeKeys.length > 0 ? rhymeKeys[0] : 'NONE';
      const sampleWords = sampleKey !== 'NONE' ? rhymes[sampleKey] : [];

      // 2. ตรวจสอบเงื่อนไขความถูกต้อง
      const hasVocab = vocab.length > 0;
      const hasDomains = domains.length > 0;
      const hasRhymes = rhymeKeys.length > 0;
      const noGenericRhymeKey = sampleKey !== 'rhyme' || rhymeKeys.length > 1;

      if (!hasVocab || !hasDomains || !hasRhymes || !noGenericRhymeKey) {
        throw new Error(`Incomplete language package or corrupted rhyme key: ${sampleKey}`);
      }

      results.push({
        language: lang,
        vocabularyLoaded: vocab.length,
        domainsCount: domains.length,
        rhymeGroupsCount: rhymeKeys.length,
        sampleRhymeKey: sampleKey,
        sampleWordsCount: sampleWords.length,
        paletteGenerationStatus: 'PASS'
      });

      passedCount++;
      console.log(`✓ [${lang.toUpperCase()}] Integration Verified: Vocab=${vocab.length} | Domains=${domains.length} | RhymeGroups=${rhymeKeys.length}`);
    } catch (err: any) {
      results.push({
        language: lang,
        vocabularyLoaded: 0,
        domainsCount: 0,
        rhymeGroupsCount: 0,
        sampleRhymeKey: 'ERROR',
        sampleWordsCount: 0,
        paletteGenerationStatus: 'FAIL',
        errorMessage: err.message
      });
      console.error(`✗ [${lang.toUpperCase()}] FAILED: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`📊 INTEGRATION TEST SUMMARY: ${passedCount}/${SUPPORTED_LANGUAGES.length} LANGUAGES PASSED`);
  console.log('====================================================');

  if (passedCount !== SUPPORTED_LANGUAGES.length) {
    process.exit(1);
  }
}

run14LanguageIntegrationTest();