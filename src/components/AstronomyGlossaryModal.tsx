import { useState, useMemo, useEffect, type FC } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Lightbulb, 
  Compass, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { ASTRONOMY_GLOSSARY, type AstronomyGlossaryItem } from '../utils/planetXPhysics';
import type { AppPage } from '../types';

interface AstronomyGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: AppPage) => void;
  initialTermId?: string;
}

export const AstronomyGlossaryModal: FC<AstronomyGlossaryModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialTermId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeExpandedId, setActiveExpandedId] = useState<string | null>(initialTermId || null);

  useEffect(() => {
    if (initialTermId) {
      setActiveExpandedId(initialTermId);
    }
  }, [initialTermId]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = useMemo(() => {
    const cats = ['All', 'Orbital Mechanics', 'Distance & Scale', 'Observational Astronomy', 'Planet X Science'];
    return cats;
  }, []);

  const filteredItems = useMemo(() => {
    return ASTRONOMY_GLOSSARY.filter((item: AstronomyGlossaryItem) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;
      const matchesText = 
        item.term.toLowerCase().includes(query) ||
        (item.symbol && item.symbol.toLowerCase().includes(query)) ||
        item.simpleDefinition.toLowerCase().includes(query) ||
        item.analogy.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query);
      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleNavClick = (page: AppPage) => {
    onClose();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#050B1A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1E293B] bg-[#0B1630]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h2 id="glossary-modal-title" className="text-lg sm:text-xl font-bold font-mono text-[#F8FAFC]">
                Cosmic Astronomy Glossary
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Plain-language explanations of celestial mechanics and space discovery concepts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label="Close glossary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-[#1E293B] bg-[#081126] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search concepts, terms (e.g. AU, Perihelion, Sednoid, Clustering)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B] hover:text-[#F8FAFC]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs font-mono">
            <span className="text-[11px] text-[#64748B] flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-xs'
                    : 'bg-[#0B1630] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Compass className="w-8 h-8 text-[#64748B] mx-auto animate-pulse" />
              <p className="text-sm font-mono text-[#94A3B8]">
                No matching astronomical concepts found for "{searchQuery}".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs text-[#38BDF8] underline font-mono cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = activeExpandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isExpanded
                      ? 'bg-[#0B1630] border-[#38BDF8]/60 shadow-lg'
                      : 'bg-[#081126] border-[#1E293B] hover:border-[#1E293B]/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B]/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold font-mono text-[#F8FAFC]">
                        {item.term}
                      </h3>
                      {item.symbol && (
                        <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/15 text-[#38BDF8] text-xs font-mono font-bold border border-[#38BDF8]/30">
                          {item.symbol}
                        </span>
                      )}
                      {item.pronunciation && (
                        <span className="text-[11px] text-[#64748B] font-mono italic">
                          /{item.pronunciation}/
                        </span>
                      )}
                    </div>
                    <span className="self-start sm:self-auto text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#050B1A] text-[#94A3B8] border border-[#1E293B]">
                      {item.category}
                    </span>
                  </div>

                  {/* Plain Language Definition */}
                  <div className="mt-3 space-y-3">
                    <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                      {item.simpleDefinition}
                    </p>

                    {/* Intuitive Metaphor */}
                    <div className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-[#F5C451] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold font-mono text-[#F5C451] uppercase tracking-wide block">
                          Think of it like:
                        </span>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {item.analogy}
                        </p>
                      </div>
                    </div>

                    {/* Real-World Cosmic Example */}
                    <div className="text-xs text-[#94A3B8] font-mono bg-[#050B1A]/40 p-2.5 rounded-lg border border-[#1E293B]/40">
                      <span className="text-[#38BDF8] font-semibold">Real-World Example: </span>
                      <span className="text-[#CBD5E1]">{item.example}</span>
                    </div>

                    {/* Navigation action button */}
                    {item.relatedTopicPage && onNavigate && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleNavClick(item.relatedTopicPage!)}
                          className="px-3 py-1.5 rounded-lg bg-[#0E1B38] hover:bg-[#38BDF8] hover:text-[#050B1A] text-[#38BDF8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 border border-[#38BDF8]/40 cursor-pointer group"
                        >
                          <span>
                            {item.relatedTopicPage === 'planet-x'
                              ? 'Test in Planet X Lab'
                              : item.relatedTopicPage === 'observatory'
                              ? 'Inspect in 3D Observatory'
                              : item.relatedTopicPage === 'asteroid-watch'
                              ? 'Track in Asteroid Watch'
                              : 'Explore in 3D Universe'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0B1630] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#64748B]">
          <span>{filteredItems.length} of {ASTRONOMY_GLOSSARY.length} terms displayed</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Press ESC to dismiss</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] text-[#F8FAFC] font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
