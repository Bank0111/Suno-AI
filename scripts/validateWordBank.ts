import {
  createReadStream,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";

type LanguageCode =
  | "th" | "en" | "zh" | "ja" | "ko"
  | "es" | "fr" | "de" | "pt" | "id"
  | "vi" | "hi" | "ar";

type Entry = {
  word?: string;
  language?: string;
  pos?: string;
  senses?: string[];
  tags?: string[];
  ipa?: string[];
  source?: string;
};

const LANGUAGES: LanguageCode[] = [
  "th","en","zh","ja","ko","es","fr","de","pt","id","vi","hi","ar"
];

const REVIEW_TAGS = new Set([
  "archaic","obsolete","rare","dated","dialectal","regional",
  "nonstandard","informal","slang","vulgar","offensive",
  "proper noun","alternative","alternative form","misspelling"
]);

const REJECT_TAGS = new Set(["misspelling"]);

const root = resolve(process.cwd());
const inputRoot = join(
  root,
  "server",
  "lexicon",
  "data",
  "languages"
);
const reportRoot = join(
  root,
  "server",
  "lexicon",
  "quality-reports"
);

function hasScriptProblem(word: string, language: LanguageCode): boolean {
  /*
   * This is deliberately conservative.
   * Latin languages allow Unicode letters with diacritics.
   * CJK/Japanese allow mixed scripts; Korean allows Hangul + punctuation.
   * Thai/Devanagari/Arabic checks reject obvious foreign-script contamination,
   * but do not declare a linguistically valid loanword incorrect.
   */
  if (!word) return true;

  if (language === "th") {
    return /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word);
  }

  if (language === "hi") {
    return /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word);
  }

  if (language === "ar") {
    return /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word);
  }

  if (language === "ko") {
    return /[\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word);
  }

  return false;
}

function suspiciousFormat(word: string): boolean {
  return (
    /^https?:\/\//i.test(word) ||
    /^(www\.|ftp\.)/i.test(word) ||
    /^[a-f0-9]{20,}$/i.test(word) ||
    /[<>]/.test(word) ||
    word.length > 120
  );
}

function normalize(word: string): string {
  return word.normalize("NFKC").trim().replace(/\s+/g, " ");
}

async function validateLanguage(language: LanguageCode) {
  const input = join(
    inputRoot,
    language,
    "vocabulary.jsonl"
  );

  if (!existsSync(input)) {
    return {
      language,
      status: "NO_DATA",
      totals: {
        total: 0,
        pass: 0,
        review: 0,
        reject: 0,
      },
      reasons: {},
    };
  }

  const stream = createReadStream(input);
  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const seen = new Set<string>();
  const reasons: Record<string, number> = {};
  const reviewSamples: Array<{
    word: string;
    reasons: string[];
  }> = [];
  const rejectSamples: Array<{
    word: string;
    reasons: string[];
  }> = [];

  let total = 0;
  let pass = 0;
  let review = 0;
  let reject = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    let entry: Entry;
    try {
      entry = JSON.parse(line) as Entry;
    } catch {
      reject++;
      reasons.invalid_json =
        (reasons.invalid_json ?? 0) + 1;
      continue;
    }

    total++;

    const word = normalize(entry.word ?? "");
    const flags: string[] = [];

    if (!word) flags.push("empty");
    if (suspiciousFormat(word)) flags.push("suspicious_format");
    if (entry.language !== language) flags.push("wrong_language");
    if (!entry.pos || entry.pos === "unknown") flags.push("unknown_pos");
    if (!entry.senses?.length) flags.push("no_sense");

    const key = word.toLocaleLowerCase();

    if (key && seen.has(key)) {
      flags.push("duplicate");
    } else if (key) {
      seen.add(key);
    }

    if (hasScriptProblem(word, language)) {
      flags.push("script_mismatch");
    }

    const tags = new Set(
      (entry.tags ?? []).map(
        tag => tag.toLocaleLowerCase()
      )
    );

    for (const tag of tags) {
      if (REJECT_TAGS.has(tag)) {
        flags.push(`reject_tag:${tag}`);
      } else if (REVIEW_TAGS.has(tag)) {
        flags.push(`review_tag:${tag}`);
      }
    }

    const hardReject =
      flags.includes("empty") ||
      flags.includes("suspicious_format") ||
      flags.includes("wrong_language") ||
      flags.includes("no_sense") ||
      flags.includes("script_mismatch") ||
      flags.some(flag => flag.startsWith("reject_tag:"));

    const needsReview =
      !hardReject &&
      (
        flags.includes("unknown_pos") ||
        flags.includes("duplicate") ||
        flags.some(flag => flag.startsWith("review_tag:"))
      );

    if (hardReject) {
      reject++;
      for (const reason of flags) {
        reasons[reason] =
          (reasons[reason] ?? 0) + 1;
      }
      if (rejectSamples.length < 200) {
        rejectSamples.push({
          word,
          reasons: flags,
        });
      }
    } else if (needsReview) {
      review++;
      for (const reason of flags) {
        reasons[reason] =
          (reasons[reason] ?? 0) + 1;
      }
      if (reviewSamples.length < 200) {
        reviewSamples.push({
          word,
          reasons: flags,
        });
      }
    } else {
      pass++;
    }
  }

  return {
    language,
    status: "OK",
    totals: {
      total,
      pass,
      review,
      reject,
    },
    percentages: {
      pass: total ? +(pass / total * 100).toFixed(2) : 0,
      review: total ? +(review / total * 100).toFixed(2) : 0,
      reject: total ? +(reject / total * 100).toFixed(2) : 0,
    },
    reasons,
    samples: {
      review: reviewSamples,
      reject: rejectSamples,
    },
    policy: {
      note:
        "PASS means source/structure validation passed; it does not prove absolute linguistic correctness.",
    },
  };
}

async function main() {
  mkdirSync(reportRoot, {
    recursive: true,
  });

  for (const language of LANGUAGES) {
    const report =
      await validateLanguage(language);

    writeFileSync(
      join(
        reportRoot,
        `${language}.json`
      ),
      JSON.stringify(
        report,
        null,
        2
      ),
      "utf8"
    );

    const totals =
      report.totals;

    console.log(
      `${language}: PASS=${totals.pass.toLocaleString()} REVIEW=${totals.review.toLocaleString()} REJECT=${totals.reject.toLocaleString()}`
    );
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
