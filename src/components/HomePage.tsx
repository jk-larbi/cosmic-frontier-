import type { FC } from 'react';
import type { AppPage } from '../types';
import { PlanetGraphic } from './PlanetGraphic';
import { PlanetaryShowcase } from './PlanetaryShowcase';
import { CosmicOrbitalDiagram } from './CosmicOrbitalDiagram';
import { CosmicRadarHUD } from './CosmicRadarHUD';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  ChevronRight, 
  Waves, 
  ShieldAlert, 
  Activity, 
  Globe, 
  ArrowRight 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-24 pb-16">
      {/* 1. SCI-FI COMMAND CENTER HERO (NOVA & UZAY KEŞİF INSPIRED) */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Background Cosmic Starfield & Ambient Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-[#050B1A] bg-cover bg-center opacity-60 mix-blend-screen scale-105"
            style={{
              backgroundImage: `radial-gradient(circle at 65% 35%, rgba(56, 189, 248, 0.18) 0%, rgba(139, 92, 246, 0.14) 25%, rgba(5, 11, 26, 0.95) 75%),
                                radial-gradient(circle at 20% 75%, rgba(245, 196, 81, 0.1) 0%, transparent 45%),
                                radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 40%)`
            }}
          />
          {/* Subtle sci-fi grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B15_1px,transparent_1px),linear-gradient(to_bottom,#1E293B15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1A]/80 via-[#050B1A]/50 to-[#050B1A]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Telemetry Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[#1E293B]/60 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>SYSTEM STATUS: NOMINAL</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1630] text-[#A7B4CC] border border-[#1E293B]">
                <Activity className="w-3 h-3 text-[#38BDF8]" />
                <span>NASA SPACE APPS 2026</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-[#A7B4CC]">
              <span className="hidden md:inline">SURVEY: <strong className="text-[#38BDF8]">SPHEREx (102 BANDS)</strong></span>
              <span>ORBITS: <strong className="text-[#F5C451]">13 MAPPED WORLDS</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Headlines, Story & Main CTAs */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mission Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/40 shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="text-xs font-bold tracking-widest uppercase text-[#38BDF8] font-mono">
                  Deep Space Astrophysics & Outer Worlds
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F8FAFC] leading-[1.05]">
                  EXPLORE.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#F5C451]">
                    DISCOVER.
                  </span>
                  <br />
                  UNVEIL THE UNSEEN.
                </h1>
                <p className="max-w-2xl text-base sm:text-xl text-[#A7B4CC] leading-relaxed pt-2">
                  Survey the cosmos across 102 infrared channels with NASA’s SPHEREx mission, map the far reaches of our Solar System, and track the gravitational clues of the hypothetical Planet X.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {/* SPHEREx Explorer CTA */}
                <button
                  onClick={() => onNavigate('spherex')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F5C451] to-[#EAB308] text-[#050B1A] font-extrabold text-base shadow-xl hover:shadow-[#F5C451]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Telescope className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Launch SPHEREx Explorer</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Planet X Explorer CTA */}
                <button
                  onClick={() => onNavigate('planet-x')}
                  className="px-7 py-4 rounded-2xl bg-[#0B1630] hover:bg-[#132247] text-[#F8FAFC] border border-[#38BDF8]/40 font-bold text-base shadow-lg hover:border-[#38BDF8] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Orbit className="w-5 h-5 text-[#8B5CF6] group-hover:rotate-45 transition-transform" />
                  <span>Track Planet X Orbits</span>
                  <ChevronRight className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Ask AI Guide */}
                <button
                  onClick={() => onNavigate('ai-guide')}
                  className="px-5 py-4 rounded-2xl bg-[#0B1630]/60 hover:bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#F5C451] text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#F5C451]" />
                  <span>AI Space Guide</span>
                </button>
              </div>

              {/* Telemetry Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1E293B]/70 font-mono">
                <div className="p-3.5 rounded-xl bg-[#0B1630]/60 border border-[#1E293B]">
                  <div className="text-2xl font-black text-[#38BDF8]">102</div>
                  <div className="text-[11px] text-[#A7B4CC] mt-0.5">SPHEREx Channels</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B1630]/60 border border-[#1E293B]">
                  <div className="text-2xl font-black text-[#8B5CF6]">450M+</div>
                  <div className="text-[11px] text-[#A7B4CC] mt-0.5">Galaxies Mapped</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B1630]/60 border border-[#1E293B]">
                  <div className="text-2xl font-black text-[#F5C451]">13</div>
                  <div className="text-[11px] text-[#A7B4CC] mt-0.5">Worlds Cataloged</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B1630]/60 border border-[#1E293B]">
                  <div className="text-2xl font-black text-[#10B981]">~420 AU</div>
                  <div className="text-[11px] text-[#A7B4CC] mt-0.5">Planet X Orbit Model</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Visual Hero Planet HUD Display (NOVA style) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#0B1630]/90 to-[#070D1E]/90 border border-[#1E293B] shadow-2xl backdrop-blur-xl space-y-6">
                {/* HUD Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] text-xs font-mono">
                  <span className="text-[#38BDF8] flex items-center gap-1.5 font-bold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>TARGET WORLD: SATURN</span>
                  </span>
                  <span className="text-[#F5C451]">9.58 AU FROM SUN</span>
                </div>

                {/* Central Luminous Artwork */}
                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#F5C451]/10 rounded-full blur-2xl pointer-events-none" />
                  <PlanetGraphic planetId="saturn" size={170} animate={true} />
                </div>

                {/* Mini Telemetry Specs */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between font-mono p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[#A7B4CC]">Orbital Period:</span>
                    <span className="text-[#F8FAFC] font-bold">29.46 Earth Years</span>
                  </div>
                  <div className="flex items-center justify-between font-mono p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[#A7B4CC]">Ring Composition:</span>
                    <span className="text-[#38BDF8] font-bold">99% Water Ice & Dust</span>
                  </div>
                  <div className="flex items-center justify-between font-mono p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[#A7B4CC]">Known Moons:</span>
                    <span className="text-[#F5C451] font-bold">146 Confirmed Moons</span>
                  </div>
                </div>

                {/* Quick Action */}
                <button
                  onClick={() => onNavigate('planet-x')}
                  className="w-full py-3 rounded-xl bg-[#050B1A] hover:bg-[#38BDF8] text-[#A7B4CC] hover:text-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Orbit className="w-4 h-4" />
                  <span>Inspect Solar System Orbits</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DISCOVERY CATEGORY CARDS (UZAY KEŞİF INSPIRED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-bold uppercase tracking-wider">
            Exploration Gateways
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Discover the Cosmic Frontier
          </h2>
          <p className="text-sm sm:text-base text-[#A7B4CC]">
            Interactive tools and scientific visualizers engineered for beginners, students, and astronomy explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Infrared Spectroscopy */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#38BDF8]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                <Telescope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                  NASA Observatory
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  SPHEREx Explorer
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Peel back dense dust clouds with multi-spectral infrared bands, study the cosmic dawn, and examine water ice signatures.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>102 Spectral Channels</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Planet X & Distant Worlds */}
          <div 
            onClick={() => onNavigate('planet-x')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#8B5CF6]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
                <Orbit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold uppercase tracking-wider">
                  Orbital Mechanics
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors mt-0.5">
                  Planet X Explorer
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Simulate 2D orbits of 8 planets, extreme trans-Neptunian objects like Sedna, and investigate the mathematical clues for a 9th world.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#8B5CF6]">
              <span>2D Canvas Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Interstellar Ices */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#F5C451] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#F5C451]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5C451]/10 border border-[#F5C451]/30 flex items-center justify-center text-[#F5C451] group-hover:scale-110 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#F5C451] font-bold uppercase tracking-wider">
                  Prebiotic Building Blocks
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#F5C451] transition-colors mt-0.5">
                  Interstellar Ices
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Discover how water (H₂O), carbon dioxide (CO₂), and organic molecules freeze onto dust grains to form the seeds of new planets.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#F5C451]">
              <span>3.05 µm Absorption</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: AI Space Guide */}
          <div 
            onClick={() => onNavigate('ai-guide')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#10B981] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#10B981]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-wider">
                  Interactive Assistant
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors mt-0.5">
                  COSMIC AI GUIDE
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Ask questions in plain language without unnecessary jargon. Verified science answers with zero fabricated observations.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#10B981]">
              <span>Beginner Friendly</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLANETARY SHOWCASE & CATALOG ("various planets listed" - Image 1 & 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlanetaryShowcase onNavigate={onNavigate} />
      </section>

      {/* 4. COSMIC ORBITAL ARCHITECTURE DIAGRAM (IMAGE 1 INSPIRED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CosmicOrbitalDiagram onNavigate={onNavigate} />
      </section>

      {/* 5. LIVE TELEMETRY RADAR & ASTROPHYSICAL KNOWLEDGE (IMAGE 2 & 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CosmicRadarHUD onNavigate={onNavigate} />
      </section>

      {/* 6. HOW COSMIC FRONTIER WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0B1630]/70 border border-[#1E293B] p-8 sm:p-12 space-y-10 shadow-xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-bold">
              Simple Step-by-Step Exploration
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-2">
              How COSMIC FRONTIER Works
            </h2>
            <p className="text-sm text-[#A7B4CC] mt-2">
              You do not need an astrophysics degree. Our tools translate complex astronomical observations into accessible, interactive knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#050B1A]/80 border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold font-mono">
                01
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Select a Target or Realm</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Choose from star-forming nebulae, early galaxies, protoplanetary disks, or scale out to the remote Kuiper Belt and Sedna’s distant trajectory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#050B1A]/80 border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-bold font-mono">
                02
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Adjust Filters & Scales</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Slide across infrared bands from 0.75 µm to 5.0 µm, compare optical versus infrared with the split slider, or zoom from 1 AU out to 1,000 AU.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#050B1A]/80 border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5C451]/10 border border-[#F5C451]/30 flex items-center justify-center text-[#F5C451] font-bold font-mono">
                03
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Inspect Scientific Clues</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Read concise verified explanations of water ice signatures, orbital clustering probabilities, and survey limits without any fabricated jargon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SCIENTIFIC DATA NOTICE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#0B1630] to-[#121B35] border border-[#F5C451]/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5C451]/10 border border-[#F5C451]/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-[#F5C451]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <span>Commitment to Scientific Honesty & Integrity</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5C451]/20 text-[#F5C451]">
                  Official Notice
                </span>
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed max-w-3xl">
                COSMIC FRONTIER never presents speculative hypotheses as facts. SPHEREx images are clearly identified as calibrated spectroscopic models based on verified NASA observations. Planet X is explicitly identified as an unconfirmed mathematical hypothesis. No live telescope feeds or fake data are fabricated.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('about')}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-[#050B1A] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-semibold text-[#F8FAFC] transition-all cursor-pointer"
          >
            Read Science Guidelines
          </button>
        </div>
      </section>

      {/* 8. AI ASSISTANT CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Have Questions About Space?
            </h2>
            <p className="text-sm text-[#A7B4CC]">
              Ask our COSMIC AI GUIDE about infrared wavelengths, why scientists study distant galaxies, or how astronomers calculate hypothetical planetary orbits.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('ai-guide')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-[#FFFFFF] font-bold text-sm shadow-xl hover:shadow-[#8B5CF6]/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Talk to COSMIC AI GUIDE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
