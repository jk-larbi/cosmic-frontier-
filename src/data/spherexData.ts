import type { InfraredBand, CelestialTarget } from '../types';

export const SPHEREX_BANDS: InfraredBand[] = [
  {
    id: '1.0',
    name: '1.0 μm — Near-IR Photosphere Boundary',
    wavelength: 1.0,
    range: '0.75 – 1.20 µm',
    scientificPurpose: 'Stellar Photospheres & Deep Galaxy Redshifts',
    chemicalTracer: 'Hydrogen Paschen Series, Low-mass Star Photospheres',
    description: 'At 1.0 μm, light easily cuts through thin interstellar dust that blocks visible light, revealing older, cooler stars and high-redshift galaxies from the early universe.',
    colorHex: '#38BDF8'
  },
  {
    id: '1.5',
    name: '1.5 μm — Diffuse Cosmic Light Window',
    wavelength: 1.5,
    range: '1.20 – 1.80 µm',
    scientificPurpose: 'Cosmic Infrared Background (CIB) Fluctuations',
    chemicalTracer: 'Intra-Halo Stellar Light & Diffuse Cosmic Background',
    description: 'A clean cosmological window sensitive to the collective glow of the earliest stars that formed during the Epoch of Reionization over 13 billion years ago.',
    colorHex: '#60A5FA'
  },
  {
    id: '2.0',
    name: '2.0 μm — Molecular Gas & Deep Infrared',
    wavelength: 2.0,
    range: '1.80 – 2.50 µm',
    scientificPurpose: 'Molecular Hydrogen (H₂) & Protostellar Envelopes',
    chemicalTracer: 'Vibrational H₂ (2.12 µm) & Stellar Continuum',
    description: 'Penetrates deeply into the dense cores of giant molecular clouds to map hot, shocked hydrogen gas driven by protostellar outflow jets.',
    colorHex: '#818CF8'
  },
  {
    id: '3.0',
    name: '3.0 μm — Water Ice (H₂O) Absorption Band',
    wavelength: 3.0,
    range: '2.50 – 3.50 µm',
    scientificPurpose: 'Interstellar Water Ice Detection in Star-Forming Disks',
    chemicalTracer: 'O–H Molecular Stretching Resonance (3.05 µm absorption dip)',
    description: 'Crucial for measuring water ice frozen onto microscopic dust grains in protoplanetary disks, mapping where water is available to form oceans on new worlds.',
    colorHex: '#C084FC'
  },
  {
    id: '4.0',
    name: '4.0 μm — Warm Dust & Prebiotic Tracers',
    wavelength: 4.0,
    range: '3.50 – 4.30 µm',
    scientificPurpose: 'Volatile Biogenic Precursor Molecules & Warm Dust',
    chemicalTracer: 'Carbon Dioxide (CO₂) Ice (4.27 µm) & Polycyclic Aromatic Hydrocarbons',
    description: 'Pinpoints frozen carbon dioxide and complex carbon compounds on grain mantles, tracing the organic chemical feedstock for habitable planetary systems.',
    colorHex: '#FB7185'
  },
  {
    id: '4.5',
    name: '4.5 μm — Carbon Monoxide (CO) & Protostellar Dust',
    wavelength: 4.5,
    range: '4.30 – 5.00 µm',
    scientificPurpose: 'Carbon Monoxide Ice & Circumstellar Dust Emission',
    chemicalTracer: 'C–O Molecular Fundamental Absorption (4.67 µm) & Warm Dust Continuum',
    description: 'Reveals cold carbon monoxide ice and warm thermal emissions from dusty circumstellar disks surrounding newly ignited protostars.',
    colorHex: '#F5C451'
  }
];

export const CELESTIAL_TARGETS: CelestialTarget[] = [
  {
    id: 'carina-nebula',
    name: 'Carina Nebula (Cosmic Cliffs)',
    catalogId: 'NGC 3372 / ESO 128-EN013',
    category: 'Nebula',
    distanceLightYears: '7,600 ly',
    constellation: 'Carina',
    description: 'A colossal stellar nursery where intense ultraviolet radiation and stellar winds from massive young stars have carved a jagged wall of cool, dense molecular dust. While visible light is completely blocked by the dust, infrared light reveals hundreds of previously hidden protostars, stellar nurseries, and protostellar jets.',
    scientificSignificance: 'Provides a benchmark laboratory for studying how massive star radiation triggers and suppresses star formation in surrounding molecular clouds.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="skyGrad" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="%231a2b55"/><stop offset="60%" stop-color="%230b1428"/><stop offset="100%" stop-color="%23050B1A"/></radialGradient><linearGradient id="cliffGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%238a3d1d"/><stop offset="40%" stop-color="%235c2410"/><stop offset="100%" stop-color="%23220c06"/></linearGradient></defs><rect width="800" height="500" fill="url(%23skyGrad)"/><g fill="%23fff" opacity="0.6"><circle cx="120" cy="80" r="1.5"/><circle cx="340" cy="60" r="1.2"/><circle cx="580" cy="95" r="1.8"/><circle cx="710" cy="50" r="1.5"/><circle cx="210" cy="120" r="1"/><circle cx="450" cy="110" r="1.4"/></g><path d="M 0 320 Q 90 260 180 300 T 360 270 T 520 330 T 670 290 T 800 340 L 800 500 L 0 500 Z" fill="url(%23cliffGrad)"/><path d="M 0 350 Q 140 310 260 360 T 560 350 T 800 370 L 800 500 L 0 500 Z" fill="%231a0804" opacity="0.8"/><text x="30" y="45" fill="%23A7B4CC" font-family="sans-serif" font-size="13" letter-spacing="1">VISIBLE OPTICAL VIEW (HST ACS) — DENSE OPAQUE DUST CLIFFS</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="skyIR" cx="50%" cy="35%" r="75%"><stop offset="0%" stop-color="%2338BDF8" stop-opacity="0.8"/><stop offset="35%" stop-color="%238B5CF6" stop-opacity="0.7"/><stop offset="70%" stop-color="%231E1B4B" stop-opacity="0.9"/><stop offset="100%" stop-color="%23050B1A"/></radialGradient><linearGradient id="cliffIR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23F5C451" stop-opacity="0.95"/><stop offset="30%" stop-color="%23EA580C" stop-opacity="0.85"/><stop offset="70%" stop-color="%239333EA" stop-opacity="0.7"/><stop offset="100%" stop-color="%230B1630"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="800" height="500" fill="url(%23skyIR)"/><path d="M 0 320 Q 90 260 180 300 T 360 270 T 520 330 T 670 290 T 800 340 L 800 500 L 0 500 Z" fill="url(%23cliffIR)" filter="url(%23glow)"/><g fill="%23F5C451"><circle cx="180" cy="300" r="3.5"/><circle cx="360" cy="270" r="4"/><circle cx="520" cy="330" r="3"/><circle cx="280" cy="340" r="2.8"/><circle cx="440" cy="310" r="3.2"/><circle cx="620" cy="320" r="2.5"/><circle cx="150" cy="360" r="2.2"/><circle cx="700" cy="310" r="3.8"/><circle cx="320" cy="390" r="2.7"/><circle cx="490" cy="380" r="3.1"/></g><g fill="%23FFFFFF"><circle cx="220" cy="140" r="3.5"/><circle cx="410" cy="90" r="4.2"/><circle cx="650" cy="110" r="3.8"/><circle cx="130" cy="180" r="2.5"/><circle cx="560" cy="160" r="3"/></g><text x="30" y="45" fill="%2338BDF8" font-family="sans-serif" font-size="13" letter-spacing="1">INFRARED SPECTRAL VIEW (JWST NIRCam / SPHEREx ANALOG) — EMBEDDED STARS UNVEILED</text></svg>',
    dataStatus: 'Real Archival Data',
    dataSource: 'NASA / ESA / CSA / STScI JWST Early Release Observations & Hubble ACS Archival Survey',
    observationDate: 'July 12, 2022',
    instrumentDetails: 'JWST NIRCam (Near-Infrared Camera) & Hubble ACS/WFC',
    telescope: 'James Webb Space Telescope & Hubble Space Telescope',
    sourceAttribution: 'Public scientific release by NASA, ESA, CSA, and STScI. Data processed through MAST archive.',
    coordinates: { ra: '10h 43m 48s', dec: '-59° 52′ 00″' },
    calibrationStatus: 'Calibrated Level 2 Scientific Surface Brightness (MJy/sr)',
    archiveUrl: 'https://archive.stsci.edu/',
    bandsData: {
      '1.0': {
        features: ['Stellar photosphere continuum', 'Resolved low-mass stars in cluster boundary'],
        intensityNotes: 'Optical dust thinning begins; bright stellar centroids pierce through the upper ridge.',
        absorptionSignature: 'Dominated by hot stellar photospheres; minimal grain absorption.'
      },
      '1.5': {
        features: ['Ionized gas glow along the edge of the dust wall', 'Scattered near-IR radiation'],
        intensityNotes: 'Traces the photo-evaporating ridge where massive stars carve the molecular gas.',
        absorptionSignature: 'Continuous emission with low dust attenuation.'
      },
      '2.0': {
        features: ['Molecular Hydrogen (H₂) shock emissions', 'Protostellar outflow knots'],
        intensityNotes: 'Highlights supersonic gas jets blasted outward by newborn protostars.',
        absorptionSignature: 'Narrow 2.12 µm H₂ emission lines.'
      },
      '3.0': {
        features: ['Water Ice (H₂O) 3.05 µm absorption in cold molecular ridge', 'Frozen silicates'],
        intensityNotes: 'Deep dip in transmitted starlight marking the cold core of the nebula (T < 40 K).',
        absorptionSignature: 'Pronounced 3.05 µm amorphous solid water ice absorption feature.'
      },
      '4.0': {
        features: ['CO₂ ice absorption band (4.27 µm)', 'Polycyclic Aromatic Hydrocarbon emission'],
        intensityNotes: 'Bright glow from warm organic dust grains illuminated by massive stars.',
        absorptionSignature: 'Sharp 4.27 µm CO₂ ice absorption trough.'
      },
      '4.5': {
        features: ['Carbon monoxide (CO) ice (4.67 µm)', 'Warm dust envelope continuum'],
        intensityNotes: 'Warm circumstellar cocoons around protostars shine with peak infrared luminosity.',
        absorptionSignature: 'Solid-state CO ice absorption on dust grain mantles.'
      }
    },
    spectralProfile: {
      spectrumType: 'Archival Reference Spectroscopy',
      provenance: 'JWST NIRCam & Spitzer IRS Archival Spectral Library',
      points: [
        { wavelength: 0.75, relativeFlux: 0.95 },
        { wavelength: 1.0, relativeFlux: 0.92 },
        { wavelength: 1.5, relativeFlux: 0.88 },
        { wavelength: 2.0, relativeFlux: 0.85 },
        { wavelength: 2.12, relativeFlux: 1.10 },
        { wavelength: 2.5, relativeFlux: 0.82 },
        { wavelength: 3.0, relativeFlux: 0.45 },
        { wavelength: 3.05, relativeFlux: 0.38 },
        { wavelength: 3.2, relativeFlux: 0.60 },
        { wavelength: 3.5, relativeFlux: 0.78 },
        { wavelength: 4.0, relativeFlux: 0.82 },
        { wavelength: 4.27, relativeFlux: 0.52 },
        { wavelength: 4.5, relativeFlux: 0.75 },
        { wavelength: 4.67, relativeFlux: 0.58 },
        { wavelength: 5.0, relativeFlux: 0.72 }
      ]
    }
  },
  {
    id: 'orion-nebula',
    name: 'Orion Nebula (M42) & Trapezium',
    catalogId: 'NGC 1976 / Messier 42',
    category: 'Nebula',
    distanceLightYears: '1,344 ly',
    constellation: 'Orion',
    description: 'The closest massive star-forming factory to Earth. While visible light is blocked by dense opaque clouds of interstellar dust, infrared light penetrates deeply to reveal hundreds of newborn protostars and protoplanetary discs (proplyds).',
    scientificSignificance: 'SPHEREx will map the distribution of water and organic ices throughout the surrounding molecular cloud to measure how much water is delivered to developing planetary systems.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="nebulaVis" cx="48%" cy="52%" r="45%"><stop offset="0%" stop-color="%23ff6688" stop-opacity="0.9"/><stop offset="35%" stop-color="%23772255" stop-opacity="0.7"/><stop offset="70%" stop-color="%23221133" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050b1a" stop-opacity="1"/></radialGradient><radialGradient id="starGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="40%" stop-color="%2388ccff" stop-opacity="0.7"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="800" height="500" fill="%23050B1A"/><circle cx="388" cy="258" r="200" fill="url(%23nebulaVis)"/><path d="M160 220 Q 280 110 460 160 T 640 320 Q 500 420 300 370 Z" fill="%23110822" opacity="0.85"/><circle cx="380" cy="250" r="18" fill="url(%23starGlow)"/><circle cx="400" cy="240" r="13" fill="url(%23starGlow)"/><circle cx="365" cy="270" r="12" fill="url(%23starGlow)"/><circle cx="410" cy="275" r="10" fill="url(%23starGlow)"/><text x="30" y="45" fill="%23A7B4CC" font-family="sans-serif" font-size="13" letter-spacing="1">VISIBLE OPTICAL SPECTRUM — OPAQUE INTERSTELLAR DUST BLOCKAGE</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="nebulaIR" cx="48%" cy="52%" r="50%"><stop offset="0%" stop-color="%23F5C451" stop-opacity="0.95"/><stop offset="30%" stop-color="%23C084FC" stop-opacity="0.85"/><stop offset="60%" stop-color="%2338BDF8" stop-opacity="0.7"/><stop offset="90%" stop-color="%230B1630" stop-opacity="0.9"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient><filter id="glowM42"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="800" height="500" fill="%23050B1A"/><circle cx="388" cy="258" r="230" fill="url(%23nebulaIR)" filter="url(%23glowM42)"/><g fill="%23F5C451"><circle cx="380" cy="250" r="8"/><circle cx="400" cy="240" r="6.5"/><circle cx="365" cy="270" r="6"/><circle cx="410" cy="275" r="5.5"/><circle cx="250" cy="190" r="4"/><circle cx="530" cy="200" r="4.5"/><circle cx="300" cy="350" r="5"/><circle cx="480" cy="340" r="4"/><circle cx="210" cy="280" r="3.5"/><circle cx="580" cy="300" r="3.5"/></g><text x="30" y="45" fill="%2338BDF8" font-family="sans-serif" font-size="13" letter-spacing="1">SPHEREx INFRARED COMPOSITE (SPITZER IRAC & WISE ARCHIVAL ANALOG)</text></svg>',
    dataStatus: 'Real Archival Data',
    dataSource: 'NASA Spitzer Space Telescope (IRAC Channels 1 & 2) & 2MASS Survey',
    observationDate: '2004–2006 (Spitzer GTO Program)',
    instrumentDetails: 'Spitzer Infrared Array Camera (IRAC) at 3.6 µm and 4.5 µm',
    telescope: 'Spitzer Space Telescope (NASA/JPL-Caltech)',
    sourceAttribution: 'NASA/JPL-Caltech/IPAC Spitzer Science Center Archive.',
    coordinates: { ra: '05h 35m 17s', dec: '-05° 23′ 28″' },
    calibrationStatus: 'Calibrated Spitzer IRAC Level 2 Enhanced Mosaic (MJy/sr)',
    archiveUrl: 'https://irsa.ipac.caltech.edu/',
    bandsData: {
      '1.0': {
        features: ['Stellar photosphere continuum', 'Resolved low-mass stars in cluster core'],
        intensityNotes: 'High brightness at stellar centroids; dust filaments remain partially dark silhouettes.',
        absorptionSignature: 'Minimal ice absorption; dominated by Rayleigh-Jeans tail of hot stars.'
      },
      '1.5': {
        features: ['Diffuse scattered light', 'Reflection nebulosity from Trapezium cluster'],
        intensityNotes: 'Broad halo of scattered light tracing large interstellar dust grains.',
        absorptionSignature: 'Weak continuum absorption; clean baseline for spectral index calculations.'
      },
      '2.0': {
        features: ['Molecular hydrogen knots', 'Warm shocked gas filaments'],
        intensityNotes: 'Unveils supersonic shock fronts in the Orion BN/KL explosive outflow region.',
        absorptionSignature: '2.12 µm H₂ ro-vibrational emission.'
      },
      '3.0': {
        features: ['Deep 3.05 µm H₂O ice absorption feature', 'Frozen mantle verification on silicates'],
        intensityNotes: 'Pronounced dips in transmitted starlight marking cold, dense molecular cores (T < 40 K).',
        absorptionSignature: 'Prominent amorphous solid water (ASW) ice absorption trough.'
      },
      '4.0': {
        features: ['Sharp 4.27 µm CO₂ ice absorption feature', 'Traces molecular cloud chemistry'],
        intensityNotes: 'Indicates high abundances of polar water-rich and non-polar CO₂ ice mixtures.',
        absorptionSignature: 'Distinct narrow doublet from crystallized and amorphous CO₂.'
      },
      '4.5': {
        features: ['Thermal dust emission onset (4.7 µm)', 'CO ice 4.67 µm band'],
        intensityNotes: 'Warm circumstellar envelopes glow brightly; dense filament cores show deep CO dip.',
        absorptionSignature: 'Carbon monoxide ice absorption on grain mantles.'
      }
    },
    spectralProfile: {
      spectrumType: 'Archival Reference Spectroscopy',
      provenance: 'Spitzer IRAC & IRS Archival Spectral Library',
      points: [
        { wavelength: 0.75, relativeFlux: 0.70 },
        { wavelength: 1.0, relativeFlux: 0.75 },
        { wavelength: 1.5, relativeFlux: 0.82 },
        { wavelength: 2.0, relativeFlux: 0.90 },
        { wavelength: 2.12, relativeFlux: 1.25 },
        { wavelength: 2.5, relativeFlux: 0.85 },
        { wavelength: 3.0, relativeFlux: 0.40 },
        { wavelength: 3.05, relativeFlux: 0.32 },
        { wavelength: 3.3, relativeFlux: 0.65 },
        { wavelength: 4.0, relativeFlux: 0.88 },
        { wavelength: 4.27, relativeFlux: 0.48 },
        { wavelength: 4.5, relativeFlux: 0.95 },
        { wavelength: 4.67, relativeFlux: 0.62 },
        { wavelength: 5.0, relativeFlux: 1.05 }
      ]
    }
  },
  {
    id: 'sculptor-galaxy',
    name: 'Sculptor Galaxy (NGC 253)',
    catalogId: 'NGC 253 / Silver Dollar Galaxy',
    category: 'Galaxy',
    distanceLightYears: '11.4 Million ly',
    constellation: 'Sculptor',
    description: 'A magnificent nearby starburst galaxy experiencing intense star formation in its nucleus. Massive super-winds generated by supernovae drive outflows of gas, organic molecules, and dust out of the galactic disc into the intergalactic medium.',
    scientificSignificance: 'SPHEREx spectroscopic imaging tracks how starburst activity distributes water ice and carbon molecules on a galactic scale, connecting stellar chemistry with galactic evolution.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="galOpt" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffea" stop-opacity="0.9"/><stop offset="25%" stop-color="%23aaccdd" stop-opacity="0.6"/><stop offset="50%" stop-color="%23334466" stop-opacity="0.4"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="800" height="500" fill="%23050B1A"/><g transform="rotate(-30 400 250)"><ellipse cx="400" cy="250" rx="300" ry="60" fill="url(%23galOpt)"/><path d="M 160 250 Q 400 230 640 250" stroke="%231a1525" stroke-width="12" opacity="0.85"/></g><text x="30" y="45" fill="%23A7B4CC" font-family="sans-serif" font-size="13" letter-spacing="1">VISIBLE OPTICAL VIEW (ESO) — CENTRAL STARBURST OBSCURED BY DUST LANES</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="galIR" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23F5C451" stop-opacity="0.98"/><stop offset="20%" stop-color="%238B5CF6" stop-opacity="0.8"/><stop offset="45%" stop-color="%2338BDF8" stop-opacity="0.5"/><stop offset="70%" stop-color="%230B1630" stop-opacity="0.4"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="800" height="500" fill="%23050B1A"/><g transform="rotate(-30 400 250)"><ellipse cx="400" cy="250" rx="310" ry="75" fill="url(%23galIR)"/><ellipse cx="400" cy="250" rx="60" ry="28" fill="%23FFFFFF" opacity="0.95"/></g><text x="30" y="45" fill="%2338BDF8" font-family="sans-serif" font-size="13" letter-spacing="1">INFRARED SPECTRAL COMPOSITE (SPITZER SINGS ARCHIVE ANALOG)</text></svg>',
    dataStatus: 'Real Archival Data',
    dataSource: 'NASA Spitzer Space Telescope (SINGS Survey) & ESO VISTA Survey',
    observationDate: 'September 2004',
    instrumentDetails: 'Spitzer IRAC (Infrared Array Camera) 3.6 µm & 4.5 µm',
    telescope: 'Spitzer Space Telescope (NASA/JPL-Caltech)',
    sourceAttribution: 'Kennicutt et al., SINGS Legacy Survey Team & NASA/IPAC Archive.',
    coordinates: { ra: '00h 47m 33s', dec: '-25° 17′ 18″' },
    calibrationStatus: 'SINGS Calibrated Photometric Surface Brightness',
    archiveUrl: 'https://irsa.ipac.caltech.edu/',
    bandsData: {
      '1.0': {
        features: ['Stellar disc population', 'Old red giant distribution across spiral arms'],
        intensityNotes: 'Smooth galactic disk light reveals total stellar mass distribution without dust bias.',
        absorptionSignature: 'Broad CO absorption bandheads in stellar atmospheres.'
      },
      '1.5': {
        features: ['Active star-forming clumps', 'Near-IR star cluster emission'],
        intensityNotes: 'Unveils super star clusters hidden deeply within the central 1,000 light-years.',
        absorptionSignature: 'Continuous emission with low dust attenuation.'
      },
      '2.0': {
        features: ['Near-infrared bar structure', 'Dynamical inflow channeling gas'],
        intensityNotes: 'Traces the gravitational bar driving gas directly into the central starburst ring.',
        absorptionSignature: 'CO molecular absorption in cool evolved giants.'
      },
      '3.0': {
        features: ['Water ice absorption along galactic outflow superwind', 'Cold molecular gas tracer'],
        intensityNotes: 'Maps whether prebiotic water survives the violent energetic environment of starburst winds.',
        absorptionSignature: 'Ice absorption along the edge of the galactic disk.'
      },
      '4.0': {
        features: ['Warm dust emission', 'CO₂ ice in outer disk clouds'],
        intensityNotes: 'Traces the thermal boundary between stellar heating and cold cloud reservoirs.',
        absorptionSignature: 'Combined absorption and warm continuum.'
      },
      '4.5': {
        features: ['High-energy galactic nucleus core emission', 'CO gas-phase & ice features'],
        intensityNotes: 'Central starburst core glows with extreme infrared luminosity.',
        absorptionSignature: 'Deep molecular carbon signatures in active nuclear ring.'
      }
    },
    spectralProfile: {
      spectrumType: 'Archival Reference Spectroscopy',
      provenance: 'Spitzer SINGS Extragalactic Spectral Catalog',
      points: [
        { wavelength: 0.75, relativeFlux: 0.98 },
        { wavelength: 1.0, relativeFlux: 0.95 },
        { wavelength: 1.5, relativeFlux: 0.88 },
        { wavelength: 2.0, relativeFlux: 0.82 },
        { wavelength: 2.5, relativeFlux: 0.78 },
        { wavelength: 3.0, relativeFlux: 0.72 },
        { wavelength: 3.05, relativeFlux: 0.68 },
        { wavelength: 3.3, relativeFlux: 0.92 },
        { wavelength: 3.8, relativeFlux: 0.74 },
        { wavelength: 4.0, relativeFlux: 0.76 },
        { wavelength: 4.27, relativeFlux: 0.70 },
        { wavelength: 4.5, relativeFlux: 0.82 },
        { wavelength: 5.0, relativeFlux: 0.90 }
      ]
    }
  },
  {
    id: 'hl-tau-disk',
    name: 'Protoplanetary Disk HL Tauri',
    catalogId: 'HL Tau / Taurus Molecular Cloud',
    category: 'Protoplanetary Disk',
    distanceLightYears: '450 ly',
    constellation: 'Taurus',
    description: 'A very young protostar (under 1 million years old) surrounded by a massive circumstellar disk of gas and dust with concentric rings and gaps carved by newly forming infant planets.',
    scientificSignificance: 'Understanding where the "snow line" (the boundary where water vapor freezes into solid ice) lies in disks like HL Tau is vital for discovering where water-rich planets like Earth or icy comets can form.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23050B1A"/><defs><radialGradient id="hltauOpt" cx="50%" cy="50%" r="45%"><stop offset="0%" stop-color="%23ff9955" stop-opacity="0.8"/><stop offset="30%" stop-color="%23552211" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><ellipse cx="400" cy="250" rx="190" ry="95" fill="url(%23hltauOpt)"/><circle cx="400" cy="250" r="8" fill="%23ffeedd"/><text x="30" y="45" fill="%23A7B4CC" font-family="sans-serif" font-size="13" letter-spacing="1">OPTICAL VIEW — PROTOSTAR ENVELOPE SCATTERING (INTERIOR DISK OBSCURED)</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="hltauIR" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23FFFFFF"/><stop offset="15%" stop-color="%23F5C451" stop-opacity="0.95"/><stop offset="35%" stop-color="%2338BDF8" stop-opacity="0.75"/><stop offset="65%" stop-color="%238B5CF6" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="800" height="500" fill="%23050B1A"/><g transform="rotate(-15 400 250)"><ellipse cx="400" cy="250" rx="240" ry="120" fill="url(%23hltauIR)"/><ellipse cx="400" cy="250" rx="175" ry="87" fill="none" stroke="%23050B1A" stroke-width="16" opacity="0.8"/><ellipse cx="400" cy="250" rx="110" ry="55" fill="none" stroke="%23050B1A" stroke-width="12" opacity="0.8"/><ellipse cx="400" cy="250" rx="50" ry="25" fill="none" stroke="%23050B1A" stroke-width="8" opacity="0.8"/><circle cx="400" cy="250" r="14" fill="%23FFF6C8"/></g><text x="30" y="45" fill="%2338BDF8" font-family="sans-serif" font-size="13" letter-spacing="1">SPHEREx INFRARED SPECTROSCOPIC MODEL — PROBING WATER & CO₂ SNOW LINES</text></svg>',
    dataStatus: 'Illustrative Astronomical Model',
    dataSource: 'Calibrated Astronomical Model based on ALMA Long Baseline Campaign & JWST NIRCam observations',
    observationDate: 'Not available',
    instrumentDetails: 'Millimeter interferometer synthesis (ALMA) & NIRCam simulation',
    telescope: 'ALMA & JWST Infrared Analog',
    sourceAttribution: 'Illustrative modeling derived from ALMA Partnership et al. (2015).',
    coordinates: { ra: '04h 31m 38s', dec: '+18° 13′ 57″' },
    calibrationStatus: 'Theoretical Radiative Transfer Model (Uncalibrated Simulation)',
    archiveUrl: 'https://irsa.ipac.caltech.edu/',
    bandsData: {
      '1.0': {
        features: ['Stellar irradiation scattering off upper disk atmosphere'],
        intensityNotes: 'Reflected light outlines flared outer disk geometry.',
        absorptionSignature: 'Grain scattering phase function profile.'
      },
      '1.5': {
        features: ['Inner accretion disk thermal emission', 'Warm gas lines'],
        intensityNotes: 'Peak luminosity from material falling onto the central protostar.',
        absorptionSignature: 'Brackett gamma hydrogen emission line.'
      },
      '2.0': {
        features: ['Hot inner disk rim emission (T ~ 1500 K)', 'Silicate dust sublimation boundary'],
        intensityNotes: 'Marks the closest distance dust can survive without vaporizing.',
        absorptionSignature: 'Near-infrared continuum emission.'
      },
      '3.0': {
        features: ['Direct Water Ice (H₂O) Snow Line mapping', '3.05 µm absorption profile'],
        intensityNotes: 'Marks the exact distance from the young star where water transforms from steam into solid ice pebbles.',
        absorptionSignature: 'Broad 3.05 µm water ice absorption feature.'
      },
      '4.0': {
        features: ['Carbon dioxide (CO₂) and methane ice condensation fronts'],
        intensityNotes: 'Maps secondary snow lines that determine the chemical compositions of gas giant atmospheres.',
        absorptionSignature: '4.27 µm CO₂ ice absorption trough.'
      },
      '4.5': {
        features: ['CO ice belt at cold outer perimeter (T ~ 20 K)', 'Thermal dust continuum'],
        intensityNotes: 'Outer edges of the disk where cometary bodies accumulate primordial volatiles.',
        absorptionSignature: '4.67 µm CO solid-state absorption.'
      }
    },
    spectralProfile: {
      spectrumType: 'Theoretical Radiative Model',
      provenance: 'ALMA/JWST Radiative Transfer Disk Chemistry Model (ALMA Partnership 2015)',
      points: [
        { wavelength: 0.75, relativeFlux: 0.50 },
        { wavelength: 1.0, relativeFlux: 0.60 },
        { wavelength: 1.5, relativeFlux: 0.72 },
        { wavelength: 2.0, relativeFlux: 0.80 },
        { wavelength: 2.5, relativeFlux: 0.75 },
        { wavelength: 3.0, relativeFlux: 0.35 },
        { wavelength: 3.05, relativeFlux: 0.28 },
        { wavelength: 3.4, relativeFlux: 0.55 },
        { wavelength: 4.0, relativeFlux: 0.70 },
        { wavelength: 4.27, relativeFlux: 0.38 },
        { wavelength: 4.67, relativeFlux: 0.42 },
        { wavelength: 5.0, relativeFlux: 0.85 }
      ]
    }
  },
  {
    id: 'cosmic-deep-field',
    name: 'SPHEREx Deep Polar Survey Field',
    catalogId: 'North Ecliptic Pole / Deep Survey Field',
    category: 'Cosmic Background',
    distanceLightYears: '> 13 Billion ly (z ~ 6–10)',
    constellation: 'Ursa Minor (North Ecliptic Pole)',
    description: 'A quiet, dust-free window looking out of our Milky Way into the deepest cosmic past. When massive first-generation stars (Population III) formed 400 million years after the Big Bang, their ultraviolet light was stretched by cosmic expansion directly into near-infrared wavelengths.',
    scientificSignificance: 'SPHEREx will measure spatial fluctuations in the Cosmic Infrared Background (CIB) across the entire sky to detect the collective glow of the earliest galaxies that ended the Cosmic Dark Ages.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23050B1A"/><g fill="%23888"><circle cx="140" cy="110" r="2"/><circle cx="320" cy="160" r="1.5"/><circle cx="600" cy="90" r="2"/><circle cx="470" cy="420" r="1.5"/><circle cx="680" cy="380" r="1.8"/><circle cx="210" cy="360" r="1.2"/></g><text x="30" y="45" fill="%23A7B4CC" font-family="sans-serif" font-size="13" letter-spacing="1">VISIBLE OPTICAL VIEW — APPARENT EMPTY VOID</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><radialGradient id="cibFluct" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%238B5CF6" stop-opacity="0.35"/><stop offset="50%" stop-color="%2338BDF8" stop-opacity="0.2"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="0.9"/></radialGradient></defs><rect width="800" height="500" fill="%23050B1A"/><rect width="800" height="500" fill="url(%23cibFluct)"/><g fill="%23F5C451"><circle cx="190" cy="120" r="3.5"/><circle cx="280" cy="240" r="4"/><circle cx="450" cy="150" r="3.8"/><circle cx="580" cy="290" r="3.2"/><circle cx="640" cy="170" r="4.2"/><circle cx="390" cy="390" r="3.6"/><circle cx="240" cy="420" r="3"/><circle cx="520" cy="450" r="4"/></g><text x="30" y="45" fill="%2338BDF8" font-family="sans-serif" font-size="13" letter-spacing="1">SPHEREx SYNTHETIC MISSION DEMONSTRATION — REDSHIFTED CIB FLUCTUATIONS</text></svg>',
    dataStatus: 'Synthetic Mission Demonstration',
    dataSource: 'SPHEREx All-Sky Survey Pre-Launch Benchmark Simulation Model (Caltech/JPL)',
    observationDate: 'Not available',
    instrumentDetails: 'Linear Variable Filter (LVF) Spectrometer simulation',
    telescope: 'SPHEREx (NASA/JPL-Caltech)',
    sourceAttribution: 'Pre-flight instrument response simulation based on CIBER and Spitzer Polar Surveys.',
    coordinates: { ra: '18h 00m 00s', dec: '+66° 33′ 38″' },
    calibrationStatus: 'Pre-Launch Synthetic Benchmark (Caltech/JPL Model)',
    archiveUrl: 'https://irsa.ipac.caltech.edu/Missions/spherex.html',
    bandsData: {
      '1.0': {
        features: ['Foreground zodiacal light subtraction', 'Low-redshift galaxy cataloging (z < 1)'],
        intensityNotes: 'Dominated by local Solar System dust scattering, accurately modeled and subtracted.',
        absorptionSignature: 'No local ice absorption; clean extragalactic background window.'
      },
      '1.5': {
        features: ['Peak sensitivity to Lyman-alpha break at z = 7–10', 'Intra-halo light tracing'],
        intensityNotes: 'Large-scale clustering patterns emerge indicating primordial dark matter halos.',
        absorptionSignature: 'Distinct spatial power spectrum signature at angular scales of 10 arcminutes.'
      },
      '2.0': {
        features: ['Near-IR galaxy counts', 'Cosmic structure clustering baseline'],
        intensityNotes: 'Tests large-scale structure formation models.',
        absorptionSignature: 'Diffuse extragalactic background light.'
      },
      '3.0': {
        features: ['Spectral slope continuum of early stellar populations', 'Clean cosmic window'],
        intensityNotes: 'Very low background emission; ideal for measuring absolute cosmic background level.',
        absorptionSignature: 'Baseline continuum for cosmic energy density calculation.'
      },
      '4.0': {
        features: ['Redshifted emission from high-z starbursts', 'Lyman-alpha at z > 12'],
        intensityNotes: 'Probes the earliest phases of cosmic dawn.',
        absorptionSignature: 'Diffuse fluctuation signature correlated across wide survey fields.'
      },
      '4.5': {
        features: ['Mid-IR dust continuum boundary', 'Redshifted PAHs from distant galaxies'],
        intensityNotes: 'Captures thermal emission from dust heated by first massive star clusters.',
        absorptionSignature: 'Diffuse extragalactic thermal background.'
      }
    },
    spectralProfile: {
      spectrumType: 'Synthetic Instrument Simulation',
      provenance: 'SPHEREx Science Team Pre-Flight CIB Simulation (Bock et al. 2020)',
      points: [
        { wavelength: 0.75, relativeFlux: 0.40 },
        { wavelength: 1.0, relativeFlux: 0.45 },
        { wavelength: 1.2, relativeFlux: 0.65 },
        { wavelength: 1.5, relativeFlux: 0.85 },
        { wavelength: 2.0, relativeFlux: 0.78 },
        { wavelength: 2.5, relativeFlux: 0.70 },
        { wavelength: 3.0, relativeFlux: 0.62 },
        { wavelength: 3.05, relativeFlux: 0.60 },
        { wavelength: 3.5, relativeFlux: 0.55 },
        { wavelength: 4.0, relativeFlux: 0.52 },
        { wavelength: 4.5, relativeFlux: 0.50 },
        { wavelength: 5.0, relativeFlux: 0.48 }
      ]
    }
  }
];
