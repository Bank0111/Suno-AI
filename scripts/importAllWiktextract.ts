import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { createInterface } from "node:readline";
import { resolve, join } from "node:path";

type LanguageCode =
  | "th" | "en" | "zh" | "ja" | "ko"
  | "de" | "es" | "fr" | "pt" | "id"
  | "vi" | "hi" | "ar" | "lo";

type WiktextractRecord = {
  word?: unknown;
  lang_code?: unknown;
  pos?: unknown;
  senses?: unknown;
  tags?: unknown;
  topics?: unknown;
  categories?: unknown;
};

type OutputRecord = {
  word: string;
  language: LanguageCode;
  source: "Wiktextract";
  pos: string[];
  definitions: string[];
  tags: string[];
  topics: string[];
  categories: string[];
};

const ROOT = resolve(process.cwd());

const INPUT = resolve(
  ROOT,
  "server",
  "lexicon",
  "raw",
  "th",
  "raw-wiktextract-data.jsonl"
);

const OUTPUT_ROOT = resolve(
  ROOT,
  "server",
  "lexicon",
  "data",
  "languages"
);

const LANGUAGES: LanguageCode[] = [
  "th", "en", "zh", "ja", "ko",
  "de", "es", "fr", "pt", "id",
  "vi", "hi", "ar", "lo",
];

function text(value: unknown): string {
  return typeof value === "string"
    ? value.normalize("NFC").trim()
    : "";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map(v => v.normalize("NFC").trim())
      .filter(Boolean)
  )];
}

function extractDefinitions(senses: unknown): string[] {
  if (!Array.isArray(senses)) return [];

  const result: string[] = [];

  for (const sense of senses) {
    if (!sense || typeof sense !== "object") continue;

    const obj = sense as Record<string, unknown>;

    result.push(
      ...stringArray(obj.glosses),
      ...stringArray(obj.raw_glosses),
    );
  }

  return [...new Set(result)];
}

function extractSenseTags(senses: unknown): string[] {
  if (!Array.isArray(senses)) return [];

  const result: string[] = [];

  for (const sense of senses) {
    if (!sense || typeof sense !== "object") continue;

    const obj = sense as Record<string, unknown>;

    result.push(
      ...stringArray(obj.tags),
      ...stringArray(obj.topics),
    );
  }

  return [...new Set(result)];
}

function extractTopics(record: WiktextractRecord): string[] {
  const result = [...stringArray(record.topics)];

  if (Array.isArray(record.senses)) {
    for (const sense of record.senses) {
      if (!sense || typeof sense !== "object") continue;

      result.push(
        ...stringArray(
          (sense as Record<string, unknown>).topics
        )
      );
    }
  }

  return [...new Set(result)];
}

function makeRecord(
  raw: WiktextractRecord,
  language: LanguageCode
): OutputRecord | null {
  const word = text(raw.word);
  if (!word) return null;

  return {
    word,
    language,
    source: "Wiktextract",
    pos: stringArray(raw.pos),
    definitions: extractDefinitions(raw.senses),
    tags: [
      ...new Set([
        ...stringArray(raw.tags),
        ...extractSenseTags(raw.senses),
      ]),
    ],
    topics: extractTopics(raw),
    categories: stringArray(raw.categories),
  };
}

type WriterState = {
  language: LanguageCode;
  filePath: string;
  stream: ReturnType<typeof createWriteStream>;
  seen: Set<string>;
  count: number;
  duplicates: number;
};

function createState(language: LanguageCode): WriterState {
  const dir = join(OUTPUT_ROOT, language);
  mkdirSync(dir, { recursive: true });

  const filePath = join(dir, "vocabulary.json");
  const stream = createWriteStream(filePath, { encoding: "utf8" });

  stream.write(
    `{\n` +
    `  "language": ${JSON.stringify(language)},\n` +
    `  "source": "Wiktextract",\n` +
    `  "total": 0,\n` +
    `  "words": [\n`
  );

  return {
    language,
    filePath,
    stream,
    seen: new Set<string>(),
    count: 0,
    duplicates: 0,
  };
}

function waitDrain(
  stream: ReturnType<typeof createWriteStream>
): Promise<void> {
  return new Promise(resolvePromise => {
    stream.once("drain", resolvePromise);
  });
}

async function writeRecord(
  state: WriterState,
  record: OutputRecord
): Promise<void> {
  const key = record.word.normalize("NFC").toLocaleLowerCase();

  if (state.seen.has(key)) {
    state.duplicates++;
    return;
  }

  state.seen.add(key);

  const prefix = state.count === 0 ? "    " : "    ,";
  const ok = state.stream.write(
    `${prefix}${JSON.stringify(record)}\n`
  );

  state.count++;

  if (!ok) {
    await waitDrain(state.stream);
  }
}

async function closeState(state: WriterState): Promise<void> {
  state.stream.write("  ]\n}\n");

  await new Promise<void>((resolvePromise, reject) => {
    state.stream.once("finish", resolvePromise);
    state.stream.once("error", reject);
    state.stream.end();
  });
}

async function main(): Promise<void> {
  if (!existsSync(INPUT)) {
    throw new Error(`ไม่พบไฟล์ต้นทาง:\n${INPUT}`);
  }

  mkdirSync(OUTPUT_ROOT, { recursive: true });

  const states = new Map<LanguageCode, WriterState>();

  for (const language of LANGUAGES) {
    states.set(language, createState(language));
  }

  const counters = {
    lines: 0,
    invalidJson: 0,
    matched: 0,
    ignored: 0,
  };

  console.log("=== WIKTEXTRACT 14-LANGUAGE IMPORT ===");
  console.log(`Input: ${INPUT}`);
  console.log(`Languages: ${LANGUAGES.join(", ")}`);
  console.log("Streaming import started...");

  const input = createReadStream(INPUT, { encoding: "utf8" });

  const rl = createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    counters.lines++;

    const trimmed = line.trim();
    if (!trimmed) continue;

    let raw: WiktextractRecord;

    try {
      raw = JSON.parse(trimmed) as WiktextractRecord;
    } catch {
      counters.invalidJson++;
      continue;
    }

    const lang = text(raw.lang_code);

    if (!LANGUAGES.includes(lang as LanguageCode)) {
      counters.ignored++;
      continue;
    }

    const language = lang as LanguageCode;
    const record = makeRecord(raw, language);
    if (!record) continue;

    const state = states.get(language);
    if (!state) continue;

    await writeRecord(state, record);
    counters.matched++;

    if (counters.lines % 100000 === 0) {
      console.log(
        `Lines: ${counters.lines.toLocaleString()} | ` +
        `Matched: ${counters.matched.toLocaleString()}`
      );
    }
  }

  for (const state of states.values()) {
    await closeState(state);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    input: INPUT,
    languageCount: LANGUAGES.length,
    languages: Object.fromEntries(
      [...states.entries()].map(([language, state]) => [
        language,
        {
          words: state.count,
          duplicates: state.duplicates,
          output: state.filePath,
        },
      ])
    ),
    totals: counters,
    note:
      "Import only. No linguistic quality validation, domain classification, or rhyme analysis was applied.",
  };

  const reportPath = join(
    OUTPUT_ROOT,
    "multi-language-import-report.json"
  );

  writeFileSync(
    reportPath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("\n=== IMPORT COMPLETE ===");
  console.log(`Lines read: ${counters.lines.toLocaleString()}`);
  console.log(`Invalid JSON: ${counters.invalidJson.toLocaleString()}`);
  console.log(
    `Matched target languages: ${counters.matched.toLocaleString()}`
  );

  for (const state of states.values()) {
    console.log(
      `${state.language}: ${state.count.toLocaleString()} words`
    );
  }

  console.log(`Report: ${reportPath}`);
}

main().catch(error => {
  console.error("\nIMPORT FAILED\n", error);
  process.exit(1);
});
