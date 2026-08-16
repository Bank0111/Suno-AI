import { RawSongSectionOutput } from '../types/songwriting';

function formatSrtTimestamp(seconds: number): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  const padMs = (num: number) => String(num).padStart(3, '0');

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${padMs(ms)}`;
}

// Estimate syllable or word weight for Thai/English text
function estimateSyllableCount(text: string): number {
  const clean = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();
  if (!clean) return 0;

  const englishWords = clean.match(/[a-zA-Z]+/g);
  let engSyllables = 0;
  if (englishWords) {
    engSyllables = englishWords.reduce((acc, w) => acc + Math.max(1, Math.ceil(w.length / 3)), 0);
  }

  const thaiChars = clean.replace(/[a-zA-Z\s0-9.,!?'-]/g, '');
  const thaiSyllables = Math.max(0, Math.ceil(thaiChars.length / 2.8));

  return Math.max(2, engSyllables + thaiSyllables);
}

export function generateSrt(sections: RawSongSectionOutput[]): string {
  if (!sections || sections.length === 0) {
    return '1\n00:00:00,000 --> 00:00:05,000\n[Instrumental]\n';
  }

  let currentTime = 5.0; // Initial intro padding before first line (~5s)
  const srtBlocks: string[] = [];
  let lineIndex = 1;

  sections.forEach((section) => {
    const secType = (section.type || '').toLowerCase();

    // Pace multiplier based on section type (seconds per syllable)
    let secondsPerSyllable = 0.35; // Default ~3 syllables/sec
    let interLinePause = 0.4;
    let postSectionPause = 1.8;

    if (secType.includes('intro')) {
      secondsPerSyllable = 0.42;
      currentTime += 2.0;
    } else if (secType.includes('verse')) {
      secondsPerSyllable = 0.33;
      interLinePause = 0.4;
    } else if (secType.includes('pre-chorus') || secType.includes('prechorus')) {
      secondsPerSyllable = 0.30;
      interLinePause = 0.3;
    } else if (secType.includes('chorus') || secType.includes('hook')) {
      secondsPerSyllable = 0.38;
      interLinePause = 0.5;
    } else if (secType.includes('rap')) {
      secondsPerSyllable = 0.20;
      interLinePause = 0.2;
    } else if (secType.includes('bridge')) {
      secondsPerSyllable = 0.40;
      interLinePause = 0.6;
    } else if (secType.includes('outro')) {
      secondsPerSyllable = 0.42;
      interLinePause = 0.5;
      postSectionPause = 4.0;
    } else if (secType.includes('breakdown')) {
      secondsPerSyllable = 0.36;
      postSectionPause = 3.0;
    }

    const lines = section.lyrics
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('[') && !l.startsWith('('));

    lines.forEach((lineText, lIdx) => {
      const syllables = estimateSyllableCount(lineText);
      let duration = syllables * secondsPerSyllable;

      // Bound min line duration to 2.0s and max line duration to 7.0s
      duration = Math.max(2.0, Math.min(7.0, duration));

      const startTime = currentTime;
      const endTime = startTime + duration;

      const formattedStart = formatSrtTimestamp(startTime);
      const formattedEnd = formatSrtTimestamp(endTime);

      srtBlocks.push(`${lineIndex}\n${formattedStart} --> ${formattedEnd}\n${lineText}`);
      lineIndex++;

      // Advance current time
      const isLastLineOfSection = lIdx === lines.length - 1;
      const pause = isLastLineOfSection ? postSectionPause : interLinePause;
      currentTime = endTime + pause;
    });
  });

  if (srtBlocks.length === 0) {
    return '1\n00:00:00,000 --> 00:00:05,000\n[Instrumental]\n';
  }

  return srtBlocks.join('\n\n') + '\n';
}

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
