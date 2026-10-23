export interface VerifiedQA {
  keywords: string[];
  question: string;
  answer: string;
  suggestions: string[];
  scientificReference: string;
}

export const VERIFIED_KNOWLEDGE_BASE: VerifiedQA[] = [
  {
    keywords: ['infrared', 'light', 'wavelength', 'heat', 'radiation', 'see'],
    question: 'What is infrared light and why do astronomers use it?',
    answer: 'Infrared light is a form of electromagnetic radiation with wavelengths longer than visible red light (ranging from about 0.75 micrometers up to 1,000 micrometers). While human eyes cannot see infrared light, we can feel it as radiant heat.\n\nAstronomers rely on infrared light for three primary reasons:\n1. Penetrating Cosmic Dust: Tiny cosmic dust particles easily scatter and block short visible light waves, but longer infrared waves glide straight through dense interstellar clouds, unveiling newborn stars and hidden galactic centers.\n2. Seeing Cold Objects: Objects too cold to shine with visible light (such as interstellar gas clouds, brown dwarfs, cold planets, and icy asteroid belts) glow brightly at infrared temperatures.\n3. Peering Back in Time: Because our universe is expanding, light emitted by the very first galaxies over 13 billion years ago has been stretched (redshifted) from ultraviolet and optical wavelengths directly into the near-infrared spectrum.',
    suggestions: [
      'What is the SPHEREx mission?',
      'Why do scientists study distant galaxies?',
      'What am I seeing in the infrared viewer?'
    ],
    scientificReference: 'NASA Astrophysics Division / JPL-Caltech Infrared Astronomy Fundamentals'
  },
  {
    keywords: ['spherex', 'mission', 'satellite', 'telescope', 'colors', 'survey', 'launch'],
    question: 'What is NASA’s SPHEREx mission and what makes it special?',
    answer: 'SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) is a NASA Medium-Class Explorer (MIDEX) astrophysics satellite designed to map the entire sky in 102 individual infrared wavelength bands between 0.75 and 5.0 micrometers.\n\nUnlike traditional space cameras that take images through 3 or 4 wide color filters, SPHEREx is a spectroscopic surveyor. Every 6 months, it collects a complete 3D color map of over 450 million galaxies and 100 million stars in our Milky Way.\n\nSPHEREx tackles three grand scientific questions:\n1. Inflation: What cosmic physics shaped the universe in the first split-second after the Big Bang?\n2. First Light: When did the earliest stars and galaxies ignite and end the cosmic Dark Ages?\n3. Origins of Water: Where did the water and biogenic ices in planetary systems come from?',
    suggestions: [
      'What is infrared light and why do astronomers use it?',
      'What are interstellar ices?',
      'How does SPHEREx detect water in space?'
    ],
    scientificReference: 'NASA/JPL-Caltech SPHEREx Mission Science Specification (Bock et al.)'
  },
  {
    keywords: ['planet x', 'planet nine', 'ninth planet', 'hypothetical', 'brown', 'batygin'],
    question: 'What is Planet X (or Planet Nine)?',
    answer: 'Planet X—often referred to in modern astrophysics as "Planet Nine"—is a hypothetical large planet proposed to orbit in the far outer reaches of our Solar System, hundreds of astronomical units (AU) beyond Neptune.\n\nCrucial Scientific Fact: Planet X has NOT been discovered or confirmed. No telescope has taken a picture of it. It remains a mathematical and gravitational hypothesis formulated by Caltech planetary scientists Konstantin Batygin and Mike Brown in 2016.\n\nIts existence is inferred because a collection of extreme trans-Neptunian objects (eTNOs) share unusual orbital alignments that point in the same direction and tilt into the same plane. Computer simulations suggest an unseen planet with 5 to 8 times the mass of Earth on an eccentric orbit (~400 AU) could gravitationally herd these distant icy bodies into their current orbits.',
    suggestions: [
      'Why haven’t astronomers found Planet X yet?',
      'What is an extreme trans-Neptunian object?',
      'How do scientists discover distant planets?'
    ],
    scientificReference: 'Batygin & Brown (2016, 2021), The Astronomical Journal'
  },
  {
    keywords: ['why', 'found', 'seen', 'telescope', 'search', 'haven\'t', 'rubin', 'wise'],
    question: 'Why haven’t astronomers found Planet X yet if it exists?',
    answer: 'Finding Planet X is an immense observational challenge for several physical reasons:\n\n1. Extreme Distance & Faintness: At 400 to 600 AU, sunlight is diluted by the inverse-square law going out, and reflected light is diluted again returning to Earth (diminishing with the 4th power of distance, 1/r⁴). Planet X would be over 160,000 times fainter than Pluto!\n2. Immense Sky Area: While orbital dynamics predict its orbital trajectory, we do not know its exact position along its 8,000-year loop. Searching this strip requires surveying millions of stars.\n3. Slow Apparent Motion: Because it moves so slowly across the celestial sphere (only a fraction of an arcsecond per year), detecting its movement against the dense backdrop of Milky Way stars requires multi-epoch comparisons taken months apart.\n\nNASA’s WISE telescope ruled out giant gas planets (like Jupiter or Saturn) in the outer solar system, but a cooler, rocky/gaseous Super-Earth could easily remain undetected until powerful wide-field facilities like the Vera C. Rubin Observatory scan the sky.',
    suggestions: [
      'What is Planet X (or Planet Nine)?',
      'How do scientists discover distant planets?',
      'What are the alternative hypotheses for Planet X?'
    ],
    scientificReference: 'Luhman (2014) WISE Survey Constraints / Sheppard et al.'
  },
  {
    keywords: ['discover', 'methods', 'planets', 'transit', 'radial', 'astrometry', 'direct'],
    question: 'How do scientists discover new planets?',
    answer: 'Astronomers use several ingenious techniques to find planets:\n\n1. Optical Survey Tracking (Solar System): For bodies orbiting our Sun (like asteroids, Pluto, and eTNOs), telescopes take multiple photographs of the same patch of sky hours or days apart. Stars stay fixed, while orbiting solar system bodies shift positions (apparent parallax motion).\n2. Transit Method (Exoplanets): When an exoplanet passes directly in front of its host star, it blocks a tiny fraction of starlight (used by NASA’s Kepler and TESS missions).\n3. Radial Velocity / Wobble Method: A planet’s gravity pulls gently on its star, causing the star to wobble slightly toward and away from Earth, shifting the star’s spectral lines via the Doppler effect.\n4. Gravitational Perturbation: Like the mathematical discovery of Neptune in 1846 from anomalies in Uranus’s orbit, scientists detect unseen planets by observing unexpected gravitational tugs on known bodies.\n5. Direct Infrared Imaging: Giant, hot, young planets can occasionally be photographed directly in the infrared if they are sufficiently far from their blinding parent stars.',
    suggestions: [
      'What is an extreme trans-Neptunian object?',
      'What is infrared light and why do astronomers use it?',
      'What is Planet X (or Planet Nine)?'
    ],
    scientificReference: 'NASA Exoplanet Exploration Program & Minor Planet Center Standards'
  },
  {
    keywords: ['image', 'seeing', 'viewer', 'false color', 'bands', 'palette'],
    question: 'What am I seeing in the SPHEREx Explorer infrared viewer?',
    answer: 'In the SPHEREx Explorer, you are viewing multi-spectral infrared visualizations of real astronomical targets (such as stellar nurseries, starburst galaxies, and protoplanetary disks).\n\nKey elements to understand:\n• False-Color Palettes: Since human eyes cannot see infrared light, scientists map different infrared wavelengths to visible colors (e.g. mapping 1 µm to blue, 3 µm to green, and 4.5 µm to red or gold). This makes physical temperatures, gas emissions, and dust clouds visually distinguishable.\n• Wavelength Bands: Selecting different bands reveals different chemistry. For example, Band 3 (3.05 µm) highlights water ice absorption on cold dust, while Band 4 (4.27 µm) reveals frozen carbon dioxide.\n• Optical vs. Infrared Comparison: Using the split slider, you can observe how opaque dust clouds that look dark in visible light become transparent in infrared, revealing embedded protostars inside.',
    suggestions: [
      'What are interstellar ices?',
      'What is the SPHEREx mission?',
      'What is infrared light and why do astronomers use it?'
    ],
    scientificReference: 'Caltech/IPAC Astronomical Data Center & SPHEREx Education Office'
  },
  {
    keywords: ['distant', 'galaxies', 'galaxy', 'study', 'redshift', 'big bang', 'origins', 'universe'],
    question: 'Why do scientists study distant galaxies?',
    answer: 'Because light travels at a finite speed (approximately 300,000 kilometers per second), looking out into deep space is literally looking backward in time.\n\nWhen astronomers observe a galaxy 10 billion light-years away, they see it not as it is today, but as it was 10 billion years ago when the universe was in its energetic youth.\n\nStudying distant galaxies allows scientists to:\n• Trace Cosmic Evolution: Understand how the chaotic early universe built spiral galaxies like our Milky Way.\n• Test the Big Bang & Dark Energy: Measure the expansion rate of space and map the invisible scaffolding of dark matter.\n• Investigate the Epoch of Reionization: Learn when the first stars created the first heavy elements (carbon, oxygen, iron) that make life possible.',
    suggestions: [
      'What is the SPHEREx mission?',
      'What is infrared light and why do astronomers use it?',
      'How do scientists discover distant planets?'
    ],
    scientificReference: 'NASA Cosmic Origins Program & Hubble/JWST Deep Field Science'
  },
  {
    keywords: ['etno', 'trans-neptunian', 'sedna', 'sednoid', 'kuiper', 'detached'],
    question: 'What is an extreme trans-Neptunian object (eTNO)?',
    answer: 'An Extreme Trans-Neptunian Object (eTNO) is a minor icy planet orbiting the Sun at tremendous distances beyond Neptune, with a semi-major axis greater than 150 AU and a perihelion (closest approach) well outside Neptune’s gravitational reach (greater than 30 AU).\n\nFamous examples include:\n• 90377 Sedna: Discovered in 2003, Sedna has an orbital period of over 11,400 years and never comes closer than 76 AU to the Sun.\n• 2012 VP113: Discovered in 2012 with a perihelion of 80.5 AU.\n• Leleākūhonua (2015 TG387): Travels outward to over 2,100 AU.\n\nThese objects are scientifically critical because their orbits cannot be explained by interactions with Neptune alone. Their unusual grouping in space is the primary observational clue supporting the Planet X hypothesis.',
    suggestions: [
      'What is Planet X (or Planet Nine)?',
      'Why haven’t astronomers found Planet X yet?',
      'What are the alternative hypotheses for Planet X?'
    ],
    scientificReference: 'Minor Planet Center (MPC) & Trujillo & Sheppard (2014) Nature'
  },
  {
    keywords: ['ice', 'water', 'ices', 'interstellar', 'co2', 'organic', 'molecules', 'snow line'],
    question: 'What are interstellar ices and why do they matter for life?',
    answer: 'In the frigid depths of interstellar space (where temperatures plunge below -240°C / 30 Kelvin), water (H₂O), carbon dioxide (CO₂), carbon monoxide (CO), and methanol (CH₃OH) freeze onto the surfaces of microscopic silicate and carbon dust grains.\n\nThese frozen coatings are called interstellar ices, and they are critical for planetary science:\n1. Planet Building: Icy dust grains are "sticky" compared to bare rock, allowing them to clump together into pebbles, boulders, comets, and eventually planets.\n2. Reservoirs of Water: Comets and asteroids formed beyond the "snow line" delivered oceans of water and organic molecules to the young dry Earth through ancient impacts.\n3. Prebiotic Chemistry: When exposed to cosmic rays and ultraviolet light, simple ices synthesize amino acids, sugars, and the complex organic building blocks of biology.\n\nSPHEREx is the first telescope that will survey ices across millions of star-forming regions in our entire Milky Way galaxy.',
    suggestions: [
      'What is the SPHEREx mission?',
      'What is infrared light and why do astronomers use it?',
      'What am I seeing in the infrared viewer?'
    ],
    scientificReference: 'Boogert et al. (2015) Annu. Rev. Astron. Astrophys. / SPHEREx Science White Paper'
  }
];

export function findVerifiedAnswer(query: string): VerifiedQA | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Direct or partial question match
  for (const item of VERIFIED_KNOWLEDGE_BASE) {
    if (normalized.includes(item.question.toLowerCase().slice(0, 20))) {
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
        score += kw.length > 4 ? 3 : 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }

  return highestScore >= 2 ? bestItem : null;
}

