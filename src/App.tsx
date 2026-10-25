import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
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

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

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
      targetHash = queryString ? `ai-guide?${queryString}` : 'ai-guide';
    } else if (clean === 'live-space') {
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
      if (window.location.hash) {
        window.location.hash = '';
      }
      if (window.location.pathname !== homeUrl && window.history?.pushState) {
        window.history.pushState(null, '', homeUrl);
      }
    } else if (targetHash) {
      window.location.hash = targetHash;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      const rawHash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
      const fullCandidate = (rawHash || rawPath).toLowerCase();
      const [candidate, queryString] = fullCandidate.split('?');

      if (candidate === 'motion' || candidate === 'asteroid-motion' || candidate === 'orbit') {
        setCurrentPage('asteroid-watch');
        if (!window.location.hash.includes('mode=motion')) {
          const extraQuery = queryString ? `&${queryString}` : '';
          window.location.hash = `asteroid-watch?mode=motion${extraQuery}`;
        }
      } else if (candidate === 'live-space') {
        setCurrentPage('mission-control');
        window.location.hash = 'mission-control';
      } else if (candidate === 'ai-guide' || candidate === 'guide') {
        setCurrentPage('ai-guide');
      } else if (candidate === 'spherex' || candidate === 'image-lab' || candidate === 'sphere-x') {
        setCurrentPage('spherex');
      } else if (candidate === 'planet-x' || candidate === 'planetx') {
        setCurrentPage('planet-x');
      } else if (candidate === 'data-centre' || candidate === 'data-center') {
        setCurrentPage('data-centre');
      } else if (candidate === 'asteroids' || candidate === 'asteroid-watch') {
        setCurrentPage('asteroid-watch');
      } else if (candidate === 'exoplanet' || candidate === 'exoplanets') {
        setCurrentPage('exoplanets');
      } else if (candidate === 'galaxy' || candidate === 'galaxies') {
        setCurrentPage('galaxies');
      } else if (candidate === 'home' || !candidate) {
        setCurrentPage('home');
      } else if (['mission-control', 'observatory', 'universe', 'about'].includes(candidate)) {
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
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        <div key={currentPage} className="animate-page-enter">
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'mission-control' && (
            <MissionControlDashboard onNavigate={handleNavigate} />
          )}
          {currentPage === 'observatory' && <LiveCosmicObservatory onNavigate={handleNavigate} />}
          {currentPage === 'universe' && <Universe3DExplorer onNavigate={handleNavigate} />}
          {(currentPage === 'asteroid-watch' || (currentPage as string) === 'motion' || (currentPage as string) === 'asteroid-motion') && (
            <AsteroidWatch onNavigate={handleNavigate} />
          )}
          {currentPage === 'exoplanets' && <ExoplanetDiscoveryLab onNavigate={handleNavigate} />}
          {currentPage === 'galaxies' && <GalaxyExplorer onNavigate={handleNavigate} />}
          {currentPage === 'spherex' && <SPHERExExplorer />}
          {currentPage === 'planet-x' && <PlanetXExplorer onNavigate={handleNavigate} />}
          {(currentPage === 'data-centre' || (currentPage as string) === 'data-center') && (
            <NasaDataCentre onNavigate={handleNavigate} />
          )}
          {(currentPage === 'guide' || currentPage === 'ai-guide') && (
            <AIGuide onNavigate={handleNavigate} />
          )}
          {currentPage === 'about' && <AboutPage />}
          {/* Universal safe fallback: if anything unknown ever slips through, render HomePage */}
          {!['home', 'mission-control', 'observatory', 'universe', 'asteroid-watch', 'motion', 'asteroid-motion', 'exoplanets', 'galaxies', 'spherex', 'planet-x', 'data-centre', 'data-center', 'guide', 'ai-guide', 'about'].includes(currentPage) && (
            <HomePage onNavigate={handleNavigate} />
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
