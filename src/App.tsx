import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
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

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('mission-control');

  // Handle URL hash routing or direct navigation
  const handleNavigate = (page: AppPage) => {
    let targetPage: AppPage = page;
    if (page === 'guide' || page === 'ai-guide') {
      targetPage = 'ai-guide';
    } else if (page === 'home' || page === 'mission-control' || (page as string) === 'live-space') {
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
      const fullCandidate = (rawHash || rawPath).toLowerCase();
      const candidate = fullCandidate.split('?')[0];

      if (candidate === 'live-space') {
        setCurrentPage('mission-control');
        window.location.hash = 'mission-control';
      } else if (candidate === 'ai-guide' || candidate === 'guide') {
        setCurrentPage('ai-guide');
      } else if (candidate === 'spherex' || candidate === 'image-lab') {
        setCurrentPage('spherex');
      } else if (candidate === 'mission-control' || candidate === 'home' || !candidate) {
        setCurrentPage('mission-control');
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
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {(currentPage === 'mission-control' || currentPage === 'home') && (
          <MissionControlDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === 'observatory' && <LiveCosmicObservatory onNavigate={handleNavigate} />}
        {currentPage === 'universe' && <Universe3DExplorer onNavigate={handleNavigate} />}
        {currentPage === 'asteroid-watch' && <AsteroidWatch onNavigate={handleNavigate} />}
        {currentPage === 'exoplanets' && <ExoplanetDiscoveryLab onNavigate={handleNavigate} />}
        {currentPage === 'galaxies' && <GalaxyExplorer onNavigate={handleNavigate} />}
        {currentPage === 'spherex' && <SPHERExExplorer />}
        {currentPage === 'planet-x' && <PlanetXExplorer onNavigate={handleNavigate} />}
        {currentPage === 'data-centre' && <NasaDataCentre onNavigate={handleNavigate} />}
        {(currentPage === 'guide' || currentPage === 'ai-guide') && (
          <AIGuide onNavigate={handleNavigate} />
        )}
        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
