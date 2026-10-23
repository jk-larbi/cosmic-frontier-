import type { InfraredBand, CelestialTarget } from '../types';

export const SPHEREX_BANDS: InfraredBand[] = [
  {
    id: 'band-1',
    name: 'Band 1: Near-IR Frontier',
    wavelength: 0.75,
    range: '0.75 – 1.10 µm',
    scientificPurpose: 'Stellar Photospheres & Deep Galaxy Redshifts',
    chemicalTracer: 'Hydrogen Paschen Series, Low-mass Star Photospheres',
    description: 'At the boundary between visible and near-infrared light, Band 1 cuts through thin dust and traces the light of ancient stars across billions of light-years.',
    colorHex: '#38BDF8'
  },
  {
    id: 'band-2',
    name: 'Band 2: Cosmic Background Tracer',
    wavelength: 1.45,
    range: '1.10 – 1.90 µm',
    scientificPurpose: 'Cosmic Infrared Background (CIB) Fluctuations',
    chemicalTracer: 'Diffused Intra-Halo Stellar Light & First Generation Stars',
    description: 'Traces the faint diffuse glow produced by the earliest stars and galaxies during the Epoch of Reionization, illuminating the infant universe.',
    colorHex: '#60A5FA'
  },
  {
    id: 'band-3',
    name: 'Band 3: Water Ice (H₂O) Window',
    wavelength: 3.05,
    range: '2.50 – 3.30 µm',
    scientificPurpose: 'Interstellar Water Ice Detection in Star-Forming Cores',
    chemicalTracer: 'O–H Molecular Stretching Resonance (3.05 µm absorption)',
    description: 'Crucial for detecting water ice frozen onto microscopic dust grains in protoplanetary disks, tracing the ingredients for habitable planets.',
    colorHex: '#818CF8'
  },
  {
    id: 'band-4',
    name: 'Band 4: Carbon Dioxide (CO₂) Ice',
    wavelength: 4.27,
    range: '3.80 – 4.45 µm',
    scientificPurpose: 'Volatile Biogenic Precursor Molecules in Cold Molecular Clouds',
    chemicalTracer: 'C=O Asymmetric Stretch Band (4.27 µm absorption)',
    description: 'Pinpoints frozen carbon dioxide, an essential building block for complex organic chemistry in planetary nurseries.',
    colorHex: '#C084FC'
  },
  {
    id: 'band-5',
    name: 'Band 5: Carbon Monoxide (CO) & Warm Dust',
    wavelength: 4.67,
    range: '4.45 – 5.00 µm',
    scientificPurpose: 'Carbon Monoxide Ice & Circumstellar Dust Emission',
    chemicalTracer: 'C–O Molecular Fundamental Absorption & Polycyclic Aromatic Hydrocarbons',
    description: 'Reveals cold carbon monoxide ice and glow from warm dust surrounding newly ignited protostars.',
    colorHex: '#F5C451'
  }
];

export const CELESTIAL_TARGETS: CelestialTarget[] = [
  {
    id: 'orion-nebula',
    name: 'Orion Nebula (M42) & Trapezium',
    catalogId: 'NGC 1976 / Messier 42',
    category: 'Nebula',
    distanceLightYears: '1,344 ly',
    constellation: 'Orion',
    description: 'The closest massive star-forming factory to Earth. While visible light is blocked by dense opaque clouds of interstellar dust, infrared light penetrates deeply to reveal hundreds of newborn protostars and protoplanetary discs (proplyds).',
    scientificSignificance: 'SPHEREx will map the distribution of water and organic ices throughout the surrounding molecular cloud to measure how much water is delivered to developing planetary systems.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="nebulaVis" cx="48%" cy="52%" r="45%"><stop offset="0%" stop-color="%23ff6688" stop-opacity="0.9"/><stop offset="35%" stop-color="%23772255" stop-opacity="0.7"/><stop offset="70%" stop-color="%23221133" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050b1a" stop-opacity="1"/></radialGradient><radialGradient id="starGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="40%" stop-color="%2388ccff" stop-opacity="0.7"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="600" height="400" fill="%23050B1A"/><circle cx="288" cy="208" r="160" fill="url(%23nebulaVis)"/><path d="M120 180 Q 200 90 340 130 T 480 260 Q 380 340 220 300 Z" fill="%23110822" opacity="0.85"/><circle cx="280" cy="200" r="14" fill="url(%23starGlow)"/><circle cx="295" cy="192" r="10" fill="url(%23starGlow)"/><circle cx="270" cy="215" r="9" fill="url(%23starGlow)"/><circle cx="300" cy="220" r="8" fill="url(%23starGlow)"/><text x="20" y="30" fill="%23A7B4CC" font-family="sans-serif" font-size="12" letter-spacing="1">VISIBLE OPTICAL SPECTRUM (DUST OBSCURATION)</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="nebulaIR" cx="48%" cy="52%" r="50%"><stop offset="0%" stop-color="%23F5C451" stop-opacity="0.95"/><stop offset="30%" stop-color="%23C084FC" stop-opacity="0.85"/><stop offset="60%" stop-color="%2338BDF8" stop-opacity="0.7"/><stop offset="90%" stop-color="%230B1630" stop-opacity="0.9"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="600" height="400" fill="%23050B1A"/><circle cx="288" cy="208" r="180" fill="url(%23nebulaIR)" filter="url(%23glow)"/><g fill="%23F5C451"><circle cx="280" cy="200" r="6"/><circle cx="295" cy="192" r="5"/><circle cx="270" cy="215" r="4.5"/><circle cx="300" cy="220" r="4"/><circle cx="180" cy="150" r="3"/><circle cx="390" cy="160" r="3.5"/><circle cx="220" cy="280" r="4"/><circle cx="360" cy="270" r="3"/><circle cx="150" cy="220" r="2.5"/><circle cx="430" cy="240" r="2.5"/></g><text x="20" y="30" fill="%2338BDF8" font-family="sans-serif" font-size="12" letter-spacing="1">SPHEREx INFRARED COMPOSITE (EMBEDDED PROTOSTARS & ICES)</text></svg>',
    bandsData: {
      'band-1': {
        features: ['Stellar photosphere continuum', 'Resolved low-mass stars in cluster core'],
        intensityNotes: 'High brightness at stellar centroids; dust filaments remain partially dark silhouettes.',
        absorptionSignature: 'Minimal ice absorption; dominated by Rayleigh-Jeans tail of hot stars.'
      },
      'band-2': {
        features: ['Diffuse scattered light', 'Reflection nebulosity from Trapezium cluster'],
        intensityNotes: 'Broad halo of scattered light tracing large interstellar dust grains.',
        absorptionSignature: 'Weak continuum absorption; clean baseline for spectral index calculations.'
      },
      'band-3': {
        features: ['Deep 3.05 µm H₂O ice absorption feature', 'Frozen mantle verification on silicates'],
        intensityNotes: 'Pronounced dips in transmitted starlight marking cold, dense molecular cores (T < 40 K).',
        absorptionSignature: 'Prominent amorphous solid water (ASW) ice absorption trough.'
      },
      'band-4': {
        features: ['Sharp 4.27 µm CO₂ ice absorption feature', 'Traces molecular cloud chemistry'],
        intensityNotes: 'Indicates high abundances of polar water-rich and non-polar CO₂ ice mixtures.',
        absorptionSignature: 'Distinct narrow doublet from crystallized and amorphous CO₂.'
      },
      'band-5': {
        features: ['Thermal dust emission onset (4.7 µm)', 'CO ice 4.67 µm band'],
        intensityNotes: 'Warm circumstellar envelopes glow brightly; dense filament cores show deep CO dip.',
        absorptionSignature: 'Carbon monoxide ice absorption on grain mantles.'
      }
    },
    dataStatus: 'Calibrated Astronomical Observation',
    sourceAttribution: 'Simulated SPHEREx Spectroscopic View calibrated with NASA Spitzer, WISE & Herschel archival observations.'
  },
  {
    id: 'cosmic-deep-field',
    name: 'Cosmic Deep Field (Epoch of Reionization)',
    catalogId: 'SPHEREx Deep Polar Survey Field',
    category: 'Cosmic Background',
    distanceLightYears: '> 13 Billion ly (z ~ 6–10)',
    constellation: 'Ursa Minor (North Ecliptic Pole)',
    description: 'A quiet, dust-free window looking out of our Milky Way into the deepest cosmic past. When massive first-generation stars (Population III) formed 400 million years after the Big Bang, their ultraviolet light was stretched by cosmic expansion directly into near-infrared wavelengths.',
    scientificSignificance: 'SPHEREx will measure spatial fluctuations in the Cosmic Infrared Background (CIB) across the entire sky to detect the collective glow of the earliest galaxies that ended the Cosmic Dark Ages.',
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050B1A"/><g fill="%23888"><circle cx="100" cy="80" r="1.5"/><circle cx="240" cy="120" r="1"/><circle cx="450" cy="70" r="1.5"/><circle cx="350" cy="320" r="1"/><circle cx="500" cy="290" r="1.2"/></g><text x="20" y="30" fill="%23A7B4CC" font-family="sans-serif" font-size="12" letter-spacing="1">VISIBLE OPTICAL VIEW (APPARENT EMPTY VOID)</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="cibFluct" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%238B5CF6" stop-opacity="0.35"/><stop offset="50%" stop-color="%2338BDF8" stop-opacity="0.2"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="0.9"/></radialGradient></defs><rect width="600" height="400" fill="%23050B1A"/><rect width="600" height="400" fill="url(%23cibFluct)"/><g fill="%23F5C451"><circle cx="140" cy="90" r="2.5"/><circle cx="210" cy="180" r="3"/><circle cx="340" cy="110" r="2.8"/><circle cx="430" cy="220" r="2.4"/><circle cx="480" cy="130" r="3.2"/><circle cx="290" cy="290" r="2.6"/><circle cx="180" cy="320" r="2.2"/><circle cx="390" cy="340" r="3"/></g><text x="20" y="30" fill="%2338BDF8" font-family="sans-serif" font-size="12" letter-spacing="1">SPHEREx INFRARED VIEW (REDSHIFTED FIRST LIGHT FLUCTUATIONS)</text></svg>',
    bandsData: {
      'band-1': {
        features: ['Foreground zodiacal light subtraction', 'Low-redshift galaxy cataloging (z < 1)'],
        intensityNotes: 'Dominated by local Solar System dust scattering, accurately modeled and subtracted.',
        absorptionSignature: 'No local ice absorption; clean extragalactic background window.'
      },
      'band-2': {
        features: ['Peak sensitivity to Lyman-alpha break at z = 7–10', 'Intra-halo light tracing'],
        intensityNotes: 'Large-scale clustering patterns emerge indicating primordial dark matter halos.',
        absorptionSignature: 'Distinct spatial power spectrum signature at angular scales of 10 arcminutes.'
      },
      'band-3': {
        features: ['Spectral slope continuum of early stellar populations', 'Clean cosmic window'],
        intensityNotes: 'Very low background emission; ideal for measuring absolute cosmic background level.',
        absorptionSignature: 'Baseline continuum for cosmic energy density calculation.'
      },
      'band-4': {
        features: ['Redshifted emission from high-z starbursts', 'Lyman-alpha at z > 12'],
        intensityNotes: 'Probes the earliest phases of cosmic dawn.',
        absorptionSignature: 'Diffuse fluctuation signature correlated across wide survey fields.'
      },
      'band-5': {
        features: ['Mid-IR dust continuum boundary', 'Redshifted PAHs from distant galaxies'],
        intensityNotes: 'Captures thermal emission from dust heated by first massive star clusters.',
        absorptionSignature: 'Diffuse extragalactic thermal background.'
      }
    },
    dataStatus: 'Processed Infrared Survey',
    sourceAttribution: 'SPHEREx All-Sky Survey Simulation model based on NASA CIBER and Spitzer Deep Field data.'
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
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="galOpt" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffea" stop-opacity="0.9"/><stop offset="25%" stop-color="%23aaccdd" stop-opacity="0.6"/><stop offset="50%" stop-color="%23334466" stop-opacity="0.4"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="600" height="400" fill="%23050B1A"/><g transform="rotate(-30 300 200)"><ellipse cx="300" cy="200" rx="220" ry="45" fill="url(%23galOpt)"/><path d="M 120 200 Q 300 185 480 200" stroke="%231a1525" stroke-width="8" opacity="0.8"/></g><text x="20" y="30" fill="%23A7B4CC" font-family="sans-serif" font-size="12" letter-spacing="1">VISIBLE OPTICAL VIEW (DUST LANES OBSCURE NUCLEUS)</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="galIR" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23F5C451" stop-opacity="0.98"/><stop offset="20%" stop-color="%238B5CF6" stop-opacity="0.8"/><stop offset="45%" stop-color="%2338BDF8" stop-opacity="0.5"/><stop offset="70%" stop-color="%230B1630" stop-opacity="0.4"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="600" height="400" fill="%23050B1A"/><g transform="rotate(-30 300 200)"><ellipse cx="300" cy="200" rx="230" ry="55" fill="url(%23galIR)"/><ellipse cx="300" cy="200" rx="40" ry="20" fill="%23FFFFFF" opacity="0.95"/></g><text x="20" y="30" fill="%2338BDF8" font-family="sans-serif" font-size="12" letter-spacing="1">SPHEREx INFRARED VIEW (NUCLEAR STARBURST & OUTFLOWS UNVEILED)</text></svg>',
    bandsData: {
      'band-1': {
        features: ['Stellar disc population', 'Old red giant distribution across spiral arms'],
        intensityNotes: 'Smooth galactic disk light reveals total stellar mass distribution without dust bias.',
        absorptionSignature: 'Broad CO absorption bandheads in stellar atmospheres.'
      },
      'band-2': {
        features: ['Active star-forming clumps', 'Near-IR star cluster emission'],
        intensityNotes: 'Unveils super star clusters hidden deeply within the central 1,000 light-years.',
        absorptionSignature: 'Continuous emission with low dust attenuation.'
      },
      'band-3': {
        features: ['Water ice absorption along galactic outflow superwind', 'Cold molecular gas tracer'],
        intensityNotes: 'Maps whether prebiotic water survives the violent energetic environment of starburst winds.',
        absorptionSignature: 'Ice absorption along the edge of the galactic disk.'
      },
      'band-4': {
        features: ['Warm dust emission', 'CO₂ ice in outer disk clouds'],
        intensityNotes: 'Traces the thermal boundary between stellar heating and cold cloud reservoirs.',
        absorptionSignature: 'Combined absorption and warm continuum.'
      },
      'band-5': {
        features: ['High-energy galactic nucleus core emission', 'CO gas-phase & ice features'],
        intensityNotes: 'Central starburst core glows with extreme infrared luminosity.',
        absorptionSignature: 'Deep molecular carbon signatures in active nuclear ring.'
      }
    },
    dataStatus: 'Calibrated Astronomical Observation',
    sourceAttribution: 'Simulated SPHEREx Spectroscopic Product derived from NASA Spitzer IRAC and 2MASS Survey data.'
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
    opticalImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23050B1A"/><defs><radialGradient id="hltauOpt" cx="50%" cy="50%" r="45%"><stop offset="0%" stop-color="%23ff9955" stop-opacity="0.8"/><stop offset="30%" stop-color="%23552211" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><ellipse cx="300" cy="200" rx="140" ry="70" fill="url(%23hltauOpt)"/><circle cx="300" cy="200" r="6" fill="%23ffeedd"/><text x="20" y="30" fill="%23A7B4CC" font-family="sans-serif" font-size="12" letter-spacing="1">VISIBLE OPTICAL VIEW (SURFACE SCATTERING & OBSCURED INTERIOR)</text></svg>',
    infraredImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><radialGradient id="hltauIR" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23FFFFFF"/><stop offset="15%" stop-color="%23F5C451" stop-opacity="0.95"/><stop offset="35%" stop-color="%2338BDF8" stop-opacity="0.75"/><stop offset="65%" stop-color="%238B5CF6" stop-opacity="0.5"/><stop offset="100%" stop-color="%23050B1A" stop-opacity="1"/></radialGradient></defs><rect width="600" height="400" fill="%23050B1A"/><g transform="rotate(-15 300 200)"><ellipse cx="300" cy="200" rx="180" ry="90" fill="url(%23hltauIR)"/><ellipse cx="300" cy="200" rx="130" ry="65" fill="none" stroke="%23050B1A" stroke-width="12" opacity="0.75"/><ellipse cx="300" cy="200" rx="80" ry="40" fill="none" stroke="%23050B1A" stroke-width="9" opacity="0.75"/><ellipse cx="300" cy="200" rx="35" ry="18" fill="none" stroke="%23050B1A" stroke-width="6" opacity="0.75"/><circle cx="300" cy="200" r="10" fill="%23FFF6C8"/></g><text x="20" y="30" fill="%2338BDF8" font-family="sans-serif" font-size="12" letter-spacing="1">SPHEREx INFRARED SPECTROSCOPIC MODEL (WATER & CO₂ SNOW LINES)</text></svg>',
    bandsData: {
      'band-1': {
        features: ['Stellar irradiation scattering off upper disk atmosphere'],
        intensityNotes: 'Reflected light outlines flared outer disk geometry.',
        absorptionSignature: 'Grain scattering phase function profile.'
      },
      'band-2': {
        features: ['Inner accretion disk thermal emission', 'Warm gas lines'],
        intensityNotes: 'Peak luminosity from material falling onto the central protostar.',
        absorptionSignature: 'Brackett gamma hydrogen emission line.'
      },
      'band-3': {
        features: ['Direct Water Ice (H₂O) Snow Line mapping', '3.05 µm absorption profile'],
        intensityNotes: 'Marks the exact distance from the young star where water transforms from steam into solid ice pebbles.',
        absorptionSignature: 'Broad 3.05 µm water ice absorption feature.'
      },
      'band-4': {
        features: ['Carbon dioxide (CO₂) and methane ice condensation fronts'],
        intensityNotes: 'Maps secondary snow lines that determine the chemical compositions of gas giant atmospheres.',
        absorptionSignature: '4.27 µm CO₂ ice absorption trough.'
      },
      'band-5': {
        features: ['CO ice belt at cold outer perimeter (T ~ 20 K)', 'Thermal dust continuum'],
        intensityNotes: 'Outer edges of the disk where cometary bodies accumulate primordial volatiles.',
        absorptionSignature: '4.67 µm CO solid-state absorption.'
      }
    },
    dataStatus: 'Illustrative Mission Model',
    sourceAttribution: 'SPHEREx Disk Chemistry Simulation Model aligned with ALMA and JWST NIRCam observations.'
  }
];

