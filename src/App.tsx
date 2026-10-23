import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Universe3DExplorer } from './components/Universe3DExplorer';
import { ExoplanetDiscoveryLab } from './components/ExoplanetDiscoveryLab';
import { SPHERExExplorer } from './components/SPHERExExplorer';
import { PlanetXExplorer } from './components/PlanetXExplorer';
import { NasaDataCentre } from './components/NasaDataCentre';
import { AIGuide } from './components/AIGuide';
import { AboutPage } from './components/AboutPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Handle URL hash routing or direct navigation
  const handleNavigate = (page: AppPage) => {
    const targetPage = (page === 'guide' || page === 'ai-guide') ? 'ai-guide' : page;
    setCurrentPage(targetPage);
    window.location.hash = targetPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser hash and path on initial load and hash change
  useEffect(() => {
    const handleLocationChange = () => {
      // Strip leading and trailing slashes and hashes
      const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '') as AppPage;
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '') as AppPage;

      const candidate = hash || pathname;
      if (candidate === 'ai-guide' || candidate === 'guide') {
        setCurrentPage('ai-guide');
      } else if (['home', 'universe', 'exoplanets', 'spherex', 'planet-x', 'data-centre', 'about'].includes(candidate)) {
        setCurrentPage(candidate);
      } else if (!candidate) {
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
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'universe' && <Universe3DExplorer onNavigate={handleNavigate} />}
        {currentPage === 'exoplanets' && <ExoplanetDiscoveryLab onNavigate={handleNavigate} />}
        {currentPage === 'spherex' && <SPHERExExplorer />}
        {currentPage === 'planet-x' && <PlanetXExplorer />}
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
