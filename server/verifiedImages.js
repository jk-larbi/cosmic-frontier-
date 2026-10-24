/**
 * Server-side Verified Astronomical Images Registry & NASA API Proxy
 * 
 * Provides verified NASA/ESA/JPL mission imagery for all astronomical categories.
 */

const VERIFIED_IMAGES = {
  // Solar System Bodies
  'sun': {
    id: 'img-sun-sdo',
    associatedObjectId: 'sun',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~thumb.jpg',
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
  },
  'mercury': {
    id: 'img-mercury-messenger',
    associatedObjectId: 'mercury',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~thumb.jpg',
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
  },
  'venus': {
    id: 'img-venus-magellan',
    associatedObjectId: 'venus',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~thumb.jpg',
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
    processing: 'Radar backscatter mosaic'
  },
  'earth': {
    id: 'img-earth-epic',
    associatedObjectId: 'earth',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~thumb.jpg',
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
  },
  'moon': {
    id: 'img-moon-galileo',
    associatedObjectId: 'moon',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~thumb.jpg',
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
  },
  'mars': {
    id: 'img-mars-viking',
    associatedObjectId: 'mars',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA02653/PIA02653~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA02653/PIA02653~thumb.jpg',
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
  },
  'jupiter': {
    id: 'img-jupiter-cassini',
    associatedObjectId: 'jupiter',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA02972/PIA02972~thumb.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA02972/PIA02972~thumb.jpg',
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
  },
  'saturn': {
    id: 'img-saturn-cassini',
    associatedObjectId: 'saturn',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA06077/PIA06077~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA06077/PIA06077~thumb.jpg',
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
  },
  'uranus': {
    id: 'img-uranus-voyager',
    associatedObjectId: 'uranus',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~thumb.jpg',
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
  },
  'neptune': {
    id: 'img-neptune-voyager',
    associatedObjectId: 'neptune',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~thumb.jpg',
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
  },
  'pluto': {
    id: 'img-pluto-new-horizons',
    associatedObjectId: 'pluto',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA09234/PIA09234~small.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA09234/PIA09234~small.jpg',
    title: 'Pluto High-Resolution Global Portrait (New Horizons)',
    caption: 'High-resolution true color view of Pluto featuring Tombaugh Regio (the vast nitrogen-ice heart basin).',
    sourceOrganization: 'NASA / Johns Hopkins University APL / Southwest Research Institute',
    sourceUrl: 'https://images.nasa.gov/details/PIA09234',
    credit: 'NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute',
    assetClassification: 'spacecraft',
    isVerifiedRealObservation: true,
    observationDate: '2015-07-14',
    instrument: 'Long Range Reconnaissance Imager (LORRI)',
    wavelength: 'Visible / Near-IR',
    processing: 'High-resolution photometric mosaic'
  },
  'ceres': {
    id: 'img-ceres-dawn',
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
  },
  'vesta': {
    id: 'img-vesta-dawn',
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
  },
  'apophis': {
    id: 'img-apophis-goldstone',
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
  },
  'bennu': {
    id: 'img-bennu-osiris',
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
  },
  'trappist-1-e': {
    id: 'img-trappist-1e',
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
  },
  'kepler-186-f': {
    id: 'img-kepler-186f',
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
  },
  'kepler-452-b': {
    id: 'img-kepler-452b',
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
  },
  '51-pegasi-b': {
    id: 'img-51-peg-b',
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
  },
  'wasp-121-b': {
    id: 'img-wasp-121b',
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
    instrument: 'Hubble Space Telescope STIS',
    wavelength: 'Near-ultraviolet (NUV) spectroscopy',
    processing: 'Model based on magnesium II and iron II absorption signatures'
  },
  'wasp-39-b': {
    id: 'img-wasp-39b',
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
    instrument: 'JWST NIRSpec',
    wavelength: '3.0–5.5 μm Infrared Transmission',
    processing: 'Calibrated spectral transmission curve and atmospheric model'
  },
  'beta-pictoris-b': {
    id: 'img-beta-pic-b',
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
  },
  'hr-8799': {
    id: 'img-hr-8799',
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
  },

  // -----------------------------------------------------
  // VERIFIED DEEP-SKY GALAXIES & CLUSTERS
  // -----------------------------------------------------
  'andromeda-m31': {
    id: "img-andromeda-m31",
    associatedObjectId: "andromeda-m31",
    imageUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~thumb.jpg",
    title: "Andromeda Galaxy Across Wavelengths",
    caption: "Multi-spectral composite revealing Andromeda's spiral arms traced by hot young stars (blue, UV) and cool interstellar dust (orange, infrared).",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA04921",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "GALEX / Spitzer / WISE"
  },
  'triangulum-m33': {
    id: "img-triangulum-m33",
    associatedObjectId: "triangulum-m33",
    imageUrl: "https://images-assets.nasa.gov/image/PIA11969/PIA11969~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA11969/PIA11969~thumb.jpg",
    title: "M33: Ultraviolet Portrait of the Triangulum Galaxy",
    caption: "Galaxy Evolution Explorer (GALEX) ultraviolet mosaic mapping energetic radiation from hot O and B class stars in the loose spiral arms of M33.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA11969",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "GALEX"
  },
  'whirlpool-m51': {
    id: "img-whirlpool-m51",
    associatedObjectId: "whirlpool-m51",
    imageUrl: "https://images-assets.nasa.gov/image/PIA10200/PIA10200~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA10200/PIA10200~thumb.jpg",
    title: "Whirlpool Galaxy Great Observatories Composite (M51)",
    caption: "Great Observatories composite combining Hubble optical, Chandra X-ray, and Spitzer infrared data to unveil the grand-design spiral structure and companion NGC 5195.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA10200",
    credit: "NASA/JPL-Caltech/STScI/CXC",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble / Chandra / Spitzer"
  },
  'sombrero-m104': {
    id: "img-sombrero-m104",
    associatedObjectId: "sombrero-m104",
    imageUrl: "https://images-assets.nasa.gov/image/PIA15427/PIA15427~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA15427/PIA15427~thumb.jpg",
    title: "Sombrero Galaxy Infrared Portrait (M104, Spitzer)",
    caption: "Spitzer Space Telescope infrared view revealing the Sombrero galaxy as a split personality: an elliptical galaxy with an embedded thin disk of star-forming dust.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA15427",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Spitzer Space Telescope"
  },
  'large-magellanic-cloud': {
    id: "img-large-magellanic-cloud",
    associatedObjectId: "large-magellanic-cloud",
    imageUrl: "https://images-assets.nasa.gov/image/PIA15254/PIA15254~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA15254/PIA15254~thumb.jpg",
    title: "Large Magellanic Cloud Infrared Mosaic (Herschel/Spitzer)",
    caption: "Herschel Space Observatory and Spitzer Space Telescope far-infrared mosaic of the Large Magellanic Cloud showing cool interstellar dust filaments and 30 Doradus.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA15254",
    credit: "ESA/NASA/JPL-Caltech/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Herschel / Spitzer Space Telescope"
  },
  'pinwheel-m101': {
    id: "img-pinwheel-m101",
    associatedObjectId: "pinwheel-m101",
    imageUrl: "https://images-assets.nasa.gov/image/PIA15630/PIA15630~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA15630/PIA15630~thumb.jpg",
    title: "Pinwheel Galaxy Multiwavelength Composite (M101)",
    caption: "Multiwavelength composite combining Chandra (X-ray, purple), GALEX (UV, blue), Hubble (optical, yellow), and Spitzer (IR, red) across the face-on spiral M101.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA15630",
    credit: "NASA/CXC/STScI/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Chandra / GALEX / Hubble / Spitzer"
  },
  'small-magellanic-cloud': {
    id: "img-small-magellanic-cloud",
    associatedObjectId: "small-magellanic-cloud",
    imageUrl: "https://images-assets.nasa.gov/image/PIA15255/PIA15255~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA15255/PIA15255~thumb.jpg",
    title: "Small Magellanic Cloud Infrared Portrait (Herschel/Spitzer)",
    caption: "Herschel and Spitzer far-infrared mosaic exposing the stellar bar and dusty wing of dwarf irregular galaxy SMC.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA15255",
    credit: "ESA/NASA/JPL-Caltech/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Herschel / Spitzer"
  },
  'sculptor-galaxy-ngc253': {
    id: "img-sculptor-galaxy-ngc253",
    associatedObjectId: "sculptor-galaxy-ngc253",
    imageUrl: "https://images-assets.nasa.gov/image/PIA13440/PIA13440~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA13440/PIA13440~thumb.jpg",
    title: "Sculptor Galaxy Infrared Portrait (NGC 253, Spitzer)",
    caption: "Spitzer Space Telescope infrared mosaic charting the intense starburst nucleus and dense dust lanes of NGC 253.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA13440",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Spitzer Space Telescope"
  },
  'barred-spiral-ngc1300': {
    id: "img-barred-spiral-ngc1300",
    associatedObjectId: "barred-spiral-ngc1300",
    imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002154/GSFC_20171208_Archive_e002154~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002154/GSFC_20171208_Archive_e002154~medium.jpg",
    title: "Barred Spiral Galaxy NGC 1300 (Hubble ACS)",
    caption: "Hubble Space Telescope Advanced Camera for Surveys optical portrait resolving dust filaments and young star clusters along NGC 1300 central bar.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20171208_Archive_e002154",
    credit: "NASA/ESA/Hubble Heritage Team (STScI/AURA)",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble Space Telescope"
  },
  'southern-pinwheel-m83': {
    id: "img-southern-pinwheel-m83",
    associatedObjectId: "southern-pinwheel-m83",
    imageUrl: "https://images-assets.nasa.gov/image/PIA13117/PIA13117~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA13117/PIA13117~thumb.jpg",
    title: "Southern Pinwheel Galaxy in Infrared (M83, WISE)",
    caption: "Wide-field Infrared Survey Explorer 4-band infrared mosaic tracing spiral arm star clusters and warm dust lanes in Messier 83.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA13117",
    credit: "NASA/JPL-Caltech/WISE Team",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "WISE"
  },
  'virgo-a-m87': {
    id: "img-virgo-a-m87",
    associatedObjectId: "virgo-a-m87",
    imageUrl: "https://images-assets.nasa.gov/image/PIA23122/PIA23122~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA23122/PIA23122~thumb.jpg",
    title: "Giant Elliptical Messier 87 & Relativistic Jet (Spitzer IR)",
    caption: "Spitzer Space Telescope infrared observation showing shockwaves created by the relativistic jet launched from M87 supermassive black hole.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA23122",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Spitzer Space Telescope"
  },
  'ngc-3610': {
    id: "img-ngc-3610",
    associatedObjectId: "ngc-3610",
    imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000504/GSFC_20171208_Archive_e000504~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000504/GSFC_20171208_Archive_e000504~small.jpg",
    title: "Hubble Views a Young Elliptical Galaxy (NGC 3610)",
    caption: "Hubble Space Telescope optical observation capturing the luminous core and faint concentric shell remnants of elliptical galaxy NGC 3610.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20171208_Archive_e000504",
    credit: "NASA/ESA/Hubble Heritage Team (STScI/AURA)",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble Space Telescope"
  },
  'ngc-2768': {
    id: "img-ngc-2768",
    associatedObjectId: "ngc-2768",
    imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000500/GSFC_20171208_Archive_e000500~small.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000500/GSFC_20171208_Archive_e000500~thumb.jpg",
    title: "Hubble Peers Through the Elliptical Haze (NGC 2768)",
    caption: "Hubble Space Telescope Advanced Camera for Surveys view revealing the central dust lane and luminous halo of elliptical galaxy NGC 2768.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/GSFC_20171208_Archive_e000500",
    credit: "NASA/ESA/Hubble Heritage Team (STScI/AURA)",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble Space Telescope"
  },
  'centaurus-a-ngc5128': {
    id: "img-centaurus-a-ngc5128",
    associatedObjectId: "centaurus-a-ngc5128",
    imageUrl: "https://images-assets.nasa.gov/image/PIA04624/PIA04624~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04624/PIA04624~thumb.jpg",
    title: "Active Galaxy Centaurus A Multi-wavelength View",
    caption: "Chandra X-ray (blue) and VLT optical (orange) composite showing relativistic jets and prominent dust belt bisecting Centaurus A.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA04624",
    credit: "NASA/CXC/ESO/R.Kraft et al.",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Chandra X-ray / ESO VLT"
  },
  'antennae-galaxies': {
    id: "img-antennae-galaxies",
    associatedObjectId: "antennae-galaxies",
    imageUrl: "https://images-assets.nasa.gov/image/PIA13316/PIA13316~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA13316/PIA13316~thumb.jpg",
    title: "Antennae Galaxies Colliding (Hubble/Chandra/Spitzer)",
    caption: "Great Observatories composite showing galactic collision between NGC 4038 and NGC 4039 triggering starburst knots and expansive tidal tails.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA13316",
    credit: "NASA/ESA/CXC/JPL-Caltech/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble / Chandra / Spitzer"
  },
  'cigar-galaxy-m82': {
    id: "img-cigar-galaxy-m82",
    associatedObjectId: "cigar-galaxy-m82",
    imageUrl: "https://images-assets.nasa.gov/image/PIA04218/PIA04218~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04218/PIA04218~thumb.jpg",
    title: "Cigar Galaxy Starburst Core & Superwind (M82)",
    caption: "Hubble Space Telescope and Spitzer Space Telescope composite showing glowing hydrogen gas superwind ejected perpendicular to M82 disk.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA04218",
    credit: "NASA/ESA/STScI/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble / Spitzer Space Telescope"
  },
  'cartwheel-galaxy': {
    id: "img-cartwheel-galaxy",
    associatedObjectId: "cartwheel-galaxy",
    imageUrl: "https://images-assets.nasa.gov/image/PIA03296/PIA03296~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA03296/PIA03296~thumb.jpg",
    title: "Cartwheel Galaxy Ring Expansion (Chandra/Hubble/Spitzer/GALEX)",
    caption: "Great Observatories composite showing cosmic collision ripple expanding at over 200,000 mph through the Cartwheel Galaxy ring.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA03296",
    credit: "NASA/JPL-Caltech/CXC/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble / Chandra / GALEX / Spitzer"
  },
  'messier-77-ngc1068': {
    id: "img-messier-77-ngc1068",
    associatedObjectId: "messier-77-ngc1068",
    imageUrl: "https://images-assets.nasa.gov/image/PIA20057/PIA20057~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA20057/PIA20057~thumb.jpg",
    title: "NuSTAR High-Energy X-Ray View of Seyfert 2 Galaxy M77",
    caption: "NuSTAR high-energy X-ray observation penetrating the obscuring gas cloud surrounding the active galactic nucleus of Messier 77 (NGC 1068).",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA20057",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "NuSTAR"
  },
  'quasar-3c273': {
    id: "img-quasar-3c273",
    associatedObjectId: "quasar-3c273",
    imageUrl: "https://images-assets.nasa.gov/image/7995525/7995525~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/7995525/7995525~thumb.jpg",
    title: "Quasar 3C 273 X-Ray Jet (HEAO-2 / Einstein Observatory)",
    caption: "Historic X-ray imaging from the Einstein Observatory (HEAO-2) resolving the high-energy jet launched by quasar 3C 273.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/7995525",
    credit: "NASA/MSFC",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "HEAO-2 / Einstein Observatory"
  },
  'markarian-231': {
    id: "img-markarian-231",
    associatedObjectId: "markarian-231",
    imageUrl: "https://images-assets.nasa.gov/image/PIA18467/PIA18467~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA18467/PIA18467~thumb.jpg",
    title: "Markarian 231 Supermassive Black Hole Binary Candidate",
    caption: "NuSTAR and Chandra X-ray observations tracking extreme relativistic accretion disk emission in ultraluminous infrared galaxy Mrk 231.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA18467",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "NuSTAR / Chandra"
  },
  'virgo-cluster-core': {
    id: "img-virgo-cluster-core",
    associatedObjectId: "virgo-cluster-core",
    imageUrl: "https://images-assets.nasa.gov/image/PIA07906/PIA07906~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA07906/PIA07906~thumb.jpg",
    title: "Virgo Galaxy Cluster Multi-wavelength Mosaic",
    caption: "Wide-field GALEX ultraviolet and Spitzer infrared mosaic spanning the core of the Virgo Cluster, anchored by giant elliptical Messier 87.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA07906",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "GALEX / Spitzer"
  },
  'coma-cluster-abell1656': {
    id: "img-coma-cluster-abell1656",
    associatedObjectId: "coma-cluster-abell1656",
    imageUrl: "https://images-assets.nasa.gov/image/PIA04210/PIA04210~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04210/PIA04210~thumb.jpg",
    title: "Coma Galaxy Cluster Infrared Panoramic (Abell 1656)",
    caption: "Spitzer Space Telescope infrared mosaic containing over a thousand galaxies locked in a colossal gravitational well 320 million light-years away.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA04210",
    credit: "NASA/JPL-Caltech",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Spitzer Space Telescope"
  },
  'stephans-quintet': {
    id: "img-stephans-quintet",
    associatedObjectId: "stephans-quintet",
    imageUrl: "https://images-assets.nasa.gov/image/PIA04201/PIA04201~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04201/PIA04201~thumb.jpg",
    title: "Stephan's Quintet Compact Group (Hubble WFPC2)",
    caption: "Hubble Wide Field and Planetary Camera 2 optical portrait of compact galaxy group Hickson 92, exhibiting tidal tails and gravitational shock fronts.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/PIA04201",
    credit: "NASA/ESA/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "Hubble Space Telescope"
  },
  'smacs-j0723': {
    id: "img-smacs-j0723",
    associatedObjectId: "smacs-j0723",
    imageUrl: "https://images-assets.nasa.gov/image/webb_first_deep_field/webb_first_deep_field~medium.jpg",
    thumbnailUrl: "https://images-assets.nasa.gov/image/webb_first_deep_field/webb_first_deep_field~thumb.jpg",
    title: "SMACS J0723.3-7327 (Webb's First Deep Field)",
    caption: "James Webb Space Telescope NIRCam infrared deep field revealing massive gravitational lensing arcs from early galaxies over 13 billion years in the past.",
    sourceOrganization: "NASA / Space Telescope Science Institute",
    sourceUrl: "https://images.nasa.gov/details/webb_first_deep_field",
    credit: "NASA/ESA/CSA/STScI",
    assetClassification: "observation",
    isVerifiedRealObservation: true,
    instrument: "James Webb Space Telescope (JWST)"
  },
};

function normalizeKey(str) {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getVerifiedServerImage(idOrName, context = {}) {
  const k = normalizeKey(idOrName);
  if (VERIFIED_IMAGES[k]) return VERIFIED_IMAGES[k];
  for (const [regKey, val] of Object.entries(VERIFIED_IMAGES)) {
    if (regKey.length > 3 && (k.includes(regKey) || regKey.includes(k))) {
      return val;
    }
  }
  // If requested for an exoplanet or unknown celestial body, attach deterministic physical model
  if (context.isExoplanet || (idOrName && (idOrName.includes(' ') || idOrName.includes('-') || context.category === 'exoplanet'))) {
    const dataUrl = generateDeterministicModelSvg(idOrName);
    return {
      id: `model-${k || 'exoplanet'}`,
      associatedObjectId: idOrName || 'exoplanet',
      imageUrl: dataUrl,
      thumbnailUrl: dataUrl,
      title: `${idOrName} (Physical Model)`,
      caption: `Deterministic physical illustration calculated from NASA Exoplanet Archive parameters. Direct optical photograph is currently beyond resolution limits.`,
      sourceOrganization: 'NASA Exoplanet Archive / Caltech-IPAC',
      sourceUrl: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(idOrName || '')}`,
      credit: 'COSMIC FRONTIER Physical Model / NASA Exoplanet Archive',
      assetClassification: 'scientific-illustration',
      isVerifiedRealObservation: false,
      processing: 'Physical stellar irradiance model'
    };
  }
  return null;
}


function generateDeterministicModelSvg(name) {
  let hash = 5381;
  const str = String(name || 'Exoplanet');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  const hue = seed % 360;
  const col1 = `hsl(${hue}, 65%, 55%)`;
  const col2 = `hsl(${(hue + 45) % 360}, 80%, 25%)`;
  const atmoColor = `hsl(${(hue + 180) % 360}, 90%, 70%)`;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
    <defs>
      <radialGradient id="grad-${seed}" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="30%" stop-color="${col1}"/>
        <stop offset="75%" stop-color="${col2}"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
        <stop offset="85%" stop-color="${atmoColor}" stop-opacity="0"/>
        <stop offset="97%" stop-color="${atmoColor}" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="${atmoColor}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="640" height="360" fill="#050B1A"/>
    <circle cx="320" cy="180" r="115" fill="url(#glow-${seed})"/>
    <circle cx="320" cy="180" r="110" fill="url(#grad-${seed})"/>
    <ellipse cx="360" cy="180" rx="105" ry="110" fill="#000000" opacity="0.6"/>
    <text x="24" y="340" fill="#94A3B8" font-size="11" font-family="monospace" letter-spacing="0.5">PHYSICAL MODEL — NOT AN ACTUAL PHOTOGRAPH • ${str.toUpperCase()}</text>
  </svg>`.trim();
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// In-memory bounded cache for live NASA Image & Video Library queries with 2-hour TTL
const nasaApiCache = new Map();
const NASA_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

// Words that indicate non-planetary terrestrial/ground photos
const IRRELEVANT_PATTERNS = [
  'launch vehicle', 'rocket launch', 'press conference', 'auditorium', 
  'ribbon cutting', 'award ceremony', 'portrait of', 'suit up', 'clean room inspection',
  'center director', 'administrator', 'ground test facility', 'hangar'
];

async function searchNasaImagesApi(query, options = {}) {
  const q = String(query || '').trim();
  if (!q) {
    const empty = [];
    empty.totalHits = 0;
    empty.page = 1;
    empty.pageSize = 12;
    empty.items = [];
    return empty;
  }

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const pageSize = Math.min(24, Math.max(1, parseInt(options.pageSize, 10) || 12));
  const category = options.category ? String(options.category).toLowerCase().trim() : null;
  const cacheKey = `${q.toLowerCase()}_p${page}_s${pageSize}_c${category || 'all'}`;

  const cached = nasaApiCache.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp < NASA_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page=${page}`;
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'CosmicFrontier/1.0' },
      signal: AbortSignal.timeout(6000) 
    });
    if (!res.ok) {
      const fallback = [];
      fallback.totalHits = 0;
      fallback.page = page;
      fallback.pageSize = pageSize;
      fallback.items = [];
      return fallback;
    }
    const data = await res.json();
    const rawItems = data.collection?.items || [];
    const totalHits = data.collection?.metadata?.total_hits || rawItems.length;

    // Filter and map items
    const filtered = [];
    for (const item of rawItems) {
      const d = item.data?.[0] || {};
      const title = d.title || q;
      const desc = d.description || '';
      const text = `${title} ${desc} ${(d.keywords || []).join(' ')}`.toLowerCase();

      // Filter out obvious non-planetary terrestrial photos unless user explicitly searched for spacecraft/hardware
      const isIrrelevantGroundPhoto = IRRELEVANT_PATTERNS.some(p => text.includes(p));
      const wantsHardware = category === 'spacecraft' || q.toLowerCase().includes('spacecraft') || q.toLowerCase().includes('rocket');
      if (isIrrelevantGroundPhoto && !wantsHardware) {
        continue;
      }

      // Find available link URLs
      const linkMap = {};
      for (const l of (item.links || [])) {
        if (l.href) {
          if (l.rel === 'preview') linkMap.thumb = l.href;
          else if (l.href.includes('~orig')) linkMap.orig = l.href;
          else if (l.href.includes('~large')) linkMap.large = l.href;
          else if (l.href.includes('~medium')) linkMap.medium = l.href;
          else if (l.href.includes('~small')) linkMap.small = l.href;
          else if (l.href.includes('~thumb')) linkMap.thumb = l.href;
        }
      }

      const imageUrl = linkMap.medium || linkMap.large || linkMap.orig || linkMap.small || item.links?.[0]?.href;
      if (!imageUrl) continue;

      const thumbUrl = linkMap.thumb || linkMap.small || imageUrl;
      const hdUrl = linkMap.orig || linkMap.large || imageUrl;

      // Classify according to Phase 5 distinct classifications
      let classification = 'observation';
      let isVerified = true;

      if (text.includes('artist') || text.includes('concept') || text.includes('illustration') || text.includes('rendering') || text.includes('impression')) {
        classification = 'artist-concept';
        isVerified = false;
      } else if (text.includes('simulation') || text.includes('numerical model') || text.includes('computed') || text.includes('hydrodynamic')) {
        classification = 'simulation';
        isVerified = false;
      } else if (text.includes('radar') || text.includes('false color') || text.includes('false-color') || text.includes('mosaic') || text.includes('composite') || text.includes('elevation map') || text.includes('coronagraph')) {
        classification = 'processed-observation';
        isVerified = true;
      } else if (text.includes('spacecraft') || text.includes('rover') || text.includes('lander') || text.includes('probe') || text.includes('orbiter')) {
        classification = 'spacecraft-hardware';
        isVerified = true;
      }

      // Filter by category if requested
      if (category === 'observation' && classification !== 'observation' && classification !== 'processed-observation') continue;
      if (category === 'artist-concept' && classification !== 'artist-concept') continue;

      filtered.push({
        id: `nasa-${d.nasa_id || Math.random()}`,
        nasaId: d.nasa_id || '',
        associatedObjectId: q,
        imageUrl,
        thumbnailUrl: thumbUrl,
        thumbUrl,
        hdUrl,
        title,
        caption: desc ? (desc.length > 220 ? desc.slice(0, 220).trim() + '...' : desc) : title,
        description: desc,
        center: d.center ? `NASA / ${d.center}` : 'NASA',
        sourceOrganization: d.center ? `NASA / ${d.center}` : 'NASA',
        sourceUrl: d.nasa_id ? `https://images.nasa.gov/details/${d.nasa_id}` : 'https://images.nasa.gov/',
        creator: d.photographer || d.secondary_creator || undefined,
        credit: d.photographer || d.secondary_creator || (d.center ? `NASA/${d.center}` : 'NASA'),
        assetClassification: classification,
        isVerifiedRealObservation: isVerified,
        dateCreated: d.date_created ? d.date_created.split('T')[0] : undefined,
        observationDate: d.date_created ? d.date_created.split('T')[0] : undefined,
        keywords: d.keywords || []
      });

      if (filtered.length >= pageSize) break;
    }

    // Attach metadata onto array for dual format support
    filtered.totalHits = totalHits;
    filtered.page = page;
    filtered.pageSize = pageSize;
    filtered.items = filtered;

    nasaApiCache.set(cacheKey, { data: filtered, timestamp: now });
    return filtered;
  } catch (err) {
    console.warn(`[NASA Image Search] Query "${q}" failed:`, err.message);
    const errFallback = [];
    errFallback.totalHits = 0;
    errFallback.page = page;
    errFallback.pageSize = pageSize;
    errFallback.items = [];
    return errFallback;
  }
}

export {
  VERIFIED_IMAGES,
  getVerifiedServerImage,
  searchNasaImagesApi
};
