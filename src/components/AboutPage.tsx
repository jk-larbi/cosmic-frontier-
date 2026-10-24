import type { FC } from 'react';
import { 
  Telescope, 
  Orbit, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

export const AboutPage: FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      {/* 1. HERO HEADER */}
      <div className="space-y-4 pb-8 border-b border-[#1E293B]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>NASA Space Apps Challenge 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
          About COSMIC FRONTIER
        </h1>
        <p className="text-base sm:text-lg text-[#A7B4CC] leading-relaxed max-w-3xl">
          COSMIC FRONTIER is an interactive astronomy platform built to bridge the gap between complex space-science datasets and curious learners worldwide.
        </p>
      </div>

      {/* 2. THE SPHEREx MISSION DEEP DIVE */}
      <section className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
            <Telescope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
              NASA Astrophysics Surveyor
            </span>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              NASA’s SPHEREx Mission
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#A7B4CC] leading-relaxed">
          <strong>SPHEREx</strong> stands for the <em>Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer</em>. Managed by NASA's Jet Propulsion Laboratory (JPL) and Caltech, SPHEREx is an astrophysics observatory designed to map the entire sky every six months in 102 individual near-infrared colors spanning from 0.75 µm to 5.0 µm.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <span className="text-xs font-mono font-bold text-[#38BDF8] block">Pillar I</span>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Cosmic Inflation</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              By measuring 3D positions of 450 million galaxies, SPHEREx tests models of non-Gaussianity and quantum fluctuations that occurred in the first 10⁻³² seconds of cosmic expansion.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <span className="text-xs font-mono font-bold text-[#8B5CF6] block">Pillar II</span>
            <h3 className="text-base font-semibold text-[#F8FAFC]">First Stars & Galaxies</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              SPHEREx measures spatial power spectra of the Cosmic Infrared Background (CIB) to detect the collective glow of the first generation of stars that ended the cosmic Dark Ages.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <span className="text-xs font-mono font-bold text-[#F5C451] block">Pillar III</span>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Origins of Water</h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              By measuring interstellar ice absorption bands (H₂O at 3.05 µm, CO₂ at 4.27 µm, CO at 4.67 µm) in millions of stellar nurseries, SPHEREx determines where water is delivered to planetary systems.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-[#A7B4CC] border-t border-[#1E293B]">
          <span>Official Mission Portal:</span>
          <a
            href="https://spherex.caltech.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#38BDF8] hover:underline inline-flex items-center gap-1"
          >
            <span>spherex.caltech.edu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 3. THE PLANET X HYPOTHESIS OVERVIEW */}
      <section className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
              Outer Solar System Mechanics
            </span>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              The Planet X / Planet Nine Hypothesis
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#A7B4CC] leading-relaxed">
          The search for an unseen planet beyond Neptune has a storied history in astronomy:
        </p>

        <div className="space-y-4 text-xs sm:text-sm text-[#A7B4CC]">
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <h4 className="font-bold text-[#F8FAFC]">Historical Context (Percival Lowell & Clyde Tombaugh)</h4>
            <p className="text-xs leading-relaxed">
              In the early 20th century, Percival Lowell searched for "Planet X" to explain perceived discrepancies in Uranus’s orbit. In 1930, Clyde Tombaugh discovered Pluto near Lowell’s predicted location. However, Pluto was far too small to influence Uranus. In 1989, data from the Voyager 2 flyby revealed that Neptune’s mass had been overestimated by 0.5%, completely resolving the anomalies and disproving the original historical Planet X hypothesis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
            <h4 className="font-bold text-[#F8FAFC]">The Modern Hypothesis (Batygin & Brown, 2016–Present)</h4>
            <p className="text-xs leading-relaxed">
              The modern "Planet Nine" hypothesis arose not from discrepancies in known planets, but from the anomalous orbital grouping of distant Extreme Trans-Neptunian Objects (eTNOs). In 2014, Chad Trujillo and Scott Sheppard reported that detached bodies like Sedna and 2012 VP113 shared an aligned argument of perihelion. In 2016, Caltech researchers Konstantin Batygin and Mike Brown demonstrated through extensive numerical simulations that a 5–10 Earth-mass planet on an eccentric, inclined orbit (~400 AU) would naturally shepherd these distant icy worlds into their observed configurations.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SCIENTIFIC INTEGRITY MANIFESTO */}
      <section className="rounded-2xl bg-linear-to-r from-[#0B1630] to-[#0E1B38] border border-[#F5C451]/30 p-8 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5C451] font-bold">
              Core Principle
            </span>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              Scientific Integrity & Transparency
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#A7B4CC] leading-relaxed">
          At COSMIC FRONTIER, scientific honesty is paramount. We adhere to strict guidelines:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#A7B4CC]">
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F8FAFC] block">Calibrated Illustrative Models:</strong>
              <span>SPHEREx visualizations are explicitly identified as simulated models based on NASA Spitzer, WISE, and 2MASS datasets, never fabricated live observations.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F8FAFC] block">Unconfirmed Status of Planet X:</strong>
              <span>Planet X is consistently labeled as a hypothetical proposal. No estimated parameter is presented as established fact.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#F5C451] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F8FAFC] block">Verified Educational Grounding:</strong>
              <span>Our AI Space Guide references peer-reviewed astrophysics literature, clearly communicating uncertainties and alternative theories.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F8FAFC] block">3D Visual Scaling Transparency:</strong>
              <span>Our 3D Universe Explorer clearly informs users when Presentation Scale is active (normalizing distances for interactive viewing) versus Astronomical Scale (linear relative AU distances).</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F8FAFC] block">Accessible Language:</strong>
              <span>We avoid misleading hype, jargon, and opaque claims, ensuring learners of all backgrounds can explore space with confidence.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DATA SOURCES & ACKNOWLEDGMENTS */}
      <section className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-4">
        <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#38BDF8]" />
          <span>Data Sources & Literature Citations</span>
        </h3>

        <ul className="space-y-3 text-xs text-[#A7B4CC] leading-relaxed">
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">NASA Jet Propulsion Laboratory & Caltech:</strong> SPHEREx Mission White Papers and Science Requirements (Bock et al., 2018).
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">The Astronomical Journal:</strong> Batygin, K., & Brown, M. E. (2016, 2021). <em>Evidence for a Distant Giant Planet in the Solar System</em> & <em>The Orbit of Planet Nine</em>.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">Nature:</strong> Trujillo, C. A., & Sheppard, S. S. (2014). <em>A Sedna-like body with a perihelion of 80 astronomical units</em>.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">International Astronomical Union (IAU) Minor Planet Center:</strong> Ephemerides and orbital elements for Sedna, 2012 VP113, and Leleākūhonua.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">NASA Exoplanet Archive (Caltech/IPAC):</strong> Table Access Protocol (TAP) ADQL queries for confirmed exoplanet physical and stellar parameters.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">NASA/JPL Solar System Dynamics:</strong> Horizons ephemerides and Small-Body Database (SBDB) astrometric Keplerian orbital elements and radar cross-sections.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">CDS SIMBAD & NASA/IPAC NED:</strong> Astronomical database for identification of stellar benchmarks and extragalactic redshift distance matrices.
          </li>
          <li className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
            <strong className="text-[#F8FAFC]">NASA Infrared Processing and Analysis Center (IPAC):</strong> Infrared astronomical data archives from WISE, Spitzer, and Herschel.
          </li>
        </ul>
      </section>
    </div>
  );
};

