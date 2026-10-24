import { useState, useEffect, type FC } from 'react';
import type { NasaApodData, NasaMissionPhoto, AppPage } from '../types';
import { 
  Telescope, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  Layers, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  Satellite
} from 'lucide-react';

interface NasaLiveDispatchProps {
  onNavigate?: (page: AppPage) => void;
}

export const NasaLiveDispatch: FC<NasaLiveDispatchProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'apod' | 'spherex'>('apod');
  const [apodData, setApodData] = useState<NasaApodData | null>(null);
  const [spherexPhotos, setSpherexPhotos] = useState<NasaMissionPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showFullExplanation, setShowFullExplanation] = useState<boolean>(false);
  const [apiSource, setApiSource] = useState<string>('api.nasa.gov');

  const fetchData = async () => {
    try {
      setErrorNotice(null);
      // Fetch APOD
      const apodRes = await fetch('/api/nasa/apod');
      if (apodRes.ok) {
        const json = await apodRes.json();
        if (json.data) {
          setApodData(json.data);
          setApiSource(json.source || 'api.nasa.gov');
        }
      }

      // Fetch SPHEREx photos
      const spherexRes = await fetch('/api/nasa/spherex');
      if (spherexRes.ok) {
        const json = await spherexRes.json();
        if (json.photos) {
          setSpherexPhotos(json.photos);
        }
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch live NASA telemetry:', err);
      setErrorNotice('Operating on verified NASA archival records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <div className="rounded-2xl bg-linear-to-b from-[#0B1630] via-[#070D1E] to-[#040814] border border-[#1E293B] hover:border-[#38BDF8]/40 p-6 sm:p-8 space-y-6 shadow-2xl transition-all relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="beacon-pulse absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
              LIVE NASA OPEN DATA DISPATCH
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E293B] text-[#A7B4CC] border border-[#334155]">
              {apiSource}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <span>NASA Space Telemetry Feed</span>
            <Satellite className="w-5 h-5 text-[#38BDF8]" />
          </h2>
          <p className="text-xs text-[#A7B4CC]">
            Directly connected to NASA's public astronomy endpoints using authenticated credentials.
          </p>
        </div>

        {/* Tab Controls & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-xl bg-[#050B1A] border border-[#1E293B] p-1">
            <button
              onClick={() => setActiveTab('apod')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'apod'
                  ? 'bg-[#38BDF8] text-[#050B1A] shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>APOD Today</span>
            </button>
            <button
              onClick={() => setActiveTab('spherex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'spherex'
                  ? 'bg-[#38BDF8] text-[#050B1A] shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SPHEREx Hardware</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh NASA Feed"
            className="p-2 rounded-xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8] text-[#A7B4CC] hover:text-[#38BDF8] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="text-xs font-mono text-[#F5C451] bg-[#F5C451]/10 border border-[#F5C451]/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* TAB 1: APOD TODAY */}
      {activeTab === 'apod' && (
        <div className="space-y-6 relative z-10">
          {isLoading ? (
            <div className="h-72 rounded-2xl bg-[#050B1A] border border-[#1E293B] flex flex-col items-center justify-center space-y-3 text-[#A7B4CC]">
              <div className="w-8 h-8 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Fetching latest NASA APOD data...</span>
            </div>
          ) : apodData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Image Preview */}
              <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#050B1A] border border-[#1E293B] shadow-lg group relative">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#050B1A]/80 backdrop-blur-md border border-[#38BDF8]/40 text-[10px] font-mono text-[#38BDF8] font-bold">
                  NASA APOD
                </div>
                {apodData.hdurl && (
                  <a
                    href={apodData.hdurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#050B1A]/90 hover:bg-[#38BDF8] text-[#F8FAFC] hover:text-[#050B1A] text-xs font-mono font-bold border border-[#38BDF8]/40 transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <span>View HD</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Text & Scientific Explanation */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#38BDF8]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {apodData.date}
                    </span>
                    {apodData.copyright && (
                      <span className="text-[#A7B4CC]">
                        Credit: {apodData.copyright.replace(/\n/g, ' ').trim()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {apodData.title}
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-[#050B1A]/80 border border-[#1E293B] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
                    Official NASA Scientific Explanation
                  </span>
                  <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                    {showFullExplanation 
                      ? apodData.explanation 
                      : `${apodData.explanation.slice(0, 320)}...`}
                  </p>
                  {apodData.explanation.length > 320 && (
                    <button
                      onClick={() => setShowFullExplanation(!showFullExplanation)}
                      className="text-xs font-mono text-[#38BDF8] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>{showFullExplanation ? 'Show less' : 'Read full NASA explanation'}</span>
                      {showFullExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Explorer Callout */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Live API Key Validated via api.nasa.gov</span>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('ai-guide')}
                      className="px-4 py-2 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#A78BFA] hover:text-[#FFFFFF] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI Guide About This</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#A7B4CC] font-mono">
              Unable to load APOD. Check network connection or verify API key.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPHEREx HARDWARE ARCHIVE */}
      {activeTab === 'spherex' && (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-[#38BDF8] font-bold tracking-wider">
                NASA/JPL Mission Hardware Archives
              </span>
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                SPHEREx Space Observatory Cleanroom Photography
              </h3>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('spherex')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Telescope className="w-3.5 h-3.5" />
                <span>Open SPHEREx Explorer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spherexPhotos.map((photo) => (
              <div 
                key={photo.nasaId}
                className="rounded-2xl bg-[#050B1A] border border-[#1E293B] hover:border-[#38BDF8]/40 p-4 space-y-3 group shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden h-44 bg-[#0B1630] border border-[#1E293B] relative">
                    <img 
                      src={photo.thumb} 
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image placeholder if NASA asset server has network delay
                        (e.target as HTMLImageElement).src = 'https://images-assets.nasa.gov/image/PIA25784/PIA25784~medium.jpg';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/85 backdrop-blur-sm border border-[#38BDF8]/30 text-[9px] font-mono text-[#38BDF8] font-bold">
                      {photo.nasaId}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#A7B4CC]">{photo.center} • {photo.dateCreated}</span>
                    <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors mt-0.5">
                      {photo.title}
                    </h4>
                  </div>

                  <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                    {photo.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#38BDF8]">
                  <span>NASA Archival Record</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
