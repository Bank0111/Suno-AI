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

type QualityStatus = "PASS" | "REVIEW" | "REJECT";

type WordRecord = {
  word?: unknown;
  language?: unknown;
  source?: unknown;
  pos?: unknown;
  definitions?: unknown;
  tags?: unknown;
  topics?: unknown;
  categories?: unknown;
  quality?: unknown;
  qualityReasons?: unknown;
};

type VocabularyFile = {
  language?: unknown;
  total?: unknown;
  words?: unknown;
};

type Bucket =
  | "verbs"
  | "nouns"
  | "adjectives"
  | "adverbs"
  | "people"
  | "places"
  | "nature"
  | "food"
  | "animals"
  | "body"
  | "time"
  | "objects"
  | "vehicles"
  | "emotions"
  | "general";

const LANGUAGES: LanguageCode[] = [
  "th", "en", "zh", "ja", "ko",
  "de", "es", "fr", "pt", "id",
  "vi", "hi", "ar", "lo",
];

const ROOT = resolve(process.cwd());
const DATA_ROOT = resolve(ROOT, "server", "lexicon", "data", "languages");
const OUTPUT_ROOT = resolve(ROOT, "server", "lexicon", "data", "wordbank");

const BUCKETS: Bucket[] = [
  "verbs", "nouns", "adjectives", "adverbs",
  "people", "places", "nature", "food", "animals",
  "body", "time", "objects", "vehicles", "emotions",
  "general",
];

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

function hasAny(values: string[], patterns: RegExp[]): boolean {
  return values.some(v => patterns.some(pattern => pattern.test(v)));
}

function classifyByMetadata(record: WordRecord): Bucket {
  const pos = cleanArray(record.pos).map(v => v.toLocaleLowerCase());
  const topics = cleanArray(record.topics).map(v => v.toLocaleLowerCase());
  const tags = cleanArray(record.tags).map(v => v.toLocaleLowerCase());
  const categories = cleanArray(record.categories).map(v => v.toLocaleLowerCase());
  const definitions = cleanArray(record.definitions).map(v => v.toLocaleLowerCase());

  const all = [...pos, ...topics, ...tags, ...categories, ...definitions];

  // Topic/category classification is intentionally conservative.
  if (hasAny(all, [/emotion|feeling|sentiment|อารมณ์|ความรู้สึก/u]))
    return "emotions";

  if (hasAny(all, [/person|people|human|occupation|บุคคล|อาชีพ|คน/u]))
    return "people";

  if (hasAny(all, [/place|location|geography|สถานที่|ภูมิศาสตร์/u]))
    return "places";

  if (hasAny(all, [/nature|natural|plant|พืช|ธรรมชาติ/u]))
    return "nature";

  if (hasAny(all, [/food|drink|beverage|อาหาร|เครื่องดื่ม/u]))
    return "food";

  if (hasAny(all, [/animal|สัตว์/u]))
    return "animals";

  if (hasAny(all, [/body|anatomy|ร่างกาย|อวัยวะ/u]))
    return "body";

  if (hasAny(all, [/time|date|temporal|เวลา|วันที่/u]))
    return "time";

  if (hasAny(all, [/vehicle|transport|ยานพาหนะ|การขนส่ง/u]))
    return "vehicles";

  if (hasAny(all, [/object|tool|instrument|วัตถุ|เครื่องมือ|อุปกรณ์/u]))
    return "objects";

  // POS is used only after topic/category checks.
  if (pos.some(v => /verb|กริยา|คำกริยา/u.test(v)))
    return "verbs";

  if (pos.some(v => /adjective|adj|คุณศัพท์|คำคุณศัพท์/u.test(v)))
    return "adjectives";

  if (pos.some(v => /adverb|adv|วิเศษณ์|คำวิเศษณ์/u.test(v)))
    return "adverbs";

  if (pos.some(v => /noun|คำนาม/u.test(v)))
    return "nouns";

  return "general";
}

function isUsableWord(record: WordRecord): boolean {
  const word = cleanText(record.word);

  if (!word) return false;
  if (word.length > 120) return false;

  // Do not put obvious sentences/URLs/Wikicode into the lyric word bank.
  if (/^(?:https?:\/\/|www\.)/iu.test(word)) return false;
  if (/\{\{.*\}\}|\[\[.*\]\]|<ref\b|<\/?nowiki\b/iu.test(word))
    return false;

  const quality = cleanText(record.quality);
  if (quality === "REJECT") return false;

  return true;
}

function addUnique(target: string[], seen: Set<string>, word: string): void {
  const key = word.normalize("NFC").toLocaleLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  target.push(word);
}

function buildLanguage(language: LanguageCode) {
  const inputPath = join(
    DATA_ROOT,
    language,
    "vocabulary.validated.json"
  );

  if (!existsSync(inputPath)) {
    throw new Error(`ไม่พบไฟล์: ${inputPath}`);
  }

  const parsed = JSON.parse(
    readFileSync(inputPath, "utf8")
  ) as VocabularyFile;

  if (!Array.isArray(parsed.words)) {
    throw new Error(`ไม่มี words[] ใน ${inputPath}`);
  }

  const buckets: Record<Bucket, string[]> = Object.fromEntries(
    BUCKETS.map(bucket => [bucket, []])
  ) as Record<Bucket, string[]>;

  const seenByBucket: Record<Bucket, Set<string>> = Object.fromEntries(
    BUCKETS.map(bucket => [bucket, new Set<string>()])
  ) as Record<Bucket, Set<string>>;

  let source = 0;
  let usable = 0;
  let skipped = 0;
  let review = 0;

  for (const raw of parsed.words) {
    source++;

    if (!isUsableWord(raw)) {
      skipped++;
      continue;
    }

    if (cleanText(raw.quality) === "REVIEW") review++;

    const word = cleanText(raw.word);
    const bucket = classifyByMetadata(raw);

    addUnique(buckets[bucket], seenByBucket[bucket], word);
    usable++;
  }

  const outputDir = join(OUTPUT_ROOT, language);
  mkdirSync(outputDir, { recursive: true });

  const output = {
    language,
    source: "Wiktextract",
    builderVersion: "wordbank-builder-v1",
    classificationMode: "conservative-metadata-first",
    note:
      "Buckets are heuristic. They are intended as a retrieval layer, not a claim of linguistic truth.",
    totals: {
      source,
      usable,
      skipped,
      review,
      uniqueAcrossBuckets: new Set(
        BUCKETS.flatMap(bucket => buckets[bucket])
          .map(word => word.normalize("NFC").toLocaleLowerCase())
      ).size,
    },
    buckets,
  };

  const outputPath = join(outputDir, "wordbank.json");

  writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf8"
  );

  return {
    source,
    usable,
    skipped,
    review,
    buckets: Object.fromEntries(
      BUCKETS.map(bucket => [bucket, buckets[bucket].length])
    ),
    output: outputPath,
  };
}

function main() {
  mkdirSync(OUTPUT_ROOT, { recursive: true });

  console.log("=== WORD BANK BUILDER V1 ===");
  console.log("Languages:", LANGUAGES.join(", "));
  console.log("");

  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    version: "wordbank-builder-v1",
    classificationMode: "conservative-metadata-first",
    languages: {},
  };

  let totalSource = 0;
  let totalUsable = 0;
  let totalSkipped = 0;
  let totalReview = 0;

  for (const language of LANGUAGES) {
    console.log(`--- ${language.toUpperCase()} ---`);

    const result = buildLanguage(language);

    report.languages[language] = result;

    totalSource += result.source;
    totalUsable += result.usable;
    totalSkipped += result.skipped;
    totalReview += result.review;

    console.log("Source :", result.source.toLocaleString());
    console.log("Usable :", result.usable.toLocaleString());
    console.log("Skipped:", result.skipped.toLocaleString());
    console.log("Review :", result.review.toLocaleString());
    console.log("Output :", result.output);
    console.log("");
  }

  const finalReport = {
    ...report,
    totals: {
      source: totalSource,
      usable: totalUsable,
      skipped: totalSkipped,
      review: totalReview,
    },
  };

  const reportPath = join(
    OUTPUT_ROOT,
    "wordbank-build-report.json"
  );

  writeFileSync(
    reportPath,
    JSON.stringify(finalReport, null, 2),
    "utf8"
  );

  console.log("=== BUILD COMPLETE ===");
  console.log("Source :", totalSource.toLocaleString());
  console.log("Usable :", totalUsable.toLocaleString());
  console.log("Skipped:", totalSkipped.toLocaleString());
  console.log("Review :", totalReview.toLocaleString());
  console.log("Report :", reportPath);
}

main();
