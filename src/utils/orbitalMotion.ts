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
