/**
 * Real-time In-Memory Keplerian Orbital Mechanics Engine
 * Provides client-side 60fps orbital propagation without network latency.
 * Grounded in JPL Planetary and Lunar Ephemerides and Keplerian two-body dynamics.
 */

export const AU_KM = 149597870.7;
export const LD_KM = 384400.0;
export const GM_SUN_KM = 1.32712440018e11; // km^3 / s^2
export const DEG2RAD = Math.PI / 180.0;
export const RAD2DEG = 180.0 / Math.PI;

export interface KeplerianElements {
  a: number;            // semi-major axis (AU)
  e: number;            // eccentricity
  i: number;            // inclination (deg)
  node: number;         // longitude of ascending node (deg)
  peri: number;         // argument of perihelion (deg)
  M0: number;           // mean anomaly at epoch (deg)
  epochJd: number;      // epoch of osculation (JD)
  periodYears?: number; // orbital period in years
  meanMotionDegDay?: number; // daily mean motion in deg/day
}

export interface PropagatedOrbitalState {
  epochIso: string;
  epochJd: number;
  heliocentricAU: { x: number; y: number; z: number };
  heliocentricKm: { x: number; y: number; z: number };
  distSunAU: number;
  earthPositionAU: { x: number; y: number; z: number };
  earthRelativeAU: { x: number; y: number; z: number };
  distEarthAU: number;
  distEarthKm: number;
  distEarthLunar: number;
  orbitalSpeedKmS: number;
  velocityVectorKmS: { vx: number; vy: number; vz: number };
  trueAnomalyDeg: number;
  eccentricAnomalyDeg: number;
}

/**
 * Converts a JS Date to Julian Date (UT)
 */
export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000.0 + 2440587.5;
}

/**
 * Solves Kepler's equation M = E - e*sin(E) for Eccentric Anomaly E (radians)
 * using Newton-Raphson iteration with quadratic convergence
 */
export function solveKepler(M: number, e: number): number {
  let E = M;
  for (let iter = 0; iter < 25; iter++) {
    const delta = (E - e * Math.sin(E) - M) / (1.0 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }
  return E;
}

/**
 * Computes Earth's heliocentric position at an arbitrary target epoch
 * using standard low-precision JPL osculating elements for Earth-Moon barycenter.
 */
export function calculateEarthPosition(targetDate: Date): { x: number; y: number; z: number } {
  const jd = getJulianDate(targetDate);
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // Earth orbital elements referenced to J2000 mean ecliptic
  const a = 1.00000011 - 0.00000005 * T;
  const e = 0.01671022 - 0.00003804 * T;
  const iRad = (0.00005 - 0.01294 * T) * DEG2RAD;
  const L = (100.46435 + 36000.76983 * T) % 360.0; // Mean longitude
  const varpi = (102.94719 + 0.32327 * T) % 360.0; // Longitude of perihelion

  let Mdeg = (L - varpi) % 360.0;
  if (Mdeg < 0) Mdeg += 360.0;
  const Mrad = Mdeg * DEG2RAD;

  const E = solveKepler(Mrad, e);
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

  const periRad = (varpi * DEG2RAD);
  const cosW = Math.cos(periRad);
  const sinW = Math.sin(periRad);
  const cosI = Math.cos(iRad);

  const x = cosW * xOrb - sinW * cosI * yOrb;
  const y = sinW * xOrb + cosW * cosI * yOrb;
  const z = Math.sin(iRad) * yOrb;

  return { x, y, z };
}

/**
 * Analytical real-time propagation of Keplerian elements to target Date.
 * Runs in < 0.02ms, suitable for 60fps / 120fps animation loops and smooth scrubbing.
 */
export function propagateElementsClient(
  elements: KeplerianElements,
  targetDate: Date
): PropagatedOrbitalState {
  const jd = getJulianDate(targetDate);
  const dtDays = jd - elements.epochJd;

  const nDegDay = elements.meanMotionDegDay || 
    (elements.periodYears ? 360.0 / (elements.periodYears * 365.25) : 360.0 / (Math.pow(elements.a, 1.5) * 365.25));

  let Mdeg = (elements.M0 + nDegDay * dtDays) % 360.0;
  if (Mdeg < 0) Mdeg += 360.0;
  const Mrad = Mdeg * DEG2RAD;

  const e = elements.e;
  const a = elements.a;
  const iRad = elements.i * DEG2RAD;
  const nodeRad = elements.node * DEG2RAD;
  const periRad = elements.peri * DEG2RAD;

  // Solve Kepler equation
  const E = solveKepler(Mrad, e);

  // Position in orbital plane
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

  // Transformation to J2000 Ecliptic Heliocentric coordinates
  const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
  const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  const xHelioAU = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
  const yHelioAU = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
  const zHelioAU = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  const distSunAU = Math.hypot(xHelioAU, yHelioAU, zHelioAU);
  const rKm = distSunAU * AU_KM;
  const aKm = a * AU_KM;
  const orbitalSpeedKmS = +Math.sqrt(Math.max(0, GM_SUN_KM * (2.0 / rKm - 1.0 / aKm))).toFixed(2);

  // Velocity vector tangent approximation
  const rDotFactor = Math.sqrt(GM_SUN_KM / aKm) / Math.max(0.01, (1.0 - e * Math.cos(E)));
  const vxOrb = -Math.sin(E) * rDotFactor;
  const vyOrb = Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.cos(E) * rDotFactor;

  const vxHelioKmS = (cosW * cosN - sinW * sinN * cosI) * vxOrb + (-sinW * cosN - cosW * sinN * cosI) * vyOrb;
  const vyHelioKmS = (cosW * sinN + sinW * cosN * cosI) * vxOrb + (-sinW * sinN + cosW * cosN * cosI) * vyOrb;
  const vzHelioKmS = (sinW * sinI) * vxOrb + (cosW * sinI) * vyOrb;

  // Earth's position at the same epoch
  const earthPos = calculateEarthPosition(targetDate);

  // Earth-relative vector
  const dxAU = xHelioAU - earthPos.x;
  const dyAU = yHelioAU - earthPos.y;
  const dzAU = zHelioAU - earthPos.z;
  const distEarthAU = Math.hypot(dxAU, dyAU, dzAU);
  const distEarthKm = Math.round(distEarthAU * AU_KM);
  const distEarthLunar = +(distEarthKm / LD_KM).toFixed(3);

  // True Anomaly
  const nuRad = 2.0 * Math.atan2(Math.sqrt(1.0 + e) * Math.sin(E / 2.0), Math.sqrt(Math.max(1e-9, 1.0 - e)) * Math.cos(E / 2.0));
  const trueAnomalyDeg = +(((nuRad * RAD2DEG) % 360.0 + 360.0) % 360.0).toFixed(2);

  return {
    epochIso: targetDate.toISOString(),
    epochJd: +jd.toFixed(5),
    heliocentricAU: {
      x: +xHelioAU.toFixed(6),
      y: +yHelioAU.toFixed(6),
      z: +zHelioAU.toFixed(6)
    },
    heliocentricKm: {
      x: Math.round(xHelioAU * AU_KM),
      y: Math.round(yHelioAU * AU_KM),
      z: Math.round(zHelioAU * AU_KM)
    },
    distSunAU: +distSunAU.toFixed(4),
    earthPositionAU: {
      x: +earthPos.x.toFixed(6),
      y: +earthPos.y.toFixed(6),
      z: +earthPos.z.toFixed(6)
    },
    earthRelativeAU: {
      x: +dxAU.toFixed(6),
      y: +dyAU.toFixed(6),
      z: +dzAU.toFixed(6)
    },
    distEarthAU: +distEarthAU.toFixed(6),
    distEarthKm,
    distEarthLunar,
    orbitalSpeedKmS,
    velocityVectorKmS: {
      vx: +vxHelioKmS.toFixed(2),
      vy: +vyHelioKmS.toFixed(2),
      vz: +vzHelioKmS.toFixed(2)
    },
    trueAnomalyDeg,
    eccentricAnomalyDeg: +(((E * RAD2DEG) % 360.0 + 360.0) % 360.0).toFixed(2)
  };
}

/**
 * Generates an array of 3D coordinates tracing the full Keplerian ellipse
 */
export function generateKeplerianOrbitPath(elements: KeplerianElements, steps = 128): Array<{ x: number; y: number; z: number }> {
  const points: Array<{ x: number; y: number; z: number }> = [];
  const a = elements.a;
  const e = elements.e;
  const iRad = elements.i * DEG2RAD;
  const nodeRad = elements.node * DEG2RAD;
  const periRad = elements.peri * DEG2RAD;

  const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
  const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  for (let j = 0; j <= steps; j++) {
    const E = (j / steps) * Math.PI * 2.0;
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

    const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
    const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
    const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

    points.push({ x, y, z });
  }

  return points;
}

export type MajorPlanetKey = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter';

export interface SolarSystemBodyPosition {
  key: string;
  name: string;
  color: string;
  radiusScale: number;
  xAU: number;
  yAU: number;
  zAU: number;
  distSunAU: number;
  orbitalSpeedKmS: number;
}

const MAJOR_PLANET_TABLE: Record<MajorPlanetKey, {
  name: string;
  color: string;
  radiusScale: number;
  a0: number; da: number;
  e0: number; de: number;
  i0: number; di: number;
  L0: number; dL: number;
  p0: number; dp: number;
  n0: number; dn: number;
}> = {
  mercury: {
    name: 'Mercury',
    color: '#94A3B8',
    radiusScale: 0.38,
    a0: 0.38709927, da: 0.00000037,
    e0: 0.20563593, de: 0.00001906,
    i0: 7.00497902, di: -0.00594749,
    L0: 252.25032350, dL: 149472.67411175,
    p0: 77.45779628, dp: 0.16047689,
    n0: 48.33076593, dn: -0.12534081
  },
  venus: {
    name: 'Venus',
    color: '#F59E0B',
    radiusScale: 0.95,
    a0: 0.72333566, da: 0.00000390,
    e0: 0.00677672, de: -0.00004107,
    i0: 3.39467605, di: -0.00078890,
    L0: 181.97909950, dL: 58517.81538729,
    p0: 131.60246718, dp: 0.00268329,
    n0: 76.67984255, dn: -0.27769418
  },
  earth: {
    name: 'Earth',
    color: '#38BDF8',
    radiusScale: 1.0,
    a0: 1.00000261, da: 0.00000562,
    e0: 0.01671123, de: -0.00004392,
    i0: -0.00001531, di: -0.01294668,
    L0: 100.46457166, dL: 35999.37244981,
    p0: 102.93768193, dp: 0.32327364,
    n0: 0.0, dn: 0.0
  },
  mars: {
    name: 'Mars',
    color: '#EF4444',
    radiusScale: 0.53,
    a0: 1.52371034, da: 0.00001847,
    e0: 0.09339410, de: 0.00007882,
    i0: 1.84969142, di: -0.00813131,
    L0: -4.55343205, dL: 19140.30268499,
    p0: -23.94362959, dp: 0.44441088,
    n0: 49.55953891, dn: -0.29257343
  },
  jupiter: {
    name: 'Jupiter',
    color: '#FB923C',
    radiusScale: 2.2,
    a0: 5.20288700, da: -0.00011607,
    e0: 0.04838624, de: -0.00013253,
    i0: 1.30439695, di: -0.00183714,
    L0: 34.39644051, dL: 3034.74612775,
    p0: 14.72847983, dp: 0.21252668,
    n0: 100.47390909, dn: 0.20469106
  }
};

/**
 * Computes heliocentric coordinates for a major planet at an arbitrary date
 * using JPL Solar System Dynamics Standish analytical ephemeris
 */
export function calculateMajorPlanetPosition(
  planetKey: MajorPlanetKey,
  targetDate: Date
): SolarSystemBodyPosition {
  const cfg = MAJOR_PLANET_TABLE[planetKey];
  const jd = getJulianDate(targetDate);
  const T = (jd - 2451545.0) / 36525.0; // Centuries from J2000.0

  const a = cfg.a0 + cfg.da * T;
  const e = cfg.e0 + cfg.de * T;
  const iRad = (cfg.i0 + cfg.di * T) * DEG2RAD;
  const L = ((cfg.L0 + cfg.dL * T) % 360) * DEG2RAD;
  const longPeri = ((cfg.p0 + cfg.dp * T) % 360) * DEG2RAD;
  const node = ((cfg.n0 + cfg.dn * T) % 360) * DEG2RAD;
  const omega = longPeri - node;

  let M = L - longPeri;
  M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  const E = solveKepler(M, e);

  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

  const cosW = Math.cos(omega), sinW = Math.sin(omega);
  const cosN = Math.cos(node), sinN = Math.sin(node);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
  const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
  const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  const distSunAU = Math.hypot(x, y, z);
  const rKm = distSunAU * AU_KM;
  const aKm = a * AU_KM;
  const orbitalSpeedKmS = +Math.sqrt(Math.max(0, GM_SUN_KM * (2.0 / rKm - 1.0 / aKm))).toFixed(2);

  return {
    key: planetKey,
    name: cfg.name,
    color: cfg.color,
    radiusScale: cfg.radiusScale,
    xAU: x,
    yAU: y,
    zAU: z,
    distSunAU: +distSunAU.toFixed(4),
    orbitalSpeedKmS
  };
}

/**
 * Traces full 360-degree elliptical orbit path for a major planet
 */
export function generateMajorPlanetOrbitPath(
  planetKey: MajorPlanetKey,
  targetDate: Date = new Date(),
  steps = 100
): Array<{ x: number; y: number; z: number }> {
  const cfg = MAJOR_PLANET_TABLE[planetKey];
  const jd = getJulianDate(targetDate);
  const T = (jd - 2451545.0) / 36525.0;

  const a = cfg.a0 + cfg.da * T;
  const e = cfg.e0 + cfg.de * T;
  const iRad = (cfg.i0 + cfg.di * T) * DEG2RAD;
  const longPeri = ((cfg.p0 + cfg.dp * T) % 360) * DEG2RAD;
  const node = ((cfg.n0 + cfg.dn * T) % 360) * DEG2RAD;
  const omega = longPeri - node;

  const cosW = Math.cos(omega), sinW = Math.sin(omega);
  const cosN = Math.cos(node), sinN = Math.sin(node);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  const points: Array<{ x: number; y: number; z: number }> = [];
  for (let k = 0; k <= steps; k++) {
    const E = (k / steps) * Math.PI * 2.0;
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

    const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
    const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
    const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

    points.push({ x, y, z });
  }

  return points;
}

