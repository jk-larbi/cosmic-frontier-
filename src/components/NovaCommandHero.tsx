import { useState, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  ArrowUpRight, 
  ChevronRight, 
  Layers, 
  Sparkles,
  Telescope,
  Orbit,
  ArrowDown
} from 'lucide-react';

interface NovaCommandHeroProps {
  onNavigate: (page: AppPage) => void;
}

export const NovaCommandHero: FC<NovaCommandHeroProps> = ({ onNavigate }) => {
  const [activeTarget, setActiveTarget] = useState<'planet-x' | 'spherex' | 'saturn'>('planet-x');

  return (
    <section className="relative w-full min-h-[96vh] bg-[#030712] text-[#F8FAFC] overflow-hidden rounded-3xl border border-[#1E293B]/80 shadow-2xl p-4 sm:p-8 lg:p-10 flex flex-col justify-between">
      {/* Background Starfield & Subtle Nebular Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial atmospheric glow centered behind celestial world */}
        <div className="absolute right-0 top-1/6 w-175 h-175 bg-[radial-gradient(circle,rgba(56,189,248,0.18)_0%,rgba(14,165,233,0.06)_40%,transparent_75%)] rounded-full blur-[100px]" />
        <div className="absolute left-10 bottom-1/4 w-125 h-125 bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] rounded-full blur-[120px]" />
        
        {/* Fine cosmic grid & starlight texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.035]" />
        
        {/* Subtle ambient star points */}
        <div className="absolute top-12 left-1/4 w-1 h-1 rounded-full bg-white opacity-60 animate-pulse" />
        <div className="absolute top-1/3 left-1/6 w-1 h-1 rounded-full bg-[#38BDF8] opacity-70" />
        <div className="absolute top-20 right-1/3 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-[#8B5CF6] opacity-60 animate-pulse" />
      </div>

      {/* LEFT SCI-FI HUD RAIL (NOVA Signature Detail) */}
      <div className="hidden 2xl:flex flex-col items-center gap-3 absolute left-4 top-1/2 -translate-y-1/2 z-20 text-[#64748B] pointer-events-none select-none">
        <div className="w-0.5 h-10 rounded-full bg-[#1E293B]" />
        <div className="w-1.5 h-1.5 rounded-full border border-[#38BDF8]/60 bg-[#0B1329]" />
        <div className="w-0.5 h-16 rounded-full bg-linear-to-b from-[#38BDF8] via-[#1E293B] to-transparent" />
        <div className="text-[8px] font-mono tracking-widest text-[#475569] [writing-mode:vertical-lr] rotate-180">
          SYS.7
        </div>
        <div className="w-1.5 h-1.5 rounded-full border border-[#38BDF8]/60 bg-[#0B1329]" />
        <div className="w-0.5 h-10 rounded-full bg-[#1E293B]" />
      </div>

      {/* TOP COMMAND BAR */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1E293B]/60">
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B1329] border border-[#38BDF8]/40 flex items-center justify-center shadow-lg shadow-[#38BDF8]/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#38BDF8]">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="font-mono font-black text-lg tracking-[0.2em] text-[#F8FAFC]">
              COSMIC FRONTIER
            </span>
            <span className="hidden sm:inline-block ml-2 text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              NASA SPACE APPS 2026
            </span>
          </div>
        </div>

        {/* Center Pill Nav Bar (Exact NOVA Pill Style) */}
        <nav className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-[#0B1329]/80 border border-[#1E293B] backdrop-blur-md text-xs font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-1.5 rounded-full bg-[#1E293B] text-[#F8FAFC] shadow-sm font-semibold cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('observatory')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#38BDF8] transition-colors cursor-pointer"
          >
            Observatory
          </button>
          <button
            onClick={() => onNavigate('planet-x')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#8B5CF6] transition-colors cursor-pointer"
          >
            Planet X
          </button>
          <button
            onClick={() => onNavigate('asteroid-watch')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Asteroids
          </button>
          <button
            onClick={() => onNavigate('galaxies')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Galaxies
          </button>
          <button
            onClick={() => onNavigate('spherex')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            SPHEREx
          </button>
          <button
            onClick={() => onNavigate('universe')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            3D Solar System
          </button>
          <button
            onClick={() => onNavigate('ai-guide')}
            className="px-3 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#F5C451]" />
            <span>AI Guide</span>
          </button>
        </nav>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1329] border border-[#1E293B] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[#34D399] font-semibold">LIVE HUD</span>
          </div>
        </div>
      </div>

      {/* MAIN HERO INTERIOR (Typography + Planet Artwork + Vertical Telemetry) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 lg:py-12">
        {/* LEFT COLUMN (6 Cols): Typography & High-Impact CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1329] border border-[#1E293B] text-xs font-mono text-[#A7B4CC]">
            <span>SYSTEM STATUS</span>
            <span className="text-[#10B981] font-bold">● NOMINAL</span>
          </div>

          {/* Monumental Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-[#F8FAFC] leading-[1.05]">
              The Universe Is Waiting
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC]">
                to Be Explored.
              </span>
            </h1>
          </div>

          <p className="max-w-xl text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Explore distant galaxies, investigate the outer Solar System, and uncover the science behind our cosmic neighbourhood.
          </p>

          {/* Two Prominent Action Buttons (White primary + Dark secondary with icon) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('observatory')}
              className="px-7 py-3.5 rounded-full bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#030712] font-bold text-sm tracking-wide shadow-2xl hover:shadow-[#38BDF8]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore the Observatory</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate('planet-x')}
              className="px-6 py-3.5 rounded-full bg-[#0B1329]/90 hover:bg-[#131D38] text-[#F8FAFC] border border-[#38BDF8]/40 hover:border-[#38BDF8] font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <span>Discover Planet X</span>
              <span className="text-[#38BDF8] text-base font-bold">+</span>
            </button>
          </div>
        </div>

        {/* CENTER/RIGHT COLUMN (5 Cols): Glowing Exoplanet/World Artwork */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-105 aspect-square flex items-center justify-center">
            {/* Target World Floating Badge (Exactly like NOVA 'TARGET: KEPLER-186F') */}
            <div className="absolute top-4 right-2 sm:right-6 z-20 p-3 rounded-2xl bg-[#070D1E]/85 border border-[#38BDF8]/40 backdrop-blur-xl shadow-2xl space-y-0.5">
              <span className="text-[9px] font-mono uppercase text-[#A7B4CC] tracking-wider block">
                TARGET WORLD
              </span>
              <h4 className="text-sm font-mono font-bold text-[#F8FAFC]">
                {activeTarget === 'planet-x' ? 'PLANET X [HYPOTHETICAL]' : activeTarget === 'saturn' ? 'SATURN (SOL VI)' : 'SPHEREx MIDEX'}
              </h4>
              <span className="text-[10px] font-mono text-[#38BDF8] block">
                {activeTarget === 'planet-x' ? 'DISTANCE: ~420 AU' : activeTarget === 'saturn' ? 'DISTANCE: 9.58 AU' : '102 SPECTRAL CHANNELS'}
              </span>
            </div>

            {/* Glowing Celestial Body SVG Illustration (Top-Right Illumination matching NOVA reference) */}
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible drop-shadow-[0_0_60px_rgba(56,189,248,0.28)]">
              <defs>
                {/* Sunlight from Upper-Right Radial Gradient */}
                <radialGradient id="novaPlanetBody" cx="72%" cy="28%" r="75%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="15%" stopColor="#BAE6FD" />
                  <stop offset="35%" stopColor="#38BDF8" />
                  <stop offset="60%" stopColor="#0369A1" />
                  <stop offset="85%" stopColor="#081E48" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                {/* Atmospheric Rim Glow on Upper-Right Limb */}
                <radialGradient id="atmoGlow" cx="70%" cy="30%" r="55%">
                  <stop offset="65%" stopColor="#38BDF8" stopOpacity="0" />
                  <stop offset="88%" stopColor="#38BDF8" stopOpacity="0.45" />
                  <stop offset="98%" stopColor="#7DD3FC" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </radialGradient>

                {/* Sunlit Crescent Bloom Filter */}
                <filter id="crescentBloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Asteroid Debris / Tiny Particles */}
              <circle cx="50" cy="80" r="1.5" fill="#E2E8F0" opacity="0.6" />
              <circle cx="340" cy="60" r="2" fill="#38BDF8" opacity="0.8" />
              <circle cx="370" cy="190" r="1" fill="#FFFFFF" opacity="0.5" />
              <circle cx="70" cy="320" r="2" fill="#8B5CF6" opacity="0.6" />
              <circle cx="320" cy="350" r="1.5" fill="#38BDF8" opacity="0.7" />

              {/* Distant Orbit Ring 1 (Back arc) */}
              <ellipse
                cx="200"
                cy="200"
                rx="195"
                ry="65"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                opacity="0.3"
                transform="rotate(-25 200 200)"
              />

              {/* Main Planet Sphere */}
              <circle cx="200" cy="200" r="140" fill="url(#novaPlanetBody)" />

              {/* Swirling Atmospheric Cloud Texture */}
              <path
                d="M130 140 Q200 110 270 140 Q320 160 340 140"
                stroke="#FFFFFF"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.4"
                filter="url(#crescentBloom)"
              />
              <path
                d="M100 185 Q190 150 280 190 Q330 210 338 185"
                stroke="#BAE6FD"
                strokeWidth="9"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M120 230 Q210 200 290 235 Q325 245 335 230"
                stroke="#38BDF8"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.25"
              />

              {/* Dark Nightside Shadow Overlay (Crescent Shading covering lower-left) */}
              <path
                d="M200 60 A 140 140 0 1 0 340 200 A 135 135 0 0 1 200 60 Z"
                fill="#020617"
                opacity="0.88"
              />

              {/* Brilliant Sunlit Limb Glow */}
              <circle
                cx="200"
                cy="200"
                r="140"
                fill="url(#atmoGlow)"
              />
              <path
                d="M200 60 A 140 140 0 0 1 340 200"
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="3.5"
                opacity="0.9"
                filter="url(#crescentBloom)"
              />

              {/* Thin Luminous Planetary Ring (Front arc slicing across) */}
              <ellipse
                cx="200"
                cy="200"
                rx="185"
                ry="55"
                fill="none"
                stroke="#BAE6FD"
                strokeWidth="2"
                opacity="0.55"
                transform="rotate(-25 200 200)"
              />

              {/* Orbiting Moonlet 1 (Top-Left) */}
              <g transform="translate(90, 110)">
                <circle cx="0" cy="0" r="16" fill="#0F172A" />
                <circle cx="0" cy="0" r="16" fill="none" stroke="#64748B" strokeWidth="1" />
                <path d="M0 -16 A 16 16 0 0 1 16 0 A 14 14 0 0 0 0 -16 Z" fill="#38BDF8" opacity="0.6" />
              </g>

              {/* Orbiting Moonlet 2 (Foreground Crescent) */}
              <g transform="translate(260, 315)">
                <circle cx="0" cy="0" r="26" fill="#050B1A" />
                <circle cx="0" cy="0" r="26" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.65" />
                <path d="M0 -26 A 26 26 0 0 1 26 0 A 22 22 0 0 0 0 -26 Z" fill="#BAE6FD" opacity="0.75" />
              </g>
            </svg>

            {/* Target Switcher Mini Pills */}
            <div className="absolute -bottom-4 flex items-center gap-1.5 p-1 rounded-full bg-[#0B1329] border border-[#1E293B] shadow-lg text-[10px] font-mono">
              <button
                onClick={() => setActiveTarget('planet-x')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTarget === 'planet-x' ? 'bg-[#38BDF8] text-[#030712] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
                }`}
              >
                Planet X
              </button>
              <button
                onClick={() => setActiveTarget('saturn')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTarget === 'saturn' ? 'bg-[#38BDF8] text-[#030712] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
                }`}
              >
                Saturn
              </button>
              <button
                onClick={() => setActiveTarget('spherex')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTarget === 'spherex' ? 'bg-[#38BDF8] text-[#030712] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
                }`}
              >
                SPHEREx
              </button>
            </div>
          </div>
        </div>

        {/* RIGHTMOST VERTICAL METRICS STRIP (1 Col on Desktop - Exactly like NOVA) */}
        <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center space-y-8 pl-4 border-l border-[#1E293B]/60 text-center font-mono">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#0B1329] border border-[#1E293B] flex items-center justify-center mx-auto text-[#38BDF8]">
              <Telescope className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-[#F8FAFC]">60+</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              Targets
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#0B1329] border border-[#1E293B] flex items-center justify-center mx-auto text-[#8B5CF6]">
              <Orbit className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-[#F8FAFC]">102</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              IR Bands
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#0B1329] border border-[#1E293B] flex items-center justify-center mx-auto text-[#F5C451]">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-[#F8FAFC]">24+</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              Catalogs
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD DASHBOARD CARDS (5 Interactive Discovery Widgets) */}
      <div className="relative z-20 pt-6 border-t border-[#1E293B]/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* HUD CARD 1: OBSERVATORY STATUS */}
          <div 
            onClick={() => onNavigate('observatory')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">FLEET / OPTICS</span>
              <span className="text-[#38BDF8]">60+ TARGETS</span>
            </div>

            {/* Telescope Optics Wireframe */}
            <div className="h-20 flex items-center justify-center bg-[#030712] rounded-xl border border-[#1E293B]/50 p-2 overflow-hidden relative">
              <svg viewBox="0 0 120 70" className="w-full h-full text-[#38BDF8] opacity-80 group-hover:scale-105 transition-transform">
                <polygon points="60,10 85,25 85,45 60,60 35,45 35,25" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="35" y1="35" x2="10" y2="35" stroke="#38BDF8" strokeWidth="1.5" />
                <rect x="5" y="25" width="20" height="20" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="85" y1="35" x2="110" y2="35" stroke="#38BDF8" strokeWidth="1.5" />
                <rect x="95" y="25" width="20" height="20" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="60" cy="35" r="10" fill="#0B1329" stroke="#38BDF8" strokeWidth="1.2" />
                <circle cx="60" cy="35" r="4" fill="#38BDF8" />
              </svg>
              <div className="absolute top-1 left-2 text-[8px] font-mono text-[#38BDF8]/60">3D WEBGL MOTION</div>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-[#F8FAFC]">LIVE OBSERVATORY</div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#10B981] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>ACTIVE PROPAGATION</span>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#10B981] h-full w-[82%]" />
              </div>
            </div>
          </div>

          {/* HUD CARD 2: SPHEREx MISSION PREVIEW */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#8B5CF6] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">SPECTROSCOPY</span>
              <span className="text-[#8B5CF6]">102 BANDS</span>
            </div>

            {/* Nebula Silhouette Graphic */}
            <div className="h-20 rounded-xl bg-[#030712] border border-[#1E293B]/50 overflow-hidden relative flex items-center justify-center p-2">
              <svg viewBox="0 0 140 70" className="w-full h-full">
                <radialGradient id="nebulaBack" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="0" />
                </radialGradient>
                <rect width="140" height="70" fill="url(#nebulaBack)" />
                <circle cx="70" cy="25" r="20" fill="#0B1329" stroke="#BAE6FD" strokeWidth="1" />
                <polygon points="0,70 25,45 50,60 85,38 115,55 140,42 140,70" fill="#030712" />
              </svg>
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#A7B4CC]">3.05 µm H₂O ICE</div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">SPHEREx LAB</div>
                <div className="text-[10px] font-mono text-[#A7B4CC]">Infrared All-Sky Survey</div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#1E293B] flex items-center justify-center text-[#F8FAFC] group-hover:bg-[#8B5CF6] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* HUD CARD 3: SYSTEM SCAN (Live Rotating Radar Sweep) */}
          <div 
            onClick={() => {
              const el = document.getElementById('radar-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigate('planet-x');
              }
            }}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">SYSTEM SCAN</span>
              <span className="text-[#38BDF8] font-bold">● LIVE</span>
            </div>

            {/* Circular Radar Sweep Screen */}
            <div className="h-20 flex items-center justify-center">
              <div className="relative w-18 h-18 rounded-full border border-[#38BDF8]/40 bg-[#030712] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-2 rounded-full border border-[#38BDF8]/25" />
                <div className="absolute inset-4 rounded-full border border-[#38BDF8]/30" />
                <div className="absolute inset-0 animate-spin [animation-duration:4s] pointer-events-none">
                  <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-linear-to-tr from-[#38BDF8]/40 via-[#38BDF8]/10 to-transparent" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5C451]" />
                <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                <div className="absolute bottom-3 left-4 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">7 SIGNALS DETECTED</div>
                <div className="text-[10px] font-mono text-[#A7B4CC]">Outer Boundary (1000 AU)</div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-[10px] font-mono font-bold text-[#38BDF8] group-hover:bg-[#38BDF8] group-hover:text-[#030712] transition-colors">
                VIEW ↗
              </div>
            </div>
          </div>

          {/* HUD CARD 4: MISSION / CELESTIAL TIMELINE (Exact NOVA Timeline UI) */}
          <div 
            onClick={() => onNavigate('asteroid-watch')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">MISSION TIMELINE</span>
              <span className="text-emerald-400">UPCOMING</span>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#A7B4CC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">Engine Calibration</span>
                </div>
                <span className="text-emerald-400 font-semibold">COMPLETE</span>
              </div>

              <div className="flex items-center justify-between p-1 rounded-md bg-[#030712] border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-[#F8FAFC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Gravity Assist</span>
                </div>
                <span className="text-[#38BDF8] font-bold">IN PROGRESS</span>
              </div>

              <div className="flex items-center justify-between text-[#A7B4CC]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
                  <span className="truncate">Apophis Close Pass</span>
                </div>
                <span className="text-[#F5C451]">2029</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between pt-1 border-t border-[#1E293B]">
              <span>ASTEROID WATCH</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* HUD CARD 5: SCROLL TO EXPLORE (Curved Planet Horizon / Asteroid Visual) */}
          <div 
            onClick={() => {
              const el = document.getElementById('discovery-sections');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer flex flex-col justify-between items-center text-center space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7B4CC]">
              DEEP CATALOG
            </span>

            {/* Curved Celestial Horizon */}
            <div className="relative w-28 h-14 overflow-hidden flex items-end justify-center">
              <div className="w-28 h-28 rounded-full border border-[#38BDF8]/60 bg-linear-to-t from-[#0284C7]/80 via-[#0B1329] to-[#030712] shadow-inner flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-[#38BDF8]/30" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center justify-center gap-1">
                <span>SCROLL TO EXPLORE</span>
                <ArrowDown className="w-3 h-3 text-[#38BDF8] animate-bounce" />
              </div>
              <div className="text-[9px] font-mono text-[#A7B4CC]">12 Stations Mapped</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
