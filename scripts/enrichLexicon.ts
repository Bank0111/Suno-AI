import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

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

type Language = (typeof LANGUAGES)[number];

const PROJECT_ROOT = resolve(process.cwd());

const LANGUAGES_DIR = resolve(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "languages"
);

const LEGACY_WORD_BANK = resolve(
  PROJECT_ROOT,
  "server",
  "lexicon",
  "data",
  "wordBank.json"
);

type VocabularyEntry = {
  word?: unknown;
  language?: unknown;
  source?: unknown;
  pos?: unknown[];
  definitions?: unknown[];
  tags?: unknown[];
  topics?: unknown[];
  categories?: unknown[];
};

type VocabularyFile = {
  language?: string;
  source?: string;
  total?: number;
  words?: VocabularyEntry[];
};

type DomainVocab = {
  domain: string;
  keywords: string[];
  objects: string[];
  actions: string[];
  emotions: string[];
  modifiers: string[];
};

type RhymeGroup = {
  key: string;
  words: string[];
};

type LegacyWordBank = {
  domains?: DomainVocab[];
  rhymes?: Record<string, string[]>;
};

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, data: unknown): void {
  writeFileSync(
    file,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

function backupFile(file: string): void {
  if (!existsSync(file)) {
    return;
  }

  const backup = `${file}.bak`;

  if (existsSync(backup)) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    renameSync(
      file,
      `${file}.${timestamp}.bak`
    );
  } else {
    renameSync(file, backup);
  }
}

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getVocabulary(
  language: Language
): string[] {
  const file = resolve(
    LANGUAGES_DIR,
    language,
    "vocabulary.json"
  );

  const data =
    readJson<VocabularyFile>(file);

  if (!Array.isArray(data.words)) {
    throw new Error(
      `[${language}] vocabulary.json ไม่มี words[]`
    );
  }

  return data.words
    .map((entry) => cleanString(entry.word))
    .filter(Boolean);
}

function getVocabularyEntries(
  language: Language
): VocabularyEntry[] {
  const file = resolve(
    LANGUAGES_DIR,
    language,
    "vocabulary.json"
  );

  const data =
    readJson<VocabularyFile>(file);

  if (!Array.isArray(data.words)) {
    throw new Error(
      `[${language}] vocabulary.json ไม่มี words[]`
    );
  }

  return data.words;
}

/*
 * ---------------------------------------------------------
 * LEGACY TH MIGRATION
 * ---------------------------------------------------------
 */

function migrateThaiLegacy(): {
  domains: DomainVocab[];
  rhymeGroups: RhymeGroup[];
} {
  if (!existsSync(LEGACY_WORD_BANK)) {
    throw new Error(
      "ไม่พบ server/lexicon/data/wordBank.json"
    );
  }

  const legacy =
    readJson<LegacyWordBank>(
      LEGACY_WORD_BANK
    );

  const domains =
    Array.isArray(legacy.domains)
      ? legacy.domains
      : [];

  const rhymeGroups =
    legacy.rhymes &&
    typeof legacy.rhymes === "object"
      ? Object.entries(legacy.rhymes).map(
          ([key, words]) => ({
            key,
            words: Array.isArray(words)
              ? words
                  .filter(
                    (word): word is string =>
                      typeof word === "string"
                  )
                  .map((word) => word.trim())
                  .filter(Boolean)
              : [],
          })
        )
      : [];

  return {
    domains,
    rhymeGroups,
  };
}

/*
 * ---------------------------------------------------------
 * DOMAIN GENERATION
 * ---------------------------------------------------------
 *
 * Uses real metadata already present inside vocabulary.json:
 * topics / categories / definitions / POS.
 *
 * This is heuristic enrichment, not expert linguistic
 * annotation.
 */

const DOMAIN_RULES: Record<
  Language,
  Array<{
    key: string;
    patterns: string[];
  }>
> = {
  th: [
    {
      key: "คน_ชีวิต_สังคม",
      patterns: [
        "คน",
        "มนุษย์",
        "ชีวิต",
        "สังคม",
        "ครอบครัว",
        "บุคคล",
      ],
    },
    {
      key: "ธรรมชาติ_สิ่งแวดล้อม",
      patterns: [
        "ธรรมชาติ",
        "สิ่งแวดล้อม",
        "พืช",
        "สัตว์",
        "น้ำ",
        "ภูเขา",
        "ทะเล",
      ],
    },
    {
      key: "งาน_ธุรกิจ_อาชีพ",
      patterns: [
        "งาน",
        "ธุรกิจ",
        "อาชีพ",
        "การเงิน",
        "บริษัท",
        "อุตสาหกรรม",
      ],
    },
    {
      key: "ความรัก_อารมณ์",
      patterns: [
        "รัก",
        "อารมณ์",
        "ความรู้สึก",
        "ความสัมพันธ์",
        "ความสุข",
      ],
    },
    {
      key: "เทคโนโลยี_วิทยาศาสตร์",
      patterns: [
        "เทคโนโลยี",
        "วิทยาศาสตร์",
        "คอมพิวเตอร์",
        "อินเทอร์เน็ต",
      ],
    },
  ],

  en: [
    {
      key: "people_life_society",
      patterns: [
        "people",
        "person",
        "human",
        "life",
        "society",
        "family",
      ],
    },
    {
      key: "nature_environment",
      patterns: [
        "nature",
        "environment",
        "animal",
        "plant",
        "water",
        "ocean",
      ],
    },
    {
      key: "work_business",
      patterns: [
        "work",
        "business",
        "occupation",
        "company",
        "industry",
        "finance",
      ],
    },
    {
      key: "love_emotion",
      patterns: [
        "love",
        "emotion",
        "feeling",
        "relationship",
        "happiness",
      ],
    },
    {
      key: "technology_science",
      patterns: [
        "technology",
        "science",
        "computer",
        "internet",
        "software",
      ],
    },
  ],

  zh: [
    {
      key: "人_生活_社会",
      patterns: ["人", "生活", "社会", "家庭"],
    },
    {
      key: "自然_环境",
      patterns: ["自然", "环境", "动物", "植物", "水", "海"],
    },
    {
      key: "工作_商业",
      patterns: ["工作", "商业", "公司", "经济"],
    },
    {
      key: "爱情_情感",
      patterns: ["爱", "爱情", "情感", "感情", "幸福"],
    },
    {
      key: "科技_科学",
      patterns: ["科技", "科学", "电脑", "互联网"],
    },
  ],

  ja: [
    {
      key: "人_生活_社会",
      patterns: ["人", "生活", "社会", "家族"],
    },
    {
      key: "自然_環境",
      patterns: ["自然", "環境", "動物", "植物", "水", "海"],
    },
    {
      key: "仕事_ビジネス",
      patterns: ["仕事", "会社", "産業", "経済"],
    },
    {
      key: "愛_感情",
      patterns: ["愛", "恋", "感情", "幸福"],
    },
    {
      key: "技術_科学",
      patterns: ["技術", "科学", "コンピューター", "インターネット"],
    },
  ],

  ko: [
    {
      key: "사람_생활_사회",
      patterns: ["사람", "생활", "사회", "가족"],
    },
    {
      key: "자연_환경",
      patterns: ["자연", "환경", "동물", "식물", "물", "바다"],
    },
    {
      key: "일_비즈니스",
      patterns: ["일", "회사", "산업", "경제"],
    },
    {
      key: "사랑_감정",
      patterns: ["사랑", "감정", "관계", "행복"],
    },
    {
      key: "기술_과학",
      patterns: ["기술", "과학", "컴퓨터", "인터넷"],
    },
  ],

  de: [
    {
      key: "menschen_leben_gesellschaft",
      patterns: ["Mensch", "Leben", "Gesellschaft", "Familie"],
    },
    {
      key: "natur_umwelt",
      patterns: ["Natur", "Umwelt", "Tier", "Pflanze", "Wasser"],
    },
    {
      key: "arbeit_wirtschaft",
      patterns: ["Arbeit", "Wirtschaft", "Firma", "Industrie"],
    },
    {
      key: "liebe_gefuehle",
      patterns: ["Liebe", "Gefühl", "Emotion", "Beziehung"],
    },
    {
      key: "technik_wissenschaft",
      patterns: ["Technik", "Wissenschaft", "Computer", "Internet"],
    },
  ],

  es: [
    {
      key: "personas_vida_sociedad",
      patterns: ["persona", "vida", "sociedad", "familia"],
    },
    {
      key: "naturaleza_medio_ambiente",
      patterns: ["naturaleza", "ambiente", "animal", "planta", "agua"],
    },
    {
      key: "trabajo_negocios",
      patterns: ["trabajo", "negocio", "empresa", "industria"],
    },
    {
      key: "amor_emocion",
      patterns: ["amor", "emoción", "sentimiento", "relación"],
    },
    {
      key: "tecnologia_ciencia",
      patterns: ["tecnología", "ciencia", "computadora", "internet"],
    },
  ],

  fr: [
    {
      key: "personnes_vie_societe",
      patterns: ["personne", "vie", "société", "famille"],
    },
    {
      key: "nature_environnement",
      patterns: ["nature", "environnement", "animal", "plante", "eau"],
    },
    {
      key: "travail_affaires",
      patterns: ["travail", "entreprise", "industrie", "économie"],
    },
    {
      key: "amour_emotion",
      patterns: ["amour", "émotion", "sentiment", "relation"],
    },
    {
      key: "technologie_science",
      patterns: ["technologie", "science", "ordinateur", "internet"],
    },
  ],

  pt: [
    {
      key: "pessoas_vida_sociedade",
      patterns: ["pessoa", "vida", "sociedade", "família"],
    },
    {
      key: "natureza_ambiente",
      patterns: ["natureza", "ambiente", "animal", "planta", "água"],
    },
    {
      key: "trabalho_negocios",
      patterns: ["trabalho", "negócio", "empresa", "indústria"],
    },
    {
      key: "amor_emocao",
      patterns: ["amor", "emoção", "sentimento", "relação"],
    },
    {
      key: "tecnologia_ciencia",
      patterns: ["tecnologia", "ciência", "computador", "internet"],
    },
  ],

  id: [
    {
      key: "orang_hidup_masyarakat",
      patterns: ["orang", "hidup", "masyarakat", "keluarga"],
    },
    {
      key: "alam_lingkungan",
      patterns: ["alam", "lingkungan", "hewan", "tumbuhan", "air"],
    },
    {
      key: "kerja_bisnis",
      patterns: ["kerja", "bisnis", "perusahaan", "industri"],
    },
    {
      key: "cinta_emosi",
      patterns: ["cinta", "emosi", "perasaan", "hubungan"],
    },
    {
      key: "teknologi_sains",
      patterns: ["teknologi", "sains", "komputer", "internet"],
    },
  ],

  vi: [
    {
      key: "con_nguoi_cuoc_song_xa_hoi",
      patterns: ["người", "cuộc sống", "xã hội", "gia đình"],
    },
    {
      key: "tu_nhien_moi_truong",
      patterns: ["tự nhiên", "môi trường", "động vật", "cây", "nước"],
    },
    {
      key: "cong_viec_kinh_doanh",
      patterns: ["công việc", "kinh doanh", "công ty", "kinh tế"],
    },
    {
      key: "tinh_yeu_cam_xuc",
      patterns: ["tình yêu", "cảm xúc", "tình cảm", "hạnh phúc"],
    },
    {
      key: "cong_nghe_khoa_hoc",
      patterns: ["công nghệ", "khoa học", "máy tính", "internet"],
    },
  ],

  hi: [
    {
      key: "लोग_जीवन_समाज",
      patterns: ["लोग", "जीवन", "समाज", "परिवार"],
    },
    {
      key: "प्रकृति_पर्यावरण",
      patterns: ["प्रकृति", "पर्यावरण", "जानवर", "पानी"],
    },
    {
      key: "काम_व्यापार",
      patterns: ["काम", "व्यापार", "कंपनी", "अर्थव्यवस्था"],
    },
    {
      key: "प्रेम_भावना",
      patterns: ["प्रेम", "प्यार", "भावना", "खुशी"],
    },
    {
      key: "तकनीक_विज्ञान",
      patterns: ["तकनीक", "विज्ञान", "कंप्यूटर", "इंटरनेट"],
    },
  ],

  ar: [
    {
      key: "الناس_الحياة_المجتمع",
      patterns: ["الناس", "الحياة", "المجتمع", "الأسرة"],
    },
    {
      key: "الطبيعة_البيئة",
      patterns: ["الطبيعة", "البيئة", "الحيوان", "النبات", "الماء"],
    },
    {
      key: "العمل_الأعمال",
      patterns: ["العمل", "الأعمال", "الشركة", "الاقتصاد"],
    },
    {
      key: "الحب_المشاعر",
      patterns: ["الحب", "المشاعر", "العاطفة", "السعادة"],
    },
    {
      key: "التكنولوجيا_العلوم",
      patterns: ["التكنولوجيا", "العلوم", "الحاسوب", "الإنترنت"],
    },
  ],

  lo: [
    {
      key: "ຄົນ_ຊີວິດ_ສັງຄົມ",
      patterns: ["ຄົນ", "ຊີວິດ", "ສັງຄົມ", "ຄອບຄົວ"],
    },
    {
      key: "ທຳມະຊາດ_ສິ່ງແວດລ້ອມ",
      patterns: ["ທຳມະຊາດ", "ສັດ", "ພືດ", "ນ້ຳ"],
    },
    {
      key: "ວຽກ_ທຸລະກິດ",
      patterns: ["ວຽກ", "ທຸລະກິດ", "ບໍລິສັດ", "ເສດຖະກິດ"],
    },
    {
      key: "ຄວາມຮັກ_ອາລົມ",
      patterns: ["ຮັກ", "ອາລົມ", "ຄວາມຮູ້ສຶກ"],
    },
    {
      key: "ເຕັກໂນໂລຊີ_ວິທະຍາສາດ",
      patterns: ["ເຕັກໂນໂລຊີ", "ວິທະຍາສາດ", "ຄອມພິວເຕີ"],
    },
  ],
};

function normalizeForSearch(
  value: string
): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase();
}

function collectMetadata(
  entry: VocabularyEntry
): string[] {
  const result: string[] = [];

  const add = (value: unknown) => {
    if (typeof value === "string") {
      const cleaned = value.trim();

      if (cleaned) {
        result.push(cleaned);
      }
    }
  };

  const addArray = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const item of value) {
        add(item);
      }
    }
  };

  addArray(entry.topics);
  addArray(entry.categories);
  addArray(entry.tags);
  addArray(entry.definitions);

  return result;
}

function createDomains(
  language: Language,
  entries: VocabularyEntry[]
): DomainVocab[] {
  const rules = DOMAIN_RULES[language];

  const buckets = new Map<
    string,
    {
      keywords: Set<string>;
      objects: Set<string>;
      actions: Set<string>;
      emotions: Set<string>;
      modifiers: Set<string>;
    }
  >();

  for (const rule of rules) {
    buckets.set(rule.key, {
      keywords: new Set(),
      objects: new Set(),
      actions: new Set(),
      emotions: new Set(),
      modifiers: new Set(),
    });
  }

  for (const entry of entries) {
    const word = cleanString(entry.word);

    if (!word) {
      continue;
    }

    const metadata = [
      word,
      ...collectMetadata(entry),
    ]
      .map(normalizeForSearch)
      .join(" ");

    for (const rule of rules) {
      const matched = rule.patterns.some(
        (pattern) =>
          metadata.includes(
            normalizeForSearch(pattern)
          )
      );

      if (!matched) {
        continue;
      }

      const bucket = buckets.get(rule.key);

      if (!bucket) {
        continue;
      }

      bucket.keywords.add(word);

      if (
        Array.isArray(entry.pos) &&
        entry.pos.length > 0
      ) {
        const posText = entry.pos
          .filter(
            (item): item is string =>
              typeof item === "string"
          )
          .join(" ")
          .toLowerCase();

        if (
          posText.includes("verb") ||
          posText.includes("action")
        ) {
          bucket.actions.add(word);
        } else if (
          posText.includes("adj") ||
          posText.includes("modifier")
        ) {
          bucket.modifiers.add(word);
        } else {
          bucket.objects.add(word);
        }
      } else {
        bucket.objects.add(word);
      }

      if (
        rule.key.includes("love") ||
        rule.key.includes("emotion") ||
        rule.key.includes("amour") ||
        rule.key.includes("amor") ||
        rule.key.includes("cinta") ||
        rule.key.includes("情") ||
        rule.key.includes("愛") ||
        rule.key.includes("감정") ||
        rule.key.includes("भावना") ||
        rule.key.includes("المشاعر") ||
        rule.key.includes("ອາລົມ") ||
        rule.key.includes("ความรัก")
      ) {
        bucket.emotions.add(word);
      }
    }
  }

  return rules.map((rule) => {
    const bucket = buckets.get(rule.key)!;

    return {
      domain: rule.key,

      keywords: Array.from(
        bucket.keywords
      ).slice(0, 500),

      objects: Array.from(
        bucket.objects
      ).slice(0, 500),

      actions: Array.from(
        bucket.actions
      ).slice(0, 500),

      emotions: Array.from(
        bucket.emotions
      ).slice(0, 500),

      modifiers: Array.from(
        bucket.modifiers
      ).slice(0, 500),
    };
  });
}

/*
 * ---------------------------------------------------------
 * RHYME GENERATION
 * ---------------------------------------------------------
 *
 * This is a deterministic orthographic heuristic.
 * It is NOT a phonological model.
 *
 * It is used to create usable rhyme buckets without
 * pretending that spelling endings equal pronunciation
 * for every language.
 */

function getRhymeSignature(
  language: Language,
  word: string
): string {
  const normalized =
    word.normalize("NFKC").trim();

  if (!normalized) {
    return "";
  }

  const chars = Array.from(normalized);

  if (language === "zh") {
    return chars.slice(-1).join("");
  }

  if (language === "ja") {
    return chars.slice(-2).join("");
  }

  if (language === "ko") {
    return chars.slice(-1).join("");
  }

  if (language === "th") {
    return chars.slice(-2).join("");
  }

  if (language === "lo") {
    return chars.slice(-2).join("");
  }

  if (language === "ar") {
    return chars.slice(-2).join("");
  }

  if (language === "hi") {
    return chars.slice(-2).join("");
  }

  return normalized
    .toLocaleLowerCase()
    .replace(
      /[^a-z0-9\u00c0-\u024f\u1e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0900-\u097f\u0600-\u06ff\u0e00-\u0e7f\u0e80-\u0eff]/gi,
      ""
    )
    .slice(-2);
}

function createRhymes(
  language: Language,
  vocabulary: string[]
): RhymeGroup[] {
  const groups = new Map<
    string,
    Set<string>
  >();

  for (const word of vocabulary) {
    const key =
      getRhymeSignature(language, word);

    if (!key) {
      continue;
    }

    if (!groups.has(key)) {
      groups.set(key, new Set());
    }

    groups.get(key)!.add(word);
  }

  return Array.from(groups.entries())
    .filter(
      ([, words]) =>
        words.size >= 2
    )
    .sort(
      (a, b) =>
        b[1].size - a[1].size
    )
    .slice(0, 500)
    .map(([key, words]) => ({
      key,
      words: Array.from(words).slice(0, 500),
    }));
}

/*
 * ---------------------------------------------------------
 * WRITE
 * ---------------------------------------------------------
 */

function migrateLanguage(
  language: Language
): {
  vocabulary: number;
  domains: number;
  rhymes: number;
  mode: "legacy-th" | "generated";
} {
  const languageDir = resolve(
    LANGUAGES_DIR,
    language
  );

  mkdirSync(languageDir, {
    recursive: true,
  });

  const entries =
    getVocabularyEntries(language);

  const vocabulary = entries
    .map((entry) => cleanString(entry.word))
    .filter(Boolean);

  const domainsPath = resolve(
    languageDir,
    "domains.json"
  );

  const rhymesPath = resolve(
    languageDir,
    "rhymes.json"
  );

  /*
   * TH:
   * Preserve real Legacy domain/rhyme data.
   */
  if (language === "th") {
    const legacy =
      migrateThaiLegacy();

    backupFile(domainsPath);
    backupFile(rhymesPath);

    writeJson(domainsPath, {
      language,
      domains: legacy.domains,
    });

    writeJson(rhymesPath, {
      language,
      rhymeGroups:
        legacy.rhymeGroups,
    });

    return {
      vocabulary: vocabulary.length,
      domains: legacy.domains.length,
      rhymes:
        legacy.rhymeGroups.length,
      mode: "legacy-th",
    };
  }

  /*
   * Other languages:
   * Generate from their own vocabulary entries.
   */
  const domains =
    createDomains(
      language,
      entries
    );

  const rhymes =
    createRhymes(
      language,
      vocabulary
    );

  backupFile(domainsPath);
  backupFile(rhymesPath);

  writeJson(domainsPath, {
    language,
    domains,
  });

  writeJson(rhymesPath, {
    language,
    rhymeGroups: rhymes,
  });

  return {
    vocabulary: vocabulary.length,
    domains: domains.length,
    rhymes: rhymes.length,
    mode: "generated",
  };
}

/*
 * ---------------------------------------------------------
 * MAIN
 * ---------------------------------------------------------
 */

console.log("");
console.log(
  "============================================================"
);
console.log(
  "       14-LANGUAGE LEXICON FULL MIGRATION"
);
console.log(
  "============================================================"
);
console.log("");

let success = 0;
let failed = 0;

const results: Array<{
  language: Language;
  vocabulary: number;
  domains: number;
  rhymes: number;
  mode: string;
}> = [];

for (const language of LANGUAGES) {
  try {
    const result =
      migrateLanguage(language);

    results.push({
      language,
      ...result,
      mode: result.mode,
    });

    console.log(
      `--- ${language.toUpperCase()} ---`
    );

    console.log(
      `Vocabulary : ${result.vocabulary.toLocaleString()}`
    );

    console.log(
      `Domains    : ${result.domains.toLocaleString()}`
    );

    console.log(
      `Rhymes     : ${result.rhymes.toLocaleString()}`
    );

    console.log(
      `Mode       : ${result.mode}`
    );

    console.log(
      "✓ MIGRATION OK"
    );

    console.log("");

    success++;
  } catch (error) {
    console.log(
      `--- ${language.toUpperCase()} ---`
    );

    console.log(
      "❌ MIGRATION FAILED"
    );

    console.log(
      error instanceof Error
        ? error.message
        : String(error)
    );

    console.log("");

    failed++;
  }
}

const reportPath = resolve(
  PROJECT_ROOT,
  "scripts",
  "lexicon-migration-report.json"
);

writeJson(reportPath, {
  generatedAt:
    new Date().toISOString(),
  languages: results,
  summary: {
    total: LANGUAGES.length,
    success,
    failed,
  },
});

console.log(
  "============================================================"
);
console.log("RESULT");
console.log(
  "============================================================"
);

console.log(
  `Languages OK : ${success}/${LANGUAGES.length}`
);

console.log(
  `Failed       : ${failed}`
);

console.log("");

if (failed === 0) {
  console.log(
    "✓ ALL 14 LANGUAGES MIGRATED"
  );

  console.log("");
  console.log(
    `Report: ${reportPath}`
  );
} else {
  console.log(
    "❌ MIGRATION INCOMPLETE"
  );
}

console.log("");