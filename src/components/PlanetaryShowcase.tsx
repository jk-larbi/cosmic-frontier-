import { useState, type FC } from 'react';
import type { AppPage } from '../types';
import { SOLAR_SYSTEM_OBJECTS } from '../data/solarSystemData';
import { PlanetGraphic } from './PlanetGraphic';
import { 
  Orbit, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

interface PlanetaryShowcaseProps {
  onNavigate: (page: AppPage) => void;
}

export const PlanetaryShowcase: FC<PlanetaryShowcaseProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'terrestrial' | 'giant' | 'etno' | 'hypothetical'>('all');
  const [spotlightIndex, setSpotlightIndex] = useState<number>(5); // default Saturn (index 5) or Planet X

  const spotlightObject = SOLAR_SYSTEM_OBJECTS[spotlightIndex] || SOLAR_SYSTEM_OBJECTS[5];

  const filteredObjects = SOLAR_SYSTEM_OBJECTS.filter(obj => {
    if (obj.id === 'sun') return false; // exclude central star from planet cards grid
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'terrestrial') return obj.type === 'Terrestrial Planet';
    if (selectedFilter === 'giant') return obj.type === 'Gas Giant' || obj.type === 'Ice Giant';
    if (selectedFilter === 'etno') return obj.type === 'Extreme TNO';
    if (selectedFilter === 'hypothetical') return obj.isHypothetical || obj.type === 'Dwarf Planet';
    return true;
  });

  const spotlightList = [
    { label: 'Saturn', index: 6 }, // Saturn index in array
    { label: 'Jupiter', index: 5 }, // Jupiter
    { label: 'Earth', index: 3 }, // Earth
    { label: 'Mars', index: 4 }, // Mars
    { label: 'Neptune', index: 8 }, // Neptune
    { label: 'Sedna', index: 10 }, // Sedna
    { label: 'Planet X', index: 13 } // Planet X
  ];

  return (
    <div className="space-y-12">
      {/* 1. FEATURED WORLD SPOTLIGHT BANNER (Uzay Keşif & NOVA inspired) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0B1630] via-[#070E22] to-[#050B1A] border border-[#1E293B] overflow-hidden p-6 sm:p-10 shadow-2xl">
        {/* Glow backdrop */}
        <div 
          className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: spotlightObject.color }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Spotlight Info */}
          <div className="space-y-5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-semibold uppercase tracking-wider">
                Planetary Spotlight
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                  spotlightObject.isHypothetical
                    ? 'bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40'
                    : 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                }`}
              >
                {spotlightObject.statusLabel}
              </span>
            </div>

            <div>
              <h3 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
                {spotlightObject.name.split('(')[0].trim()}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-[#F5C451] mt-1">
                {spotlightObject.type} • {spotlightObject.semiMajorAxisAU} AU from Sun
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#A7B4CC] leading-relaxed">
              {spotlightObject.description}
            </p>

            {/* Scientific insight snippet */}
            <div className="p-3.5 rounded-xl bg-[#050B1A]/80 border border-[#1E293B] text-xs text-[#A7B4CC] space-y-1">
              <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Astrophysical Significance:</span>
              </div>
              <p>{spotlightObject.scientificContext}</p>
            </div>

            {/* Quick telemetry metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 font-mono tabular-nums text-xs">
              <div className="p-2.5 rounded-xl bg-[#070E22] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Semi-Major Axis</span>
                <span className="text-[#38BDF8] font-bold text-sm">{spotlightObject.semiMajorAxisAU} AU</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070E22] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Orbital Period</span>
                <span className="text-[#F5C451] font-bold text-sm">
                  {typeof spotlightObject.orbitalPeriodYears === 'number'
                    ? `${spotlightObject.orbitalPeriodYears.toLocaleString()}y`
                    : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070E22] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Earth Mass Ratio</span>
                <span className="text-[#F8FAFC] font-bold text-sm">{spotlightObject.massEarthRelative}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('planet-x')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-[#050B1A] font-bold text-sm shadow-lg hover:shadow-[#38BDF8]/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Orbit className="w-4 h-4" />
                <span>Simulate in Planet X Investigation Lab</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('ai-guide')}
                className="px-5 py-3 rounded-xl bg-[#0B1630] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] hover:border-[#F5C451] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5C451]" />
                <span>Ask AI Guide About {spotlightObject.name.split('(')[0].trim()}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Realistic Planet Artwork */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative p-6 flex items-center justify-center">
              <PlanetGraphic
                planetId={spotlightObject.id}
                size={220}
                animate={true}
              />
            </div>

            {/* Carousel navigation pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              {spotlightList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSpotlightIndex(item.index)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    spotlightIndex === item.index
                      ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                      : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLANETARY GRID & FILTER TABS ("various planets listed") */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
              Solar System & Deep Space Catalog
            </h3>
            <p className="text-xs sm:text-sm text-[#A7B4CC] mt-1">
              Select any celestial body to inspect its orbital mechanics, physical data, and observational status.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0B1630] border border-[#1E293B] text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              All Worlds (13)
            </button>
            <button
              onClick={() => setSelectedFilter('terrestrial')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedFilter === 'terrestrial'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              Terrestrial (4)
            </button>
            <button
              onClick={() => setSelectedFilter('giant')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedFilter === 'giant'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              Giants (4)
            </button>
            <button
              onClick={() => setSelectedFilter('etno')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedFilter === 'etno'
                  ? 'bg-[#E11D48] text-[#FFFFFF] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              Extreme TNOs (3)
            </button>
            <button
              onClick={() => setSelectedFilter('hypothetical')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                selectedFilter === 'hypothetical'
                  ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              Planet X & Dwarf (2)
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredObjects.map((obj) => (
            <div
              key={obj.id}
              className="group rounded-2xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8]/60 p-5 space-y-4 shadow-lg hover:shadow-2xl hover:shadow-[#38BDF8]/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Type & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7B4CC]">
                    {obj.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      obj.isHypothetical
                        ? 'bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/30'
                        : 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                    }`}
                  >
                    {obj.statusLabel}
                  </span>
                </div>

                {/* Visual Artwork Center */}
                <div className="h-32 flex items-center justify-center p-2 bg-[#050B1A]/60 rounded-xl border border-[#1E293B]/50 group-hover:scale-105 transition-transform">
                  <PlanetGraphic planetId={obj.id} size={obj.id === 'saturn' ? 85 : 75} />
                </div>

                {/* Name & Distance */}
                <div>
                  <h4 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                    {obj.name.split('(')[0].trim()}
                  </h4>
                  <div className="text-xs font-mono tabular-nums text-[#F5C451] flex items-center justify-between mt-0.5">
                    <span>Distance: {obj.semiMajorAxisAU} AU</span>
                    <span className="text-[#A7B4CC]">
                      {typeof obj.orbitalPeriodYears === 'number'
                        ? `${obj.orbitalPeriodYears.toLocaleString()} yrs`
                        : 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#A7B4CC] leading-relaxed line-clamp-2">
                  {obj.description}
                </p>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono tabular-nums text-[#A7B4CC]">
                  <div className="p-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]/60">
                    <span className="text-[9px] block text-[#A7B4CC]/70">Radius</span>
                    <span className="text-[#F8FAFC]">
                      {typeof obj.radiusKm === 'number' ? `${obj.radiusKm.toLocaleString()} km` : obj.radiusKm}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]/60">
                    <span className="text-[9px] block text-[#A7B4CC]/70">Eccentricity</span>
                    <span className="text-[#F8FAFC]">{obj.eccentricity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigate('planet-x')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#050B1A] hover:bg-[#38BDF8] text-[#A7B4CC] hover:text-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3"
              >
                <span>Track in Planet X Investigation Lab</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
