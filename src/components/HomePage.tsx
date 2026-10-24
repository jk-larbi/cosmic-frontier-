import type { FC } from 'react';
import type { AppPage } from '../types';
import { NovaCommandHero } from './NovaCommandHero';
import { PlanetaryShowcase } from './PlanetaryShowcase';
import { CosmicOrbitalDiagram } from './CosmicOrbitalDiagram';
import { CosmicRadarHUD } from './CosmicRadarHUD';
import { NasaLiveDispatch } from './NasaLiveDispatch';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  ArrowRight,
  Database,
  Compass,
  Disc
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* 1. NOVA-STYLE SCI-FI COMMAND CENTER HERO */}
      <div className="max-w-360 mx-auto px-2 sm:px-4 lg:px-6 pt-4">
        <NovaCommandHero onNavigate={onNavigate} />
      </div>

      {/* 2. DISCOVERY CATEGORIES GATEWAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-semibold uppercase tracking-wider">
            Astronomy Observatories & Research Consoles
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Explore the Cosmic Frontier
          </h2>
          <p className="text-sm sm:text-base text-[#A7B4CC] leading-relaxed">
            Begin with interactive observational workstations designed for clear understanding, backed by verified NASA open data archives and Standish analytical ephemerides.
          </p>
        </div>

        {/* PRIMARY FLAGSHIPS: SPHEREx Explorer & Planet X Investigation Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flagship 1: SPHEREx Explorer (7 Cols) */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="lg:col-span-7 group rounded-2xl bg-linear-to-br from-[#0B1630] via-[#0D1B3E] to-[#071126] border border-[#1E293B] hover:border-[#38BDF8] p-6 sm:p-8 space-y-6 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                  <Telescope className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#38BDF8] px-2.5 py-0.5 rounded-full bg-[#050B1A] border border-[#1E293B]">
                  102 Infrared Bands • 0.75–5.0 µm
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                  All-Sky Spectral Survey Workbench
                </span>
                <h3 className="text-2xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                  SPHEREx Explorer
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
                Explore infrared astronomy, spectral information, and cosmic questions addressed by NASA’s SPHEREx mission. Inspect 102 Linear Variable Filter channels, the 3.05 µm interstellar water ice absorption band, and IRSA ObsCore archival metadata.
              </p>
              
              <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#050B1A]/70 border border-[#1E293B]">
                  <div className="text-[10px] text-[#A7B4CC]">Spectral Span</div>
                  <div className="font-bold text-[#F8FAFC]">0.75 – 5.0 µm</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050B1A]/70 border border-[#1E293B]">
                  <div className="text-[10px] text-[#A7B4CC]">Channels</div>
                  <div className="font-bold text-[#38BDF8]">102 Bands (LVF)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050B1A]/70 border border-[#1E293B]">
                  <div className="text-[10px] text-[#A7B4CC]">Pipeline</div>
                  <div className="font-bold text-emerald-400">IRSA ObsCore</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Launch SPHEREx Explorer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Flagship 2: Planet X Investigation Lab (5 Cols) */}
          <div 
            onClick={() => onNavigate('planet-x')}
            className="lg:col-span-5 group rounded-2xl bg-linear-to-br from-[#0B1630] via-[#09142B] to-[#050B1A] border border-[#1E293B] hover:border-[#8B5CF6] p-6 sm:p-8 space-y-6 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C084FC]">
                  <Orbit className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#C084FC] px-2.5 py-0.5 rounded-full bg-[#050B1A] border border-[#1E293B]">
                  Batygin & Brown Hypotheses
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#8B5CF6] uppercase tracking-wider font-semibold">
                  Dynamical Orbital Mechanics & eTNOs
                </span>
                <h3 className="text-2xl font-bold text-[#F8FAFC] group-hover:text-[#C084FC] transition-colors">
                  Planet X Investigation Lab
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
                Investigate the evidence and competing explanations surrounding the hypothetical ninth planet using known distant Solar System objects (Sedna, 2012 VP113), clustering analysis, and dynamical simulations.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#050B1A]/70 border border-[#1E293B]">
                  <span className="text-[#A7B4CC]">Predicted Mass:</span>
                  <span className="font-bold text-[#F5C451]">5 – 10 M⊕ (~380 AU)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#050B1A]/70 border border-[#1E293B]">
                  <span className="text-[#A7B4CC]">Orbital Signature:</span>
                  <span className="font-bold text-[#C084FC]">ω & Ω Anti-Aligned</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#C084FC]">
              <span>Enter Planet X Investigation Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* STRUCTURED EXPLORATION DOMAINS (4 Thematic Clusters) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Domain 1: Solar System & Orbits */}
          <div className="p-5 rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#38BDF8] font-semibold">
                <span>01. SOLAR SYSTEM</span>
                <Orbit className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Planets & Distant Orbits</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Explore Keplerian mechanics from Mercury out to Sedna and investigate mathematical models for Planet X.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#1E293B]/70">
              <button
                onClick={() => onNavigate('universe')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#38BDF8] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>3D Solar System</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('planet-x')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#8B5CF6] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Planet X Investigation Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Domain 2: Deep Space & Exoplanets */}
          <div className="p-5 rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#C084FC] font-semibold">
                <span>02. DEEP UNIVERSE</span>
                <Disc className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Exoplanets & Galaxies</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Filter 5,500+ confirmed worlds from NASA Exoplanet Archive and inspect extragalactic redshift catalogs.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#1E293B]/70">
              <button
                onClick={() => onNavigate('exoplanets')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#C084FC] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Exoplanet Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('galaxies')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#C084FC] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Galaxy Explorer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Domain 3: Missions & Spectral Science */}
          <div className="p-5 rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#F5C451] font-semibold">
                <span>03. MISSIONS & DEFENSE</span>
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Infrared & Asteroid Watch</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Peel back dust clouds across 102 infrared channels with SPHEREx and monitor near-Earth asteroid approaches.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#1E293B]/70">
              <button
                onClick={() => onNavigate('spherex')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#38BDF8] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>SPHEREx Explorer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('asteroid-watch')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Asteroid Watch (CNEOS)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Domain 4: Data Centre & AI Assistant */}
          <div className="p-5 rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
                <span>04. DATA & PEDAGOGY</span>
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Open Archives & AI Guide</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Search across multi-mission catalogs or ask questions in plain language with verified scientific backing.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#1E293B]/70">
              <button
                onClick={() => onNavigate('data-centre')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#38BDF8] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>NASA Data Centre</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('ai-guide')}
                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#050B1A] text-xs font-mono text-[#F8FAFC] hover:text-[#10B981] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>COSMIC AI Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLANETARY SHOWCASE & CATALOG ("various planets listed") */}
      <section id="planetary-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlanetaryShowcase onNavigate={onNavigate} />
      </section>

      {/* 4. COSMIC ORBITAL ARCHITECTURE DIAGRAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CosmicOrbitalDiagram onNavigate={onNavigate} />
      </section>

      {/* 5. LIVE TELEMETRY RADAR & ASTROPHYSICAL KNOWLEDGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CosmicRadarHUD onNavigate={onNavigate} />
      </section>

      {/* 5B. LIVE NASA OPEN DATA DISPATCH (api.nasa.gov) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NasaLiveDispatch onNavigate={onNavigate} />
      </section>

      {/* 6. HOW COSMIC FRONTIER WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] p-8 sm:p-10 space-y-8 shadow-lg">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-mono font-semibold">
              Exploration Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              How COSMIC FRONTIER Works
            </h2>
            <p className="text-sm text-[#A7B4CC] leading-relaxed">
              Designed for intuitive discovery. Our tools translate raw observational datasets into interactive, scientifically grounded knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#1E293B]/70">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-[#38BDF8] tracking-widest">
                STEP 01
              </div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Select a Target or Realm</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Choose from star-forming nebulae, early galaxies, protoplanetary disks, or scale out to the remote Kuiper Belt and Sedna’s distant trajectory.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-[#C084FC] tracking-widest">
                STEP 02
              </div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Adjust Filters & Scales</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Slide across infrared bands from 0.75 µm to 5.0 µm, compare optical versus infrared with the split slider, or zoom from 1 AU out to 1,000 AU.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-[#F5C451] tracking-widest">
                STEP 03
              </div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Inspect Scientific Clues</h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Read concise verified explanations of water ice signatures, orbital clustering probabilities, and survey limits without any fabricated jargon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SCIENTIFIC DATA NOTICE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-linear-to-r from-[#0B1630] to-[#121B35] border border-[#F5C451]/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
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
        <div className="rounded-2xl bg-linear-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
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
              className="px-8 py-4 rounded-xl bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-[#FFFFFF] font-bold text-sm shadow-xl hover:shadow-[#8B5CF6]/30 transition-all inline-flex items-center gap-2 cursor-pointer"
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
