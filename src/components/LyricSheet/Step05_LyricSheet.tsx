import React, { useState } from 'react';
import {
  Copy,
  Check,
  Music,
  FileText,
  Sparkles,
  ArrowRight,
  Disc,
  RefreshCw,
  Edit3,
  Wand2,
  X,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { SongInput, SongResult, RawSongSectionOutput } from '../../types/songwriting';
import { refineSong, rewriteSection, generateSong, formatSongResult } from '../../services/songwriting';

interface Step05Props {
  songInput: SongInput;
  songResult: SongResult | null;
  onUpdateSongResult: (result: SongResult) => void;
  onNextToExport: () => void;
  onRegenerate: () => void;
}

// Section purpose guidelines for display
const SECTION_GUIDELINES: Record<string, string> = {
  'Verse 1': 'แนะนำโลกของเรื่อง ฉาก ตัวละคร จุดเริ่มต้นความขัดแย้ง',
  'Verse 2': 'ต้องเพิ่มข้อมูลใหม่/มุมมองใหม่/เพิ่มเดิมพัน ห้ามซ้ำ Verse 1',
  'Pre-Chorus': 'สร้าง Tension ยกระดับอารมณ์ เตรียมส่งเข้าสู่ Hook',
  'Chorus': 'หัวใจของเพลง Central Idea + Hook Line ที่จำติดหู ร้องซ้ำได้ดี',
  'Bridge': 'เปลี่ยนมุมมอง เปิดเผยความจริง ยอมรับบางอย่าง หรือเปลี่ยน Emotional Perspective',
  'Outro': 'สรุปอารมณ์ ปล่อยให้ภาพหรือความรู้สึกตกค้างในใจผู้ฟัง',
};

export const Step05LyricSheet: React.FC<Step05Props> = ({
  songInput,
  songResult,
  onUpdateSongResult,
  onNextToExport,
  onRegenerate,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Modal / Action states
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  // Section rewrite modal state
  const [rewriteTarget, setRewriteTarget] = useState<{ index: number; type: string } | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isRewritingSection, setIsRewritingSection] = useState(false);

  // New angle generation state
  const [isGeneratingNewAngle, setIsGeneratingNewAngle] = useState(false);

  // Manual inline edit state
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [editedPerfDir, setEditedPerfDir] = useState<string>('');
  const [editedMusicDir, setEditedMusicDir] = useState<string>('');
  const [editedLyricsText, setEditedLyricsText] = useState<string>('');

  // Error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!songResult) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
          <Music className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-white">ยังไม่มีเนื้อเพลงที่สร้างเสร็จ</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          กรุณาทำขั้นตอน 02-04 ให้เสร็จสิ้นเพื่อรับ Lyric Sheet และ Suno Style Prompt
        </p>
      </div>
    );
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyAllFormatted = `Title: ${songResult.title}

Style Prompt:
${songResult.stylePrompt}

Lyrics:
${songResult.fullLyricsFormatted}`;

  // Preset chips for Refine Modal
  const refinePresetChips = [
    '🎨 ขจัด Cliché / วลีสำเร็จรูป',
    '👁️ เพิ่ม Imagery (Show Don\'t Tell)',
    '🎵 ขัดเกลาสัมผัสในและเสียงภาษาร้อง',
    '🎯 ยกระดับ Hook ใน Chorus ให้ติดหู',
    '📖 เพิ่มเรื่องราวใหม่ใน Verse 2 / Bridge',
  ];

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  // 1. Refine Entire Song
  const handleExecuteRefine = async () => {
    setIsRefining(true);
    setErrorMsg(null);

    const combinedFeedback = [
      ...selectedChips,
      refineFeedback.trim(),
    ].filter(Boolean).join(' | ');

    try {
      const updated = await refineSong(songInput, songResult, combinedFeedback);
      onUpdateSongResult(updated);
      setIsRefineModalOpen(false);
      setRefineFeedback('');
      setSelectedChips([]);
    } catch (err: any) {
      console.error('Refine failed:', err);
      setErrorMsg(err.message || 'ไม่สามารถปรับแก้เนื้อเพลงได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsRefining(false);
    }
  };

  // 2. Rewrite Specific Section
  const handleExecuteSectionRewrite = async () => {
    if (!rewriteTarget) return;

    setIsRewritingSection(true);
    setErrorMsg(null);

    try {
      const updated = await rewriteSection(
        songInput,
        songResult,
        rewriteTarget.index,
        rewriteTarget.type,
        rewriteInstruction.trim()
      );
      onUpdateSongResult(updated);
      setRewriteTarget(null);
      setRewriteInstruction('');
    } catch (err: any) {
      console.error('Section rewrite failed:', err);
      setErrorMsg(err.message || 'ไม่สามารถ Rewrite ท่อนนี้ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsRewritingSection(false);
    }
  };

  // 3. Generate New Song from Existing Story
  const handleGenerateNewAngle = async () => {
    setIsGeneratingNewAngle(true);
    setErrorMsg(null);

    try {
      const newSong = await generateSong(songInput, true);
      onUpdateSongResult(newSong);
    } catch (err: any) {
      console.error('New angle generation failed:', err);
      setErrorMsg(err.message || 'ไม่สามารถสร้างเพลงใหม่ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingNewAngle(false);
    }
  };

  // 4. Manual Edit Mode
  const startEditingSection = (idx: number, sec: RawSongSectionOutput) => {
    setEditingSectionIdx(idx);
    setEditedPerfDir(sec.performanceDirection || '');
    setEditedMusicDir(sec.musicDirection || '');
    setEditedLyricsText(sec.lyrics ? sec.lyrics.join('\n') : '');
  };

  const saveEditedSection = (idx: number) => {
    const updatedLines = editedLyricsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newSections = songResult.sections.map((sec, i) => {
      if (i === idx) {
        return {
          ...sec,
          performanceDirection: editedPerfDir.trim(),
          musicDirection: editedMusicDir.trim(),
          lyrics: updatedLines,
        };
      }
      return sec;
    });

    const updatedResult = formatSongResult({
      title: songResult.title,
      stylePrompt: songResult.stylePrompt,
      sections: newSections,
    });

    onUpdateSongResult(updatedResult);
    setEditingSectionIdx(null);
    setEditedPerfDir('');
    setEditedMusicDir('');
    setEditedLyricsText('');
  };

  const getSectionGuideline = (typeStr: string): string => {
    const clean = typeStr.replace(/[\d\[\]]/g, '').trim();
    if (SECTION_GUIDELINES[clean]) return SECTION_GUIDELINES[clean];
    if (SECTION_GUIDELINES[typeStr]) return SECTION_GUIDELINES[typeStr];
    if (typeStr.toLowerCase().includes('verse 1')) return SECTION_GUIDELINES['Verse 1'];
    if (typeStr.toLowerCase().includes('verse 2')) return SECTION_GUIDELINES['Verse 2'];
    if (typeStr.toLowerCase().includes('chorus')) return SECTION_GUIDELINES['Chorus'];
    if (typeStr.toLowerCase().includes('pre')) return SECTION_GUIDELINES['Pre-Chorus'];
    if (typeStr.toLowerCase().includes('bridge')) return SECTION_GUIDELINES['Bridge'];
    return 'สร้างสรรค์ภาษาและอารมณ์ให้สอดคล้องกับเรื่องราว';
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-hero-fade">
      {/* Title & Top Toolbar */}
      <div className="border-b border-white/10 pb-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
            STEP 05
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
            05 ผลลัพธ์ / LYRIC SHEET
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            มาตรฐานครูเพลง / ปรับแก้เนื้อเพลง / Rewrite รายท่อน / Export สำหรับ Suno
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refine Entire Song */}
          <button
            type="button"
            onClick={() => setIsRefineModalOpen(true)}
            disabled={isRefining || isGeneratingNewAngle}
            className="px-4 py-2 rounded-full bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>ปรับแก้เนื้อเพลง (Refine)</span>
          </button>

          {/* New Song from Same Story */}
          <button
            type="button"
            onClick={handleGenerateNewAngle}
            disabled={isGeneratingNewAngle || isRefining}
            className="px-4 py-2 rounded-full bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isGeneratingNewAngle ? 'animate-spin' : ''}`} />
            <span>{isGeneratingNewAngle ? 'กำลังสร้างเพลงใหม่...' : 'สร้างเพลงใหม่จาก Story เดิม'}</span>
          </button>

          {/* Copy All */}
          <button
            type="button"
            onClick={() => handleCopy(copyAllFormatted, 'all')}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-950/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            {copiedType === 'all' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>คัดลอกทั้งหมดแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All (สำหรับ Suno)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Error Box if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-400 hover:text-white underline ml-4"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Global Loading Overlay Banner */}
      {(isRefining || isGeneratingNewAngle) && (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-6 text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h4 className="text-base font-semibold text-purple-200">
            {isRefining ? 'ครูเพลงกำลังปรับแก้เนื้อเพลง...' : 'กำลังประพันธ์เพลงใหม่จากมุมมองใหม่...'}
          </h4>
          <p className="text-xs text-purple-300/80 max-w-md mx-auto">
            ตรวจสอบภาษาสำเร็จรูป (Cliché), ขัดเกลาภาพ Imagery, ปรับแต่งสัมผัสสระคำร้อง และสร้าง Hook ให้ทรงพลัง
          </p>
        </div>
      )}

      {/* SONG TITLE BANNER */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
          <Disc className="w-4 h-4 animate-spin-slow text-purple-400" />
          <span>SONG TITLE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white font-kanit">
          {songResult.title}
        </h1>
      </div>

      {/* STYLE PROMPT CARD */}
      <div className="bg-[#0D0B14] border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
              STYLE PROMPT (สำหรับช่อง Style ใน Suno)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(songResult.stylePrompt, 'style')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedType === 'style' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>คัดลอก Style แล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Style Prompt</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#12101A] border border-white/5 font-mono text-xs sm:text-sm text-cyan-100 leading-relaxed select-all">
          {songResult.stylePrompt}
        </div>

        <p className="text-[11px] text-zinc-500">
          คัดลอกข้อความด้านบนไปวางในช่อง <strong className="text-zinc-300">Style of Music</strong> ใน Suno
        </p>
      </div>

      {/* LYRICS SHEET */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-semibold tracking-wider text-purple-300 uppercase">
              LYRICS SHEET
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRefineModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/30 text-xs text-purple-200 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>ปรับแก้เนื้อเพลง</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(songResult.fullLyricsFormatted, 'lyrics')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-xs text-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'lyrics' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกเนื้อเพลงแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Lyrics</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formatted Sections display */}
        <div className="space-y-6 font-kanit text-zinc-200 leading-relaxed text-sm sm:text-base">
          {songResult.sections.map((sec, idx) => {
            const isEditingThis = editingSectionIdx === idx;
            const guideline = getSectionGuideline(sec.type);

            return (
              <div
                key={idx}
                className="group relative bg-[#12101A] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 transition-all space-y-3"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-400 font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30">
                      [{sec.type.replace(/[\[\]]/g, '')}]
                    </span>
                    <span className="text-[11px] text-zinc-400 font-sans italic">
                      • {guideline}
                    </span>
                  </div>

                  {/* Section Actions */}
                  <div className="flex items-center gap-2">
                    {!isEditingThis ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRewriteTarget({ index: idx, type: sec.type })}
                          disabled={isRewritingSection || isRefining}
                          className="px-2.5 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/20 text-[11px] text-purple-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                          title="Rewrite ท่อนนี้ด้วยมาตรฐานครูเพลง"
                        >
                          <RefreshCw className="w-3 h-3 text-purple-400" />
                          <span>Rewrite ท่อนนี้</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditingSection(idx, sec)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/60 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                          title="แก้ไขข้อความด้วยตนเอง"
                        >
                          <Edit3 className="w-3 h-3 text-zinc-400" />
                          <span>แก้ไข</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => saveEditedSection(idx)}
                        className="px-3 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-500/30 text-xs text-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span>บันทึก</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {isEditingThis ? (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-purple-300 uppercase">
                        Vocal / Performance Direction:
                      </label>
                      <input
                        type="text"
                        value={editedPerfDir}
                        onChange={(e) => setEditedPerfDir(e.target.value)}
                        placeholder="เช่น Melancholic, Reflective Vocal"
                        className="w-full bg-[#08070D] border border-purple-500/30 rounded-lg p-2.5 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Music / Arrangement Direction:
                      </label>
                      <textarea
                        value={editedMusicDir}
                        onChange={(e) => setEditedMusicDir(e.target.value)}
                        placeholder="เช่น Soft piano arpeggios, atmospheric synth pads slowly swell..."
                        rows={2}
                        className="w-full bg-[#08070D] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-zinc-300 italic focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-300 uppercase">
                        Lyrics (เนื้อเพลง):
                      </label>
                      <textarea
                        value={editedLyricsText}
                        onChange={(e) => setEditedLyricsText(e.target.value)}
                        rows={Math.max((sec.lyrics ? sec.lyrics.length : 0) + 1, 3)}
                        placeholder="เนื้อเพลงแยกแต่ละบรรทัด..."
                        className="w-full bg-[#08070D] border border-purple-500/40 rounded-xl p-3 text-sm font-kanit text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingSectionIdx(null)}
                        className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={() => saveEditedSection(idx)}
                        className="px-4 py-1.5 rounded bg-purple-600 text-xs text-white font-medium hover:bg-purple-500 transition-colors"
                      >
                        บันทึกการแก้ไข
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {/* Music / Arrangement Direction */}
                    {sec.musicDirection && sec.musicDirection.trim() && (
                      <div className="bg-[#0A0912] border border-white/5 p-3 rounded-xl text-xs font-mono text-zinc-400/90 italic leading-relaxed">
                        {sec.musicDirection.startsWith('(') && sec.musicDirection.endsWith(')')
                          ? sec.musicDirection
                          : `(${sec.musicDirection})`}
                      </div>
                    )}

                    {/* Vocal / Performance Direction */}
                    {sec.performanceDirection && sec.performanceDirection.trim() && (
                      <div className="text-xs font-mono text-purple-300 font-medium tracking-wide flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/20 text-purple-300">
                          {sec.performanceDirection.startsWith('[') && sec.performanceDirection.endsWith(']')
                            ? sec.performanceDirection
                            : `[${sec.performanceDirection}]`}
                        </span>
                      </div>
                    )}

                    {/* Lyrics Lines */}
                    {sec.lyrics && sec.lyrics.length > 0 ? (
                      <div className="pl-3 border-l-2 border-purple-500/30 space-y-1.5 pt-0.5">
                        {sec.lyrics.map((line, lIdx) => (
                          <p key={lIdx} className="text-zinc-100 font-light text-base sm:text-lg leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic pl-3">(Instrumental Section)</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onRegenerate}
          className="text-xs text-zinc-400 hover:text-white underline transition-colors"
        >
          ← ปรับแก้โจทย์และเรื่องราวใหม่
        </button>

        <button
          type="button"
          onClick={onNextToExport}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-xl shadow-purple-950/40 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>ไปขั้นตอน 06 Export สำหรับ YouTube</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL 1: Refine Entire Song */}
      {isRefineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-hero-fade">
          <div className="bg-[#0D0B14] border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsRefineModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">ปรับแก้เนื้อเพลง (Full Song Refine)</h3>
                <p className="text-xs text-zinc-400">
                  ยกระดับภาษาขจัด Cliché, เพิ่ม Imagery และปรับสัมผัสการร้องตามมาตรฐานครูเพลง
                </p>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400">
                เลือกจุดที่ต้องการเน้นเป็นพิเศษ:
              </label>
              <div className="flex flex-wrap gap-2">
                {refinePresetChips.map((chip, i) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border border-purple-400 shadow-md'
                          : 'bg-zinc-900 text-zinc-300 border border-white/10 hover:border-purple-500/40'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Instruction Box */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400">
                ระบุคำแนะนำเพิ่มเติม (ถ้ามี):
              </label>
              <textarea
                value={refineFeedback}
                onChange={(e) => setRefineFeedback(e.target.value)}
                placeholder="เช่น อยากให้เน้นฉากในร้านกาแฟให้ชัดเจนขึ้น และปรับท่อน Hook ให้ติดหูยิ่งขึ้น..."
                rows={3}
                className="w-full bg-[#12101A] border border-white/10 rounded-xl p-3 text-xs font-kanit text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRefineModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteRefine}
                disabled={isRefining}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isRefining ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>กำลังปรับแก้เนื้อเพลง...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>เริ่มปรับแก้เนื้อเพลง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Rewrite Specific Section */}
      {rewriteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-hero-fade">
          <div className="bg-[#0D0B14] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setRewriteTarget(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Rewrite เฉพาะท่อน [{rewriteTarget.type}]
                </h3>
                <p className="text-xs text-purple-300">
                  • {getSectionGuideline(rewriteTarget.type)}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#12101A] border border-white/10 text-xs space-y-1">
              <p className="text-zinc-400 font-semibold">กติการะดับครูเพลงสำหรับท่อนนี้:</p>
              <p className="text-zinc-300 leading-relaxed">
                ท่อนอื่นในเพลงจะคงไว้ และ AI จะ Rewrite เฉพาะท่อน [{rewriteTarget.type}] ให้ตอบโจทย์หน้าที่เฉพาะของท่อนนั้นอย่างสมบูรณ์แบบ
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400">
                รายละเอียด/แนวทางที่ต้องการเน้นในท่อนนี้ (ถ้ามี):
              </label>
              <textarea
                value={rewriteInstruction}
                onChange={(e) => setRewriteInstruction(e.target.value)}
                placeholder="เช่น อยากให้เพิ่มรายละเอียดสิ่งของในความทรงจำ หรือปรับสัมผัสในให้สละสลวยขึ้น..."
                rows={3}
                className="w-full bg-[#12101A] border border-white/10 rounded-xl p-3 text-xs font-kanit text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRewriteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteSectionRewrite}
                disabled={isRewritingSection}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isRewritingSection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลัง Rewrite [{rewriteTarget.type}]...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rewrite ท่อนนี้ด้วยมาตรฐานครูเพลง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
