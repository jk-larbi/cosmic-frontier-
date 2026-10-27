/**
 * COSMIC FRONTIER — Deep-Space Radar Projection & Telemetry Engine
 * 
 * Provides rigorous ICRF/J2000 heliocentric coordinate projection to radar polar coordinates,
 * range filtering, target categorization, honest detection status tracking, and sweep geometry.
 * 
 * Scientific coordinate frame:
 * - Heliocentric Ecliptic J2000 (Sun at coordinate origin (0, 0, 0))
 * - Distance scale: Astronomical Units (AU) [1 AU = 149,597,870.7 km]
 * - Lunar Distance conversion: 1 AU ≈ 389.174 LD (Earth-Moon mean distance = 384,400 km)
 */

export type RadarRangePresetId = 'inner' | 'outer' | 'tno' | 'deep-space';

export interface RadarRangePreset {
  id: RadarRangePresetId;
  label: string;
  maxRangeAU: number;
  description: string;
  rangeRingsAU: number[];
  ringLabels: Record<number, string>;
}

export const RADAR_RANGE_PRESETS: Record<RadarRangePresetId, RadarRangePreset> = {
  inner: {
    id: 'inner',
    label: 'Inner Solar System (5 AU)',
    maxRangeAU: 5.0,
    description: 'Terrestrial planets (Mercury to Mars), Main Asteroid Belt, and Near-Earth Asteroid close approaches.',
    rangeRingsAU: [1.0, 1.52, 2.77, 5.0],
    ringLabels: {
      1.0: '1.0 AU — Earth Mean Orbit',
      1.52: '1.52 AU — Mars Orbit',
      2.77: '2.77 AU — Asteroid Belt (Ceres)',
      5.0: '5.0 AU — Inner System Limit'
    }
  },
  outer: {
    id: 'outer',
    label: 'Outer Planets (35 AU)',
    maxRangeAU: 35.0,
    description: 'Gas and ice giants (Jupiter, Saturn, Uranus, Neptune), Centaurs, and inner Kuiper Belt boundary.',
    rangeRingsAU: [5.2, 9.58, 19.2, 30.0],
    ringLabels: {
      5.2: '5.2 AU — Jupiter Orbit',
      9.58: '9.6 AU — Saturn Orbit',
      19.2: '19.2 AU — Uranus Orbit',
      30.0: '30.0 AU — Neptune (Classical Limit)'
    }
  },
  tno: {
    id: 'tno',
    label: 'Trans-Neptunian Realm (150 AU)',
    maxRangeAU: 150.0,
    description: 'Kuiper Belt objects, Plutinos, and perihelia of detached sednoids (Sedna, 2012 VP113, Leleākūhonua).',
    rangeRingsAU: [30.0, 50.0, 76.2, 100.0, 150.0],
    ringLabels: {
      30.0: '30.0 AU — Neptune Boundary',
      50.0: '50.0 AU — Kuiper Cliff',
      76.2: '76.2 AU — Sedna Perihelion',
      100.0: '100.0 AU — Heliosphere Shock',
      150.0: '150.0 AU — Scattered Disc'
    }
  },
  'deep-space': {
    id: 'deep-space',
    label: 'Deep Space & Planet X (1,000 AU)',
    maxRangeAU: 1000.0,
    description: 'Sednoid aphelia, inner Oort cloud, and hypothetical Planet Nine predicted orbital search zone.',
    rangeRingsAU: [100.0, 300.0, 600.0, 1000.0],
    ringLabels: {
      100.0: '100.0 AU — Termination Shock',
      300.0: '300.0 AU — Planet Nine Perihelion Zone',
      600.0: '600.0 AU — Outer Scattered Disc',
      1000.0: '1,000.0 AU — Inner Oort Cloud Horizon'
    }
  }
};

export type RadarCategory = 
  | 'planets' 
  | 'asteroids' 
  | 'distant-tnos' 
  | 'hypothetical-p9' 
  | 'simulation-particles';

export type RadarTargetDataStatus = 
  | 'LIVE DATA' 
  | 'CACHED DATA' 
  | 'ARCHIVED BASELINE' 
  | 'OBSERVED EPHEMERIS'
  | 'OBSERVED BASELINE'
  | 'PROPAGATED POSITION' 
  | 'HYPOTHETICAL TARGET' 
  | 'SIMULATED TEST PARTICLE';

export interface RadarTarget {
  id: string;
  name: string;
  designation?: string;
  category: RadarCategory;
  categoryLabel: string;
  heliocentricAU: { x: number; y: number; z: number };
  distSunAU: number;
  distEarthAU?: number;
  distEarthLunar?: number;
  orbitalSpeedKmS?: number;
  orbitalElements?: {
    semiMajorAxisAU: number;
    eccentricity: number;
    inclinationDeg: number;
    longitudeOfAscendingNodeDeg?: number;
    argumentOfPerihelionDeg?: number;
    longitudeOfPerihelionDeg?: number;
    perihelionAU?: number;
    aphelionAU?: number;
    orbitalPeriodYears?: number;
  };
  color: string;
  isHypothetical: boolean;
  isSimulatedParticle?: boolean;
  dataStatus: RadarTargetDataStatus;
  dataSource: string;
  sourceUrl?: string;
  retrievalTimestamp?: string;
  epoch?: string;
  scientificDisclaimer?: string;
}

export interface ProjectedRadarPoint {
  xPx: number;
  yPx: number;
  rPx: number;
  azimuthDeg: number; // Polar angle in degrees (0° = +X axis / Vernal Equinox, 90° = +Y)
  inRange: boolean;
  rangeFraction: number; // r / maxRangeAU
}

/**
 * Projects 3D Heliocentric Ecliptic coordinates (AU) to 2D Top-Down Radar screen pixels.
 * Coordinate frame:
 *   +X points toward Vernal Equinox (Right Ascension 0h)
 *   +Y points 90° counterclockwise in the ecliptic plane
 *   +Z points normal to the ecliptic (toward North Ecliptic Pole)
 * Screen coordinates:
 *   centerX, centerY is the Sun (0, 0)
 *   radarRadiusPx is the outer boundary corresponding to maxRangeAU
 */
export function projectHeliocentricToRadar(
  xAU: number,
  yAU: number,
  maxRangeAU: number,
  centerX: number,
  centerY: number,
  radarRadiusPx: number
): ProjectedRadarPoint {
  const rAU = Math.hypot(xAU, yAU);
  const rangeFraction = maxRangeAU > 0 ? rAU / maxRangeAU : 0;
  const inRange = rangeFraction <= 1.0;

  // Clamped pixel radius for drawing
  const rPx = Math.min(rangeFraction, 1.0) * radarRadiusPx;

  // Polar azimuth angle: θ = atan2(y, x)
  const rad = Math.atan2(yAU, xAU);
  const azimuthDeg = ((rad * 180 / Math.PI) % 360 + 360) % 360;

  // Screen coordinates: inverted Y because screen Y grows downward
  const xPx = centerX + (xAU / maxRangeAU) * radarRadiusPx;
  const yPx = centerY - (yAU / maxRangeAU) * radarRadiusPx;

  return {
    xPx,
    yPx,
    rPx,
    azimuthDeg,
    inRange,
    rangeFraction
  };
}

/**
 * Computes angular distance between rotating sweep line and a target polar azimuth.
 * Returns a normalized phosphor glow factor [0, 1] that smoothly fades as the sweep moves past.
 */
export function computeSweepPhosphorIntensity(
  sweepAngleDeg: number,
  targetAzimuthDeg: number,
  trailSpreadDeg = 60.0
): number {
  // Angular difference: how far ahead the sweep is past the target
  const diffDeg = ((sweepAngleDeg - targetAzimuthDeg) % 360 + 360) % 360;

  if (diffDeg <= trailSpreadDeg) {
    // Smooth quadratic phosphor decay
    const normalized = 1 - diffDeg / trailSpreadDeg;
    return Math.pow(normalized, 1.8);
  }

  return 0.0;
}

/**
 * Computes Keplerian position (x, y, z) in AU at a given mean anomaly for a 2D orbit.
 */
export function computeKeplerianOrbitPositionAU(
  a: number,
  e: number,
  incDeg: number,
  nodeDeg: number,
  omegaDeg: number,
  trueAnomalyDeg: number
): { x: number; y: number; z: number } {
  const theta = (trueAnomalyDeg * Math.PI) / 180;
  const inc = (incDeg * Math.PI) / 180;
  const node = (nodeDeg * Math.PI) / 180;
  const omega = (omegaDeg * Math.PI) / 180;

  // Radius vector magnitude from primary focus:
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));

  // Orbital plane coordinates:
  const xOrb = r * Math.cos(theta);
  const yOrb = r * Math.sin(theta);

  // Rotate by argument of perihelion (ω), inclination (i), and node (Ω):
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosInc = Math.cos(inc);
  const sinInc = Math.sin(inc);
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);

  // Transformation matrix to heliocentric ecliptic frame:
  const Px = cosNode * cosOmega - sinNode * sinOmega * cosInc;
  const Py = sinNode * cosOmega + cosNode * sinOmega * cosInc;
  const Pz = sinOmega * sinInc;

  const Qx = -cosNode * sinOmega - sinNode * cosOmega * cosInc;
  const Qy = -sinNode * sinOmega + cosNode * cosOmega * cosInc;
  const Qz = cosOmega * sinInc;

  const x = xOrb * Px + yOrb * Qx;
  const y = xOrb * Py + yOrb * Qy;
  const z = xOrb * Pz + yOrb * Qz;

  return { x, y, z };
}

/**
 * Computes distance in AU between two 3D heliocentric positions.
 */
export function calculateDistanceAU(
  posA: { x: number; y: number; z: number },
  posB: { x: number; y: number; z: number }
): number {
  return Math.hypot(posA.x - posB.x, posA.y - posB.y, posA.z - posB.z);
}
