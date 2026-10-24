import { useState, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  ArrowUpRight, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
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
    <section className="relative w-full min-h-[95vh] bg-[#050811] text-[#F8FAFC] overflow-hidden rounded-2xl border border-[#1E293B]/80 shadow-2xl p-4 sm:p-8 lg:p-10 flex flex-col justify-between">
      {/* Background Starfield & Subtle Nebular Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial glow under planet */}
        <div className="absolute -right-20 top-1/4 w-162.5 h-162.5 bg-[#38BDF8]/10 rounded-full blur-[140px]" />
        <div className="absolute left-10 bottom-1/3 w-125 h-125 bg-[#8B5CF6]/10 rounded-full blur-[140px]" />
        {/* Fine coordinate grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.03]" />
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
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#0B1329]/80 border border-[#1E293B] backdrop-blur-md text-xs font-medium">
          <button
            onClick={() => onNavigate('spherex')}
            className="px-3.5 py-1.5 rounded-full bg-[#1E293B] text-[#38BDF8] shadow-sm font-semibold hover:text-[#FFFFFF] transition-colors"
          >
            SPHEREx Explorer
          </button>
          <button
            onClick={() => onNavigate('planet-x')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Planet X Lab
          </button>
          <button
            onClick={() => onNavigate('mission-control')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Mission Control
          </button>
          <button
            onClick={() => onNavigate('observatory')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Observatory
          </button>
          <button
            onClick={() => onNavigate('universe')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            3D Universe
          </button>
          <button
            onClick={() => onNavigate('exoplanets')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Exoplanets
          </button>
          <button
            onClick={() => onNavigate('galaxies')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Galaxies
          </button>
          <button
            onClick={() => onNavigate('data-centre')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
          >
            Data Centre
          </button>
          <button
            onClick={() => onNavigate('ai-guide')}
            className="px-3.5 py-1.5 rounded-full text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#F5C451]" />
            <span>AI Guide</span>
          </button>
        </nav>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1329] border border-[#1E293B] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[#34D399] font-semibold">TELEMETRY LIVE</span>
          </div>
        </div>
      </div>

      {/* MAIN HERO INTERIOR (Typography + Planet Artwork + Vertical Telemetry) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 lg:py-12">
        {/* LEFT COLUMN (6 Cols): Typography & High-Impact CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1329] border border-[#1E293B] text-xs font-mono text-[#A7B4CC]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>NASA SPACE APPS • ASTRONOMICAL PLATFORM</span>
          </div>

          {/* Clean Editorial Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.08]">
              Explore the Universe.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#38BDF8] via-[#8B5CF6] to-[#F5C451]">
                Discover the Unknown.
              </span>
            </h1>
          </div>

          <p className="max-w-xl text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            A citizen-science astronomy workbench powered by real NASA open data. Explore two primary research frontiers: analyze authentic 102-band infrared survey products with the <strong className="text-[#38BDF8]">SPHEREx Explorer</strong>, and investigate dynamical eTNO evidence for the hypothetical ninth planet in the <strong className="text-[#C084FC]">Planet X Investigation Lab</strong>.
          </p>

          {/* Two Prominent Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('spherex')}
              className="px-7 py-3.5 rounded-full bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#050811] font-bold text-sm tracking-wide shadow-xl hover:shadow-[#FFFFFF]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Telescope className="w-4 h-4 text-[#0284C7]" />
              <span>SPHEREx EXPLORER</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate('planet-x')}
              className="px-6 py-3.5 rounded-full bg-[#0B1329]/90 hover:bg-[#131D38] text-[#F8FAFC] border border-[#8B5CF6]/50 hover:border-[#8B5CF6] font-semibold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Orbit className="w-4 h-4 text-[#C084FC]" />
              <span>PLANET X INVESTIGATION LAB</span>
            </button>
          </div>
        </div>

        {/* CENTER/RIGHT COLUMN (5 Cols): Massive Glowing Exoplanet/World Artwork */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-105 aspect-square flex items-center justify-center">
            {/* Target World Floating Badge (Exactly like NOVA 'TARGET: KEPLER-186F') */}
            <div className="absolute top-4 right-2 sm:right-6 z-20 p-3 rounded-2xl bg-[#070D1E]/80 border border-[#38BDF8]/40 backdrop-blur-xl shadow-2xl space-y-0.5">
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

            {/* Glowing Celestial Body SVG Illustration */}
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible drop-shadow-[0_0_50px_rgba(56,189,248,0.25)]">
              <defs>
                {/* Planet Body Gradient */}
                <radialGradient id="novaPlanetBody" cx="30%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="#E0F2FE" />
                  <stop offset="25%" stopColor="#38BDF8" />
                  <stop offset="55%" stopColor="#0369A1" />
                  <stop offset="85%" stopColor="#071739" />
                  <stop offset="100%" stopColor="#030712" />
                </radialGradient>

                {/* Atmospheric Rim Glow */}
                <radialGradient id="atmoGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#38BDF8" stopOpacity="0" />
                  <stop offset="92%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.9" />
                </radialGradient>

                {/* Sunlit Crescent Glow Filter */}
                <filter id="crescentBloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Orbital Ring Arc 1 */}
              <ellipse
                cx="200"
                cy="200"
                rx="190"
                ry="70"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                opacity="0.4"
                transform="rotate(-20 200 200)"
              />

              {/* Main Planet Sphere */}
              <circle cx="200" cy="200" r="140" fill="url(#novaPlanetBody)" />

              {/* Swirling Atmospheric Cloud Texture */}
              <path
                d="M90 160 Q150 130 230 160 Q300 180 340 160"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#crescentBloom)"
              />
              <path
                d="M80 200 Q160 170 240 210 Q310 230 330 210"
                stroke="#BAE6FD"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.25"
              />
              <path
                d="M100 240 Q180 220 260 250 Q300 260 320 240"
                stroke="#38BDF8"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.2"
              />

              {/* Dark Nightside Shadow Overlay (Crescent Shading) */}
              <path
                d="M200 60 A 140 140 0 0 1 200 340 A 110 140 0 0 0 200 60 Z"
                fill="#030712"
                opacity="0.85"
              />

              {/* Brilliant Sunlit Limb Glow */}
              <circle
                cx="200"
                cy="200"
                r="140"
                fill="url(#atmoGlow)"
              />
              <circle
                cx="200"
                cy="200"
                r="140"
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="2.5"
                opacity="0.75"
                filter="url(#crescentBloom)"
              />

              {/* Orbiting Moonlet 1 */}
              <g transform="translate(80, 110)">
                <circle cx="0" cy="0" r="18" fill="#1E293B" />
                <circle cx="0" cy="0" r="18" fill="none" stroke="#64748B" strokeWidth="1" />
                <circle cx="-5" cy="-5" r="4" fill="#334155" />
                <path d="M0 -18 A 18 18 0 0 1 0 18 A 12 18 0 0 0 0 -18 Z" fill="#0F172A" opacity="0.8" />
              </g>

              {/* Orbiting Moonlet 2 (Foreground Crescent) */}
              <g transform="translate(250, 310)">
                <circle cx="0" cy="0" r="28" fill="#0F172A" />
                <circle cx="0" cy="0" r="28" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
                <path d="M0 -28 A 28 28 0 0 1 0 28 A 20 28 0 0 0 0 -28 Z" fill="#050B1A" opacity="0.9" />
              </g>
            </svg>

            {/* Target Switcher Mini Pills */}
            <div className="absolute -bottom-4 flex items-center gap-1.5 p-1 rounded-full bg-[#0B1329] border border-[#1E293B] shadow-lg text-[10px] font-mono">
              <button
                onClick={() => setActiveTarget('planet-x')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTarget === 'planet-x' ? 'bg-[#38BDF8] text-[#050811] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
                }`}
              >
                Planet X
              </button>
              <button
                onClick={() => setActiveTarget('saturn')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTarget === 'saturn' ? 'bg-[#38BDF8] text-[#050811] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
                }`}
              >
                Saturn
              </button>
              <button
                onClick={() => setActiveTarget('spherex')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTarget === 'spherex' ? 'bg-[#38BDF8] text-[#050811] font-bold' : 'text-[#A7B4CC] hover:text-[#FFFFFF]'
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
            <div className="text-xl font-bold text-[#F8FAFC]">102</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              IR Bands
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#0B1329] border border-[#1E293B] flex items-center justify-center mx-auto text-[#8B5CF6]">
              <Orbit className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-[#F8FAFC]">13</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              Worlds
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#0B1329] border border-[#1E293B] flex items-center justify-center mx-auto text-[#F5C451]">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-[#F8FAFC]">450M</div>
            <div className="text-[9px] uppercase tracking-wider text-[#A7B4CC]">
              Galaxies
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD DASHBOARD CARDS (Exact 5-Widget Grid from NOVA Reference Image) */}
      <div className="relative z-20 pt-6 border-t border-[#1E293B]/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* HUD CARD 1: FLEET / OBSERVATORY STATUS (Wireframe S/C) */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">OBSERVATORY STATUS</span>
              <span className="text-[#38BDF8]">102/102</span>
            </div>

            {/* Spacecraft Wireframe Graphic */}
            <div className="h-20 flex items-center justify-center bg-[#050811] rounded-xl border border-[#1E293B]/50 p-2 overflow-hidden relative">
              <svg viewBox="0 0 120 70" className="w-full h-full text-[#38BDF8] opacity-80 group-hover:scale-105 transition-transform">
                {/* Satellite Body & Solar Panels Wireframe */}
                <polygon points="60,10 85,25 85,45 60,60 35,45 35,25" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="35" y1="35" x2="10" y2="35" stroke="#38BDF8" strokeWidth="1.5" />
                <rect x="5" y="25" width="20" height="20" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="85" y1="35" x2="110" y2="35" stroke="#38BDF8" strokeWidth="1.5" />
                <rect x="95" y="25" width="20" height="20" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                {/* Telescope Optics Aperture */}
                <circle cx="60" cy="35" r="10" fill="#0B1329" stroke="#38BDF8" strokeWidth="1.2" />
                <circle cx="60" cy="35" r="4" fill="#38BDF8" />
              </svg>
              <div className="absolute top-1 left-2 text-[8px] font-mono text-[#38BDF8]/60">SPHEREx MIDEX</div>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-[#F8FAFC]">SPHEREx SATELLITE</div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#10B981] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>ALL SYSTEMS READY</span>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#10B981] h-full w-full" />
              </div>
            </div>
          </div>

          {/* HUD CARD 2: NEXT MISSION / TARGET PREVIEW */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#8B5CF6] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">FEATURED TARGET</span>
              <span className="text-[#8B5CF6]">ORION NEBULA</span>
            </div>

            {/* Cratered Landscape / Nebula Silhouette Graphic */}
            <div className="h-20 rounded-xl bg-[#050811] border border-[#1E293B]/50 overflow-hidden relative flex items-center justify-center p-2">
              <svg viewBox="0 0 140 70" className="w-full h-full">
                <radialGradient id="nebulaBack" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#050811" stopOpacity="0" />
                </radialGradient>
                <rect width="140" height="70" fill="url(#nebulaBack)" />
                {/* Celestial sphere rising over horizon */}
                <circle cx="70" cy="25" r="20" fill="#0B1329" stroke="#BAE6FD" strokeWidth="1" />
                {/* Mountain/landscape silhouette */}
                <polygon points="0,70 25,45 50,60 85,38 115,55 140,42 140,70" fill="#050811" />
              </svg>
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#A7B4CC]">3.05 µm H₂O ICE</div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">STELLAR NURSERY</div>
                <div className="text-[10px] font-mono text-[#A7B4CC]">Infrared Spectroscopy</div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#1E293B] flex items-center justify-center text-[#F8FAFC] group-hover:bg-[#8B5CF6] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* HUD CARD 3: SYSTEM SCAN (Live Rotating Radar Sweep) */}
          <div 
            onClick={() => onNavigate('planet-x')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#10B981] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">SYSTEM SCAN</span>
              <span className="text-[#10B981] font-bold">● LIVE</span>
            </div>

            {/* Circular Radar Sweep Screen */}
            <div className="h-20 flex items-center justify-center">
              <div className="relative w-18 h-18 rounded-full border border-[#10B981]/40 bg-[#050811] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-2 rounded-full border border-[#10B981]/25" />
                <div className="absolute inset-4 rounded-full border border-[#10B981]/30" />
                {/* Rotating scanner needle */}
                <div className="absolute inset-0 animate-spin [animation-duration:4s] pointer-events-none">
                  <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-linear-to-tr from-[#10B981]/40 via-[#10B981]/10 to-transparent" />
                </div>
                {/* Central dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                {/* Blips */}
                <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-[#34D399] beacon-pulse" />
                <div className="absolute bottom-3 left-4 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">4 eTNO TARGETS</div>
                <div className="text-[10px] font-mono text-[#A7B4CC]">Outer Boundary Scan</div>
              </div>
              <div className="px-2 py-1 rounded-lg bg-[#1E293B] text-[10px] font-mono font-bold text-[#34D399] group-hover:bg-[#10B981] group-hover:text-[#050811] transition-colors">
                RADAR ↗
              </div>
            </div>
          </div>

          {/* HUD CARD 4: MISSION TIMELINE STEP TRACKER */}
          <div 
            onClick={() => onNavigate('about')}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#F5C451] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A7B4CC]">
              <span className="uppercase tracking-wider">MISSION TIMELINE</span>
              <span className="text-[#F5C451]">STAGES</span>
            </div>

            {/* Stepper Timeline List */}
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center gap-2 text-[#34D399]">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">Stage 1: Optics Calibration</span>
              </div>
              <div className="flex items-center gap-2 text-[#38BDF8]">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse shrink-0" />
                <span className="truncate">Stage 2: 102 Band Survey</span>
              </div>
              <div className="flex items-center gap-2 text-[#A7B4CC]">
                <span className="w-2 h-2 rounded-full bg-[#475569] shrink-0" />
                <span className="truncate">Stage 3: Planet X Search</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#F5C451] flex items-center justify-between pt-1 border-t border-[#1E293B]">
              <span>VERA C. RUBIN SCAN</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* HUD CARD 5: SCROLL TO EXPLORE ARCHITECTURE PEEK */}
          <div 
            onClick={() => {
              const el = document.getElementById('planetary-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group p-4 rounded-2xl bg-[#090E1D]/90 border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer flex flex-col justify-between items-center text-center space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7B4CC]">
              DEEP CATALOG
            </span>

            {/* Planet Hemisphere Curve Peek */}
            <div className="relative w-28 h-14 overflow-hidden flex items-end justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-[#38BDF8] bg-linear-to-t from-[#0284C7] to-[#0B1329] shadow-inner" />
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center justify-center gap-1">
                <span>SCROLL TO EXPLORE</span>
                <ArrowDown className="w-3 h-3 text-[#38BDF8] group-hover:translate-y-1 transition-transform" />
              </div>
              <div className="text-[9px] font-mono text-[#A7B4CC]">13 Worlds Mapped</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
