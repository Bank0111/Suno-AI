import { PhrasingValidationReport, PhrasingValidationIssue } from './types';

// =============================================================================
// THAI RHYME (สัมผัสสระ) DETECTION
// -----------------------------------------------------------------------------
// This is a HEURISTIC classifier, not a full Thai phonology engine. It maps the
// end of a syllable to a "vowel group" (คล้ายกลุ่มสัมผัสที่ใช้ในพจนานุกรมคำคล้องจอง)
// plus a "matra class" (มาตราตัวสะกด) for the final consonant, if any. Two
// syllables are considered to rhyme if both the vowel group AND the matra class
// match. This mirrors the rule already written in directive.ts:
//   "คำสุดท้ายของวรรคก่อนหน้า ควรส่งสัมผัสสระไปยังคำที่ 1-3 ของวรรคถัดไปเสมอ"
// =============================================================================

const THAI_TONE_MARKS = /[่้๊๋]/g;

function stripTone(s: string): string {
  return s.replace(THAI_TONE_MARKS, '');
}

function isThaiConsonant(ch: string): boolean {
  return /[ก-ฮ]/.test(ch);
}

// มาตราตัวสะกด (final-consonant class) — syllables only truly rhyme if the coda
// belongs to the same class, not just visually the same letter.
const MATRA_CLASSES: Record<string, string> = {
  ก: 'กก', ข: 'กก', ค: 'กก', ฆ: 'กก',
  จ: 'กด', ฉ: 'กด', ช: 'กด', ซ: 'กด', ฌ: 'กด', ฎ: 'กด', ฏ: 'กด', ฐ: 'กด',
  ฑ: 'กด', ฒ: 'กด', ด: 'กด', ต: 'กด', ถ: 'กด', ท: 'กด', ธ: 'กด', ศ: 'กด', ษ: 'กด', ส: 'กด',
  บ: 'กบ', ป: 'กบ', พ: 'กบ', ฟ: 'กบ', ภ: 'กบ',
  ง: 'กง',
  ญ: 'กน', ณ: 'กน', น: 'กน', ร: 'กน', ล: 'กน', ฬ: 'กน',
  ม: 'กม',
  ย: 'เกย',
  ว: 'เกอว',
};

interface RhymeSignature {
  group: string;
  matra: string; // มาตราตัวสะกด class, or 'open' for a live/open syllable (แม่ ก กา)
}

// Combined vowel+final patterns that must be checked BEFORE generic single-mark
// patterns, since the trailing ย/ว/า here are part of the vowel sound itself,
// not a separate coda consonant (e.g. "อาย", "อาว", "เอา" are single vowel units).
const DIPHTHONG_PATTERNS: Array<{ regex: RegExp; group: string }> = [
  { regex: /วย$/, group: 'อวย' },     // ด้วย, ช่วย
  { regex: /อย$/, group: 'ออย' },     // คอย, ลอย, รอย
  { regex: /าย$/, group: 'อาย' },     // ตาย, สาย, หาย
  { regex: /าว$/, group: 'อาว' },     // ยาว, หนาว, ราว
  { regex: /ีย$/, group: 'เอีย' },     // เสีย, เพลีย
  { regex: /ัว$/, group: 'อัว' },     // ตัว, กลัว
  { regex: /เ[ก-ฮ]า$/, group: 'เอา' }, // เขา, เรา, เช่า (already tone-stripped)
];

function classifyRhyme(rawText: string): RhymeSignature | null {
  const s = stripTone(rawText);
  if (!s) return null;

  for (const { regex, group } of DIPHTHONG_PATTERNS) {
    if (regex.test(s)) return { group, matra: 'open' };
  }

  let core = s;
  let coda = '';
  const last = s[s.length - 1];

  if (isThaiConsonant(last) && last !== 'อ') {
    coda = last;
    core = s.slice(0, -1);
  }

  let group: string | null = null;
  if (/ือ$/.test(core) || /ื$/.test(core)) group = 'อือ';
  else if (/ั$/.test(core)) group = 'อะ';
  else if (/ี$/.test(core)) group = 'อี';
  else if (/ึ$/.test(core)) group = 'อึ';
  else if (/ุ$/.test(core)) group = 'อุ';
  else if (/ู$/.test(core)) group = 'อู';
  else if (/ิ$/.test(core)) group = 'อิ';
  else if (/ำ$/.test(core)) group = 'อำ';
  else if (/า$/.test(core)) group = 'อา';
  else if (/อ$/.test(core)) group = 'ออ';
  else if (/^เ.*ะ$/.test(core)) group = 'เอะ';
  else if (/^เ/.test(core)) group = 'เอ';
  else if (/^แ/.test(core)) group = 'แอ';
  else if (/^โ/.test(core)) group = 'โอ';
  else if (/^ไ/.test(core) || /^ใ/.test(core)) group = 'ไอ';
  else if (coda) group = 'อะ'; // implicit short vowel before a coda (e.g. "คน", "ทน")

  if (!group) return null; // ambiguous / not confident enough — skip rather than guess

  const matra = coda ? MATRA_CLASSES[coda] || 'อื่นๆ' : 'open';
  return { group, matra };
}

/**
 * Returns the rhyme signature of the LAST syllable of a line (used for the
 * end of the previous line).
 */
function getEndRhymeSignature(line: string): RhymeSignature | null {
  const clean = line.replace(/[\s.,!?()[\]"]/g, '');
  if (clean.length < 2) return null;
  // Look at the trailing ~4 characters — enough context for coda + vowel + one
  // extra leading character, without pulling in unrelated earlier syllables.
  const tail = clean.slice(-4);
  return classifyRhyme(tail);
}

/**
 * Scans the first ~N characters of the NEXT line, checking every prefix
 * ending position, to see if any syllable boundary there matches the target
 * rhyme signature (group + matra class). This approximates "does word 1-3 of
 * the next line carry the same rhyme sound" without needing full Thai
 * syllable segmentation.
 */
function nextLineCarriesRhyme(nextLine: string, target: RhymeSignature, maxChars = 18): boolean {
  const clean = nextLine.replace(/[\s.,!?()[\]"]/g, '');
  const limit = Math.min(clean.length, maxChars);

  for (let end = 2; end <= limit; end++) {
    const window = clean.slice(0, end);
    const sig = classifyRhyme(window);
    if (sig && sig.group === target.group && sig.matra === target.matra) {
      return true;
    }
  }
  return false;
}

// =============================================================================

export function validateLyricPhrasing(sections: any[], context?: any): PhrasingValidationReport {
  const issues: PhrasingValidationIssue[] = [];
  let totalLines = 0;
  let totalWords = 0;
  let maxWordsInLine = 0;

  if (!sections || !Array.isArray(sections)) {
    return {
      isValid: false,
      score: 0,
      issues: [{
        sectionIndex: -1,
        sectionType: 'Unknown',
        lineIndex: -1,
        lineText: '',
        type: 'broken_phrase',
        message: 'No sections provided in lyrics',
        severity: 'warning',
      }],
      summary: { totalLines: 0, avgWordsPerLine: 0, maxWordsInLine: 0, sectionCount: 0 },
    };
  }

  // Dangling Thai/English conjunctions that should not be isolated awkwardly at the end of a line
  const danglingEndings = ['เพราะ', 'และ', 'หรือ', 'แต่', 'ที่', 'กับ', 'โดย', 'เพื่อ', 'ว่า', 'and', 'but', 'or', 'because', 'that', 'with'];

  sections.forEach((sec, secIdx) => {
    const secType = sec.type || `Section ${secIdx + 1}`;
    const lyrics = sec.lyrics || [];

    lyrics.forEach((line: string, lineIdx: number) => {
      totalLines++;
      const trimmed = line.trim();
      if (!trimmed) return;

      // Approximate word count (spaces + Thai syllable clusters approx)
      const spaceWords = trimmed.split(/\s+/).filter(Boolean);
      // Rough Thai word count estimation: character length / 4 or space words
      const estimatedWords = Math.max(spaceWords.length, Math.ceil(trimmed.length / 7));
      totalWords += estimatedWords;
      if (estimatedWords > maxWordsInLine) {
        maxWordsInLine = estimatedWords;
      }

      // Check 1: Line length outlier (Excessively long single line that ruins breathing/singing)
      if (trimmed.length > 95 || estimatedWords > 22) {
        issues.push({
          sectionIndex: secIdx,
          sectionType: secType,
          lineIndex: lineIdx,
          lineText: trimmed,
          type: 'line_length_outlier',
          message: `บรรทัดยาวเกินไป (${trimmed.length} ตัวอักษร) อาจทำให้นักร้องหายใจไม่ทัน ควรแบ่งเป็น 2 วรรค`,
          severity: 'warning',
        });
      }

      // Check 2: Unnatural line break / Dangling ending
      const lastWord = spaceWords[spaceWords.length - 1]?.toLowerCase() || '';
      if (danglingEndings.includes(lastWord) && trimmed.length < 15) {
        issues.push({
          sectionIndex: secIdx,
          sectionType: secType,
          lineIndex: lineIdx,
          lineText: trimmed,
          type: 'unnatural_break',
          message: `การตัดวรรคลงท้ายด้วยคำเชื่อม "${lastWord}" อาจทำให้ความหมายขาดวิ่น`,
          severity: 'info',
        });
      }

      // Check 3: Broken phrase / single isolated particle or letter
      if (trimmed.length <= 2 && !['ฮู้', 'โอ้', 'เฮ', 'ลา', 'ah', 'oh', 'yeah'].includes(trimmed.toLowerCase())) {
        issues.push({
          sectionIndex: secIdx,
          sectionType: secType,
          lineIndex: lineIdx,
          lineText: trimmed,
          type: 'broken_phrase',
          message: `วรรคสั้นผิดปกติ ("${trimmed}") อาจเป็นคำที่ถูกตัดแยกมาผิดตำแหน่ง`,
          severity: 'info',
        });
      }

      // Check 4: Metadata or syllable annotations accidentally leaked into lyrics line
      if (/^\[.*\]$|^\(.*(?:bpm|tempo|sec|key).*\)$/i.test(trimmed) || /\b\d+\s*syllables?\b/i.test(trimmed)) {
        issues.push({
          sectionIndex: secIdx,
          sectionType: secType,
          lineIndex: lineIdx,
          lineText: trimmed,
          type: 'broken_phrase',
          message: `พบคราบ metadata ในบรรทัดเนื้อเพลง ("${trimmed}")`,
          severity: 'warning',
        });
      }
    });

    // Check 5: Chorus hook fragmentation check
    const isChorus = secType.toLowerCase().includes('chorus') || secType.toLowerCase().includes('ฮุก');
    if (isChorus && lyrics.length === 1 && lyrics[0].length < 10) {
      issues.push({
        sectionIndex: secIdx,
        sectionType: secType,
        lineIndex: 0,
        lineText: lyrics[0] || '',
        type: 'hook_fragmentation',
        message: `ท่อน Chorus สั้นเกินไป ขาดความสมบูรณ์ของท่อน Hook`,
        severity: 'warning',
      });
    }

    // Check 6: Line-to-line rhyme connection (สัมผัสสระท้ายวรรคส่งขึ้นวรรคถัดไป)
    // Heuristic-based, per directive.ts's rule. Reported at 'info' severity since
    // this classifier is approximate and not every consecutive line pair is
    // necessarily intended to rhyme (some schemes rhyme every-other-line) — this
    // is a craft nudge for the Pass 2 rewrite, not a hard failure.
    for (let i = 0; i < lyrics.length - 1; i++) {
      const currentLine = (lyrics[i] || '').trim();
      const nextLine = (lyrics[i + 1] || '').trim();
      if (!currentLine || !nextLine) continue;
      if (currentLine.length < 3 || nextLine.length < 3) continue;

      const targetRhyme = getEndRhymeSignature(currentLine);
      if (!targetRhyme) continue; // not confident enough to judge — skip

      if (!nextLineCarriesRhyme(nextLine, targetRhyme)) {
        issues.push({
          sectionIndex: secIdx,
          sectionType: secType,
          lineIndex: i + 1,
          lineText: nextLine,
          type: 'missing_line_rhyme_connection',
          message: `คำท้ายวรรค "${currentLine.slice(-4)}" (กลุ่มสัมผัส "${targetRhyme.group}") ไม่พบคำรับสัมผัสในช่วงต้นของวรรคถัดไป ("${nextLine.slice(0, 12)}...") อาจทำให้จังหวะการร้องสะดุด`,
          severity: 'info',
        });
      }
    }
  });

  const avgWordsPerLine = totalLines > 0 ? Math.round((totalWords / totalLines) * 10) / 10 : 0;

  // Calculate score
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'warning') score -= 8;
    if (issue.severity === 'info') score -= 3;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: score >= 60,
    score,
    issues,
    summary: {
      totalLines,
      avgWordsPerLine,
      maxWordsInLine,
      sectionCount: sections.length,
    },
  };
}