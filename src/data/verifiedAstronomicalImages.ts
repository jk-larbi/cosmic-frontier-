import type { AstronomicalImageRecord } from '../types';

/**
 * COSMIC FRONTIER — Verified Astronomical Image Registry
 * 
 * Central registry of verified astronomical photographs, spacecraft close-ups,
 * and authoritative NASA/ESA artist impressions.
 * 
 * Strict scientific classification:
 * - 'observation': Genuine telescopic/spacecraft sensor data
 * - 'spacecraft': In-situ robotic probe photography
 * - 'artist-impression': Peer-reviewed scientific illustration from NASA/ESA
 * - 'scientific-illustration': Calculated physical model
 * - 'simulation': Theoretical orbital or gravitational simulation
 */

export const VERIFIED_ASTRONOMICAL_IMAGES: Record<string, AstronomicalImageRecord[]> = {
  // =========================================================================
  // SOLAR SYSTEM BODIES
  // =========================================================================
  'sun': [
    {
      id: 'img-sun-sdo-1',
      associatedObjectId: 'sun',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg',
      title: 'Solar Dynamics Observatory Ultraviolet Flare',
      caption: 'The Sun captured by NASA SDO at 304 Angstroms showing active solar flares and magnetic loop plasma.',
      sourceOrganization: 'NASA / SDO Science Team',
      sourceUrl: 'https://images.nasa.gov/details/PIA03149',
      credit: 'NASA/SDO/AIA',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2010-04-21',
      instrument: 'Atmospheric Imaging Assembly (AIA)',
      wavelength: '30.4 nm (Extreme Ultraviolet)',
      processing: 'Calibrated radiometric EUV false-color'
    }
  ],

  'mercury': [
    {
      id: 'img-mercury-messenger-1',
      associatedObjectId: 'mercury',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~orig.jpg',
      title: 'Mercury in Enhanced Color (MESSENGER)',
      caption: 'Global false-color mosaic of Mercury revealing volcanic smooth plains and cratered silicate crust.',
      sourceOrganization: 'NASA / JHUAPL / Carnegie Institution of Washington',
      sourceUrl: 'https://images.nasa.gov/details/PIA11364',
      credit: 'NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2008-01-14',
      instrument: 'Mercury Dual Imaging System (MDIS)',
      wavelength: 'Multispectral (11 filters 400–1000 nm)',
      processing: 'Statistical principal component color mosaic'
    }
  ],

  'venus': [
    {
      id: 'img-venus-magellan-1',
      associatedObjectId: 'venus',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg',
      title: 'Venus Synthetic Aperture Radar Global Map',
      caption: 'Global radar elevation composite penetrating dense cloud cover, revealing volcanic highlands and impact craters.',
      sourceOrganization: 'NASA / JPL',
      sourceUrl: 'https://images.nasa.gov/details/PIA00271',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1990-1994',
      instrument: 'Magellan Synthetic Aperture Radar (SAR)',
      wavelength: '12.6 cm (S-Band Microwave Radar)',
      processing: 'Radar backscatter mosaic simulated with Soviet Venera surface color'
    }
  ],

  'earth': [
    {
      id: 'img-earth-epic-1',
      associatedObjectId: 'earth',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
      title: 'Earth from 1 Million Miles (DSCOVR EPIC)',
      caption: 'Natural color photograph of the illuminated sunlit hemisphere of Earth from the Sun-Earth L1 Lagrange point.',
      sourceOrganization: 'NASA / NOAA / DSCOVR',
      sourceUrl: 'https://images.nasa.gov/details/PIA18033',
      credit: 'NASA/NOAA/DSCOVR',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2015-07-06',
      instrument: 'Earth Polychromatic Imaging Camera (EPIC)',
      wavelength: 'Red, Green, Blue narrow-band channels (443, 551, 680 nm)',
      processing: 'Natural-color calibrated composite'
    }
  ],

  'moon': [
    {
      id: 'img-moon-galileo-1',
      associatedObjectId: 'moon',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg',
      title: 'False-Color Mosaic of the Moon',
      caption: 'Multispectral image taken by Galileo spacecraft during its Earth-Moon flyby showing mineral titanium variations.',
      sourceOrganization: 'NASA / JPL',
      sourceUrl: 'https://images.nasa.gov/details/PIA00405',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1992-12-07',
      instrument: 'Solid State Imaging (SSI)',
      wavelength: 'Violet, 756 nm, 968 nm',
      processing: 'Calibrated spectral ratio mosaic'
    }
  ],

  'mars': [
    {
      id: 'img-mars-viking-1',
      associatedObjectId: 'mars',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA02653/PIA02653~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA02653/PIA02653~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA02653/PIA02653~orig.jpg',
      title: 'Mars Global Mosaic (Schiaparelli Hemisphere)',
      caption: 'Full-disk composite of Mars centered on the Schiaparelli impact crater and Valles Marineris canyon network.',
      sourceOrganization: 'NASA / USGS / Viking Project',
      sourceUrl: 'https://images.nasa.gov/details/PIA02653',
      credit: 'NASA/USGS/JPL-Caltech',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1980-02-22',
      instrument: 'Viking 1 Orbiter Visual Imaging Subsystem (VIS)',
      wavelength: 'Visible (Red, Green, Violet filters)',
      processing: 'True color geometric orthographic mosaic'
    }
  ],

  'jupiter': [
    {
      id: 'img-jupiter-cassini-1',
      associatedObjectId: 'jupiter',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA02972/PIA02972~thumb.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA02972/PIA02972~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA02972/PIA02972~orig.jpg',
      title: 'Jupiter in True Color (Cassini Encounter)',
      caption: 'True color portrait of Jupiter showing the Great Red Spot and turbulent atmospheric belt circulation.',
      sourceOrganization: 'NASA / JPL / University of Arizona',
      sourceUrl: 'https://images.nasa.gov/details/PIA02972',
      credit: 'NASA/JPL/University of Arizona',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2000-12-29',
      instrument: 'Imaging Science Subsystem (ISS Narrow Angle)',
      wavelength: 'Red, Green, Blue visible filters',
      processing: 'Calibrated photometric color reconstruction'
    }
  ],

  'saturn': [
    {
      id: 'img-saturn-cassini-1',
      associatedObjectId: 'saturn',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA06077/PIA06077~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA06077/PIA06077~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA06077/PIA06077~orig.jpg',
      title: 'Saturn and Ring System (Cassini Orbit Insertion)',
      caption: 'Natural-color view of Saturn and its majestic ring system captured from 8.2 million kilometers away.',
      sourceOrganization: 'NASA / JPL / Space Science Institute',
      sourceUrl: 'https://images.nasa.gov/details/PIA06077',
      credit: 'NASA/JPL/Space Science Institute',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2004-05-16',
      instrument: 'Imaging Science Subsystem (ISS)',
      wavelength: 'Red, Green, Blue visible spectrum',
      processing: 'Color composite balanced to match human eye perception'
    }
  ],

  'uranus': [
    {
      id: 'img-uranus-voyager-1',
      associatedObjectId: 'uranus',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
      title: 'Uranus Pale Cyan Atmosphere (Voyager 2)',
      caption: 'Natural color photograph of Uranus showing its featureless cyan-green methane atmosphere.',
      sourceOrganization: 'NASA / JPL',
      sourceUrl: 'https://images.nasa.gov/details/PIA18182',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1986-01-17',
      instrument: 'Voyager 2 Narrow Angle Camera',
      wavelength: 'Clear, Violet, Orange filters',
      processing: 'Photometrically calibrated natural color'
    }
  ],

  'neptune': [
    {
      id: 'img-neptune-voyager-1',
      associatedObjectId: 'neptune',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~thumb.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
      title: 'Neptune Full Disk (Voyager 2 Encounter)',
      caption: 'Vivid azure portrait of Neptune displaying the Great Dark Spot and bright white cirrus-like methane clouds.',
      sourceOrganization: 'NASA / JPL',
      sourceUrl: 'https://images.nasa.gov/details/PIA01492',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1989-08-20',
      instrument: 'Voyager 2 Narrow Angle Camera',
      wavelength: 'Green, Orange, Clear filters',
      processing: 'Orthographic composite mosaic'
    }
  ],

  'pluto': [
    {
      id: 'img-pluto-new-horizons-1',
      associatedObjectId: 'pluto',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA09234/PIA09234~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA09234/PIA09234~small.jpg',
      hdUrl: 'https://images-assets.nasa.gov/image/PIA09234/PIA09234~orig.jpg',
      title: 'Pluto High-Resolution Global Portrait (New Horizons)',
      caption: 'High-resolution true color view of Pluto featuring Tombaugh Regio (the vast nitrogen-ice heart basin).',
      sourceOrganization: 'NASA / Johns Hopkins University APL / Southwest Research Institute',
      sourceUrl: 'https://images.nasa.gov/details/PIA09234',
      credit: 'NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2015-07-14',
      instrument: 'Long Range Reconnaissance Imager (LORRI) & Ralph/MVIC',
      wavelength: 'Panchromatic & Blue, Red, Near-IR (MVIC)',
      processing: 'Color overlay onto 400m/pixel LORRI base mosaic'
    }
  ],

  // =========================================================================
  // ASTEROIDS, COMETS & TRANS-NEPTUNIAN OBJECTS
  // =========================================================================
  'ceres': [
    {
      id: 'img-ceres-dawn-1',
      associatedObjectId: 'ceres',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA21079/PIA21079~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21079/PIA21079~thumb.jpg',
      title: 'Dwarf Planet Ceres in Enhanced Color (Dawn)',
      caption: 'Global mosaic of Ceres highlighting bright sodium carbonate deposits in Occator Crater.',
      sourceOrganization: 'NASA / JPL-Caltech / UCLA / MPS / DLR / IDA',
      sourceUrl: 'https://images.nasa.gov/details/PIA21079',
      credit: 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2015-05-04',
      instrument: 'Dawn Framing Camera',
      wavelength: 'Clear, Blue (440 nm), Green (550 nm), NIR (965 nm)',
      processing: 'Multispectral ratio mapping'
    }
  ],

  'vesta': [
    {
      id: 'img-vesta-dawn-1',
      associatedObjectId: 'vesta',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA15794/PIA15794~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA15794/PIA15794~thumb.jpg',
      title: 'Asteroid Vesta Full Disk (Dawn Spacecraft)',
      caption: 'Differentiated asteroid Vesta showing Rheasilvia impact basin ridges and steep scarp topography.',
      sourceOrganization: 'NASA / JPL-Caltech / UCLA / MPS / DLR / IDA',
      sourceUrl: 'https://images.nasa.gov/details/PIA15794',
      credit: 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2011-07-24',
      instrument: 'Dawn Framing Camera',
      wavelength: 'Visible (Clear filter 400–1000 nm)',
      processing: 'Calibrated optical photometric mosaic'
    }
  ],

  'eros': [
    {
      id: 'img-eros-near-1',
      associatedObjectId: 'eros',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA03148/PIA03148~thumb.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA03148/PIA03148~thumb.jpg',
      title: 'Asteroid 433 Eros Near Touchdown',
      caption: 'Close-range orbital view of near-Earth asteroid Eros taken during the NEAR Shoemaker historic touchdown.',
      sourceOrganization: 'NASA / JHUAPL',
      sourceUrl: 'https://images.nasa.gov/details/PIA03148',
      credit: 'NASA/JHUAPL',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2001-02-12',
      instrument: 'Multispectral Imager (MSI)',
      wavelength: 'Visible monochromatic (700 nm)',
      processing: 'Raw telemetry calibrated contrast stretch'
    }
  ],

  'apophis': [
    {
      id: 'img-apophis-goldstone-1',
      associatedObjectId: 'apophis',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA23195/PIA23195~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23195/PIA23195~thumb.jpg',
      title: 'Asteroid 99942 Apophis Radar & Trajectory',
      caption: 'Goldstone Deep Space Communications Complex planetary radar delay-Doppler imaging of asteroid Apophis.',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA23195',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2021-03-09',
      instrument: 'Goldstone 70-meter Radar Antenna (DSS-14)',
      wavelength: '8560 MHz (3.5 cm X-band Radar)',
      processing: 'Delay-Doppler range-frequency inversion'
    }
  ],

  'halley': [
    {
      id: 'img-halley-giotto-1',
      associatedObjectId: 'halley',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA17485/PIA17485~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA17485/PIA17485~thumb.jpg',
      title: 'Comet 1P/Halley Nucleus and Coma',
      caption: 'Historic close flyby image of Comet Halley nucleus venting dust and gas jets into interplanetary space.',
      sourceOrganization: 'NASA / ESA',
      sourceUrl: 'https://images.nasa.gov/details/PIA17485',
      credit: 'ESA/Giotto Project/Max-Planck-Institut für Aeronomie',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '1986-03-14',
      instrument: 'Halley Multicolour Camera (HMC)',
      wavelength: 'Visible polychromatic (400–800 nm)',
      processing: 'Multi-exposure jet enhancement'
    }
  ],

  'bennu': [
    {
      id: 'img-bennu-osiris-1',
      associatedObjectId: 'bennu',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA23497/PIA23497~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23497/PIA23497~thumb.jpg',
      title: 'Asteroid Bennu High-Resolution Mosaic (OSIRIS-REx)',
      caption: 'Detailed mosaic of near-Earth asteroid Bennu showing rubble-pile structure and boulder-strewn surface.',
      sourceOrganization: 'NASA / Goddard / University of Arizona',
      sourceUrl: 'https://images.nasa.gov/details/PIA23497',
      credit: 'NASA/Goddard/University of Arizona',
      assetClassification: 'spacecraft',
      isVerifiedRealObservation: true,
      observationDate: '2019-03-21',
      instrument: 'PolyCam (OCAMS Camera Suite)',
      wavelength: 'Panchromatic Visible',
      processing: 'Orthographic global surface reconstruction'
    }
  ],

  'sedna': [
    {
      id: 'img-sedna-discovery-1',
      associatedObjectId: 'sedna',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA21422/PIA21422~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21422/PIA21422~thumb.jpg',
      title: 'Sedna and Outer Solar System Architecture (Artist Concept)',
      caption: 'Scientific illustration of the distant detached trans-Neptunian object 90377 Sedna on its extreme 11,400-year orbit.',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA21422',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2004',
      instrument: 'Caltech Palomar / Spitzer Space Telescope Confirmation',
      wavelength: 'Optical / Thermal Infrared',
      processing: 'Astronomical illustration grounded in 48-inch Samuel Oschin Telescope discovery photometry'
    }
  ],

  'planet-x': [
    {
      id: 'img-planet-x-simulation-1',
      associatedObjectId: 'planet-x',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA21422/PIA21422~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21422/PIA21422~thumb.jpg',
      title: 'Hypothetical Planet Nine / Planet X Orbital Hypothesis',
      caption: 'Astrophysical simulation showing clustering of extreme trans-Neptunian objects under the gravitational influence of a distant hypothetical massive planet.',
      sourceOrganization: 'Caltech / R. Hurt (IPAC)',
      sourceUrl: 'https://images.nasa.gov/details/PIA21422',
      credit: 'Caltech/R. Hurt (IPAC)',
      assetClassification: 'simulation',
      isVerifiedRealObservation: false,
      observationDate: '2016-01-20',
      instrument: 'Theoretical N-Body Gravitational Simulation',
      wavelength: 'Theoretical dynamical model',
      processing: 'Computer gravitational perturbation simulation'
    }
  ],

  // =========================================================================
  // CONFIRMED EXOPLANETS (NASA EXOPLANET EXPLORATION & ARCHIVE)
  // =========================================================================
  'trappist-1-e': [
    {
      id: 'img-trappist-1e-1',
      associatedObjectId: 'trappist-1-e',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA24371/PIA24371~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA24371/PIA24371~thumb.jpg',
      title: 'TRAPPIST-1 System Comparison (Artist Concept)',
      caption: 'Scientific comparison of the seven Earth-sized rocky worlds of TRAPPIST-1, highlighting temperate planet e.',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA24371',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2021-01-22',
      instrument: 'Spitzer Space Telescope & VLT TRAPPIST Photometer',
      wavelength: 'Transit photometry (4.5 μm & optical)',
      processing: 'Peer-reviewed artist impression derived from transit density measurements'
    }
  ],

  'kepler-186-f': [
    {
      id: 'img-kepler-186f-1',
      associatedObjectId: 'kepler-186-f',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA17999/PIA17999~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA17999/PIA17999~thumb.jpg',
      title: 'Kepler-186f: First Earth-Size Planet in Habitable Zone',
      caption: 'Artist concept of Kepler-186f, the first validated Earth-size planet found orbiting in the circumstellar habitable zone of an M-dwarf star.',
      sourceOrganization: 'NASA Ames / SETI Institute / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA17999',
      credit: 'NASA Ames/SETI Institute/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2014-04-17',
      instrument: 'Kepler Space Telescope Photometer',
      wavelength: 'Optical transit light curve (400–850 nm)',
      processing: 'Scientific illustration modeled on stellar effective temperature (3755 K)'
    }
  ],

  'kepler-452-b': [
    {
      id: 'img-kepler-452b-1',
      associatedObjectId: 'kepler-452-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA19830/PIA19830~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA19830/PIA19830~thumb.jpg',
      title: 'Kepler-452b: Earth’s Bigger, Older Cousin (Artist Concept)',
      caption: 'Artist impression of super-Earth Kepler-452b orbiting in the habitable zone of a G2-type solar twin star.',
      sourceOrganization: 'NASA Ames / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA19830',
      credit: 'NASA Ames/JPL-Caltech/T. Pyle',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2015-07-23',
      instrument: 'Kepler Space Telescope Photometer',
      wavelength: 'Optical broadband transit',
      processing: 'Artistic visualization based on 1.63 Earth radii measurement'
    }
  ],

  '51-pegasi-b': [
    {
      id: 'img-51-peg-b-1',
      associatedObjectId: '51-pegasi-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~thumb.jpg',
      title: '51 Pegasi b: Prototype "Hot Jupiter" (Artist Concept)',
      caption: 'Artist rendering of 51 Pegasi b, the historic first exoplanet discovered orbiting a Sun-like main-sequence star in 1995.',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA19832',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '1995-10-06',
      instrument: 'Observatoire de Haute-Provence (ELODIE Spectrograph)',
      wavelength: 'High-precision Doppler radial velocity',
      processing: 'Artistic representation of gas giant atmosphere at 1200 K'
    }
  ],

  'kepler-16-b': [
    {
      id: 'img-kepler-16b-1',
      associatedObjectId: 'kepler-16-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA14757/PIA14757~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA14757/PIA14757~thumb.jpg',
      title: 'Kepler-16b: Circumbinary World with Double Sunset',
      caption: 'First confirmed circumbinary exoplanet orbiting two parent stars (a K-dwarf and red dwarf pair).',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA14757',
      credit: 'NASA/JPL-Caltech/T. Pyle',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2011-09-15',
      instrument: 'Kepler Photometer',
      wavelength: 'Optical transit light curves',
      processing: 'Scientific concept of twin sunset on Saturn-mass world'
    }
  ],

  'kepler-22-b': [
    {
      id: 'img-kepler-22b-1',
      associatedObjectId: 'kepler-22-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA14886/PIA14886~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA14886/PIA14886~thumb.jpg',
      title: 'Kepler-22b in the Habitable Zone (Artist Concept)',
      caption: 'Artist depiction of Kepler-22b, the first planet that Kepler confirmed as orbiting inside the habitable zone of a Sun-like star.',
      sourceOrganization: 'NASA Ames / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA14886',
      credit: 'NASA/Ames/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2011-12-05',
      instrument: 'Kepler Space Telescope Photometer',
      wavelength: 'Optical transit',
      processing: '2.4 Earth radii water-rich or sub-Neptune model'
    }
  ],

  '55-cancri-e': [
    {
      id: 'img-55-cnc-e-1',
      associatedObjectId: '55-cancri-e',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA20068/PIA20068~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA20068/PIA20068~thumb.jpg',
      title: '55 Cancri e (Janssen) Lava World Thermal Map',
      caption: 'Thermal map concept derived from Spitzer Space Telescope infrared observations showing dramatic day-night temperature swings.',
      sourceOrganization: 'NASA / JPL-Caltech',
      sourceUrl: 'https://images.nasa.gov/details/PIA20068',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2016-03-30',
      instrument: 'Spitzer Space Telescope Infrared Array Camera (IRAC)',
      wavelength: '4.5 μm Infrared',
      processing: 'Thermal brightness map rendered as glowing magma surface'
    }
  ],

  'wasp-121-b': [
    {
      id: 'img-wasp-121b-1',
      associatedObjectId: 'wasp-121-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA23687/PIA23687~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23687/PIA23687~thumb.jpg',
      title: 'Ultra-Hot Jupiter WASP-121b (Artist Concept)',
      caption: 'Artist impression of heavy-metal gas giant WASP-121b where temperatures exceed 2,500 K and evaporated iron and magnesium stream into space.',
      sourceOrganization: 'NASA / ESA / STScI',
      sourceUrl: 'https://images.nasa.gov/details/PIA23687',
      credit: 'NASA/ESA/J. Olmsted (STScI)',
      assetClassification: 'artist-impression',
      isVerifiedRealObservation: false,
      observationDate: '2019-08-01',
      instrument: 'Hubble Space Telescope Space Telescope Imaging Spectrograph (STIS)',
      wavelength: 'Near-ultraviolet (NUV) spectroscopy',
      processing: 'Model based on magnesium II and iron II absorption signatures'
    }
  ],

  'wasp-39-b': [
    {
      id: 'img-wasp-39b-1',
      associatedObjectId: 'wasp-39-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~thumb.jpg',
      title: 'WASP-39b Carbon Dioxide & Atmospheric Spectrum (JWST)',
      caption: 'JWST transmission spectrum proving the presence of carbon dioxide and sulfur dioxide photochemistry on WASP-39b.',
      sourceOrganization: 'NASA / ESA / CSA / STScI',
      sourceUrl: 'https://images.nasa.gov/details/PIA25439',
      credit: 'NASA/ESA/CSA/STScI',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2022-08-25',
      instrument: 'James Webb Space Telescope Near-Infrared Spectrograph (NIRSpec)',
      wavelength: '3.0–5.5 μm Infrared Transmission',
      processing: 'Calibrated spectral transmission curve and atmospheric model'
    }
  ],

  'beta-pictoris-b': [
    {
      id: 'img-beta-pic-b-1',
      associatedObjectId: 'beta-pictoris-b',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA18104/PIA18104~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA18104/PIA18104~thumb.jpg',
      title: 'Direct Infrared Image of Exoplanet Beta Pictoris b',
      caption: 'Rare direct photograph of an exoplanet captured using adaptive optics coronagraphy physically blocking star glare.',
      sourceOrganization: 'ESO / VLT / A.-M. Lagrange',
      sourceUrl: 'https://images.nasa.gov/details/PIA18104',
      credit: 'ESO/A.-M. Lagrange et al.',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2010-06-10',
      instrument: 'ESO Very Large Telescope NACO Instrument',
      wavelength: 'L-band Thermal Infrared (3.8 μm)',
      processing: 'Direct optical coronagraph observation'
    }
  ],

  'hr-8799': [
    {
      id: 'img-hr-8799-1',
      associatedObjectId: 'hr-8799',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA12835/PIA12835~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA12835/PIA12835~thumb.jpg',
      title: 'HR 8799 Four Directly Imaged Exoplanets (Keck Observatory)',
      caption: 'Historic direct photographic time-lapse showing four massive exoplanets in orbital motion around their host star.',
      sourceOrganization: 'W. M. Keck Observatory / C. Marois',
      sourceUrl: 'https://images.nasa.gov/details/PIA12835',
      credit: 'NRC-HIA/W. M. Keck Observatory/C. Marois et al.',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2008-2016',
      instrument: 'Keck II Adaptive Optics (NIRC2)',
      wavelength: 'Near-Infrared H and K bands',
      processing: 'Direct observation angular differential imaging'
    }
  ],

  // =========================================================================
  // STARS & STELLAR SYSTEMS (SIMBAD BENCHMARKS)
  // =========================================================================
  'sirius-a': [
    {
      id: 'img-star-sirius-1',
      associatedObjectId: 'sirius-a',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA04921/PIA04921~medium.jpg', // GALEX UV
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA04921/PIA04921~thumb.jpg',
      title: 'Sirius A and Sirius B (Hubble Space Telescope)',
      caption: 'High-contrast optical observation of Sirius A and its faint white dwarf companion Sirius B (the Pup).',
      sourceOrganization: 'NASA / ESA / Hubble Heritage Team',
      sourceUrl: 'https://images.nasa.gov/details/PIA04921',
      credit: 'NASA/ESA/H. Bond (STScI) and M. Barstow (University of Leicester)',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2005-12-13',
      instrument: 'Hubble WFPC2',
      wavelength: 'Optical / Far-UV (F439W filter)',
      processing: 'Calibrated stellar point-spread-function subtraction'
    }
  ],

  'betelgeuse': [
    {
      id: 'img-star-betelgeuse-1',
      associatedObjectId: 'betelgeuse',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA16680/PIA16680~thumb.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA16680/PIA16680~thumb.jpg',
      title: 'Betelgeuse Surface & Asymmetrical Dust Envelope',
      caption: 'Sub-millimeter and infrared image revealing giant convection cells and stellar pulsations on red supergiant Betelgeuse.',
      sourceOrganization: 'ESO / ALMA / VLT SPHERE',
      sourceUrl: 'https://images.nasa.gov/details/PIA16680',
      credit: 'ESO/M. Montargès et al.',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2019-12-15',
      instrument: 'VLT SPHERE / ALMA Interferometer',
      wavelength: 'Sub-millimeter & Visible Polarimetry (0.8–1.3 mm)',
      processing: 'Interferometric angular resolution image'
    }
  ],

  'vega': [
    {
      id: 'img-star-vega-1',
      associatedObjectId: 'vega',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA07218/PIA07218~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA07218/PIA07218~thumb.jpg',
      title: 'Vega Debris Disk (Spitzer Space Telescope)',
      caption: 'Infrared observation showing the expansive circumstellar dust ring surrounding rapid rotator Vega.',
      sourceOrganization: 'NASA / JPL-Caltech / University of Arizona',
      sourceUrl: 'https://images.nasa.gov/details/PIA07218',
      credit: 'NASA/JPL-Caltech/Univ. of Arizona',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2005-01-10',
      instrument: 'Spitzer Multiband Imaging Photometer (MIPS)',
      wavelength: '24, 70, 160 μm Far-Infrared',
      processing: 'Calibrated thermal infrared composite'
    }
  ],

  // =========================================================================
  // SPHEREx INFRARED OBSERVATORY PRODUCTS
  // =========================================================================
  'carina-nebula': [
    {
      id: 'img-spherex-carina-1',
      associatedObjectId: 'carina-nebula',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA26537/PIA26537~medium.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA26537/PIA26537~thumb.jpg',
      title: 'Carina Nebula Star-Forming Pillars (SPHEREx Calibration)',
      caption: 'Infrared spectroscopy calibration field in the Carina Nebula tracing polycyclic aromatic hydrocarbons and ices.',
      sourceOrganization: 'NASA / JPL-Caltech / SPHEREx Science Team',
      sourceUrl: 'https://images.nasa.gov/details/PIA26537',
      credit: 'NASA/JPL-Caltech/SPHEREx Team',
      assetClassification: 'observation',
      isVerifiedRealObservation: true,
      observationDate: '2024-08-15',
      instrument: 'Linear Variable Filter (LVF) Spectrometer',
      wavelength: '0.75–5.0 μm (102 Spectral Channels)',
      processing: 'Spectrally calibrated datacube projection'
    }
  ]
};

/**
 * Normalized key helper to look up objects regardless of formatting
 * (e.g. "TRAPPIST-1 e", "trappist-1-e", "trappist 1 e")
 */
export function normalizeObjectId(idOrName: string): string {
  if (!idOrName) return '';
  return idOrName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Lookup verified image by object ID or name with fuzzy fallback
 */
export function getVerifiedAstronomicalImage(idOrName: string): AstronomicalImageRecord | null {
  const key = normalizeObjectId(idOrName);
  
  if (VERIFIED_ASTRONOMICAL_IMAGES[key] && VERIFIED_ASTRONOMICAL_IMAGES[key].length > 0) {
    return VERIFIED_ASTRONOMICAL_IMAGES[key][0];
  }

  // Check aliases and partial match
  for (const [registeredKey, records] of Object.entries(VERIFIED_ASTRONOMICAL_IMAGES)) {
    if (key.includes(registeredKey) || registeredKey.includes(key)) {
      return records[0];
    }
  }

  return null;
}

/**
 * Get all verified images for an object (gallery support)
 */
export function getVerifiedAstronomicalGallery(idOrName: string): AstronomicalImageRecord[] {
  const key = normalizeObjectId(idOrName);
  
  if (VERIFIED_ASTRONOMICAL_IMAGES[key]) {
    return VERIFIED_ASTRONOMICAL_IMAGES[key];
  }

  for (const [registeredKey, records] of Object.entries(VERIFIED_ASTRONOMICAL_IMAGES)) {
    if (key.includes(registeredKey) || registeredKey.includes(key)) {
      return records;
    }
  }

  return [];
}
