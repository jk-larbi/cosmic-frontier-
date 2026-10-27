import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { MissionControlDashboard } from './components/MissionControlDashboard';
import { LiveCosmicObservatory } from './components/LiveCosmicObservatory';
import { Universe3DExplorer } from './components/Universe3DExplorer';
import { AsteroidWatch } from './components/AsteroidWatch';
import { ExoplanetDiscoveryLab } from './components/ExoplanetDiscoveryLab';
import { GalaxyExplorer } from './components/GalaxyExplorer';
import { SPHERExExplorer } from './components/SPHERExExplorer';
import { PlanetXExplorer } from './components/PlanetXExplorer';
import { NasaDataCentre } from './components/NasaDataCentre';
import { AIGuide } from './components/AIGuide';
import { AboutPage } from './components/AboutPage';
import { AstronomyGlossaryModal } from './components/AstronomyGlossaryModal';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [isBeginnerMode, setIsBeginnerMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cosmic_frontier_experience_mode') || localStorage.getItem('cosmic_frontier_mode');
      return saved !== null ? saved === 'beginner' : true;
    } catch {
      return true;
    }
  });
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryTermId, setGlossaryTermId] = useState<string | undefined>(undefined);

  const handleToggleBeginnerMode = () => {
    setIsBeginnerMode(prev => {
      const next = !prev;
      try {
        const val = next ? 'beginner' : 'explorer';
        localStorage.setItem('cosmic_frontier_experience_mode', val);
        localStorage.setItem('cosmic_frontier_mode', val);
      } catch {}
      return next;
    });
  };

  const handleOpenGlossary = (termId?: string) => {
    setGlossaryTermId(termId);
    setIsGlossaryOpen(true);
  };

  // Handle URL hash routing or direct navigation
  const handleNavigate = (page: AppPage) => {
    const clean = String(page).toLowerCase();
    if (clean === 'radar' || clean === 'deep-space-radar') {
      setCurrentPage('home');
      window.location.hash = 'deep-space-radar';
      setTimeout(() => {
        const el = document.getElementById('deep-space-radar') || document.getElementById('radar-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    let targetPage: AppPage = page;
    if (page === 'guide' || page === 'ai-guide') {
      targetPage = 'ai-guide';
    } else if (page === 'home') {
      targetPage = 'home';
    } else if (page === 'mission-control' || (page as string) === 'live-space') {
      targetPage = 'mission-control';
    }
    setCurrentPage(targetPage);
    window.location.hash = targetPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser hash and path on initial load and hash change
  useEffect(() => {
    const handleLocationChange = () => {
      // Strip leading and trailing slashes and hashes
      const rawHash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const candidate = (rawHash || rawPath).toLowerCase();

      if (candidate === 'live-space') {
        window.location.hash = 'mission-control';
      } else if (candidate === 'ai-guide' || candidate === 'guide') {
        setCurrentPage('ai-guide');
      } else if (candidate === 'spherex' || candidate === 'image-lab') {
        setCurrentPage('spherex');
      } else if (candidate === 'mission-control') {
        setCurrentPage('mission-control');
      } else if (candidate === 'motion' || candidate === 'asteroid-motion') {
        setCurrentPage('asteroid-watch');
      } else if (candidate === 'radar' || candidate === 'deep-space-radar') {
        setCurrentPage('home');
        setTimeout(() => {
          const el = document.getElementById('deep-space-radar') || document.getElementById('radar-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (candidate === 'home' || !candidate) {
        setCurrentPage('home');
      } else if (['observatory', 'universe', 'asteroid-watch', 'exoplanets', 'galaxies', 'planet-x', 'data-centre', 'about'].includes(candidate)) {
        setCurrentPage(candidate as AppPage);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050B1A] text-[#F8FAFC] selection:bg-[#38BDF8]/20 selection:text-[#38BDF8]">
      {/* Global Navbar */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isBeginnerMode={isBeginnerMode}
        onToggleBeginnerMode={handleToggleBeginnerMode}
        onOpenGlossary={() => handleOpenGlossary()}
      />

      {/* Main Content Area */}
      <main className="flex-1 animate-page-enter" key={currentPage}>
        {currentPage === 'mission-control' && (<MissionControlDashboard onNavigate={handleNavigate} />)}
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            isBeginnerMode={isBeginnerMode} 
            onOpenGlossary={handleOpenGlossary}
          />
        )}
        {currentPage === 'observatory' && (<LiveCosmicObservatory onNavigate={handleNavigate} />)}
        {currentPage === 'universe' && (<Universe3DExplorer onNavigate={handleNavigate} />)}
        {currentPage === 'asteroid-watch' && (<AsteroidWatch onNavigate={handleNavigate} />)}
        {currentPage === 'exoplanets' && (<ExoplanetDiscoveryLab onNavigate={handleNavigate} />)}
        {currentPage === 'galaxies' && (<GalaxyExplorer onNavigate={handleNavigate} />)}
        {currentPage === 'spherex' && (<SPHERExExplorer />)}
        {currentPage === 'planet-x' && (<PlanetXExplorer onNavigate={handleNavigate} />)}
        {currentPage === 'data-centre' && (<NasaDataCentre onNavigate={handleNavigate} />)}
        {(currentPage === 'guide' || currentPage === 'ai-guide') && (<AIGuide onNavigate={handleNavigate} />)}
        {currentPage === 'about' && (<AboutPage />)}
      </main>

      {/* Astronomy Glossary Modal */}
      <AstronomyGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onNavigate={handleNavigate}
        initialTermId={glossaryTermId}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
