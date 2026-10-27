import { useState, useRef, useEffect, type ReactNode, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  Info, 
  Menu, 
  X, 
  Compass, 
  Database, 
  Globe, 
  Disc,
  Radio,
  Home,
  Crosshair,
  BookOpen,
  Sliders,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  isBeginnerMode?: boolean;
  onToggleBeginnerMode?: () => void;
  onOpenGlossary?: () => void;
}

export const Navbar: FC<NavbarProps> = ({ 
  currentPage, 
  onNavigate,
  isBeginnerMode = true,
  onToggleBeginnerMode,
  onOpenGlossary
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logical order of primary discovery stations
  const primaryNavItems: { page: AppPage; label: string; icon: ReactNode }[] = [
    { page: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { page: 'observatory', label: 'Observatory', icon: <Telescope className="w-4 h-4" /> },
    { page: 'planet-x', label: 'Planet X', icon: <Orbit className="w-4 h-4" /> },
    { page: 'asteroid-watch', label: 'Asteroids', icon: <Crosshair className="w-4 h-4" /> },
    { page: 'galaxies', label: 'Galaxies', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'spherex', label: 'SPHEREx Lab', icon: <Compass className="w-4 h-4" /> },
    { page: 'exoplanets', label: 'Exoplanets', icon: <Disc className="w-4 h-4" /> },
    { page: 'universe', label: '3D Universe', icon: <Globe className="w-4 h-4" /> },
  ];

  // Secondary stations accessible in dropdown on medium screens and in full list on large screens
  const secondaryNavItems: { page: AppPage; label: string; icon: ReactNode }[] = [
    { page: 'mission-control', label: 'Mission Control', icon: <Radio className="w-4 h-4" /> },
    { page: 'data-centre', label: 'Data Centre', icon: <Database className="w-4 h-4" /> },
    { page: 'ai-guide', label: 'AI Guide', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'about', label: 'About & Docs', icon: <Info className="w-4 h-4" /> },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentActive = (page: AppPage) => {
    if (currentPage === page) return true;
    if (page === 'ai-guide' && currentPage === 'guide') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050B1A]/95 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand Identity */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 rounded-lg p-1 shrink-0"
            aria-label="Cosmic Frontier Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0B1630] to-[#1E293B] border border-[#38BDF8]/30 flex items-center justify-center shadow-lg group-hover:border-[#38BDF8] transition-all">
              <Compass className="w-5 h-5 text-[#38BDF8] group-hover:rotate-45 transition-transform duration-500" />
              <div className="absolute inset-0 rounded-xl bg-[#38BDF8]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-wider text-[#F8FAFC] font-mono group-hover:text-[#38BDF8] transition-colors">
                  COSMIC FRONTIER
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  Space Apps 2026
                </span>
              </div>
              <p className="text-[10px] text-[#A7B4CC] hidden md:block">
                Explore the Universe. Discover the Unknown.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links (Large & XL screens) */}
          <nav className="hidden 2xl:flex items-center gap-1" aria-label="Desktop Navigation Full">
            {allNavItems.map((item) => {
              const isActive = isCurrentActive(item.page);
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1630] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                      : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Medium Desktop Navigation Links (lg to 2xl screens: Primary + More dropdown) */}
          <nav className="hidden lg:flex 2xl:hidden items-center gap-1" aria-label="Desktop Navigation Compact">
            {primaryNavItems.slice(0, 6).map((item) => {
              const isActive = isCurrentActive(item.page);
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1630] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                      : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* More Workstations Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  secondaryNavItems.some(i => isCurrentActive(i.page)) || primaryNavItems.slice(6).some(i => isCurrentActive(i.page))
                    ? 'bg-[#0B1630] text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl p-2 space-y-1 z-50 animate-fadeIn">
                  {[...primaryNavItems.slice(6), ...secondaryNavItems].map(item => {
                    const isActive = isCurrentActive(item.page);
                    return (
                      <button
                        key={item.page}
                        onClick={() => handleNavClick(item.page)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#050B1A] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold'
                            : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#050B1A]/60'
                        }`}
                      >
                        <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls: Mode Switch, Glossary, AI Guide & Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Beginner / Explorer Mode Switch */}
            {onToggleBeginnerMode && (
              <button
                onClick={onToggleBeginnerMode}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border border-[#1E293B] hover:border-[#38BDF8]/40 bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                title={`Current mode: ${isBeginnerMode ? 'Beginner' : 'Explorer'} (Click to toggle)`}
                aria-label="Toggle exploration mode"
              >
                <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden xl:inline text-[#94A3B8]">Mode:</span>
                <span className={isBeginnerMode ? "text-[#38BDF8] font-bold" : "text-[#C084FC] font-bold"}>
                  {isBeginnerMode ? 'Beginner' : 'Explorer'}
                </span>
              </button>
            )}

            {/* Astronomy Glossary Button */}
            {onOpenGlossary && (
              <button
                onClick={onOpenGlossary}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border border-[#1E293B] hover:border-[#F5C451]/40 bg-[#0B1630] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                title="Open verified Astronomy Glossary & Concepts"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F5C451]" />
                <span className="hidden lg:inline">Glossary</span>
              </button>
            )}

            {/* Ask AI Guide Button */}
            <button
              onClick={() => handleNavClick('ai-guide')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Ask AI Guide</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630] border border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Organized Categorization */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070E22] border-b border-[#1E293B] px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
          {/* Mobile Mode & Utility Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] gap-2">
            {onToggleBeginnerMode && (
              <button
                onClick={onToggleBeginnerMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#0B1630] border border-[#1E293B] text-[#A7B4CC]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Mode: <strong className={isBeginnerMode ? "text-[#38BDF8]" : "text-[#C084FC]"}>{isBeginnerMode ? 'Beginner' : 'Explorer'}</strong></span>
              </button>
            )}

            {onOpenGlossary && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGlossary();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#0B1630] border border-[#1E293B] text-[#F5C451]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Glossary</span>
              </button>
            )}
          </div>

          {/* Section: Observatories & Simulators */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] px-2 block font-bold">
              Observatories & Simulators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {primaryNavItems.map((item) => {
                const isActive = isCurrentActive(item.page);
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1630] text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                        : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Research Data & Assistance */}
          <div className="space-y-1 pt-2 border-t border-[#1E293B]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B5CF6] px-2 block font-bold">
              Mission Control & Science Resources
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {secondaryNavItems.map((item) => {
                const isActive = isCurrentActive(item.page);
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1630] text-[#8B5CF6] border border-[#8B5CF6]/40 font-bold'
                        : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-[#8B5CF6]' : 'text-[#A7B4CC]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
