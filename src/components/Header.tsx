import React from 'react';
import { Key, BookOpen, Music, CheckCircle2, History } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
  onOpenGuide: () => void;
  onOpenApiKeyModal: () => void;
  onOpenHistory: () => void;
  historyCount?: number;
  hasApiKey: boolean;
  onReturnToHero: () => void;
}

const STEP_NAMES = [
  '01 API KEY',
  '02 IDEA',
  '03 STRUCTURE',
  '04 CREATE',
  '05 LYRICS',
  '06 EXPORT',
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  onOpenGuide,
  onOpenApiKeyModal,
  onOpenHistory,
  historyCount = 0,
  hasApiKey,
  onReturnToHero,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#08070D]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
          <button
            onClick={onReturnToHero}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] flex items-center justify-center shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#08070D] rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-wide text-white whitespace-nowrap">
                Intelligent AI Song Writer
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                STUDIO
              </span>
            </div>
          </button>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="btn-mobile-history"
              onClick={onOpenHistory}
              className="p-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1 relative"
              title="ประวัติเพลง"
            >
              <History className="w-4 h-4 text-purple-400" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[9px] font-mono text-white flex items-center justify-center">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenGuide}
              className="p-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
              title="Guide"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenApiKeyModal}
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                hasApiKey
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-purple-500/40 bg-purple-500/10 text-purple-300 animate-pulse'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>{hasApiKey ? 'Connected' : 'Key'}</span>
            </button>
          </div>
        </div>

        {/* Progress Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar py-1 px-1 bg-[#0D0B14] rounded-full border border-white/10 text-xs shrink-0">
          {STEP_NAMES.map((name, index) => {
            const stepNum = index + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <button
                key={name}
                onClick={() => onSelectStep(stepNum)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 font-semibold'
                    : isCompleted
                    ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                <span>{name}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            id="btn-desktop-history"
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white rounded-full hover:bg-white/5 transition-colors flex items-center gap-1.5 border border-white/5 hover:border-white/15 whitespace-nowrap cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>ประวัติ</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white rounded-full hover:bg-white/5 transition-colors flex items-center gap-1.5 border border-white/5 hover:border-white/15 whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Guide</span>
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              hasApiKey
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span>{hasApiKey ? 'API Connected' : 'Connect Gemini API'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

