import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import type { AppPage, LiveCloseApproach, LiveCloseApproachesResponse, LiveDataBadgeStatus } from '../types';
import { fetchLiveCloseApproaches } from '../services/liveSpaceService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { AsteroidMotionViewer } from './AsteroidMotionViewer';
import { 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  Calendar, 
  Crosshair,
  Globe,
  ArrowRight,
  Orbit,
  List
} from 'lucide-react';

interface AsteroidWatchProps {
  onNavigate: (page: AppPage) => void;
}

export const AsteroidWatch: FC<AsteroidWatchProps> = ({ onNavigate }) => {
  // Mode State: 'list' (records & CAD feed) vs 'motion' (interactive orbital scene)
  const [viewMode, setViewMode] = useState<'list' | 'motion'>('list');
  const [motionTargetDes, setMotionTargetDes] = useState<string>('99942');

  // Feed Data State
  const [cadResponse, setCadResponse] = useState<LiveCloseApproachesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<LiveCloseApproach | null>(null);

  // Filters State
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'custom'>('30d');
  const [phaOnly, setPhaOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'dist' | 'date' | 'size'>('dist');
  const [distanceUnit, setDistanceUnit] = useState<'lunar' | 'km' | 'au'>('lunar');
  const [customDateMin, setCustomDateMin] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customDateMax, setCustomDateMax] = useState<string>(
    new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  );

  // Check URL hash/query on mount for initial deep-linking
  useEffect(() => {
    const raw = window.location.hash || window.location.search;
    if (raw.includes('mode=motion')) {
      setViewMode('motion');
    }
    const targetMatch = raw.match(/target=([^&]+)/);
    if (targetMatch && targetMatch[1]) {
      setMotionTargetDes(decodeURIComponent(targetMatch[1]));
    }
  }, []);

  // Canvas Ref for Approach Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch close approaches from backend
  const loadApproaches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {
        timeframe,
        phaOnly,
        sort: sortBy,
        limit: 50
      };
      if (timeframe === 'custom') {
        params.dateMin = customDateMin;
        params.dateMax = customDateMax;
      }

      const res = await fetchLiveCloseApproaches(params);
      setCadResponse(res);
      if (res.approaches.length > 0) {
        setSelectedApproach(res.approaches[0]);
      } else {
        setSelectedApproach(null);
      }
    } catch (err: any) {
      console.error('Error fetching close approaches:', err);
      setError('Failed to retrieve close approach data from JPL CNEOS. Showing verified cached records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApproaches();
  }, [timeframe, phaOnly, sortBy]);

  // Statistics Computations
  const stats = useMemo(() => {
    if (!cadResponse || !cadResponse.approaches) {
      return { total: 0, closest: null, largest: null, phaCount: 0 };
    }
    const apps = cadResponse.approaches;
    const total = apps.length;
    const phaCount = apps.filter(a => a.isPotentiallyHazardous).length;
    let closest = apps.length > 0 ? apps[0] : null;
    let largest = apps.length > 0 ? apps[0] : null;

    apps.forEach(a => {
      if (!closest || a.missDistanceAU < closest.missDistanceAU) closest = a;
      if (!largest || a.estimatedDiameterMeters.avg > largest.estimatedDiameterMeters.avg) largest = a;
    });

    return { total, closest, largest, phaCount };
  }, [cadResponse]);

  // Status Badge Rendering
  const renderBadge = (status: LiveDataBadgeStatus) => {
    switch (status) {
      case 'LIVE DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE JPL CNEOS FEED
          </span>
        );
      case 'RECENT DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
            RECENT DATA (VERIFIED ARCHIVE)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {status}
          </span>
        );
    }
  };

  // Format Distance based on selected unit
  const formatDistance = (approach: LiveCloseApproach) => {
    if (distanceUnit === 'lunar') {
      return `${approach.missDistanceLunar.toFixed(2)} LD`;
    }
    if (distanceUnit === 'km') {
      return `${approach.missDistanceKm.toLocaleString()} km`;
    }
    return `${approach.missDistanceAU.toFixed(5)} AU`;
  };

  // Approach Schematic Canvas Renderer
  useEffect(() => {
    if (!canvasRef.current || !selectedApproach) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 400;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Dark Background
    ctx.fillStyle = '#050B1A';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Scale setup: 1 Lunar Distance (384,400 km) mapped to ~75px
    const pxPerLD = Math.min(width, height) / 10;
    const missDistanceLD = selectedApproach.missDistanceLunar;
    const missPx = Math.min(missDistanceLD * pxPerLD, width * 0.42);

    // 1. Geosynchronous Orbit Ring (0.11 LD)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 0.11 * pxPerLD, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Moon Orbit Ring (1.0 LD = 384,400 km)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 1.0 * pxPerLD, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Moon Orbit Label
    ctx.fillStyle = '#38BDF8';
    ctx.font = '10px monospace';
    ctx.fillText('Moon Orbit (1 LD = 384,400 km)', centerX + 1.0 * pxPerLD + 6, centerY - 6);

    // 3. Central Earth with Atmosphere Glow
    const earthRadius = 14;
    const earthGlow = ctx.createRadialGradient(centerX, centerY, earthRadius, centerX, centerY, earthRadius + 10);
    earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    earthGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, earthRadius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1D4ED8';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Earth', centerX, centerY + 3);
    ctx.textAlign = 'left';

    // 4. Approaching Asteroid Trajectory (Hyperbolic Pass)
    const encounterAngle = -Math.PI / 4;
    const closestX = centerX + Math.cos(encounterAngle) * missPx;
    const closestY = centerY + Math.sin(encounterAngle) * missPx;

    // Tangent trajectory line
    const trajAngle = encounterAngle + Math.PI / 2;
    const trajLen = width * 0.48;
    const startX = closestX - Math.cos(trajAngle) * trajLen;
    const startY = closestY - Math.sin(trajAngle) * trajLen;
    const endX = closestX + Math.cos(trajAngle) * trajLen;
    const endY = closestY + Math.sin(trajAngle) * trajLen;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = selectedApproach.isPotentiallyHazardous ? '#F87171' : '#F5C451';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Miss Distance Vector (Earth Center to Closest Point)
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(closestX, closestY);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Miss Distance Value Text on Line
    const midX = (centerX + closestX) / 2;
    const midY = (centerY + closestY) / 2;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `Miss: ${selectedApproach.missDistanceLunar.toFixed(2)} LD (${selectedApproach.missDistanceKm.toLocaleString()} km)`,
      midX + 8,
      midY - 8
    );

    // 6. Closest Approach Asteroid Marker
    ctx.beginPath();
    ctx.arc(closestX, closestY, 6, 0, Math.PI * 2);
    ctx.fillStyle = selectedApproach.isPotentiallyHazardous ? '#EF4444' : '#F5C451';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pulse Ring around asteroid
    ctx.beginPath();
    ctx.arc(closestX, closestY, 12, 0, Math.PI * 2);
    ctx.strokeStyle = selectedApproach.isPotentiallyHazardous ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 196, 81, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Asteroid Label & Velocity Vector
    ctx.fillStyle = selectedApproach.isPotentiallyHazardous ? '#F87171' : '#F5C451';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${selectedApproach.designation}`, closestX + 16, closestY - 8);

    ctx.fillStyle = '#A7B4CC';
    ctx.font = '10px monospace';
    ctx.fillText(`v_rel = ${selectedApproach.relativeVelocityKmS} km/s`, closestX + 16, closestY + 6);
  }, [selectedApproach, distanceUnit]);

  // Size Comparison Benchmark description
  const getSizeBenchmark = (diamMeters: number) => {
    if (diamMeters < 15) return 'Automobile / Delivery Van (~10 m)';
    if (diamMeters < 40) return 'Chelyabinsk Meteor / Small Building (~20 m)';
    if (diamMeters < 90) return 'Commercial Passenger Jet (~60 m)';
    if (diamMeters < 160) return 'FIFA Football Stadium (~140 m threshold for PHA)';
    if (diamMeters < 350) return 'Eiffel Tower / Apophis Scale (~300 m)';
    return 'Mountain Peak / Empire State Building Scale (> 400 m)';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Live NASA CNEOS Badge */}
      <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-b from-[#0B1630] to-[#070E22] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                NASA/JPL CNEOS Close-Approach Data (CAD)
              </span>
              {cadResponse && renderBadge(cadResponse.statusLabel)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Live Asteroid & Comet Approach Monitor
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-2xl leading-relaxed">
              Real-time radar and optical tracking of natural near-Earth objects (NEOs) passing within the inner Solar System. Direct telemetry from NASA/JPL Center for Near Earth Object Studies.
            </p>
          </div>

          {/* Quick Refresh & External Link */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://cneos.jpl.nasa.gov/ca/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#050B1A] hover:bg-[#0E1B38] border border-[#1E293B] text-xs font-mono text-[#A7B4CC] hover:text-[#F8FAFC] transition-all flex items-center gap-2"
            >
              <span>JPL CNEOS Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={loadApproaches}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8]/50 text-xs font-mono font-semibold text-[#F8FAFC] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* 2. Highlights Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#1E293B]">
          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <span className="text-[11px] font-mono text-[#A7B4CC] uppercase">Total Encounters</span>
            <div className="text-2xl font-bold font-mono text-[#F8FAFC]">
              {stats.total}
            </div>
            <div className="text-[11px] text-[#38BDF8] font-mono">
              In timeframe ({timeframe})
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <span className="text-[11px] font-mono text-[#A7B4CC] uppercase">Closest Approach</span>
            <div className="text-xl font-bold font-mono text-[#38BDF8] truncate">
              {stats.closest ? `${stats.closest.missDistanceLunar.toFixed(2)} LD` : 'None'}
            </div>
            <div className="text-[11px] text-[#A7B4CC] font-mono truncate">
              {stats.closest ? `${stats.closest.designation} (${stats.closest.closeApproachDate.split(' ')[0]})` : 'N/A'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <span className="text-[11px] font-mono text-[#A7B4CC] uppercase">Largest Approaching Object</span>
            <div className="text-xl font-bold font-mono text-[#F5C451] truncate">
              {stats.largest ? `~${stats.largest.estimatedDiameterMeters.avg} m` : 'None'}
            </div>
            <div className="text-[11px] text-[#A7B4CC] font-mono truncate">
              {stats.largest ? stats.largest.designation : 'N/A'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <span className="text-[11px] font-mono text-[#A7B4CC] uppercase">Potentially Hazardous (PHA)</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {stats.phaCount}
            </div>
            <div className="text-[11px] text-[#A7B4CC] font-mono">
              Geometric MOID criterion only
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Mode Switch Tabs: List Mode vs Motion Mode */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#1E293B]">
          <div className="flex rounded-xl bg-[#050B1A] p-1 border border-[#1E293B] text-xs font-mono">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#38BDF8] text-[#050B1A] shadow-md'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List Mode (Records & CAD Feed)</span>
            </button>
            <button
              onClick={() => {
                if (selectedApproach) {
                  setMotionTargetDes(selectedApproach.designation);
                }
                setViewMode('motion');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'motion'
                  ? 'bg-[#38BDF8] text-[#050B1A] shadow-md'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Orbit className="w-4 h-4" />
              <span>Motion Mode (Interactive Orbital Scene)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#A7B4CC]">
            {viewMode === 'list' 
              ? 'Viewing catalog records, close approach tables & encounter schematic'
              : `Viewing time-controlled Keplerian motion & orbital state vectors for ${motionTargetDes}`}
          </span>
        </div>

        {/* Cross-navigation links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onNavigate('mission-control')}
            className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono text-[#F8FAFC] flex items-center justify-between group transition-all"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#38BDF8]" />
              <span>Inspect Real-Time Ephemerides in Mission Control</span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('planet-x')}
            className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#8B5CF6] text-xs font-mono text-[#F8FAFC] flex items-center justify-between group transition-all"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#8B5CF6]" />
              <span>Explore Outer Solar System Planet X Investigation</span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#8B5CF6] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {viewMode === 'motion' ? (
        <AsteroidMotionViewer
          initialDesignation={motionTargetDes || selectedApproach?.designation || '99942'}
          allApproaches={cadResponse?.approaches || []}
          onSwitchToListMode={() => setViewMode('list')}
          onSelectApproach={(app: LiveCloseApproach) => {
            setSelectedApproach(app);
            setMotionTargetDes(app.designation);
          }}
        />
      ) : (
        <>
          {/* 3. Filter Controls Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Timeframe Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[#A7B4CC] flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
              Time Window:
            </span>
            <button
              onClick={() => setTimeframe('24h')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '24h'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              Next 24 Hours
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '7d'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              Next 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '30d'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              Next 30 Days
            </button>
            <button
              onClick={() => setTimeframe('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'custom'
                  ? 'bg-[#8B5CF6] text-white font-bold shadow-sm'
                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              Custom Date Range
            </button>
          </div>

          {/* PHA & Unit Toggles */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* PHA Filter Toggle */}
            <button
              onClick={() => setPhaOnly(!phaOnly)}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                phaOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                  : 'bg-[#050B1A] text-[#A7B4CC] border-[#1E293B] hover:text-[#F8FAFC]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PHA Only: {phaOnly ? 'ON' : 'OFF'}</span>
            </button>

            {/* Distance Unit Selector */}
            <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B]">
              <button
                onClick={() => setDistanceUnit('lunar')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  distanceUnit === 'lunar' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
                title="Lunar Distances (1 LD = 384,400 km)"
              >
                LD
              </button>
              <button
                onClick={() => setDistanceUnit('km')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  distanceUnit === 'km' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
                title="Kilometres"
              >
                km
              </button>
              <button
                onClick={() => setDistanceUnit('au')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  distanceUnit === 'au' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
                title="Astronomical Units"
              >
                AU
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#A7B4CC]">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#050B1A] border border-[#1E293B] rounded-lg px-2.5 py-1 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="dist">Closest Miss Distance</option>
                <option value="date">Encounter Date</option>
                <option value="size">Largest Diameter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {timeframe === 'custom' && (
          <div className="pt-3 border-t border-[#1E293B] flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#A7B4CC]">From:</span>
              <input
                type="date"
                value={customDateMin}
                onChange={e => setCustomDateMin(e.target.value)}
                className="bg-[#050B1A] border border-[#1E293B] rounded-lg px-3 py-1 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A7B4CC]">To:</span>
              <input
                type="date"
                value={customDateMax}
                onChange={e => setCustomDateMax(e.target.value)}
                className="bg-[#050B1A] border border-[#1E293B] rounded-lg px-3 py-1 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <button
              onClick={loadApproaches}
              className="px-3 py-1 rounded-lg bg-[#38BDF8] text-[#050B1A] font-bold hover:bg-[#38BDF8]/90 transition-all"
            >
              Apply Dates
            </button>
          </div>
        )}
      </div>

      {/* 4. Interactive Earth Approach Schematic Visualizer (Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Canvas Visualizer (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC]">
                Earth Close-Approach Schematic: {selectedApproach ? selectedApproach.designation : 'Select an Event'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A7B4CC]">
              {selectedApproach ? `Epoch: ${selectedApproach.closeApproachDate}` : ''}
            </span>
          </div>

          <div className="relative rounded-2xl bg-[#050B1A] border border-[#1E293B] overflow-hidden shadow-2xl h-100 flex items-center justify-center">
            {selectedApproach ? (
              <canvas ref={canvasRef} className="w-full h-full" />
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#A7B4CC]">
                No asteroid close approach selected or qualifying in this timeframe.
              </div>
            )}

            {/* Scale Disclaimer Note */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#A7B4CC] bg-[#050B1A]/85 backdrop-blur-md px-2.5 py-1 rounded border border-[#1E293B]">
              * Schematic illustration. Physical sizes of Earth, Moon, and asteroid are magnified for readability.
            </div>
          </div>
        </div>

        {/* Selected Asteroid Details Inspector (Col Span 1) */}
        <div className="space-y-4">
          {selectedApproach ? (
            <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl space-y-6">
              <div className="space-y-2 border-b border-[#1E293B] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
                    NASA JPL CAD Record
                  </span>
                  {selectedApproach.isPotentiallyHazardous ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      PHA Flagged
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Standard NEO
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold font-mono text-[#F8FAFC]">
                  {selectedApproach.designation}
                </h3>
                <div className="text-xs font-mono text-[#A7B4CC]">
                  Close Approach: {selectedApproach.closeApproachDate} (UTC)
                </div>
              </div>

              {/* Visual Representation */}
              <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
                <AstronomicalImage
                  target={{
                    id: selectedApproach.designation.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: selectedApproach.designation,
                    classification: selectedApproach.isPotentiallyHazardous ? 'Potentially Hazardous Asteroid' : 'Near-Earth Asteroid',
                    diameterEstimateMeters: selectedApproach.estimatedDiameterMeters.avg,
                  }}
                  targetType="small-body"
                  aspectRatio="16/9"
                  showBadge={true}
                  className="w-full h-36 object-cover"
                />
              </div>

              {/* Physical & Trajectory Parameters */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-[#A7B4CC]">Nominal Miss Distance:</span>
                  <span className="font-bold text-[#38BDF8] text-sm">
                    {formatDistance(selectedApproach)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-[#A7B4CC]">Relative Velocity:</span>
                  <span className="font-bold text-[#F5C451]">
                    {selectedApproach.relativeVelocityKmS} km/s ({Math.round(selectedApproach.relativeVelocityKmS * 3600).toLocaleString()} km/h)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-[#A7B4CC]">Estimated Diameter:</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {selectedApproach.estimatedDiameterMeters.min} – {selectedApproach.estimatedDiameterMeters.max} m (~{selectedApproach.estimatedDiameterMeters.avg} m)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-[#A7B4CC]">Absolute Magnitude (H):</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {selectedApproach.absoluteMagnitudeH !== null ? `${selectedApproach.absoluteMagnitudeH} mag` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Everyday Size Scale Benchmark */}
              <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1 text-xs">
                <span className="text-[#A7B4CC] font-mono text-[11px] uppercase font-bold">
                  Size Benchmark Comparison:
                </span>
                <div className="text-[#F8FAFC] font-medium leading-relaxed">
                  {getSizeBenchmark(selectedApproach.estimatedDiameterMeters.avg)}
                </div>
              </div>

              {/* Sentry Impact Risk Assessment Notice */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>NASA CNEOS Sentry Assessment</span>
                </div>
                <p className="text-[#F8FAFC] leading-relaxed">
                  {selectedApproach.impactRisk.assessment}
                </p>
                <div className="pt-1">
                  <a
                    href={selectedApproach.impactRisk.sentryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>Inspect NASA CNEOS Sentry Table</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Inspect Orbit in Motion Mode CTA Button */}
              <button
                onClick={() => {
                  setMotionTargetDes(selectedApproach.designation);
                  setViewMode('motion');
                }}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#38BDF8]/90 hover:to-[#0284C7]/90 text-[#050B1A] font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Orbit className="w-4 h-4" />
                <span>Inspect Orbit in Motion Mode</span>
              </button>

              {/* Official JPL SBDB Link */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-[#A7B4CC]">Orbit ID: {selectedApproach.orbitId}</span>
                <a
                  href={selectedApproach.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>JPL SBDB Lookup</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] text-center text-xs font-mono text-[#A7B4CC]">
              Select an encounter from the table below to inspect its trajectory.
            </div>
          )}
        </div>
      </div>

      {/* 5. Close Approaches Feed Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="text-xl font-bold font-mono text-[#F8FAFC]">
              Upcoming Verified Close Approaches
            </h3>
            <p className="text-xs text-[#A7B4CC] mt-0.5">
              Showing {cadResponse?.approaches.length || 0} events calculated by NASA JPL Center for Near Earth Object Studies.
            </p>
          </div>
          <span className="text-xs font-mono text-[#38BDF8]">
            Click any row to display encounter geometry
          </span>
        </div>

        {cadResponse && cadResponse.approaches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#A7B4CC] uppercase text-[11px]">
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Encounter Date (UTC)</th>
                  <th className="py-3 px-4">Miss Distance ({distanceUnit.toUpperCase()})</th>
                  <th className="py-3 px-4">Rel. Velocity</th>
                  <th className="py-3 px-4">Est. Diameter</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Orbit Motion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {cadResponse.approaches.map(item => {
                  const isSelected = selectedApproach?.designation === item.designation;
                  return (
                    <tr
                      key={`${item.designation}-${item.closeApproachDate}`}
                      onClick={() => setSelectedApproach(item)}
                      className={`hover:bg-[#0E1B38]/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#0E1B38] border-l-4 border-l-[#38BDF8]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">
                        {item.designation}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7B4CC] tabular-nums">
                        {item.closeApproachDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#38BDF8] tabular-nums">
                        {formatDistance(item)}
                      </td>
                      <td className="py-3.5 px-4 text-[#F5C451] tabular-nums">
                        {item.relativeVelocityKmS} km/s
                      </td>
                      <td className="py-3.5 px-4 text-[#F8FAFC] tabular-nums">
                        ~{item.estimatedDiameterMeters.avg} m ({item.estimatedDiameterMeters.min}–{item.estimatedDiameterMeters.max} m)
                      </td>
                      <td className="py-3.5 px-4">
                        {item.isPotentiallyHazardous ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            PHA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-[#A7B4CC]">
                            NEO
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApproach(item);
                            setMotionTargetDes(item.designation);
                            setViewMode('motion');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Orbit className="w-3.5 h-3.5" />
                          <span>Motion</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Honest Scientific Empty State */
          <div className="p-12 text-center rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold font-mono text-[#F8FAFC]">
              No Close Approaches in Selected Window
            </h4>
            <p className="text-xs text-[#A7B4CC] max-w-md mx-auto leading-relaxed">
              No asteroid encounters matching your criteria were returned by NASA/JPL CNEOS for this timeframe. The inner space neighbourhood is currently clear of matching close encounters.
            </p>
          </div>
        )}
      </div>
      </>
      )}

      {/* 6. Scientific Distinction: Close Approach vs PHA vs Impact Risk (Section 7) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
            Scientific Data Integrity
          </span>
          <h2 className="text-2xl font-bold font-mono text-[#F8FAFC]">
            Demystifying Asteroid Encounters: Three Distinct Concepts
          </h2>
          <p className="text-xs text-[#A7B4CC] leading-relaxed">
            Astronomy news frequently confuses close passes with imminent collisions. The scientific community treats these as three separate concepts:
          </p>
        </div>

        {/* Mandatory Beginner-Friendly Highlight Quote */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-[#050B1A] via-[#0E1B38] to-[#050B1A] border border-[#38BDF8]/40 shadow-lg">
          <p className="text-sm font-medium text-[#F8FAFC] italic leading-relaxed text-center sm:text-left">
            “An asteroid passing near Earth does not automatically mean it will hit Earth. Its predicted trajectory, uncertainty, and any independently assessed impact risk must be considered.”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          {/* Card 1: Close Approach */}
          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-mono font-bold text-xs">
                1
              </span>
              <h4 className="font-mono font-bold text-[#38BDF8] text-sm">
                Close Approach
              </h4>
            </div>
            <p className="text-[#A7B4CC]">
              An object is predicted to pass within a stated distance of Earth (typically defined as within 0.05 AU or ~19.5 Lunar Distances). Because the Solar System is immense, an asteroid passing at 5 or 10 Lunar Distances is millions of kilometres away with vast empty space between.
            </p>
          </div>

          {/* Card 2: Potentially Hazardous Asteroid */}
          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center font-mono font-bold text-xs">
                2
              </span>
              <h4 className="font-mono font-bold text-[#F5C451] text-sm">
                Potentially Hazardous (PHA)
              </h4>
            </div>
            <p className="text-[#A7B4CC]">
              A classification based strictly on two geometric parameters: a Minimum Orbit Intersection Distance (MOID) to Earth of $\le 0.05$ AU, and an absolute magnitude $H \le 22.0$ (~140 m diameter). <strong>This classification does NOT mean an impact is predicted.</strong> It is merely a checklist for prioritising telescope monitoring over centuries.
            </p>
          </div>

          {/* Card 3: Impact Risk & Sentry */}
          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                3
              </span>
              <h4 className="font-mono font-bold text-emerald-400 text-sm">
                Impact Risk (CNEOS Sentry)
              </h4>
            </div>
            <p className="text-[#A7B4CC]">
              A dedicated statistical computation based on orbital uncertainty ellipses over 100+ years. If an orbit's position uncertainty overlap includes Earth, it is cataloged on NASA's automated Sentry risk system. As more telescope tracking observations arrive, orbital uncertainty shrinks and impact probabilities almost always drop to zero.
            </p>
            <a
              href="https://cneos.jpl.nasa.gov/sentry/"
              target="_blank"
              rel="noreferrer"
              className="text-[#38BDF8] hover:underline flex items-center gap-1 font-mono pt-1"
            >
              <span>Explore Official NASA Sentry Table</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
