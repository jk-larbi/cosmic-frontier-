import { useState, useId, type FC } from 'react';
import { 
  computeReflectedFlux, 
  DISTANCE_SCALE_BENCHMARKS, 
  AU_IN_KM,
  type DistanceBenchmark 
} from '../utils/planetXPhysics';
import { 
  Telescope, 
  Sparkles, 
  Info, 
  Sun, 
  Globe, 
  Clock, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

interface CosmicDistancePlaygroundProps {
  isBeginnerMode?: boolean;
}

export const CosmicDistancePlayground: FC<CosmicDistancePlaygroundProps> = ({
  isBeginnerMode = true
}) => {
  const [selectedDistanceAU, setSelectedDistanceAU] = useState<number>(380);
  const [showExplanation, setShowExplanation] = useState<boolean>(isBeginnerMode);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string>('planet-nine-perihelion');
  const distanceSliderId = useId();

  const fluxData = computeReflectedFlux(selectedDistanceAU, 30.1);
  const earthFluxData = computeReflectedFlux(selectedDistanceAU, 1.0);

  const handleBenchmarkSelect = (b: DistanceBenchmark) => {
    setActiveBenchmarkId(b.id);
    setSelectedDistanceAU(b.distanceAU);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSelectedDistanceAU(val);
    const match = DISTANCE_SCALE_BENCHMARKS.find(b => Math.abs(b.distanceAU - val) < 5);
    setActiveBenchmarkId(match ? match.id : '');
  };

  const currentKm = selectedDistanceAU * AU_IN_KM;
  const currentMillionKm = currentKm / 1e6;

  // Logarithmic position for the visual bar (1 AU = 0%, 1000 AU = 100%)
  const logPercent = Math.min(100, Math.max(0, (Math.log10(selectedDistanceAU) / Math.log10(1000)) * 100));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Plain-Language Intro */}
      <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center border border-[#38BDF8]/30">
              <Telescope className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-[11px] font-mono uppercase font-bold tracking-wider">
                <span>Interactive Scale Lab</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                Cosmic Distance Playground & The Inverse-Fourth-Power Law
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B] text-xs font-mono text-[#F5C451] hover:text-[#F8FAFC] transition-colors self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Concept Explanation' : 'Explain This in Plain Language'}</span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Beginner Explanatory Banner */}
        {showExplanation && (
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#38BDF8]/30 space-y-3 text-xs leading-relaxed text-[#A7B4CC]">
            <div className="flex items-center gap-2 text-[#38BDF8] font-bold font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Why Are Distant Objects in the Solar System So Incredibly Hard to Spot?</span>
            </div>
            <p>
              Stars like the Sun generate their own blinding light. But planets, asteroids, and hypothetical bodies like Planet Nine do not emit visible light—they only shine by <strong>reflecting sunlight</strong> like tiny mirrors.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="font-bold text-[#F8FAFC] block mb-1">Step 1: Sunlight Travels OUT (1/r²)</span>
                <span>As sunlight travels from the Sun to the object, it spreads out across an expanding sphere. By the time it reaches 500 AU, sunlight is 250,000 times dimmer than on Earth.</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="font-bold text-[#F8FAFC] block mb-1">Step 2: Reflected Light Returns (1/r²)</span>
                <span>The tiny fraction of light that bounces off the object must travel all the way BACK to Earth, spreading out a second time. The two factors multiply together: (1/r²) × (1/r²) = <strong>1/r⁴</strong>!</span>
              </div>
            </div>
            <p className="text-[11px] text-[#F5C451] font-mono">
              Key Takeaway: Moving an object just 10 times farther away doesn't make it 100 times fainter—it makes it 10,000 times fainter!
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive Distance Slider & Benchmarks */}
      <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={distanceSliderId} className="text-xs font-mono uppercase text-[#A7B4CC] tracking-wider font-bold">
              Adjust Target Distance (1 to 1,000 AU):
            </label>
            <span className="text-sm font-mono font-extrabold text-[#38BDF8]">
              {selectedDistanceAU.toFixed(1)} AU ({currentMillionKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} Million km)
            </span>
          </div>

          <input
            id={distanceSliderId}
            type="range"
            min="1"
            max="1000"
            step="1"
            value={selectedDistanceAU}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-[#050B1A] rounded-lg appearance-none cursor-pointer accent-[#38BDF8] border border-[#1E293B]"
            aria-label="Distance in Astronomical Units"
          />

          <div className="flex justify-between text-[10px] font-mono text-[#A7B4CC] mt-1">
            <span>1 AU (Earth)</span>
            <span>30 AU (Neptune)</span>
            <span>100 AU</span>
            <span>380 AU (Planet Nine nominal)</span>
            <span>700 AU</span>
            <span>1,000 AU (Sedna aphelion)</span>
          </div>
        </div>

        {/* Visual Logarithmic Distance Track */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#A7B4CC] block">Solar System Proportional Log-Scale:</span>
          <div className="relative h-7 rounded-xl bg-[#050B1A] border border-[#1E293B] overflow-hidden flex items-center px-2">
            {/* Sun anchor */}
            <div className="flex items-center gap-1 z-10">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] font-mono text-amber-300 font-bold">Sun</span>
            </div>

            {/* Benchmark markers on track */}
            {[
              { au: 1, label: 'Earth', color: '#38BDF8' },
              { au: 30.1, label: 'Neptune', color: '#3B82F6' },
              { au: 165, label: 'Voyager 1', color: '#A7B4CC' },
              { au: 380, label: 'P9 nominal', color: '#C084FC' },
              { au: 937, label: 'Sedna max', color: '#FB7185' }
            ].map(m => {
              const left = (Math.log10(m.au) / Math.log10(1000)) * 100;
              return (
                <div 
                  key={m.label} 
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none"
                  style={{ left: `${left}%` }}
                >
                  <div className="w-0.5 h-full opacity-40" style={{ backgroundColor: m.color }} />
                </div>
              );
            })}

            {/* Current Target Indicator */}
            <div 
              className="absolute top-1 bottom-1 w-2.5 rounded-full bg-[#38BDF8] shadow-lg shadow-[#38BDF8]/50 transition-all duration-100 -translate-x-1/2"
              style={{ left: `${logPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Benchmark Preset Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#A7B4CC]">Select Landmark Benchmark:</span>
          <div className="flex flex-wrap gap-2">
            {DISTANCE_SCALE_BENCHMARKS.map(b => {
              const isSelected = activeBenchmarkId === b.id || Math.abs(b.distanceAU - selectedDistanceAU) < 1;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBenchmarkSelect(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    isSelected
                      ? b.category === 'hypothetical'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] font-bold shadow-md shadow-[#8B5CF6]/20'
                        : 'bg-[#38BDF8] text-[#050B1A] border-[#38BDF8] font-bold shadow-md shadow-[#38BDF8]/20'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Real-Time Telemetry & Illumination Physics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Light-Travel Time */}
        <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#A7B4CC] font-bold">Light-Travel Time</span>
            <Clock className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold text-[#F8FAFC] font-mono">
            {fluxData.lightTravelTimeFormatted}
          </div>
          <p className="text-xs text-[#A7B4CC]">
            Time for sunlight to travel from the Sun to this target at the speed of light (~300,000 km/s).
          </p>
        </div>

        {/* Card 2: Reflected Sunlight Law (1/r⁴) */}
        <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#A7B4CC] font-bold">Reflected Sunlight Ratio</span>
            <Activity className="w-4 h-4 text-[#F5C451]" />
          </div>
          <div className="text-2xl font-bold text-[#F5C451] font-mono">
            {fluxData.factorFainter < 1 
              ? `${(1 / fluxData.factorFainter).toFixed(1)}x Brighter` 
              : `${fluxData.factorFainter.toLocaleString()}x Fainter`}
          </div>
          <p className="text-xs text-[#A7B4CC]">
            Compared to Neptune (30.1 AU). By the 1/r⁴ law, an object here reflects this much less light back to Earth.
          </p>
        </div>

        {/* Card 3: Magnitude Drop */}
        <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#A7B4CC] font-bold">Apparent Faintness</span>
            <Globe className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-bold text-[#8B5CF6] font-mono">
            {fluxData.deltaMagnitude > 0 ? `+${fluxData.deltaMagnitude} mag` : `${fluxData.deltaMagnitude} mag`}
          </div>
          <p className="text-xs text-[#A7B4CC]">
            Magnitude difference relative to Neptune. Each +5 magnitudes represents a factor of 100 drop in detected brightness.
          </p>
        </div>

        {/* Card 4: Detection Difficulty */}
        <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#A7B4CC] font-bold">Telescope Difficulty</span>
            <Telescope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-lg font-bold font-mono ${
            fluxData.detectionDifficulty === 'Trivial' ? 'text-emerald-400' :
            fluxData.detectionDifficulty === 'Moderate' ? 'text-[#38BDF8]' :
            fluxData.detectionDifficulty === 'Challenging' ? 'text-amber-400' :
            fluxData.detectionDifficulty === 'Extreme Deep-Sky' ? 'text-orange-400' :
            'text-rose-400'
          }`}>
            {fluxData.detectionDifficulty}
          </div>
          <p className="text-xs text-[#A7B4CC]">
            {selectedDistanceAU <= 35 
              ? 'Easily tracked with standard optical observatories.'
              : selectedDistanceAU <= 150
              ? 'Requires large 4-meter to 8-meter survey telescopes with deep exposures.'
              : 'Requires world-class deep surveys like the Vera C. Rubin Observatory (LSST) or space infrared telescopes.'}
          </p>
        </div>
      </div>

      {/* 4. Comparison Table: Earth vs. Neptune vs. Current Distance */}
      <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#38BDF8]" />
          <span>Physical Scale Comparison Across the Solar System</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#A7B4CC]">
                <th className="pb-3 font-semibold">Location / Benchmark</th>
                <th className="pb-3 font-semibold">Distance (AU)</th>
                <th className="pb-3 font-semibold">Distance (km)</th>
                <th className="pb-3 font-semibold">Light-Travel Time</th>
                <th className="pb-3 font-semibold">Relative Faintness (1/r⁴ vs. Earth)</th>
                <th className="pb-3 font-semibold">Relative Faintness vs. Neptune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-[#F8FAFC]">
              <tr>
                <td className="py-2.5 font-bold text-[#38BDF8]">Earth (1 AU)</td>
                <td className="py-2.5">1.0 AU</td>
                <td className="py-2.5">149.6 Million km</td>
                <td className="py-2.5">8.3 minutes</td>
                <td className="py-2.5 text-emerald-400 font-bold">1.0x (Baseline)</td>
                <td className="py-2.5 text-[#38BDF8]">819,000x Brighter</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#3B82F6]">Neptune (30.1 AU)</td>
                <td className="py-2.5">30.1 AU</td>
                <td className="py-2.5">4,503 Million km</td>
                <td className="py-2.5">4.2 hours</td>
                <td className="py-2.5">819,000x Fainter</td>
                <td className="py-2.5 text-emerald-400 font-bold">1.0x (Baseline)</td>
              </tr>
              <tr className="bg-[#38BDF8]/5">
                <td className="py-2.5 font-bold text-[#F5C451]">
                  Current Target ({selectedDistanceAU} AU)
                </td>
                <td className="py-2.5 font-bold text-[#F5C451]">{selectedDistanceAU.toFixed(1)} AU</td>
                <td className="py-2.5 font-bold text-[#F5C451]">{currentMillionKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} Million km</td>
                <td className="py-2.5 font-bold text-[#F5C451]">{fluxData.lightTravelTimeFormatted}</td>
                <td className="py-2.5 font-bold text-[#F5C451]">{earthFluxData.factorFainter.toLocaleString()}x Fainter</td>
                <td className="py-2.5 font-bold text-[#F5C451]">
                  {fluxData.factorFainter < 1 
                    ? `${(1 / fluxData.factorFainter).toFixed(1)}x Brighter` 
                    : `${fluxData.factorFainter.toLocaleString()}x Fainter`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#8B5CF6]">Planet Nine Nominal (380 AU)</td>
                <td className="py-2.5">380.0 AU</td>
                <td className="py-2.5">56,847 Million km</td>
                <td className="py-2.5">2.2 days</td>
                <td className="py-2.5">20.8 Trillion x Fainter</td>
                <td className="py-2.5">25,400x Fainter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
