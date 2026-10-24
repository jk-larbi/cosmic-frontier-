import { useState, useEffect, useMemo, type FC } from 'react';
import type { AppPage, ExoplanetRecord, NasaImageRecord } from '../types';
import { fetchConfirmedExoplanets, fetchNasaImageSearch } from '../services/astronomyDataService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { AstronomicalImageGallery } from './astronomy-images/AstronomicalImageGallery';
import { AstronomicalComparisonVisual } from './astronomy-images/AstronomicalComparisonVisual';
import { 
  Telescope, 
  Orbit, 
  Search, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Compass, 
  ChevronRight, 
  ChevronLeft,
  Flame, 
  Droplets, 
  Snowflake, 
  Scale, 
  Activity, 
  Radio, 
  Camera,
  Database,
  Filter
} from 'lucide-react';

interface ExoplanetDiscoveryLabProps {
  onNavigate: (page: AppPage) => void;
}

export const ExoplanetDiscoveryLab: FC<ExoplanetDiscoveryLabProps> = ({ onNavigate }) => {
  const [exoplanets, setExoplanets] = useState<ExoplanetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Connecting to NASA Exoplanet Archive...');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [catalogTable, setCatalogTable] = useState<string>('pscomppars (Planetary Systems Composite Parameters)');
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  // Main workbench tabs: Catalog vs NASA Imagery
  const [activeMainTab, setActiveMainTab] = useState<'catalog' | 'imagery'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedDisposition, setSelectedDisposition] = useState<'all' | 'confirmed' | 'candidate'>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<'all' | 'terrestrial' | 'super-earth' | 'sub-neptune' | 'gas-giant'>('all');
  const [sortBy, setSortBy] = useState<'year-desc' | 'radius-asc' | 'period-asc' | 'distance-asc'>('year-desc');

  // Pagination state for Catalog
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // NASA Imagery Library Search State
  const [imageQuery, setImageQuery] = useState('TRAPPIST-1');
  const [imageCategory, setImageCategory] = useState<string>('all');
  const [imagePage, setImagePage] = useState(1);
  const [imageResults, setImageResults] = useState<NasaImageRecord[]>([]);
  const [imageTotalHits, setImageTotalHits] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Modal & Comparison state
  const [activePlanetModal, setActivePlanetModal] = useState<ExoplanetRecord | null>(null);
  const [compareList, setCompareList] = useState<ExoplanetRecord[]>([]);
  const [activeDiscoveryMethodTab, setActiveDiscoveryMethodTab] = useState<'transit' | 'radial-velocity' | 'direct-imaging' | 'microlensing' | 'astrometry'>('transit');

  // Load exoplanets on mount
  const loadExoplanetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConfirmedExoplanets('', true, 1, 150);
      setExoplanets(res.data || []);
      setDataSource(res.source || 'NASA Exoplanet Archive (Caltech/IPAC TAP)');
      setIsLive(res.isLive);
      if (res.table) setCatalogTable(res.table);
      if (res.lastUpdatedUtc) setLastSyncDate(res.lastUpdatedUtc);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve exoplanets';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Search NASA Image & Video Library
  const searchNasaImages = async (query = imageQuery, page = imagePage, category = imageCategory) => {
    setImageLoading(true);
    setImageError(null);
    try {
      const res = await fetchNasaImageSearch(query, page, 12, category);
      setImageResults(res.data || []);
      setImageTotalHits(res.totalRecords || (res.data ? res.data.length : 0));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to search NASA Image Library';
      setImageError(msg);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    loadExoplanetData();
    searchNasaImages('TRAPPIST-1', 1, 'all');
  }, []);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMethod, selectedDisposition, selectedSizeFilter, sortBy]);

  // Filter and sort exoplanets
  const filteredPlanets = useMemo(() => {
    return exoplanets.filter(planet => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = planet.planetName.toLowerCase().includes(q);
        const matchesStar = planet.hostStar.toLowerCase().includes(q);
        const matchesMethod = planet.discoveryMethod.toLowerCase().includes(q);
        if (!matchesName && !matchesStar && !matchesMethod) return false;
      }

      // 2. Discovery Method
      if (selectedMethod !== 'all') {
        if (!planet.discoveryMethod.toLowerCase().includes(selectedMethod.toLowerCase())) {
          return false;
        }
      }

      // 3. Disposition (Confirmed vs Candidate)
      if (selectedDisposition === 'confirmed') {
        if (planet.disposition && planet.disposition !== 'Confirmed') return false;
      } else if (selectedDisposition === 'candidate') {
        if (planet.disposition !== 'Candidate') return false;
      }

      // 4. Planet Size Category
      if (selectedSizeFilter !== 'all') {
        const r = planet.radiusEarthRadii;
        if (r === null) return false;
        if (selectedSizeFilter === 'terrestrial' && r >= 1.25) return false;
        if (selectedSizeFilter === 'super-earth' && (r < 1.25 || r >= 2.0)) return false;
        if (selectedSizeFilter === 'sub-neptune' && (r < 2.0 || r >= 4.0)) return false;
        if (selectedSizeFilter === 'gas-giant' && r < 4.0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'year-desc') {
        return (b.discoveryYear || 0) - (a.discoveryYear || 0);
      }
      if (sortBy === 'radius-asc') {
        return (a.radiusEarthRadii ?? 999) - (b.radiusEarthRadii ?? 999);
      }
      if (sortBy === 'period-asc') {
        return (a.orbitalPeriodDays ?? 99999) - (b.orbitalPeriodDays ?? 99999);
      }
      if (sortBy === 'distance-asc') {
        return (a.distanceLightYears ?? 99999) - (b.distanceLightYears ?? 99999);
      }
      return 0;
    });
  }, [exoplanets, searchQuery, selectedMethod, selectedDisposition, selectedSizeFilter, sortBy]);

  // Paged slice for Catalog grid
  const totalFiltered = filteredPlanets.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedPlanets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPlanets.slice(startIndex, startIndex + pageSize);
  }, [filteredPlanets, currentPage, pageSize]);

  // Comparison toggle
  const toggleCompare = (planet: ExoplanetRecord) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.planetName === planet.planetName);
      if (exists) {
        return prev.filter(p => p.planetName !== planet.planetName);
      }
      if (prev.length >= 3) {
        // limit to 3 planets max for comparison
        return [prev[1], prev[2], planet];
      }
      return [...prev, planet];
    });
  };

  // Keyboard dismissal on Escape
  useEffect(() => {
    if (!activePlanetModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePlanetModal(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activePlanetModal]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMethod('all');
    setSelectedDisposition('all');
    setSelectedSizeFilter('all');
    setSortBy('year-desc');
  };

  // Habitable Zone Estimator Helper
  const getHabitableZoneEstimate = (tempK: number | null, semiMajorAU: number | null) => {
    if (!tempK || !semiMajorAU) return null;
    // Approximating stellar luminosity L relative to Sun based on main sequence T_eff ~ (T/T_sun)^4
    const lRel = Math.pow(tempK / 5778, 4);
    const innerAU = parseFloat(Math.sqrt(lRel / 1.1).toFixed(3));
    const outerAU = parseFloat(Math.sqrt(lRel / 0.53).toFixed(3));
    
    let zone: 'too-hot' | 'habitable' | 'too-cold' = 'habitable';
    if (semiMajorAU < innerAU) zone = 'too-hot';
    else if (semiMajorAU > outerAU) zone = 'too-cold';

    return { innerAU, outerAU, zone, lRel: parseFloat(lRel.toFixed(3)) };
  };

  return (
    <div className="min-h-screen bg-[#050B1A] text-[#F8FAFC] pb-24">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden border-b border-[#1E293B] bg-linear-to-b from-[#0B1630] to-[#050B1A] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#8B5CF6]/10 text-[#C084FC] border border-[#8B5CF6]/30 mb-4 font-mono">
                <Telescope className="w-3.5 h-3.5" />
                NASA Space Apps • Exoplanet Discovery Lab
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Worlds Beyond Our Solar System
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                An exoplanet is any planet orbiting a star outside our own Solar System. 
                Search, filter, inspect physical parameters, and compare confirmed exoplanets 
                using live data from Caltech/IPAC and the NASA Exoplanet Archive.
              </p>
            </div>

            {/* Gateway status badge */}
            <div className="flex flex-col items-start md:items-end gap-2 bg-[#0B1630]/90 border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="text-[#94A3B8]">Data Gateway:</span>
                <span className={isLive ? 'text-emerald-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                  {isLive ? 'NASA Exoplanet Archive (Live TAP)' : 'Verified Local Archive'}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Source: <span className="text-[#CBD5E1]">{dataSource}</span>
              </p>
              <p className="text-xs text-[#64748B]">
                Table: <span className="text-sky-300 font-mono font-medium">{catalogTable}</span>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                <span>Total Archive: <strong className="text-white">6,451+</strong></span>
                <span>•</span>
                <span>Sync: <span className="text-emerald-400 font-mono">{lastSyncDate ? new Date(lastSyncDate).toLocaleTimeString() : 'Current'}</span></span>
              </div>
              <button
                onClick={loadExoplanetData}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:text-[#7DD3FC] transition-colors"
                title="Refresh Exoplanet Archive cache"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Query Fresh TAP Records
              </button>
            </div>
          </div>

          {/* Scientific Disclaimer Pill */}
          <div className="mt-8 flex items-start gap-3 bg-[#0F172A]/80 border border-[#334155] rounded-xl p-4 text-xs text-[#94A3B8] leading-relaxed">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#F8FAFC] font-semibold">Strict Scientific Integrity: </span>
              Measurements are grounded in verified peer-reviewed astronomical discoveries (NASA Exoplanet Archive). 
              Unmeasured parameters are preserved as unavailable rather than estimated or fabricated. 
              Planet graphics are illustrative models; direct optical surface photographs of exoplanets do not yet exist with modern telescopes.
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* WORKBENCH MODE SELECTOR TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab('catalog')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'catalog'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-lg shadow-sky-500/20'
                  : 'text-[#94A3B8] hover:text-white bg-[#0B1630] border border-[#1E293B]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Planetary Systems Catalog</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeMainTab === 'catalog' ? 'bg-[#050B1A]/30 text-[#050B1A]' : 'bg-[#1E293B] text-sky-400'
              }`}>
                {filteredPlanets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('imagery')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'imagery'
                  ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/20'
                  : 'text-[#94A3B8] hover:text-white bg-[#0B1630] border border-[#1E293B]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>NASA Image Library Explorer</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeMainTab === 'imagery' ? 'bg-black/30 text-white' : 'bg-[#1E293B] text-violet-400'
              }`}>
                {imageTotalHits || 'Live'}
              </span>
            </button>
          </div>

          <div className="text-xs text-[#64748B] hidden md:flex items-center gap-2">
            <span>NASA/IPAC TAP sync</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-mono">Real-time Science Catalog</span>
          </div>
        </div>
        {/* CATALOG WORKSPACE TAB */}
        {activeMainTab === 'catalog' && (
          <div className="space-y-8">
            {/* CONTROLS BAR: SEARCH, FILTERS, DISPOSITION */}
        <div className="bg-[#0B1630] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exoplanet name (e.g. TRAPPIST-1 e), host star, or method..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Reset */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl bg-[#050B1A] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-[#94A3B8] hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>

          {/* Secondary Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#1E293B] text-xs">
            {/* Filter 1: Discovery Method */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">Discovery Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              >
                <option value="all">All Methods</option>
                <option value="Transit">Transit</option>
                <option value="Radial Velocity">Radial Velocity</option>
                <option value="Imaging">Direct Imaging</option>
                <option value="Microlensing">Microlensing</option>
              </select>
            </div>

            {/* Filter 2: Disposition */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">Catalog Status</label>
              <select
                value={selectedDisposition}
                onChange={(e) => setSelectedDisposition(e.target.value as 'all' | 'confirmed' | 'candidate')}
                className="w-full px-3 py-2 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              >
                <option value="all">All Dispositions</option>
                <option value="confirmed">Confirmed Planets Only</option>
                <option value="candidate">Kepler Candidates</option>
              </select>
            </div>

            {/* Filter 3: Planet Size Category */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">Planet Size Range</label>
              <select
                value={selectedSizeFilter}
                onChange={(e) => setSelectedSizeFilter(e.target.value as typeof selectedSizeFilter)}
                className="w-full px-3 py-2 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              >
                <option value="all">All Planet Sizes</option>
                <option value="terrestrial">Terrestrial (&lt; 1.25 R⊕)</option>
                <option value="super-earth">Super-Earth (1.25 – 2.0 R⊕)</option>
                <option value="sub-neptune">Sub-Neptune (2.0 – 4.0 R⊕)</option>
                <option value="gas-giant">Gas Giant (&gt; 4.0 R⊕)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#64748B] mb-1">Sort Catalog By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              >
                <option value="year-desc">Discovery Year (Newest)</option>
                <option value="radius-asc">Planet Radius (Smallest)</option>
                <option value="period-asc">Orbital Period (Shortest)</option>
                <option value="distance-asc">Distance (Closest to Earth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* COMPARISON WORKSPACE BANNER (Appears when 1+ planets selected for comparison) */}
        {compareList.length > 0 && (
          <section className="bg-linear-to-r from-[#0E1B38] to-[#12234B] border-2 border-[#38BDF8]/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 mb-1">
                  <Scale className="w-3.5 h-3.5" />
                  Comparative Astrophysics Workspace
                </div>
                <h3 className="text-xl font-bold text-white">
                  Comparing {compareList.length} Selected Exoplanet{compareList.length > 1 ? 's' : ''}
                </h3>
              </div>
              <button
                onClick={() => setCompareList([])}
                className="px-3 py-1.5 rounded-xl bg-[#050B1A]/80 hover:bg-[#050B1A] border border-[#1E293B] text-xs text-[#94A3B8] hover:text-white transition-colors"
              >
                Clear Comparison
              </button>
            </div>

            {/* Visual Planet Comparison */}
            <div className="p-4 bg-[#050B1A]/80 rounded-xl border border-[#1E293B]">
              <AstronomicalComparisonVisual
                items={compareList.map(p => ({
                  id: p.planetName,
                  name: p.planetName,
                  target: p,
                  type: 'exoplanet',
                  label: p.planetName,
                  sublabel: p.radiusEarthRadii !== null ? `${p.radiusEarthRadii} R⊕` : undefined,
                  scaleValue: p.radiusEarthRadii || 1.0,
                }))}
                baselineName="Earth (1.0 R⊕)"
              />
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#94A3B8] bg-[#050B1A]/60">
                    <th className="py-3 px-4 font-semibold">Measurement</th>
                    {compareList.map(planet => (
                      <th key={planet.planetName} className="py-3 px-4 font-bold text-white min-w-40">
                        <div className="flex items-center justify-between">
                          <span>{planet.planetName}</span>
                          <button
                            onClick={() => toggleCompare(planet)}
                            className="text-[#64748B] hover:text-red-400 p-0.5"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/70 font-mono tabular-nums">
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Host Star</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-[#F8FAFC]">{p.hostStar}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Discovery Method</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-[#38BDF8]">{p.discoveryMethod} ({p.discoveryYear})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Radius (Earth Radii)</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-emerald-400">
                        {p.radiusEarthRadii !== null ? `${p.radiusEarthRadii} R⊕` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Mass (Earth Masses)</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-emerald-400">
                        {p.massEarthMasses !== null ? `${p.massEarthMasses} M⊕` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Mass (Jupiter Masses)</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-white">
                        {p.massJupiterMasses !== null && p.massJupiterMasses !== undefined ? `${p.massJupiterMasses} M_J` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Orbital Period</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-white">
                        {p.orbitalPeriodDays !== null ? `${p.orbitalPeriodDays} days` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Semi-Major Axis</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-amber-300">
                        {p.semiMajorAxisAU !== null && p.semiMajorAxisAU !== undefined ? `${p.semiMajorAxisAU} AU` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Orbital Eccentricity</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-white">
                        {p.eccentricity !== null && p.eccentricity !== undefined ? p.eccentricity : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Stellar Temperature</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-white">
                        {p.stellarEffectiveTempK !== null ? `${p.stellarEffectiveTempK} K` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Distance from Earth</td>
                    {compareList.map(p => (
                      <td key={p.planetName} className="py-2.5 px-4 text-white">
                        {p.distanceLightYears !== null ? `${p.distanceLightYears} ly` : <span className="text-[#64748B] font-sans">Not available</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RESULTS METADATA BAR */}
        <div className="flex items-center justify-between text-xs text-[#64748B] border-b border-[#1E293B] pb-3">
          <div>
            Showing <span className="text-white font-semibold">{filteredPlanets.length}</span> exoplanet records
            {searchQuery && <span> matching "<span className="text-[#38BDF8]">{searchQuery}</span>"</span>}
          </div>
          <div className="hidden sm:block">
            Select "Compare" on up to 3 planets for side-by-side analysis
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RotateCcw className="w-8 h-8 text-[#38BDF8] animate-spin mb-4" />
            <p className="text-sm text-[#94A3B8]">Querying NASA Exoplanet Archive Table Access Protocol (TAP)...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="my-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-start gap-4 text-red-300">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-400" />
            <div>
              <h4 className="font-semibold text-sm">Failed to connect to Exoplanet Archive</h4>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
              <button
                onClick={loadExoplanetData}
                className="mt-3 px-3 py-1.5 bg-red-800/40 hover:bg-red-800/60 text-xs rounded-lg font-medium transition-colors"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredPlanets.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-[#0B1630]/40 rounded-2xl border border-[#1E293B] p-8">
            <Telescope className="w-12 h-12 text-[#64748B] mb-4" />
            <h3 className="text-lg font-bold text-white">No exoplanets found matching filters</h3>
            <p className="text-xs text-[#94A3B8] max-w-md mt-2">
              Try adjusting your size range or discovery method keywords to view more planets.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold rounded-xl border border-[#38BDF8]/40 transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* 3. EXOPLANET CARDS CATALOG GRID */}
        {!loading && !error && filteredPlanets.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlanets.map(planet => {
              const isSelectedForCompare = compareList.some(p => p.planetName === planet.planetName);
              const isCandidate = planet.disposition === 'Candidate';

              return (
                <div
                  key={planet.planetName}
                  className="card-interactive group flex flex-col justify-between bg-[#0B1630] hover:bg-[#0E1B38] border border-[#1E293B] hover:border-[#8B5CF6]/40 rounded-2xl p-5 shadow-lg transition-all"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">
                        {planet.discoveryMethod}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isCandidate
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {planet.dataStatus || (isCandidate ? 'Candidate' : 'Confirmed')}
                      </span>
                    </div>

                    {/* Planet Visual Representation */}
                    <div className="mb-3 rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A] relative shadow-inner">
                      <AstronomicalImage
                        target={planet}
                        targetType="exoplanet"
                        aspectRatio="16/9"
                        showBadge={true}
                        className="w-full h-36 object-cover"
                      />
                    </div>

                    {/* Planet Name & Star */}
                    <h3 className="text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      {planet.planetName}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Host Star: <span className="text-[#E2E8F0] font-medium">{planet.hostStar}</span>
                      {planet.stellarSpectralType && (
                        <span className="text-violet-300 font-mono text-[10px] ml-1">({planet.stellarSpectralType})</span>
                      )} • {planet.discoveryYear}
                    </p>

                    {/* Properties Matrix */}
                    <div className="mt-4 pt-3 border-t border-[#1E293B] grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Radius</span>
                        <span className="font-semibold text-white font-mono tabular-nums">
                          {planet.radiusEarthRadii !== null ? `${planet.radiusEarthRadii} R⊕` : '—'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Mass</span>
                        <span className="font-semibold text-white font-mono tabular-nums">
                          {planet.massEarthMasses !== null ? `${planet.massEarthMasses} M⊕` : '—'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Period</span>
                        <span className="font-semibold text-white font-mono tabular-nums">
                          {planet.orbitalPeriodDays !== null ? `${planet.orbitalPeriodDays} d` : '—'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Eq. Temp</span>
                        <span className="font-semibold text-amber-300 font-mono tabular-nums">
                          {planet.equilibriumTempK !== null ? `${planet.equilibriumTempK} K` : '—'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Semi-Major</span>
                        <span className="font-semibold text-white font-mono tabular-nums">
                          {planet.semiMajorAxisAU !== null ? `${planet.semiMajorAxisAU} AU` : '—'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#050B1A]/60 border border-[#1E293B]/60">
                        <span className="text-[10px] text-[#64748B] block">Distance</span>
                        <span className="font-semibold text-white font-mono tabular-nums">
                          {planet.distanceLightYears !== null ? `${planet.distanceLightYears} ly` : '—'}
                        </span>
                      </div>
                    </div>

                    {planet.discoveryReference && (
                      <div className="mt-2.5 px-2.5 py-1 rounded bg-[#050B1A]/50 border border-[#1E293B]/50 text-[10px] text-[#64748B] flex items-center justify-between gap-1">
                        <span className="truncate font-mono">Ref: {planet.discoveryReference}</span>
                        {planet.discoveryReferenceUrl && (
                          <a
                            href={planet.discoveryReferenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 shrink-0"
                            title="Open ADS publication reference"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3 text-xs">
                    <button
                      onClick={() => setActivePlanetModal(planet)}
                      className="text-[#38BDF8] hover:text-[#7DD3FC] font-semibold inline-flex items-center gap-1"
                    >
                      Inspect Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[#94A3B8] hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={isSelectedForCompare}
                        onChange={() => toggleCompare(planet)}
                        className="rounded border-[#1E293B] text-[#38BDF8] focus:ring-0 focus:ring-offset-0 bg-[#050B1A]"
                      />
                      <span>Compare</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CATALOG PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-lg">
            <div className="text-xs text-[#94A3B8]">
              Showing <span className="text-white font-mono font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-white font-mono font-semibold">{Math.min(currentPage * pageSize, totalFiltered)}</span> of{' '}
              <span className="text-white font-mono font-semibold">{totalFiltered}</span> matching planets
              <span className="text-[#64748B] ml-2">(NASA Archive Total: 6,451+ confirmed exoplanets)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs font-mono font-semibold text-sky-400">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

        {/* NASA IMAGE & VIDEO LIBRARY EXPLORER VIEW */}
        {activeMainTab === 'imagery' && (
          <div className="space-y-6">
            {/* Search and Category Filter Card */}
            <div className="bg-[#0B1630] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    searchNasaImages(imageQuery, 1, imageCategory);
                  }}
                  className="relative flex-1"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={imageQuery}
                    onChange={(e) => setImageQuery(e.target.value)}
                    placeholder="Search NASA Image Library (e.g. TRAPPIST-1, Kepler-452, Beta Pictoris)..."
                    className="w-full pl-11 pr-24 py-2.5 bg-[#050B1A] border border-[#1E293B] rounded-xl text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Preset Fast Queries */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {['TRAPPIST-1', 'Beta Pictoris', 'HR 8799', 'Kepler-452', 'Webb Exoplanet'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setImageQuery(preset);
                        searchNasaImages(preset, 1, imageCategory);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-[#1E293B] text-[11px] text-[#94A3B8] hover:text-white hover:border-violet-500/50 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classification Category Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E293B]">
                <span className="text-[11px] font-mono uppercase text-[#64748B] mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Asset Class:
                </span>
                {[
                  { id: 'all', label: 'All Classified Assets' },
                  { id: 'observation', label: 'Direct Observations' },
                  { id: 'processed-observation', label: 'Processed Spectra / Imagery' },
                  { id: 'artist-concept', label: 'Artist Concepts' },
                  { id: 'simulation', label: 'Simulations / Models' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setImageCategory(cat.id);
                      searchNasaImages(imageQuery, 1, cat.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      imageCategory === cat.id
                        ? 'bg-violet-600 text-white font-semibold'
                        : 'bg-[#050B1A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Status Banner */}
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <div>
                Showing results for <span className="text-white font-semibold font-mono">"{imageQuery}"</span> in NASA Image and Video Library
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authentic images-api.nasa.gov Integration</span>
              </div>
            </div>

            {/* Loading */}
            {imageLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <RotateCcw className="w-8 h-8 text-violet-400 animate-spin mb-4" />
                <p className="text-sm text-[#94A3B8]">Retrieving media manifests from NASA Image and Video Library...</p>
              </div>
            )}

            {/* Error */}
            {!imageLoading && imageError && (
              <div className="p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-300 text-xs">
                {imageError}
              </div>
            )}

            {/* Image Cards Grid */}
            {!imageLoading && !imageError && imageResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageResults.map(img => {
                  const classificationLabels: Record<string, { label: string; badgeClass: string }> = {
                    'observation': {
                      label: 'Direct Observation / Photography',
                      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    },
                    'processed-observation': {
                      label: 'Processed Telescope Data',
                      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    },
                    'artist-concept': {
                      label: 'Artist Concept / Illustration',
                      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    },
                    'simulation': {
                      label: 'Computational Simulation',
                      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    },
                    'spacecraft-hardware': {
                      label: 'Mission Hardware',
                      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }
                  };

                  const classInfo = classificationLabels[img.assetClassification] || {
                    label: 'NASA Astronomical Asset',
                    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  };

                  return (
                    <div
                      key={img.id}
                      className="bg-[#0B1630] border border-[#1E293B] hover:border-violet-500/40 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group"
                    >
                      <div>
                        {/* Image Frame */}
                        <div className="relative aspect-video bg-[#050B1A] overflow-hidden">
                          <img
                            src={img.thumbUrl || img.imageUrl}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md ${classInfo.badgeClass}`}>
                              {classInfo.label}
                            </span>
                            {img.center && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                                {img.center}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                            {img.title}
                          </h4>
                          <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                            {img.caption || img.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 pt-0 border-t border-[#1E293B]/60 mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span className="font-mono">ID: {img.nasaId}</span>
                        <a
                          href={img.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1"
                        >
                          NASA Archive
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NASA Image Search Pagination */}
            {imageResults.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-[#0B1630] border border-[#1E293B]">
                <span className="text-xs text-[#94A3B8]">
                  Page <strong className="text-white font-mono">{imagePage}</strong> of NASA Image and Video Library manifests
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prev = Math.max(1, imagePage - 1);
                      setImagePage(prev);
                      searchNasaImages(imageQuery, prev, imageCategory);
                    }}
                    disabled={imagePage === 1}
                    className="px-3 py-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const next = imagePage + 1;
                      setImagePage(next);
                      searchNasaImages(imageQuery, next, imageCategory);
                    }}
                    disabled={imageResults.length < 12}
                    className="px-3 py-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. HABITABILITY EXPLORER SECTION */}
        <section className="bg-[#0B1630] border border-[#1E293B] rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 text-emerald-400 flex items-center justify-center shrink-0 border border-[#10B981]/20">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Astrophysical Assessment
              </span>
              <h2 className="text-2xl font-bold text-white">
                The Circumstellar Habitable Zone & Life Factors
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#A7B4CC] leading-relaxed max-w-4xl">
            The circumstellar habitable zone (often called the "Goldilocks Zone") is the region around a star where 
            stellar irradiation allows surface liquid water under sufficient atmospheric pressure. 
            However, <strong>orbital distance alone does not make a world habitable.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Flame className="w-4 h-4 shrink-0" />
                Inner Boundary (Runaway Greenhouse)
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                Too close to the host star, oceans evaporate into steam. Water vapor increases atmospheric greenhouse trapping, driving runaway thermal heating (like Venus).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Droplets className="w-4 h-4 shrink-0" />
                Temperate Liquid Water Zone
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                Stellar flux sustains 0°C to 100°C water if protected by an Earth-like atmosphere, global magnetic field, and moderate volcanic volatile cycling.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Snowflake className="w-4 h-4 shrink-0" />
                Outer Boundary (Maximum Greenhouse)
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                Beyond this limit, even high carbon dioxide greenhouse atmospheres freeze into dry ice, creating global glaciations (Snowball state).
              </p>
            </div>
          </div>

          {/* Scientific Caveats Disclaimer */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-[#94A3B8] space-y-1">
            <strong className="text-white block font-medium">Non-Fabrication Policy on Life:</strong>
            <p>
              COSMIC FRONTIER does not label an exoplanet as "inhabited" or "habitable" simply because its orbit lies within an estimated habitable zone. 
              Atmospheric retention, stellar flares, tidal locking, UV radiation, and planetary magnetic dynamos all play decisive roles in planetary habitability.
            </p>
          </div>
        </section>

        {/* 5. DETECTION METHODS EDUCATIONAL SECTION */}
        <section className="bg-[#0B1630] border border-[#1E293B] rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 text-[#C084FC] flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#C084FC] font-bold">
                Astronomical Observational Techniques
              </span>
              <h2 className="text-2xl font-bold text-white">
                How Astronomers Discover Alien Worlds
              </h2>
            </div>
          </div>

          {/* Tabs for Methods */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1E293B]">
            {[
              { id: 'transit', label: 'Transit Method', icon: Radio },
              { id: 'radial-velocity', label: 'Radial Velocity (Wobble)', icon: Activity },
              { id: 'direct-imaging', label: 'Direct Imaging', icon: Camera },
              { id: 'microlensing', label: 'Gravitational Microlensing', icon: Compass },
              { id: 'astrometry', label: 'Astrometry', icon: Orbit }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeDiscoveryMethodTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDiscoveryMethodTab(tab.id as typeof activeDiscoveryMethodTab)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-md shadow-[#38BDF8]/20'
                      : 'bg-[#050B1A] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Method Content Panes */}
          <div className="p-6 rounded-2xl bg-[#050B1A] border border-[#1E293B] text-xs sm:text-sm space-y-4">
            {activeDiscoveryMethodTab === 'transit' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#38BDF8]" />
                  Transit Photometry (Kepler, TESS, CHEOPS)
                </h3>
                <p className="text-[#A7B4CC] leading-relaxed">
                  When an exoplanet crosses directly between its host star and the observer, it blocks a tiny fraction of the star’s light (typically 0.01% to 1%). 
                  By measuring the recurring drop in stellar brightness (the "light curve"), astronomers calculate the planet's radius and orbital period.
                </p>
                <div className="p-3 bg-[#0B1630] rounded-xl border border-[#1E293B] text-xs text-[#94A3B8]">
                  <strong className="text-white block mb-1">What we learn:</strong>
                  <span>Planet Radius ($R_p$), Orbital Period, and atmospheric absorption during transit (transmission spectroscopy).</span>
                </div>
              </div>
            )}

            {activeDiscoveryMethodTab === 'radial-velocity' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                  Radial Velocity (Doppler Spectroscopy)
                </h3>
                <p className="text-[#A7B4CC] leading-relaxed">
                  As an orbiting planet tugs gravitationally on its host star, the star wobbles slightly in a tiny reflex orbit. 
                  When the star moves toward Earth, its spectral lines shift toward the blue; when moving away, they shift toward the red. 
                  High-precision spectrographs (such as HARPS and ESPRESSO) detect stellar velocity variations down to a few centimeters per second!
                </p>
                <div className="p-3 bg-[#0B1630] rounded-xl border border-[#1E293B] text-xs text-[#94A3B8]">
                  <strong className="text-white block mb-1">What we learn:</strong>
                  <span>Minimum Planet Mass ($M \sin i$), Orbital Period, and Eccentricity. Combined with transit radius, yields true planet bulk density!</span>
                </div>
              </div>
            )}

            {activeDiscoveryMethodTab === 'direct-imaging' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Direct Optical & Infrared Imaging (JWST, VLT SPHERE)
                </h3>
                <p className="text-[#A7B4CC] leading-relaxed">
                  Host stars outshine their orbiting planets by factors of a million to a billion. 
                  Direct imaging uses extreme adaptive optics and coronagraph masks to physically block the blinding stellar glare, 
                  allowing astronomers to photograph photons emitted directly from young, hot gas giants situated far from their stars.
                </p>
                <div className="p-3 bg-[#0B1630] rounded-xl border border-[#1E293B] text-xs text-[#94A3B8]">
                  <strong className="text-white block mb-1">What we learn:</strong>
                  <span>Direct planetary thermal spectra, atmospheric composition (clouds, methane, water vapor), and orbital architecture at wide separations.</span>
                </div>
              </div>
            )}

            {activeDiscoveryMethodTab === 'microlensing' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Gravitational Microlensing (Einstein's General Relativity)
                </h3>
                <p className="text-[#A7B4CC] leading-relaxed">
                  When a foreground planetary system passes almost perfectly in front of a distant background star, 
                  the foreground gravity acts as a gravitational lens, bending and magnifying the background starlight. 
                  The planet creates a brief secondary spike in magnification lasting hours to days.
                </p>
                <div className="p-3 bg-[#0B1630] rounded-xl border border-[#1E293B] text-xs text-[#94A3B8]">
                  <strong className="text-white block mb-1">What we learn:</strong>
                  <span>Capable of detecting small planets situated far from their stars, including free-floating rogue planets drifting without a host star.</span>
                </div>
              </div>
            )}

            {activeDiscoveryMethodTab === 'astrometry' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-cyan-400" />
                  Astrometry (ESA Gaia Space Observatory)
                </h3>
                <p className="text-[#A7B4CC] leading-relaxed">
                  Astrometry measures the precise microscopic position of a star on the plane of the sky over many years. 
                  An orbiting planet causes the star’s 2D sky trajectory to describe a tiny ellipse. 
                  ESA Gaia is mapping over one billion stars with micro-arcsecond astrometric precision.
                </p>
                <div className="p-3 bg-[#0B1630] rounded-xl border border-[#1E293B] text-xs text-[#94A3B8]">
                  <strong className="text-white block mb-1">What we learn:</strong>
                  <span>True planetary mass (resolving the $\sin i$ inclination ambiguity of radial velocity) and true 3D orbital orientation.</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 6. DETAILED PLANET MODAL */}
      {activePlanetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0B1630] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#1E293B] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] font-semibold">
                    {activePlanetModal.discoveryMethod}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    activePlanetModal.disposition === 'Candidate'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {activePlanetModal.dataStatus || 'Confirmed Exoplanet'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{activePlanetModal.planetName}</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Host Star: <span className="text-white font-medium">{activePlanetModal.hostStar}</span> • Discovered in {activePlanetModal.discoveryYear}
                </p>
              </div>
              <button
                onClick={() => setActivePlanetModal(null)}
                className="text-[#64748B] hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Astronomical Visual & Gallery */}
              <div className="space-y-2">
                <AstronomicalImageGallery
                  target={activePlanetModal}
                  targetType="exoplanet"
                />
              </div>

              {/* Habitable Zone Estimator Banner */}
              {(() => {
                const hz = getHabitableZoneEstimate(activePlanetModal.stellarEffectiveTempK, activePlanetModal.semiMajorAxisAU || null);
                if (!hz) return null;
                return (
                  <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-[#38BDF8] font-semibold">
                        Estimated Habitable Zone Model
                      </span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        hz.zone === 'habitable'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : hz.zone === 'too-hot'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {hz.zone === 'habitable' ? 'Within Circumstellar Goldilocks Zone' : hz.zone === 'too-hot' ? 'Too Hot (Inside Inner Edge)' : 'Too Cold (Outside Outer Edge)'}
                      </span>
                    </div>
                    <p className="text-[#94A3B8]">
                      Calculated HZ boundaries: <span className="text-white font-mono">{hz.innerAU} AU</span> (runaway greenhouse) to <span className="text-white font-mono">{hz.outerAU} AU</span> (maximum greenhouse).
                      Planet semi-major axis: <span className="text-amber-300 font-mono font-semibold">{activePlanetModal.semiMajorAxisAU} AU</span>.
                    </p>
                  </div>
                );
              })()}

              {/* Physical Parameters Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                  Verified Physical & Stellar Measurements
                </h4>
                <div className="bg-[#050B1A] border border-[#1E293B] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-[#64748B] bg-[#0E1B38]">
                        <th className="py-2.5 px-4 font-medium">Measurement</th>
                        <th className="py-2.5 px-4 font-medium">Value</th>
                        <th className="py-2.5 px-4 font-medium">Standard Scientific Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B] font-mono tabular-nums">
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Planet Radius</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.radiusEarthRadii !== null ? activePlanetModal.radiusEarthRadii : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Earth radii (1 R⊕ = 6,371 km)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Planet Mass</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.massEarthMasses !== null ? activePlanetModal.massEarthMasses : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Earth masses (1 M⊕ = 5.972 × 10²⁴ kg)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Orbital Period</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.orbitalPeriodDays !== null ? activePlanetModal.orbitalPeriodDays : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Earth sidereal days</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Semi-Major Axis</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.semiMajorAxisAU !== null && activePlanetModal.semiMajorAxisAU !== undefined ? activePlanetModal.semiMajorAxisAU : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Astronomical Units (1 AU = 149.6M km)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Orbital Eccentricity</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.eccentricity !== null && activePlanetModal.eccentricity !== undefined ? activePlanetModal.eccentricity : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Dimensionless (0 = circle, &gt;0 = ellipse)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Equilibrium Temperature</td>
                        <td className="py-2.5 px-4 text-amber-300 font-semibold font-mono">
                          {activePlanetModal.equilibriumTempK != null ? `${activePlanetModal.equilibriumTempK} K (${(activePlanetModal.equilibriumTempK - 273.15).toFixed(1)} °C)` : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">T_eq (Kelvin / Celsius)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Stellar Temperature</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.stellarEffectiveTempK !== null ? `${activePlanetModal.stellarEffectiveTempK} K` : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">T_eff (Effective Stellar Surface Temp)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Stellar Radius</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.stellarRadiusSolar !== null && activePlanetModal.stellarRadiusSolar !== undefined ? `${activePlanetModal.stellarRadiusSolar} R☉` : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Solar Radii (1 R☉ = 696,340 km)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Stellar Mass</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.stellarMassSolar !== null && activePlanetModal.stellarMassSolar !== undefined ? `${activePlanetModal.stellarMassSolar} M☉` : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Solar Masses (1 M☉ = 1.989 × 10³⁰ kg)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Stellar Spectral Type</td>
                        <td className="py-2.5 px-4 text-violet-300 font-semibold font-mono">
                          {activePlanetModal.stellarSpectralType || <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Morgan-Keenan (MK) Spectral Classification</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Distance from Earth</td>
                        <td className="py-2.5 px-4 text-white font-semibold">
                          {activePlanetModal.distanceLightYears !== null ? `${activePlanetModal.distanceLightYears} ly` : <span className="text-[#64748B] font-sans">Unavailable</span>}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] font-sans">Light-years ({activePlanetModal.distanceParsecs} parsecs)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-[#94A3B8] font-sans">Discovery Publication</td>
                        <td className="py-2.5 px-4 text-sky-400 font-semibold" colSpan={2}>
                          {activePlanetModal.discoveryReference ? (
                            activePlanetModal.discoveryReferenceUrl ? (
                              <a
                                href={activePlanetModal.discoveryReferenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 hover:underline"
                              >
                                <span>{activePlanetModal.discoveryReference}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span>{activePlanetModal.discoveryReference}</span>
                            )
                          ) : (
                            <span className="text-[#64748B] font-sans">Official Archive Announcement</span>
                          )}
                          {activePlanetModal.discoveryPublicationDate && (
                            <span className="text-[#64748B] ml-2 font-normal font-sans">({activePlanetModal.discoveryPublicationDate})</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Provenance Box */}
              <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs">
                <div className="flex items-center gap-2 text-[#38BDF8] font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  NASA Exoplanet Archive Provenance
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
                  Record retrieved via Caltech/IPAC Table Access Protocol (TAP) from the Planetary Systems Composite Parameters (`pscomppars`) catalog. All missing or unmeasured parameters are preserved strictly as null/unavailable.
                </p>
                {activePlanetModal.sourceUrl && (
                  <a
                    href={activePlanetModal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[#38BDF8] hover:text-[#7DD3FC] font-semibold text-xs"
                  >
                    View official NASA Exoplanet Archive record
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-[#1E293B] bg-[#081026] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setActivePlanetModal(null);
                  onNavigate('ai-guide');
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#8B5CF6]/10 text-[#C084FC] border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Guide About {activePlanetModal.planetName}
              </button>
              <button
                onClick={() => setActivePlanetModal(null)}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold rounded-xl transition-colors ml-auto"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
