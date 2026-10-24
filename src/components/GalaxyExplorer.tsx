import { useState, useEffect, useMemo, type FC } from 'react';
import type { GalaxyObject, GalaxyCategory, AppPage } from '../types';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { AstronomicalBadge } from './astronomy-images/AstronomicalBadge';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Grid, 
  List, 
  RotateCcw, 
  X, 
  ArrowUpDown, 
  BookOpen, 
  Disc, 
  Eye, 
  Telescope, 
  Activity, 
  ShieldAlert, 
  Loader2,
  Check,
  Plus,
  Scale,
  Sparkles,
  RefreshCw,
  Compass,
  Radio,
  Layers,
  Info,
  Calendar,
  Database,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface GalaxyExplorerProps {
  onNavigate?: (page: AppPage) => void;
}

export const GalaxyExplorer: FC<GalaxyExplorerProps> = ({ onNavigate }) => {
  // Catalog Data State
  const [galaxies, setGalaxies] = useState<GalaxyObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GalaxyCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'redshift' | 'distance' | 'magnitude' | 'diameter'>('distance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Live NED Lookup State
  const [liveQuery, setLiveQuery] = useState<string>('');
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Object for Details Modal/Drawer
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyObject | null>(null);

  // Comparison Workspace (Up to 3 galaxies)
  const [compareList, setCompareList] = useState<GalaxyObject[]>([]);
  const [showCompareWorkspace, setShowCompareWorkspace] = useState<boolean>(false);

  // Active Tab in Details Panel
  const [activeDetailsTab, setActiveDetailsTab] = useState<'overview' | 'multi-wavelength' | 'spectroscopy' | 'evidence'>('overview');
  const [selectedWavelengthIndex, setSelectedWavelengthIndex] = useState<number>(0);

  // Reset wavelength index when selected galaxy changes
  useEffect(() => {
    setSelectedWavelengthIndex(0);
  }, [selectedGalaxy?.id]);

  // Fetch Galaxies from Backend
  const fetchGalaxies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data/galaxies');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.records)) {
        setGalaxies(data.records);
        // Pre-select Andromeda as default if none selected
        if (!selectedGalaxy && data.records.length > 0) {
          setSelectedGalaxy(data.records[0]);
        }
      } else {
        throw new Error('Invalid catalog format');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      console.warn('Failed to fetch galaxy catalog:', msg);
      setError(`Unable to connect to extragalactic data service. (${msg})`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalaxies();
  }, []);

  // Handle Live NASA/IPAC NED Object Lookup
  const handleLiveNedLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveQuery.trim()) return;

    setIsLookingUp(true);
    setLookupMessage(null);

    try {
      const res = await fetch(`/api/data/galaxies?lookup=${encodeURIComponent(liveQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.record) {
        const newRecord: GalaxyObject = data.record;
        // Prepend to catalog if not already present
        setGalaxies(prev => {
          const exists = prev.some(g => g.id === newRecord.id || g.name.toLowerCase() === newRecord.name.toLowerCase());
          return exists ? prev : [newRecord, ...prev];
        });
        setSelectedGalaxy(newRecord);
        setLookupMessage({
          type: 'success',
          text: `Found "${newRecord.name}" live in NASA/IPAC Extragalactic Database (z = ${newRecord.redshift}).`
        });
        setLiveQuery('');
      } else {
        setLookupMessage({
          type: 'error',
          text: `Object "${liveQuery}" not found in NASA/IPAC NED. Verify name or catalog ID.`
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      setLookupMessage({
        type: 'error',
        text: `Live NED query failed (${msg}). Please try another name.`
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Filter & Sort Galaxies
  const filteredGalaxies = useMemo(() => {
    let result = [...galaxies];

    if (selectedCategory !== 'all') {
      result = result.filter(g => g.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.catalogIdentifier.toLowerCase().includes(q) ||
        g.constellation.toLowerCase().includes(q) ||
        g.morphologicalType.toLowerCase().includes(q) ||
        (g.alternateNames && g.alternateNames.some(a => a.toLowerCase().includes(q))) ||
        (g.catalogs && Object.values(g.catalogs).some(v => typeof v === 'string' && v.toLowerCase().includes(q))) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return sortOrder === 'desc' 
          ? (valB as string).localeCompare(valA as string)
          : (valA as string).localeCompare(valB as string);
      } else if (sortBy === 'redshift') {
        valA = a.redshift ?? 0;
        valB = b.redshift ?? 0;
      } else if (sortBy === 'distance') {
        valA = a.distanceMly ?? 999999;
        valB = b.distanceMly ?? 999999;
      } else if (sortBy === 'magnitude') {
        valA = a.apparentMagnitude ?? 999;
        valB = b.apparentMagnitude ?? 999;
      } else if (sortBy === 'diameter') {
        valA = a.estimatedDiameterKpc ?? 0;
        valB = b.estimatedDiameterKpc ?? 0;
      }

      return sortOrder === 'desc' 
        ? ((valB as number) - (valA as number))
        : ((valA as number) - (valB as number));
    });

    return result;
  }, [galaxies, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Comparison Handlers
  const toggleCompare = (galaxy: GalaxyObject) => {
    if (compareList.some(g => g.id === galaxy.id)) {
      setCompareList(prev => prev.filter(g => g.id !== galaxy.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 galaxies at a time. Please remove one to add another.');
        return;
      }
      setCompareList(prev => [...prev, galaxy]);
    }
  };

  const clearComparison = () => {
    setCompareList([]);
    setShowCompareWorkspace(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('distance');
    setSortOrder('asc');
  };

  // Category Configuration
  const categories: { id: GalaxyCategory | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Extragalactic', count: galaxies.length },
    { id: 'spiral', label: 'Spiral Galaxies', count: galaxies.filter(g => g.category === 'spiral').length },
    { id: 'elliptical', label: 'Elliptical Galaxies', count: galaxies.filter(g => g.category === 'elliptical').length },
    { id: 'irregular', label: 'Irregular & Mergers', count: galaxies.filter(g => g.category === 'irregular').length },
    { id: 'active-agn', label: 'Active Galaxies & Quasars', count: galaxies.filter(g => g.category === 'active-agn').length },
    { id: 'cluster', label: 'Galaxy Clusters', count: galaxies.filter(g => g.category === 'cluster').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="space-y-4 pb-6 border-b border-[#1E293B]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <Disc className="w-3.5 h-3.5" />
              <span>NASA/IPAC Extragalactic Database & CDS SIMBAD</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              Galaxy Explorer
            </h1>
            <p className="text-base sm:text-lg text-[#F5C451] font-medium mt-1">
              Search, inspect, and compare 24+ deep-sky galaxies, active nuclei, and cosmological clusters.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompareWorkspace(prev => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  showCompareWorkspace
                    ? 'bg-[#F5C451] text-[#050B1A]'
                    : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Compare ({compareList.length}/3)</span>
              </button>
            )}

            <button
              onClick={fetchGalaxies}
              className="p-2.5 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] text-[#A7B4CC] hover:text-[#F8FAFC] transition-colors"
              title="Refresh catalog data"
              aria-label="Refresh catalog data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#38BDF8]' : ''}`} />
            </button>
          </div>
        </div>

        <p className="text-sm text-[#A7B4CC] leading-relaxed max-w-4xl">
          Galaxies are colossal gravitationally bound islands containing millions to trillions of stars, interstellar dust, and dark matter halos. Explore verified morphological classifications, spectroscopic redshifts, and multi-rung cosmic distance estimates grounded in authoritative NASA and CDS catalogs.
        </p>
      </div>

      {/* 2. SEARCH & CONTROLS TOOLBAR */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by galaxy name, Messier/NGC catalog ID, constellation, or morphology (e.g., M31, Sombrero, E3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1630] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder-[#A7B4CC]/60 focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B4CC] hover:text-[#F8FAFC]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live NASA/IPAC NED Query Form */}
          <form onSubmit={handleLiveNedLookup} className="flex gap-2">
            <div className="relative">
              <Radio className="w-3.5 h-3.5 text-[#38BDF8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Live NED query (e.g. M87)..."
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                className="pl-8 pr-3 py-2.5 rounded-xl bg-[#0B1630] border border-[#38BDF8]/40 text-xs text-[#F8FAFC] placeholder-[#A7B4CC]/60 focus:outline-none focus:border-[#38BDF8] w-48 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLookingUp || !liveQuery.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#050B1A] disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Live NED</span>
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'redshift' | 'distance' | 'magnitude' | 'diameter')}
                className="appearance-none bg-[#0B1630] text-[#F8FAFC] text-xs font-mono rounded-xl pl-3 pr-8 py-2.5 border border-[#1E293B] focus:border-[#8B5CF6] focus:outline-none"
              >
                <option value="distance">Sort by Distance</option>
                <option value="redshift">Sort by Redshift (z)</option>
                <option value="magnitude">Sort by Apparent Mag</option>
                <option value="diameter">Sort by Diameter</option>
                <option value="name">Sort by Name</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#A7B4CC] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-xl bg-[#0B1630] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] text-xs font-mono transition-colors"
              title={sortOrder === 'asc' ? 'Ascending order' : 'Descending order'}
            >
              {sortOrder === 'asc' ? 'ASC' : 'DESC'}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-[#0B1630] border border-[#1E293B] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-[#8B5CF6] text-white' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-[#8B5CF6] text-white' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Lookup Status Message */}
        {lookupMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            lookupMessage.type === 'success'
              ? 'bg-[#38BDF8]/10 border-[#38BDF8]/40 text-[#38BDF8]'
              : 'bg-[#F5C451]/10 border-[#F5C451]/40 text-[#F5C451]'
          }`}>
            <span>{lookupMessage.text}</span>
            <button onClick={() => setLookupMessage(null)} className="text-current hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Morphological Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-[#A7B4CC] shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20'
                    : 'bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#8B5CF6]/50'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#050B1A] text-[#A7B4CC]'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}

          {(selectedCategory !== 'all' || searchQuery.trim()) && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#A7B4CC] hover:text-[#F8FAFC] flex items-center gap-1 ml-auto whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. COMPARISON WORKSPACE (If active) */}
      {showCompareWorkspace && compareList.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/40 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Extragalactic Comparison Workspace
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                {compareList.length} of 3 selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearComparison}
                className="px-3 py-1 rounded-lg text-xs text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-red-500/40"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowCompareWorkspace(false)}
                className="text-[#A7B4CC] hover:text-[#F8FAFC] p-1"
                aria-label="Close comparison view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareList.map(g => (
              <div key={g.id} className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3 relative group">
                <button
                  onClick={() => toggleCompare(g)}
                  className="absolute top-3 right-3 text-[#A7B4CC] hover:text-red-400 p-1"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8B5CF6] font-bold">
                    {g.category}
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC] truncate">
                    {g.name}
                  </h3>
                  <p className="text-[11px] font-mono text-[#A7B4CC] truncate">
                    {g.catalogIdentifier}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs font-mono tabular-nums pt-2 border-t border-[#1E293B]">
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Morphology:</span>
                    <span className="text-[#F8FAFC] font-semibold">{g.morphologicalType.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Redshift (z):</span>
                    <span className="text-[#38BDF8] font-bold">{g.redshift}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Velocity:</span>
                    <span className="text-[#F8FAFC]">{g.radialVelocityKmS.toLocaleString()} km/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A7B4CC]">Distance:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#F5C451] font-bold">{g.distanceMly ? `${g.distanceMly.toLocaleString()} Mly` : 'Uncertain'}</span>
                      {g.fieldStatus?.distance && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          g.fieldStatus.distance === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {g.fieldStatus.distance === 'measured' ? 'Measured' : 'Est.'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Distance (Mpc):</span>
                    <span className="text-[#F8FAFC]">{g.distanceMpc ? `${g.distanceMpc.toLocaleString()} Mpc` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Apparent Mag:</span>
                    <span className="text-[#F8FAFC]">{g.apparentMagnitude ?? 'Not cataloged'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A7B4CC]">Diameter:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#F8FAFC]">{g.estimatedDiameterLy ? `${g.estimatedDiameterLy.toLocaleString()} ly` : 'Not available'}</span>
                      {g.fieldStatus?.diameter && g.fieldStatus.diameter !== 'unmeasured' && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          g.fieldStatus.diameter === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {g.fieldStatus.diameter === 'measured' ? 'Measured' : 'Est.'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#A7B4CC] border-t border-[#1E293B]">
                  <span className="font-semibold text-[#8B5CF6] block mb-0.5">Measurement Method:</span>
                  <span className="line-clamp-2">{g.distanceMethod}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Metrics Bar Scales */}
          <div className="space-y-3 pt-4 border-t border-[#1E293B]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B4CC] font-mono">
              Relative Distance Comparison (Logarithmic Scale)
            </h4>
            <div className="space-y-2">
              {compareList.map(g => {
                const dist = g.distanceMly ?? 1;
                // Log scale: min 0.1 Mly, max 5000 Mly
                const logVal = Math.log10(Math.max(0.1, dist));
                const pct = Math.min(100, Math.max(5, (logVal / 3.7) * 100));
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#F8FAFC]">{g.name}</span>
                      <span className="text-[#F5C451]">{dist.toLocaleString()} Mly</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050B1A] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-linear-to-r from-[#8B5CF6] to-[#F5C451]" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT: CATALOG DISPLAY (GRID / TABLE) */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-[#0B1630] border border-[#1E293B] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#A7B4CC]">
            Querying NASA/IPAC Extragalactic Database & CDS SIMBAD...
          </p>
        </div>
      ) : error ? (
        <div className="p-12 rounded-2xl bg-[#0B1630] border border-[#F5C451]/30 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-[#F5C451] mx-auto" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">Catalog Service Warning</h3>
          <p className="text-xs text-[#A7B4CC] max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchGalaxies}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-[#7C3AED] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredGalaxies.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0B1630] border border-[#1E293B] text-center space-y-4">
          <Disc className="w-12 h-12 text-[#A7B4CC]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">No galaxies match your criteria</h3>
          <p className="text-xs text-[#A7B4CC] max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or using the Live NED lookup form above.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-[#7C3AED] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalaxies.map(galaxy => {
            const isSelected = selectedGalaxy?.id === galaxy.id;
            const isCompared = compareList.some(g => g.id === galaxy.id);

            return (
              <div
                key={galaxy.id}
                className={`card-interactive group rounded-2xl bg-[#0B1630] border transition-all overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#8B5CF6] shadow-xl shadow-[#8B5CF6]/10'
                    : 'border-[#1E293B] hover:border-[#8B5CF6]/50'
                }`}
              >
                {/* Thumbnail / Image Banner */}
                <div 
                  onClick={() => setSelectedGalaxy(galaxy)}
                  className="relative h-44 bg-[#050B1A] overflow-hidden cursor-pointer"
                >
                  <AstronomicalImage
                    target={galaxy}
                    targetType="galaxy"
                    aspectRatio="16/9"
                    showBadge={false}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges on image */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#050B1A]/85 backdrop-blur-md text-[10px] font-mono text-[#8B5CF6] border border-[#8B5CF6]/40 uppercase font-bold">
                      {galaxy.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-[#050B1A]/85 backdrop-blur-md text-[10px] font-mono text-[#F5C451] border border-[#1E293B]">
                      {galaxy.distanceMly ? `${galaxy.distanceMly.toLocaleString()} Mly` : 'z = ' + galaxy.redshift}
                    </span>
                    {galaxy.fieldStatus?.distance && (
                      <span className={`px-1.5 py-0.5 rounded backdrop-blur-md text-[9px] font-mono border ${
                        galaxy.fieldStatus.distance === 'measured'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}>
                        {galaxy.fieldStatus.distance === 'measured' ? 'Measured' : 'Est.'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#A7B4CC] truncate max-w-50">
                        {galaxy.catalogIdentifier.split('/')[0].trim()}
                      </span>
                      <span className="text-[10px] text-[#38BDF8] font-mono">
                        {galaxy.constellation}
                      </span>
                    </div>
                    <h3 
                      onClick={() => setSelectedGalaxy(galaxy)}
                      className="text-base font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors cursor-pointer"
                    >
                      {galaxy.name}
                    </h3>
                    <p className="text-xs text-[#A7B4CC] line-clamp-2 leading-relaxed">
                      {galaxy.description}
                    </p>
                  </div>

                  {/* Key Metrics Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B] text-xs font-mono tabular-nums">
                    <div className="p-2 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                      <span className="text-[10px] text-[#A7B4CC] block">Redshift:</span>
                      <span className="text-[#38BDF8] font-bold">{galaxy.redshift}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                      <span className="text-[10px] text-[#A7B4CC] block">Morphology:</span>
                      <span className="text-[#F8FAFC] truncate block">{galaxy.morphologicalType.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setSelectedGalaxy(galaxy)}
                      className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </button>

                    <button
                      onClick={() => toggleCompare(galaxy)}
                      className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
                        isCompared
                          ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                          : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                      }`}
                      title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead className="bg-[#050B1A] border-b border-[#1E293B] text-[#A7B4CC] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Object Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Morphology</th>
                <th className="py-3 px-4">Redshift (z)</th>
                <th className="py-3 px-4">Distance (Mly)</th>
                <th className="py-3 px-4">Apparent Mag</th>
                <th className="py-3 px-4">Diameter (ly)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#F8FAFC]">
              {filteredGalaxies.map(g => {
                const isCompared = compareList.some(c => c.id === g.id);
                return (
                  <tr 
                    key={g.id}
                    className="hover:bg-[#050B1A]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedGalaxy(g)}
                  >
                    <td className="py-3 px-4 font-semibold text-sm text-[#F8FAFC]">
                      {g.name}
                      <span className="block text-[10px] text-[#A7B4CC] font-normal">{g.catalogIdentifier.split('/')[0]}</span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] text-[#8B5CF6] font-bold">
                      {g.category}
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">
                      {g.morphologicalType.split(' ')[0]}
                    </td>
                    <td className="py-3 px-4 text-[#38BDF8] font-bold">
                      {g.redshift}
                    </td>
                    <td className="py-3 px-4 text-[#F5C451]">
                      {g.distanceMly ? g.distanceMly.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">
                      {g.apparentMagnitude ?? 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">
                      {g.estimatedDiameterLy ? g.estimatedDiameterLy.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleCompare(g)}
                        className={`px-2 py-1 rounded text-[11px] border ${
                          isCompared
                            ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                            : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                        }`}
                      >
                        {isCompared ? 'Compared' : '+ Compare'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. SELECTED GALAXY DETAILS INSPECTOR PANEL */}
      {selectedGalaxy && (
        <div className="rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/40 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#1E293B] pb-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-mono font-bold uppercase">
                  {selectedGalaxy.category}
                </span>
                <span className="text-xs font-mono text-[#38BDF8]">
                  Constellation: {selectedGalaxy.constellation}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050B1A] text-[#A7B4CC] border border-[#1E293B]">
                  {selectedGalaxy.dataStatus}
                </span>
                {selectedGalaxy.fieldStatus?.distance === 'measured' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Measured Standard Candle</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Info className="w-3 h-3" />
                    <span>Cosmological Redshift Estimate</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC]">
                {selectedGalaxy.name}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#A7B4CC]">
                Catalog Designation: {selectedGalaxy.catalogIdentifier}
              </p>
              {selectedGalaxy.alternateNames && selectedGalaxy.alternateNames.length > 0 && (
                <p className="text-xs font-mono text-[#A7B4CC]/70">
                  Aliases: {selectedGalaxy.alternateNames.join(' • ')}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleCompare(selectedGalaxy)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                  compareList.some(g => g.id === selectedGalaxy.id)
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{compareList.some(g => g.id === selectedGalaxy.id) ? 'In Comparison' : 'Add to Compare'}</span>
              </button>

              <a
                href={selectedGalaxy.sourceUrl || `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(selectedGalaxy.catalogs?.ned || selectedGalaxy.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono text-[#38BDF8] hover:text-[#F5C451] transition-colors"
              >
                <span>NASA/IPAC NED</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=${encodeURIComponent(selectedGalaxy.catalogs?.simbad || selectedGalaxy.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#8B5CF6] text-xs font-mono text-[#A78BFA] transition-colors"
              >
                <span>CDS SIMBAD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Details Content Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 text-xs font-mono overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveDetailsTab('overview')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeDetailsTab === 'overview' ? 'bg-[#8B5CF6] text-white font-bold shadow-sm' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Overview & Astrometry</span>
            </button>
            <button
              onClick={() => setActiveDetailsTab('multi-wavelength')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeDetailsTab === 'multi-wavelength' ? 'bg-[#8B5CF6] text-white font-bold shadow-sm' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Wavelength Observations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeDetailsTab === 'multi-wavelength' ? 'bg-white/20 text-white' : 'bg-[#050B1A] text-[#38BDF8]'}`}>
                {(selectedGalaxy.images && selectedGalaxy.images.length > 0) ? selectedGalaxy.images.length : 1}
              </span>
            </button>
            <button
              onClick={() => setActiveDetailsTab('spectroscopy')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeDetailsTab === 'spectroscopy' ? 'bg-[#8B5CF6] text-white font-bold shadow-sm' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Redshift & Distance Ladder</span>
            </button>
            <button
              onClick={() => setActiveDetailsTab('evidence')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeDetailsTab === 'evidence' ? 'bg-[#8B5CF6] text-white font-bold shadow-sm' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Scientific Evidence & Provenance</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & ASTROMETRY */}
          {activeDetailsTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Properties Table & Catalog IDs */}
              <div className="lg:col-span-7 space-y-4">
                {/* Catalog Identifiers Badges */}
                {selectedGalaxy.catalogs && (
                  <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
                    <span className="text-[10px] uppercase font-mono text-[#A7B4CC] font-bold block">
                      Cross-Catalog Designations (NED / SIMBAD / IAU):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                      {selectedGalaxy.catalogs.messier && (
                        <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                          Messier: {selectedGalaxy.catalogs.messier}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.ngc && (
                        <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                          NGC: {selectedGalaxy.catalogs.ngc}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.ugc && (
                        <span className="px-2 py-0.5 rounded-md bg-[#F5C451]/15 text-[#F5C451] border border-[#F5C451]/30">
                          UGC: {selectedGalaxy.catalogs.ugc}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.pgc && (
                        <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          PGC: {selectedGalaxy.catalogs.pgc}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.ic && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30">
                          IC: {selectedGalaxy.catalogs.ic}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.ned && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20">
                          NED: {selectedGalaxy.catalogs.ned}
                        </span>
                      )}
                      {selectedGalaxy.catalogs.simbad && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#A7B4CC] border border-white/20">
                          SIMBAD: {selectedGalaxy.catalogs.simbad}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Astrometry & Physical Properties Table */}
                <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3 font-mono tabular-nums text-xs">
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Morphological Type:</span>
                    <span className="text-[#F8FAFC] font-bold text-right">{selectedGalaxy.morphologicalType}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Right Ascension (J2000):</span>
                    <span className="text-[#F8FAFC]">{selectedGalaxy.rightAscension}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Declination (J2000):</span>
                    <span className="text-[#F8FAFC]">{selectedGalaxy.declination}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Apparent Magnitude (V):</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F8FAFC]">{selectedGalaxy.apparentMagnitude ?? 'Not cataloged'}</span>
                      {selectedGalaxy.fieldStatus?.apparentMagnitude && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          selectedGalaxy.fieldStatus.apparentMagnitude === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {selectedGalaxy.fieldStatus.apparentMagnitude === 'measured' ? 'Measured' : 'Unmeasured'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Angular Extent on Sky:</span>
                    <span className="text-[#F8FAFC]">{selectedGalaxy.angularSize}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Physical Diameter:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F8FAFC]">
                        {selectedGalaxy.estimatedDiameterLy 
                          ? `${selectedGalaxy.estimatedDiameterLy.toLocaleString()} ly (${selectedGalaxy.estimatedDiameterKpc} kpc)`
                          : 'Unmeasured'}
                      </span>
                      {selectedGalaxy.fieldStatus?.diameter && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          selectedGalaxy.fieldStatus.diameter === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : selectedGalaxy.fieldStatus.diameter === 'estimated'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {selectedGalaxy.fieldStatus.diameter === 'measured'
                            ? 'Measured'
                            : selectedGalaxy.fieldStatus.diameter === 'estimated'
                            ? 'Estimated'
                            : 'Unmeasured'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="text-[#A7B4CC]">Primary Distance:</span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[#F5C451] font-bold">
                        {selectedGalaxy.distanceMly ? `${selectedGalaxy.distanceMly.toLocaleString()} Mly (${selectedGalaxy.distanceMpc} Mpc)` : 'Uncertain'}
                      </span>
                      {selectedGalaxy.fieldStatus?.distance && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          selectedGalaxy.fieldStatus.distance === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {selectedGalaxy.fieldStatus.distance === 'measured' ? 'Measured' : 'Estimated (Hubble Flow)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A7B4CC]">Redshift (z):</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#38BDF8] font-bold">{selectedGalaxy.redshift}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                        Measured
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Scientific Significance */}
                <div className="space-y-3 text-xs leading-relaxed text-[#A7B4CC]">
                  <p>{selectedGalaxy.description}</p>
                  <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#8B5CF6]/30 text-[#F8FAFC]">
                    <span className="text-[10px] uppercase font-mono text-[#8B5CF6] font-bold block mb-1">
                      Scientific Significance:
                    </span>
                    <p>{selectedGalaxy.scientificSignificance}</p>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href={`https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(selectedGalaxy.catalogs?.ned || selectedGalaxy.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono text-[#38BDF8] transition-colors"
                  >
                    <span>View NED Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=${encodeURIComponent(selectedGalaxy.catalogs?.simbad || selectedGalaxy.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#8B5CF6] text-xs font-mono text-[#A78BFA] transition-colors"
                  >
                    <span>View SIMBAD Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {selectedGalaxy.image?.sourcePage && (
                    <a
                      href={selectedGalaxy.image.sourcePage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#F5C451] text-xs font-mono text-[#F5C451] transition-colors"
                    >
                      <span>NASA Image Archive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Preview & Quick Links */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-[#050B1A] border border-[#1E293B] p-4 overflow-hidden space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                    <AstronomicalImage
                      target={selectedGalaxy}
                      targetType="galaxy"
                      aspectRatio="16/9"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="text-sm font-bold text-[#F8FAFC]">
                      {selectedGalaxy.image?.title || `${selectedGalaxy.name} Observation`}
                    </h4>
                    <p className="text-[#A7B4CC] line-clamp-2">
                      {selectedGalaxy.image?.caption || selectedGalaxy.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A7B4CC]/70 pt-1 border-t border-[#1E293B]">
                      <span>{selectedGalaxy.image?.credit || 'NASA / ESA / STScI'}</span>
                      {selectedGalaxy.observationalMetadata?.wavelength && (
                        <span className="text-[#38BDF8]">{selectedGalaxy.observationalMetadata.wavelength}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cross-Link to Cosmic Image Lab if relevant */}
                {['andromeda-m31', 'sculptor-galaxy-ngc253'].includes(selectedGalaxy.id) && onNavigate && (
                  <button
                    onClick={() => onNavigate('spherex')}
                    className="w-full p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#050B1A] text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Telescope className="w-4 h-4" />
                      <span>Inspect in SPHEREx Explorer</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-WAVELENGTH OBSERVATIONS */}
          {activeDetailsTab === 'multi-wavelength' && (
            <div className="space-y-6">
              {(() => {
                const multiImages = (selectedGalaxy.images && selectedGalaxy.images.length > 0)
                  ? selectedGalaxy.images
                  : (selectedGalaxy.image ? [{
                      id: `img-${selectedGalaxy.id}`,
                      associatedObjectId: selectedGalaxy.id,
                      imageUrl: selectedGalaxy.image.url,
                      thumbnailUrl: selectedGalaxy.image.thumbnailUrl || selectedGalaxy.image.url,
                      hdUrl: selectedGalaxy.image.url,
                      title: selectedGalaxy.image.title,
                      caption: selectedGalaxy.image.caption,
                      sourceOrganization: 'NASA / Space Telescope Science Institute',
                      sourceUrl: selectedGalaxy.image.sourcePage || 'https://images.nasa.gov/',
                      credit: selectedGalaxy.image.credit,
                      assetClassification: 'observation' as const,
                      isVerifiedRealObservation: true,
                      instrument: selectedGalaxy.image.mission || 'Space Observatory',
                      wavelength: 'Broadband / Multi-Spectral'
                    }] : []);

                const activeImg = multiImages[selectedWavelengthIndex] || multiImages[0];

                return (
                  <div className="space-y-6">
                    {/* Multi-Wavelength Observation Selector Buttons */}
                    {multiImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        <span className="text-[11px] font-mono text-[#A7B4CC] uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>Select Band:</span>
                        </span>
                        {multiImages.map((img, idx) => {
                          const isSel = idx === selectedWavelengthIndex;
                          return (
                            <button
                              key={img.id || idx}
                              onClick={() => setSelectedWavelengthIndex(idx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
                                isSel
                                  ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 font-bold border border-[#8B5CF6]'
                                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#8B5CF6]/50'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="truncate max-w-50">{img.wavelength || img.title}</span>
                              <span className="text-[10px] opacity-75">({img.instrument?.split(' ')[0] || 'Mission'})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Active Observation Viewport */}
                    {activeImg ? (
                      <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-black max-h-125 flex items-center justify-center border border-[#1E293B]">
                          <img
                            src={activeImg.hdUrl || activeImg.imageUrl}
                            alt={activeImg.title}
                            className="max-h-125 w-full object-contain"
                          />
                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <AstronomicalBadge
                              classification={activeImg.assetClassification || (activeImg.isVerifiedRealObservation ? 'observation' : 'scientific-illustration')}
                              isVerifiedRealObservation={activeImg.isVerifiedRealObservation}
                            />
                            {activeImg.wavelength && (
                              <span className="px-2 py-1 rounded-lg bg-[#050B1A]/85 backdrop-blur-md text-[#38BDF8] border border-[#38BDF8]/40 text-[10px] font-mono">
                                {activeImg.wavelength}
                              </span>
                            )}
                          </div>

                          {activeImg.sourceUrl && (
                            <a
                              href={activeImg.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#050B1A]/85 backdrop-blur-md text-[#F8FAFC] hover:text-[#38BDF8] border border-[#1E293B] text-[11px] font-mono transition-colors"
                            >
                              <span>Original Archive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Observation Telemetry & Scientific Provenance */}
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                                {activeImg.title}
                              </h3>
                              <span className="text-xs font-mono text-[#8B5CF6]">
                                Observational Dataset: {activeImg.sourceOrganization || 'NASA / Space Telescope Science Institute'}
                              </span>
                            </div>
                            {activeImg.observationDate && (
                              <div className="flex items-center gap-1.5 text-xs font-mono text-[#A7B4CC]">
                                <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span>Observation Date: {activeImg.observationDate}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-[#A7B4CC] leading-relaxed">
                            {activeImg.caption}
                          </p>

                          {/* Technical Observation Properties Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B]">
                              <span className="text-[10px] text-[#A7B4CC] uppercase block">Instrument / Detector</span>
                              <span className="text-[#F8FAFC] font-semibold">{activeImg.instrument || 'Science Payload'}</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B]">
                              <span className="text-[10px] text-[#A7B4CC] uppercase block">Spectral Coverage</span>
                              <span className="text-[#38BDF8] font-semibold">{activeImg.wavelength || 'Broadband'}</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B]">
                              <span className="text-[10px] text-[#A7B4CC] uppercase block">Attribution & Credit</span>
                              <span className="text-[#F5C451] font-semibold truncate block">{activeImg.credit || 'NASA/ESA'}</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B]">
                              <span className="text-[10px] text-[#A7B4CC] uppercase block">Archive Verification</span>
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Traceable Record</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 rounded-2xl bg-[#050B1A] border border-[#1E293B] text-center space-y-3">
                        <Disc className="w-12 h-12 text-[#A7B4CC]/30 mx-auto" />
                        <h4 className="text-base font-bold text-[#F8FAFC]">No Verified Photographic Asset Available</h4>
                        <p className="text-xs text-[#A7B4CC] max-w-md mx-auto">
                          In adherence to COSMIC FRONTIER's scientific integrity policy, unverified stock photos or fabricated mockups are never displayed in place of authentic mission photography.
                        </p>
                      </div>
                    )}

                    {/* Scientific Notice: Physical Meaning of Multi-Wavelength Imagery */}
                    <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#8B5CF6]/30 space-y-3 text-xs leading-relaxed text-[#A7B4CC]">
                      <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
                        <Info className="w-4 h-4 text-[#8B5CF6]" />
                        <span>Multi-Wavelength Physical Interpretation & Scientific Notice</span>
                      </div>
                      <p>
                        Galaxies emit radiation across the entire electromagnetic spectrum, with each wavelength regime tracing fundamentally distinct astrophysical components:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 font-sans">
                        <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
                          <span className="text-[#38BDF8] font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                            <span>Ultraviolet (UV, 0.1–0.4 µm):</span>
                          </span>
                          <span className="text-[11px] leading-relaxed">
                            Traces energetic radiation from hot, massive young O- and B-type stars, mapping active starburst clusters and spiral arm density waves.
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Optical (Visible Light, 0.4–0.8 µm):</span>
                          </span>
                          <span className="text-[11px] leading-relaxed">
                            Traces the integrated light of mature stellar populations, globular clusters, and galactic bulges, while revealing dark dust extinction lanes.
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
                          <span className="text-[#F5C451] font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#F5C451]" />
                            <span>Infrared (IR, 0.8–500 µm):</span>
                          </span>
                          <span className="text-[11px] leading-relaxed">
                            Penetrates dense interstellar dust, revealing hidden star nurseries, Polycyclic Aromatic Hydrocarbons (PAHs), and cold molecular gas rings.
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-1">
                          <span className="text-[#A78BFA] font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                            <span>X-Ray & High Energy (&lt; 10 nm):</span>
                          </span>
                          <span className="text-[11px] leading-relaxed">
                            Traces extreme high-energy phenomena: supermassive black hole accretion disks (AGN), ultra-luminous X-ray binaries, and million-degree plasma.
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#A7B4CC]/90 italic pt-1 border-t border-[#1E293B]/70">
                        * Scientific Note: Brightness levels between different wavelength bands cannot be directly compared visually, as sensors utilize differing physical detectors, exposure integrations, and false-color chromatic mappings.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: REDSHIFT & DISTANCE LADDER */}
          {activeDetailsTab === 'spectroscopy' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A7B4CC] uppercase block">Spectroscopic Redshift (z):</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Measured</span>
                  </div>
                  <span className="text-2xl font-bold text-[#38BDF8]">{selectedGalaxy.redshift}</span>
                  {selectedGalaxy.redshiftUncertainty && (
                    <span className="text-[10px] text-[#A7B4CC] block">± {selectedGalaxy.redshiftUncertainty}</span>
                  )}
                  <span className="text-[10px] text-[#A7B4CC]/70 block pt-1 font-sans">
                    z = (λ_obs - λ_emit) / λ_emit
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A7B4CC] uppercase block">Heliocentric Radial Velocity:</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Doppler</span>
                  </div>
                  <span className="text-2xl font-bold text-[#F8FAFC]">
                    {selectedGalaxy.radialVelocityKmS.toLocaleString()} km/s
                  </span>
                  <span className={`text-[10px] font-semibold block ${selectedGalaxy.radialVelocityKmS < 0 ? 'text-[#38BDF8]' : 'text-[#F5C451]'}`}>
                    {selectedGalaxy.radialVelocityKmS < 0 ? 'Blueshifted (Approaching Milky Way)' : 'Cosmological Recession'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A7B4CC] uppercase block">Published Distance:</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      selectedGalaxy.fieldStatus?.distance === 'measured'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {selectedGalaxy.fieldStatus?.distance === 'measured' ? 'Standard Candle' : 'Hubble Flow'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[#F5C451]">
                    {selectedGalaxy.distanceMly ? `${selectedGalaxy.distanceMly.toLocaleString()} Mly` : 'Uncertain'}
                  </span>
                  <span className="text-[10px] text-[#A7B4CC] block">
                    {selectedGalaxy.distanceMpc ? `${selectedGalaxy.distanceMpc.toLocaleString()} Mpc (1 Mpc = 3.26 Mly)` : 'Local Peculiar Field'}
                  </span>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3 leading-relaxed text-[#A7B4CC]">
                <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                  <span>How was the distance to {selectedGalaxy.name} determined?</span>
                </h4>
                <p>
                  <strong>Primary Measurement Methodology:</strong> <span className="text-[#F5C451]">{selectedGalaxy.distanceMethod}</span>.
                </p>
                <p>
                  {selectedGalaxy.distanceMly && selectedGalaxy.distanceMly < 10 ? (
                    `Because ${selectedGalaxy.name} is relatively close to our Milky Way (within the Local Group or nearby Sculptor/M81 group), its motion is dominated by local gravitational attractions rather than the smooth cosmic expansion. Therefore, astronomers rely on standard candles like pulsating Cepheid variables or the Tip of the Red Giant Branch (TRGB), which achieve uncertainties under 5%.`
                  ) : (
                    `For distant extragalactic systems like ${selectedGalaxy.name}, the expansion of space stretches light wavelengths according to Hubble's law: v = H0 × d. Unless otherwise noted, distance estimates adopt a standard flat Lambda-CDM cosmological model with Hubble constant H0 = 70 km/s/Mpc and matter density Omega_m = 0.3.`
                  )}
                </p>

                {/* Cosmological Model Benchmark Specs */}
                <div className="p-3.5 rounded-xl bg-[#0B1630] border border-[#1E293B] font-mono text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[#A7B4CC] block">Cosmology Model:</span>
                    <span className="text-[#F8FAFC]">Flat ΛCDM</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC] block">Hubble Constant:</span>
                    <span className="text-[#38BDF8]">H₀ = 70 km/s/Mpc</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC] block">Density Parameters:</span>
                    <span className="text-[#F5C451]">Ω_m = 0.3, Ω_Λ = 0.7</span>
                  </div>
                </div>

                {selectedGalaxy.bibcode && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#38BDF8]">
                      Literature Reference: NASA/ADS Bibcode [{selectedGalaxy.bibcode}]
                    </span>
                    <a
                      href={`https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(selectedGalaxy.bibcode)}/abstract`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#F5C451] hover:underline"
                    >
                      <span>Open Abstract</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SCIENTIFIC EVIDENCE & PROVENANCE AUDIT */}
          {activeDetailsTab === 'evidence' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#8B5CF6]" />
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Scientific Provenance & Archival Audit Table
                  </h3>
                </div>
                <p className="text-xs text-[#A7B4CC] leading-relaxed">
                  Every metric in COSMIC FRONTIER is directly traceable to verified astronomical catalogs and mission archives. In adherence to our open scientific integrity standard, measured observational quantities are strictly distinguished from model-dependent estimations.
                </p>
              </div>

              {/* Auditable Data Table */}
              <div className="rounded-xl bg-[#050B1A] border border-[#1E293B] overflow-x-auto">
                <table className="w-full text-left font-mono tabular-nums text-xs">
                  <thead className="bg-[#0B1630] border-b border-[#1E293B] text-[#A7B4CC] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Astronomical Property</th>
                      <th className="py-3 px-4">Published Value</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Source Archive</th>
                      <th className="py-3 px-4">Verification Methodology</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-[#F8FAFC]">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Designation & Catalogs</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.catalogIdentifier.split('/')[0].trim()}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">NASA/IPAC NED & CDS SIMBAD</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">IAU Astronomical Nomenclature Cross-Match</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Coordinates (J2000)</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.rightAscension}, {selectedGalaxy.declination}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">NED Optical/IR Astrometry</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">Sub-arcsecond celestial coordinates</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Morphological Class</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.morphologicalType}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">de Vaucouleurs / RC3 / NED</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">Isophotal surface brightness profiling</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Spectroscopic Redshift (z)</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.redshift}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">NASA/IPAC NED & Keck / SDSS</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">H-alpha / [O III] / Ca H&K Doppler lines</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Heliocentric Velocity</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.radialVelocityKmS.toLocaleString()} km/s</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">NED Redshift Survey</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">Relativistic Doppler velocity formula</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Cosmic Distance</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.distanceMly ? `${selectedGalaxy.distanceMly.toLocaleString()} Mly` : 'Uncertain'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${
                          selectedGalaxy.fieldStatus?.distance === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {selectedGalaxy.fieldStatus?.distance === 'measured' ? 'Measured' : 'Estimated (Model)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">{selectedGalaxy.fieldStatus?.distance === 'measured' ? 'NASA Extragalactic Distance Database (NED-D)' : 'Hubble-Lemaître Flow'}</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">{selectedGalaxy.distanceMethod}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Physical Diameter</td>
                      <td className="py-2.5 px-4">{selectedGalaxy.estimatedDiameterLy ? `${selectedGalaxy.estimatedDiameterLy.toLocaleString()} ly` : 'Unmeasured'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${
                          selectedGalaxy.fieldStatus?.diameter === 'measured'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : selectedGalaxy.fieldStatus?.diameter === 'estimated'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400 border-transparent'
                        }`}>
                          {selectedGalaxy.fieldStatus?.diameter === 'measured'
                            ? 'Measured'
                            : selectedGalaxy.fieldStatus?.diameter === 'estimated'
                            ? 'Estimated (Model)'
                            : 'Unmeasured'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">Isophotal 25.0 mag/arcsec² Extent</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">Angular extent scaled to physical distance</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-[#A78BFA]">Photographic Imagery</td>
                      <td className="py-2.5 px-4">Authentic Multi-Wavelength</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Measured
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#38BDF8]">NASA Image & Video Library / STScI / ESA</td>
                      <td className="py-2.5 px-4 text-[#A7B4CC]">Calibrated Science Instrument Detector Data</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* External Verification Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(selectedGalaxy.catalogs?.ned || selectedGalaxy.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono text-[#38BDF8] flex items-center gap-1.5 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Verify on NASA/IPAC NED</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={`https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=${encodeURIComponent(selectedGalaxy.catalogs?.simbad || selectedGalaxy.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#8B5CF6] text-xs font-mono text-[#A78BFA] flex items-center gap-1.5 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Verify on CDS SIMBAD</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {selectedGalaxy.bibcode && (
                  <a
                    href={`https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(selectedGalaxy.bibcode)}/abstract`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#0B1630] border border-[#1E293B] hover:border-[#F5C451] text-xs font-mono text-[#F5C451] flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Literature Abstract (ADS)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. DISTANCE & REDSHIFT EXPLORER VISUALIZATION */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              Cosmic Distance & Redshift Explorer
            </h2>
            <p className="text-xs text-[#A7B4CC]">
              Journey across cosmological scales from the Local Group to the early universe.
            </p>
          </div>
        </div>

        {/* Interactive Distance Ruler */}
        <div className="space-y-4 pt-2">
          <div className="relative pt-6 pb-2">
            {/* Timeline Line */}
            <div className="w-full h-1.5 bg-linear-to-r from-[#38BDF8] via-[#8B5CF6] to-[#F5C451] rounded-full" />

            {/* Benchmark Milestone Pins */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#38BDF8] font-bold block">0.16 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">LMC Dwarf</span>
                <span className="text-[10px] text-[#A7B4CC]">Milky Way Orbit</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#38BDF8] font-bold block">2.54 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">Andromeda (M31)</span>
                <span className="text-[10px] text-[#A7B4CC]">Local Group</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#8B5CF6] font-bold block">23.5 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">Whirlpool (M51)</span>
                <span className="text-[10px] text-[#A7B4CC]">Canes Venatici</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#8B5CF6] font-bold block">53.8 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">Virgo Cluster</span>
                <span className="text-[10px] text-[#A7B4CC]">Supercluster Core</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#F5C451] font-bold block">321 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">Coma Cluster</span>
                <span className="text-[10px] text-[#A7B4CC]">Abell 1656 Rich</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#F5C451] font-bold block">4,600 Mly</span>
                <span className="text-[#F8FAFC] font-semibold truncate block">SMACS J0723</span>
                <span className="text-[10px] text-[#A7B4CC]">JWST Deep Field</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. EDUCATIONAL SECTION */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              Understanding Extragalactic Astronomy
            </h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">
              Fundamental principles of galactic morphology, redshift, the cosmic distance ladder, and scientific uncertainty.
            </p>
          </div>
        </div>

        {/* 6 Educational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">What is a galaxy?</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              A galaxy is a massive gravitational system consisting of stars, stellar remnants, interstellar gas, dust, and an encompassing halo of mysterious dark matter. Galaxies range from dwarf systems with a few thousand stars to supergiant ellipticals containing over 100 trillion stars.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">The Hubble Sequence</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Edwin Hubble classified galaxies by shape: Spirals (S) with graceful arms and active star formation; Ellipticals (E) with smooth spherical/ellipsoid shapes and older stars; Lenticulars (S0); and Irregulars (Irr) distorted by gravitational collisions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Galaxy Clusters</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Galaxies are not scattered randomly; they congregate in groups and clusters. The Virgo Cluster contains over 2,000 galaxies, while the Coma Cluster holds thousands. Clusters are the largest gravitationally bound structures in the universe, immersed in million-degree X-ray gas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">What does Redshift (z) mean?</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              As light travels through the expanding universe, the fabric of space itself stretches the photon waves to longer, redder frequencies: z = (lambda_obs - lambda_emit) / lambda_emit. Higher redshifts correspond to greater cosmological distances and earlier lookback times.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
              5
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Light-Years vs. Parsecs</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              A light-year (ly) is the distance light travels in one Julian year (~9.46 trillion km). A parsec (pc) is defined geometrically by stellar parallax (1 pc = 3.26156 ly). Extragalactic astronomy standardly uses Megaparsecs (1 Mpc = 1 million parsecs = 3.26 million light-years).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center font-bold">
              6
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Why Uncertainty Matters</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              No single telescope can directly measure the distance to every galaxy. Astronomers build a "distance ladder" where each rung introduces calibration uncertainties. Disagreements between methods have led to the famous "Hubble Tension" in modern cosmology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
