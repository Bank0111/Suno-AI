import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Key } from 'lucide-react';
import baseHeroImage from '../../assets/images/Base Image.png';
import revealHeroImage from '../../assets/images/Reveal Image.png';

interface LandingHeroProps {
  onStart: () => void;
  onOpenGuide: () => void;
  onOpenHistory?: () => void;
  onOpenSupport?: () => void;
  hasApiKey: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStart,
  onOpenGuide,
  onOpenHistory,
  onOpenSupport,
  hasApiKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mouseRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const currentOpacityRef = useRef(0);
  const [spotlightStyle, setSpotlightStyle] = useState<{ x: number; y: number; opacity: number }>({
    x: 0,
    y: 0,
    opacity: 0,
  });

  useEffect(() => {
    // Detect mobile or touch device without fine mouse pointer
    if (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    ) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseRef.current = { x, y };
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const containerEl = containerRef.current;
    window.addEventListener('mousemove', handleMouseMove);
    if (containerEl) {
      containerEl.addEventListener('mouseenter', handleMouseEnter);
      containerEl.addEventListener('mouseleave', handleMouseLeave);
    }

    let animationFrameId: number;
    const animate = () => {
      // Lerp/interpolation for silky smooth cursor movement
      currentPosRef.current.x += (mouseRef.current.x - currentPosRef.current.x) * 0.15;
      currentPosRef.current.y += (mouseRef.current.y - currentPosRef.current.y) * 0.15;

      // Smooth fade-out when cursor leaves hero container
      const targetOpacity = isHovered ? 1 : 0;
      currentOpacityRef.current += (targetOpacity - currentOpacityRef.current) * 0.1;

      setSpotlightStyle({
        x: currentPosRef.current.x,
        y: currentPosRef.current.y,
        opacity: currentOpacityRef.current,
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerEl) {
        containerEl.removeEventListener('mouseenter', handleMouseEnter);
        containerEl.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  // Exact radial mask formula specified:
  // center 100%, 40% 100%, 60% 75%, 75% 40%, 88% 12%, 100% 0%
  const radialMaskCss = `radial-gradient(circle 260px at ${spotlightStyle.x}px ${spotlightStyle.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.40) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#08070D] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-[#F5F3FA] select-none"
    >
      {/* LAYER 1: Base Image (Main Background) */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${baseHeroImage})`,
        }}
      />

      {/* LAYER 2: Reveal Image (Cursor Spotlight Layer) */}
      {!isTouchDevice && (
        <div
          className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat pointer-events-none transition-opacity duration-150"
          style={{
            backgroundImage: `url(${revealHeroImage})`,
            WebkitMaskImage: radialMaskCss,
            maskImage: radialMaskCss,
            opacity: spotlightStyle.opacity,
          }}
        />
      )}

      {/* LAYER 3: Dark Gradient Overlay (Ensures text legibility) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isTouchDevice
            ? 'linear-gradient(to right, rgba(8, 7, 13, 0.98) 0%, rgba(8, 7, 13, 0.88) 45%, rgba(8, 7, 13, 0.6) 75%, rgba(8, 7, 13, 0.3) 100%)'
            : 'linear-gradient(to right, rgba(8, 7, 13, 0.96) 0%, rgba(8, 7, 13, 0.82) 40%, rgba(8, 7, 13, 0.45) 70%, rgba(8, 7, 13, 0.15) 100%)',
        }}
      />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#08070D]/80 via-transparent to-[#08070D]/90" />

      {/* Top Floating Nav */}
      <nav className="relative z-20 flex items-center justify-between max-w-7xl w-full mx-auto animate-hero-fade">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00D9FF]" />
          <span className="text-sm font-semibold tracking-wider uppercase opacity-90 text-white">
            Intelligent AI Song Writer
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium tracking-wide">
          {onOpenHistory && (
            <button
              id="btn-hero-history"
              onClick={onOpenHistory}
              className="text-white/80 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>ประวัติ</span>
            </button>
          )}
          <button
            onClick={onStart}
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
          {onOpenSupport && (
            <button
              onClick={onOpenSupport}
              className="text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>สนับสนุน</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <button
            onClick={onStart}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all cursor-pointer"
          >
            เริ่มต้นใช้งาน
          </button>
        </div>
      </nav>

      {/* Center Main Hero Content */}
      <main className="relative z-20 flex-1 flex items-center max-w-7xl w-full mx-auto py-12">
        {/* Left Editorial Copy */}
        <div className="max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6 animate-hero-reveal">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Songwriting Engine for Suno</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[88px] leading-[1.05] font-bold tracking-tight mb-8 text-white animate-hero-reveal">
            Turn your{' '}
            <span className="font-playfair italic font-normal text-purple-300 pr-1.5">
              story
            </span>
            <br />
            into a song.
          </h1>

          <p className="text-base sm:text-lg text-[#9B96A8] leading-relaxed max-w-2xl mb-8 font-kanit font-light animate-hero-fade">
            <span>เปลี่ยนเรื่องราว ความรู้สึก และไอเดียของคุณให้กลายเป็นเพลง</span>
            <span className="block text-sm sm:text-base text-[#7A7585] font-sans mt-1">
              Intelligent AI Songwriting helps you turn emotions into structured lyrics ready for Suno.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 animate-hero-fade-delayed">
            <button
              onClick={onStart}
              className="btn-primary text-base sm:text-lg px-8 py-3.5 flex items-center justify-center gap-2.5 cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-4 text-xs tracking-wider uppercase text-[#9B96A8] font-mono">
              <div className="h-[1px] w-10 bg-white/20" />
              <span>BRING YOUR OWN GEMINI API KEY</span>
              {hasApiKey ? (
                <span className="text-emerald-400 font-sans font-semibold flex items-center gap-1">
                  ✓ CONNECTED
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Step Rail */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto pt-6 border-t border-white/10 animate-hero-fade">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex flex-col gap-1 cursor-pointer" onClick={onStart}>
              <span className="rail-number active-step uppercase">01 CONNECT</span>
              <div className="h-[2px] w-full bg-cyan-400" />
            </div>
            <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={onStart}>
              <span className="rail-number uppercase">02 STORY</span>
              <div className="h-[2px] w-full bg-white/10" />
            </div>
            <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={onStart}>
              <span className="rail-number uppercase">03 STRUCTURE</span>
              <div className="h-[2px] w-full bg-white/10" />
            </div>
            <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={onStart}>
              <span className="rail-number uppercase">04 CREATE</span>
              <div className="h-[2px] w-full bg-white/10" />
            </div>
            <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={onStart}>
              <span className="rail-number uppercase">05 LYRICS</span>
              <div className="h-[2px] w-full bg-white/10" />
            </div>
            <div className="flex flex-col gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={onStart}>
              <span className="rail-number uppercase">06 EXPORT</span>
              <div className="h-[2px] w-full bg-white/10" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] tracking-widest text-[#9B96A8] uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-amber-400/80'
                }`}
              />
              <span>{hasApiKey ? 'เชื่อมต่อ Gemini AI แล้ว' : 'ต้องใช้ Gemini Key'}</span>
            </div>
            <span>|</span>
            <span>SONGWRITING STUDIO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

