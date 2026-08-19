import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, join } from "node:path";

type LanguageCode =
  | "th" | "en" | "zh" | "ja" | "ko"
  | "de" | "es" | "fr" | "pt" | "id"
  | "vi" | "hi" | "ar" | "lo";

type WordRecord = {
  word?: unknown;
  language?: unknown;
  source?: unknown;
  pos?: unknown;
  definitions?: unknown;
  tags?: unknown;
  topics?: unknown;
  categories?: unknown;
};

type VocabularyFile = {
  language?: unknown;
  source?: unknown;
  total?: unknown;
  words?: unknown;
};

type QualityStatus = "PASS" | "REVIEW" | "REJECT";

type ValidatedRecord = {
  word: string;
  language: LanguageCode;
  source: "Wiktextract";
  pos: string[];
  definitions: string[];
  tags: string[];
  topics: string[];
  categories: string[];
  quality: QualityStatus;
  qualityReasons: string[];
};

const ROOT = resolve(process.cwd());

const LANGUAGES: LanguageCode[] = [
  "th", "en", "zh", "ja", "ko",
  "de", "es", "fr", "pt", "id",
  "vi", "hi", "ar", "lo",
];

const DATA_ROOT = resolve(
  ROOT,
  "server",
  "lexicon",
  "data",
  "languages"
);

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((v): v is string => typeof v === "string")
      .map(cleanText)
      .filter(Boolean)
  )];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasControlCharacters(value: string): boolean {
  // Keep normal whitespace; reject invisible/control characters that are
  // generally unsafe for a lexical database.
  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value);
}

function looksLikeUrl(value: string): boolean {
  return /^(?:https?:\/\/|www\.)/iu.test(value);
}

function looksLikeWikicode(value: string): boolean {
  return /\{\{.*\}\}|\[\[.*\]\]|<ref\b|<\/?nowiki\b/iu.test(value);
}

function validateRecord(
  raw: WordRecord,
  language: LanguageCode
): { record: ValidatedRecord | null; reasons: string[] } {
  const reasons: string[] = [];

  const word = cleanText(raw.word);
  const recordLanguage = cleanText(raw.language);

  if (!word) {
    return { record: null, reasons: ["EMPTY_WORD"] };
  }

  if (recordLanguage && recordLanguage !== language) {
    return {
      record: null,
      reasons: [`LANGUAGE_MISMATCH:${recordLanguage}`],
    };
  }

  if (hasControlCharacters(word)) {
    reasons.push("CONTROL_CHARACTER");
  }

  if (looksLikeUrl(word)) {
    reasons.push("URL_AS_WORD");
  }

  if (looksLikeWikicode(word)) {
    reasons.push("WIKICODE_IN_WORD");
  }

  const pos = cleanArray(raw.pos);
  const definitions = cleanArray(raw.definitions);
  const tags = cleanArray(raw.tags);
  const topics = cleanArray(raw.topics);
  const categories = cleanArray(raw.categories);

  // Conservative review rules:
  // We do NOT decide whether a word is linguistically correct.
  // We only flag records whose structure/content needs inspection.
  if (word.length > 300) {
    reasons.push("WORD_TOO_LONG");
  }

  if (definitions.some(looksLikeWikicode)) {
    reasons.push("WIKICODE_IN_DEFINITION");
  }

  if (definitions.some(hasControlCharacters)) {
    reasons.push("CONTROL_CHARACTER_IN_DEFINITION");
  }

  if (reasons.includes("CONTROL_CHARACTER") ||
      reasons.includes("URL_AS_WORD") ||
      reasons.includes("WIKICODE_IN_WORD") ||
      reasons.includes("LANGUAGE_MISMATCH:")) {
    return {
      record: null,
      reasons,
    };
  }

  const quality: QualityStatus =
    reasons.length === 0
      ? "PASS"
      : "REVIEW";

  return {
    record: {
      word,
      language,
      source: "Wiktextract",
      pos,
      definitions,
      tags,
      topics,
      categories,
      quality,
      qualityReasons: reasons,
    },
    reasons,
  };
}

function loadVocabulary(language: LanguageCode): WordRecord[] {
  const filePath = join(
    DATA_ROOT,
    language,
    "vocabulary.json"
  );

  if (!existsSync(filePath)) {
    throw new Error(
      `ไม่พบ vocabulary.json ของภาษา ${language}: ${filePath}`
    );
  }

  const parsed = JSON.parse(
    readFileSync(filePath, "utf8")
  ) as VocabularyFile;

  if (!Array.isArray(parsed.words)) {
    throw new Error(
      `รูปแบบไฟล์ไม่ถูกต้อง: ${filePath} ไม่มี words[]`
    );
  }

  return parsed.words.filter(isObject) as WordRecord[];
}

function writeValidated(
  language: LanguageCode,
  records: ValidatedRecord[]
): string {
  const dir = join(DATA_ROOT, language);
  mkdirSync(dir, { recursive: true });

  const outputPath = join(
    dir,
    "vocabulary.validated.json"
  );

  const payload = {
    language,
    source: "Wiktextract",
    validationVersion: "v1-structural-conservative",
    total: records.length,
    words: records,
  };

  writeFileSync(
    outputPath,
    JSON.stringify(payload, null, 2),
    "utf8"
  );

  return outputPath;
}

function writeReport(report: unknown): string {
  const outputPath = join(
    DATA_ROOT,
    "multi-language-validation-report.json"
  );

  writeFileSync(
    outputPath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return outputPath;
}

function main(): void {
  console.log("=== 14-LANGUAGE VOCABULARY VALIDATION V1 ===");
  console.log("Mode: conservative structural validation");
  console.log(
    "Important: linguistic correctness is NOT automatically judged."
  );
  console.log("");

  const report: {
    generatedAt: string;
    validationVersion: string;
    languages: Record<string, unknown>;
    totals: {
      sourceWords: number;
      uniqueWords: number;
      duplicatesRemoved: number;
      pass: number;
      review: number;
      reject: number;
      accepted: number;
    };
  } = {
    generatedAt: new Date().toISOString(),
    validationVersion: "v1-structural-conservative",
    languages: {},
    totals: {
      sourceWords: 0,
      uniqueWords: 0,
      duplicatesRemoved: 0,
      pass: 0,
      review: 0,
      reject: 0,
      accepted: 0,
    },
  };

  for (const language of LANGUAGES) {
    console.log(`\n--- ${language.toUpperCase()} ---`);

    const source = loadVocabulary(language);
    const seen = new Set<string>();
    const validated: ValidatedRecord[] = [];

    let duplicates = 0;
    let pass = 0;
    let review = 0;
    let reject = 0;

    for (const raw of source) {
      report.totals.sourceWords++;

      const result = validateRecord(raw, language);

      if (!result.record) {
        reject++;
        continue;
      }

      const key = result.record.word
        .normalize("NFC")
        .toLocaleLowerCase();

      if (seen.has(key)) {
        duplicates++;
        continue;
      }

      seen.add(key);
      validated.push(result.record);

      if (result.record.quality === "PASS") {
        pass++;
      } else {
        review++;
      }
    }

    const output = writeValidated(language, validated);

    report.totals.uniqueWords += validated.length;
    report.totals.duplicatesRemoved += duplicates;
    report.totals.pass += pass;
    report.totals.review += review;
    report.totals.reject += reject;
    report.totals.accepted += validated.length;

    report.languages[language] = {
      sourceWords: source.length,
      uniqueWords: validated.length,
      duplicatesRemoved: duplicates,
      pass,
      review,
      reject,
      accepted: validated.length,
      output,
    };

    console.log(`Source       : ${source.length.toLocaleString()}`);
    console.log(`Unique       : ${validated.length.toLocaleString()}`);
    console.log(`Duplicates   : ${duplicates.toLocaleString()}`);
    console.log(`PASS         : ${pass.toLocaleString()}`);
    console.log(`REVIEW       : ${review.toLocaleString()}`);
    console.log(`REJECT       : ${reject.toLocaleString()}`);
    console.log(`Output       : ${output}`);
  }

  const reportPath = writeReport(report);

  console.log("\n=== VALIDATION COMPLETE ===");
  console.log(
    `Source words : ${report.totals.sourceWords.toLocaleString()}`
  );
  console.log(
    `Unique words : ${report.totals.uniqueWords.toLocaleString()}`
  );
  console.log(
    `Duplicates   : ${report.totals.duplicatesRemoved.toLocaleString()}`
  );
  console.log(
    `PASS         : ${report.totals.pass.toLocaleString()}`
  );
  console.log(
    `REVIEW       : ${report.totals.review.toLocaleString()}`
  );
  console.log(
    `REJECT       : ${report.totals.reject.toLocaleString()}`
  );
  console.log(
    `Accepted     : ${report.totals.accepted.toLocaleString()}`
  );
  console.log(`Report       : ${reportPath}`);
}

main();
