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
  Waves, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* 1. NOVA-STYLE SCI-FI COMMAND CENTER HERO */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 pt-4">
        <NovaCommandHero onNavigate={onNavigate} />
      </div>

      {/* 2. DISCOVERY CATEGORIES GATEWAY */}
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
                Peel back dense dust clouds with multi-spectral infrared bands, study cosmic inflation, and examine water ice signatures.
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
