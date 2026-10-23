export type AppPage = 'home' | 'spherex' | 'planet-x' | 'guide' | 'about';

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
  bandsData: {
    [bandId: string]: {
      features: string[];
      intensityNotes: string;
      absorptionSignature: string;
    };
  };
  dataStatus: 'Calibrated Astronomical Observation' | 'Processed Infrared Survey' | 'Illustrative Mission Model';
  sourceAttribution: string;
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
}

export interface GuideMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  scientificReference?: string;
  topic?: string;
}

export interface EvidenceTopic {
  id: string;
  title: string;
  summary: string;
  fullExplanation: string;
  confidenceLevel: 'High Correlation' | 'Strong Gravitational Prediction' | 'Ongoing Survey Search' | 'Active Scientific Debate';
  observationsToDate: string;
  futureMissions: string;
  iconName: string;
}

