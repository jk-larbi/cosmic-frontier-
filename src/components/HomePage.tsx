import type { FC } from 'react';
import type { AppPage } from '../types';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  Waves, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Astronomical Galaxy Background with dark overlay for maximum readability */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-[#050B1A] bg-cover bg-center opacity-40 mix-blend-screen scale-105 transform animate-pulse duration-10000"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.15) 0%, rgba(139, 92, 246, 0.12) 30%, rgba(5, 11, 26, 0.95) 75%),
                                radial-gradient(circle at 20% 80%, rgba(245, 196, 81, 0.08) 0%, transparent 40%),
                                radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 40%)`
            }}
          />
          <div className="absolute inset-0 stars-bg opacity-70" />
          {/* Deep dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1A]/80 via-[#050B1A]/60 to-[#050B1A]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Mission Tag / Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1630]/90 border border-[#38BDF8]/40 shadow-lg backdrop-blur-sm animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#38BDF8]">
              NASA Space Apps Challenge 2026
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.1]">
            Explore the Universe.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#F5C451]">
              Discover the Unknown.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#A7B4CC] leading-relaxed">
            COSMIC FRONTIER helps you explore infrared images of the universe and investigate the mysteries of our solar system.
          </p>

          {/* Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Explore the Universe Button */}
            <button
              onClick={() => onNavigate('spherex')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#F5C451] to-[#EAB308] text-[#050B1A] font-bold text-base shadow-xl hover:shadow-[#F5C451]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Telescope className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Explore the Universe</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Investigate Planet X Button */}
            <button
              onClick={() => onNavigate('planet-x')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0B1630] hover:bg-[#132247] text-[#F8FAFC] border border-[#38BDF8]/40 font-semibold text-base shadow-lg hover:border-[#38BDF8] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Orbit className="w-5 h-5 text-[#8B5CF6] group-hover:rotate-45 transition-transform" />
              <span>Investigate Planet X</span>
              <ChevronRight className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Subtle Key Metrics */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[#1E293B]/70">
            <div className="p-3 rounded-lg bg-[#0B1630]/40 border border-[#1E293B]">
              <div className="text-xl font-bold font-mono text-[#38BDF8]">102</div>
              <div className="text-[11px] text-[#A7B4CC]">SPHEREx IR Bands</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1630]/40 border border-[#1E293B]">
              <div className="text-xl font-bold font-mono text-[#8B5CF6]">0.75–5.0 µm</div>
              <div className="text-[11px] text-[#A7B4CC]">Infrared Spectrum</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1630]/40 border border-[#1E293B]">
              <div className="text-xl font-bold font-mono text-[#F5C451]">~400 AU</div>
              <div className="text-[11px] text-[#A7B4CC]">Planet X Distance</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1630]/40 border border-[#1E293B]">
              <div className="text-xl font-bold font-mono text-[#F8FAFC]">100%</div>
              <div className="text-[11px] text-[#A7B4CC]">Scientifically Honest</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TWO MAIN FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-bold">
            Core Scientific Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mt-2">
            Two Windows into the Unknown
          </h2>
          <p className="text-sm text-[#A7B4CC] mt-3">
            Engage with interactive tools designed to make advanced astronomical concepts intuitive, accurate, and captivating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: SPHEREx Explorer */}
          <div className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8]/50 shadow-xl overflow-hidden transition-all flex flex-col justify-between hover:shadow-[#38BDF8]/10 hover:shadow-2xl">
            <div>
              {/* Astronomy Imagery Container */}
              <div className="relative h-64 overflow-hidden bg-[#050B1A] flex items-center justify-center p-4">
                {/* Visual Graphic */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050B1A] via-[#0B1630] to-[#1E293B]/60" />
                <svg className="w-full h-full relative z-10" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="card1Nebula" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#F5C451" stop-opacity="0.9" />
                      <stop offset="30%" stop-color="#8B5CF6" stop-opacity="0.7" />
                      <stop offset="70%" stop-color="#38BDF8" stop-opacity="0.4" />
                      <stop offset="100%" stop-color="#050B1A" stop-opacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="250" cy="150" r="130" fill="url(#card1Nebula)" />
                  <g opacity="0.8">
                    <circle cx="230" cy="140" r="3" fill="#FFF" />
                    <circle cx="270" cy="160" r="2.5" fill="#FFF" />
                    <circle cx="210" cy="170" r="2" fill="#F5C451" />
                    <circle cx="290" cy="130" r="2" fill="#38BDF8" />
                  </g>
                  {/* Spectrum bands overlay */}
                  <rect x="50" y="240" width="80" height="6" rx="3" fill="#38BDF8" />
                  <rect x="140" y="240" width="80" height="6" rx="3" fill="#60A5FA" />
                  <rect x="230" y="240" width="80" height="6" rx="3" fill="#818CF8" />
                  <rect x="320" y="240" width="80" height="6" rx="3" fill="#C084FC" />
                  <rect x="410" y="240" width="40" height="6" rx="3" fill="#F5C451" />
                </svg>

                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#050B1A]/80 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-mono font-semibold">
                    SPHEREx Mission
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F5C451]/20 text-[#F5C451] text-[10px] font-bold">
                    102 Bands
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-[#38BDF8]">
                  <Telescope className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Infrared Astronomy</span>
                </div>

                <h3 className="text-2xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                  SPHEREx Explorer
                </h3>

                <p className="text-base text-[#F5C451] font-medium">
                  Discover the universe through infrared light.
                </p>

                <p className="text-sm text-[#A7B4CC] leading-relaxed">
                  Peel back obscuring cosmic dust to reveal hidden stellar nurseries, detect water and biogenic ices in developing planetary disks, and inspect the faint glow of the earliest galaxies.
                </p>

                {/* Features list */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-[#A7B4CC]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>Optical vs. IR Split Slider</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                    <span>H₂O & CO₂ Ice Detection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C451]" />
                    <span>Zoom, Pan & Brightness</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>Scientific Accuracy Notice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Navigation Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                onClick={() => onNavigate('spherex')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0B1630] to-[#1E293B] hover:from-[#38BDF8] hover:to-[#0284C7] text-[#F8FAFC] hover:text-[#050B1A] font-semibold text-sm border border-[#38BDF8]/40 hover:border-[#38BDF8] transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
              >
                <span>Launch SPHEREx Explorer</span>
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Planet X Explorer */}
          <div className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6]/50 shadow-xl overflow-hidden transition-all flex flex-col justify-between hover:shadow-[#8B5CF6]/10 hover:shadow-2xl">
            <div>
              {/* Astronomy Imagery Container */}
              <div className="relative h-64 overflow-hidden bg-[#050B1A] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050B1A] via-[#0B1630] to-[#1E293B]/60" />
                <svg className="w-full h-full relative z-10" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sun */}
                  <circle cx="250" cy="150" r="10" fill="#F5C451" />
                  {/* Neptune orbit */}
                  <circle cx="250" cy="150" r="50" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.6" fill="none" />
                  {/* Sedna eccentric orbit */}
                  <ellipse cx="290" cy="160" rx="140" ry="60" stroke="#FB7185" stroke-width="1.5" stroke-opacity="0.7" fill="none" transform="rotate(-25 250 150)" />
                  {/* Planet X hypothetical orbit */}
                  <ellipse cx="200" cy="140" rx="150" ry="70" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="5 4" fill="none" transform="rotate(155 250 150)" />
                  {/* Object markers */}
                  <circle cx="360" cy="110" r="4" fill="#FB7185" />
                  <circle cx="100" cy="170" r="5" fill="#8B5CF6" />
                </svg>

                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#050B1A]/80 border border-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-mono font-semibold">
                    Outer Solar System
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold">
                    Hypothetical
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-[#8B5CF6]">
                  <Orbit className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Planetary Dynamics</span>
                </div>

                <h3 className="text-2xl font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors">
                  Planet X Explorer
                </h3>

                <p className="text-base text-[#F5C451] font-medium">
                  Explore the outer solar system and investigate the search for a possible ninth planet.
                </p>

                <p className="text-sm text-[#A7B4CC] leading-relaxed">
                  Interactive 2D orbital simulation mapping the Sun, 8 planets, extreme trans-Neptunian objects like Sedna, and the mathematical clues pointing toward an unseen world.
                </p>

                {/* Features list */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-[#A7B4CC]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                    <span>Interactive 2D Orbit Canvas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    <span>Real eTNO Clustering Data</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]" />
                    <span>Sedna & Leleākūhonua Paths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C451]" />
                    <span>Rigorous Science Disclaimer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Navigation Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                onClick={() => onNavigate('planet-x')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0B1630] to-[#1E293B] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-[#F8FAFC] hover:text-[#FFFFFF] font-semibold text-sm border border-[#8B5CF6]/40 hover:border-[#8B5CF6] transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
              >
                <span>Launch Planet X Explorer</span>
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0B1630]/70 border border-[#1E293B] p-8 sm:p-12 space-y-10">
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

      {/* 4. WHAT YOU CAN DISCOVER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#F5C451] font-bold">
            Scientific Insights
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-2">
            What You Can Discover
          </h2>
          <p className="text-sm text-[#A7B4CC] mt-2">
            Key astrophysical discoveries simplified for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Seeing Through Dust</h4>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Infrared light wavelengths are longer than dust particles, letting us look straight inside stellar cradles like the Orion Nebula.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6]/40 transition-all space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Water & Organic Ices</h4>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Molecules absorb specific infrared wavelengths (like water ice at 3.05 µm), revealing where prebiotic ingredients concentrate in space.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#F5C451]/40 transition-all space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center">
              <Orbit className="w-4 h-4" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Sedna's Strange Orbit</h4>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Sedna never comes closer than 76 AU from the Sun—far beyond Neptune's reach. Something else must have shaped its elongated orbit.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-base font-semibold text-[#F8FAFC]">Cosmic Dawn Light</h4>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Light from the earliest stars was stretched by cosmic expansion into infrared, allowing SPHEREx to trace the universe’s first light.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SCIENTIFIC DATA NOTICE BANNER */}
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
            className="shrink-0 px-4 py-2.5 rounded-lg bg-[#050B1A] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-semibold text-[#F8FAFC] transition-all"
          >
            Read Science Guidelines
          </button>
        </div>
      </section>

      {/* 6. CALL TO ACTION / AI ASSISTANT TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            <Sparkles className="w-6 h-6" />
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
              className="px-6 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FFFFFF] font-semibold text-sm shadow-lg hover:shadow-[#8B5CF6]/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Talk to COSMIC AI GUIDE</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

