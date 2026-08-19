import {
  getLanguageData,
} from "../server/lexicon/lexiconEngine";

const LANGUAGES = [
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
] as const;

console.log("");
console.log("==============================================");
console.log("     LEXICON 14-LANGUAGE DEEP RUNTIME CHECK");
console.log("==============================================");
console.log("");

let success = 0;
let failed = 0;

for (const language of LANGUAGES) {
  try {
    const data = getLanguageData(language);

    const vocabulary = data.vocabulary ?? [];
    const domains = data.domains ?? [];
    const rhymes = data.rhymes ?? {};

    const uniqueVocabulary = new Set(
      vocabulary
        .map((word) => word.trim())
        .filter(Boolean)
    );

    const rhymeKeys = Object.keys(rhymes);

    const hasVocabulary = vocabulary.length > 0;
    const hasDomains = domains.length > 0;
    const hasRhymes = rhymeKeys.length > 0;

    const valid =
      hasVocabulary &&
      hasDomains &&
      hasRhymes;

    console.log(`--- ${language.toUpperCase()} ---`);

    console.log(
      `Vocabulary : ${vocabulary.length.toLocaleString()}`
    );

    console.log(
      `Unique      : ${uniqueVocabulary.size.toLocaleString()}`
    );

    console.log(
      `Domains     : ${domains.length.toLocaleString()}`
    );

    console.log(
      `Rhymes      : ${rhymeKeys.length.toLocaleString()}`
    );

    console.log(
      `Sample Word : ${vocabulary.slice(0, 3).join(", ")}`
    );

    console.log(
  `Sample Domain : ${
    domains.length > 0
      ? JSON.stringify(domains[0])
      : "EMPTY"
  }`
);

    console.log(
      `Sample Rhyme  : ${rhymeKeys[0] ?? "EMPTY"}`
    );

    console.log(
      `Data         : ${data ? "OK" : "EMPTY"}`
    );

    if (valid) {
      console.log("✓ LANGUAGE DATA OK");
      success++;
    } else {
      console.log("❌ LANGUAGE DATA INCOMPLETE");
      failed++;
    }

    console.log("");
  } catch (error) {
    console.log(`--- ${language.toUpperCase()} ---`);
    console.log("❌ RUNTIME ERROR");
    console.log(error);
    console.log("");

    failed++;
  }
}

console.log("==============================================");
console.log("RESULT");
console.log("==============================================");

console.log(
  `Languages OK : ${success}/${LANGUAGES.length}`
);

console.log(
  `Failed       : ${failed}`
);

console.log("");

if (failed === 0) {
  console.log(
    "✓ ALL 14 LANGUAGES HAVE REAL LEXICON DATA"
  );
} else {
  console.log(
    "❌ SOME LANGUAGES HAVE INCOMPLETE LEXICON DATA"
  );
}

console.log("");