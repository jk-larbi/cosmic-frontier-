import type { FC } from 'react';
import type { AppPage } from '../types';
import { Radio, Sparkles, Orbit, Telescope, ChevronRight } from 'lucide-react';

interface CosmicRadarHUDProps {
  onNavigate: (page: AppPage) => void;
}

export const CosmicRadarHUD: FC<CosmicRadarHUDProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. SYSTEM SCAN RADAR HUD (NOVA Command Center inspired) */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] bg-size-[16px_16px] opacity-5 pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold block">
                  Outer Solar System Sweep
                </span>
                <h4 className="text-lg font-bold text-[#F8FAFC]">
                  Deep Space System Scan
                </h4>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30 text-[10px] font-mono font-semibold">
              SCANNER: ACTIVE
            </span>
          </div>

          {/* Circular Radar Canvas */}
          <div className="relative py-6 flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#38BDF8]/30 bg-[#050B1A]/80 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Concentric distance rings */}
              <div className="absolute inset-4 rounded-full border border-[#38BDF8]/20" />
              <div className="absolute inset-14 rounded-full border border-[#38BDF8]/25" />
              <div className="absolute inset-24 rounded-full border border-[#38BDF8]/30" />
              <div className="absolute inset-28.75 rounded-full border border-[#F5C451]/40" />

              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-[#38BDF8]/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-px bg-[#38BDF8]/20" />
              </div>

              {/* Radar Rotating Sweep Line */}
              <div className="absolute inset-0 radar-sweep pointer-events-none">
                <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-linear-to-tr from-[#38BDF8]/30 via-[#38BDF8]/10 to-transparent" />
              </div>

              {/* Central Sun Dot */}
              <div className="relative z-10 w-3 h-3 rounded-full bg-[#F5C451] shadow-lg shadow-[#F5C451]/50" />

              {/* Signal Blip 1: Sedna */}
              <div className="absolute top-16 right-20 group cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] block beacon-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#E11D48] absolute top-0.5 left-0.5 block" />
                <span className="hidden group-hover:block absolute left-4 -top-2 bg-[#050B1A] border border-[#E11D48] text-[9px] font-mono text-[#FDA4AF] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                  90377 Sedna (76 AU)
                </span>
              </div>

              {/* Signal Blip 2: 2012 VP113 */}
              <div className="absolute top-28 right-12 group cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-[#FB7185] block" />
                <span className="hidden group-hover:block absolute left-4 -top-2 bg-[#050B1A] border border-[#FB7185] text-[9px] font-mono text-[#FDA4AF] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                  2012 VP113 (80.5 AU)
                </span>
              </div>

              {/* Signal Blip 3: Leleākūhonua */}
              <div className="absolute bottom-16 right-24 group cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-[#FDA4AF] block" />
                <span className="hidden group-hover:block absolute left-4 -top-2 bg-[#050B1A] border border-[#FDA4AF] text-[9px] font-mono text-[#FDA4AF] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                  Leleākūhonua (65 AU)
                </span>
              </div>

              {/* Signal Blip 4: Hypothetical Planet X Target Zone */}
              <div className="absolute bottom-20 left-16 group cursor-pointer">
                <span className="w-4 h-4 rounded-full bg-[#8B5CF6]/40 block beacon-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] absolute top-1 left-1 block shadow-lg shadow-[#8B5CF6]/80" />
                <span className="hidden group-hover:block absolute right-5 -top-2 bg-[#050B1A] border border-[#8B5CF6] text-[9px] font-mono text-[#C084FC] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                  Planet X Predicted Zone (~420 AU)
                </span>
              </div>

              {/* Distance Labels on the rings */}
              <span className="absolute top-2 text-[8px] font-mono text-[#38BDF8]/60">500 AU</span>
              <span className="absolute top-10 text-[8px] font-mono text-[#38BDF8]/60">250 AU</span>
              <span className="absolute top-20 text-[8px] font-mono text-[#F5C451]/70">30 AU (Neptune)</span>
            </div>
          </div>

          {/* Telemetry readouts */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <span className="text-[10px] text-[#A7B4CC] block">Clustered Targets:</span>
              <span className="text-[#38BDF8] font-bold">3 Confirmed eTNOs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <span className="text-[10px] text-[#A7B4CC] block">Hypothetical Perturber:</span>
              <span className="text-[#8B5CF6] font-bold">Planet X (~420 AU)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('planet-x')}
          className="w-full py-3 px-4 rounded-xl bg-[#050B1A] hover:bg-[#132247] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Orbit className="w-4 h-4" />
          <span>Launch Full 2D Orbital Radar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. GLOWING NEUTRON STAR / COSMIC FACT BANNER (Uzay Keşif inspired) */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
        {/* Radiant blue nebula background */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 border border-[#F5C451]/30 flex items-center justify-center text-[#F5C451]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5C451] font-bold block">
                  Cosmic Knowledge & Spectroscopy
                </span>
                <h4 className="text-lg font-bold text-[#F8FAFC]">
                  Astrophysical Fact of the Day
                </h4>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#A7B4CC] px-2 py-0.5 rounded bg-[#050B1A] border border-[#1E293B]">
              NASA / Caltech Archive
            </span>
          </div>

          {/* Luminous Pulsar / Magnetar Graphic */}
          <div className="h-44 rounded-2xl bg-[#050B1A] border border-[#1E293B] relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="pulsarCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#38BDF8" />
                  <stop offset="70%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#050B1A" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulsarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#050B1A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Magnetic field lines */}
              <ellipse cx="200" cy="80" rx="90" ry="40" stroke="#38BDF8" strokeWidth="1.2" opacity="0.4" fill="none" />
              <ellipse cx="200" cy="80" rx="140" ry="60" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" fill="none" />
              <ellipse cx="200" cy="80" rx="180" ry="75" stroke="#38BDF8" strokeWidth="0.8" opacity="0.2" fill="none" />

              {/* Radiant Jet beams */}
              <line x1="200" y1="0" x2="200" y2="160" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
              <line x1="200" y1="0" x2="200" y2="160" stroke="#38BDF8" strokeWidth="8" opacity="0.3" />

              {/* Glowing Core */}
              <circle cx="200" cy="80" r="45" fill="url(#pulsarGlow)" />
              <circle cx="200" cy="80" r="22" fill="url(#pulsarCore)" />
              <circle cx="200" cy="80" r="8" fill="#FFFFFF" />
            </svg>

            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#38BDF8] bg-[#050B1A]/80 px-2 py-0.5 rounded border border-[#38BDF8]/30">
              Magnetar Core Simulation • ~10¹¹ Gauss Field
            </div>
          </div>

          {/* Educational Content */}
          <div className="space-y-2">
            <h5 className="text-base font-bold text-[#F8FAFC]">
              How Interstellar Ices Seed New Planets
            </h5>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              In deep space where temperatures drop to -240°C, water (H₂O), carbon dioxide (CO₂), and methanol freeze onto microscopic dust grains. These coatings make dust grains sticky, allowing them to clump into comets and rocky planetesimals.
            </p>
            <p className="text-xs text-[#F5C451] leading-relaxed">
              SPHEREx maps the 3.05 µm water-ice absorption signature across millions of stellar nurseries to reveal where habitable ingredients originate.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('spherex')}
          className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#F5C451] to-[#EAB308] text-[#050B1A] font-bold text-xs shadow-lg hover:shadow-[#F5C451]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Telescope className="w-4 h-4" />
          <span>Examine Water Ice Bands in SPHEREx</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

