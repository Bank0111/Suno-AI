// server/lexicon/lexiconEngine.ts

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Legacy wordBank.json remains the fallback/source for the existing
 * Thai system while the new multilingual folders are populated.
 */
type RawWordBank = {
  domains: DomainVocab[];
  rhymes: Record<string, string[]>;
};

type LanguageWordBank = {
  language?: string;
  words?: Array<
    | string
    | {
        word?: string;
        [key: string]: unknown;
      }
  >;
  total?: number;
  [key: string]: unknown;
};

type LanguageDomains = {
  language?: string;
  domains?: DomainVocab[];
};

type LanguageRhymes = {
  language?: string;
  rhymeGroups?: Array<{
    vowel?: string;
    ending?: string;
    words?: string[];
    [key: string]: unknown;
  }>;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(process.cwd());

function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(
      readFileSync(filePath, "utf-8")
    ) as T;
  } catch {
    return null;
  }
}

const loadedLegacyWordBank =
  readJsonFile<RawWordBank>(
    resolve(__dirname, "data", "wordBank.json")
  );

if (!loadedLegacyWordBank) {
  throw new Error(
    "[LexiconEngine] ไม่สามารถโหลด data/wordBank.json ได้"
  );
}

const legacyWordBank: RawWordBank =
  loadedLegacyWordBank;

const LANGUAGE_CODES = [
  "th",
  "en",
  "zh",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "pt",
  "id",
  "vi",
  "hi",
  "ar",
  "lo",
] as const;

export type LexiconLanguage =
  (typeof LANGUAGE_CODES)[number];

export function getLanguageDomains(
  language: LexiconLanguage
): DomainVocab[] {
  const data =
    readJsonFile<LanguageDomains>(
      resolve(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "languages",
  language,
  "domains.json"
)
    );

  return Array.isArray(data?.domains)
    ? data.domains
    : [];
}

export function getLanguageRhymes(
  language: LexiconLanguage
): Record<string, string[]> {
  const data = readJsonFile<LanguageRhymes>(
    resolve(
      PROJECT_ROOT,
      "server",
      "lexicon",
      "data",
      "languages",
      language,
      "rhymes.json"
    )
  );

  const result: Record<string, string[]> = {};

  for (const [index, group] of (data?.rhymeGroups ?? []).entries()) {
    if (!group.words?.length) {
      continue;
    }

    const baseKey =
      group.vowel?.trim() ||
      group.ending?.trim() ||
      `rhyme_${index + 1}`;

    // ป้องกันชื่อกลุ่มซ้ำแล้วเขียนทับข้อมูลเดิม
    let key = baseKey;
    let suffix = 2;

    while (Object.prototype.hasOwnProperty.call(result, key)) {
      key = `${baseKey}_${suffix}`;
      suffix++;
    }

    result[key] = group.words;
  }

  return result;
}
type LanguageVocabulary = {
  language?: string;
  words?: Array<
    | string
    | {
        word?: string;
        [key: string]: unknown;
      }
  >;
  total?: number;
  [key: string]: unknown;
};
export function getLanguageVocabulary(
  language: LexiconLanguage
): string[] {
  const data =
  readJsonFile<LanguageVocabulary>(
    resolve(
      PROJECT_ROOT,
      "server",
      "lexicon",
      "data",
      "languages",
      language,
      "vocabulary.json"
    )
  );

  return (data?.words ?? [])
    .map(item =>
      typeof item === "string"
        ? item
        : item?.word
    )
    .filter(
      (word): word is string =>
        typeof word === "string" &&
        word.trim().length > 0
    );
}

export function getLanguageData(
  language: LexiconLanguage
): {
  domains: DomainVocab[];
  rhymes: Record<string, string[]>;
  vocabulary: string[];
} {
  const languageDomains =
    getLanguageDomains(language);

  const languageRhymes =
    getLanguageRhymes(language);

  const languageVocabulary =
    getLanguageVocabulary(language);

  /*
   * If the new language folders are still empty,
   * preserve the existing legacy system.
   */
  return {
    domains:
      languageDomains.length > 0
        ? languageDomains
        : legacyWordBank.domains,

    rhymes:
      Object.keys(languageRhymes).length > 0
        ? languageRhymes
        : legacyWordBank.rhymes,

    vocabulary:
      languageVocabulary
  };
}

/**
 * ============================================================
 * LEXICON ENGINE
 * ============================================================
 *
 * SOURCE OF TRUTH
 * ----------------
 * server/lexicon/data/wordBank.json
 *
 * Architecture
 * ------------
 *
 * Story Prompt
 *      ↓
 * Text Analysis
 *      ↓
 * Domain Scoring
 *      ↓
 * Best Domain
 *      ↓
 * Vocabulary Sampling
 *      ↓
 * Cross Category Deduplication
 *      ↓
 * Rhyme Pool Selection
 *      ↓
 * Diversity Control
 *      ↓
 * Dynamic Lyric Palette
 *      ↓
 * AI Songwriting Engine
 *
 * IMPORTANT
 * ---------
 * คลังคำศัพท์ไม่ควรใส่กลับเข้ามาในไฟล์นี้
 * เพิ่มคำศัพท์ใน wordBank.json เท่านั้น
 */

// ============================================================
// TYPES
// ============================================================

export interface RhymeCluster {
  vowel: string;
  ending: string;
  words: string[];
}

export interface DomainVocab {
  domain: string;
  keywords: string[];
  objects: string[];
  actions: string[];
  emotions: string[];
  modifiers: string[];
}

export interface LexiconPaletteData {
  domain: string;
  keywords: string[];
  objects: string[];
  actions: string[];
  emotions: string[];
  modifiers: string[];
  rhymeGroups: RhymeCluster[];
  allWords: string[];
}

export interface WordBankStats {
  domains: number;
  rhymeGroups: number;
  totalDomainWords: number;
  totalRhymeWords: number;
  totalWords: number;
  domainStats: Array<{
    domain: string;
    keywords: number;
    objects: number;
    actions: number;
    emotions: number;
    modifiers: number;
  }>;
  rhymeStats: Array<{
    group: string;
    words: number;
  }>;
}

// ============================================================
// WORD BANK
// ============================================================

export const RHYME_MATRIX: Record<string, string[]> =
  getLanguageData("th").rhymes;

export const DOMAIN_DATA: DomainVocab[] =
  getLanguageData("th").domains;

// ============================================================
// VALIDATION
// ============================================================

function validateWordBank(): void {
  if (!legacyWordBank) {
    throw new Error(
      "[LexiconEngine] wordBank.json ไม่สามารถโหลดได้"
    );
  }

  if (!Array.isArray(legacyWordBank.domains)) {
    throw new Error(
      "[LexiconEngine] legacyWordBank.domains ต้องเป็น Array"
    );
  }

  if (
    !legacyWordBank.rhymes ||
    typeof legacyWordBank.rhymes !== "object"
  ) {
    throw new Error(
      "[LexiconEngine] legacyWordBank.rhymes ต้องเป็น Object"
    );
  }

  if (legacyWordBank.domains.length === 0) {
    throw new Error(
      "[LexiconEngine] ไม่มี Domain ใน wordBank.json"
    );
  }

  if (
    Object.keys(legacyWordBank.rhymes).length === 0
  ) {
    throw new Error(
      "[LexiconEngine] ไม่มี Rhyme Group ใน wordBank.json"
    );
  }

  for (const domain of legacyWordBank.domains) {
    if (!domain.domain) {
      throw new Error(
        "[LexiconEngine] Domain ต้องมีชื่อ domain"
      );
    }

    if (!Array.isArray(domain.keywords)) {
      throw new Error(
        `[LexiconEngine] ${domain.domain}.keywords ต้องเป็น Array`
      );
    }

    if (!Array.isArray(domain.objects)) {
      throw new Error(
        `[LexiconEngine] ${domain.domain}.objects ต้องเป็น Array`
      );
    }

    if (!Array.isArray(domain.actions)) {
      throw new Error(
        `[LexiconEngine] ${domain.domain}.actions ต้องเป็น Array`
      );
    }

    if (!Array.isArray(domain.emotions)) {
      throw new Error(
        `[LexiconEngine] ${domain.domain}.emotions ต้องเป็น Array`
      );
    }

    if (!Array.isArray(domain.modifiers)) {
      throw new Error(
        `[LexiconEngine] ${domain.domain}.modifiers ต้องเป็น Array`
      );
    }
  }

  for (const [group, words] of Object.entries(
    legacyWordBank.rhymes
  )) {
    if (!Array.isArray(words)) {
      throw new Error(
        `[LexiconEngine] Rhyme Group ${group} ต้องเป็น Array`
      );
    }
  }
}

validateWordBank();

// ============================================================
// TEXT UTILITIES
// ============================================================

function normalizeText(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeWord(
  value: unknown
): string {
  return normalizeText(value)
    .replace(
      /[.,!?;:()[\]{}"'“”‘’`]/g,
      ""
    );
}

function unique<T>(
  array: T[]
): T[] {
  return [...new Set(array)];
}

function uniqueWords(
  words: string[]
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const word of words) {
    const normalized =
      normalizeWord(word);

    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(word);
  }

  return result;
}

// ============================================================
// RANDOMIZATION
// ============================================================

function shuffle<T>(
  array: T[]
): T[] {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];
  }

  return result;
}

function pickRandom<T>(
  array: T[],
  count: number
): T[] {
  if (
    !Array.isArray(array) ||
    array.length === 0 ||
    count <= 0
  ) {
    return [];
  }

  return shuffle(
    unique(array)
  ).slice(
    0,
    count
  );
}

// ============================================================
// DOMAIN MATCHING
// ============================================================

interface DomainScore {
  domain: DomainVocab;
  score: number;
  matchedKeywords: string[];
}

/**
 * วิเคราะห์ทุก Domain
 *
 * ไม่ใช้ find() ตัวแรกอีกต่อไป
 * แต่ให้คะแนนทุก Domain แล้วเลือกคะแนนสูงสุด
 */
function scoreDomains(
  storyPrompt: string
): DomainScore[] {

  const prompt =
    normalizeText(storyPrompt);

  const results: DomainScore[] = [];

  for (const domain of DOMAIN_DATA) {

    let score = 0;

    const matchedKeywords: string[] = [];

    const keywords =
      uniqueWords(
        domain.keywords ?? []
      );

    for (const keyword of keywords) {

      const normalizedKeyword =
        normalizeWord(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      if (
        prompt.includes(
          normalizedKeyword
        )
      ) {
        matchedKeywords.push(
          keyword
        );

        /**
         * Keyword ที่ยาวกว่ามีน้ำหนักมากกว่า
         * เพราะมักมีความเฉพาะเจาะจงกว่า
         */
        score += Math.max(
          1,
          Math.min(
            5,
            normalizedKeyword.length / 3
          )
        );
      }
    }

    results.push({
      domain,
      score,
      matchedKeywords
    });
  }

  return results.sort(
    (a, b) =>
      b.score - a.score
  );
}

function findBestDomain(
  storyPrompt: string
): DomainVocab {

  const ranked =
    scoreDomains(
      storyPrompt
    );

  if (
    ranked.length > 0 &&
    ranked[0].score > 0
  ) {
    return ranked[0].domain;
  }

  return DOMAIN_DATA[0];
}

// ============================================================
// CROSS CATEGORY DEDUPLICATION
// ============================================================

function removeCrossCategoryDuplicates(
  categories: string[][]
): string[][] {

  const used =
    new Set<string>();

  return categories.map(
    category => {

      const result: string[] = [];

      for (const word of category) {

        const normalized =
          normalizeWord(word);

        if (!normalized) {
          continue;
        }

        if (
          used.has(normalized)
        ) {
          continue;
        }

        used.add(normalized);

        result.push(word);
      }

      return result;
    }
  );
}

// ============================================================
// VOCABULARY DIVERSITY
// ============================================================

/**
 * ป้องกันไม่ให้ Palette เต็มไปด้วยคำประเภทเดียวกัน
 *
 * จะสุ่มจากรายการที่มีอยู่จริงใน Domain
 */
function buildVocabularyPalette(
  domain: DomainVocab
): {
  objects: string[];
  actions: string[];
  emotions: string[];
  modifiers: string[];
} {

  let objects =
    pickRandom(
      domain.objects ?? [],
      10
    );

  let actions =
    pickRandom(
      domain.actions ?? [],
      7
    );

  let emotions =
    pickRandom(
      domain.emotions ?? [],
      6
    );

  let modifiers =
    pickRandom(
      domain.modifiers ?? [],
      6
    );

  [
    objects,
    actions,
    emotions,
    modifiers
  ] =
    removeCrossCategoryDuplicates([
      objects,
      actions,
      emotions,
      modifiers
    ]);

  return {
    objects,
    actions,
    emotions,
    modifiers
  };
}

// ============================================================
// RHYME ENGINE — POOL SELECTION
// ============================================================

function buildRhymePool(
  groupCount = 3,
  wordsPerGroup = 6
): RhymeCluster[] {

  const keys =
    Object.keys(
      RHYME_MATRIX
    );

  const selectedKeys =
    pickRandom(
      keys,
      Math.min(
        groupCount,
        keys.length
      )
    );

  const used =
    new Set<string>();

  const groups: RhymeCluster[] = [];

  for (
    const key of selectedKeys
  ) {

    const source =
      uniqueWords(
        RHYME_MATRIX[key] ?? []
      );

    const available =
      source.filter(word => {

        const normalized =
          normalizeWord(word);

        return (
          normalized.length > 0 &&
          !used.has(
            normalized
          )
        );
      });

    const selected =
      pickRandom(
        available,
        wordsPerGroup
      );

    for (
      const word of selected
    ) {
      used.add(
        normalizeWord(word)
      );
    }

    if (
      selected.length > 0
    ) {
      groups.push({
        vowel: key,
        ending: "",
        words: selected
      });
    }
  }

  return groups;
}

// ============================================================
// PALETTE DATA
// ============================================================

/**
 * สร้างข้อมูล Palette แบบ Structured Data
 *
 * ใช้ได้ทั้ง:
 *
 * - AI Prompt
 * - UI
 * - Debug
 * - Analytics
 * - Future Rhyme Engine
 */
export function getDynamicLexiconPaletteData(
  storyPrompt: string
): LexiconPaletteData {

  const domain =
    findBestDomain(
      storyPrompt
    );

  const vocabulary =
    buildVocabularyPalette(
      domain
    );

  const rhymeGroups =
    buildRhymePool(
      3,
      6
    );

  const allWords =
    uniqueWords([
      ...vocabulary.objects,
      ...vocabulary.actions,
      ...vocabulary.emotions,
      ...vocabulary.modifiers,
      ...rhymeGroups.flatMap(
        group => group.words
      )
    ]);

  return {
    domain:
      domain.domain,

    keywords:
      uniqueWords(
        domain.keywords ?? []
      ),

    objects:
      vocabulary.objects,

    actions:
      vocabulary.actions,

    emotions:
      vocabulary.emotions,

    modifiers:
      vocabulary.modifiers,

    rhymeGroups,

    allWords
  };
}

// ============================================================
// AI PALETTE FORMATTER
// ============================================================

export function generateDynamicLexiconPalette(
  storyPrompt: string,
  language: string = "th"
): string {
  const validLanguage: LexiconLanguage = LANGUAGE_CODES.includes(language as LexiconLanguage)
    ? (language as LexiconLanguage)
    : "th";

  return getDynamicLexiconPaletteForLanguage(storyPrompt, validLanguage);
}

// ============================================================
// MULTILINGUAL API
// ============================================================

export function getSupportedLexiconLanguages(): readonly string[] {
  return LANGUAGE_CODES;
}

export function getLanguageWordBankStats(
  language: LexiconLanguage
): {
  language: LexiconLanguage;
  domains: number;
  rhymeGroups: number;
  vocabularyWords: number;
  totalWords: number;
} {
  const data = getLanguageData(language);

  const domainWords =
    data.domains.reduce(
      (total, domain) =>
        total +
        (domain.keywords?.length ?? 0) +
        (domain.objects?.length ?? 0) +
        (domain.actions?.length ?? 0) +
        (domain.emotions?.length ?? 0) +
        (domain.modifiers?.length ?? 0),
      0
    );

  const rhymeWords =
    Object.values(data.rhymes).reduce(
      (total, words) =>
        total + words.length,
      0
    );

  return {
    language,
    domains: data.domains.length,
    rhymeGroups: Object.keys(data.rhymes).length,
    vocabularyWords: data.vocabulary.length,
    totalWords:
      domainWords +
      rhymeWords +
      data.vocabulary.length
  };
}

export function getDynamicLexiconPaletteForLanguage(
  storyPrompt: string,
  language: LexiconLanguage = "th"
): string {
  const data = getLanguageData(language);

  const previousDomains = DOMAIN_DATA;
  const previousRhymes = RHYME_MATRIX;

  // Keep the existing helpers reusable by temporarily selecting
  // the requested language dataset through local computation.
  const ranked = scoreDomainsFromData(
    storyPrompt,
    data.domains
  );

  const domain =
    ranked[0]?.domain ??
    data.domains[0];

  if (!domain) {
    return `
--- DYNAMIC LYRIC PALETTE ---
[LANGUAGE]
${language}

[DOMAIN]
ไม่มี Domain สำหรับภาษานี้ในขณะนี้

[INSTRUCTION]
กรุณาเพิ่มข้อมูลใน:
server/lexicon/data/languages/${language}/
`;
  }

  const vocabulary =
    buildVocabularyPalette(domain);

  const rhymeGroups =
    buildRhymePoolFromMatrix(
      data.rhymes,
      3,
      6
    );

  const rhymeText =
    rhymeGroups
      .map(
        group =>
          `  * ${group.vowel}: [ ${group.words.join(", ")} ]`
      )
      .join("\n");

  void previousDomains;
  void previousRhymes;

  return `
--- DYNAMIC LYRIC PALETTE (SUPPLEMENTARY / LOWEST PRIORITY) ---

[LANGUAGE]
${language}

[VOCABULARY SELECTION PRIORITY — READ THIS FIRST]
คลังคำด้านล่างนี้เป็น "ตัวเลือกเสริมท้ายสุด" ไม่ใช่วัตถุดิบหลักของเนื้อเพลง
ลำดับความสำคัญในการเลือกคำที่ถูกต้องคือ:
  1. Story (เหตุการณ์และความหมายของเรื่องจริง)
  2. Character (เสียง มุมมอง และตัวตนของผู้เล่า)
  3. Conflict (สิ่งที่ตัวละครต้องเผชิญ/ตัดสินใจ)
  4. Scene (บรรยากาศและภาพเฉพาะของฉากนั้น)
  5. Emotion (อารมณ์ที่เกิดขึ้นจริงในฉากนั้น)
  6. Genre (ขนบและจริตของแนวดนตรี)
  7. Natural Language (คำที่คนพูดจริงในชีวิตประจำวัน)
  8. Rhyme / Singability (สัมผัสและความลื่นไหลเมื่อร้อง)
  9. Optional Imagery (ภาพเปรียบเทียบเสริม — ใช้เฉพาะเมื่อช่วยให้ชัดขึ้นจริง)
Domain object/action ด้านล่าง อยู่ในลำดับที่ 9 เท่านั้น ห้ามใช้เป็นจุดเริ่มต้นในการแต่งประโยค

[SELECTED DOMAIN — สำหรับอ้างอิงบรรยากาศเท่านั้น ไม่ใช่รายการคำบังคับ]
${domain.domain}

[DOMAIN KEYWORDS — อ้างอิงบริบทเท่านั้น]
${uniqueWords(domain.keywords ?? []).join(", ")}

[CONCRETE OBJECTS — ใช้ได้สูงสุด 1 คำในทั้งเพลง ถ้ามันทำให้เกิดภาพจำจริงๆ เท่านั้น]
${vocabulary.objects.join(", ")}

[ACTIONS — เลือกใช้เฉพาะเมื่อขับเคลื่อนเรื่องหรืออารมณ์จริง]
${vocabulary.actions.join(", ")}

[EMOTIONS / THEMES — แนวทางอ้างอิง ไม่ใช่คำที่ต้องยัดใส่]
${vocabulary.emotions.join(", ")}

[ATMOSPHERE / MODIFIERS]
${vocabulary.modifiers.join(", ")}

[RHYME POOL]
${rhymeText}

--- MULTILINGUAL LYRIC RULES ---

1. แต่งเพลงในภาษาที่ระบุเท่านั้น
2. ห้ามแปลคำแบบตรงตัวจนทำให้ภาษาฟังไม่เป็นธรรมชาติ
3. Story Element ≠ Lyric Vocabulary: การที่ Story มีตัวละคร/สถานที่/อุปกรณ์อะไร ไม่ได้แปลว่าเนื้อเพลงต้องใส่คำนั้น ให้แปลง Story เป็นอารมณ์และภาษาธรรมชาติก่อนเสมอ
4. ใช้ Rhyme Pool เป็นแนวทาง ไม่ใช่รายการบังคับ
5. ห้ามยัดคำจาก [CONCRETE OBJECTS] / [ACTIONS] เพียงเพื่อให้ Story ดูตรงหรือให้ครบ — คำเหล่านี้เป็นตัวเลือกสุดท้าย ใช้เมื่อจำเป็นจริงเท่านั้น และใช้ได้ไม่เกิน 1-2 คำต่อทั้งเพลง
6. ห้ามใช้คำหรือวลีสำคัญซ้ำพร่ำเพรื่อ
7. Chorus สามารถมีคำซ้ำเพื่อสร้าง Hook แต่ Chorus ต้องเป็นพื้นที่ของแก่นอารมณ์ ไม่ใช่รายชื่ออุปกรณ์
8. ให้ความหมายและความเป็นธรรมชาติสำคัญกว่าสัมผัส และสำคัญกว่าความครบถ้วนของคลังคำ
9. ห้ามนำชื่อหมวดหรือคำว่า Word Bank / Lexicon / Palette ไปใส่ในเนื้อเพลง

--- END PALETTE ---
`;
}

function scoreDomainsFromData(
  storyPrompt: string,
  domains: DomainVocab[]
): DomainScore[] {
  const prompt =
    normalizeText(storyPrompt);

  const results: DomainScore[] = [];

  for (const domain of domains) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of uniqueWords(
      domain.keywords ?? []
    )) {
      const normalizedKeyword =
        normalizeWord(keyword);

      if (
        normalizedKeyword &&
        prompt.includes(normalizedKeyword)
      ) {
        matchedKeywords.push(keyword);

        score += Math.max(
          1,
          Math.min(
            5,
            normalizedKeyword.length / 3
          )
        );
      }
    }

    results.push({
      domain,
      score,
      matchedKeywords
    });
  }

  return results.sort(
    (a, b) => b.score - a.score
  );
}

function buildRhymePoolFromMatrix(
  matrix: Record<string, string[]>,
  groupCount = 3,
  wordsPerGroup = 6
): RhymeCluster[] {
  const keys = Object.keys(matrix);

  const selectedKeys =
    pickRandom(
      keys,
      Math.min(groupCount, keys.length)
    );

  const used = new Set<string>();
  const groups: RhymeCluster[] = [];

  for (const key of selectedKeys) {
    const available =
      uniqueWords(matrix[key] ?? [])
        .filter(word =>
          !used.has(
            normalizeWord(word)
          )
        );

    const selected =
      pickRandom(
        available,
        wordsPerGroup
      );

    for (const word of selected) {
      used.add(
        normalizeWord(word)
      );
    }

    if (selected.length > 0) {
      groups.push({
        vowel: key,
        ending: "",
        words: selected
      });
    }
  }

  return groups;
}

// ============================================================
// PUBLIC DOMAIN API
// ============================================================

export function getMatchedLexiconDomain(
  storyPrompt: string
): string {

  return findBestDomain(
    storyPrompt
  ).domain;
}

export function getDomainScores(
  storyPrompt: string
): Array<{
  domain: string;
  score: number;
  matchedKeywords: string[];
}> {

  return scoreDomains(
    storyPrompt
  ).map(result => ({
    domain:
      result.domain.domain,

    score:
      Number(
        result.score.toFixed(2)
      ),

    matchedKeywords:
      result.matchedKeywords
  }));
}

export function getAvailableLexiconDomains(): string[] {

  return DOMAIN_DATA.map(
    domain =>
      domain.domain
  );
}

export function getAvailableRhymeGroups(): string[] {

  return Object.keys(
    RHYME_MATRIX
  );
}

// ============================================================
// WORD BANK STATISTICS
// ============================================================

export function getWordBankStats(): WordBankStats {

  const domainStats =
    DOMAIN_DATA.map(
      domain => ({

        domain:
          domain.domain,

        keywords:
          domain.keywords?.length ?? 0,

        objects:
          domain.objects?.length ?? 0,

        actions:
          domain.actions?.length ?? 0,

        emotions:
          domain.emotions?.length ?? 0,

        modifiers:
          domain.modifiers?.length ?? 0
      })
    );

  const rhymeStats =
    Object.entries(
      RHYME_MATRIX
    ).map(
      ([group, words]) => ({
        group,
        words:
          words?.length ?? 0
      })
    );

  const totalDomainWords =
    domainStats.reduce(
      (
        total,
        domain
      ) =>
        total +
        domain.keywords +
        domain.objects +
        domain.actions +
        domain.emotions +
        domain.modifiers,
      0
    );

  const totalRhymeWords =
    rhymeStats.reduce(
      (
        total,
        group
      ) =>
        total +
        group.words,
      0
    );

  return {

    domains:
      DOMAIN_DATA.length,

    rhymeGroups:
      rhymeStats.length,

    totalDomainWords,

    totalRhymeWords,

    totalWords:
      totalDomainWords +
      totalRhymeWords,

    domainStats,

    rhymeStats
  };
}

// ============================================================
// DEBUG / HEALTH CHECK
// ============================================================

export function validateLexiconEngine(): {
  valid: boolean;
  domains: number;
  rhymeGroups: number;
  totalWords: number;
} {

  const stats =
    getWordBankStats();

  return {
    valid:
      stats.domains > 0 &&
      stats.rhymeGroups > 0 &&
      stats.totalWords > 0,

    domains:
      stats.domains,

    rhymeGroups:
      stats.rhymeGroups,

    totalWords:
      stats.totalWords
  };
}