import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/Landing/LandingHero';
import { Step01ApiKey } from './components/ApiKey/Step01_ApiKey';
import { Step02StoryDirection } from './components/StoryDirection/Step02_StoryDirection';
import { Step03SongStructure } from './components/SongStructure/Step03_SongStructure';
import { Step04SongGeneration } from './components/SongGeneration/Step04_SongGeneration';
import { Step05LyricSheet } from './components/LyricSheet/Step05_LyricSheet';
import { Step06YoutubeExport } from './components/YoutubeExport/Step06_YoutubeExport';
import { GuideModal } from './components/Guide/GuideModal';
import { HistoryModal } from './components/History/HistoryModal';
import { SupportPage } from './components/Support/SupportPage';
import { SongInput, SongResult } from './types/songwriting';
import { HistoryRecord } from './types/history';
import { getStoredApiKey } from './utils/storage';
import {
  getHistoryRecords,
  saveHistoryRecord,
  updateHistoryRecord,
  deleteHistoryRecord,
  clearAllHistory,
} from './services/historyRepository';

const DEFAULT_SONG_INPUT: SongInput = {
  story: '',
  genres: ['Pop'],
  customGenre: '',
  moods: ['เศร้า'],
  customMood: '',
  songwritingStyle: null,
  customSongwritingStyle: '',
  language: 'ไทย',
  customLanguage: '',
  wordTone: 'เป็นธรรมชาติ เข้าใจง่าย',
  languageStyle: 'ตรงไปตรงมา',
  pointOfView: 'auto',
  rhymeStyle: 'ให้ AI เลือกให้เหมาะสม',
  tempo: 'ปานกลาง (80–100 BPM)',
  bpm: 90,
  rhythmCharacteristics: ['มีชีวิตชีวา'],
  vocalType: 'หญิง',
  vocalCustomDescription: '',
  structure: [
    'Intro',
    'Verse',
    'Pre-Chorus',
    'Chorus',
    'Verse',
    'Chorus',
    'Bridge',
    'Outro',
  ],
};

export default function App() {
  const [view, setView] = useState<'hero' | 'studio' | 'support'>('hero');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Persistent History State
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // Default Song Input
  const [songInput, setSongInput] = useState<SongInput>(DEFAULT_SONG_INPUT);

  // Song Result
  const [songResult, setSongResult] = useState<SongResult | null>(null);

  // Load stored API Key and Persistent History on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key && key.trim().length > 15));

    // Load History records from persistent storage
    const storedHistory = getHistoryRecords();
    setHistoryRecords(storedHistory);
  }, []);

  const handleUpdateKeyStatus = () => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key && key.trim().length > 15));
  };

  const handleStartCreating = () => {
    setView('studio');
    if (!hasApiKey) {
      setCurrentStep(1);
    } else {
      setCurrentStep(2);
    }
  };

  const handleUpdateSongInput = (updated: Partial<SongInput>) => {
    setSongInput((prev) => ({ ...prev, ...updated }));
  };

  /**
   * Handle when a new song is generated in Step 04
   */
  const handleSongGenerated = (result: SongResult) => {
    setSongResult(result);
    // Save to persistent storage as a new History Record
    const savedRecord = saveHistoryRecord(songInput, result);
    setCurrentRecordId(savedRecord.id);
    setHistoryRecords(getHistoryRecords());
    setCurrentStep(5); // Auto advance to Lyric Sheet
  };

  /**
   * Handle when a song is updated (Refined, Section Rewritten, or manually edited) in Step 05
   */
  const handleUpdateSongResult = (updatedResult: SongResult) => {
    setSongResult(updatedResult);

    if (currentRecordId) {
      updateHistoryRecord(currentRecordId, updatedResult, songInput);
    } else {
      const savedRecord = saveHistoryRecord(songInput, updatedResult);
      setCurrentRecordId(savedRecord.id);
    }

    setHistoryRecords(getHistoryRecords());
  };

  /**
   * Use Again: Restore complete song config, creative direction, reference, structure, lyrics, stylePrompt
   * and navigate to STEP 02 as required
   */
  const handleUseAgain = (record: HistoryRecord) => {
    // Restore full SongInput
    const restoredInput: SongInput = record.songConfig
      ? { ...record.songConfig }
      : {
          ...DEFAULT_SONG_INPUT,
          story: record.story || '',
          genres: record.genre || ['Pop'],
          customGenre: record.customGenre,
          moods: record.mood || ['เศร้า'],
          customMood: record.customMood,
          language: record.language || 'ไทย',
          customLanguage: record.customLanguage,
          wordTone: (record.wordTone as any) || 'เป็นธรรมชาติ เข้าใจง่าย',
          languageStyle: (record.languageStyle as any) || 'ตรงไปตรงมา',
          songwritingStyle: record.songwritingStyle || null,
          customSongwritingStyle: record.customSongwritingStyle,
          pointOfView: (record.pointOfView as any) || 'auto',
          rhymeStyle: (record.rhymeStyle as any) || 'ให้ AI เลือกให้เหมาะสม',
          tempo: record.tempo || 'ปานกลาง (80–100 BPM)',
          bpm: record.bpm ?? 90,
          rhythmCharacteristics: record.rhythmCharacteristics || ['มีชีวิตชีวา'],
          vocalType: record.vocalType || 'หญิง',
          vocalCustomDescription: record.vocalCustomDescription,
          structure: record.structure || DEFAULT_SONG_INPUT.structure,
          reference: record.reference,
          creativeDirection: record.creativeDirection,
        };

    // Restore full SongResult
    const restoredResult: SongResult = record.songResult
      ? { ...record.songResult }
      : {
          title: record.title || 'Untitled Song',
          stylePrompt: record.stylePrompt || '',
          sections: record.sections || [],
          fullLyricsFormatted: record.lyrics || '',
          fullStylePromptFormatted: record.stylePrompt || '',
          createdAt: record.createdAt,
        };

    setSongInput(restoredInput);
    setSongResult(restoredResult);
    setCurrentRecordId(record.id);

    // Switch view to Studio and open STEP 02
    setView('studio');
    setCurrentStep(2);
  };

  /**
   * Delete a single record from persistent storage
   */
  const handleDeleteRecord = (id: string) => {
    deleteHistoryRecord(id);
    if (currentRecordId === id) {
      setCurrentRecordId(null);
    }
    setHistoryRecords(getHistoryRecords());
  };

  /**
   * Clear all history records from persistent storage
   */
  const handleClearAllHistory = () => {
    clearAllHistory();
    setCurrentRecordId(null);
    setHistoryRecords([]);
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FA] flex flex-col font-sans">
      {/* 1. Landing Hero View */}
      {view === 'hero' ? (
        <LandingHero
          onStart={handleStartCreating}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSupport={() => setView('support')}
          hasApiKey={hasApiKey}
        />
      ) : view === 'support' ? (
        /* 2. Support / สนับสนุนโปรเจกต์ View */
        <SupportPage
          onBackToHome={() => setView('hero')}
          onGoToStudio={handleStartCreating}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      ) : (
        /* 3. Studio Workflow View */
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <Header
            currentStep={currentStep}
            totalSteps={6}
            onSelectStep={(step) => setCurrentStep(step)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenApiKeyModal={() => setCurrentStep(1)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            historyCount={historyRecords.length}
            hasApiKey={hasApiKey}
            onReturnToHero={() => setView('hero')}
          />

          {/* Main Studio Content Area */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {currentStep === 1 && (
              <Step01ApiKey
                onConnected={() => setCurrentStep(2)}
                hasApiKey={hasApiKey}
                onKeyStatusChange={handleUpdateKeyStatus}
              />
            )}

            {currentStep === 2 && (
              <Step02StoryDirection
                input={songInput}
                onChange={handleUpdateSongInput}
                onNext={() => setCurrentStep(3)}
                hasApiKey={hasApiKey}
              />
            )}

            {currentStep === 3 && (
              <Step03SongStructure
                input={songInput}
                onChange={handleUpdateSongInput}
                onNext={() => setCurrentStep(4)}
                hasApiKey={hasApiKey}
              />
            )}

            {currentStep === 4 && (
              <Step04SongGeneration
                input={songInput}
                onSongGenerated={handleSongGenerated}
                hasApiKey={hasApiKey}
                onGoToStep={(step) => setCurrentStep(step)}
              />
            )}

            {currentStep === 5 && (
              <Step05LyricSheet
                songInput={songInput}
                songResult={songResult}
                onUpdateSongResult={handleUpdateSongResult}
                onNextToExport={() => setCurrentStep(6)}
                onRegenerate={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 6 && (
              <Step06YoutubeExport
                songResult={songResult}
                hasApiKey={hasApiKey}
                onGoToStep05={() => setCurrentStep(5)}
              />
            )}
          </main>
        </div>
      )}

      {/* Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Persistent History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onUseAgain={handleUseAgain}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
