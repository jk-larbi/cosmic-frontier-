import { useState, useEffect } from 'react';
import type { AppPage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { SPHERExExplorer } from './components/SPHERExExplorer';
import { PlanetXExplorer } from './components/PlanetXExplorer';
import { AIGuide } from './components/AIGuide';
import { AboutPage } from './components/AboutPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Handle URL hash routing or direct navigation
  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser hash on initial load and hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppPage;
      if (['home', 'spherex', 'planet-x', 'guide', 'about'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050B1A] text-[#F8FAFC] selection:bg-[#38BDF8]/20 selection:text-[#38BDF8]">
      {/* Global Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'spherex' && <SPHERExExplorer />}
        {currentPage === 'planet-x' && <PlanetXExplorer />}
        {currentPage === 'guide' && <AIGuide />}
        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
