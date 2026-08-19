import {
  existsSync,
  readFileSync,
} from "node:fs";

import {
  resolve,
  join,
} from "node:path";

type LanguageCode =
  | "th"
  | "en"
  | "zh"
  | "ja"
  | "ko"
  | "de"
  | "es"
  | "fr"
  | "pt"
  | "id"
  | "vi"
  | "hi"
  | "ar"
  | "lo";

const LANGUAGES: LanguageCode[] = [
  "th",
  "en",
  "zh",
  "ja",
  "ko",
  "de",
  "es",
  "fr",
  "pt",
  "id",
  "vi",
  "hi",
  "ar",
  "lo",
];

const BUCKETS = [
  "verbs",
  "nouns",
  "adjectives",
  "adverbs",
  "people",
  "places",
  "nature",
  "food",
  "animals",
  "body",
  "time",
  "objects",
  "vehicles",
  "emotions",
  "general",
] as const;

type WordBank = {
  language?: unknown;
  source?: unknown;
  builderVersion?: unknown;
  classificationMode?: unknown;
  note?: unknown;

  totals?: {
    source?: unknown;
    usable?: unknown;
    skipped?: unknown;
    review?: unknown;
    uniqueAcrossBuckets?: unknown;
  };

  buckets?: Record<
    string,
    unknown
  >;
};

const PROJECT_ROOT = resolve(process.cwd());

const WORDBANK_DIR = join(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "wordbank"
);

console.log("");
console.log("==============================================");
console.log("     WORDBANK 14-LANGUAGE STRUCTURE CHECK");
console.log("==============================================");
console.log("");

let languagesOK = 0;
let failed = 0;

let totalSource = 0;
let totalUsable = 0;
let totalSkipped = 0;
let totalReview = 0;
let totalUnique = 0;

for (const language of LANGUAGES) {
  const file = join(
    WORDBANK_DIR,
    language,
    "wordbank.json"
  );

  console.log(`--- ${language.toUpperCase()} ---`);

  if (!existsSync(file)) {
    console.log("❌ FILE NOT FOUND");
    console.log(file);
    console.log("");
    failed++;
    continue;
  }

  try {
    const raw = readFileSync(
      file,
      "utf8"
    );

    const data = JSON.parse(
      raw
    ) as WordBank;

    let languageValid = true;

    // -----------------------------------------
    // 1. ตรวจภาษา
    // -----------------------------------------

    if (data.language !== language) {
      console.log(
        `❌ Language mismatch: expected ${language}, got ${String(data.language)}`
      );

      languageValid = false;
    }

    // -----------------------------------------
    // 2. ตรวจ totals
    // -----------------------------------------

    const source =
      typeof data.totals?.source === "number"
        ? data.totals.source
        : 0;

    const usable =
      typeof data.totals?.usable === "number"
        ? data.totals.usable
        : 0;

    const skipped =
      typeof data.totals?.skipped === "number"
        ? data.totals.skipped
        : 0;

    const review =
      typeof data.totals?.review === "number"
        ? data.totals.review
        : 0;

    const unique =
      typeof data.totals?.uniqueAcrossBuckets === "number"
        ? data.totals.uniqueAcrossBuckets
        : 0;

    if (!data.totals) {
      console.log("❌ Missing totals");
      languageValid = false;
    }

    // -----------------------------------------
    // 3. ตรวจ buckets
    // -----------------------------------------

    if (!data.buckets) {
      console.log("❌ Missing buckets");
      languageValid = false;
    }

    let bucketWords = 0;

    for (const bucket of BUCKETS) {
      const value =
        data.buckets?.[bucket];

      if (!Array.isArray(value)) {
        console.log(
          `❌ Missing/invalid bucket: ${bucket}`
        );

        languageValid = false;
        continue;
      }

      bucketWords += value.length;
    }

    // -----------------------------------------
    // 4. แสดงผล
    // -----------------------------------------

    console.log(
      `Source   : ${source.toLocaleString()}`
    );

    console.log(
      `Usable   : ${usable.toLocaleString()}`
    );

    console.log(
      `Skipped  : ${skipped.toLocaleString()}`
    );

    console.log(
      `Review   : ${review.toLocaleString()}`
    );

    console.log(
      `Unique   : ${unique.toLocaleString()}`
    );

    console.log(
      `Buckets  : ${bucketWords.toLocaleString()}`
    );

    // -----------------------------------------
    // 5. ตรวจความสมเหตุสมผล
    // -----------------------------------------

    if (source < usable) {
      console.log(
        "⚠️ WARNING: usable > source is impossible"
      );

      languageValid = false;
    }

    if (unique > bucketWords) {
      console.log(
        "⚠️ WARNING: uniqueAcrossBuckets > bucket words"
      );

      languageValid = false;
    }

    if (usable !== unique) {
      console.log(
        "ℹ️ INFO: usable and unique differ"
      );
    }

    // -----------------------------------------
    // 6. สรุปภาษา
    // -----------------------------------------

    if (languageValid) {
      console.log("✓ STRUCTURE OK");
      languagesOK++;
    } else {
      console.log("❌ STRUCTURE ERROR");
      failed++;
    }

    totalSource += source;
    totalUsable += usable;
    totalSkipped += skipped;
    totalReview += review;
    totalUnique += unique;

    console.log("");
  } catch (error) {
    console.log("❌ INVALID JSON");

    if (error instanceof Error) {
      console.log(error.message);
    }

    console.log("");

    failed++;
  }
}

console.log("");
console.log("==============================================");
console.log("RESULT");
console.log("==============================================");

console.log(
  `Languages OK : ${languagesOK}/${LANGUAGES.length}`
);

console.log(
  `Failed       : ${failed}`
);

console.log(
  `Source       : ${totalSource.toLocaleString()}`
);

console.log(
  `Usable       : ${totalUsable.toLocaleString()}`
);

console.log(
  `Skipped      : ${totalSkipped.toLocaleString()}`
);

console.log(
  `Review       : ${totalReview.toLocaleString()}`
);

console.log(
  `Unique       : ${totalUnique.toLocaleString()}`
);

console.log("");

if (
  languagesOK === LANGUAGES.length &&
  failed === 0
) {
  console.log(
    "✓ ALL 14 WORDBANK STRUCTURES ARE VALID"
  );
} else {
  console.log(
    "❌ SOME WORDBANKS NEED ATTENTION"
  );
}

console.log("");