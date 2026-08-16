export type Genre =
  | 'Pop'
  | 'R&B'
  | 'Hip-Hop'
  | 'Rock'
  | 'Ballad'
  | 'EDM'
  | 'Indie'
  | 'Jazz'
  | 'Folk'
  | 'Lo-fi'
  | 'City Pop'
  | 'ลูกทุ่ง'
  | 'เพื่อชีวิต'
  | 'Bossa Nova'
  | 'Synthwave'
  | 'Acoustic';

export type Mood =
  | 'มีความสุข'
  | 'เศร้า'
  | 'คิดถึง'
  | 'หวังดี'
  | 'โรแมนติก'
  | 'อบอุ่น'
  | 'โดดเดี่ยว'
  | 'สนุก'
  | 'คลั่งรัก'
  | 'เท่'
  | 'เหงา'
  | 'ปลดปล่อย';

export type Language =
  | 'ไทย'
  | 'English'
  | 'Japanese'
  | 'Korean'
  | 'Chinese'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Portuguese'
  | 'Italian'
  | 'Custom';

export type WordTone =
  | 'เป็นธรรมชาติ เข้าใจง่าย'
  | 'สละสลวย'
  | 'กวี'
  | 'ดิบ'
  | 'ร่วมสมัย'
  | 'เป็นกันเอง'
  | 'เข้มข้น';

export type LanguageStyle =
  | 'ตรงไปตรงมา'
  | 'เล่าเรื่อง'
  | 'ใช้ภาพเปรียบเทียบ'
  | 'กวี'
  | 'Modern conversational'
  | 'Storytelling';

export type RhymeStyle =
  | 'ให้ AI เลือกให้เหมาะสม'
  | 'สัมผัสธรรมชาติ'
  | 'สัมผัสชัดเจน'
  | 'สัมผัสท้าย'
  | 'สัมผัสภายใน'
  | 'เน้น flow / cadence';

export type PointOfView =
  | 'first-person'
  | 'second-person'
  | 'third-person'
  | 'mixed'
  | 'auto';

export type SectionType =
  | 'Intro'
  | 'Verse'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Post-Chorus'
  | 'Bridge'
  | 'Breakdown'
  | 'Rap'
  | 'Hook'
  | 'Outro';

export interface SongSectionItem {
  id: string;
  type: string;
  customName?: string;
}

export interface SongStructurePreset {
  id: string;
  name: string;
  description: string;
  sections: string[];
}

export interface ReferenceAnalysis {
  genre?: string[];
  subgenre?: string;
  mood?: string[];
  tempo?: string;
  vocal?: string;
  instrumentation?: string[];
  rhythm?: string;
  structure?: string[];
  lyricApproach?: string;
  rhymeApproach?: string;
  productionCharacter?: string;
  overallDirection?: string;
  confidence?: 'verified' | 'inferred' | 'unavailable';
  source?: 'youtube_media' | 'youtube_metadata' | 'audio_analysis' | 'user_input' | 'context_inference' | 'unavailable';
}

export type CreativeDirectionSource = 'user' | 'reference' | 'auto' | 'inferred';

export interface CreativeDirectionField<T = string> {
  value: T;
  source: CreativeDirectionSource;
  sourceLabel?: string;
  rationale?: string;
}

export interface SuggestedStructure {
  source: 'reference' | 'auto' | 'user';
  sections: string[];
  sourceLabel?: string;
  rationale?: string;
}

export interface SongCreativeDirection {
  genre: CreativeDirectionField<string[] | string>;
  subgenre?: CreativeDirectionField<string>;
  mood: CreativeDirectionField<string[] | string>;
  tempo: CreativeDirectionField<string>;
  bpm?: CreativeDirectionField<number | string>;
  rhythm: CreativeDirectionField<string[] | string>;
  vocal: CreativeDirectionField<string>;
  instrumentation: CreativeDirectionField<string[] | string>;
  productionCharacter?: CreativeDirectionField<string>;
  songwritingStyle?: CreativeDirectionField<string>;
  languageStyle?: CreativeDirectionField<string>;
  rhymeStyle?: CreativeDirectionField<string>;
  structure?: CreativeDirectionField<string[] | string>;
  suggestedStructure?: SuggestedStructure;
}

export interface ReferenceConfig {
  sourceType: 'youtube' | 'text';
  source: string;
  videoId?: string;
  canonicalUrl?: string;
  title?: string;
  channel?: string;
  artist?: string;
  thumbnailUrl?: string;
  identityVerified?: boolean;
  analysisVerified?: boolean;
  audioAnalysisAvailable?: boolean;
  mediaAnalysisStatus?: 'verified' | 'unavailable' | 'failed';
  confidence?: 'verified' | 'inferred' | 'unavailable';
  sourceProvenance?: 'youtube_media' | 'youtube_metadata' | 'audio_analysis' | 'user_input' | 'unavailable';
  analysis?: ReferenceAnalysis;
  userOverrides?: {
    genre?: string;
    vocal?: string;
    instrumentation?: string;
    tempo?: string;
  };
  warningMessage?: string;
  applied?: boolean;
  creativeDirection?: SongCreativeDirection;
}

export interface SongwritingStyleOption {
  id: string;
  name: string;
  description: string;
}

export type SongwritingStyle = SongwritingStyleOption | string | null;

export interface SectionBlueprintItem {
  section: string;
  guidance: string;
}

export interface DeepCreativeAnalysis {
  expandedStory: string;
  coreMessage: string;
  emotionalArc: string;
  primaryConflict: string;
  characterMotivation?: string;
  povLogic?: string;
  keyMotifs: string[];
  imageryAnchors: string[];
  centralHookIdea: string;
  endingIdea?: string;
  sectionBlueprint?: SectionBlueprintItem[];
  clicheAvoidanceAngle?: string;
}

export interface SongInput {
  story: string;
  genres: string[];
  customGenre?: string;
  moods: string[];
  customMood?: string;
  songwritingStyle?: SongwritingStyle;
  customSongwritingStyle?: string;
  language: string;
  customLanguage?: string;
  wordTone: WordTone;
  languageStyle: LanguageStyle;
  pointOfView?: PointOfView;
  rhymeStyle: RhymeStyle;
  tempo?: string;
  bpm?: number | null;
  rhythmCharacteristics?: string[];
  vocalType?: string;
  vocalCustomDescription?: string;
  structure: string[];
  reference?: ReferenceConfig;
  userExplicitSelections?: Record<string, boolean>;
  creativeDirection?: SongCreativeDirection;
  creativeAnalysis?: DeepCreativeAnalysis;
}

export type SongConfig = SongInput;

export interface RawSongSectionOutput {
  type: string;
  performanceDirection?: string;
  musicDirection?: string;
  lyrics: string[];
}

export interface ModelMeta {
  modelId: string;
  modelTier: 'best' | 'next_best' | 'fast' | 'light';
  labelTh: string;
  fallbackUsed: boolean;
  fallbackReason?: 'quota' | 'unavailable' | null;
  userMessage?: string;
}

export interface SongResult {
  title: string;
  stylePrompt: string;
  sections: RawSongSectionOutput[];
  fullLyricsFormatted: string;
  fullStylePromptFormatted: string;
  createdAt: string;
  _modelMeta?: ModelMeta;
}

export interface YouTubeInfo {
  title: string;
  description: string;
  hashtags: string[];
}

export interface StepValidation {
  isValid: boolean;
  missingFields: string[];
}
