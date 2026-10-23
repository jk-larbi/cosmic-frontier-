import { useState, type ReactNode, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  Telescope, 
  Orbit, 
  Sparkles, 
  Info, 
  Home, 
  Menu, 
  X,
  Compass,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const Navbar: FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { page: AppPage; label: string; icon: ReactNode }[] = [
    { page: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { page: 'spherex', label: 'SPHEREx Explorer', icon: <Telescope className="w-4 h-4" /> },
    { page: 'planet-x', label: 'Planet X Explorer', icon: <Orbit className="w-4 h-4" /> },
    { page: 'data-centre', label: 'NASA Data Centre', icon: <Database className="w-4 h-4" /> },
    { page: 'ai-guide', label: 'COSMIC AI GUIDE', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050B1A]/90 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 rounded-lg p-1"
            aria-label="Cosmic Frontier Home"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1630] to-[#1E293B] border border-[#38BDF8]/30 flex items-center justify-center shadow-lg group-hover:border-[#38BDF8] transition-all">
              <Compass className="w-5 h-5 text-[#38BDF8] group-hover:rotate-45 transition-transform duration-500" />
              <div className="absolute inset-0 rounded-xl bg-[#38BDF8]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-wider text-[#F8FAFC] font-mono group-hover:text-[#38BDF8] transition-colors">
                  COSMIC FRONTIER
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  Space Apps 2026
                </span>
              </div>
              <p className="text-[11px] text-[#A7B4CC] hidden md:block">
                Explore the Universe. Discover the Unknown.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.page || (item.page === 'ai-guide' && currentPage === 'guide');
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {/* Action Badge & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavClick('ai-guide')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5C451]/10 text-[#F5C451] hover:bg-[#F5C451]/20 border border-[#F5C451]/30 text-xs font-semibold tracking-wide transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Guide</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1630] border-b border-[#1E293B] px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = currentPage === item.page || (item.page === 'ai-guide' && currentPage === 'guide');
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[#050B1A] text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#050B1A]/50'
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
    </header>
  );
};

