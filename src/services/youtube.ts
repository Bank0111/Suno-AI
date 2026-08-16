import { fetchGeminiApi } from './gemini';
import { YouTubeInfo } from '../types/songwriting';

export async function generateYouTubeInfo(
  title: string,
  stylePrompt: string,
  lyricsText: string
): Promise<YouTubeInfo> {
  return await fetchGeminiApi<YouTubeInfo>('/api/gemini/youtube-info', {
    title,
    stylePrompt,
    lyricsText,
  });
}
