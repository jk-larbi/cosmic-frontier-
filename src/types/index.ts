export type AppPage = 'home' | 'mission-control' | 'observatory' | 'universe' | 'live-space' | 'asteroid-watch' | 'exoplanets' | 'galaxies' | 'spherex' | 'planet-x' | 'data-centre' | 'guide' | 'ai-guide' | 'about';

export type AstronomicalAssetClassification = 
  | 'observation'
  | 'spacecraft'
  | 'artist-impression'
  | 'scientific-illustration'
  | 'simulation'
  | 'contextual'
  | 'unavailable'
  | 'category-fallback';

export type VerificationLevel = 
  | 'peer-reviewed-archive'
  | 'in-situ-spacecraft'
  | 'space-telescope-calibrated'
  | 'ground-based-astrometry'
  | 'ephemeris-propagation'
  | 'theoretical-model'
  | 'unverified';

export type FreshnessStatus = 'live' | 'cached' | 'archival' | 'stale';

export interface ScientificProvenance {
  sourceOrganization: string;
  catalogName?: string;
  archiveUrl?: string;
  bibcode?: string;
  retrievalDateUTC?: string;
  isLive: boolean;
  freshnessStatus: FreshnessStatus;
  verificationLevel: VerificationLevel;
  disclaimer?: string;
}

export interface ScientificMeasurement<T = number> {
  value: T | null;
  unit: string;
  uncertainty?: T | null;
  method?: string;
  isEstimate: boolean;
  status: 'measured' | 'derived' | 'estimated' | 'unmeasured' | 'hypothetical';
  provenance?: Partial<ScientificProvenance>;
}

export type ImageMatchingStatus = 
  | 'verified-direct-observation'
  | 'verified-spacecraft-photo'
  | 'verified-composite'
  | 'artist-impression'
  | 'physical-model-illustration'
  | 'contextual-field'
  | 'unavailable'
  | 'unverified';

export interface AstronomicalImageRecord {
  id: string;
  associatedObjectId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  hdUrl?: string;
  title: string;
  caption: string;
  sourceOrganization: string;
  sourceUrl?: string;
  credit: string;
  assetClassification: AstronomicalAssetClassification;
  isVerifiedRealObservation: boolean;
  observationDate?: string;
  instrument?: string;
  wavelength?: string;
  processing?: string;
  retrievalTimestamp?: string;
  license?: string;
}

export type GalaxyCategory = 'spiral' | 'elliptical' | 'irregular' | 'active-agn' | 'cluster';

export interface GalaxyImage {
  url: string;
  thumbnailUrl?: string;
  title: string;
  nasaId?: string;
  credit: string;
  caption: string;
  mission?: string;
  isIllustration?: boolean;
  sourcePage?: string;
}

export interface GalaxyObject {
  id: string;
  name: string;
  catalogIdentifier: string;
  alternateNames?: string[];
  category: GalaxyCategory;
  morphologicalType: string;
  constellation: string;
  rightAscension: string;
  declination: string;
  redshift: number;
  redshiftUncertainty?: number;
  radialVelocityKmS: number;
  distanceMly: number | null;
  distanceMpc: number | null;
  distanceMethod: string;
  apparentMagnitude: number | null;
  angularSize: string;
  estimatedDiameterKpc: number | null;
  estimatedDiameterLy?: number | null;
  description: string;
  scientificSignificance: string;
  sourceUrl: string;
  bibcode?: string;
  dataStatus: DataStatusType;
  image?: GalaxyImage;
  images?: AstronomicalImageRecord[];
  isLiveLookup?: boolean;
  catalogs?: {
    messier?: string;
    ngc?: string;
    ic?: string;
    pgc?: string;
    ugc?: string;
    ned?: string;
    simbad?: string;
  };
  fieldStatus?: {
    redshift: 'measured' | 'estimated';
    distance: 'measured' | 'estimated';
    diameter: 'measured' | 'estimated' | 'unmeasured';
    apparentMagnitude: 'measured' | 'unmeasured';
  };
  observationalMetadata?: {
    telescope: string;
    instrument: string;
    wavelength: string;
    observationDate?: string;
    processing: string;
    credit: string;
    license: string;
  };
}

export interface InfraredBand {
  id: string;
  name: string;
  wavelength: number; // in micrometers (µm)
  range: string;
  scientificPurpose: string;
  chemicalTracer: string;
  description: string;
  colorHex: string;
}

export type DataStatusType = 
  | 'Real Archival Data'
  | 'Illustrative Astronomical Model'
  | 'Synthetic Mission Demonstration';

export interface CelestialTarget {
  id: string;
  name: string;
  catalogId: string;
  category: 'Nebula' | 'Galaxy' | 'Protoplanetary Disk' | 'Cosmic Background' | 'Star Cluster';
  distanceLightYears: string;
  constellation: string;
  description: string;
  scientificSignificance: string;
  opticalImage: string;
  infraredImage: string;
  dataStatus: DataStatusType;
  dataSource: string;
  observationDate: string; // "Not available" if unverified
  instrumentDetails: string; // "Not available" if unverified
  telescope: string;
  sourceAttribution: string;
  coordinates?: { ra: string; dec: string };
  calibrationStatus?: string;
  archiveUrl?: string;
  bandsData: {
    [bandWavelength: string]: {
      features: string[];
      intensityNotes: string;
      absorptionSignature: string;
      bandImage?: string;
    };
  };
  spectralProfile?: {
    spectrumType: 'Archival Reference Spectroscopy' | 'Theoretical Radiative Model' | 'Synthetic Instrument Simulation';
    provenance: string;
    points: { wavelength: number; relativeFlux: number }[];
  };
}

export interface SolarSystemObject {
  id: string;
  name: string;
  type: 'Star' | 'Terrestrial Planet' | 'Gas Giant' | 'Ice Giant' | 'Dwarf Planet' | 'Extreme TNO' | 'Hypothetical Planet';
  semiMajorAxisAU: number;
  orbitalPeriodYears: number;
  eccentricity: number;
  inclinationDeg: number;
  perihelionAU: number;
  aphelionAU: number;
  radiusKm: number | string;
  massEarthRelative: number | string;
  color: string;
  orbitalColor: string;
  isHypothetical: boolean;
  discoveryYear?: number | string;
  discoverers?: string;
  description: string;
  scientificContext: string;
  argumentOfPerihelionDeg: number;
  longitudeOfAscendingNodeDeg: number;
  dataSource?: string;
  statusLabel: 'Confirmed' | 'Hypothetical (Unconfirmed)';
  image?: AstronomicalImageRecord;
  images?: AstronomicalImageRecord[];
}

export interface GuideMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  scientificReference?: string;
  topic?: string;
  mode?: 'live' | 'demonstration';
  isAiConnected?: boolean;
  links?: Array<{
    label: string;
    page: AppPage;
    reason?: string;
  }>;
  notice?: string;
  warning?: string;
  error?: boolean;
}

export interface EvidenceTopic {
  id: string;
  title: string;
  summary: string;
  fullExplanation: string;
  researchFocus: string;
  observationsToDate: string;
  debatedAspects: string;
  iconName: string;
}

export interface CandidateCase {
  id: string;
  name: string;
  fieldId: string;
  epoch1Label: string;
  epoch2Label: string;
  epoch1Image: string;
  epoch2Image: string;
  expectedClassification: 'Possible movement' | 'No clear movement' | 'Uncertain';
  explanation: string;
  hints: string;
}

export interface NasaApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  service_version?: string;
}

export interface NasaMissionPhoto {
  title: string;
  nasaId: string;
  thumb: string;
  largeUrl?: string;
  description: string;
  dateCreated?: string;
  center?: string;
}

export interface ExoplanetRecord {
  planetName: string;
  hostStar: string;
  discoveryMethod: string;
  discoveryYear: number;
  orbitalPeriodDays: number | null;
  radiusEarthRadii: number | null;
  massEarthMasses: number | null;
  massJupiterMasses?: number | null;
  semiMajorAxisAU?: number | null;
  eccentricity?: number | null;
  stellarEffectiveTempK: number | null;
  distanceParsecs: number | null;
  distanceLightYears: number | null;
  dataStatus: string;
  disposition?: 'Confirmed' | 'Candidate';
  sourceUrl?: string;
  image?: AstronomicalImageRecord;
  images?: AstronomicalImageRecord[];
}

export interface SmallBodyRecord {
  designation: string;
  fullName: string;
  orbitClass: string;
  semiMajorAxisAU: number | null;
  perihelionAU: number | null;
  eccentricity: number | null;
  inclinationDeg: number | null;
  orbitalPeriodYears: number | null;
  diameterKm: number | null;
  dataStatus: string;
  sourceUrl: string;
}

export interface GalaxyRecord {
  name: string;
  catalogIdentifier: string;
  morphologicalType: string;
  constellation: string;
  rightAscension: string;
  declination: string;
  redshift: number;
  radialVelocityKmS: number;
  distanceMly: number;
  distanceMpc: number;
  description: string;
  sourceUrl: string;
}

export interface StarRecord {
  name: string;
  designation: string;
  spectralType: string;
  constellation: string;
  apparentMagnitudeV: number;
  absoluteMagnitudeV: number;
  effectiveTemperatureK: number;
  distanceLightYears: number;
  distanceParsecs: number;
  description: string;
  sourceUrl: string;
}

export type CatalogCategory = 'all' | 'planets' | 'exoplanets' | 'small-bodies' | 'galaxies' | 'stars' | 'spherex';

export interface CatalogItem {
  id: string;
  name: string;
  category: 'planets' | 'exoplanets' | 'small-bodies' | 'galaxies' | 'stars' | 'spherex';
  categoryLabel: string;
  subtitle: string;
  description: string;
  dataStatus: string;
  sourceName: string;
  sourceUrl: string;
  properties: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  image?: AstronomicalImageRecord;
}

export type LiveDataBadgeStatus = 'LIVE DATA' | 'RECENT DATA' | 'PREDICTED' | 'SIMULATION' | 'UNAVAILABLE';

export interface LiveEphemerisObject {
  id: string;
  name: string;
  designation: string;
  classification: string;
  color: string;
  radiusKm: number | string;
  heliocentricAU: {
    x: number;
    y: number;
    z: number;
  };
  distSunAU: number;
  distSunMillionKm: number;
  distEarthAU: number;
  distEarthMillionKm: number;
  distEarthLunar: number;
  orbitalSpeedKmS: number;
  rightAscension: string;
  declination: string;
  orbitalElements: {
    semiMajorAxisAU: number;
    eccentricity: number;
    inclinationDeg: number;
    longitudeOfAscendingNodeDeg: number;
    argumentOfPerihelionDeg: number;
    meanAnomalyDeg: number;
    trueAnomalyDeg: number;
    orbitalPeriodYears: number;
  };
  dataStatus: LiveDataBadgeStatus;
  coordinateFrame: string;
  calculationEpoch: string;
  retrievalTimestamp: string;
  source: string;
  sourceUrl: string;
  educationalSummary: string;
}

export interface LiveEphemerisResponse {
  epoch: string;
  julianDate: number;
  coordinateFrame: string;
  statusLabel: LiveDataBadgeStatus;
  retrievalTimestamp: string;
  totalObjects: number;
  earthReference: {
    xAU: number;
    yAU: number;
    zAU: number;
    orbitalVelocityKmS: number;
  };
  objects: LiveEphemerisObject[];
}

export interface LiveCloseApproach {
  designation: string;
  fullName: string;
  orbitId: string;
  julianDate: number;
  closeApproachDate: string;
  closeApproachIso: string;
  missDistanceAU: number;
  missDistanceKm: number;
  missDistanceLunar: number;
  distMinAU: number;
  distMaxAU: number;
  distMinKm: number;
  distMaxKm: number;
  relativeVelocityKmS: number;
  vInfinityKmS: number | null;
  uncertaintyTime: string;
  absoluteMagnitudeH: number;
  estimatedDiameterMeters: {
    min: number;
    max: number;
    avg: number;
  };
  isPotentiallyHazardous: boolean;
  impactRisk: {
    hasRisk: boolean;
    assessment: string;
    sentryUrl: string;
  };
  source: string;
  sourceUrl: string;
}

export interface LiveCloseApproachesResponse {
  success: boolean;
  statusLabel: LiveDataBadgeStatus;
  retrievalTimestamp: string;
  epoch: string;
  timeframe: string;
  count: number;
  approaches: LiveCloseApproach[];
}

export type ObservatoryCategory = 
  | 'all' 
  | 'solar-system' 
  | 'asteroids-comets' 
  | 'distant-tnos' 
  | 'exoplanets' 
  | 'deep-sky' 
  | 'spherex-targets';

export type ObservatoryMotionType = 
  | 'analytical-ephemeris' 
  | 'keplerian-orbit' 
  | 'simulation-hypothetical' 
  | 'illustrative-exoplanet' 
  | 'stationary-sky-coord' 
  | 'observation-footprint';

export interface ObservatoryObject {
  id: string;
  name: string;
  designation: string;
  category: ObservatoryCategory;
  categoryLabel: string;
  classification: string;
  color: string;
  radiusKm: number | string;
  motionType: ObservatoryMotionType;
  dataStatus: string;
  isHypothetical: boolean;
  heliocentricAU?: {
    x: number;
    y: number;
    z: number;
  };
  distSunAU?: number;
  distSunMillionKm?: number;
  distEarthAU?: number;
  distEarthLunar?: number;
  orbitalSpeedKmS?: number;
  rightAscension?: string;
  declination?: string;
  orbitalElements?: {
    semiMajorAxisAU: number;
    eccentricity: number;
    inclinationDeg: number;
    longitudeOfAscendingNodeDeg: number;
    argumentOfPerihelionDeg: number;
    meanAnomalyDeg: number;
    trueAnomalyDeg: number;
    orbitalPeriodYears: number;
  };
  exoplanetParams?: {
    hostStar: string;
    orbitalPeriodDays: number | null;
    semiMajorAxisAU: number | null;
    eccentricity: number;
    discoveryMethod: string;
    discoveryYear: number;
    distanceLightYears: number | null;
  };
  celestialCoords?: {
    rightAscension?: string;
    declination?: string;
    redshift?: number;
    radialVelocityKmS?: number;
    distanceMly?: number;
    distanceLightYears?: number;
    constellation?: string;
    apparentMagnitude?: number;
    effectiveTemperatureK?: number;
  };
  description: string;
  source: string;
  sourceUrl: string;
  calculationEpoch: string;
  retrievalTimestamp: string;
  coordinateFrame: string;
  scientificDisclaimer: string;
  image?: AstronomicalImageRecord;
}

export interface ObservatoryApiResponse {
  success: boolean;
  epoch: string;
  julianDate: number;
  retrievalTimestamp: string;
  coordinateFrame: string;
  statusLabel: LiveDataBadgeStatus | string;
  totalCount: number;
  allAvailableCount: number;
  categories: {
    'solar-system': number;
    'asteroids-comets': number;
    'distant-tnos': number;
    'exoplanets': number;
    'deep-sky': number;
    'spherex-targets': number;
  };
  objects: ObservatoryObject[];
}

export interface AsteroidOrbitalElements {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeOfAscendingNodeDeg: number;
  argumentOfPerihelionDeg: number;
  meanAnomalyDeg: number;
  epochJd: number;
  orbitalPeriodYears: number;
  meanMotionDegDay?: number;
}

export interface AsteroidMotionStateVector {
  epochIso: string;
  epochJd: number;
  heliocentricAU: { x: number; y: number; z: number };
  heliocentricKm: { x: number; y: number; z: number };
  earthPositionAU: { x: number; y: number; z: number };
  earthRelativeAU: { x: number; y: number; z: number };
  earthRelativeKm: { x: number; y: number; z: number };
  distSunAU: number;
  distSunMillionKm: number;
  distEarthAU: number;
  distEarthKm: number;
  distEarthMillionKm: number;
  distEarthLunar: number;
  orbitalSpeedKmS: number;
  velocityVectorKmS: { vx: number; vy: number; vz: number };
  meanAnomalyDeg: number;
  trueAnomalyDeg: number;
}

export interface AsteroidMotionResponse {
  success: boolean;
  asteroid: {
    designation: string;
    name: string;
    shortName: string;
    orbitClass: string;
    isPotentiallyHazardous: boolean;
    diameterKm: number | null;
    diameterMeters: { min: number; max: number; avg: number };
    absoluteMagnitudeH: number | null;
    orbitalElements: AsteroidOrbitalElements;
    closeApproach: {
      date: string;
      iso: string;
      nominalDistanceLD: number;
      nominalDistanceKm: number;
      relativeVelocityKmS: number;
      sentryImpactProbability: string;
    } | null;
    educationalSummary: string;
  };
  stateVector: AsteroidMotionStateVector;
  trajectories: {
    asteroidOrbitPath: Array<{ x: number; y: number; z: number }>;
    earthOrbitPath: Array<{ x: number; y: number; z: number }>;
  };
  provenance: {
    source: string;
    isLive: boolean;
    calculationEpoch: string;
    calculationMethod: string;
    coordinateFrame: string;
    retrievalTimestamp: string;
    sourceUrl: string;
    sentryUrl: string;
  };
}
