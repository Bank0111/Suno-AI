import { PhrasingValidationReport, PhrasingValidationIssue } from './types';

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
