import {
  createReadStream,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { createInterface } from "node:readline";
import { resolve, dirname } from "node:path";

type Sense = {
  glosses?: unknown;
  raw_glosses?: unknown;
  tags?: unknown;
  topics?: unknown;
  categories?: unknown;
  form_of?: unknown;
  alt_of?: unknown;
};

type WiktextractEntry = {
  word?: unknown;
  lang?: unknown;
  lang_code?: unknown;
  pos?: unknown;
  senses?: unknown;
  forms?: unknown;
  tags?: unknown;
  redirect?: unknown;
  sounds?: unknown;
  categories?: unknown;
};

type QualityStatus = "PASS" | "REVIEW" | "REJECT";

type WordRecord = {
  word: string;
  language: "th";
  source: "wiktextract";
  pos: string[];
  definitions: string[];
  tags: string[];
  topics: string[];
  categories: string[];
  quality: {
    status: QualityStatus;
    score: number;
    reasons: string[];
  };
};

type Report = {
  sourceFile: string;
  language: "th";
  startedAt: string;
  finishedAt: string;
  linesRead: number;
  jsonErrors: number;
  entriesThai: number;
  uniqueWords: number;
  pass: number;
  review: number;
  reject: number;
  rejectedRedirects: number;
  rejectedNoSense: number;
  rejectedWrongScript: number;
  rejectedInvalidWord: number;
  rejectedFormOf: number;
  outputFile: string;
};

const PROJECT_ROOT = resolve(process.cwd());

const INPUT_FILE = resolve(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "raw",
  "th",
  "raw-wiktextract-data.jsonl"
);

const OUTPUT_DIR = resolve(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "languages",
  "th"
);

const OUTPUT_FILE = resolve(
  OUTPUT_DIR,
  "vocabulary.json"
);

const REPORT_FILE = resolve(
  OUTPUT_DIR,
  "import-report.json"
);

const MAX_WORD_LENGTH = 80;

// Thai Unicode ranges used for the primary script check.
// Thai block: U+0E00–U+0E7F.
const THAI_RE = /[\u0E00-\u0E7F]/u;
const THAI_ONLY_RE = /^[\u0E00-\u0E7F\s\u0E31-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u200B\u200C\u200D\u200E\u200F\u2060\uFEFF.,'’()\-–—/]+$/u;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map(normalizeText)
    .filter(Boolean);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWord(value: string): string {
  return normalizeText(value)
    .replace(/^[\u0022“”]+|[\u0022“”]+$/g, "");
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function hasThai(word: string): boolean {
  return THAI_RE.test(word);
}

function isUsableWord(word: string): boolean {
  if (!word) return false;
  if (word.length > MAX_WORD_LENGTH) return false;
  if (word.includes("\n") || word.includes("\r")) return false;
  if (/https?:\/\//iu.test(word)) return false;
  if (/@/u.test(word)) return false;
  if (/^\d+$/u.test(word)) return false;

  // Reject entries made primarily of Latin/ASCII characters.
  if (!hasThai(word)) return false;

  return true;
}

function scriptLooksThai(word: string): boolean {
  return THAI_ONLY_RE.test(word);
}

function extractSenses(
  senses: unknown
): {
  definitions: string[];
  tags: string[];
  topics: string[];
  categories: string[];
  hasFormOf: boolean;
  hasAltOf: boolean;
} {
  const definitions: string[] = [];
  const tags: string[] = [];
  const topics: string[] = [];
  const categories: string[] = [];
  let hasFormOf = false;
  let hasAltOf = false;

  if (!Array.isArray(senses)) {
    return {
      definitions,
      tags,
      topics,
      categories,
      hasFormOf,
      hasAltOf,
    };
  }

  for (const rawSense of senses) {
    if (!rawSense || typeof rawSense !== "object") continue;

    const sense = rawSense as Sense;

    definitions.push(
      ...asStringArray(sense.glosses),
      ...asStringArray(sense.raw_glosses)
    );

    tags.push(...asStringArray(sense.tags));
    topics.push(...asStringArray(sense.topics));
    categories.push(...asStringArray(sense.categories));

    if (
      Array.isArray(sense.form_of) &&
      sense.form_of.length > 0
    ) {
      hasFormOf = true;
    }

    if (
      Array.isArray(sense.alt_of) &&
      sense.alt_of.length > 0
    ) {
      hasAltOf = true;
    }
  }

  return {
    definitions: unique(definitions),
    tags: unique(tags),
    topics: unique(topics),
    categories: unique(categories),
    hasFormOf,
    hasAltOf,
  };
}

function classify(
  word: string,
  entry: WiktextractEntry,
  senseData: ReturnType<typeof extractSenses>
): WordRecord["quality"] {
  let score = 0;
  const reasons: string[] = [];

  // This score is a quality triage score, not proof of spelling correctness.
  if (word.length > 0) {
    score += 15;
  }

  if (scriptLooksThai(word)) {
    score += 20;
    reasons.push("รูปคำอยู่ในชุดอักขระไทยที่คาดหวัง");
  } else {
    reasons.push("พบอักขระนอกชุดไทยที่อนุญาต");
  }

  if (asString(entry.pos)) {
    score += 15;
    reasons.push("มี POS");
  } else {
    reasons.push("ไม่มี POS");
  }

  if (senseData.definitions.length > 0) {
    score += 25;
    reasons.push("มีข้อมูลความหมาย");
  } else {
    reasons.push("ไม่มีข้อมูลความหมาย");
  }

  if (
    senseData.hasFormOf ||
    senseData.hasAltOf
  ) {
    score -= 10;
    reasons.push("เป็นหรืออาจเป็นรูปผัน/รูปทางเลือก");
  }

  const lowerTags =
    senseData.tags.map(tag => tag.toLocaleLowerCase());

  const riskyTags = new Set([
    "misspelling",
    "obsolete",
    "archaic",
    "nonstandard",
    "rare",
    "dated",
  ]);

  const matchedRiskTags =
    lowerTags.filter(tag => riskyTags.has(tag));

  if (matchedRiskTags.length > 0) {
    score -= Math.min(
      25,
      matchedRiskTags.length * 8
    );

    reasons.push(
      `มี tag ที่ควรตรวจเพิ่ม: ${unique(matchedRiskTags).join(", ")}`
    );
  }

  if (
    senseData.topics.length > 0 ||
    senseData.categories.length > 0
  ) {
    score += 5;
  }

  if (score >= 75) {
    return {
      status: "PASS",
      score,
      reasons,
    };
  }

  if (score >= 50) {
    return {
      status: "REVIEW",
      score,
      reasons,
    };
  }

  return {
    status: "REJECT",
    score,
    reasons,
  };
}

async function main(): Promise<void> {
  if (!existsSync(INPUT_FILE)) {
    throw new Error(
      `ไม่พบไฟล์ต้นทาง:\n${INPUT_FILE}`
    );
  }

  mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  const startedAt =
    new Date().toISOString();

  const records = new Map<
    string,
    WordRecord
  >();

  const report: Report = {
    sourceFile: INPUT_FILE,
    language: "th",
    startedAt,
    finishedAt: "",
    linesRead: 0,
    jsonErrors: 0,
    entriesThai: 0,
    uniqueWords: 0,
    pass: 0,
    review: 0,
    reject: 0,
    rejectedRedirects: 0,
    rejectedNoSense: 0,
    rejectedWrongScript: 0,
    rejectedInvalidWord: 0,
    rejectedFormOf: 0,
    outputFile: OUTPUT_FILE,
  };

  console.log("\n=== THAI WIKTEXTRACT IMPORT ===\n");
  console.log(`Input : ${INPUT_FILE}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);
  console.log("กำลังอ่านแบบ Streaming — ห้ามเปิดไฟล์ต้นทางใน VS Code\n");

  const input =
    createReadStream(INPUT_FILE, {
      encoding: "utf8",
      highWaterMark: 1024 * 1024,
    });

  const lines =
    createInterface({
      input,
      crlfDelay: Infinity,
    });

  for await (const line of lines) {
    report.linesRead++;

    if (!line.trim()) continue;

    let entry: WiktextractEntry;

    try {
      entry = JSON.parse(line) as WiktextractEntry;
    } catch {
      report.jsonErrors++;
      continue;
    }

    // Redirects have a redirect field and do not represent a normal
    // language/POS entry.
    if (entry.redirect) {
      report.rejectedRedirects++;
      continue;
    }

    const langCode =
      asString(entry.lang_code);

    if (langCode !== "th") {
      continue;
    }

    report.entriesThai++;

    const word =
      normalizeWord(
        asString(entry.word)
      );

    if (!isUsableWord(word)) {
      report.rejectedInvalidWord++;
      continue;
    }

    if (!scriptLooksThai(word)) {
      report.rejectedWrongScript++;
      continue;
    }

    const senseData =
      extractSenses(entry.senses);

    if (senseData.definitions.length === 0) {
      report.rejectedNoSense++;
      continue;
    }

    if (senseData.hasFormOf) {
      report.rejectedFormOf++;
    }

    const quality =
      classify(
        word,
        entry,
        senseData
      );

    const pos =
      asString(entry.pos);

    const record: WordRecord = {
      word,
      language: "th",
      source: "wiktextract",
      pos: pos ? [pos] : [],
      definitions: senseData.definitions.slice(0, 20),
      tags: senseData.tags,
      topics: senseData.topics,
      categories: senseData.categories,
      quality,
    };

    const key =
      word.toLocaleLowerCase();

    const previous =
      records.get(key);

    if (!previous) {
      records.set(key, record);
    } else {
      // Keep the strongest quality result and merge evidence.
      if (
        record.quality.score >
        previous.quality.score
      ) {
        records.set(key, {
          ...record,
          pos: unique([
            ...previous.pos,
            ...record.pos,
          ]),
          definitions: unique([
            ...previous.definitions,
            ...record.definitions,
          ]).slice(0, 20),
          tags: unique([
            ...previous.tags,
            ...record.tags,
          ]),
          topics: unique([
            ...previous.topics,
            ...record.topics,
          ]),
          categories: unique([
            ...previous.categories,
            ...record.categories,
          ]),
        });
      }
    }

    if (
      report.linesRead % 100000 === 0
    ) {
      console.log(
        `อ่านแล้ว ${report.linesRead.toLocaleString()} บรรทัด | ` +
        `Thai entries ${report.entriesThai.toLocaleString()} | ` +
        `unique ${records.size.toLocaleString()}`
      );
    }
  }

  const vocabulary =
    [...records.values()]
      .sort((a, b) =>
        a.word.localeCompare(
          b.word,
          "th"
        )
      );

  for (const record of vocabulary) {
    if (record.quality.status === "PASS") {
      report.pass++;
    } else if (
      record.quality.status === "REVIEW"
    ) {
      report.review++;
    } else {
      report.reject++;
    }
  }

  report.uniqueWords =
    vocabulary.length;

  report.finishedAt =
    new Date().toISOString();

  writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        language: "th",
        source: "Wiktextract / Wiktionary",
        generatedAt: report.finishedAt,
        total: vocabulary.length,
        words: vocabulary,
      },
      null,
      2
    ),
    "utf8"
  );

  writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      report,
      null,
      2
    ),
    "utf8"
  );

  console.log("\n=== IMPORT COMPLETE ===\n");
  console.log(
    `Lines read       : ${report.linesRead.toLocaleString()}`
  );
  console.log(
    `Thai entries     : ${report.entriesThai.toLocaleString()}`
  );
  console.log(
    `Unique words     : ${report.uniqueWords.toLocaleString()}`
  );
  console.log(
    `PASS             : ${report.pass.toLocaleString()}`
  );
  console.log(
    `REVIEW           : ${report.review.toLocaleString()}`
  );
  console.log(
    `REJECT           : ${report.reject.toLocaleString()}`
  );
  console.log(
    `JSON errors      : ${report.jsonErrors.toLocaleString()}`
  );
  console.log(
    `Output           : ${OUTPUT_FILE}`
  );
  console.log(
    `Report           : ${REPORT_FILE}`
  );
}

main().catch(error => {
  console.error("\n[IMPORT FAILED]\n");
  console.error(
    error instanceof Error
      ? error.message
      : error
  );
  process.exit(1);
});
