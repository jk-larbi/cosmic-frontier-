import { useState, useRef, useEffect, type FC } from 'react';
import { SOLAR_SYSTEM_OBJECTS } from '../data/solarSystemData';
import { 
  SCIENTIFIC_SEARCH_CARDS, 
  EVIDENCE_TOPICS, 
  CANDIDATE_CASES 
} from '../data/evidenceData';
import type { SolarSystemObject, EvidenceTopic, CandidateCase, AppPage } from '../types';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { 
  Orbit, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  Compass,
  Eye,
  Telescope,
  Scale,
  CheckCircle2,
  Info,
  Radio,
  Globe,
  ArrowRight
} from 'lucide-react';

type ScalePreset = 'inner' | 'outer' | 'distant';

interface PlanetXExplorerProps {
  onNavigate?: (page: AppPage) => void;
}

export const PlanetXExplorer: FC<PlanetXExplorerProps> = ({ onNavigate }) => {
  // 1. Selected Object State
  const [selectedObject, setSelectedObject] = useState<SolarSystemObject>(
    SOLAR_SYSTEM_OBJECTS.find(o => o.id === 'planet-x') || SOLAR_SYSTEM_OBJECTS[0]
  );

  // 2. Scale & Viewport State
  const [scalePreset, setScalePreset] = useState<ScalePreset>('distant');
  const [pixelsPerAU, setPixelsPerAU] = useState<number>(0.45); // default shows up to ~1000 AU
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3. Visibility Toggles
  const [showKnownPlanets, setShowKnownPlanets] = useState<boolean>(true);
  const [showDistantObjects, setShowDistantObjects] = useState<boolean>(true);
  const [showPlanetXOrbit, setShowPlanetXOrbit] = useState<boolean>(true);
  const [isAnimated, setIsAnimated] = useState<boolean>(false); // static by default for scientific honesty

  // 4. Selected Evidence Topic
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceTopic>(EVIDENCE_TOPICS[0]);

  // 5. Candidate Investigation State
  const [activeCandidate, setActiveCandidate] = useState<CandidateCase>(CANDIDATE_CASES[0]);
  const [userClassification, setUserClassification] = useState<string | null>(null);
  const [blinkEpoch, setBlinkEpoch] = useState<'epoch1' | 'epoch2'>('epoch1');
  const [isBlinkingAuto, setIsBlinkingAuto] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);

  // Scale preset switch handler
  const handleScalePresetChange = (preset: ScalePreset) => {
    setScalePreset(preset);
    setPanOffset({ x: 0, y: 0 });
    switch (preset) {
      case 'inner':
        setPixelsPerAU(120); // 1 AU is 120px
        break;
      case 'outer':
        setPixelsPerAU(8); // 35 AU is ~280px
        break;
      case 'distant':
      default:
        setPixelsPerAU(0.45); // 1000 AU is ~450px
        break;
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => setPixelsPerAU(prev => Math.min(prev * 1.4, 250));
  const handleZoomOut = () => setPixelsPerAU(prev => Math.max(prev / 1.4, 0.1));
  const handleReset = () => {
    setPanOffset({ x: 0, y: 0 });
    handleScalePresetChange(scalePreset);
  };

  // Canvas Mouse Interaction for Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Canvas Touch Interaction for Panning
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    dragStartRef.current = { x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPanOffset({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => setIsPanning(false);

  // Keyboard accessibility for the orbital diagram
  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const step = 30;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      handleReset();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPanOffset(prev => ({ ...prev, x: prev.x + step }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPanOffset(prev => ({ ...prev, x: prev.x - step }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPanOffset(prev => ({ ...prev, y: prev.y + step }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPanOffset(prev => ({ ...prev, y: prev.y - step }));
    }
  };

  // Click on Canvas to Select Nearest Object
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / (2 * (window.devicePixelRatio || 1)) + panOffset.x;
    const centerY = canvas.height / (2 * (window.devicePixelRatio || 1)) + panOffset.y;

    let closestObj: SolarSystemObject | null = null;
    let minDistance = 25; // pixel hit radius

    for (const obj of SOLAR_SYSTEM_OBJECTS) {
      if (obj.id === 'sun') {
        const d = Math.hypot(clickX - centerX, clickY - centerY);
        if (d < minDistance) {
          closestObj = obj;
          minDistance = d;
        }
        continue;
      }

      // Check visibility filter
      if (!showKnownPlanets && (obj.type === 'Terrestrial Planet' || obj.type === 'Gas Giant' || obj.type === 'Ice Giant')) {
        continue;
      }
      if (!showDistantObjects && (obj.type === 'Extreme TNO' || obj.id === 'pluto')) {
        continue;
      }
      if (!showPlanetXOrbit && obj.id === 'planet-x') {
        continue;
      }

      const pos = computeObjectScreenPos(obj, centerX, centerY, pixelsPerAU, isAnimated ? simTimeRef.current : 0);
      const d = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (d < minDistance) {
        closestObj = obj;
        minDistance = d;
      }
    }

    if (closestObj) {
      setSelectedObject(closestObj);
    }
  };

  // Compute Keplerian 2D Screen Position
  const computeObjectScreenPos = (
    obj: SolarSystemObject,
    centerX: number,
    centerY: number,
    scale: number,
    time: number
  ) => {
    if (obj.semiMajorAxisAU === 0) return { x: centerX, y: centerY };

    const a = obj.semiMajorAxisAU;
    const e = obj.eccentricity;
    const period = Math.max(obj.orbitalPeriodYears, 0.001);

    // If static, show perihelion point (E = 0)
    const meanAnomaly = isAnimated ? (2 * Math.PI * (time / period)) % (2 * Math.PI) : 0;

    let E = meanAnomaly;
    for (let i = 0; i < 5; i++) {
      E = E - (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    }

    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const omega = (obj.argumentOfPerihelionDeg * Math.PI) / 180;
    const xAU = xOrb * Math.cos(omega) - yOrb * Math.sin(omega);
    const yAU = xOrb * Math.sin(omega) + yOrb * Math.cos(omega);

    return {
      x: centerX + xAU * scale,
      y: centerY - yAU * scale
    };
  };

  // Auto-blink comparator effect for Candidate Investigation
  useEffect(() => {
    if (!isBlinkingAuto) return;
    const interval = setInterval(() => {
      setBlinkEpoch(prev => prev === 'epoch1' ? 'epoch2' : 'epoch1');
    }, 600);
    return () => clearInterval(interval);
  }, [isBlinkingAuto]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isRunning) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isAnimated) {
        simTimeRef.current += dt * 8; // progression rate
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep navy background
      ctx.fillStyle = '#050B1A';
      ctx.fillRect(0, 0, width, height);

      // Faint coordinate grid
      ctx.strokeStyle = '#0E1B38';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2 + panOffset.x;
      const centerY = height / 2 + panOffset.y;

      // Draw Distance Scale Reference Rings in Astronomical Units (AU)
      const scaleRings = pixelsPerAU > 20 ? [1, 2, 5] : pixelsPerAU > 3 ? [5, 10, 20, 30] : [50, 100, 300, 500, 800];
      scaleRings.forEach(au => {
        const rPx = au * pixelsPerAU;
        if (rPx > 15 && rPx < width * 2) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, rPx, 0, 2 * Math.PI);
          ctx.strokeStyle = au === 30 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = au === 30 ? 1.5 : 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = au === 30 ? '#3B82F6' : 'rgba(167, 180, 204, 0.6)';
          ctx.font = '10px monospace';
          ctx.fillText(au === 30 ? '30 AU (Neptune)' : `${au} AU`, centerX + rPx + 4, centerY - 4);
        }
      });

      // Draw Orbits
      SOLAR_SYSTEM_OBJECTS.forEach(obj => {
        if (obj.semiMajorAxisAU === 0) return;

        const isKnownPlanet = obj.type === 'Terrestrial Planet' || obj.type === 'Gas Giant' || obj.type === 'Ice Giant';
        const isDistantObject = obj.type === 'Extreme TNO' || obj.id === 'pluto';
        const isPlanetX = obj.id === 'planet-x';

        if (isKnownPlanet && !showKnownPlanets) return;
        if (isDistantObject && !showDistantObjects) return;
        if (isPlanetX && !showPlanetXOrbit) return;

        const a = obj.semiMajorAxisAU;
        const e = obj.eccentricity;
        const omega = (obj.argumentOfPerihelionDeg * Math.PI) / 180;

        // Render true Keplerian ellipse with Sun at primary focus
        ctx.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const E = (i / steps) * 2 * Math.PI;
          const xOrb = a * (Math.cos(E) - e);
          const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

          const xAU = xOrb * Math.cos(omega) - yOrb * Math.sin(omega);
          const yAU = xOrb * Math.sin(omega) + yOrb * Math.cos(omega);

          const px = centerX + xAU * pixelsPerAU;
          const py = centerY - yAU * pixelsPerAU;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        if (isPlanetX) {
          // Hypothetical Planet X: Clearly differentiated dashed purple line
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.9)';
          ctx.lineWidth = 2;
        } else if (isDistantObject) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = obj.orbitalColor;
          ctx.lineWidth = 1.5;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = obj.orbitalColor;
          ctx.lineWidth = obj.id === 'neptune' ? 2 : 1;
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Central Sun
      ctx.beginPath();
      const sunRadius = Math.max(4, Math.min(16, 8 * Math.sqrt(pixelsPerAU)));
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius * 2.5);
      sunGlow.addColorStop(0, '#FFFFFF');
      sunGlow.addColorStop(0.3, '#F5C451');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.arc(centerX, centerY, sunRadius * 2.5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#F5C451';
      ctx.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw Orbiting Bodies
      SOLAR_SYSTEM_OBJECTS.forEach(obj => {
        if (obj.id === 'sun') return;

        const isKnownPlanet = obj.type === 'Terrestrial Planet' || obj.type === 'Gas Giant' || obj.type === 'Ice Giant';
        const isDistantObject = obj.type === 'Extreme TNO' || obj.id === 'pluto';
        const isPlanetX = obj.id === 'planet-x';

        if (isKnownPlanet && !showKnownPlanets) return;
        if (isDistantObject && !showDistantObjects) return;
        if (isPlanetX && !showPlanetXOrbit) return;

        const pos = computeObjectScreenPos(obj, centerX, centerY, pixelsPerAU, isAnimated ? simTimeRef.current : 0);

        let bodyRadius = 3;
        if (obj.id === 'jupiter') bodyRadius = 6;
        else if (obj.id === 'saturn') bodyRadius = 5;
        else if (obj.id === 'neptune' || obj.id === 'uranus') bodyRadius = 4.5;
        else if (isPlanetX) bodyRadius = 5.5;

        const isSelected = selectedObject.id === obj.id;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, bodyRadius + 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, bodyRadius, 0, 2 * Math.PI);
        ctx.fillStyle = obj.color;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = isSelected ? 10 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Display Labels
        const shouldLabel = 
          isSelected || 
          isPlanetX || 
          obj.id === 'neptune' || 
          obj.id === 'sedna' || 
          (pixelsPerAU > 10 && (obj.id === 'jupiter' || obj.id === 'earth'));

        if (shouldLabel) {
          ctx.fillStyle = isSelected ? '#38BDF8' : '#F8FAFC';
          ctx.font = `${isSelected ? 'bold ' : ''}11px -apple-system, sans-serif`;
          const text = isPlanetX ? 'Planet X [Hypothetical]' : obj.name.split('(')[0].trim();
          ctx.fillText(text, pos.x + bodyRadius + 6, pos.y + 4);
        }
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [pixelsPerAU, panOffset, showKnownPlanets, showDistantObjects, showPlanetXOrbit, isAnimated, selectedObject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="space-y-4 pb-6 border-b border-[#1E293B]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-semibold uppercase tracking-wider">
          <Orbit className="w-3.5 h-3.5" />
          <span>Outer Solar System Dynamics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
          Planet X Investigation Lab
        </h1>
        <p className="text-base sm:text-lg text-[#F5C451] font-medium">
          Evidence-Based Investigation of the Planet Nine Hypothesis
        </p>
        <p className="text-sm text-[#A7B4CC] leading-relaxed max-w-3xl">
          Beyond Neptune lies a vast, frozen frontier populated by icy trans-Neptunian objects. By studying how these distant bodies orbit the Sun, astronomers search for clues to an undiscovered planet that might be shaping their trajectories from the outer darkness.
        </p>

        {/* 2. PROMINENT SCIENTIFIC DISCLAIMER (SECTION 9 MANDATORY NOTICE) */}
        <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#F5C451]/40 flex items-start sm:items-center gap-3.5 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-[#F8FAFC]">
            <span className="font-bold text-[#F5C451] mr-1.5 uppercase font-mono tracking-wider">
              Scientific Notice:
            </span>
            <span className="font-medium">
              Planet X remains hypothetical and has not been confirmed. This explorer illustrates the scientific questions researchers investigate. Any proposed Planet X orbit shown here is illustrative unless explicitly supported by verified data.
            </span>
          </div>
        </div>

        {/* Cross-Navigation to Live Space & Asteroid Watch */}
        {onNavigate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div 
              onClick={() => onNavigate('mission-control')}
              className="p-3.5 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-mono font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                  Explore Planetary Ephemerides in Mission Control
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A7B4CC] group-hover:translate-x-1 group-hover:text-[#38BDF8] transition-all" />
            </div>

            <div 
              onClick={() => onNavigate('asteroid-watch')}
              className="p-3.5 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-[#F8FAFC] group-hover:text-emerald-400 transition-colors">
                  Monitor Real Earth Close-Approaches
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A7B4CC] group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
            </div>
          </div>
        )}
      </div>

      {/* 3. DISTANCE CONTROL & SCALE NOTICE (SECTION 5) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B]">
        {/* Scale Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#A7B4CC] font-mono mr-1">Scale Viewport:</span>
          <button
            onClick={() => handleScalePresetChange('inner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              scalePreset === 'inner'
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Inner Solar System (1–2 AU)
          </button>
          <button
            onClick={() => handleScalePresetChange('outer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              scalePreset === 'outer'
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Outer Planets (35 AU)
          </button>
          <button
            onClick={() => handleScalePresetChange('distant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              scalePreset === 'distant'
                ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold shadow'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Distant Objects (1,000 AU)
          </button>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center gap-4 text-xs text-[#A7B4CC] flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showKnownPlanets}
              onChange={(e) => setShowKnownPlanets(e.target.checked)}
              className="accent-[#38BDF8] rounded"
            />
            <span>Known Planets</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showDistantObjects}
              onChange={(e) => setShowDistantObjects(e.target.checked)}
              className="accent-[#FB7185] rounded"
            />
            <span>Distant Objects</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showPlanetXOrbit}
              onChange={(e) => setShowPlanetXOrbit(e.target.checked)}
              className="accent-[#8B5CF6] rounded"
            />
            <span>Hypothetical Planet X</span>
          </label>
        </div>
      </div>

      {/* AU Scale Explanation Banner */}
      <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center justify-between text-xs text-[#A7B4CC]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span>
            <strong>Astronomical Unit (AU):</strong> One astronomical unit is approximately the average distance between Earth and the Sun (~149.6 million kilometers).
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] text-[#A7B4CC]">
          Orbits drawn to true Keplerian geometry
        </span>
      </div>

      {/* 4. MAIN INTERACTIVE VISUALIZATION & OBJECT INFORMATION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 2D ORBITAL CANVAS VIEWPORT (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-[#050B1A]/85 backdrop-blur-md px-4 py-2.5 border-b border-[#1E293B] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-[#F8FAFC] font-bold">2D Heliocentric View</span>
                <span className="text-[#1E293B]">|</span>
                <button
                  onClick={() => setIsAnimated(!isAnimated)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                    isAnimated
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40'
                      : 'bg-[#0E1B38] text-[#A7B4CC] border border-[#1E293B]'
                  }`}
                  title="Toggle illustrative motion progression (not real-time positions)"
                >
                  {isAnimated ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAnimated ? 'Motion (Illustrative)' : 'Static Diagram'}</span>
                </button>
              </div>

              {/* Zoom & Reset Toolbar */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#050B1A] text-[#A7B4CC] border border-[#1E293B]">
                  {pixelsPerAU < 1 ? `${pixelsPerAU.toFixed(2)} px/AU` : `${Math.round(pixelsPerAU)} px/AU`}
                </span>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors ml-1"
                  title="Reset View"
                  aria-label="Reset view"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="region"
              aria-label="2D Heliocentric Solar System & Planet X Orbital Canvas. Use arrow keys to pan, plus and minus keys to zoom, zero to reset."
              onKeyDown={handleCanvasKeyDown}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleCanvasClick}
              className={`w-full h-110 sm:h-125 block select-none focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            />

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 bg-[#050B1A]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1E293B] text-[11px] font-mono space-y-1 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#3B82F6]" />
                <span className="text-[#F8FAFC]">Neptune's Orbit (30 AU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#FB7185] border-b border-dashed" />
                <span className="text-[#FB7185]">Distant Sednoids (Sedna, VP113)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#8B5CF6] border-b border-dashed" />
                <span className="text-[#8B5CF6]">Planet X Orbit (Hypothetical)</span>
              </div>
            </div>

            {/* Click to Select Hint */}
            <div className="absolute top-12 right-3 pointer-events-none hidden sm:block">
              <span className="text-[10px] text-[#A7B4CC]/80 bg-[#050B1A]/70 px-2 py-1 rounded border border-[#1E293B]">
                Click any orbit/planet to inspect
              </span>
            </div>
          </div>

          {/* Quick Select Fleet Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#A7B4CC] font-mono">Select Celestial Body:</span>
            <div className="flex flex-wrap gap-1.5">
              {SOLAR_SYSTEM_OBJECTS.map(obj => {
                const isSelected = selectedObject.id === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObject(obj)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? obj.isHypothetical
                          ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold'
                          : 'bg-[#38BDF8] text-[#050B1A] font-bold'
                        : 'bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                    }`}
                  >
                    {obj.name.split('(')[0].trim()}
                    {obj.isHypothetical && ' *'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: SELECTED-OBJECT INFORMATION PANEL (SECTION 4) (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-6 rounded-2xl bg-[#0B1630] border space-y-4 shadow-xl ${
            selectedObject.isHypothetical ? 'border-[#8B5CF6]/50 shadow-[#8B5CF6]/5' : 'border-[#1E293B]'
          }`}>
            <div className="flex items-start justify-between border-b border-[#1E293B] pb-3">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  selectedObject.isHypothetical ? 'text-[#8B5CF6]' : 'text-[#38BDF8]'
                }`}>
                  {selectedObject.type}
                </span>
                <h3 className="text-xl font-bold text-[#F8FAFC]">
                  {selectedObject.name}
                </h3>
              </div>

              {selectedObject.isHypothetical ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40">
                  Hypothetical
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                  Confirmed
                </span>
              )}
            </div>

            {/* Visual Representation */}
            <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
              <AstronomicalImage
                target={selectedObject}
                targetType={selectedObject.isHypothetical ? 'small-body' : selectedObject.type.includes('Planet') ? 'planet' : 'small-body'}
                aspectRatio="16/9"
                showBadge={true}
                className="w-full h-36 object-cover"
              />
            </div>

            {/* Approximate Orbital Properties Only When Verified */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono tabular-nums">
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Semi-Major Axis:</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {selectedObject.semiMajorAxisAU > 0 ? `${selectedObject.semiMajorAxisAU} AU` : 'Anchor (0 AU)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Orbital Period:</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {selectedObject.orbitalPeriodYears > 0 ? `${selectedObject.orbitalPeriodYears.toLocaleString()} yrs` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Eccentricity (e):</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {selectedObject.eccentricity}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Inclination (i):</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {selectedObject.inclinationDeg}°
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Perihelion (Closest):</span>
                <span className="text-[#38BDF8] font-bold text-sm">
                  {selectedObject.perihelionAU} AU
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Aphelion (Farthest):</span>
                <span className="text-[#F5C451] font-bold text-sm">
                  {selectedObject.aphelionAU} AU
                </span>
              </div>
            </div>

            {/* Description & Relevance */}
            <p className="text-xs text-[#A7B4CC] leading-relaxed pt-1">
              {selectedObject.description}
            </p>

            <div className="p-3 rounded-xl bg-[#050B1A]/80 border border-[#1E293B] space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase font-mono text-[#F5C451]">
                Why this object is relevant:
              </span>
              <p className="text-[#F8FAFC] leading-relaxed">
                {selectedObject.scientificContext}
              </p>
            </div>

            {/* Verified Data Source Attribution */}
            {selectedObject.dataSource && (
              <div className="pt-2 border-t border-[#1E293B] text-[10px] font-mono text-[#A7B4CC]">
                Source: {selectedObject.dataSource}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. THE EVIDENCE INVESTIGATION PANEL (SECTION 6) */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono">
            <Compass className="w-4 h-4" />
            <span>Observational Methodology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            What Are Scientists Looking For?
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC]">
            Astronomers employ distinct observational techniques to explore whether an unseen massive body exists beyond Neptune.
          </p>
        </div>

        {/* The 4 required simple cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCIENTIFIC_SEARCH_CARDS.map(card => {
            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all space-y-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                  {card.iconName === 'Compass' && <Compass className="w-4 h-4" />}
                  {card.iconName === 'Eye' && <Eye className="w-4 h-4" />}
                  {card.iconName === 'Telescope' && <Telescope className="w-4 h-4" />}
                  {card.iconName === 'Scale' && <Scale className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">
                  {card.title}
                </h3>
                <p className="text-xs text-[#A7B4CC] leading-relaxed">
                  {card.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. EVIDENCE AND UNCERTAINTY SECTION (SECTION 7) */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            What Does the Evidence Tell Us?
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed">
            Some researchers have proposed that a distant, massive planet could help explain certain orbital alignments among extreme trans-Neptunian objects. However, this interpretation remains actively debated. Observational selection bias and alternative physical mechanisms must be carefully tested before any definitive conclusion can be reached.
          </p>
        </div>

        {/* Topics selector */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {EVIDENCE_TOPICS.map(topic => {
            const isSelected = selectedEvidence.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedEvidence(topic)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#050B1A] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10'
                    : 'bg-[#050B1A]/40 border-[#1E293B] hover:border-[#38BDF8]/40'
                }`}
              >
                <div className="font-semibold text-xs text-[#F8FAFC]">
                  {topic.title}
                </div>
                <div className="text-[10px] text-[#A7B4CC] mt-1 truncate">
                  {topic.researchFocus}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Evidence Detail Box */}
        <div className="p-6 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              {selectedEvidence.title}
            </h3>
            <span className="text-[11px] font-mono text-[#F5C451]">
              Scientific Investigation
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#F8FAFC] font-medium leading-relaxed">
            {selectedEvidence.summary}
          </p>

          <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed whitespace-pre-line">
            {selectedEvidence.fullExplanation}
          </p>

          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-[#1E293B]">
            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
              <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">
                Current Observations:
              </span>
              <p className="text-[#A7B4CC]">{selectedEvidence.observationsToDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                Alternative Hypotheses & Debated Aspects:
              </span>
              <p className="text-[#A7B4CC]">{selectedEvidence.debatedAspects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. CANDIDATE INVESTIGATION EDUCATIONAL WORKFLOW (SECTION 8) */}
      <div className="rounded-2xl bg-linear-to-r from-[#0B1630] to-[#0E1B38] border border-[#8B5CF6]/30 p-8 sm:p-10 space-y-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B5CF6] uppercase tracking-wider font-bold">
              <Eye className="w-4 h-4" />
              <span>Interactive Citizen Science Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Candidate Investigation: How Astronomers Find Moving Objects
            </h2>
            <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-2xl">
              Distant Solar System objects are discovered by taking photographs of the sky separated by weeks or months. Stars remain stationary, while orbiting bodies shift noticeably against the celestial background. This interactive blink comparator is an educational simulation illustrating Clyde Tombaugh’s discovery method, not live telescope data.
            </p>
          </div>

          {/* Educational Simulation Badge */}
          <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 text-xs font-mono font-semibold shrink-0 self-start md:self-auto">
            Educational Simulation
          </span>
        </div>

        {/* Case Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#A7B4CC] font-mono mr-1">Select Case:</span>
          {CANDIDATE_CASES.map(c => {
            const isSelected = activeCandidate.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCandidate(c);
                  setUserClassification(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold shadow'
                    : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Comparison Panels (Side-by-Side or Blink Mode) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Epoch 1 Observation */}
          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#38BDF8] font-bold">{activeCandidate.epoch1Label}</span>
              <span className="text-[#A7B4CC]">Telescope Epoch A</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A] flex items-center justify-center">
              <img
                src={isBlinkingAuto && blinkEpoch === 'epoch2' ? activeCandidate.epoch2Image : activeCandidate.epoch1Image}
                alt={activeCandidate.epoch1Label}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Epoch 2 Observation */}
          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8B5CF6] font-bold">{activeCandidate.epoch2Label}</span>
              <span className="text-[#A7B4CC]">Telescope Epoch B</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A] flex items-center justify-center">
              <img
                src={activeCandidate.epoch2Image}
                alt={activeCandidate.epoch2Label}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Interactive Blink Comparator Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#A7B4CC]">Blink Comparator (Educational Simulation • Tombaugh Technique):</span>
            <button
              onClick={() => setIsBlinkingAuto(!isBlinkingAuto)}
              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all flex items-center gap-1.5 ${
                isBlinkingAuto
                  ? 'bg-[#F5C451] text-[#050B1A] font-bold'
                  : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isBlinkingAuto ? 'Auto-Blinking Active' : 'Start Auto-Blink'}</span>
            </button>
          </div>
          <span className="text-[#A7B4CC] text-[11px] font-mono">
            Hints: {activeCandidate.hints}
          </span>
        </div>

        {/* User Classification Action */}
        <div className="p-6 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] font-mono">
              Your Scientific Assessment: Does this candidate exhibit orbital motion?
            </span>
            {userClassification && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                Evaluation Complete
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setUserClassification('Possible movement')}
              className={`p-3 rounded-xl text-xs font-bold font-mono transition-all text-center border ${
                userClassification === 'Possible movement'
                  ? 'bg-[#38BDF8] text-[#050B1A] border-[#38BDF8]'
                  : 'bg-[#0B1630] text-[#F8FAFC] hover:border-[#38BDF8]/50 border-[#1E293B]'
              }`}
            >
              Possible movement
            </button>

            <button
              onClick={() => setUserClassification('No clear movement')}
              className={`p-3 rounded-xl text-xs font-bold font-mono transition-all text-center border ${
                userClassification === 'No clear movement'
                  ? 'bg-[#F5C451] text-[#050B1A] border-[#F5C451]'
                  : 'bg-[#0B1630] text-[#F8FAFC] hover:border-[#F5C451]/50 border-[#1E293B]'
              }`}
            >
              No clear movement
            </button>

            <button
              onClick={() => setUserClassification('Uncertain')}
              className={`p-3 rounded-xl text-xs font-bold font-mono transition-all text-center border ${
                userClassification === 'Uncertain'
                  ? 'bg-[#8B5CF6] text-[#FFFFFF] border-[#8B5CF6]'
                  : 'bg-[#0B1630] text-[#F8FAFC] hover:border-[#8B5CF6]/50 border-[#1E293B]'
              }`}
            >
              Uncertain
            </button>
          </div>

          {/* Feedback Display */}
          {userClassification && (
            <div className={`p-4 rounded-xl text-xs space-y-2 border ${
              userClassification === activeCandidate.expectedClassification
                ? 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#F8FAFC]'
                : 'bg-[#F5C451]/10 border-[#F5C451]/30 text-[#F8FAFC]'
            }`}>
              <div className="flex items-center gap-2 font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                <span>
                  {userClassification === activeCandidate.expectedClassification
                    ? 'Scientifically Sound Classification!'
                    : `Alternative Review (Scientific Consensus: ${activeCandidate.expectedClassification})`}
                </span>
              </div>
              <p className="leading-relaxed text-[#A7B4CC]">
                {activeCandidate.explanation}
              </p>
            </div>
          )}

          {/* Simulation Disclaimer */}
          <div className="pt-2 text-[10px] text-[#A7B4CC]/70 font-mono">
            * Note: This interactive exercise is an educational simulation of multi-epoch parallax detection techniques. It does not connect to live survey archives or submit real sky classifications.
          </div>
        </div>
      </div>
    </div>
  );
};
