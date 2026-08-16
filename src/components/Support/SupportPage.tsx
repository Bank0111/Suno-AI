import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  Server,
  Code,
  Cpu,
  Heart,
} from 'lucide-react';
import { supportConfig } from '../../config/support';
import { SupportQRCode } from './SupportQRCode';

interface SupportPageProps {
  onBackToHome: () => void;
  onGoToStudio: () => void;
  onOpenGuide: () => void;
  onOpenHistory?: () => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({
  onBackToHome,
  onGoToStudio,
  onOpenGuide,
  onOpenHistory,
}) => {
  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FA] flex flex-col justify-between selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Floating Nav */}
      <header className="sticky top-0 z-40 bg-[#08070D]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] flex items-center justify-center shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#08070D] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-wide text-white whitespace-nowrap">
                Intelligent AI Song Writer
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                SUPPORT
              </span>
            </div>
          </button>

          {/* Nav Controls */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium tracking-wide">
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-white/80 hover:text-purple-300 transition-colors hidden sm:block cursor-pointer"
              >
                ประวัติ
              </button>
            )}
            <button
              onClick={onGoToStudio}
              className="text-white/80 hover:text-cyan-400 transition-colors hidden sm:block cursor-pointer"
            >
              สตูดิโอ
            </button>
            <button
              onClick={onOpenGuide}
              className="text-white/80 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              คู่มือ
            </button>
            <button
              onClick={onBackToHome}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>หน้าแรก</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>SUPPORT THE PROJECT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
            ช่วยให้ Intelligent AI Song Writer <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              พัฒนาและเติบโตต่อไป
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#9B96A8] leading-relaxed max-w-4xl mx-auto font-kanit font-light whitespace-normal sm:whitespace-nowrap">
            “โปรเจกต์นี้สร้างขึ้นเพื่อช่วยเปลี่ยนเรื่องราว ความรู้สึก และไอเดียของคุณให้กลายเป็นเพลง ด้วย AI”
          </p>
        </section>

        {/* QR CODE COMPONENT */}
        <section className="w-full mb-16 flex justify-center">
          <SupportQRCode
            qrImage={supportConfig.qrImage}
            paymentMethod={supportConfig.paymentMethod}
            recipientName={supportConfig.recipientName}
            promptPayId={supportConfig.promptPayId}
          />
        </section>

        {/* WHAT SUPPORT HELPS WITH (3 CARDS) */}
        <section className="w-full mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">การสนับสนุนของคุณช่วยขับเคลื่อนอะไรบ้าง</h3>
            <p className="text-xs text-zinc-400">ทุกการสนับสนุนนำไปใช้ในการพัฒนาและดูแลระบบอย่างต่อเนื่อง</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: AI API */}
            <div className="p-6 rounded-2xl bg-[#0D0B14] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-300">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">AI API & Models</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                สนับสนุนค่าบริการ Model Routing, การทดสอบโมเดลการประพันธ์เพลงใหม่ๆ และการพัฒนา Context Analysis Engine
              </p>
            </div>

            {/* Card 2: Development */}
            <div className="p-6 rounded-2xl bg-[#0D0B14] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-300">
                <Code className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Feature Development</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                วิจัยและพัฒนาฟีเจอร์สัมผัสภาษาไทย (Rhyme Engine), Sound Direction, Story Blueprint และ Suno Structure Generator
              </p>
            </div>

            {/* Card 3: Infrastructure */}
            <div className="p-6 rounded-2xl bg-[#0D0B14] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-300">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Infrastructure & Hosting</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                การดูแล Server, ระบบ Persistent History, ความเสถียรของแอปพลิเคชัน และความเร็วในการตอบสนอง
              </p>
            </div>
          </div>
        </section>

        {/* THANK YOU SECTION */}
        <section className="text-center max-w-xl mx-auto py-6">
          <div className="w-12 h-12 rounded-full bg-purple-900/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Heart className="w-5 h-5 fill-purple-400/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Every song starts with an idea.</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">
            Thank you for helping us build the tools that turn ideas into music.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Intelligent AI Song Writer &copy; 2026</span>
          <button
            onClick={onGoToStudio}
            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            เข้าสู่ระบบสร้างเพลง (Studio) &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
};
