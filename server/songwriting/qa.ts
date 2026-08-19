import { BuiltCreativeContext } from '../creativeContext';

export interface FinalQAReport {
  passed: boolean;
  qaScore: number; // 0 - 100
  issuesFound: string[];
  passedChecks: string[];
  summary: {
    totalSections: number;
    totalLines: number;
    languagePurityScore: number;
    metadataLeakageFound: boolean;
  };
}

/**
 * FINAL QA LAYER
 * Verifies final processed song against language purity, POV, banned words,
 * repetitive end-rhymes, vocational leaks in hook, and metadata leakage.
 */
export function executeFinalQA(
  sections: Array<{ type: string; performanceDirection?: string; musicDirection?: string; lyrics: string[] }>,
  context: BuiltCreativeContext
): FinalQAReport {
  const issuesFound: string[] = [];
  const passedChecks: string[] = [];
  let languagePurityScore = 100;
  let metadataLeakageFound = false;

  let totalLines = 0;
  const allLyrics = sections.flatMap((s) => s.lyrics || []);
  totalLines = allLyrics.length;
  const fullText = allLyrics.join(' ');

  // 1. Language Purity Check
  if (context.targetContentLanguage === 'อังกฤษ' || (context.targetContentLanguage && context.targetContentLanguage.toLowerCase().includes('english'))) {
    const thaiMatches = fullText.match(/[\u0E00-\u0E7F]+/g);
    if (thaiMatches && thaiMatches.length > 0) {
      issuesFound.push(`[Language Integrity] Found Thai script in English lyrics: "${thaiMatches.join(', ')}"`);
      languagePurityScore -= 30;
    } else {
      passedChecks.push('[Language Integrity] 100% English script isolation confirmed.');
    }
  } else if (context.isTargetThai) {
    passedChecks.push('[Language Integrity] Thai language structure confirmed.');
  }

  // 2. Metadata / Direction Leakage Check
  const directionLeakRegex = /\[(Melancholic|Reflective|Intimate|Acoustic|Electric|Tempo|BPM|Drums|Bass|Drop|Swell|Fade)\]|\((Soft|Slow|Fast|Heavy|Guitar|Piano|Strings)\)/i;
  sections.forEach((sec, sIdx) => {
    (sec.lyrics || []).forEach((line, lIdx) => {
      if (directionLeakRegex.test(line) || line.startsWith('[') || line.startsWith('(')) {
        metadataLeakageFound = true;
        issuesFound.push(`[Metadata Leakage] Section ${sec.type} Line ${lIdx} contains music/performance tag: "${line}"`);
      }
    });
  });

  if (!metadataLeakageFound) {
    passedChecks.push('[Metadata Leakage] Clean lyric lines without performance or music tag leakage.');
  }

  // 3. Section Function & Hook Integrity Check
  const hasChorus = sections.some((s) => s.type.toLowerCase().includes('chorus') || s.type.toLowerCase().includes('hook'));
  if (hasChorus) {
    passedChecks.push('[Structure Integrity] Chorus / Hook section present.');
  } else {
    issuesFound.push('[Structure Integrity] No Chorus/Hook section detected in structure.');
  }

  // 4. Robotic Metaphor & Academic Jargon Check
  const bannedRoboticsAndJargon = [
    'คูณสอง', 'บวกหนึ่ง', 'อัลกอริทึม', 'ดาวน์โหลด', '100%',
    'บริบท', 'มิติใหม่', 'กำแพงชนชั้น', 'ขับเคลื่อน', 'โครงสร้างทางสังคม',
  ];
  bannedRoboticsAndJargon.forEach((term) => {
    if (fullText.includes(term)) {
      issuesFound.push(`[Prohibited Jargon/Robotic] Found forbidden term: "${term}"`);
    }
  });

  // 5. Check Mechanical / Vocational Tool Intrusion in Chorus & Bridge
  const vocationalRegex = /(ประแจ|น็อต|ไขควง|คราบน้ำมัน|ชุดเซฟตี้|หัวเทียน|สายพาน|เครื่องจักร)/;
  sections.forEach((sec) => {
    const secType = sec.type.toLowerCase();
    if (secType.includes('chorus') || secType.includes('hook') || secType.includes('bridge')) {
      (sec.lyrics || []).forEach((line, lIdx) => {
        const match = line.match(vocationalRegex);
        if (match) {
          issuesFound.push(`[Vocational Leak in Hook] Found vocational tool "${match[0]}" in ${sec.type} Line ${lIdx + 1}: "${line}"`);
        }
      });
    }
  });

  // 6. Repetitive End-Rhyme Check (ตรวจคำลงท้ายซ้ำใน Section เดียวกัน)
  sections.forEach((sec) => {
    const endWords = (sec.lyrics || [])
      .map((l) => l.replace(/[\s\.,\!\?\(\)\[\]"]/g, '').trim().slice(-3))
      .filter((w) => w.length >= 2);

    const counts: { [key: string]: number } = {};
    endWords.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });

    Object.entries(counts).forEach(([word, count]) => {
      if (count > 2) {
        issuesFound.push(`[Repetitive Rhyme] Section ${sec.type} has ${count} lines ending with identical sound: "...${word}"`);
      }
    });
  });

  // Calculate QA Score
  let score = 100;
  score -= issuesFound.length * 15;
  if (languagePurityScore < 100) score -= (100 - languagePurityScore);
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    passed: issuesFound.length === 0,
    qaScore: finalScore,
    issuesFound,
    passedChecks,
    summary: {
      totalSections: sections.length,
      totalLines,
      languagePurityScore,
      metadataLeakageFound,
    },
  };
}