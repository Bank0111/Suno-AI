export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Try matching v= parameter (watch?v=, &v=, or music.youtube.com/watch?v=)
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vMatch && vMatch[1]) {
    return vMatch[1];
  }

  // 2. Try matching youtu.be shortlink (handles query params like ?si=...)
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // 3. Try matching /embed/, /v/, /shorts/, or /live/
  const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/(?:embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/i);
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

export interface YouTubeResolvedMetadata {
  videoId: string;
  canonicalUrl: string;
  title: string;
  channel: string;
  artist: string;
  thumbnailUrl?: string;
  cleanedSongTitle?: string;
  inferredArtist?: string;
}

/**
 * Cleans YouTube music title by removing noise tags like [Official MV], (Audio), etc.
 */
export function cleanYouTubeMusicTitle(rawTitle: string): { title: string; inferredArtist?: string } {
  let cleaned = rawTitle
    .replace(/\[(?:Official\s*(?:MV|Audio|Video|Music Video|Lyric Video|HD|4K)?|MV|Audio|Official)\]/gi, '')
    .replace(/\((?:Official\s*(?:MV|Audio|Video|Music Video|Lyric Video|HD|4K)?|MV|Audio|Official)\)/gi, '')
    .replace(/【(?:Official\s*(?:MV|Audio|Video)|MV)】/gi, '')
    .trim();

  // Check for common "Artist - Song Title" or "Song Title - Artist" pattern
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ').map((p) => p.trim());
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
      return {
        title: parts[1],
        inferredArtist: parts[0],
      };
    }
  }

  return { title: cleaned };
}

export async function resolveYouTubeMetadata(videoId: string): Promise<YouTubeResolvedMetadata | null> {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }
  const canonicalUrl = getCanonicalYouTubeUrl(videoId);
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.title === 'string' && data.title.trim().length > 0) {
        const rawTitle = data.title.trim();
        const channel = typeof data.author_name === 'string' && data.author_name.trim().length > 0
          ? data.author_name.trim()
          : '';

        const { title: cleanedSongTitle, inferredArtist } = cleanYouTubeMusicTitle(rawTitle);

        return {
          videoId,
          canonicalUrl,
          title: rawTitle,
          channel: channel || 'YouTube Creator',
          artist: inferredArtist || channel || 'YouTube Creator',
          thumbnailUrl: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined,
          cleanedSongTitle,
          inferredArtist,
        };
      }
    }
  } catch (err: any) {
    console.error('[YouTubeResolver] oEmbed fetch error:', err?.message || err);
  }
  return null;
}