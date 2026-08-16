export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Try matching v= parameter (watch?v= or &v=)
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vMatch && vMatch[1]) {
    return vMatch[1];
  }

  // 2. Try matching youtu.be shortlink
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // 3. Try matching /embed/, /v/, or /shorts/
  const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // 4. Raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getCanonicalYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
