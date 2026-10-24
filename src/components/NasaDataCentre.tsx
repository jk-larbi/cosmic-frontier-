import { useState, useEffect, useMemo, type FC } from 'react';
import type { CatalogCategory, CatalogItem, AppPage } from '../types';
import { fetchCatalogItems } from '../services/astronomyDataService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { AstronomicalImageGallery } from './astronomy-images/AstronomicalImageGallery';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Compass,
  Telescope,
  Orbit,
  ArrowRight
} from 'lucide-react';

interface NasaDataCentreProps {
  onNavigate?: (page: AppPage) => void;
}

export const NasaDataCentre: FC<NasaDataCentreProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<CatalogItem | null>(null);
  const [dataSource, setDataSource] = useState<string>('Connecting to Gateways...');
  const [isLiveGateway, setIsLiveGateway] = useState<boolean>(true);

  // Load items whenever category or search changes
  const loadData = async (cat: CatalogCategory, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCatalogItems(cat, query);
      setItems(res.items || []);
      setDataSource(res.source || 'NASA Open Data Gateway');
      setIsLiveGateway(res.isLive);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch catalog records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(selectedCategory, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadData(selectedCategory, '');
  };

  // Category counts
  const categoryTabs: { id: CatalogCategory; label: string; icon: typeof Database }[] = [
    { id: 'all', label: 'All Records', icon: Database },
    { id: 'planets', label: 'Solar System', icon: Compass },
    { id: 'exoplanets', label: 'Exoplanets', icon: Orbit },
    { id: 'small-bodies', label: 'Asteroids & TNOs', icon: Orbit },
    { id: 'galaxies', label: 'Galaxies', icon: Telescope },
    { id: 'stars', label: 'Stars', icon: Sparkles },
    { id: 'spherex', label: 'SPHEREx Tracers', icon: Telescope },
  ];

  // Client-side quick filter when typing
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.properties.some(p => String(p.value).toLowerCase().includes(q) || p.label.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Keyboard dismissal on Escape
  useEffect(() => {
    if (!activeModalItem) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeModalItem]);

  return (
    <div className="min-h-screen bg-[#050B1A] text-[#F8FAFC] pb-24">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-[#1E293B] bg-linear-to-b from-[#0B1630] to-[#050B1A] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#818CF8]/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 mb-4">
                <Database className="w-3.5 h-3.5" />
                Verified Astronomical Data Layer
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                NASA Astronomical Data Centre
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
                Direct scientific access to NASA Exoplanet Archive TAP queries, JPL Horizons planetary ephemerides, 
                JPL Small-Body Database orbits, CDS SIMBAD stellar benchmarks, and SPHEREx infrared mission parameters.
              </p>
            </div>

            {/* Gateway status badge */}
            <div className="flex flex-col items-start md:items-end gap-2 bg-[#0B1630]/90 border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${isLiveGateway ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="text-[#94A3B8]">Data Gateway Status:</span>
                <span className={isLiveGateway ? 'text-emerald-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                  {isLiveGateway ? 'Live NASA/CDS Gateway' : 'Verified Local Archive'}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Source: <span className="text-[#E2E8F0]">{dataSource}</span>
              </p>
              <button
                onClick={() => loadData(selectedCategory, searchQuery)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:text-[#7DD3FC] transition-colors"
                title="Refresh gateway cache"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Gateway Data
              </button>
            </div>
          </div>

          {/* Scientific Disclaimer Pill */}
          <div className="mt-8 flex items-start gap-3 bg-[#0F172A]/80 border border-[#334155] rounded-xl p-4 text-xs text-[#94A3B8] leading-relaxed">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#F8FAFC] font-semibold">Scientific Integrity Guarantee: </span>
              All records strictly distinguish verified observational catalogs (NASA Exoplanet Archive, JPL SBDB, SIMBAD) from reference standards and theoretical models. 
              Hypothetical bodies (including Planet X) are explicitly marked as unconfirmed scenarios.
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Controls Bar: Search & Category Pills */}
        <div className="space-y-6">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by object name, host star, orbit class, discovery year, or property..."
              className="w-full pl-12 pr-24 py-3.5 bg-[#0B1630] border border-[#1E293B] rounded-xl text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white p-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#38BDF8] hover:bg-[#0284C7] text-[#050B1A] font-semibold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#38BDF8] text-[#050B1A] shadow-md shadow-[#38BDF8]/20 font-bold'
                      : 'bg-[#0B1630] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-[#1E293B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="mt-6 flex items-center justify-between text-xs text-[#64748B] border-b border-[#1E293B] pb-3">
          <div>
            Showing <span className="text-[#F8FAFC] font-semibold">{filteredItems.length}</span> astronomical records
            {searchQuery && (
              <span> matching "<span className="text-[#38BDF8]">{searchQuery}</span>"</span>
            )}
          </div>
          <div className="hidden sm:block">
            NASA Space Apps Challenge 2026 • Verified Scientific Catalog
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-[#38BDF8] animate-spin mb-4" />
            <p className="text-sm text-[#94A3B8]">Querying NASA, JPL, and CDS Astronomical Gateways...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="my-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-start gap-4 text-red-300">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-400" />
            <div>
              <h4 className="font-semibold text-sm">Failed to retrieve data</h4>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
              <button
                onClick={() => loadData(selectedCategory, searchQuery)}
                className="mt-3 px-3 py-1.5 bg-red-800/40 hover:bg-red-800/60 text-xs rounded-lg font-medium transition-colors"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[#0B1630]/40 rounded-2xl border border-[#1E293B] my-8 p-8">
            <Database className="w-12 h-12 text-[#64748B] mb-4" />
            <h3 className="text-lg font-bold text-white">No astronomical records found</h3>
            <p className="text-sm text-[#94A3B8] max-w-md mt-2">
              No objects matched your search criteria. Try broadening your keywords or resetting filters.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-5 px-4 py-2 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold rounded-xl border border-[#38BDF8]/40 transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* Catalog Items Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              // Status badge styling
              const isReal = item.dataStatus.includes('Real Archival') || item.dataStatus.includes('Live');
              const isReference = item.dataStatus.includes('Reference Standard');
              const isHypothetical = item.dataStatus.includes('Hypothetical');

              const statusColorClass = isReal
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isReference
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : isHypothetical
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

              return (
                <div
                  key={item.id}
                  className="card-interactive group flex flex-col justify-between bg-[#0B1630] hover:bg-[#0E1B38] border border-[#1E293B] hover:border-[#38BDF8]/40 rounded-2xl p-6 transition-all shadow-lg hover:shadow-2xl"
                >
                  <div>
                    {/* Category & Status Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1E293B] text-[#94A3B8]">
                        {item.categoryLabel}
                      </span>
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${statusColorClass}`}>
                        {item.dataStatus}
                      </span>
                    </div>

                    {/* Visual Thumbnail */}
                    <div className="mb-3 rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A] relative shadow-inner">
                      <AstronomicalImage
                        target={item}
                        targetType={
                          item.category === 'planets' ? 'planet' 
                          : item.category === 'exoplanets' ? 'exoplanet'
                          : item.category === 'small-bodies' ? 'small-body'
                          : item.category === 'galaxies' ? 'galaxy'
                          : item.category === 'stars' ? 'star'
                          : 'observation'
                        }
                        aspectRatio="16/9"
                        showBadge={true}
                        className="w-full h-36 object-cover"
                      />
                    </div>

                    {/* Object Name & Subtitle */}
                    <h3 className="text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-medium mt-1">
                      {item.subtitle}
                    </p>

                    {/* Description */}
                    <p className="mt-3 text-xs text-[#CBD5E1] line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Properties Matrix */}
                    <div className="mt-4 pt-4 border-t border-[#1E293B] grid grid-cols-2 gap-2 text-xs">
                      {item.properties.slice(0, 4).map((prop, idx) => (
                        <div key={idx} className="bg-[#050B1A]/60 rounded-lg p-2 border border-[#1E293B]/60">
                          <span className="text-[10px] text-[#64748B] block truncate">{prop.label}</span>
                          <span className="font-semibold text-[#F8FAFC] truncate block mt-0.5 font-mono tabular-nums">
                            {prop.value} {prop.unit && <span className="text-[10px] text-[#94A3B8] font-normal">{prop.unit}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Provenance Footer */}
                  <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between gap-3 text-xs">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="text-[#38BDF8] hover:text-[#7DD3FC] font-semibold inline-flex items-center gap-1 group/btn"
                    >
                      Inspect Full Record
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#64748B] hover:text-[#94A3B8] inline-flex items-center gap-1 text-[11px]"
                        title={`View original record at ${item.sourceName}`}
                      >
                        <span>{item.sourceName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0B1630] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#1E293B] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
                    {activeModalItem.categoryLabel}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {activeModalItem.dataStatus}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{activeModalItem.name}</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">{activeModalItem.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
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
                  target={activeModalItem}
                  targetType={
                    activeModalItem.category === 'planets' ? 'planet'
                    : activeModalItem.category === 'exoplanets' ? 'exoplanet'
                    : activeModalItem.category === 'small-bodies' ? 'small-body'
                    : activeModalItem.category === 'galaxies' ? 'galaxy'
                    : activeModalItem.category === 'stars' ? 'star'
                    : 'observation'
                  }
                />
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">Scientific Overview</h4>
                <p className="text-[#CBD5E1] leading-relaxed text-xs sm:text-sm">
                  {activeModalItem.description}
                </p>
              </div>

              {/* Complete Properties Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Verified Properties & Parameters</h4>
                <div className="bg-[#050B1A] border border-[#1E293B] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-[#64748B] bg-[#0E1B38]">
                        <th className="py-2.5 px-4 font-medium">Measurement</th>
                        <th className="py-2.5 px-4 font-medium">Value</th>
                        <th className="py-2.5 px-4 font-medium">Standard Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B] tabular-nums">
                      {activeModalItem.properties.map((prop, idx) => (
                        <tr key={idx} className="hover:bg-[#0B1630]/60">
                          <td className="py-2.5 px-4 text-[#94A3B8] font-medium">{prop.label}</td>
                          <td className="py-2.5 px-4 text-white font-mono font-semibold">{String(prop.value)}</td>
                          <td className="py-2.5 px-4 text-[#64748B] font-mono">{prop.unit || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Provenance & Citation Box */}
              <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs">
                <div className="flex items-center gap-2 text-[#38BDF8] font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Observational Provenance
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
                  Data sourced from <span className="text-white font-medium">{activeModalItem.sourceName}</span>. 
                  Archival records comply with IAU, NASA Astrophysics Data System (ADS), and standard astronomical calibration protocols.
                </p>
                {activeModalItem.sourceUrl && (
                  <a
                    href={activeModalItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[#38BDF8] hover:text-[#7DD3FC] font-semibold text-xs"
                  >
                    Open official NASA/JPL/CDS entry in new window
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-[#1E293B] bg-[#081026] flex items-center justify-between gap-3">
              {onNavigate && (
                <button
                  onClick={() => {
                    setActiveModalItem(null);
                    onNavigate('ai-guide');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Guide About This Target
                </button>
              )}
              <button
                onClick={() => setActiveModalItem(null)}
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

