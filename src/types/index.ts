export type AppPage = 'home' | 'spherex' | 'planet-x' | 'guide' | 'ai-guide' | 'about';

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
