import { useState, type FC } from 'react';
import type { AppPage } from '../types';
import { NovaCommandHero } from './NovaCommandHero';
import { PlanetaryShowcase } from './PlanetaryShowcase';
import { CosmicOrbitalDiagram } from './CosmicOrbitalDiagram';
import { CosmicRadarHUD } from './CosmicRadarHUD';
import { NasaLiveDispatch } from './NasaLiveDispatch';
import { GuidedLearningMissions } from './GuidedLearningMissions';
import { CosmicDistancePlayground } from './CosmicDistancePlayground';
import { EvidenceDetective } from './EvidenceDetective';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  ArrowRight,
  Compass,
  Disc,
  Radio,
  Globe,
  Crosshair,
  BookOpen,
  Award,
  Activity,
  Scale
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
  isBeginnerMode?: boolean;
  onOpenGlossary?: (termId?: string) => void;
}

export const HomePage: FC<HomePageProps> = ({ 
  onNavigate,
  isBeginnerMode = true,
  onOpenGlossary
}) => {
  const [activeEduTab, setActiveEduTab] = useState<'missions' | 'distance' | 'evidence'>('missions');

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION & PRIMARY EXPLORATION ACTIONS */}
      <div className="max-w-360 mx-auto px-2 sm:px-4 lg:px-6 pt-4">
        <NovaCommandHero onNavigate={onNavigate} />
      </div>

      {/* 2. DISCOVERY CATEGORIES GATEWAY */}
      <section id="discovery-sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-bold uppercase tracking-wider">
            Exploration Stations
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Explore the Cosmic Frontier
          </h2>
          <p className="text-sm sm:text-base text-[#A7B4CC] leading-relaxed">
            Ten research consoles and interactive simulators engineered for beginners, students, and astronomy explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* 1. Live Cosmic Observatory */}
          <div 
            onClick={() => onNavigate('observatory')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#38BDF8]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                <Telescope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider block">
                  Interactive Motion Viewer
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  Live Observatory
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                60+ dynamic celestial targets across Solar System, asteroids, TNOs, exoplanets, and deep sky with continuous time propagation.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Launch 3D WebGL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 2. Planet X Discovery Lab */}
          <div 
            onClick={() => onNavigate('planet-x')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#8B5CF6]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform">
                <Orbit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold uppercase tracking-wider block">
                  Orbital Mechanics & Sedna
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors mt-0.5">
                  Planet X Discovery Lab
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Simulate 2D orbits of 8 planets and extreme trans-Neptunian objects. Investigate mathematical clues for a hypothetical 9th world.
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
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#8B5CF6]">
              <span>Investigate Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

          {/* 3. Deep-Space Radar */}
          <div 
            onClick={() => {
              const el = document.getElementById('radar-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else onNavigate('planet-x');
            }}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#38BDF8]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider block">
                  Polar Scanning HUD
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  Deep-Space Radar
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Scan outer Solar System boundaries from 5 AU to 1,000 AU with real ICRF heliocentric coordinates and sweep phosphor intensity.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Inspect Radar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 4. Asteroid Watch */}
          <div 
            onClick={() => onNavigate('asteroid-watch')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-emerald-500 p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  NASA JPL CNEOS Feed
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-emerald-400 transition-colors mt-0.5">
                  Asteroid Watch
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Track upcoming near-Earth asteroid encounters in Lunar Distances, inspect 3D pass geometry, and learn how impact risk is assessed.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>View Close Passes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 5. SPHEREx Cosmic Image Lab */}
          <div 
            onClick={() => onNavigate('spherex')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#38BDF8]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider block">
                  102 Spectral Channels
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  SPHEREx Explorer
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Peel back dense dust clouds with infrared wavelengths (0.75–5.0 µm) and examine water ice signatures in stellar nurseries.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Open Image Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 6. Galaxy Explorer */}
          <div 
            onClick={() => onNavigate('galaxies')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#8B5CF6]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold uppercase tracking-wider block">
                  NASA/IPAC Extragalactic
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors mt-0.5">
                  Galaxy Explorer
                </h3>
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Planets & Distant Orbits</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                24+ deep-sky galaxies, active galactic nuclei (AGN), and galaxy clusters sourced from NASA/IPAC NED and CDS SIMBAD.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#8B5CF6]">
              <span>Explore Catalogs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 7. Exoplanet Discovery Lab */}
          <div 
            onClick={() => onNavigate('exoplanets')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#C084FC] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#C084FC]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C084FC]/10 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC] group-hover:scale-105 transition-transform">
                <Disc className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C084FC] font-bold uppercase tracking-wider block">
                  NASA Exoplanet Archive
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#C084FC] transition-colors mt-0.5">
                  Exoplanet Lab
                </h3>
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC]">Exoplanets & Galaxies</h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Compare worlds beyond our Solar System. Filter by transit, radial velocity, or direct imaging, and evaluate habitability zones.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#C084FC]">
              <span>Compare Worlds</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 8. 3D Solar System Explorer */}
          <div 
            onClick={() => onNavigate('universe')}
            className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] p-5 space-y-3.5 shadow-lg hover:shadow-xl hover:shadow-[#38BDF8]/10 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider block">
                  WebGL Three.js Engine
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                  3D Universe
                </h3>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Experience full 360° camera rotation, animated orbital velocities, planetary textures, and Saturn ring geometries.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Enter 3D Space</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE COSMIC OBSERVATORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B1630] via-[#0D1E40] to-[#07132D] border border-[#38BDF8]/30 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-bold uppercase tracking-wider">
                <Telescope className="w-3.5 h-3.5" />
                <span>Station 01 — Cross-Catalog Motion Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                Live Cosmic Observatory
              </h2>
              <p className="text-sm text-[#A7B4CC] leading-relaxed">
                Step into a unified observational environment tracking 60+ verified astronomical objects through space and time. Toggle between 3D WebGL space and 2D celestial sky projections with interactive timeline scrubbing.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#050B1A]/80 border border-[#1E293B]">
                  <span className="text-[10px] text-[#A7B4CC] block">Objects Propagated</span>
                  <span className="text-[#38BDF8] font-bold text-sm">60+ Targets</span>
                </div>
                <div className="p-3 rounded-xl bg-[#050B1A]/80 border border-[#1E293B]">
                  <span className="text-[10px] text-[#A7B4CC] block">Astrometric Frame</span>
                  <span className="text-[#34D399] font-bold text-sm">ICRF / J2000</span>
                </div>
                <div className="p-3 rounded-xl bg-[#050B1A]/80 border border-[#1E293B] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#A7B4CC] block">Time Machine</span>
                  <span className="text-[#C084FC] font-bold text-sm">±10,000 Days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onNavigate('observatory')}
                className="px-6 py-3.5 rounded-xl bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#050B1A] font-bold text-xs sm:text-sm shadow-xl hover:shadow-[#38BDF8]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Telescope className="w-4 h-4" />
                <span>Launch Cosmic Observatory</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('universe')}
                className="px-6 py-3.5 rounded-xl bg-[#050B1A] hover:bg-[#131D38] text-[#F8FAFC] border border-[#1E293B] hover:border-[#38BDF8] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#38BDF8]" />
                <span>Open 3D Solar System</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLANET X DISCOVERY LAB & PLANETARY CATALOG */}
      <section id="planetary-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-mono font-bold uppercase tracking-wider">
            Station 02 — Outer Solar System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Planetary Showcase & Orbital Mechanics
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC]">
            Explore 13 mapped celestial worlds, investigate extreme trans-Neptunian object orbital clustering, and study the mathematical hypothesis for Planet X.
          </p>
        </div>

        <PlanetaryShowcase onNavigate={onNavigate} />
        <CosmicOrbitalDiagram onNavigate={onNavigate} />
      </section>

      {/* 5. DEEP-SPACE RADAR HUD */}
      <section id="radar-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">
                Station 03 — ICRF Heliocentric Astrometry
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-0.5">
              Deep-Space Astrometric Radar Console
            </h2>
          </div>
          <button
            onClick={() => onNavigate('planet-x')}
            className="flex items-center gap-1.5 text-xs font-mono text-[#38BDF8] hover:underline self-start sm:self-auto cursor-pointer"
          >
            <span>Full Planet X Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <CosmicRadarHUD onNavigate={onNavigate} />
      </section>

      {/* 6. ASTEROID WATCH SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Station 04 — NASA JPL CNEOS Close Approaches</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Asteroid Watch & Earth Encounter Monitor
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
              Track real-time close approaches of near-Earth asteroids using authoritative data from NASA’s Center for Near-Earth Object Studies (CNEOS). Includes encounter speed, miss distance in Lunar Distances, and Motion Mode visualization.
            </p>
          </div>

          <button
            onClick={() => onNavigate('asteroid-watch')}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050B1A] font-bold text-xs sm:text-sm shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Launch Asteroid Watch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. SPHEREx EXPLORER & NASA OPEN DATA DISPATCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B5CF6] font-bold">
              Station 05 — NASA Live Open Data Dispatch
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] mt-0.5">
            NASA Science & Infrared Spectroscopy
          </h2>
        </div>

        <NasaLiveDispatch onNavigate={onNavigate} />
      </section>

      {/* 8. GUIDED LEARNING & EDUCATIONAL TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30 text-xs font-mono font-bold uppercase tracking-wider">
            Station 06 — Educational Workshops & Citizen Science
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Interactive Astronomy Learning Hub
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC]">
            Step-by-step learning missions, cosmic distance physics calculators, and scientific evidence debate tools.
          </p>
        </div>

        {/* Tab Controls for Educational Tools */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveEduTab('missions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeEduTab === 'missions'
                ? 'bg-[#38BDF8] text-[#050B1A] shadow-lg'
                : 'bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>5 Guided Learning Missions</span>
          </button>

          <button
            onClick={() => setActiveEduTab('distance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeEduTab === 'distance'
                ? 'bg-[#38BDF8] text-[#050B1A] shadow-lg'
                : 'bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Cosmic Distance Playground</span>
          </button>

          <button
            onClick={() => setActiveEduTab('evidence')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeEduTab === 'evidence'
                ? 'bg-[#38BDF8] text-[#050B1A] shadow-lg'
                : 'bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Evidence Detective</span>
          </button>

          {onOpenGlossary && (
            <button
              onClick={() => onOpenGlossary()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#0B1630] text-[#F5C451] hover:bg-[#F5C451]/10 border border-[#F5C451]/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Astronomy Glossary (25+ Terms)</span>
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-3xl bg-[#0B1630]/60 border border-[#1E293B] p-6 sm:p-8 shadow-2xl">
          {activeEduTab === 'missions' && (
            <GuidedLearningMissions isBeginnerMode={isBeginnerMode} />
          )}
          {activeEduTab === 'distance' && (
            <CosmicDistancePlayground isBeginnerMode={isBeginnerMode} />
          )}
          {activeEduTab === 'evidence' && (
            <EvidenceDetective isBeginnerMode={isBeginnerMode} />
          )}
        </div>
      </section>

      {/* 9. HOW COSMIC FRONTIER WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0B1630]/60 border border-[#1E293B] p-8 sm:p-10 space-y-8 shadow-lg">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-mono font-semibold">
              Exploration Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              How COSMIC FRONTIER Works
            </h2>
            <p className="text-sm text-[#A7B4CC] mt-2">
              You do not need an astrophysics degree. Our workstations translate complex astronomical observations into accessible, interactive knowledge.
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

      {/* 10. SCIENTIFIC DATA NOTICE BANNER */}
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

      {/* 11. AI ASSISTANT CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
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
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#7DD3FC] hover:to-[#0369A1] text-[#050B1A] font-bold text-sm shadow-xl hover:shadow-[#38BDF8]/30 transition-all inline-flex items-center gap-2 cursor-pointer"
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
