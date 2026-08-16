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

export interface YouTubeResolvedMetadata {
  videoId: string;
  canonicalUrl: string;
  title: string;
  channel: string;
  artist: string;
  thumbnailUrl?: string;
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
        const title = data.title.trim();
        const channel = typeof data.author_name === 'string' && data.author_name.trim().length > 0
          ? data.author_name.trim()
          : '';
        return {
          videoId,
          canonicalUrl,
          title,
          channel: channel || 'YouTube Creator',
          artist: channel || 'YouTube Creator',
          thumbnailUrl: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined,
        };
      }
    }
  } catch (err: any) {
    console.error('[YouTubeResolver] oEmbed fetch error:', err?.message || err);
  }
  return null;
}
