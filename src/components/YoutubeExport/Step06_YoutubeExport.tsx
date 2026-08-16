import React, { useState } from 'react';
import {
  FileVideo,
  Download,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Sparkles,
  Loader2,
  FileText,
  Youtube,
  Music,
} from 'lucide-react';
import { SongResult, YouTubeInfo } from '../../types/songwriting';
import { generateSrt, downloadFile } from '../../utils/srt';
import { generateYouTubeInfo } from '../../services/youtube';

interface Step06Props {
  songResult: SongResult | null;
  hasApiKey: boolean;
  onGoToStep05: () => void;
}

export const Step06YoutubeExport: React.FC<Step06Props> = ({
  songResult,
  hasApiKey,
  onGoToStep05,
}) => {
  const [srtContent, setSrtContent] = useState<string>('');
  const [copiedSrt, setCopiedSrt] = useState(false);

  // YouTube Info State
  const [ytLoading, setYtLoading] = useState(false);
  const [ytInfo, setYtInfo] = useState<YouTubeInfo | null>(null);
  const [copiedYt, setCopiedYt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If no song result from Step 05
  if (!songResult) {
    return (
      <div className="max-w-2xl mx-auto w-full text-center py-16 px-6 bg-[#0D0B14] border border-white/10 rounded-2xl space-y-4 animate-hero-fade">
        <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-white">ยังไม่มีเนื้อเพลงที่สร้างเสร็จ</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          แต่งเพลงในขั้นตอน 05 ให้เสร็จก่อน จึงจะสามารถสร้างไฟล์คำบรรยาย (.srt) และคำโปรยสำหรับ YouTube ได้
        </p>
        <button
          type="button"
          onClick={onGoToStep05}
          className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg"
        >
          ไปขั้นตอน 05 LYRIC SHEET
        </button>
      </div>
    );
  }

  // Generate SRT
  const handleGenerateSrt = () => {
    const srtText = generateSrt(songResult.sections);
    setSrtContent(srtText);
  };

  // Download SRT
  const handleDownloadSrt = () => {
    const textToDownload = srtContent || generateSrt(songResult.sections);
    const cleanTitle = songResult.title.replace(/[^\w\sก-๙]/gi, '').replace(/\s+/g, '_');
    downloadFile(`${cleanTitle}_subtitle.srt`, textToDownload, 'text/plain;charset=utf-8');
  };

  // Copy SRT
  const handleCopySrt = () => {
    const textToCopy = srtContent || generateSrt(songResult.sections);
    navigator.clipboard.writeText(textToCopy);
    setCopiedSrt(true);
    setTimeout(() => setCopiedSrt(false), 2000);
  };

  // Generate YouTube Info
  const handleGenerateYtInfo = async () => {
    if (!hasApiKey) {
      setErrorMsg('กรุณาเชื่อมต่อ Gemini API Key ในขั้นตอน 01 ก่อน');
      return;
    }

    setYtLoading(true);
    setErrorMsg(null);

    try {
      const info = await generateYouTubeInfo(
        songResult.title,
        songResult.stylePrompt,
        songResult.fullLyricsFormatted
      );
      setYtInfo(info);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถสร้างข้อมูล YouTube ได้');
    } finally {
      setYtLoading(false);
    }
  };

  // Copy YT Description
  const handleCopyYt = () => {
    if (!ytInfo) return;
    const fullText = `${ytInfo.title}

${ytInfo.description}

${ytInfo.hashtags.join(' ')}`;

    navigator.clipboard.writeText(fullText);
    setCopiedYt(true);
    setTimeout(() => setCopiedYt(false), 2000);
  };

  // Download YT Description .txt
  const handleDownloadYtTxt = () => {
    if (!ytInfo) return;
    const fullText = `YouTube Title:
${ytInfo.title}

Description:
${ytInfo.description}

Hashtags:
${ytInfo.hashtags.join(' ')}`;

    const cleanTitle = songResult.title.replace(/[^\w\sก-๙]/gi, '').replace(/\s+/g, '_');
    downloadFile(`${cleanTitle}_youtube_description.txt`, fullText, 'text/plain;charset=utf-8');
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-hero-fade">
      {/* Title */}
      <div className="border-b border-white/10 pb-5">
        <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
          STEP 06
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
          06 EXPORT สำหรับยูทูป (YouTube Export)
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          สร้างไฟล์คำบรรยาย (.srt) และคำโปรยรายละเอียดสไตล์มืออาชีพพร้อมเผยแพร่
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* 1. SRT SUBTITLE GENERATOR */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileVideo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              🎬 สร้างไฟล์คำบรรยาย SRT
            </h3>
            <p className="text-xs text-zinc-400">
              สร้างไฟล์ Subtitle จากเนื้อเพลงในขั้นตอน 05 โดยระบบจะประมาณจังหวะคำให้อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button
            type="button"
            onClick={handleGenerateSrt}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ สร้างไฟล์คำบรรยาย SRT</span>
          </button>

          {srtContent && (
            <>
              <button
                type="button"
                onClick={handleDownloadSrt}
                className="px-5 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-medium text-purple-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด .srt</span>
              </button>

              <button
                type="button"
                onClick={handleCopySrt}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-all flex items-center gap-2 cursor-pointer"
              >
                {copiedSrt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>คัดลอก SRT แล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SRT Text</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* SRT Preview Box */}
        {srtContent && (
          <div className="space-y-2 pt-2 animate-hero-fade">
            <span className="text-[11px] font-mono text-zinc-400">
              SRT Preview (ตัวอย่างไฟล์ SRT ที่สร้างขึ้น):
            </span>
            <pre className="p-4 rounded-xl bg-[#08070D] border border-white/10 font-mono text-xs text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {srtContent}
            </pre>
          </div>
        )}

        {/* Timing Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300/90 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-200">ข้อควรทราบ:</p>
            <p>
              หมายเหตุ: เวลาใน SRT เป็นการประมาณจากจังหวะของเนื้อเพลง
              ควรตรวจและปรับ timing ให้ตรงกับไฟล์เสียงจริงก่อนเผยแพร่
            </p>
          </div>
        </div>
      </div>

      {/* 2. YOUTUBE DESCRIPTION GENERATOR */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                📝 สร้างคำโปรยยูทูป (YouTube Description)
              </h3>
              <p className="text-xs text-zinc-400">
                สร้างชื่อคลิป คำอธิบาย และแฮชแท็กโดยอัตโนมัติจากบทเพลงของคุณ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateYtInfo}
            disabled={ytLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {ytLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังสร้างคำโปรย...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>สร้างคำโปรยยูทูป</span>
              </>
            )}
          </button>
        </div>

        {/* Display YouTube Details */}
        {ytInfo && (
          <div className="space-y-6 pt-2 animate-hero-fade">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">
                YouTube Title:
              </label>
              <div className="p-3.5 rounded-xl bg-[#12101A] border border-white/10 font-semibold text-sm text-white">
                {ytInfo.title}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">
                YouTube Description:
              </label>
              <div className="p-4 rounded-xl bg-[#12101A] border border-white/10 text-xs text-zinc-200 leading-relaxed font-kanit whitespace-pre-wrap select-all">
                {ytInfo.description}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">
                Hashtags:
              </label>
              <div className="flex flex-wrap gap-2">
                {ytInfo.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-purple-900/30 border border-purple-500/20 text-xs font-mono text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Copy / Download txt actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyYt}
                className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-all flex items-center gap-2"
              >
                {copiedYt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>คัดลอกทั้งหมดแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadYtTxt}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-medium transition-all flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
