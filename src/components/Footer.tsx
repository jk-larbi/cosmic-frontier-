import type { FC } from 'react';
import type { AppPage } from '../types';
import { Telescope, Orbit, Sparkles, Compass, ShieldAlert, ExternalLink, Database, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
}

export const Footer: FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#050B1A] border-t border-[#1E293B] text-[#A7B4CC] text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B1630] border border-[#38BDF8]/40 flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <span className="font-bold text-base text-[#F8FAFC] font-mono tracking-wider">
                COSMIC FRONTIER
              </span>
            </div>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              An interactive astronomy platform built for NASA Space Apps Challenge 2026. Empowering learners to explore infrared astrophysics and outer solar system mysteries.
            </p>
            <div className="pt-1 text-[11px] text-[#A7B4CC]/80">
              Tagline: <span className="text-[#38BDF8] font-medium">Explore the Universe. Discover the Unknown.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-4">
              Exploration Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('mission-control')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Mission Control Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('observatory')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Telescope className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Live Cosmic Observatory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('universe')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>3D Interactive Solar System</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('exoplanets')}
                  className="hover:text-[#8B5CF6] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Exoplanet Discovery Lab</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('galaxies')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Deep-Sky Galaxy Explorer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('spherex')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Telescope className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>SPHEREx Explorer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('asteroid-watch')}
                  className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Orbit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Near-Earth Asteroid Watch</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('planet-x')}
                  className="hover:text-[#8B5CF6] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Orbit className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Planet X Investigation Lab</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('data-centre')}
                  className="hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>NASA Astronomical Data Centre</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-guide')}
                  className="hover:text-[#F5C451] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5C451]" />
                  <span>COSMIC AI GUIDE</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  About & Science Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Scientific Transparency Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F5C451]" />
              <span>Scientific Data Notice</span>
            </h4>
            <p className="text-xs text-[#A7B4CC] leading-relaxed mb-2">
              All astronomical representations distinguish strictly between verified observation and hypothesis:
            </p>
            <ul className="text-[11px] space-y-1.5 text-[#A7B4CC]">
              <li className="flex items-start gap-1">
                <span className="text-[#38BDF8]">•</span>
                <span>SPHEREx views represent calibrated spectroscopic models based on NASA survey analogs.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-[#8B5CF6]">•</span>
                <span>Planet X is a mathematical hypothesis based on eTNO orbital clustering; it is not visually confirmed.</span>
              </li>
            </ul>
          </div>

          {/* Attribution & Partners */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-4">
              Science Data Attributions
            </h4>
            <ul className="space-y-2 text-xs text-[#A7B4CC]">
              <li>NASA / JPL-Caltech / IPAC (SPHEREx Mission)</li>
              <li>Caltech Planetary Science (Batygin & Brown)</li>
              <li>IAU Minor Planet Center (eTNO Ephemerides)</li>
              <li>NASA WISE / NEOWISE Survey Archives</li>
              <li>ESA & Space Telescope Science Institute (STScI)</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-[#1E293B] text-[11px] text-[#A7B4CC]/70">
              NASA Space Apps Challenge 2026 Project
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A7B4CC]/80 gap-4">
          <p>© 2026 COSMIC FRONTIER. Developed for educational astronomy & open science outreach.</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('about')}
              className="hover:text-[#38BDF8] transition-colors"
            >
              Methodology & Integrity
            </button>
            <a 
              href="https://spherex.caltech.edu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#38BDF8] inline-flex items-center gap-1 transition-colors"
            >
              <span>NASA SPHEREx Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

