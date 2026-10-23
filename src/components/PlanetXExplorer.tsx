import { useState, useRef, useEffect, type FC } from 'react';
import { SOLAR_SYSTEM_OBJECTS } from '../data/solarSystemData';
import { EVIDENCE_TOPICS } from '../data/evidenceData';
import type { SolarSystemObject, EvidenceTopic } from '../types';
import { 
  Orbit, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  Compass
} from 'lucide-react';

export const PlanetXExplorer: FC = () => {
  // Selected object for inspection
  const [selectedObject, setSelectedObject] = useState<SolarSystemObject>(
    SOLAR_SYSTEM_OBJECTS.find(o => o.id === 'planet-x') || SOLAR_SYSTEM_OBJECTS[0]
  );

  // Selected evidence topic
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceTopic>(EVIDENCE_TOPICS[0]);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // multiplier
  const [elapsedYears, setElapsedYears] = useState<number>(0);

  // Canvas Viewport Transformation
  // scale represents pixels per AU
  const [pixelsPerAU, setPixelsPerAU] = useState<number>(0.6); // default view shows up to ~1000 AU
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Visual toggles
  const [showInnerPlanets, setShowInnerPlanets] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(true);
  const [showClusteringVectors, setShowClusteringVectors] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Quick scale presets
  const applyScalePreset = (preset: 'inner' | 'gas-giants' | 'kuiper' | 'planet-x') => {
    setPanOffset({ x: 0, y: 0 });
    switch (preset) {
      case 'inner':
        setPixelsPerAU(120); // 1 AU is 120px
        break;
      case 'gas-giants':
        setPixelsPerAU(8); // 35 AU is ~280px
        break;
      case 'kuiper':
        setPixelsPerAU(3); // 100 AU is ~300px
        break;
      case 'planet-x':
      default:
        setPixelsPerAU(0.45); // 1000 AU is ~450px
        break;
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setPixelsPerAU(prev => Math.min(prev * 1.4, 250));
  const handleZoomOut = () => setPixelsPerAU(prev => Math.max(prev / 1.4, 0.1));
  const handleReset = () => {
    setPanOffset({ x: 0, y: 0 });
    setPixelsPerAU(0.45);
    setElapsedYears(0);
  };

  // Canvas Mouse Interaction for Panning & Object Selection
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

  // Click on canvas to detect nearest object
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / (2 * (window.devicePixelRatio || 1)) + panOffset.x;
    const centerY = canvas.height / (2 * (window.devicePixelRatio || 1)) + panOffset.y;

    // Check each object's current rendered position
    let closestObj: SolarSystemObject | null = null;
    let minDistance = 25; // hit radius in pixels

    for (const obj of SOLAR_SYSTEM_OBJECTS) {
      if (obj.id === 'sun') {
        const d = Math.hypot(clickX - centerX, clickY - centerY);
        if (d < minDistance) {
          closestObj = obj;
          minDistance = d;
        }
        continue;
      }

      if (!showInnerPlanets && (obj.id === 'mercury' || obj.id === 'venus' || obj.id === 'earth' || obj.id === 'mars')) {
        continue;
      }

      // Compute current Keplerian position of object
      const pos = computeObjectScreenPos(obj, centerX, centerY, pixelsPerAU, elapsedYears);
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

  // Helper: compute Keplerian 2D screen coordinate for an orbiting object
  const computeObjectScreenPos = (
    obj: SolarSystemObject,
    centerX: number,
    centerY: number,
    scale: number,
    years: number
  ) => {
    if (obj.semiMajorAxisAU === 0) return { x: centerX, y: centerY };

    // Mean motion: n = 2 * PI / orbitalPeriodYears
    const period = Math.max(obj.orbitalPeriodYears, 0.001);
    const meanAnomaly = (2 * Math.PI * (years / period)) % (2 * Math.PI);

    // Approximate eccentric anomaly from mean anomaly using Kepler solver
    let E = meanAnomaly;
    for (let i = 0; i < 5; i++) {
      E = E - (E - obj.eccentricity * Math.sin(E) - meanAnomaly) / (1 - obj.eccentricity * Math.cos(E));
    }

    // Position in orbital plane coordinate system (Sun at one focus)
    const a = obj.semiMajorAxisAU;
    const e = obj.eccentricity;
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Rotate by argument of perihelion (in radians)
    const omega = (obj.argumentOfPerihelionDeg * Math.PI) / 180;
    const xAU = xOrb * Math.cos(omega) - yOrb * Math.sin(omega);
    const yAU = xOrb * Math.sin(omega) + yOrb * Math.cos(omega);

    return {
      x: centerX + xAU * scale,
      y: centerY - yAU * scale // canvas Y is inverted
    };
  };

  // Simulation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        // Increment elapsed simulation time in years based on speed
        // Base rate: 1 real second = 5 simulation years * simSpeed
        setElapsedYears(prev => prev + deltaTime * 5 * simSpeed);
      }

      // Handle DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear Canvas with deep space navy background
      ctx.fillStyle = '#050B1A';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle astronomical grid
      ctx.strokeStyle = '#0E1B38';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2 + panOffset.x;
      const centerY = height / 2 + panOffset.y;

      // Draw scale reference circles (e.g. 100 AU, 500 AU, 1000 AU) when zoomed out
      if (pixelsPerAU < 2) {
        const ranges = [100, 300, 500, 1000];
        ranges.forEach(r => {
          const rPx = r * pixelsPerAU;
          if (rPx > 20 && rPx < width * 2) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, rPx, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(167, 180, 204, 0.4)';
            ctx.font = '10px monospace';
            ctx.fillText(`${r} AU`, centerX + rPx + 4, centerY - 4);
          }
        });
      }

      // Draw Perihelion Alignment Vectors (to show the scientific clustering of eTNOs)
      if (showClusteringVectors) {
        const clusteredObjects = SOLAR_SYSTEM_OBJECTS.filter(o => o.type === 'Extreme TNO');
        clusteredObjects.forEach(obj => {
          const omegaRad = (obj.argumentOfPerihelionDeg * Math.PI) / 180;
          const vectorLengthAU = Math.min(obj.perihelionAU * 1.2, 100);
          const endX = centerX + Math.cos(omegaRad) * vectorLengthAU * pixelsPerAU;
          const endY = centerY - Math.sin(omegaRad) * vectorLengthAU * pixelsPerAU;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = 'rgba(251, 113, 133, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Anti-aligned vector for hypothetical Planet X
        const pX = SOLAR_SYSTEM_OBJECTS.find(o => o.id === 'planet-x');
        if (pX) {
          const omegaRad = (pX.argumentOfPerihelionDeg * Math.PI) / 180;
          const vectorLengthAU = 120;
          const endX = centerX + Math.cos(omegaRad) * vectorLengthAU * pixelsPerAU;
          const endY = centerY - Math.sin(omegaRad) * vectorLengthAU * pixelsPerAU;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw Orbit Paths
      if (showOrbitPaths) {
        SOLAR_SYSTEM_OBJECTS.forEach(obj => {
          if (obj.semiMajorAxisAU === 0) return;
          if (!showInnerPlanets && (obj.id === 'mercury' || obj.id === 'venus' || obj.id === 'earth' || obj.id === 'mars')) {
            return;
          }

          const a = obj.semiMajorAxisAU;
          const e = obj.eccentricity;
          const omega = (obj.argumentOfPerihelionDeg * Math.PI) / 180;

          // Draw full ellipse with Keplerian points
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

          if (obj.isHypothetical) {
            // Planet X: Distinct dashed purple orbit
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.85)';
            ctx.lineWidth = 2;
          } else if (obj.type === 'Extreme TNO') {
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
      }

      // Draw the Sun
      ctx.beginPath();
      const sunRadius = Math.max(4, Math.min(18, 10 * Math.sqrt(pixelsPerAU)));
      // Corona glow
      const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius * 3);
      sunGradient.addColorStop(0, '#FFFFFF');
      sunGradient.addColorStop(0.3, '#F5C451');
      sunGradient.addColorStop(0.8, 'rgba(245, 196, 81, 0.2)');
      sunGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGradient;
      ctx.arc(centerX, centerY, sunRadius * 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#F5C451';
      ctx.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw Orbiting Bodies
      SOLAR_SYSTEM_OBJECTS.forEach(obj => {
        if (obj.id === 'sun') return;
        if (!showInnerPlanets && (obj.id === 'mercury' || obj.id === 'venus' || obj.id === 'earth' || obj.id === 'mars')) {
          return;
        }

        const pos = computeObjectScreenPos(obj, centerX, centerY, pixelsPerAU, elapsedYears);

        // Body radius
        let bodyRadius = 3;
        if (obj.id === 'jupiter') bodyRadius = 6;
        else if (obj.id === 'saturn') bodyRadius = 5;
        else if (obj.id === 'uranus' || obj.id === 'neptune') bodyRadius = 4.5;
        else if (obj.id === 'planet-x') bodyRadius = 5.5;

        // Is this object selected?
        const isSelected = selectedObject.id === obj.id;

        if (isSelected) {
          // Highlight ring
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, bodyRadius + 7, 0, 2 * Math.PI);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw object circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, bodyRadius, 0, 2 * Math.PI);
        ctx.fillStyle = obj.color;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = isSelected ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Labels for significant bodies
        const showLabel = 
          isSelected || 
          obj.id === 'planet-x' || 
          obj.id === 'sedna' || 
          obj.id === 'neptune' || 
          obj.id === 'jupiter' || 
          (pixelsPerAU > 15 && (obj.id === 'earth' || obj.id === 'mars'));

        if (showLabel) {
          ctx.fillStyle = isSelected ? '#38BDF8' : '#F8FAFC';
          ctx.font = `${isSelected ? 'bold ' : ''}11px -apple-system, sans-serif`;
          const label = obj.isHypothetical ? `${obj.name.split('(')[0].trim()} [HYPOTHETICAL]` : obj.name.split('(')[0].trim();
          ctx.fillText(label, pos.x + bodyRadius + 6, pos.y + 4);
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
  }, [isPlaying, simSpeed, pixelsPerAU, panOffset, showInnerPlanets, showOrbitPaths, showClusteringVectors, selectedObject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* 1. TOP HEADER & MANDATORY SCIENTIFIC DISCLAIMER BANNER */}
      <div className="space-y-4 pb-6 border-b border-[#1E293B]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <Orbit className="w-3.5 h-3.5" />
              <span>Outer Solar System Dynamics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
              Planet X Explorer
            </h1>
            <p className="text-sm sm:text-base text-[#A7B4CC] mt-1 max-w-2xl">
              Interactive 2D orbital model of the outer solar system and the gravitational evidence surrounding the proposed ninth planet.
            </p>
          </div>

          {/* Time & Simulation status badge */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-[#0B1630] border border-[#1E293B] text-xs font-mono text-[#A7B4CC]">
              Simulation Year: <span className="text-[#38BDF8] font-bold">{Math.round(elapsedYears)}</span>
            </div>
          </div>
        </div>

        {/* PROMINENT MANDATORY SCIENTIFIC DISCLAIMER */}
        <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#F5C451]/40 flex items-start sm:items-center gap-3.5 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-[#F8FAFC]">
            <span className="font-bold text-[#F5C451] mr-1.5 uppercase font-mono tracking-wider">
              Scientific Notice:
            </span>
            <span className="font-medium">
              Planet X, sometimes called Planet Nine, remains hypothetical. It has not been confirmed.
            </span>
            <span className="text-[#A7B4CC] block sm:inline sm:ml-1 text-xs">
              Its orbit and physical properties are derived from gravitational models, not direct visual observation.
            </span>
          </div>
        </div>
      </div>

      {/* 2. SCALE PRESETS & VIEWPORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B1630] border border-[#1E293B]">
        {/* Scale Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#A7B4CC] font-mono mr-1">Scale Presets:</span>
          <button
            onClick={() => applyScalePreset('inner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              pixelsPerAU > 50
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Inner System (1-2 AU)
          </button>
          <button
            onClick={() => applyScalePreset('gas-giants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              pixelsPerAU >= 5 && pixelsPerAU <= 50
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Gas Giants (35 AU)
          </button>
          <button
            onClick={() => applyScalePreset('kuiper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              pixelsPerAU >= 1.5 && pixelsPerAU < 5
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Kuiper Belt (100 AU)
          </button>
          <button
            onClick={() => applyScalePreset('planet-x')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              pixelsPerAU < 1.5
                ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold'
                : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
            }`}
          >
            Planet X & eTNOs (1000 AU)
          </button>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4 text-xs text-[#A7B4CC] ml-auto">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showOrbitPaths}
              onChange={(e) => setShowOrbitPaths(e.target.checked)}
              className="accent-[#38BDF8] rounded"
            />
            <span>Orbit Paths</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showInnerPlanets}
              onChange={(e) => setShowInnerPlanets(e.target.checked)}
              className="accent-[#38BDF8] rounded"
            />
            <span>Inner Planets</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showClusteringVectors}
              onChange={(e) => setShowClusteringVectors(e.target.checked)}
              className="accent-[#FB7185] rounded"
            />
            <span>Perihelion Vectors</span>
          </label>
        </div>
      </div>

      {/* 3. INTERACTIVE 2D ORBITAL SIMULATION CANVAS + OBJECT DATA SHEET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: 2D Canvas Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-[#050B1A]/85 backdrop-blur-md px-4 py-2.5 border-b border-[#1E293B] flex items-center justify-between gap-3 text-xs">
              {/* Play / Pause & Speed Multiplier */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-[#A7B4CC] hidden sm:inline">Speed:</span>
                  {[0.5, 1, 5, 20].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSimSpeed(speed)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        simSpeed === speed
                          ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                          : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom & Reset Toolbar */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom In"
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
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors ml-1"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Canvas Viewport */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              className={`w-full h-[440px] sm:h-[500px] block select-none ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            />

            {/* Canvas Legend & Overlay Information */}
            <div className="absolute bottom-3 left-3 bg-[#050B1A]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1E293B] text-[11px] font-mono space-y-1 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#3B82F6]" />
                <span className="text-[#F8FAFC]">Neptune Orbit (30 AU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#FB7185] border-b border-dashed" />
                <span className="text-[#FB7185]">eTNO Orbits (Sedna, VP113)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#8B5CF6] border-b border-dashed" />
                <span className="text-[#8B5CF6]">Planet X Orbit (Hypothetical)</span>
              </div>
            </div>

            {/* Interactive Hint */}
            <div className="absolute top-12 right-3 pointer-events-none hidden sm:block">
              <span className="text-[10px] text-[#A7B4CC]/80 bg-[#050B1A]/70 px-2 py-1 rounded border border-[#1E293B]">
                Click any orbit/planet to inspect
              </span>
            </div>
          </div>

          {/* Quick Select Fleet Pills */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#A7B4CC] font-mono">Quick Select Body:</span>
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

        {/* Right: Selected Object Data Sheet & Evidence Cards */}
        <div className="space-y-6">
          {/* Object Information Sheet */}
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

            {/* Orbital Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Semi-Major Axis (a):</span>
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

            {/* Description & Significance */}
            <p className="text-xs text-[#A7B4CC] leading-relaxed pt-2">
              {selectedObject.description}
            </p>

            <div className="p-3 rounded-xl bg-[#050B1A]/80 border border-[#1E293B] space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase font-mono text-[#F5C451]">
                Scientific Importance:
              </span>
              <p className="text-[#F8FAFC] leading-relaxed">
                {selectedObject.scientificContext}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SCIENTIFIC EVIDENCE EXPLORER FOR PLANET X */}
      <div className="rounded-3xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono">
            <Compass className="w-4 h-4" />
            <span>Gravitational & Observational Clues</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            The Evidence Behind Planet X
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC]">
            Why do prominent astrophysicists suspect an unseen massive planet in the outer solar system? Explore the key observations and debates.
          </p>
        </div>

        {/* Evidence Topics Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                <div className="font-semibold text-xs text-[#F8FAFC] leading-snug">
                  {topic.title}
                </div>
                <div className="text-[10px] font-mono text-[#38BDF8] mt-1.5">
                  {topic.confidenceLevel}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Evidence Detail Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
            <h3 className="text-xl font-bold text-[#F8FAFC]">
              {selectedEvidence.title}
            </h3>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 self-start sm:self-auto">
              Status: {selectedEvidence.confidenceLevel}
            </span>
          </div>

          <p className="text-sm text-[#F5C451] font-medium leading-relaxed">
            {selectedEvidence.summary}
          </p>

          <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed whitespace-pre-line">
            {selectedEvidence.fullExplanation}
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#1E293B] text-xs">
            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#38BDF8] font-bold">
                Current Observations:
              </span>
              <p className="text-[#F8FAFC]">
                {selectedEvidence.observationsToDate}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#8B5CF6] font-bold">
                Future Search & Tests:
              </span>
              <p className="text-[#F8FAFC]">
                {selectedEvidence.futureMissions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

