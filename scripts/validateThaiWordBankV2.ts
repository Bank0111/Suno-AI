import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve } from "node:path";

type QualityStatus = "PASS" | "REVIEW" | "REJECT";

type WordRecord = {
  word: string;
  language?: string;
  source?: string;
  pos?: string[];
  definitions?: string[];
  tags?: string[];
  topics?: string[];
  categories?: string[];
  quality?: {
    status?: QualityStatus;
    score?: number;
    reasons?: string[];
  };
};

type ValidationRecord = WordRecord & {
  validation: {
    status: QualityStatus;
    score: number;
    reasons: string[];
  };
};

const ROOT = resolve(process.cwd());

const INPUT = resolve(
  ROOT,
  "server",
  "lexicon",
  "data",
  "languages",
  "th",
  "vocabulary.json"
);

const OUTPUT_DIR = resolve(
  ROOT,
  "server",
  "lexicon",
  "data",
  "languages",
  "th"
);

const OUTPUT = resolve(
  OUTPUT_DIR,
  "vocabulary.validated.json"
);

const REPORT = resolve(
  OUTPUT_DIR,
  "validation-report.json"
);

const THAI_RE = /[\u0E00-\u0E7F]/u;
const THAI_ALLOWED_RE =
  /^[\u0E00-\u0E7F\s\u200B\u200C\u200D\u200E\u200F\u2060\uFEFF.,'’"“”()\-–—/]+$/u;

const RISK_TAGS = new Set([
  "misspelling",
  "obsolete",
  "archaic",
  "nonstandard",
  "rare",
  "dated",
]);

const NAME_HINTS = [
  "proper noun",
  "ชื่อเฉพาะ",
  "ชื่อบุคคล",
  "ชื่อสถานที่",
];

const PROFANITY_HINTS = [
  // Deliberately conservative. This validator does not attempt
  // to classify all Thai profanity automatically.
];

function normalize(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function containsThai(word: string): boolean {
  return THAI_RE.test(word);
}

function hasSuspiciousControlChars(word: string): boolean {
  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(word);
}

function hasThaiOnlyShape(word: string): boolean {
  return THAI_ALLOWED_RE.test(word);
}

function isOnlyPunctuation(word: string): boolean {
  return /^[\p{P}\p{S}\s]+$/u.test(word);
}

function looksLikeUrlOrEmail(word: string): boolean {
  return (
    /https?:\/\//iu.test(word) ||
    /www\./iu.test(word) ||
    /@/u.test(word)
  );
}

function validateWord(
  record: WordRecord
): ValidationRecord["validation"] {
  const word = normalize(
    typeof record.word === "string"
      ? record.word
      : ""
  );

  const pos =
    Array.isArray(record.pos)
      ? record.pos.filter(Boolean)
      : [];

  const definitions =
    Array.isArray(record.definitions)
      ? record.definitions.filter(Boolean)
      : [];

  const tags =
    Array.isArray(record.tags)
      ? record.tags.map(normalize)
      : [];

  const topics =
    Array.isArray(record.topics)
      ? record.topics.map(normalize)
      : [];

  const categories =
    Array.isArray(record.categories)
      ? record.categories.map(normalize)
      : [];

  let score = 100;
  const reasons: string[] = [];

  if (!word) {
    return {
      status: "REJECT",
      score: 0,
      reasons: ["ไม่มี word"],
    };
  }

  if (word.length > 80) {
    score -= 50;
    reasons.push("ยาวเกิน 80 ตัวอักษร");
  }

  if (hasSuspiciousControlChars(word)) {
    return {
      status: "REJECT",
      score: 0,
      reasons: ["พบ control character"],
    };
  }

  if (looksLikeUrlOrEmail(word)) {
    return {
      status: "REJECT",
      score: 0,
      reasons: ["มีลักษณะ URL หรือ email"],
    };
  }

  if (!containsThai(word)) {
    return {
      status: "REJECT",
      score: 0,
      reasons: ["ไม่มีอักขระไทย"],
    };
  }

  if (!hasThaiOnlyShape(word)) {
    score -= 12;
    reasons.push(
      "มีอักขระนอกชุดไทยที่อนุญาต; ต้อง REVIEW"
    );
  }

  if (isOnlyPunctuation(word)) {
    return {
      status: "REJECT",
      score: 0,
      reasons: ["เป็นเครื่องหมายวรรคตอน/สัญลักษณ์เท่านั้น"],
    };
  }

  if (pos.length === 0) {
    score -= 18;
    reasons.push("ไม่มี POS");
  } else {
    reasons.push("มี POS");
  }

  if (definitions.length === 0) {
    score -= 35;
    reasons.push("ไม่มี definition");
  } else {
    reasons.push("มี definition");
  }

  const lowerTags =
    tags.map(tag => tag.toLocaleLowerCase());

  const riskTags =
    unique(
      lowerTags.filter(tag =>
        RISK_TAGS.has(tag)
      )
    );

  if (riskTags.length > 0) {
    score -= Math.min(
      30,
      riskTags.length * 10
    );
    reasons.push(
      `มี tag ที่ควรตรวจ: ${riskTags.join(", ")}`
    );
  }

  const textForHints =
    [
      ...lowerTags,
      ...topics.map(v => v.toLocaleLowerCase()),
      ...categories.map(v => v.toLocaleLowerCase()),
    ].join(" ");

  const properNounHint =
    NAME_HINTS.some(hint =>
      textForHints.includes(hint.toLocaleLowerCase())
    );

  if (properNounHint) {
    score -= 8;
    reasons.push(
      "อาจเป็นชื่อเฉพาะ; ไม่ควรใช้เป็นคำทั่วไปโดยอัตโนมัติ"
    );
  }

  if (PROFANITY_HINTS.length > 0) {
    // Reserved for a future explicit policy dataset.
  }

  score = Math.max(0, Math.min(100, score));

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

function main(): void {
  if (!existsSync(INPUT)) {
    throw new Error(
      `ไม่พบไฟล์:\n${INPUT}\n\n` +
      `ต้องรัน importWiktextract.ts ก่อน`
    );
  }

  mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  const raw =
    JSON.parse(
      readFileSync(INPUT, "utf8")
    ) as {
      language?: string;
      total?: number;
      words?: WordRecord[];
    };

  const sourceWords =
    Array.isArray(raw.words)
      ? raw.words
      : [];

  const byWord =
    new Map<string, ValidationRecord>();

  let duplicateCount = 0;

  for (const record of sourceWords) {
    const normalized =
      normalize(
        typeof record.word === "string"
          ? record.word
          : ""
      );

    if (!normalized) continue;

    const key =
      normalized.toLocaleLowerCase();

    const validation =
      validateWord({
        ...record,
        word: normalized,
      });

    const result: ValidationRecord = {
      ...record,
      word: normalized,
      validation,
    };

    const previous =
      byWord.get(key);

    if (!previous) {
      byWord.set(key, result);
      continue;
    }

    duplicateCount++;

    if (
      result.validation.score >
      previous.validation.score
    ) {
      byWord.set(key, result);
    }
  }

  const all =
    [...byWord.values()];

  const pass =
    all.filter(
      item =>
        item.validation.status === "PASS"
    );

  const review =
    all.filter(
      item =>
        item.validation.status === "REVIEW"
    );

  const reject =
    all.filter(
      item =>
        item.validation.status === "REJECT"
    );

  // For the validated lyric bank, keep PASS + REVIEW.
  // REJECT remains represented in the report only.
  const accepted =
    [...pass, ...review]
      .sort((a, b) =>
        a.word.localeCompare(
          b.word,
          "th"
        )
      );

  const report = {
    generatedAt:
      new Date().toISOString(),
    input: INPUT,
    output: OUTPUT,
    sourceTotal:
      sourceWords.length,
    uniqueAfterNormalization:
      all.length,
    duplicatesRemoved:
      duplicateCount,
    pass:
      pass.length,
    review:
      review.length,
    reject:
      reject.length,
    acceptedForLyricBank:
      accepted.length,
    note:
      "PASS/REVIEW are quality triage results, not proof of 100% linguistic correctness.",
  };

  writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        language: "th",
        source:
          "Wiktextract / Wiktionary",
        generatedAt:
          report.generatedAt,
        total:
          accepted.length,
        words:
          accepted,
      },
      null,
      2
    ),
    "utf8"
  );

  writeFileSync(
    REPORT,
    JSON.stringify(
      report,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "\n=== THAI VALIDATION V2 COMPLETE ===\n"
  );
  console.log(
    `Source words       : ${sourceWords.length.toLocaleString()}`
  );
  console.log(
    `Unique             : ${all.length.toLocaleString()}`
  );
  console.log(
    `Duplicates removed : ${duplicateCount.toLocaleString()}`
  );
  console.log(
    `PASS               : ${pass.length.toLocaleString()}`
  );
  console.log(
    `REVIEW             : ${review.length.toLocaleString()}`
  );
  console.log(
    `REJECT             : ${reject.length.toLocaleString()}`
  );
  console.log(
    `Accepted           : ${accepted.length.toLocaleString()}`
  );
  console.log(
    `Output             : ${OUTPUT}`
  );
  console.log(
    `Report             : ${REPORT}`
  );
}

main();
