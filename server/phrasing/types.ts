import { SongCreativeDirection } from '../../src/types/songwriting';

export interface PhrasingDirectiveInput {
  genres: string[];
  songwritingStyle: string;
  moods: string[];
  tempo: string;
  bpm?: number | string;
  rhythm: string;
  vocal: string;
  rhymeStyle: string;
  wordTone?: string;
  languageStyle?: string;
  structure?: string[];
  sectionType?: string;
  story?: string;
  creativeDirection?: SongCreativeDirection;
}

export interface PhrasingValidationIssue {
  sectionIndex: number;
  sectionType: string;
  lineIndex: number;
  lineText: string;
  type:
    | 'line_length_outlier'
    | 'unnatural_break'
    | 'broken_phrase'
    | 'excessive_density'
    | 'hook_fragmentation'
    | 'missing_line_rhyme_connection';
  message: string;
  severity: 'warning' | 'info';
}

export interface PhrasingValidationReport {
  isValid: boolean;
  score: number; // 0 - 100
  issues: PhrasingValidationIssue[];
  summary: {
    totalLines: number;
    avgWordsPerLine: number;
    maxWordsInLine: number;
    sectionCount: number;
  };
}