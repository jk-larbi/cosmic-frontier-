import type { AppPage } from '../types';

export interface VerifiedQA {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  suggestions: string[];
  links?: Array<{
    label: string;
    page: AppPage;
    reason: string;
  }>;
  scientificReference: string;
}

export const STARTER_QUESTIONS = [
  'What is infrared light?',
  'How does SPHEREx study the universe?',
  'What is Planet X?',
  'How do astronomers discover distant objects?',
  'What is an astronomical unit?',
  'What am I looking at in the SPHEREx Explorer?'
];

export const VERIFIED_KNOWLEDGE_BASE: VerifiedQA[] = [
  {
    id: 'infrared-light',
    keywords: ['infrared', 'light', 'wavelength', 'heat', 'radiation', 'electromagnetic', 'see', 'spectrum'],
    question: 'What is infrared light?',
    answer: `Infrared light is a form of electromagnetic radiation with wavelengths longer than visible red light (ranging from about 0.75 micrometres up to 1,000 micrometres). While human eyes cannot see infrared light, our skin can sense it as radiant heat.

In astronomy, infrared light acts as a cosmic window for three reasons:
1. **Piercing Dust**: Dense interstellar dust clouds easily scatter and block short visible light waves, but longer infrared wavelengths glide straight through, unveiling newborn stars and the cores of dusty galaxies.
2. **Seeing Cool Objects**: Celestial bodies that are too cold to shine with visible light—such as brown dwarfs, cool planets, icy comets, and interstellar dust—radiate energy in the infrared.
3. **Cosmic Time Travel**: Because the universe is expanding, light emitted by the earliest stars and galaxies over 13 billion years ago has been stretched (redshifted) into the infrared spectrum.`,
    suggestions: [
      'How does SPHEREx study the universe?',
      'What am I looking at in the SPHEREx Explorer?',
      'What are interstellar ices?'
    ],
    links: [
      {
        label: 'Explore Infrared Bands in SPHEREx Explorer',
        page: 'spherex',
        reason: 'Compare visible and infrared observations across multiple spectral channels.'
      }
    ],
    scientificReference: 'NASA Astrophysics Division & JPL Infrared Astronomy Fundamentals'
  },
  {
    id: 'spherex-mission',
    keywords: ['spherex', 'study', 'universe', 'mission', 'satellite', 'telescope', 'survey', 'launch', 'channels'],
    question: 'How does SPHEREx study the universe?',
    answer: `SPHEREx stands for **Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer**. It is a NASA space observatory engineered to survey the entire sky in infrared light.

Here is how SPHEREx studies the cosmos:
- **102 Infrared Spectral Channels**: Instead of snapping photos through just a few color filters, SPHEREx divides infrared light from 0.75 to 5.0 micrometres into 102 individual spectral bands. This gives astronomers a unique chemical fingerprint and distance for every surveyed patch of sky.
- **Mapping Hundreds of Millions of Targets**: Every six months, the observatory captures an all-sky 3D map encompassing over 450 million galaxies and 100 million stars in our Milky Way.
- **Three Grand Scientific Questions**:
  1. *Cosmic Inflation*: How did the universe expand exponentially in the first fractions of a second following the Big Bang?
  2. *First Light*: When did the earliest stars and galaxies ignite during the Epoch of Reionization, lighting up the dark universe?
  3. *Origins of Water & Ices*: Where are water ice, carbon dioxide, and organic molecules distributed across interstellar nurseries where new planetary systems form?`,
    suggestions: [
      'What is infrared light?',
      'What am I looking at in the SPHEREx Explorer?',
      'What are interstellar ices?'
    ],
    links: [
      {
        label: 'Open SPHEREx Explorer',
        page: 'spherex',
        reason: 'Inspect simulated and archival infrared observations across 102 channels.'
      }
    ],
    scientificReference: 'NASA/JPL-Caltech SPHEREx Mission Specification (Bock et al.)'
  },
  {
    id: 'planet-x',
    keywords: ['planet x', 'planet nine', 'ninth planet', 'hypothetical', 'brown', 'batygin', 'outer solar system', 'orbit'],
    question: 'What is Planet X?',
    answer: `Planet X (often called **Planet Nine** in contemporary astrophysics) is a **hypothetical, unconfirmed planet** proposed in mathematical models of the distant outer Solar System, hundreds of astronomical units beyond Neptune.

Key facts:
- **Not a Confirmed Planet**: Planet X has **never been observed, photographed, or confirmed** by any telescope. No physical coordinates or direct detections exist.
- **The Gravitational Hypothesis**: In 2016, planetary scientists Konstantin Batygin and Mike Brown noted that several extreme trans-Neptunian objects (eTNOs) share unusually clustered orbits pointing in the same direction and tilted at similar angles. Computer simulations suggest an unseen planet with 5 to 8 times Earth's mass on an eccentric orbit could gravitationally shepherd these bodies.
- **Alternative Explanations**: Scientists also actively research competing hypotheses, such as the collective gravitational pull of a massive ring of small icy debris, or observational selection bias in survey telescope coverage.`,
    suggestions: [
      'How do astronomers discover distant objects?',
      'What is an astronomical unit?',
      'Why haven’t astronomers found Planet X yet?'
    ],
    links: [
      {
        label: 'Open Planet X Explorer',
        page: 'planet-x',
        reason: 'View orbital models of extreme TNOs and examine the clustering evidence.'
      }
    ],
    scientificReference: 'Batygin & Brown (2016, 2021), The Astronomical Journal'
  },
  {
    id: 'discover-distant-objects',
    keywords: ['discover', 'methods', 'astronomers', 'find', 'transit', 'radial', 'astrometry', 'detection', 'telescope'],
    question: 'How do astronomers discover distant objects?',
    answer: `Astronomers employ several observational and mathematical techniques to find objects across our Solar System and beyond:

1. **Shift / Blink Tracking (Solar System)**: Telescopes photograph the exact same patch of sky hours, days, or months apart. Extremely distant stars remain stationary, while orbiting Solar System bodies (like asteroids, comets, or dwarf planets) noticeably shift position.
2. **Gravitational Perturbations**: An unseen massive body pulls gravitationally on neighboring objects. In 1846, Neptune was discovered because its gravity tugged on Uranus. Similarly, the hypothetical Planet X is inferred from the orbital clustering of distant icy objects.
3. **Transit Photometry (Exoplanets)**: When an exoplanet passes directly between its host star and Earth, it dims a tiny fraction of the starlight (a technique used by NASA's Kepler and TESS missions).
4. **Infrared Thermal Imaging**: Cold, distant bodies reflect very little visible sunlight, but they still emit faint thermal radiation. Space telescopes like WISE and SPHEREx can detect these infrared heat signatures.`,
    suggestions: [
      'What is Planet X?',
      'What is an astronomical unit?',
      'How does SPHEREx study the universe?'
    ],
    links: [
      {
        label: 'Investigate Observations in Planet X Explorer',
        page: 'planet-x',
        reason: 'Test your blink-comparison skills on astronomical candidate search fields.'
      }
    ],
    scientificReference: 'NASA Exoplanet Exploration Program & Minor Planet Center'
  },
  {
    id: 'astronomical-unit',
    keywords: ['astronomical unit', 'au', 'distance', 'scale', 'solar system', 'kilometers', 'miles', 'measure'],
    question: 'What is an astronomical unit?',
    answer: `An **Astronomical Unit (AU)** is a fundamental unit of distance used in planetary science to measure vast scales within our Solar System.

- **Definition**: 1 AU equals the average distance between Earth and the Sun—approximately **149.6 million kilometres** (about 93 million miles). Light from the Sun takes roughly 8 minutes and 20 seconds to travel 1 AU.
- **Helpful Solar System Milestones**:
  - Mercury: ~0.39 AU from the Sun
  - Earth: exactly 1 AU
  - Jupiter: ~5.2 AU
  - Neptune (outermost recognized major planet): ~30 AU
  - Pluto: ~39.5 AU on average (ranges between 30 and 49 AU)
  - Sedna (extreme TNO): reaches up to ~937 AU at aphelion
  - Hypothetical Planet X: predicted to orbit between 300 and 600 AU`,
    suggestions: [
      'What is Planet X?',
      'How do astronomers discover distant objects?',
      'How does SPHEREx study the universe?'
    ],
    links: [
      {
        label: 'Compare Orbits in Planet X Explorer',
        page: 'planet-x',
        reason: 'See orbital distances in AU for terrestrial planets, gas giants, and distant eTNOs.'
      }
    ],
    scientificReference: 'International Astronomical Union (IAU Resolution B2)'
  },
  {
    id: 'spherex-explorer-view',
    keywords: ['looking at', 'spherex explorer', 'viewer', 'false color', 'split', 'bands', 'targets', 'palette'],
    question: 'What am I looking at in the SPHEREx Explorer?',
    answer: `In the SPHEREx Explorer, you are inspecting celestial targets (such as stellar nurseries, starburst galaxies, and protoplanetary disks) through multi-wavelength infrared representations.

Here is how to interpret what you see:
- **False-Color Representation**: Because human eyes cannot detect infrared light, telescopes assign visible colors (like blue, green, and red) to specific infrared wavelengths. Blue typically represents hot stars or shorter near-infrared wavelengths, green highlights warm dust and molecular gases, and red/gold reveals cool dust clouds and deep star formation.
- **Spectral Bands**: Selecting different wavelength bands (from 0.75 µm to 5.0 µm) highlights different chemical signatures. For example, Band 3 (3.05 µm) detects water ice absorption, while Band 4 (4.27 µm) reveals frozen carbon dioxide.
- **Scientific Integrity Labels**: Notice the badges on each target. They clearly distinguish **Real Archival Data** (from telescopes such as Spitzer or WISE) from **Illustrative Astronomical Models** and **Synthetic Mission Demonstrations**. A simulated visualization is an educational tool, not a new scientific discovery.`,
    suggestions: [
      'What is infrared light?',
      'How does SPHEREx study the universe?',
      'What are interstellar ices?'
    ],
    links: [
      {
        label: 'Go to SPHEREx Explorer',
        page: 'spherex',
        reason: 'Interact with the multi-spectral slider and inspect infrared bands.'
      }
    ],
    scientificReference: 'Caltech/IPAC SPHEREx Science Communication Office'
  },
  {
    id: 'interstellar-ices',
    keywords: ['ice', 'water', 'ices', 'interstellar', 'co2', 'organic', 'molecules', 'snow line', 'prebiotic'],
    question: 'What are interstellar ices and why are they important?',
    answer: `In deep space, temperatures plunge below -240°C (30 Kelvin). At these extreme temperatures, simple gases such as water (H₂O), carbon dioxide (CO₂), carbon monoxide (CO), and methanol (CH₃OH) freeze solid onto tiny grains of cosmic dust.

These coatings are called **interstellar ices**, and they play three vital roles:
1. **Planetary Seeds**: Icy dust grains stick together much more easily than bare rock, allowing dust to clump into pebbles, comets, asteroids, and eventually planets.
2. **Delivery of Water**: Icy asteroids and comets formed beyond the "snow line" collided with the early Earth, delivering much of our planet's surface water.
3. **Prebiotic Chemistry**: When irradiated by cosmic rays and ultraviolet starlight, interstellar ices undergo chemical reactions that generate complex organic molecules and the building blocks of biology.

SPHEREx will map the distribution of water and biogenic ices across thousands of Milky Way clouds to help scientists understand where habitable planetary ingredients originate.`,
    suggestions: [
      'How does SPHEREx study the universe?',
      'What am I looking at in the SPHEREx Explorer?',
      'What is infrared light?'
    ],
    links: [
      {
        label: 'View Water Ice Absorption in SPHEREx Explorer',
        page: 'spherex',
        reason: 'Select Band 3 (3.05 µm) to see water ice absorption features in nebulae.'
      }
    ],
    scientificReference: 'Boogert et al. (2015) Annu. Rev. Astron. Astrophys. / SPHEREx Science'
  },
  {
    id: 'distant-galaxies',
    keywords: ['galaxies', 'galaxy', 'distant', 'early', 'reionization', 'universe', 'redshift', 'big bang'],
    question: 'Why do astronomers study distant galaxies?',
    answer: `Because light travels across the vacuum of space at a fixed speed (~300,000 kilometres per second), observing distant objects is literally looking backward through cosmic time.

When astronomers observe a galaxy located 10 billion light-years away, they see it as it existed 10 billion years ago, when the universe was in its energetic infancy.

Studying distant galaxies helps scientists:
- **Trace Galactic Evolution**: Understand how simple clouds of hydrogen and helium collapsed into majestic spiral and elliptical galaxies.
- **Investigate the Epoch of Reionization**: Pinpoint when the first generation of massive stars ionized the surrounding cosmic fog of neutral hydrogen.
- **Probe Dark Matter and Dark Energy**: Map how clusters of galaxies grew over billions of years under the pull of dark matter and the accelerating push of dark energy.`,
    suggestions: [
      'How does SPHEREx study the universe?',
      'What is infrared light?',
      'What is an astronomical unit?'
    ],
    links: [
      {
        label: 'Inspect Galaxy Targets in SPHEREx Explorer',
        page: 'spherex',
        reason: 'Examine distant galaxy spectra and infrared signatures.'
      }
    ],
    scientificReference: 'NASA Cosmic Origins Program & Hubble/JWST Science Briefings'
  },
  {
    id: 'why-not-found-planet-x',
    keywords: ['why', 'found', 'seen', 'telescope', 'search', 'haven\'t', 'rubin', 'wise', 'difficult'],
    question: 'Why haven’t astronomers found Planet X yet if it exists?',
    answer: `Searching for Planet X is one of the most formidable observational challenges in contemporary astronomy:

1. **Extreme Faintness & Distance**: At 400 to 600 AU, sunlight diminishes with the inverse-square law on its way out, and reflected light dims by another inverse-square factor returning to Earth (diminishing with the 4th power of distance, 1/r⁴). Planet X would be over 160,000 times fainter than Pluto!
2. **Massive Search Strip**: While orbital physics predicts its orbital path, scientists do not know its exact position along its ~10,000-year orbit. Searching that elliptical corridor requires scanning millions of background stars.
3. **Slow Apparent Movement**: Because it is so distant, it moves across our night sky at only a fraction of an arcsecond each year, requiring comparisons between images taken months or years apart.

NASA's WISE survey ruled out Saturn- or Jupiter-sized gas giants in the outer Solar System, but a Neptune- or Earth-mass planet could easily elude detection until next-generation surveys like the Vera C. Rubin Observatory complete comprehensive all-sky scans.`,
    suggestions: [
      'What is Planet X?',
      'How do astronomers discover distant objects?',
      'What is an astronomical unit?'
    ],
    links: [
      {
        label: 'Explore Planet X Evidence',
        page: 'planet-x',
        reason: 'Review the observational limits and survey constraints.'
      }
    ],
    scientificReference: 'Luhman (2014) WISE Constraints & Batygin et al. (2021)'
  }
];

export function findVerifiedAnswer(query: string): VerifiedQA | null {
  if (!query || typeof query !== 'string') return null;
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Exact or partial question match
  for (const item of VERIFIED_KNOWLEDGE_BASE) {
    if (normalized.includes(item.question.toLowerCase().slice(0, 22))) {
      return item;
    }
  }

  // 2. Keyword score matching
  let bestItem: VerifiedQA | null = null;
  let highestScore = 0;

  for (const item of VERIFIED_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        const weight = kw.includes(' ') ? 8 : (kw.length > 5 ? 4 : 2);
        score += weight;
      }
    }
    // High-priority subject boosts
    if (item.id === 'planet-x' && (normalized.includes('planet x') || normalized.includes('planet nine'))) {
      score += 15;
    }
    if (item.id === 'spherex-mission' && normalized.includes('spherex')) {
      score += 15;
    }
    if (item.id === 'infrared-light' && normalized.includes('infrared')) {
      score += 12;
    }
    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }

  return highestScore >= 2 ? bestItem : null;
}
