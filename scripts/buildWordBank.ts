import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";

type LanguageCode =
  | "th" | "en" | "zh" | "ja" | "ko"
  | "es" | "fr" | "de" | "pt" | "id"
  | "vi" | "hi" | "ar";

type WordRecord = {
  word: string;
  language: LanguageCode;
  source: string;
};

type VocabularyOutput = {
  language: LanguageCode;
  words: WordRecord[];
  total: number;
};

const LANGUAGES: LanguageCode[] = [
  "th", "en", "zh", "ja", "ko", "es", "fr",
  "de", "pt", "id", "vi", "hi", "ar",
];

const PROJECT_ROOT = resolve(process.cwd());
const RAW_DIR = join(PROJECT_ROOT, "server", "lexicon", "raw");
const OUTPUT_DIR = join(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "languages"
);

function normalizeWord(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");
}

function isUsableWord(word: string): boolean {
  if (!word) return false;
  if (word.length > 100) return false;
  if (/^https?:\/\//i.test(word)) return false;
  if (/@/.test(word)) return false;

  // Reject obvious IDs / hashes / URL-like strings.
  if (/^[a-f0-9]{16,}$/i.test(word)) return false;
  if (/^(www\.|ftp\.)/i.test(word)) return false;

  return true;
}

function parseJsonFile(
  filePath: string,
  language: LanguageCode,
  source: string
): WordRecord[] {
  const raw = JSON.parse(
    readFileSync(filePath, "utf8")
  );

  const values: unknown[] =
    Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.words)
        ? raw.words
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

  const records: WordRecord[] = [];

  for (const item of values) {
    let word: unknown = item;

    if (
      typeof item === "object" &&
      item !== null
    ) {
      word =
        (item as Record<string, unknown>).word ??
        (item as Record<string, unknown>).lemma ??
        (item as Record<string, unknown>).text ??
        (item as Record<string, unknown>).term;
    }

    if (typeof word !== "string") continue;

    const normalized = normalizeWord(word);

    if (isUsableWord(normalized)) {
      records.push({
        word: normalized,
        language,
        source,
      });
    }
  }

  return records;
}

function parseJsonlFile(
  filePath: string,
  language: LanguageCode,
  source: string
): WordRecord[] {
  const lines =
    readFileSync(filePath, "utf8")
      .split(/\r?\n/);

  const records: WordRecord[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const item = JSON.parse(line);

      let word: unknown = item;

      if (
        typeof item === "object" &&
        item !== null
      ) {
        word =
          (item as Record<string, unknown>).word ??
          (item as Record<string, unknown>).lemma ??
          (item as Record<string, unknown>).text ??
          (item as Record<string, unknown>).title;
      }

      if (typeof word !== "string") continue;

      const normalized = normalizeWord(word);

      if (isUsableWord(normalized)) {
        records.push({
          word: normalized,
          language,
          source,
        });
      }
    } catch {
      // Ignore malformed JSONL lines.
    }
  }

  return records;
}

function parseTextFile(
  filePath: string,
  language: LanguageCode,
  source: string
): WordRecord[] {
  const lines =
    readFileSync(filePath, "utf8")
      .split(/\r?\n/);

  const records: WordRecord[] = [];

  for (const line of lines) {
    const normalized = normalizeWord(line);

    if (isUsableWord(normalized)) {
      records.push({
        word: normalized,
        language,
        source,
      });
    }
  }

  return records;
}

function parseCsvFile(
  filePath: string,
  language: LanguageCode,
  source: string
): WordRecord[] {
  const lines =
    readFileSync(filePath, "utf8")
      .split(/\r?\n/);

  const records: WordRecord[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;

    const firstColumn =
      line.split(",")[0]
        ?.replace(/^"|"$/g, "")
        .trim();

    if (!firstColumn) continue;

    const normalized =
      normalizeWord(firstColumn);

    if (isUsableWord(normalized)) {
      records.push({
        word: normalized,
        language,
        source,
      });
    }
  }

  return records;
}

function parseFile(
  filePath: string,
  language: LanguageCode
): WordRecord[] {
  const extension =
    extname(filePath).toLowerCase();

  const source =
    filePath
      .replace(PROJECT_ROOT, "")
      .replaceAll("\\", "/");

  if (extension === ".json") {
    return parseJsonFile(
      filePath,
      language,
      source
    );
  }

  if (extension === ".jsonl") {
    return parseJsonlFile(
      filePath,
      language,
      source
    );
  }

  if (
    extension === ".txt" ||
    extension === ".dic" ||
    extension === ".list"
  ) {
    return parseTextFile(
      filePath,
      language,
      source
    );
  }

  if (extension === ".csv") {
    return parseCsvFile(
      filePath,
      language,
      source
    );
  }

  return [];
}

function deduplicate(
  records: WordRecord[]
): WordRecord[] {
  const seen = new Set<string>();
  const result: WordRecord[] = [];

  for (const record of records) {
    const key =
      record.word.toLocaleLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(record);
  }

  return result;
}

function collectLanguage(
  language: LanguageCode
): WordRecord[] {
  const languageDir =
    join(RAW_DIR, language);

  if (!existsSync(languageDir)) {
    return [];
  }

  const files =
    readdirSync(languageDir)
      .map(file => join(languageDir, file))
      .filter(file =>
        [".json", ".jsonl", ".txt", ".dic", ".list", ".csv"]
          .includes(extname(file).toLowerCase())
      );

  const records =
    files.flatMap(file =>
      parseFile(file, language)
    );

  return deduplicate(records);
}

function ensureOutputDirectories(): void {
  mkdirSync(RAW_DIR, {
    recursive: true,
  });

  mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  for (const language of LANGUAGES) {
    mkdirSync(
      join(OUTPUT_DIR, language),
      { recursive: true }
    );
  }
}

function writeLanguage(
  language: LanguageCode,
  records: WordRecord[]
): void {
  const output: VocabularyOutput = {
    language,
    words: records,
    total: records.length,
  };

  writeFileSync(
    join(
      OUTPUT_DIR,
      language,
      "vocabulary.json"
    ),
    JSON.stringify(
      output,
      null,
      2
    ),
    "utf8"
  );
}

function main(): void {
  ensureOutputDirectories();

  let grandTotal = 0;

  console.log(
    "\n=== MULTILINGUAL WORD BANK IMPORTER ===\n"
  );

  for (const language of LANGUAGES) {
    const records =
      collectLanguage(language);

    writeLanguage(
      language,
      records
    );

    grandTotal += records.length;

    console.log(
      `${language}: ${records.length.toLocaleString()} words`
    );
  }

  console.log(
    `\nTOTAL: ${grandTotal.toLocaleString()} words`
  );

  console.log(
    "\nOutput:"
  );

  console.log(
    "server/lexicon/data/languages/<language>/vocabulary.json"
  );
}

main();
