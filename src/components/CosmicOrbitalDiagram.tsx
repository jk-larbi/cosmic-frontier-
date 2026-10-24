import { useState, type FC } from 'react';
import type { AppPage } from '../types';
import { SOLAR_SYSTEM_OBJECTS } from '../data/solarSystemData';
import { Orbit, ChevronRight } from 'lucide-react';

interface CosmicOrbitalDiagramProps {
  onNavigate: (page: AppPage) => void;
  onSelectObject?: (objectId: string) => void;
}

export const CosmicOrbitalDiagram: FC<CosmicOrbitalDiagramProps> = ({ onNavigate }) => {
  const [activeScale, setActiveScale] = useState<'inner' | 'outer' | 'deep'>('deep');
  const [hoveredId, setHoveredId] = useState<string | null>('planet-x');

  const hoveredObj = SOLAR_SYSTEM_OBJECTS.find(o => o.id === hoveredId) || SOLAR_SYSTEM_OBJECTS.find(o => o.id === 'planet-x');

  return (
    <div className="relative rounded-2xl bg-[#070D1E] border border-[#1E293B] overflow-hidden shadow-2xl">
      {/* Background starlight & nebula gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.04)_0%,transparent_70%)]" />
      </div>

      {/* Header controls bar */}
      <div className="relative z-10 px-6 py-5 border-b border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#050B1A]/70 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] beacon-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">
              Solar System Telemetry & Orbital Architecture
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#F8FAFC] tracking-tight mt-0.5">
            Cosmic Orbital Plane Map
          </h3>
        </div>

        {/* Scale Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1630] border border-[#1E293B]">
          <button
            onClick={() => setActiveScale('inner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeScale === 'inner'
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-md'
                : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Inner (0–5 AU)
          </button>
          <button
            onClick={() => setActiveScale('outer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeScale === 'outer'
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-md'
                : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Major (0–35 AU)
          </button>
          <button
            onClick={() => setActiveScale('deep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeScale === 'deep'
                ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold shadow-md'
                : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Deep Cosmos & Planet X (0–1000 AU)
          </button>
        </div>
      </div>

      {/* Diagram Canvas Area */}
      <div className="relative p-4 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
        {/* SVG Orbital Plotter */}
        <div className="relative w-full lg:w-2/3 aspect-16/10 bg-[#050B1A]/80 rounded-2xl border border-[#1E293B]/70 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="sunGlowSmall" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
                <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="orbitLineGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Grid & Coordinate Axes */}
            <line x1="0" y1="250" x2="800" y2="250" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
            <line x1="380" y1="0" x2="380" y2="500" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />

            {/* Central Sun */}
            <circle cx="380" cy="250" r="14" fill="url(#sunGlowSmall)" />
            <circle cx="380" cy="250" r="5" fill="#FFFBEB" />
            <text x="380" y="275" textAnchor="middle" fill="#FEF08A" fontSize="10" fontFamily="monospace" fontWeight="bold">
              SUN (0 AU)
            </text>

            {activeScale === 'inner' && (
              <>
                {/* Mercury */}
                <ellipse cx="380" cy="250" rx="35" ry="32" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" fill="none" />
                <circle cx="415" cy="250" r="4" fill="#94A3B8" />
                <text x="422" y="248" fill="#CBD5E1" fontSize="9" fontFamily="monospace">Mercury (0.39 AU)</text>

                {/* Venus */}
                <ellipse cx="380" cy="250" rx="65" ry="62" stroke="#FBBF24" strokeWidth="1" opacity="0.7" fill="none" />
                <circle cx="335" cy="205" r="5" fill="#FBBF24" />
                <text x="345" y="200" fill="#FDE68A" fontSize="9" fontFamily="monospace">Venus (0.72 AU)</text>

                {/* Earth */}
                <ellipse cx="380" cy="250" rx="100" ry="95" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" fill="none" />
                <circle cx="480" cy="250" r="6" fill="#38BDF8" />
                <text x="490" y="254" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">Earth (1.0 AU)</text>

                {/* Mars */}
                <ellipse cx="380" cy="250" rx="150" ry="142" stroke="#F87171" strokeWidth="1" opacity="0.7" fill="none" />
                <circle cx="270" cy="150" r="5" fill="#F87171" />
                <text x="210" y="145" fill="#FCA5A5" fontSize="9" fontFamily="monospace">Mars (1.52 AU)</text>

                {/* Asteroid Belt representation */}
                <ellipse cx="380" cy="250" rx="220" ry="210" stroke="#F5C451" strokeWidth="8" strokeDasharray="2 12" opacity="0.25" fill="none" />
                <text x="380" y="475" textAnchor="middle" fill="#F5C451" fontSize="9" fontFamily="monospace">Asteroid Belt (2.2–3.2 AU)</text>
              </>
            )}

            {activeScale === 'outer' && (
              <>
                {/* Inner planets clustered */}
                <circle cx="380" cy="250" r="20" fill="#38BDF8" opacity="0.15" />
                <text x="380" y="235" textAnchor="middle" fill="#A7B4CC" fontSize="8" fontFamily="monospace">Inner Worlds &lt; 2 AU</text>

                {/* Jupiter */}
                <ellipse cx="380" cy="250" rx="75" ry="70" stroke="#FB923C" strokeWidth="1.5" opacity="0.7" fill="none" />
                <circle cx="455" cy="250" r="7" fill="#FB923C" />
                <text x="465" y="254" fill="#FDBA74" fontSize="9" fontFamily="monospace">Jupiter (5.2 AU)</text>

                {/* Saturn */}
                <ellipse cx="380" cy="250" rx="135" ry="125" stroke="#FCD34D" strokeWidth="1.5" opacity="0.7" fill="none" />
                <circle cx="300" cy="145" r="6" fill="#FCD34D" />
                <text x="235" y="140" fill="#FDE68A" fontSize="9" fontFamily="monospace">Saturn (9.58 AU)</text>

                {/* Uranus */}
                <ellipse cx="380" cy="250" rx="210" ry="195" stroke="#67E8F9" strokeWidth="1.2" opacity="0.7" fill="none" />
                <circle cx="210" cy="330" r="5" fill="#67E8F9" />
                <text x="145" y="345" fill="#A5F3FC" fontSize="9" fontFamily="monospace">Uranus (19.2 AU)</text>

                {/* Neptune (Boundary at 30 AU) */}
                <ellipse cx="380" cy="250" rx="290" ry="265" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" fill="none" />
                <circle cx="670" cy="250" r="6" fill="#3B82F6" />
                <text x="680" y="254" fill="#93C5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">Neptune (30.0 AU - Classical Boundary)</text>

                {/* Kuiper Belt band */}
                <ellipse cx="380" cy="250" rx="340" ry="310" stroke="#8B5CF6" strokeWidth="14" strokeDasharray="3 16" opacity="0.2" fill="none" />
                <text x="380" y="480" textAnchor="middle" fill="#C084FC" fontSize="9" fontFamily="monospace">Kuiper Belt Realm (30–50 AU)</text>
              </>
            )}

            {activeScale === 'deep' && (
              <>
                {/* 30 AU Neptune boundary compressed */}
                <circle cx="380" cy="250" r="32" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" fill="none" />
                <text x="380" y="215" textAnchor="middle" fill="#38BDF8" fontSize="8" fontFamily="monospace">Neptune Boundary (30 AU)</text>

                {/* Sedna orbit (Elongated toward bottom-right) */}
                <ellipse
                  cx="440"
                  cy="270"
                  rx="180"
                  ry="75"
                  stroke="#E11D48"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  fill="none"
                  transform="rotate(-25 380 250)"
                  className="cursor-pointer hover:stroke-width-3"
                  onMouseEnter={() => setHoveredId('sedna')}
                />
                <circle cx="560" cy="210" r="5" fill="#E11D48" />
                <line x1="560" y1="210" x2="610" y2="180" stroke="#E11D48" strokeWidth="1" strokeDasharray="2 2" />
                <text x="615" y="178" fill="#FDA4AF" fontSize="9" fontFamily="monospace">Sedna (Perihelion: 76 AU → Aphelion: 937 AU)</text>

                {/* 2012 VP113 */}
                <ellipse
                  cx="430"
                  cy="260"
                  rx="130"
                  ry="60"
                  stroke="#FB7185"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  fill="none"
                  transform="rotate(-15 380 250)"
                  onMouseEnter={() => setHoveredId('vp113')}
                />
                <circle cx="490" cy="220" r="4" fill="#FB7185" />
                <text x="500" y="215" fill="#FB7185" fontSize="8" fontFamily="monospace">2012 VP113 (80.5 AU)</text>

                {/* HYPOTHETICAL PLANET X ORBIT (Anti-aligned toward upper-left) */}
                <ellipse
                  cx="310"
                  cy="235"
                  rx="170"
                  ry="85"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="none"
                  transform="rotate(155 380 250)"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredId('planet-x')}
                />
                {/* Planet X Node */}
                <g transform="translate(190, 215)" onMouseEnter={() => setHoveredId('planet-x')} className="cursor-pointer">
                  <circle cx="0" cy="0" r="10" fill="#8B5CF6" opacity="0.3" className="beacon-pulse" />
                  <circle cx="0" cy="0" r="7" fill="#8B5CF6" />
                  <circle cx="0" cy="0" r="9" fill="none" stroke="#C084FC" strokeWidth="1.5" />
                  <line x1="0" y1="0" x2="-35" y2="-30" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 2" />
                  <rect x="-175" y="-50" width="135" height="24" rx="4" fill="#0B1630" stroke="#8B5CF6" strokeWidth="1" />
                  <text x="-168" y="-34" fill="#F8FAFC" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    PLANET X [Hypothetical]
                  </text>
                  <text x="-168" y="-22" fill="#A7B4CC" fontSize="8" fontFamily="monospace">
                    Semi-Major: ~420 AU
                  </text>
                </g>

                {/* Legend callout */}
                <g transform="translate(40, 420)">
                  <rect x="0" y="0" width="260" height="55" rx="8" fill="#050B1A" stroke="#1E293B" opacity="0.9" />
                  <circle cx="15" cy="18" r="4" fill="#E11D48" />
                  <text x="25" y="21" fill="#A7B4CC" fontSize="9" fontFamily="monospace">Clustered eTNOs (Perihelion &gt; 65 AU)</text>
                  <line x1="10" y1="36" x2="20" y2="36" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="25" y="39" fill="#A78BFA" fontSize="9" fontFamily="monospace">Hypothetical Anti-Aligned Orbit</text>
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Telemetry Detail Sidebar on Selected/Hovered Object */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
                Orbital Telemetry HUD
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  hoveredObj?.isHypothetical
                    ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30'
                    : 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                }`}
              >
                {hoveredObj?.statusLabel}
              </span>
            </div>

            <h4 className="text-xl font-bold text-[#F8FAFC]">
              {hoveredObj?.name}
            </h4>

            <p className="text-xs text-[#A7B4CC] leading-relaxed line-clamp-3">
              {hoveredObj?.description}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Semi-Major Axis:</span>
                <span className="text-[#38BDF8] font-bold">{hoveredObj?.semiMajorAxisAU} AU</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Orbital Period:</span>
                <span className="text-[#F5C451] font-bold">
                  {typeof hoveredObj?.orbitalPeriodYears === 'number'
                    ? `${hoveredObj.orbitalPeriodYears.toLocaleString()} yrs`
                    : 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Perihelion (Closest):</span>
                <span className="text-[#F8FAFC] font-bold">{hoveredObj?.perihelionAU} AU</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Eccentricity:</span>
                <span className="text-[#F8FAFC] font-bold">{hoveredObj?.eccentricity}</span>
              </div>
            </div>

            {/* Scientific Note */}
            <div className="p-2.5 rounded-lg bg-[#0B1630]/60 border border-[#1E293B] text-[11px] text-[#A7B4CC]">
              <span className="text-[#F5C451] font-semibold block mb-0.5">Scientific Insight:</span>
              <p className="leading-tight">{hoveredObj?.scientificContext}</p>
            </div>

            <button
              onClick={() => onNavigate('planet-x')}
              className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-[#FFFFFF] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Orbit className="w-4 h-4" />
              <span>Simulate in Planet X Investigation Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
