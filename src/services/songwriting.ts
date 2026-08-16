import { fetchGeminiApi } from './gemini';
import { SongInput, RawSongSectionOutput, SongResult, ReferenceConfig, DeepCreativeAnalysis } from '../types/songwriting';

export async function verifyApiKey(): Promise<boolean> {
  const result = await fetchGeminiApi<{ ok: boolean }>('/api/gemini/verify');
  return result.ok;
}

export async function getRandomStory(language?: string, customLanguage?: string): Promise<string> {
  const result = await fetchGeminiApi<{ story: string }>('/api/gemini/random-story', {
    language,
    customLanguage,
  });
  return result.story;
}

export async function expandIdea(
  inputOrStory: SongInput | string,
  language?: string,
  customLanguage?: string
): Promise<{ expandedIdea: string; creativeAnalysis: DeepCreativeAnalysis; _modelMeta?: any }> {
  let bodyData: Record<string, any> = {};

  if (typeof inputOrStory === 'string') {
    bodyData = {
      story: inputOrStory,
      language,
      customLanguage,
    };
  } else {
    bodyData = {
      story: inputOrStory.story,
      input: inputOrStory,
      language: inputOrStory.language || language,
      customLanguage: inputOrStory.customLanguage || customLanguage,
    };
  }

  const result = await fetchGeminiApi<{
    success?: boolean;
    expandedIdea: string;
    creativeAnalysis: DeepCreativeAnalysis;
    _modelMeta?: any;
  }>('/api/gemini/expand-idea', bodyData);

  return {
    expandedIdea: result.expandedIdea || (result.creativeAnalysis ? result.creativeAnalysis.expandedStory : ''),
    creativeAnalysis: result.creativeAnalysis,
    _modelMeta: result._modelMeta,
  };
}

export async function resolveYouTubeReference(params: {
  youtubeUrl: string;
}): Promise<{
  verified: boolean;
  success?: boolean;
  videoId?: string;
  canonicalUrl?: string;
  title?: string;
  channel?: string;
  artist?: string;
  thumbnailUrl?: string;
  error?: string;
}> {
  return await fetchGeminiApi<{
    verified: boolean;
    success?: boolean;
    videoId?: string;
    canonicalUrl?: string;
    title?: string;
    channel?: string;
    artist?: string;
    thumbnailUrl?: string;
    error?: string;
  }>('/api/gemini/resolve-youtube', params);
}

export async function analyzeReference(params: {
  youtubeUrl?: string;
  songText?: string;
}): Promise<ReferenceConfig> {
  return await fetchGeminiApi<ReferenceConfig>('/api/gemini/analyze-reference', params);
}

export async function getRecommendedStructure(
  story: string,
  genres: string[],
  moods: string[],
  language: string,
  customLanguage?: string
): Promise<{ structure: string[]; reasoning: string }> {
  return await fetchGeminiApi<{ structure: string[]; reasoning: string }>(
    '/api/gemini/recommended-structure',
    {
      story,
      genres,
      moods,
      language,
      customLanguage,
    }
  );
}

export function formatSongResult(rawResult: {
  title: string;
  stylePrompt: string;
  sections: RawSongSectionOutput[];
}): SongResult {
  let formattedLyrics = '';

  const processedSections = rawResult.sections.map((sec) => {
    const cleanType = sec.type.replace(/[\[\]]/g, '').trim() || 'Verse';
    const sectionTag = `[${cleanType}]`;
    let secBlock = sectionTag;

    const musicDir = (sec.musicDirection || '').trim();
    if (musicDir) {
      const formattedMusicDir = musicDir.startsWith('(') && musicDir.endsWith(')')
        ? musicDir
        : `(${musicDir.replace(/^\(|\)$/g, '')})`;
      secBlock += `\n${formattedMusicDir}`;
    }

    const perfDir = (sec.performanceDirection || '').trim();
    if (perfDir) {
      const formattedPerfDir = perfDir.startsWith('[') && perfDir.endsWith(']')
        ? perfDir
        : `[${perfDir.replace(/^\[|\]$/g, '')}]`;
      secBlock += `\n${formattedPerfDir}`;
    }

    if (sec.lyrics && sec.lyrics.length > 0) {
      secBlock += `\n${sec.lyrics.join('\n')}`;
    }

    formattedLyrics += `${secBlock}\n\n`;

    return {
      type: cleanType,
      performanceDirection: sec.performanceDirection || '',
      musicDirection: sec.musicDirection || '',
      lyrics: sec.lyrics || [],
    };
  });

  const fullStylePromptFormatted = `Style Prompt:\n${rawResult.stylePrompt.trim()}`;

  return {
    title: rawResult.title,
    stylePrompt: rawResult.stylePrompt.trim(),
    sections: processedSections,
    fullLyricsFormatted: formattedLyrics.trim(),
    fullStylePromptFormatted,
    createdAt: new Date().toISOString(),
  };
}

export async function generateSong(
  input: SongInput,
  isNewAngle: boolean = false
): Promise<SongResult> {
  const rawResult = await fetchGeminiApi<{
    title: string;
    stylePrompt: string;
    sections: RawSongSectionOutput[];
  }>('/api/gemini/generate-song', { input, isNewAngle });

  return formatSongResult(rawResult);
}

export async function refineSong(
  input: SongInput,
  currentSong: SongResult,
  feedback?: string
): Promise<SongResult> {
  const rawResult = await fetchGeminiApi<{
    title: string;
    stylePrompt: string;
    sections: RawSongSectionOutput[];
  }>('/api/gemini/refine-song', {
    input,
    currentSong,
    feedback,
  });

  return formatSongResult(rawResult);
}

export async function rewriteSection(
  input: SongInput,
  currentSong: SongResult,
  sectionIndex: number,
  sectionType: string,
  userInstruction?: string
): Promise<SongResult> {
  const rawResult = await fetchGeminiApi<{
    title: string;
    stylePrompt: string;
    sections: RawSongSectionOutput[];
  }>('/api/gemini/rewrite-section', {
    input,
    currentSong,
    sectionIndex,
    sectionType,
    userInstruction,
  });

  return formatSongResult(rawResult);
}
