import React, { useState, useEffect } from 'react';
import {
  ListMusic,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Sparkles,
  Loader2,
  Check,
  X,
  LayoutGrid,
  RotateCcw,
  Music2,
  SlidersHorizontal,
} from 'lucide-react';
import { SongInput, SongStructurePreset, SectionType } from '../../types/songwriting';
import { getRecommendedStructure } from '../../services/songwriting';
import { deriveCreativeDirection } from '../../utils/creativeDirection';

interface Step03Props {
  input: SongInput;
  onChange: (updated: Partial<SongInput>) => void;
  onNext: () => void;
  hasApiKey: boolean;
}

const PRESETS: SongStructurePreset[] = [
  {
    id: 'pop',
    name: 'โครงสร้างป๊อปมาตรฐาน (Standard Pop)',
    description: 'Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Pre-Chorus → Chorus → Bridge → Chorus → Outro',
    sections: [
      'Intro',
      'Verse 1',
      'Pre-Chorus',
      'Chorus',
      'Verse 2',
      'Pre-Chorus',
      'Chorus',
      'Bridge',
      'Chorus',
      'Outro',
    ],
  },
  {
    id: 'ballad',
    name: 'บัลลาด (Ballad / Emotional Build)',
    description: 'Intro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Final Chorus → Outro',
    sections: [
      'Intro',
      'Verse 1',
      'Chorus',
      'Verse 2',
      'Chorus',
      'Bridge',
      'Final Chorus',
      'Outro',
    ],
  },
  {
    id: 'hiphop',
    name: 'ฮิปฮอป / Rap / Trap',
    description: 'Intro → Verse 1 → Hook → Verse 2 → Hook → Rap Breakdown → Hook → Outro',
    sections: [
      'Intro',
      'Verse 1',
      'Hook',
      'Verse 2',
      'Hook',
      'Rap Breakdown',
      'Hook',
      'Outro',
    ],
  },
  {
    id: 'edm',
    name: 'EDM / Dance Build & Drop',
    description: 'Intro → Verse → Pre-Chorus → Drop / Chorus → Breakdown → Pre-Chorus → Drop / Chorus → Outro',
    sections: [
      'Intro',
      'Verse',
      'Pre-Chorus',
      'Drop / Chorus',
      'Breakdown',
      'Pre-Chorus',
      'Drop / Chorus',
      'Outro',
    ],
  },
];

const AVAILABLE_SECTIONS: SectionType[] = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Post-Chorus',
  'Bridge',
  'Breakdown',
  'Rap',
  'Hook',
  'Outro',
];

export const Step03SongStructure: React.FC<Step03Props> = ({
  input,
  onChange,
  onNext,
  hasApiKey,
}) => {
  const [selectedAddSection, setSelectedAddSection] = useState<SectionType>('Verse');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    structure: string[];
    reasoning: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute Active Creative Direction
  const creativeDir = (input.reference?.applied && input.reference.creativeDirection)
    ? input.reference.creativeDirection
    : deriveCreativeDirection(input);

  const isUserExplicit = Boolean(input.userExplicitSelections?.structure);
  const isRefActive = Boolean(input.reference && input.reference.applied === true);

  // Suggested structure from Creative Direction
  const suggestedSections: string[] = (
    creativeDir.suggestedStructure?.sections ||
    (Array.isArray(creativeDir.structure?.value) ? creativeDir.structure.value : null) ||
    [
      'Intro',
      'Verse 1',
      'Pre-Chorus',
      'Chorus',
      'Verse 2',
      'Pre-Chorus',
      'Chorus',
      'Bridge',
      'Chorus',
      'Outro',
    ]
  );

  // Synchronize on mount if user hasn't overridden and current structure isn't set or needs alignment
  useEffect(() => {
    if (!isUserExplicit && suggestedSections && suggestedSections.length > 0) {
      const current = input.structure || [];
      const isIdentical = current.length === suggestedSections.length && current.every((s, i) => s === suggestedSections[i]);
      if (!isIdentical) {
        onChange({ structure: suggestedSections });
      }
    }
  }, [isUserExplicit, input.reference?.applied, input.genres, input.moods]);

  const sections = input.structure && input.structure.length > 0 ? input.structure : suggestedSections;

  // Move section (marks user override)
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newArr = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return;

    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    onChange({
      structure: newArr,
      userExplicitSelections: { ...(input.userExplicitSelections || {}), structure: true },
    });
  };

  // Remove section (marks user override)
  const handleRemove = (index: number) => {
    if (sections.length <= 2) {
      setErrorMsg('โครงสร้างเพลงควรมีอย่างน้อย 2 ส่วน');
      return;
    }
    const newArr = sections.filter((_, i) => i !== index);
    onChange({
      structure: newArr,
      userExplicitSelections: { ...(input.userExplicitSelections || {}), structure: true },
    });
  };

  // Add section (marks user override)
  const handleAdd = () => {
    onChange({
      structure: [...sections, selectedAddSection],
      userExplicitSelections: { ...(input.userExplicitSelections || {}), structure: true },
    });
  };

  // Select Preset (marks user override)
  const handleSelectPreset = (presetSections: string[]) => {
    onChange({
      structure: presetSections,
      userExplicitSelections: { ...(input.userExplicitSelections || {}), structure: true },
    });
  };

  // Reset to AI / Reference Recommended Structure
  const handleResetToAiRecommendation = () => {
    const freshCreativeDir = (input.reference?.applied && input.reference.creativeDirection)
      ? input.reference.creativeDirection
      : deriveCreativeDirection(input);

    const freshSections = (
      freshCreativeDir.suggestedStructure?.sections ||
      (Array.isArray(freshCreativeDir.structure?.value) ? freshCreativeDir.structure.value : null) ||
      suggestedSections
    );

    const updatedExplicit = { ...(input.userExplicitSelections || {}) };
    delete updatedExplicit.structure;

    onChange({
      structure: freshSections,
      userExplicitSelections: updatedExplicit,
    });
  };

  // AI Recommended Structure Dialog
  const handleAiRecommend = async () => {
    if (!hasApiKey) {
      setErrorMsg('กรุณาเชื่อมต่อ Gemini API Key ในขั้นตอน 01 ก่อน');
      return;
    }
    setAiLoading(true);
    setErrorMsg(null);
    try {
      const rec = await getRecommendedStructure(
        input.story,
        input.genres,
        input.moods,
        input.language,
        input.customLanguage
      );
      setAiRecommendation(rec);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถขอคำแนะนำโครงสร้างจาก AI ได้');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-hero-fade">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
          STEP 03
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
          03 โครงสร้างเพลง (Song Structure)
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          จัดลำดับส่วนของเพลงก่อนเริ่มเขียนเนื้อเพลง เพื่อให้ AI แต่งตามโครงสร้างที่คุณต้องการ
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CREATIVE DIRECTION & SOURCE BANNER */}
      <div className="p-5 rounded-2xl bg-[#0D0B14] border border-white/10 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">
              โครงสร้างเพลงปัจจุบัน
            </span>
          </div>

          {/* Status Badge */}
          {isUserExplicit ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-medium">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>User Selected (ผู้ใช้ปรับแต่งเอง)</span>
            </div>
          ) : isRefActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-medium">
              <Music2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reference Derived (จากเพลงอ้างอิง)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/40 text-purple-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Recommended (AI แนะนำ)</span>
            </div>
          )}
        </div>

        {/* Source description */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <p className="text-xs text-zinc-300">
            {isUserExplicit ? (
              <span>คุณได้ปรับแต่งโครงสร้างเพลงนี้ด้วยตนเอง AI จะยึดตามโครงสร้างนี้อย่างเคร่งครัด</span>
            ) : isRefActive ? (
              <span>
                {creativeDir.structure?.rationale || 'เลือกตามลักษณะการเล่าเรื่องและโครงสร้างของเพลงอ้างอิง'}
                {input.reference?.title ? ` (${input.reference.title})` : ''}
              </span>
            ) : (
              <span>
                {creativeDir.structure?.rationale || 'AI วิเคราะห์ Story และแนวเพลง เพื่อเลือกโครงสร้างการประพันธ์ที่เหมาะสมที่สุด'}
              </span>
            )}
          </p>

          {isUserExplicit && (
            <button
              type="button"
              onClick={handleResetToAiRecommendation}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-purple-300 hover:text-purple-200 transition-all flex items-center gap-1.5"
              title="ยกเลิกการปรับแต่งเองและกลับไปใช้โครงสร้างที่ AI หรือเพลงอ้างอิงแนะนำ"
            >
              <RotateCcw className="w-3 h-3 text-purple-400" />
              <span>คืนค่าโครงสร้างที่ AI / Reference แนะนำ</span>
            </button>
          )}
        </div>
      </div>

      {/* PRESETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-purple-400" />
            เลือกจากตัวอย่างโครงสร้าง (Presets)
          </h3>

          <button
            type="button"
            onClick={handleAiRecommend}
            disabled={aiLoading}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs text-cyan-300 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>✨ ให้ AI วิเคราะห์โครงสร้างเฉพาะเรื่องนี้</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.sections)}
              className="p-4 rounded-xl bg-[#0D0B14] border border-white/10 hover:border-purple-500/40 text-left transition-all hover:bg-white/[0.02] group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                  {preset.sections.length} Sections
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* AI RECOMMENDATION MODAL */}
      {aiRecommendation && (
        <div className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-4 animate-hero-fade">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              โครงสร้างที่ AI แนะนำสำหรับเพลงของคุณ
            </h4>
            <button
              onClick={() => setAiRecommendation(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 bg-[#08070D]/60 p-3 rounded-xl border border-white/5">
            💡 {aiRecommendation.reasoning}
          </p>

          <div className="flex flex-wrap gap-2 py-2">
            {aiRecommendation.structure.map((sec, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-mono text-purple-200"
              >
                {sec}
              </span>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAiRecommendation(null)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  structure: aiRecommendation.structure,
                  userExplicitSelections: { ...(input.userExplicitSelections || {}), structure: true },
                });
                setAiRecommendation(null);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ใช้โครงสร้างนี้</span>
            </button>
          </div>
        </div>
      )}

      {/* STRUCTURE EDITOR ROWS */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-400" />
            ลำดับส่วนของเพลงที่จะแต่ง ({sections.length} ส่วน)
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">
            สามารถเลื่อนลำดับ ลบ หรือเพิ่มตอนได้ตามต้องการ
          </span>
        </div>

        <div className="space-y-2">
          {sections.map((secName, index) => {
            const numStr = String(index + 1).padStart(2, '0');
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-[#12101A] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500 w-6">
                    {numStr}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-white font-mono">
                    {secName}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-white/5 transition-colors"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-white/5 transition-colors"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors ml-1"
                    title="ลบส่วนนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new section controls */}
        <div className="pt-4 border-t border-white/5 flex items-center gap-3 flex-wrap">
          <select
            value={selectedAddSection}
            onChange={(e) => setSelectedAddSection(e.target.value as SectionType)}
            className="bg-[#12101A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          >
            {AVAILABLE_SECTIONS.map((sec) => (
              <option key={sec} value={sec} className="bg-[#0D0B14]">
                {sec}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-medium text-purple-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มตอน</span>
          </button>
        </div>
      </div>

      {/* Next Step */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {sections.length} ส่วนเตรียมพร้อม
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-xl shadow-purple-950/40 transition-all flex items-center gap-2"
        >
          <span>ไปขั้นตอน 04 สร้างเพลง</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
