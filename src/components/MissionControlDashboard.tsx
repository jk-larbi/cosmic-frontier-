import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import type { 
  AppPage, 
  LiveEphemerisObject, 
  LiveEphemerisResponse, 
  LiveCloseApproach, 
  LiveCloseApproachesResponse, 
  LiveDataBadgeStatus,
  NasaApodData 
} from '../types';
import { fetchLiveEphemeris, fetchLiveCloseApproaches } from '../services/liveSpaceService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { useReducedMotion, useDocumentVisibility } from '../utils/motion';
import { 
  Globe, 
  Orbit, 
  Compass, 
  Telescope, 
  Disc, 
  Database, 
  Sparkles, 
  Radio, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  Maximize2
} from 'lucide-react';

interface MissionControlDashboardProps {
  onNavigate: (page: AppPage) => void;
}

export const MissionControlDashboard: FC<MissionControlDashboardProps> = ({ onNavigate }) => {
  const isReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisibility();

  // Telemetry & Clocks
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeZoneMode, setTimeZoneMode] = useState<'UTC' | 'LOCAL'>('UTC');

  // Ephemeris State (Integrated from former Live Space)
  const [ephemData, setEphemData] = useState<LiveEphemerisResponse | null>(null);
  const [isEphemLoading, setIsEphemLoading] = useState<boolean>(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('earth');
  const [scaleMode, setScaleMode] = useState<'inner' | 'outer'>('inner');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Close Approaches State (Integrated from Asteroid Feed)
  const [cadData, setCadData] = useState<LiveCloseApproachesResponse | null>(null);
  const [cadTimeframe, setCadTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [isCadLoading, setIsCadLoading] = useState<boolean>(true);

  // APOD Highlight State
  const [apodData, setApodData] = useState<NasaApodData | null>(null);

  // Canvas Refs for Solar System Preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simOffsetRef = useRef<number>(0);

  // Pan & Zoom for Solar System Preview
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const isPanningRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live Ephemeris
  const loadEphemeris = async () => {
    try {
      setIsEphemLoading(true);
      const res = await fetchLiveEphemeris();
      setEphemData(res);
    } catch (err) {
      console.warn('[Mission Control] Ephemeris load notice:', err);
    } finally {
      setIsEphemLoading(false);
    }
  };

  // Fetch Close Approaches
  const loadCloseApproaches = async (tf: '24h' | '7d' | '30d') => {
    try {
      setIsCadLoading(true);
      const res = await fetchLiveCloseApproaches({ timeframe: tf, limit: 12 });
      setCadData(res);
    } catch (err) {
      console.warn('[Mission Control] Close approaches load notice:', err);
    } finally {
      setIsCadLoading(false);
    }
  };

  // Fetch APOD Highlight
  const loadApod = async () => {
    try {
      const res = await fetch('/api/nasa/apod');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setApodData(json.data);
      }
    } catch (err) {
      console.warn('[Mission Control] APOD load notice:', err);
    }
  };

  useEffect(() => {
    loadEphemeris();
    loadCloseApproaches(cadTimeframe);
    loadApod();
  }, []);

  useEffect(() => {
    loadCloseApproaches(cadTimeframe);
  }, [cadTimeframe]);

  // Handle Refresh All
  const handleRefreshAll = () => {
    loadEphemeris();
    loadCloseApproaches(cadTimeframe);
    loadApod();
  };

  // Selected Object
  const selectedObject: LiveEphemerisObject | undefined = useMemo(() => {
    if (!ephemData?.objects) return undefined;
    return ephemData.objects.find(o => o.id === selectedObjectId) || ephemData.objects[0];
  }, [ephemData, selectedObjectId]);

  // Next upcoming asteroid approach
  const nextAsteroid: LiveCloseApproach | null = useMemo(() => {
    if (!cadData?.approaches || cadData.approaches.length === 0) return null;
    return cadData.approaches[0];
  }, [cadData]);

  // Status Badge Helper
  const renderStatusBadge = (status: LiveDataBadgeStatus) => {
    switch (status) {
      case 'LIVE DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY
          </span>
        );
      case 'RECENT DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
            RECENT DATA (CACHED)
          </span>
        );
      case 'PREDICTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#8B5CF6]/10 text-[#C084FC] border border-[#8B5CF6]/30">
            PREDICTED EPHEMERIS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-[#A7B4CC] border border-[#1E293B]">
            {status}
          </span>
        );
    }
  };

  // Solar System 2D Preview Canvas Renderer
  useEffect(() => {
    if (!canvasRef.current || !ephemData?.objects) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 440;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const render = () => {
      if (!isRunning) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Deep navy background
      ctx.fillStyle = '#050B1A';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;
      const pxPerAU = (scaleMode === 'inner' ? 70 : 7.5) * zoom;

      // Draw Range AU Rings
      const ringDistances = scaleMode === 'inner' ? [0.39, 0.72, 1.0, 1.52, 2.77, 5.2] : [1, 5, 10, 20, 30, 40, 50];
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);

      ringDistances.forEach(distAU => {
        const rPx = distAU * pxPerAU;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '9px monospace';
        ctx.fillText(`${distAU} AU`, centerX + rPx + 4, centerY - 3);
      });

      ctx.setLineDash([]);

      // Draw Orbits
      if (showOrbits) {
        ephemData.objects.forEach(obj => {
          if (!obj.orbitalElements || obj.orbitalElements.semiMajorAxisAU <= 0) return;
          const a = obj.orbitalElements.semiMajorAxisAU;
          const e = obj.orbitalElements.eccentricity;
          const periRad = (obj.orbitalElements.argumentOfPerihelionDeg || 0) * (Math.PI / 180);
          const nodeRad = (obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) * (Math.PI / 180);

          const isSelected = obj.id === selectedObjectId;
          ctx.strokeStyle = isSelected ? obj.color : `${obj.color}33`;
          ctx.lineWidth = isSelected ? 1.5 : 0.8;
          ctx.beginPath();

          const steps = 80;
          for (let s = 0; s <= steps; s++) {
            const E = (s / steps) * Math.PI * 2;
            const xOrb = a * (Math.cos(E) - e);
            const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

            const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
            const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);

            const xEcl = (cosW * cosN - sinW * sinN) * xOrb + (-sinW * cosN - cosW * sinN) * yOrb;
            const yEcl = (cosW * sinN + sinW * cosN) * xOrb + (-sinW * sinN + cosW * cosN) * yOrb;

            const screenX = centerX + xEcl * pxPerAU;
            const screenY = centerY - yEcl * pxPerAU;

            if (s === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
          ctx.stroke();
        });
      }

      // Draw Celestial Bodies
      ephemData.objects.forEach(obj => {
        // Apply simulation offset if motion active
        let angleOffset = 0;
        if (isSimulating && obj.orbitalElements && obj.orbitalElements.orbitalPeriodYears > 0) {
          angleOffset = (simOffsetRef.current / obj.orbitalElements.orbitalPeriodYears) * 0.05;
        }

        const cosOff = Math.cos(angleOffset);
        const sinOff = Math.sin(angleOffset);
        const rotX = obj.heliocentricAU.x * cosOff - obj.heliocentricAU.y * sinOff;
        const rotY = obj.heliocentricAU.x * sinOff + obj.heliocentricAU.y * cosOff;

        const screenX = centerX + rotX * pxPerAU;
        const screenY = centerY - rotY * pxPerAU;

        const isSelected = obj.id === selectedObjectId;
        const radius = obj.id === 'sun' ? 6 : (obj.classification.includes('Gas') ? 4.5 : 3);

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.fill();

        if (showLabels) {
          ctx.fillStyle = isSelected ? '#38BDF8' : '#CBD5E1';
          ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
          ctx.fillText(obj.name.split(' ')[0], screenX + radius + 4, screenY + 3);
        }
      });

      if (isSimulating && !isReducedMotion) {
        simOffsetRef.current += 0.02;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [ephemData, selectedObjectId, scaleMode, showOrbits, showLabels, isSimulating, pan, zoom, isDocumentVisible, isReducedMotion]);

  // 2D Canvas Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanningRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanningRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(5, prev * factor)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. MISSION CONTROL COMMAND HEADER & TELEMETRY STRIP */}
      <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-b from-[#0B1630] to-[#070E22] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                Unified Planetary Command
              </span>
              {ephemData && renderStatusBadge(ephemData.statusLabel)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Mission Control Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-2xl leading-relaxed">
              Explore the Universe. Discover the Unknown. A unified operational workspace combining live celestial astrometry, near-Earth asteroid encounters, and multi-mission science observatories.
            </p>
          </div>

          {/* Real-Time Telemetry Clocks */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1 min-w-55">
              <div className="flex items-center justify-between gap-4 text-xs text-[#A7B4CC] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{timeZoneMode === 'UTC' ? 'Universal Time (UTC)' : 'Local Station Time'}</span>
                </span>
                <button
                  onClick={() => setTimeZoneMode(prev => prev === 'UTC' ? 'LOCAL' : 'UTC')}
                  className="text-[10px] text-[#38BDF8] hover:underline cursor-pointer"
                >
                  Switch to {timeZoneMode === 'UTC' ? 'Local' : 'UTC'}
                </button>
              </div>
              <div className="text-xl font-mono font-bold text-[#F8FAFC] tabular-nums tracking-wide">
                {timeZoneMode === 'UTC'
                  ? currentTime.toUTCString().slice(17, 25) + ' UTC'
                  : currentTime.toLocaleTimeString()}
              </div>
              <div className="text-[11px] font-mono text-[#A7B4CC]">
                {timeZoneMode === 'UTC' ? currentTime.toUTCString().slice(0, 16) : currentTime.toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={handleRefreshAll}
              disabled={isEphemLoading || isCadLoading}
              className="px-4 py-3 rounded-xl bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8]/50 text-xs font-mono font-semibold text-[#F8FAFC] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              title="Refresh all real-time telemetry feeds"
            >
              <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${(isEphemLoading || isCadLoading) ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Real-Time Space Telemetry Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#1E293B]/70 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#050B1A]/70 border border-[#1E293B]/60 space-y-0.5">
            <span className="text-[#A7B4CC] text-[11px]">Earth Orbital Velocity:</span>
            <div className="text-base font-bold text-[#F5C451] tabular-nums">
              {ephemData?.earthReference.orbitalVelocityKmS ?? 29.78} km/s
            </div>
            <div className="text-[10px] text-[#A7B4CC]">~107,200 km/h in space</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050B1A]/70 border border-[#1E293B]/60 space-y-0.5">
            <span className="text-[#A7B4CC] text-[11px]">Heliocentric Earth Distance:</span>
            <div className="text-base font-bold text-[#38BDF8] tabular-nums">
              {ephemData?.objects.find(o => o.id === 'earth')?.distSunAU ?? 0.995} AU
            </div>
            <div className="text-[10px] text-[#A7B4CC]">~148.8 million km</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050B1A]/70 border border-[#1E293B]/60 space-y-0.5">
            <span className="text-[#A7B4CC] text-[11px]">Lunar Distance (Moon):</span>
            <div className="text-base font-bold text-[#F8FAFC] tabular-nums">
              {ephemData?.objects.find(o => o.id === 'moon')?.distEarthLunar ?? 1.02} LD
            </div>
            <div className="text-[10px] text-[#A7B4CC]">~392,000 km from Earth</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050B1A]/70 border border-[#1E293B]/60 space-y-0.5">
            <span className="text-[#A7B4CC] text-[11px]">Coordinate Frame:</span>
            <div className="text-sm font-bold text-[#38BDF8] truncate">
              ICRF / J2000 Ecliptic
            </div>
            <div className="text-[10px] text-[#A7B4CC]">Epoch {ephemData ? ephemData.epoch.slice(0, 10) : 'J2000'}</div>
          </div>
        </div>
      </div>

      {/* 2. SECTION A: NEXT UPCOMING ASTEROID ENCOUNTER TICKER */}
      {nextAsteroid && (
        <div 
          onClick={() => {
            window.location.hash = `asteroid-watch?mode=motion&target=${encodeURIComponent(nextAsteroid.designation)}`;
            onNavigate('asteroid-watch');
          }}
          className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#0B1630] via-[#0E1C38] to-[#0B1630] border border-[#38BDF8]/30 hover:border-[#38BDF8] shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                  Upcoming Close-Approach Event
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-semibold border border-emerald-500/30">
                  NASA CNEOS Verified
                </span>
                {nextAsteroid.isPotentiallyHazardous && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-mono font-semibold border border-rose-500/30">
                    PHA Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-[#F8FAFC] mt-0.5 font-medium leading-relaxed">
                <strong>{nextAsteroid.designation}</strong> will pass safely at{' '}
                <strong className="text-[#38BDF8]">{nextAsteroid.missDistanceLunar.toFixed(2)} Lunar Distances</strong> ({nextAsteroid.missDistanceKm.toLocaleString()} km) on{' '}
                <strong>{nextAsteroid.closeApproachDate}</strong> at {nextAsteroid.relativeVelocityKmS} km/s.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#38BDF8] shrink-0">
            <span>Inspect Motion Mode Trajectory</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* 3. SECTION B: INTERACTIVE SOLAR SYSTEM PREVIEW */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-semibold uppercase tracking-wider">
              <Orbit className="w-3.5 h-3.5" />
              <span>Real-Time Celestial Motion</span>
            </div>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              Solar System Planetary Ephemeris Preview
            </h2>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Calculated heliocentric coordinates and orbital speeds for 18 celestial bodies. Derived from NASA/JPL Standish analytical state vectors.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('observatory')}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-[#050B1A] font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-[#38BDF8]/20 cursor-pointer"
            >
              <Telescope className="w-4 h-4" />
              <span>Live Cosmic Observatory</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('universe')}
              className="px-4 py-2.5 rounded-xl bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] text-[#F8FAFC] font-mono font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#38BDF8]" />
              <span>Open Full 3D Universe</span>
            </button>
          </div>
        </div>

        {/* Canvas & Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Canvas Viewport (Col Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative rounded-xl bg-[#050B1A] border border-[#1E293B] overflow-hidden shadow-inner h-110 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Controls Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-3 py-1 rounded-lg backdrop-blur-md border text-[11px] font-mono flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                    isSimulating
                      ? 'bg-[#F5C451]/20 text-[#F5C451] border-[#F5C451]/40'
                      : 'bg-[#050B1A]/85 text-[#A7B4CC] border-[#1E293B]'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isSimulating ? 'Pause Motion' : 'Simulate Motion'}</span>
                </button>

                <button
                  onClick={() => setScaleMode(prev => prev === 'inner' ? 'outer' : 'inner')}
                  className="px-3 py-1 rounded-lg bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-[#38BDF8]" />
                  <span>{scaleMode === 'inner' ? 'Inner (0–5.2 AU)' : 'Outer (0–50 AU)'}</span>
                </button>

                <button
                  onClick={() => setShowOrbits(!showOrbits)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                    showOrbits ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A]/85 text-[#A7B4CC] border-[#1E293B]'
                  }`}
                >
                  Orbits: {showOrbits ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                    showLabels ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A]/85 text-[#A7B4CC] border-[#1E293B]'
                  }`}
                >
                  Labels: {showLabels ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
                  className="p-1 rounded-lg bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] transition-all cursor-pointer"
                  title="Reset Pan & Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#A7B4CC] bg-[#050B1A]/85 backdrop-blur-md px-2.5 py-0.5 rounded border border-[#1E293B]">
                Drag to Pan • Wheel to Zoom
              </div>
            </div>

            {/* Quick Object Selection Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {ephemData?.objects.map(obj => {
                const isSelected = obj.id === selectedObjectId;
                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0E1B38] text-[#F8FAFC] border-[#38BDF8] shadow-xs'
                        : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: obj.color }} />
                    <span className="font-semibold">{obj.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Object Detail Inspector (Col Span 1) */}
          <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-4">
            {selectedObject ? (
              <div className="space-y-4">
                <div className="border-b border-[#1E293B] pb-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
                    {selectedObject.classification}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedObject.color }} />
                    <h3 className="text-xl font-bold font-mono text-[#F8FAFC]">
                      {selectedObject.name}
                    </h3>
                  </div>
                  <div className="text-[11px] font-mono text-[#A7B4CC]">
                    {selectedObject.designation}
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
                  <AstronomicalImage
                    target={selectedObject}
                    targetType={
                      selectedObject.id === 'sun' ? 'star'
                      : ['moon', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(selectedObject.id) ? 'planet'
                      : 'small-body'
                    }
                    aspectRatio="16/9"
                    showBadge={true}
                    className="w-full h-36 object-cover"
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                    <span className="text-[10px] text-[#A7B4CC]">Dist. to Sun:</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums">{selectedObject.distSunAU} AU</div>
                    <div className="text-[10px] text-[#A7B4CC]">{selectedObject.distSunMillionKm}M km</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                    <span className="text-[10px] text-[#A7B4CC]">Dist. to Earth:</span>
                    <div className="font-bold text-[#38BDF8] mt-0.5 tabular-nums">{selectedObject.distEarthAU} AU</div>
                    <div className="text-[10px] text-[#A7B4CC]">{selectedObject.distEarthLunar} LD</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                    <span className="text-[10px] text-[#A7B4CC]">Orbital Speed:</span>
                    <div className="font-bold text-[#F5C451] mt-0.5 tabular-nums">{selectedObject.orbitalSpeedKmS} km/s</div>
                    <div className="text-[10px] text-[#A7B4CC]">~{Math.round(selectedObject.orbitalSpeedKmS * 3600).toLocaleString()} km/h</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                    <span className="text-[10px] text-[#A7B4CC]">Period:</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums">{selectedObject.orbitalElements.orbitalPeriodYears} yrs</div>
                    <div className="text-[10px] text-[#A7B4CC]">~{Math.round(selectedObject.orbitalElements.orbitalPeriodYears * 365.25)} days</div>
                  </div>
                </div>

                {/* Plain-Language Description */}
                <p className="text-xs text-[#A7B4CC] leading-relaxed p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  {selectedObject.educationalSummary}
                </p>

                {/* Link to 3D Universe */}
                <button
                  onClick={() => onNavigate('universe')}
                  className="w-full py-2.5 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono font-semibold text-[#38BDF8] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Explore {selectedObject.name.split(' ')[0]} in 3D</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-xs text-[#A7B4CC] font-mono py-12">
                Loading planetary ephemeris...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. SECTION C: EARTH APPROACH MONITOR SUMMARY */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5" />
              <span>NASA/JPL CNEOS CAD Feed</span>
            </div>
            <h2 className="text-2xl font-bold font-mono text-[#F8FAFC]">
              Near-Earth Asteroid & Comet Approach Summary
            </h2>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Verified close approaches calculated by NASA JPL Center for Near Earth Object Studies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B] text-xs font-mono">
              <button
                onClick={() => setCadTimeframe('24h')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  cadTimeframe === '24h' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setCadTimeframe('7d')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  cadTimeframe === '7d' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setCadTimeframe('30d')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  cadTimeframe === '30d' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'
                }`}
              >
                30 Days
              </button>
            </div>

            <button
              onClick={() => onNavigate('asteroid-watch')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#050B1A] font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-emerald-500/20"
            >
              <span>Full Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mandatory Scientific Distinction Notice */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-[#050B1A] via-[#0E1B38] to-[#050B1A] border border-[#38BDF8]/40 space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#38BDF8]">
            <Info className="w-4 h-4 shrink-0" />
            <span>Important Scientific Distinction: Close Approach vs. Impact Threat</span>
          </div>
          <p className="text-xs text-[#F8FAFC] leading-relaxed italic">
            “An asteroid passing near Earth does not automatically mean it will hit Earth. Its predicted trajectory, uncertainty, and any independently assessed impact risk must be considered.”
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#A7B4CC] pt-1">
            <span>• 1 Lunar Distance (LD) = 384,400 km</span>
            <span>• Standard NEO boundary: 0.05 AU (~19.5 LD / 7.5M km)</span>
            <a
              href="https://cneos.jpl.nasa.gov/sentry/"
              target="_blank"
              rel="noreferrer"
              className="text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              <span>Verify on NASA CNEOS Sentry</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Close Approaches Compact Grid */}
        {cadData && cadData.approaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cadData.approaches.slice(0, 6).map(app => (
              <div
                key={`${app.designation}-${app.closeApproachDate}`}
                onClick={() => {
                  window.location.hash = `asteroid-watch?mode=motion&target=${encodeURIComponent(app.designation)}`;
                  onNavigate('asteroid-watch');
                }}
                className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                    {app.designation}
                  </span>
                  {app.isPotentiallyHazardous ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      PHA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-[#A7B4CC]">
                      NEO
                    </span>
                  )}
                </div>

                {/* Visual Thumbnail */}
                <div className="rounded-lg overflow-hidden border border-[#1E293B] bg-[#0B1630]">
                  <AstronomicalImage
                    target={{
                      id: app.designation.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      name: app.designation,
                      classification: app.isPotentiallyHazardous ? 'Potentially Hazardous Asteroid' : 'Near-Earth Object',
                      diameterEstimateMeters: app.estimatedDiameterMeters.avg,
                    }}
                    targetType="small-body"
                    aspectRatio="16/9"
                    showBadge={true}
                    className="w-full h-24 object-cover"
                  />
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A7B4CC]">Encounter Date:</span>
                    <span className="text-[#F8FAFC]">{app.closeApproachDate.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A7B4CC]">Miss Distance:</span>
                    <span className="text-[#38BDF8] font-bold">
                      {app.missDistanceLunar.toFixed(2)} LD ({app.missDistanceKm.toLocaleString()} km)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A7B4CC]">Rel. Velocity:</span>
                    <span className="text-[#F5C451]">{app.relativeVelocityKmS} km/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A7B4CC]">Est. Size:</span>
                    <span className="text-[#F8FAFC]">~{app.estimatedDiameterMeters.avg} m</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[11px] font-mono text-[#38BDF8]">
                  <span>Inspect in Motion Mode</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="font-mono font-bold text-sm text-[#F8FAFC]">
              No Approaches in Selected Window ({cadTimeframe})
            </h4>
            <p className="text-xs text-[#A7B4CC]">
              No qualifying near-Earth asteroid approaches were returned by NASA/JPL CNEOS for this interval.
            </p>
          </div>
        )}
      </div>

      {/* 5. SECTION D: EXPLORE THE UNIVERSE NAVIGATION HUB */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#C084FC] border border-[#8B5CF6]/30 text-xs font-mono font-bold uppercase tracking-wider">
            Astronomy Observatories & Laboratories
          </div>
          <h2 className="text-3xl font-extrabold font-mono text-[#F8FAFC]">
            Explore the Universe
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B4CC]">
            Direct gateways to all research workstations, 3D simulations, and multi-mission archives across COSMIC FRONTIER.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 3D Universe */}
          <div
            onClick={() => onNavigate('universe')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#38BDF8]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                3D Solar System
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Full 3D WebGL space environment with interactive camera controls, planetary textures, and Saturn's rings.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>Three.js Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Exoplanet Discovery Lab */}
          <div
            onClick={() => onNavigate('exoplanets')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#8B5CF6]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C084FC]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#C084FC] transition-colors">
                Exoplanet Lab
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Discover 5,500+ confirmed worlds from NASA Exoplanet Archive with transit filters and habitable zone calculator.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#C084FC]">
              <span>NASA TAP & ADQL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: SPHEREx Explorer */}
          <div
            onClick={() => onNavigate('spherex')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#38BDF8]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Telescope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                SPHEREx Explorer
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                SPHEREx 102 infrared spectral channels, water ice absorption signatures, and dual-view image comparisons.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>102 Spectral Bands</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Galaxy Explorer */}
          <div
            onClick={() => onNavigate('galaxies')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#8B5CF6]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C084FC]">
                <Disc className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#C084FC] transition-colors">
                Galaxy Explorer
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Extragalactic catalogs, Hubble morphology, redshift distance ladder, and live NASA/IPAC NED lookup.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#C084FC]">
              <span>Live NASA/IPAC NED</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Planet X Investigation Lab */}
          <div
            onClick={() => onNavigate('planet-x')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#F5C451]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5C451]/10 border border-[#F5C451]/30 flex items-center justify-center text-[#F5C451]">
                <Orbit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#F5C451] transition-colors">
                Planet X Investigation Lab
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Batygin & Brown theoretical models, extreme TNO clustering, and interactive Tombaugh blink comparator.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#F5C451]">
              <span>Theoretical Science</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Near-Earth Asteroid Watch */}
          <div
            onClick={() => onNavigate('asteroid-watch')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-emerald-400 transition-colors">
                Asteroid Watch
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Detailed radar trajectory geometry, Lunar Distance miss vectors, and NASA CNEOS Sentry table links.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>CNEOS Radar Feed</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: NASA Data Centre */}
          <div
            onClick={() => onNavigate('data-centre')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#38BDF8]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                NASA Data Centre
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Unified cross-catalog search across solar system, stars, exoplanets, galaxies, and SPHEREx records.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
              <span>7 Scientific Catalogs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: COSMIC AI GUIDE */}
          <div
            onClick={() => onNavigate('ai-guide')}
            className="p-5 rounded-2xl bg-[#0B1630]/80 border border-[#1E293B] hover:border-[#10B981]/60 transition-all cursor-pointer flex flex-col justify-between shadow-md group space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
                COSMIC AI GUIDE
              </h3>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                Ask questions in plain language without unnecessary jargon. Verified astronomy answers with zero fabricated data.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#10B981]">
              <span>Pedagogical Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. SECTION E: MISSION & DISCOVERY HIGHLIGHTS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-semibold uppercase tracking-wider">
            NASA Mission Highlights & Observational Data
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">
            Authoritative Astronomy Highlights
          </h2>
          <p className="text-xs text-[#A7B4CC]">
            Verified daily imagery and mission telemetry directly from NASA Open Data archives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* APOD Highlight */}
          {apodData ? (
            <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#38BDF8] font-bold">
                  NASA Astronomy Picture of the Day
                </span>
                <span className="text-[10px] font-mono text-[#A7B4CC]">
                  {apodData.date}
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#F8FAFC] truncate">
                {apodData.title}
              </h4>
              <p className="text-xs text-[#A7B4CC] line-clamp-3 leading-relaxed">
                {apodData.explanation}
              </p>
              <div className="pt-1 flex items-center justify-between text-xs font-mono text-[#38BDF8]">
                <a
                  href="https://apod.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>NASA APOD Official Archive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs font-mono text-[#A7B4CC]">
              Connecting to NASA APOD Open Data feed...
            </div>
          )}

          {/* SPHEREx Mission Infrared Benchmark */}
          <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#8B5CF6] font-bold">
                NASA Astrophysics Explorer Mission
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                102 Channels Operational
              </span>
            </div>
            <div className="space-y-2">
              <h4 className="font-mono font-bold text-base text-[#F8FAFC]">
                SPHEREx All-Sky Infrared Spectral Survey
              </h4>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                NASA's Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer surveys the entire sky every six months in 102 discrete infrared wavelengths (0.75 to 5.0 µm).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC]">Spectral Coverage:</span>
                <div className="font-bold text-[#F8FAFC] mt-0.5">0.75 – 5.0 µm</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC]">Water Ice Tracer:</span>
                <div className="font-bold text-[#38BDF8] mt-0.5">3.05 µm Band</div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('spherex')}
              className="w-full py-2.5 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#8B5CF6] text-xs font-mono font-semibold text-[#C084FC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Telescope className="w-3.5 h-3.5" />
              <span>Explore SPHEREx Spectral Workbench</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
