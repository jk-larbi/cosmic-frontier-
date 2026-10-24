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
  Globe,
  Compass,
  Disc,
  Radio
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Live Space Observatory (Stage 7 Upgrade) */}
          <div 
            onClick={() => onNavigate('live-space')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#38BDF8]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                  NASA JPL Horizons Ephemeris
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  Live Space Observatory
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Monitor real-time planetary motion, J2000 state vectors, orbital velocities, and distances for 18 Solar System objects in 3D and 2D.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Real-Time Ephemerides</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card: Asteroid Watch (Stage 7 Upgrade) */}
          <div 
            onClick={() => onNavigate('asteroid-watch')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-emerald-500 p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  NASA JPL CNEOS CAD Feed
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-emerald-400 transition-colors mt-0.5">
                  Earth Approach Monitor
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Track upcoming near-Earth asteroid close passes in Lunar Distances, inspect encounter geometry, and learn how NASA assesses impact risk.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>CNEOS Close Approaches</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 1: 3D Solar System Explorer */}
          <div 
            onClick={() => onNavigate('universe')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#38BDF8]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                <Orbit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                  Interactive 3D WebGL
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  3D Solar System
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Explore a live 3D planetary system with full camera rotation, smooth object zoom, animated Keplerian orbits, and Saturn's rings.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Three.js Visualizer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Exoplanet Discovery Lab */}
          <div 
            onClick={() => onNavigate('exoplanets')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#8B5CF6]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C084FC] group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C084FC] font-bold uppercase tracking-wider">
                  NASA Exoplanet Archive
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#C084FC] transition-colors mt-0.5">
                  Exoplanet Lab
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Discover worlds beyond our Solar System. Filter by transit, radial velocity, or direct imaging, and compare physical parameters.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#C084FC]">
              <span>Comparative Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Infrared Spectroscopy */}
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
                  SPHEREx Mission
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  Cosmic Image Lab
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

          {/* Card: Galaxy Explorer */}
          <div 
            onClick={() => onNavigate('galaxies')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#8B5CF6]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
                <Disc className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold uppercase tracking-wider">
                  NASA/IPAC Extragalactic
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors mt-0.5">
                  Galaxy Explorer
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Discover 24+ deep-sky galaxies, active galactic nuclei (AGN), and galaxy clusters from NASA/IPAC NED and CDS SIMBAD.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#8B5CF6]">
              <span>24+ Catalogs & Live NED</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: NASA Data Centre */}
          <div 
            onClick={() => onNavigate('data-centre')}
            className="group rounded-3xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-[#38BDF8]/15 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                  Multi-Mission Archive
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  NASA Data Centre
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Query confirmed exoplanets, JPL Horizons planetary ephemerides, small body orbits, and CDS SIMBAD stellar benchmarks.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Live TAP & SBDB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: AI Space Guide */}
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
        <div className="rounded-3xl bg-linear-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
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
