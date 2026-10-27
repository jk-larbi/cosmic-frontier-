import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
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
  const handleNavigate = (page: AppPage | string) => {
    const [rawPage, queryString] = (page as string).split('?');
    const clean = rawPage.toLowerCase().trim();

    let targetPage: AppPage = 'home';
    let targetHash = '';

    if (clean === 'motion' || clean === 'asteroid-motion' || clean === 'orbit') {
      targetPage = 'asteroid-watch';
      targetHash = queryString ? `asteroid-watch?mode=motion&${queryString}` : 'asteroid-watch?mode=motion';
    } else if (clean === 'guide' || clean === 'ai-guide') {
      targetPage = 'ai-guide';
    } else if (page === 'home') {
      targetPage = 'home';
    } else if (page === 'mission-control' || (page as string) === 'live-space') {
      targetPage = 'mission-control';
      targetHash = queryString ? `mission-control?${queryString}` : 'mission-control';
    } else if (clean === 'spherex' || clean === 'image-lab' || clean === 'sphere-x') {
      targetPage = 'spherex';
      targetHash = queryString ? `spherex?${queryString}` : 'spherex';
    } else if (clean === 'planet-x' || clean === 'planetx') {
      targetPage = 'planet-x';
      targetHash = queryString ? `planet-x?${queryString}` : 'planet-x';
    } else if (clean === 'data-centre' || clean === 'data-center') {
      targetPage = 'data-centre';
      targetHash = queryString ? `data-centre?${queryString}` : 'data-centre';
    } else if (clean === 'radar' || clean === 'deep-space-radar') {
      targetPage = 'home';
      targetHash = 'deep-space-radar';
      setTimeout(() => {
        const el = document.getElementById('deep-space-radar');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (clean === 'asteroids' || clean === 'asteroid-watch') {
      targetPage = 'asteroid-watch';
      if (queryString) {
        targetHash = `asteroid-watch?${queryString}`;
      } else if (window.location.hash.startsWith('#asteroid-watch?')) {
        targetHash = window.location.hash.replace(/^#/, '');
      } else {
        targetHash = 'asteroid-watch';
      }
    } else if (clean === 'exoplanet' || clean === 'exoplanets') {
      targetPage = 'exoplanets';
      targetHash = queryString ? `exoplanets?${queryString}` : 'exoplanets';
    } else if (clean === 'galaxy' || clean === 'galaxies') {
      targetPage = 'galaxies';
      targetHash = queryString ? `galaxies?${queryString}` : 'galaxies';
    } else if (clean === 'home' || !clean) {
      targetPage = 'home';
      targetHash = '';
    } else if (['mission-control', 'observatory', 'universe', 'about'].includes(clean)) {
      targetPage = clean as AppPage;
      targetHash = queryString ? `${clean}?${queryString}` : clean;
    } else {
      targetPage = 'home';
      targetHash = '';
    }

    setCurrentPage(targetPage);

    if (targetPage === 'home') {
      const homeUrl = import.meta.env.BASE_URL || '/';
      if (targetHash === 'deep-space-radar' || targetHash === 'radar') {
        window.location.hash = targetHash;
      } else {
        if (window.location.hash) {
          window.location.hash = '';
        }
        if (window.location.pathname !== homeUrl && window.history?.pushState) {
          window.history.pushState(null, '', homeUrl);
        }
      }
    } else if (targetHash) {
      window.location.hash = targetHash;
    }
    if (targetHash !== 'deep-space-radar' && targetHash !== 'radar') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync with browser hash and path on initial load and hash change
  useEffect(() => {
    const handleLocationChange = () => {
      // Strip base path if present (e.g. /cosmic-frontier-/)
      const baseSegment = (import.meta.env.BASE_URL || '/').replace(/^\/+|\/+$/g, '');
      let rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (baseSegment && (rawPath === baseSegment || rawPath.startsWith(baseSegment + '/'))) {
        rawPath = rawPath.slice(baseSegment.length).replace(/^\/+/, '');
      }

      if (candidate === 'live-space') {
        window.location.hash = 'mission-control';
      } else if (candidate === 'ai-guide' || candidate === 'guide') {
        setCurrentPage('ai-guide');
      } else if (candidate === 'spherex' || candidate === 'image-lab' || candidate === 'sphere-x') {
        setCurrentPage('spherex');
      } else if (candidate === 'mission-control') {
        setCurrentPage('mission-control');
      } else if (candidate === 'deep-space-radar') {
        setCurrentPage('home');
        setTimeout(() => {
          const el = document.getElementById('deep-space-radar') || document.getElementById('radar-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (candidate === 'home' || !candidate) {
        setCurrentPage('home');
      } else if (['observatory', 'universe', 'asteroid-watch', 'exoplanets', 'galaxies', 'planet-x', 'data-centre', 'about'].includes(candidate)) {
        setCurrentPage(candidate as AppPage);
      } else {
        // Fallback for any unknown route/hash to guarantee the app never stays blank
        setCurrentPage('home');
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
      <main className="flex-1">
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
