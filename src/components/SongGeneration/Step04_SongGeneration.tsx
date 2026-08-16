import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Loader2,
  RefreshCw,
  Music,
  FileText,
  Sliders,
} from 'lucide-react';
import { SongInput, SongResult } from '../../types/songwriting';
import { validateSongInput } from '../../utils/validation';
import { generateSong } from '../../services/songwriting';

interface Step04Props {
  input: SongInput;
  onSongGenerated: (result: SongResult) => void;
  hasApiKey: boolean;
  onGoToStep: (step: number) => void;
}

export const Step04SongGeneration: React.FC<Step04Props> = ({
  input,
  onSongGenerated,
  hasApiKey,
  onGoToStep,
}) => {
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validation = validateSongInput(input);

  const pipelineSteps = [
    'วิเคราะห์เรื่องราวและบริบทอารมณ์',
    'วางทิศทางอารมณ์และคำเปรียบเปรย',
    'จัดสรรโครงสร้างท่อนและจังหวะสัมผัส',
    'กำลังประพันธ์เนื้อเพลงความยาวสมบูรณ์',
    'จัดรูปแบบ Style Prompt และเนื้อเพลงสำหรับ Suno',
  ];

  // Simulating active progress steps during API call
  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgressStep(0);
      interval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev < pipelineSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2200);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setErrorMsg('กรุณาเชื่อมต่อ Gemini API Key ในขั้นตอน 01 ก่อน');
      onGoToStep(1);
      return;
    }

    if (!validation.isValid) {
      setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วนก่อนเริ่มแต่งเพลง');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const songResult = await generateSong(input);
      onSongGenerated(songResult);
    } catch (err: any) {
      console.error('Song generation failed:', err);
      setErrorMsg(
        err.message || 'ไม่สามารถแต่งเนื้อเพลงได้ กรุณาตรวจสอบ API Key แล้วลองอีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 animate-hero-fade">
      {/* Title */}
      <div className="border-b border-white/10 pb-5">
        <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
          STEP 04
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
          04 สร้างเพลง (Generate Lyrics)
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          ตรวจสอบข้อมูลทั้งหมดแล้วให้ AI Songwriting Engine รังสรรค์เนื้อเพลง
        </p>
      </div>

      {/* Checklist Overview */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono tracking-wider uppercase text-zinc-400">
          REQUIREMENTS CHECKLIST
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* API Key */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              hasApiKey
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {hasApiKey ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold">01 Gemini API Key</p>
              <p className="text-[11px] opacity-80">
                {hasApiKey ? 'Connected' : 'Missing (กลับไปเชื่อมต่อใน step 01)'}
              </p>
            </div>
          </div>

          {/* Story */}
          {(() => {
            const storyLen = (input.story || '').trim().length;
            const isStoryValid = storyLen >= 10;
            let storyStatusText = 'ระบุเรื่องราวแล้ว';
            if (storyLen === 0) {
              storyStatusText = 'ยังไม่ได้ระบุเรื่องราว';
            } else if (storyLen < 10) {
              storyStatusText = 'เรื่องราวสั้นเกินไป';
            }
            return (
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  isStoryValid
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                {isStoryValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">02 Prompt / เรื่องราว</p>
                  <p className="text-[11px] opacity-80 truncate">
                    {storyStatusText}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Genre & Mood */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              input.genres.length > 0 && input.moods.length > 0
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {input.genres.length > 0 && input.moods.length > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold">Genre & Mood</p>
              <p className="text-[11px] opacity-80">
                {input.genres.join(', ') || 'ไม่ได้ระบุ'} / {input.moods.join(', ') || 'ไม่ได้ระบุ'}
              </p>
            </div>
          </div>

          {/* Structure */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              input.structure && input.structure.length >= 3
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {input.structure && input.structure.length >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold">03 Song Structure</p>
              <p className="text-[11px] opacity-80">
                {input.structure?.length || 0} Sections
              </p>
            </div>
          </div>
        </div>

        {/* Missing fields warning */}
        {!validation.isValid && (
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">ข้อมูลยังไม่ครบถ้วน:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] opacity-90">
                {validation.missingFields.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={handleGenerate}
            className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded text-xs text-white font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Active Pipeline Progress View */}
      {loading ? (
        <div className="bg-[#0D0B14] border border-purple-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-center animate-hero-fade">
          <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 relative">
            <Music className="w-8 h-8 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white">กำลังแต่งเพลง...</h3>
            <p className="text-xs text-zinc-400 mt-1">
              โปรดรอสักครู่ Gemini AI กำลังเรียบเรียงอารมณ์และภาษา
            </p>
          </div>

          {/* Pipeline Checklist */}
          <div className="max-w-md mx-auto space-y-3 text-left bg-[#12101A] p-5 rounded-xl border border-white/10 font-mono text-xs">
            {pipelineSteps.map((stepName, idx) => {
              const isDone = idx < progressStep;
              const isCurrent = idx === progressStep;

              return (
                <div key={idx} className="flex items-center gap-3">
                  {isDone ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : isCurrent ? (
                    <span className="text-purple-400 font-bold animate-pulse">●</span>
                  ) : (
                    <span className="text-zinc-600">○</span>
                  )}
                  <span
                    className={
                      isDone
                        ? 'text-zinc-300'
                        : isCurrent
                        ? 'text-cyan-300 font-semibold'
                        : 'text-zinc-600'
                    }
                  >
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Primary Action Button */
        <div className="flex flex-col items-center justify-center py-6">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!validation.isValid || !hasApiKey}
            className="group px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-base sm:text-lg shadow-2xl shadow-purple-950/60 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span>● แต่งเนื้อเพลงตอนนี้</span>
            <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
          </button>
          <p className="text-xs text-zinc-500 mt-4">
            ผลลัพธ์จะรวมถึง Lyric Sheet และ Suno Style Prompt ในขั้นตอน 05
          </p>
        </div>
      )}
    </div>
  );
};
