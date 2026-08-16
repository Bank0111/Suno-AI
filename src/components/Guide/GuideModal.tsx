import React from 'react';
import {
  X,
  BookOpen,
  Key,
  ExternalLink,
  Music,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-hero-fade">
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              How to use Intelligent AI Song Writer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 leading-relaxed font-kanit">
          {/* Quick Steps Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
            {[
              '01 Connect Gemini',
              '02 Tell your story',
              '03 Song structure',
              '04 Generate song',
              '05 Lyric sheet',
              '06 Export YouTube',
            ].map((step, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#12101A] border border-white/5 text-[11px] text-purple-300"
              >
                {step}
              </div>
            ))}
          </div>

          {/* Detailed Sections */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" />
                01 Gemini API Key คืออะไร?
              </h4>
              <p className="text-zinc-400">
                แอปนี้ทำงานผ่าน Gemini API ของผู้ใช้เอง ปลอดภัย ไม่เก็บข้อมูลลงฐานข้อมูล
                คุณสามารถขอ API Key ฟรีได้จาก{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-cyan-400 underline inline-flex items-center gap-0.5"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                02 การเขียน Prompt & เรื่องราว (Story)
              </h4>
              <p className="text-zinc-400">
                พิมพ์เล่าฉาก ตัวละคร ความสัมพันธ์ อารมณ์ หรือจุดเปลี่ยนในชีวิต ยิ่งให้รายละเอียดคมชัด
                AI จะยิ่งสร้างเนื้อเพลงที่มีมิติ ไม่ซ้ำซาก คุณสามารถใช้ปุ่ม 🎲 สุ่มเรื่องราว หรือ ✨ ขยายไอเดีย ได้
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                03 โครงสร้างเพลง (Song Structure)
              </h4>
              <p className="text-zinc-400">
                กำหนดลำดับส่วน เช่น Intro → Verse → Pre-Chorus → Chorus → Bridge → Outro
                หรือใช้ปุ่ม ✨ ให้ AI แนะนำโครงสร้างตามเรื่องราวและแนวเพลงของคุณ
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                04-05 Suno Style Prompt & Lyric Sheet
              </h4>
              <p className="text-zinc-400">
                เมื่อแต่งเนื้อเพลงเสร็จ คุณจะได้ <strong className="text-cyan-300">Style Prompt ภาษาอังกฤษ</strong> (เช่น Genre, Mood, Vocal character) นำไปวางในช่อง Style of Music ของ Suno และนำ <strong className="text-purple-300">Lyrics Sheet</strong> ไปวางในช่อง Lyrics
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                06 SRT Timing & YouTube Export
              </h4>
              <p className="text-zinc-400">
                ไฟล์คำบรรยาย (.srt) คำนวณเวลาการขึ้นบรรทัดแบบกะประมาณจากจังหวะเนื้อเพลง ควรถือเป็นแนวทาง และปรับแต่งจังหวะจริงให้ตรงกับไฟล์เสียงที่คุณเจนได้จาก Suno ก่อนนำขึ้น YouTube
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#08070D] flex justify-between items-center">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-cyan-400 inline-flex items-center gap-1"
          >
            Get Gemini API Key <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
