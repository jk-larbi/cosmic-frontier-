export type AppPage = 'home' | 'universe' | 'spherex' | 'planet-x' | 'data-centre' | 'guide' | 'ai-guide' | 'about';

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
  bandsData: {
    [bandWavelength: string]: {
      features: string[];
      intensityNotes: string;
      absorptionSignature: string;
      bandImage?: string;
    };
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
  stellarEffectiveTempK: number | null;
  distanceParsecs: number | null;
  distanceLightYears: number | null;
  dataStatus: string;
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
}
