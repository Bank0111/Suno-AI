import { SongInput, SongResult, RawSongSectionOutput, SongCreativeDirection, ReferenceConfig } from './songwriting';

export interface HistoryRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  
  // Core Song Configurations & Context
  songConfig: SongInput;
  creativeDirection?: SongCreativeDirection;
  reference?: ReferenceConfig;
  
  // Specific context items for quick access & indexing
  story: string;
  genre: string[];
  customGenre?: string;
  mood: string[];
  customMood?: string;
  language: string;
  customLanguage?: string;
  wordTone: string;
  languageStyle: string;
  songwritingStyle?: any;
  customSongwritingStyle?: string;
  pointOfView?: string;
  rhymeStyle: string;
  tempo?: string;
  bpm?: number | null;
  rhythmCharacteristics?: string[];
  vocalType?: string;
  vocalCustomDescription?: string;

  // Lyrical & Production Output
  structure: string[];
  sections: RawSongSectionOutput[];
  lyrics: string;
  stylePrompt: string;
  
  // Full Song Result for complete restoration
  songResult: SongResult;
}
