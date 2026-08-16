import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  RotateCcw,
  Eye,
  Calendar,
  Clock,
  Music,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Play,
  FileText,
  Radio,
  Sliders,
} from 'lucide-react';
import { HistoryRecord } from '../../types/history';
import { SongInput, SongResult } from '../../types/songwriting';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  onUseAgain: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onUseAgain,
  onDeleteRecord,
  onClearAll,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      id="history-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-hero-fade"
    >
      <div
        id="history-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0B14] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#F5F3FA]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12101A]">
          <div className="flex items-center gap-3">
            {selectedRecord ? (
              <button
                id="btn-back-to-history-list"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับหน้ารายการ</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <History className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                {selectedRecord ? selectedRecord.title : 'ประวัติเพลงที่สร้าง (Song History)'}
                {!selectedRecord && records.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 font-mono">
                    {records.length} เพลง
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                {selectedRecord
                  ? `บันทึกเมื่อ ${formatDate(selectedRecord.createdAt)} • ${formatTime(
                      selectedRecord.createdAt
                    )}`
                  : 'รายการเพลงและไอเดียทั้งหมดที่บันทึกไว้ในอุปกรณ์ของคุณ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedRecord && records.length > 0 && (
              <button
                id="btn-clear-all-history"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ล้างทั้งหมด</span>
              </button>
            )}
            <button
              id="btn-close-history-modal"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div
            id="clear-all-confirmation"
            className="p-4 bg-rose-950/40 border-b border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติเพลงทั้งหมด ({records.length} รายการ)? การกระทำนี้ไม่สามารถย้อนกลับได้
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-cancel-clear-all"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ยกเลิก
              </button>
              <button
                id="btn-confirm-clear-all"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                  setSelectedRecord(null);
                }}
                className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors"
              >
                ยืนยันลบทั้งหมด
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedRecord ? (
            /* DETAIL VIEW OF SINGLE RECORD */
            <div id="history-record-detail" className="space-y-6 animate-hero-fade">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
                    TARGET CONTENT LANGUAGE: {selectedRecord.language}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedRecord.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-use-again-from-detail"
                    onClick={() => {
                      onUseAgain(selectedRecord);
                      onClose();
                    }}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ใช้ซ้ำเพลงนี้ (Restore)</span>
                  </button>
                </div>
              </div>

              {/* Story Prompt */}
              <div className="bg-[#12101A] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <FileText className="w-3.5 h-3.5" />
                    STORY / พล็อตเรื่อง
                  </span>
                  <button
                    onClick={() => handleCopy(selectedRecord.story, 'story')}
                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'story' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedType === 'story' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-kanit">
                  {selectedRecord.story || '-'}
                </p>
              </div>

              {/* Musical Configuration Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#12101A] border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Genre</span>
                  <p className="font-medium text-zinc-200 truncate">
                    {selectedRecord.genre.join(', ') || '-'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#12101A] border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Mood</span>
                  <p className="font-medium text-zinc-200 truncate">
                    {selectedRecord.mood.join(', ') || '-'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#12101A] border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Tempo & BPM</span>
                  <p className="font-medium text-zinc-200 truncate">
                    {selectedRecord.bpm ? `${selectedRecord.bpm} BPM` : selectedRecord.tempo || '-'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#12101A] border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Vocal</span>
                  <p className="font-medium text-zinc-200 truncate">
                    {selectedRecord.vocalType || '-'}
                  </p>
                </div>
              </div>

              {/* Reference Details (if present) */}
              {selectedRecord.reference?.title && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    ACTIVE REFERENCE INSPIRATION
                  </span>
                  <p className="font-medium text-zinc-200">
                    {selectedRecord.reference.title}{' '}
                    {selectedRecord.reference.artist && `— ${selectedRecord.reference.artist}`}
                  </p>
                </div>
              )}

              {/* Structure */}
              <div className="bg-[#12101A] border border-white/10 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  SONG STRUCTURE
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.structure.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-purple-900/30 text-purple-200 border border-purple-500/20"
                    >
                      {idx + 1}. {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suno Style Prompt */}
              <div className="bg-[#12101A] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    SUNO STYLE PROMPT
                  </span>
                  <button
                    onClick={() => handleCopy(selectedRecord.stylePrompt, 'stylePrompt')}
                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'stylePrompt' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedType === 'stylePrompt' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-purple-200 select-all">
                  {selectedRecord.stylePrompt || '-'}
                </div>
              </div>

              {/* Full Lyrics */}
              <div className="bg-[#12101A] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Music className="w-3.5 h-3.5" />
                    FULL LYRICS
                  </span>
                  <button
                    onClick={() => handleCopy(selectedRecord.lyrics, 'lyrics')}
                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'lyrics' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedType === 'lyrics' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-black/40 border border-white/5 font-kanit text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {selectedRecord.lyrics || '-'}
                </pre>
              </div>
            </div>
          ) : records.length === 0 ? (
            /* EMPTY STATE */
            <div
              id="history-empty-state"
              className="text-center py-16 px-4 space-y-4 max-w-sm mx-auto animate-hero-fade"
            >
              <div className="w-14 h-14 rounded-full bg-purple-900/20 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <History className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">ยังไม่มีประวัติเพลง</h3>
                <p className="text-xs text-zinc-400">
                  เมื่อคุณสร้างเพลงในสตูดิโอ ระบบจะบันทึกเพลง โครงสร้าง และบริบททั้งหมดไว้ที่นี่โดยอัตโนมัติ
                </p>
              </div>
            </div>
          ) : (
            /* LIST OF HISTORY RECORDS */
            <div id="history-record-list" className="space-y-3">
              {records.map((record) => {
                const isConfirmingDelete = deletingId === record.id;

                return (
                  <div
                    key={record.id}
                    id={`history-item-${record.id}`}
                    className="group relative p-4 rounded-xl bg-[#12101A] hover:bg-[#161421] border border-white/10 hover:border-purple-500/30 transition-all duration-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Left Title & Tags */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {record.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-900/40 text-purple-300 border border-purple-500/20 shrink-0">
                            {record.language || 'ไทย'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                          <span className="text-cyan-400 font-medium">
                            {record.genre.slice(0, 2).join(', ')}
                          </span>
                          <span>•</span>
                          <span>{record.mood.slice(0, 2).join(', ')}</span>
                          {record.bpm && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px]">{record.bpm} BPM</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{formatDate(record.createdAt)}</span>
                          <span className="text-zinc-600">|</span>
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{formatTime(record.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-[11px] text-zinc-500 line-clamp-1 max-w-md italic font-kanit">
                        "{record.story ? record.story.slice(0, 80) + '...' : '-'}"
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/60 p-1 rounded-lg border border-rose-500/30">
                            <span className="text-[10px] text-rose-300 px-1">ลบ?</span>
                            <button
                              id={`btn-confirm-delete-${record.id}`}
                              onClick={() => {
                                onDeleteRecord(record.id);
                                setDeletingId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white"
                            >
                              ยืนยัน
                            </button>
                            <button
                              id={`btn-cancel-delete-${record.id}`}
                              onClick={() => setDeletingId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              id={`btn-view-details-${record.id}`}
                              onClick={() => setSelectedRecord(record)}
                              className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              <span>ดูรายละเอียด</span>
                            </button>

                            <button
                              id={`btn-use-again-${record.id}`}
                              onClick={() => {
                                onUseAgain(record);
                                onClose();
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                              title="ใช้ซ้ำเพลงนี้"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>ใช้ซ้ำ</span>
                            </button>

                            <button
                              id={`btn-delete-${record.id}`}
                              onClick={() => setDeletingId(record.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="ลบเพลงนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#12101A] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <span>Persistent Storage Active</span>
          </div>
          <button
            id="btn-footer-close"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
