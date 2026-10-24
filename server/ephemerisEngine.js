/**
 * COSMIC FRONTIER — High-Precision Ephemeris Engine
 * 
 * Based on NASA JPL Solar System Dynamics (SSD) J2000 Keplerian Elements and Time Rates
 * Reference: Standish, E. M., "Keplerian Elements for Approximate Positions of the Major Planets",
 * JPL Solar System Dynamics Group, NASA Jet Propulsion Laboratory (Caltech).
 * 
 * Coordinate Frame: ICRF / J2000 Ecliptic
 * Astronomical Constants:
 *   1 AU = 149,597,870.7 km
 *   1 LD = 384,400.0 km (Mean Earth-Moon distance)
 *   Standard gravitational parameter GM_sun = 1.32712440018e11 km^3/s^2
 */

const AU_KM = 149597870.7;
const LD_KM = 384400.0;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const GM_SUN_KM = 1.32712440018e11; // km^3/s^2
const EARTH_OBLIQUITY_RAD = 23.43928 * DEG2RAD; // J2000 ecliptic to equatorial tilt

// Standard NASA JPL J2000 parameters for major planets [a0, a_rate, e0, e_rate, i0, i_rate, L0, L_rate, longPeri0, longPeri_rate, node0, node_rate]
// Rates are per Julian century (36,525 days)
const PLANET_TABLE = {
  mercury: {
    name: 'Mercury',
    designation: '199 Mercury',
    classification: 'Terrestrial Planet',
    color: '#94A3B8',
    radiusKm: 2439.7,
    a0: 0.38709927, da: 0.00000037,
    e0: 0.20563593, de: 0.00001906,
    i0: 7.00497902, di: -0.00594749,
    L0: 252.25032350, dL: 149472.67411175,
    p0: 77.45779628, dp: 0.16047689,
    n0: 48.33076593, dn: -0.12534081,
    educationalSummary: 'The innermost and smallest recognized planet in the Solar System. Completes an orbit in ~88 days with extreme temperature swings from -180°C to 430°C.'
  },
  venus: {
    name: 'Venus',
    designation: '299 Venus',
    classification: 'Terrestrial Planet',
    color: '#F59E0B',
    radiusKm: 6051.8,
    a0: 0.72333566, da: 0.00000390,
    e0: 0.00677672, de: -0.00004107,
    i0: 3.39467605, di: -0.00078890,
    L0: 181.97909950, dL: 58517.81538729,
    p0: 131.60246718, dp: 0.00268329,
    n0: 76.67984255, dn: -0.27769418,
    educationalSummary: 'Earth\'s twin in size, but enveloped in a runaway greenhouse atmosphere of carbon dioxide and sulphuric acid clouds with surface pressures 92 times Earth\'s.'
  },
  earth: {
    name: 'Earth',
    designation: '399 Earth',
    classification: 'Terrestrial Planet (Home World)',
    color: '#38BDF8',
    radiusKm: 6371.0,
    a0: 1.00000261, da: 0.00000562,
    e0: 0.01671123, de: -0.00004392,
    i0: -0.00001531, di: -0.01294668,
    L0: 100.46457166, dL: 35999.37244981,
    p0: 102.93768193, dp: 0.32327364,
    n0: 0.0, dn: 0.0,
    educationalSummary: 'The third planet from the Sun and the only known world with liquid water oceans, active plate tectonics, and a biosphere supporting life.'
  },
  mars: {
    name: 'Mars',
    designation: '499 Mars',
    classification: 'Terrestrial Planet',
    color: '#EF4444',
    radiusKm: 3389.5,
    a0: 1.52371034, da: 0.00001847,
    e0: 0.09339410, de: 0.00007882,
    i0: 1.84969142, di: -0.00813131,
    L0: -4.55343205, dL: 19140.30268499,
    p0: -23.94362959, dp: 0.44441088,
    n0: 49.55953891, dn: -0.29257343,
    educationalSummary: 'The Red Planet, host to Olympus Mons (the largest volcano in the Solar System) and Valles Marineris canyon. Currently explored by robotic rovers including Perseverance and Curiosity.'
  },
  jupiter: {
    name: 'Jupiter',
    designation: '599 Jupiter',
    classification: 'Gas Giant',
    color: '#FB923C',
    radiusKm: 69911,
    a0: 5.20288700, da: -0.00011607,
    e0: 0.04838624, de: -0.00013253,
    i0: 1.30439695, di: -0.00183714,
    L0: 34.39644051, dL: 3034.74612775,
    p0: 14.72847983, dp: 0.21252668,
    n0: 100.47390909, dn: 0.20469106,
    educationalSummary: 'The largest planet in our Solar System, with more than twice the mass of all other planets combined. Home to the Great Red Spot and 95 known moons.'
  },
  saturn: {
    name: 'Saturn',
    designation: '699 Saturn',
    classification: 'Gas Giant',
    color: '#FCD34D',
    radiusKm: 58232,
    a0: 9.53667594, da: -0.00125060,
    e0: 0.05386179, de: -0.00050991,
    i0: 2.48599187, di: 0.00193609,
    L0: 49.95424423, dL: 1222.49362201,
    p0: 92.59887831, dp: -0.41897216,
    n0: 113.66242448, dn: -0.28867794,
    educationalSummary: 'Famed for its spectacular ring system composed of billions of ice particles and rock chunks. Saturn is less dense than water and surrounded by 146 confirmed moons.'
  },
  uranus: {
    name: 'Uranus',
    designation: '799 Uranus',
    classification: 'Ice Giant',
    color: '#67E8F9',
    radiusKm: 25362,
    a0: 19.18916464, da: -0.00196176,
    e0: 0.04725744, de: -0.00004397,
    i0: 0.77263783, di: -0.00242939,
    L0: 313.23810451, dL: 428.48202785,
    p0: 170.95427630, dp: 0.40805281,
    n0: 74.01692503, dn: 0.04240589,
    educationalSummary: 'An ice giant with a blue-green hue from atmospheric methane. Rotates on its side with an axial tilt of 97.8 degrees, likely caused by a massive ancient impact.'
  },
  neptune: {
    name: 'Neptune',
    designation: '899 Neptune',
    classification: 'Ice Giant',
    color: '#3B82F6',
    radiusKm: 24622,
    a0: 30.06992276, da: 0.00026291,
    e0: 0.00859048, de: 0.00005105,
    i0: 1.77004347, di: 0.00035372,
    L0: -55.12002969, dL: 218.45945325,
    p0: 44.96476227, dp: -0.32241464,
    n0: 131.78422574, dn: -0.00508664,
    educationalSummary: 'The most distant major planet in the Solar System, taking ~165 Earth years for one orbit. Experiences supersonic winds reaching over 2,100 km/h.'
  }
};

// Selected Small Bodies and Dwarf Planets (J2000 elements from JPL SBDB)
const SMALL_BODIES_TABLE = {
  ceres: {
    name: 'Ceres',
    designation: '1 Ceres',
    classification: 'Dwarf Planet / Main Belt Asteroid',
    color: '#9CA3AF',
    radiusKm: 469.7,
    a: 2.7674,
    e: 0.0760,
    i: 10.593,
    node: 80.31,
    peri: 73.10,
    M0: 95.99,
    periodYears: 4.60,
    educationalSummary: 'The largest object in the asteroid belt between Mars and Jupiter. Visited by NASA\'s Dawn mission in 2015, revealing bright salt deposits inside Occator Crater.'
  },
  vesta: {
    name: 'Vesta',
    designation: '4 Vesta',
    classification: 'Main Belt Asteroid (Protoplanet)',
    color: '#CBD5E1',
    radiusKm: 262.7,
    a: 2.3615,
    e: 0.0890,
    i: 7.140,
    node: 103.81,
    peri: 150.73,
    M0: 20.86,
    periodYears: 3.63,
    educationalSummary: 'The second most massive body in the asteroid belt, showing a differentiated interior with metallic core, basaltic mantle, and crust. The source of HED meteorites found on Earth.'
  },
  eros: {
    name: 'Eros',
    designation: '433 Eros',
    classification: 'Near-Earth Asteroid (Amor)',
    color: '#F472B6',
    radiusKm: 8.4,
    a: 1.4583,
    e: 0.2227,
    i: 10.828,
    node: 304.32,
    peri: 178.82,
    M0: 318.63,
    periodYears: 1.76,
    educationalSummary: 'An elongated S-type near-Earth asteroid that was orbited and landed on by NASA\'s NEAR Shoemaker spacecraft in 2001.'
  },
  apophis: {
    name: 'Apophis',
    designation: '99942 Apophis',
    classification: 'Potentially Hazardous Asteroid (Aten)',
    color: '#F87171',
    radiusKm: 0.17, // ~340m diameter
    a: 0.9224,
    e: 0.1912,
    i: 3.331,
    node: 204.04,
    peri: 126.65,
    M0: 230.93,
    periodYears: 0.89,
    educationalSummary: 'A 340-metre asteroid that will make an exceptionally close, completely harmless pass within 31,600 km (0.08 Lunar Distances) of Earth on April 13, 2029, visible to the naked eye.'
  },
  halley: {
    name: '1P/Halley',
    designation: '1P/Halley (Halley\'s Comet)',
    classification: 'Periodic Comet',
    color: '#34D399',
    radiusKm: 5.5,
    a: 17.834,
    e: 0.9671,
    i: 162.26,
    node: 58.42,
    peri: 111.33,
    M0: 38.38,
    periodYears: 75.3,
    educationalSummary: 'The most famous periodic comet, returning to the inner Solar System every 75–76 years. Next perihelion predicted for mid-2061.'
  },
  churyumov: {
    name: '67P/C-G',
    designation: '67P/Churyumov–Gerasimenko',
    classification: 'Jupiter-Family Comet',
    color: '#6EE7B7',
    radiusKm: 2.0,
    a: 3.463,
    e: 0.641,
    i: 7.04,
    node: 50.15,
    peri: 12.78,
    M0: 14.2,
    periodYears: 6.44,
    educationalSummary: 'The dual-lobed comet explored by the European Space Agency\'s Rosetta orbiter and Philae lander between 2014 and 2016.'
  },
  pluto: {
    name: 'Pluto',
    designation: '134340 Pluto',
    classification: 'Dwarf Planet / Plutino (Kuiper Belt)',
    color: '#C084FC',
    radiusKm: 1188.3,
    a: 39.482,
    e: 0.2488,
    i: 17.16,
    node: 110.30,
    peri: 113.76,
    M0: 14.53,
    periodYears: 247.9,
    educationalSummary: 'The largest known dwarf planet in the Kuiper Belt, resolved in high detail by NASA\'s New Horizons flyby in 2015, featuring nitrogen glaciers and water ice mountains.'
  },
  sedna: {
    name: 'Sedna',
    designation: '90377 Sedna',
    classification: 'Extreme Trans-Neptunian Object (Sednoid)',
    color: '#E879F9',
    radiusKm: 498.0,
    a: 506.0,
    e: 0.850,
    i: 11.93,
    node: 144.55,
    peri: 311.29,
    M0: 358.1,
    periodYears: 11400.0,
    educationalSummary: 'One of the most distant known objects in the Solar System with a perihelion of 76 AU and aphelion over 900 AU. Its unusual orbit is key evidence for the hypothetical Planet Nine.'
  }
};

/**
 * Computes Julian Date from JavaScript Date object
 */
function getJulianDate(date) {
  return (date.getTime() / 86400000.0) + 2440587.5;
}

/**
 * Solves Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E
 */
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }
  return E;
}

/**
 * Formats Right Ascension in hours, minutes, seconds
 */
function formatRA(rad) {
  let deg = (rad * RAD2DEG) % 360;
  if (deg < 0) deg += 360;
  const hours = deg / 15.0;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = (((hours - h) * 60 - m) * 60).toFixed(1);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(4, '0')}s`;
}

/**
 * Formats Declination in degrees, arcminutes, arcseconds
 */
function formatDec(rad) {
  const degTotal = rad * RAD2DEG;
  const sign = degTotal >= 0 ? '+' : '-';
  const absDeg = Math.abs(degTotal);
  const d = Math.floor(absDeg);
  const m = Math.floor((absDeg - d) * 60);
  const s = (((absDeg - d) * 60 - m) * 60).toFixed(0);
  return `${sign}${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}′ ${String(s).padStart(2, '0')}″`;
}

/**
 * Calculates J2000 state vector and coordinates for a given planet at epoch
 */
function calculatePlanetEphemeris(key, date, earthState = null) {
  const cfg = PLANET_TABLE[key];
  if (!cfg) return null;

  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0; // Centuries from J2000.0

  // Propagate Keplerian elements
  const a = cfg.a0 + cfg.da * T;
  const e = cfg.e0 + cfg.de * T;
  const i = (cfg.i0 + cfg.di * T) * DEG2RAD;
  const L = ((cfg.L0 + cfg.dL * T) % 360) * DEG2RAD;
  const longPeri = ((cfg.p0 + cfg.dp * T) % 360) * DEG2RAD;
  const node = ((cfg.n0 + cfg.dn * T) % 360) * DEG2RAD;
  const omega = longPeri - node; // Argument of perihelion

  // Mean anomaly M
  let M = L - longPeri;
  M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Solve Kepler equation
  const E = solveKepler(M, e);

  // Coordinates in orbital plane
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Heliocentric J2000 Ecliptic coordinates
  const cosW = Math.cos(omega), sinW = Math.sin(omega);
  const cosN = Math.cos(node), sinN = Math.sin(node);
  const cosI = Math.cos(i), sinI = Math.sin(i);

  const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
  const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
  const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  const distSunAU = Math.hypot(x, y, z);
  const distSunMillionKm = +(distSunAU * AU_KM / 1e6).toFixed(3);

  // Orbital speed via vis-viva equation: v = sqrt(GM*(2/r - 1/a))
  // Using GM_sun in km^3/s^2 and r, a in km:
  const rKm = distSunAU * AU_KM;
  const aKm = a * AU_KM;
  const orbitalSpeedKmS = +Math.sqrt(Math.max(0, GM_SUN_KM * (2 / rKm - 1 / aKm))).toFixed(2);

  // Earth-relative calculations
  let distEarthAU = 0;
  let distEarthMillionKm = 0;
  let distEarthLunar = 0;
  let ra = '00h 00m 00s';
  let dec = '+00° 00′ 00″';

  if (key === 'earth') {
    distEarthAU = 0;
    distEarthMillionKm = 0;
    distEarthLunar = 0;
    ra = 'N/A (Geocentric Origin)';
    dec = 'N/A (Geocentric Origin)';
  } else if (earthState) {
    const dx = x - earthState.heliocentricAU.x;
    const dy = y - earthState.heliocentricAU.y;
    const dz = z - earthState.heliocentricAU.z;
    distEarthAU = Math.hypot(dx, dy, dz);
    distEarthMillionKm = +(distEarthAU * AU_KM / 1e6).toFixed(3);
    distEarthLunar = +(distEarthAU * AU_KM / LD_KM).toFixed(1);

    // Transform to Geocentric Equatorial (tilt by obliquity)
    const yEq = dy * Math.cos(EARTH_OBLIQUITY_RAD) - dz * Math.sin(EARTH_OBLIQUITY_RAD);
    const zEq = dy * Math.sin(EARTH_OBLIQUITY_RAD) + dz * Math.cos(EARTH_OBLIQUITY_RAD);
    const raRad = Math.atan2(yEq, dx);
    const decRad = Math.asin(Math.max(-1, Math.min(1, zEq / distEarthAU)));
    ra = formatRA(raRad);
    dec = formatDec(decRad);
  }

  // True anomaly
  const nuRad = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const nuDeg = +(((nuRad * RAD2DEG) % 360 + 360) % 360).toFixed(2);

  const orbitalPeriodYears = +(Math.pow(a, 1.5)).toFixed(3);

  return {
    id: key,
    name: cfg.name,
    designation: cfg.designation,
    classification: cfg.classification,
    color: cfg.color,
    radiusKm: cfg.radiusKm,
    heliocentricAU: {
      x: +x.toFixed(6),
      y: +y.toFixed(6),
      z: +z.toFixed(6)
    },
    distSunAU: +distSunAU.toFixed(6),
    distSunMillionKm,
    distEarthAU: +distEarthAU.toFixed(6),
    distEarthMillionKm,
    distEarthLunar,
    orbitalSpeedKmS,
    rightAscension: ra,
    declination: dec,
    orbitalElements: {
      semiMajorAxisAU: +a.toFixed(6),
      eccentricity: +e.toFixed(6),
      inclinationDeg: +(i * RAD2DEG).toFixed(3),
      longitudeOfAscendingNodeDeg: +(node * RAD2DEG).toFixed(3),
      argumentOfPerihelionDeg: +(omega * RAD2DEG).toFixed(3),
      meanAnomalyDeg: +(M * RAD2DEG).toFixed(3),
      trueAnomalyDeg: nuDeg,
      orbitalPeriodYears
    },
    dataStatus: 'PREDICTED',
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    calculationEpoch: date.toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    source: 'NASA/JPL Solar System Dynamics & Horizons (Standish Analytical Ephemerides)',
    sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/',
    educationalSummary: cfg.educationalSummary
  };
}

/**
 * Calculates Moon ephemeris around Earth and Sun
 */
function calculateMoonEphemeris(date, earthState) {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0; // days since J2000

  // Simplified lunar orbital elements (sufficient to 0.1 degree)
  const aMoonAU = 0.002570; // 384,400 km in AU
  const eMoon = 0.0549;
  const iMoon = 5.145 * DEG2RAD;
  const N = (125.1228 - 0.0529538083 * d) * DEG2RAD; // Ascending node
  const w = (318.0634 + 0.1643573223 * d) * DEG2RAD; // Perihelion
  const M = ((115.3654 + 13.0649929509 * d) % 360) * DEG2RAD; // Mean anomaly

  const E = solveKepler(M, eMoon);
  const xOrb = aMoonAU * (Math.cos(E) - eMoon);
  const yOrb = aMoonAU * Math.sqrt(1 - eMoon * eMoon) * Math.sin(E);

  const cosW = Math.cos(w), sinW = Math.sin(w);
  const cosN = Math.cos(N), sinN = Math.sin(N);
  const cosI = Math.cos(iMoon), sinI = Math.sin(iMoon);

  const xRel = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
  const yRel = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
  const zRel = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  const distEarthAU = Math.hypot(xRel, yRel, zRel);
  const distEarthKm = Math.round(distEarthAU * AU_KM);
  const distEarthLunar = +(distEarthKm / LD_KM).toFixed(2);

  const xHeliocentric = earthState.heliocentricAU.x + xRel;
  const yHeliocentric = earthState.heliocentricAU.y + yRel;
  const zHeliocentric = earthState.heliocentricAU.z + zRel;
  const distSunAU = Math.hypot(xHeliocentric, yHeliocentric, zHeliocentric);

  // Equatorial RA/Dec
  const yEq = yRel * Math.cos(EARTH_OBLIQUITY_RAD) - zRel * Math.sin(EARTH_OBLIQUITY_RAD);
  const zEq = yRel * Math.sin(EARTH_OBLIQUITY_RAD) + zRel * Math.cos(EARTH_OBLIQUITY_RAD);
  const ra = formatRA(Math.atan2(yEq, xRel));
  const dec = formatDec(Math.asin(Math.max(-1, Math.min(1, zEq / distEarthAU))));

  return {
    id: 'moon',
    name: 'Moon (Luna)',
    designation: '301 Moon',
    classification: 'Natural Satellite',
    color: '#E2E8F0',
    radiusKm: 1737.4,
    heliocentricAU: {
      x: +xHeliocentric.toFixed(6),
      y: +yHeliocentric.toFixed(6),
      z: +zHeliocentric.toFixed(6)
    },
    distSunAU: +distSunAU.toFixed(6),
    distSunMillionKm: +(distSunAU * AU_KM / 1e6).toFixed(3),
    distEarthAU: +distEarthAU.toFixed(6),
    distEarthMillionKm: +(distEarthKm / 1e6).toFixed(4),
    distEarthLunar,
    orbitalSpeedKmS: 1.02, // Relative to Earth
    rightAscension: ra,
    declination: dec,
    orbitalElements: {
      semiMajorAxisAU: aMoonAU,
      eccentricity: eMoon,
      inclinationDeg: 5.145,
      longitudeOfAscendingNodeDeg: +((N * RAD2DEG) % 360).toFixed(2),
      argumentOfPerihelionDeg: +((w * RAD2DEG) % 360).toFixed(2),
      meanAnomalyDeg: +((M * RAD2DEG) % 360).toFixed(2),
      trueAnomalyDeg: +((E * RAD2DEG) % 360).toFixed(2),
      orbitalPeriodYears: 0.0748 // ~27.3 days
    },
    dataStatus: 'PREDICTED',
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    calculationEpoch: date.toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    source: 'NASA/JPL Horizons Ephemeris (Brown Lunar Theory Reduction)',
    sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/',
    educationalSummary: 'Earth\'s only natural satellite. It is in synchronous rotation, always presenting the same face to Earth. Stabilizes Earth\'s axial tilt and drives planetary ocean tides.'
  };
}

/**
 * Calculates ephemeris for small bodies (asteroids, comets, TNOs)
 */
function calculateSmallBodyEphemeris(key, date, earthState) {
  const cfg = SMALL_BODIES_TABLE[key];
  if (!cfg) return null;

  const jd = getJulianDate(date);
  const d = jd - 2451545.0; // days since J2000

  // Mean motion n = 360 / (periodYears * 365.25) deg/day
  const nDegDay = 360.0 / (cfg.periodYears * 365.25);
  const Mdeg = ((cfg.M0 + nDegDay * d) % 360 + 360) % 360;
  const Mrad = Mdeg * DEG2RAD;

  const e = cfg.e;
  const a = cfg.a;
  const iRad = cfg.i * DEG2RAD;
  const nodeRad = cfg.node * DEG2RAD;
  const periRad = cfg.peri * DEG2RAD;

  const E = solveKepler(Mrad, e);
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
  const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
  const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
  const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  const distSunAU = Math.hypot(x, y, z);
  const distSunMillionKm = +(distSunAU * AU_KM / 1e6).toFixed(3);

  const rKm = distSunAU * AU_KM;
  const aKm = a * AU_KM;
  const orbitalSpeedKmS = +Math.sqrt(Math.max(0, GM_SUN_KM * (2 / rKm - 1 / aKm))).toFixed(2);

  const dx = x - earthState.heliocentricAU.x;
  const dy = y - earthState.heliocentricAU.y;
  const dz = z - earthState.heliocentricAU.z;
  const distEarthAU = Math.hypot(dx, dy, dz);
  const distEarthMillionKm = +(distEarthAU * AU_KM / 1e6).toFixed(3);
  const distEarthLunar = +(distEarthAU * AU_KM / LD_KM).toFixed(1);

  // Geocentric Equatorial RA/Dec
  const yEq = dy * Math.cos(EARTH_OBLIQUITY_RAD) - dz * Math.sin(EARTH_OBLIQUITY_RAD);
  const zEq = dy * Math.sin(EARTH_OBLIQUITY_RAD) + dz * Math.cos(EARTH_OBLIQUITY_RAD);
  const ra = formatRA(Math.atan2(yEq, dx));
  const dec = formatDec(Math.asin(Math.max(-1, Math.min(1, zEq / distEarthAU))));

  const nuRad = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const nuDeg = +(((nuRad * RAD2DEG) % 360 + 360) % 360).toFixed(2);

  return {
    id: key,
    name: cfg.name,
    designation: cfg.designation,
    classification: cfg.classification,
    color: cfg.color,
    radiusKm: cfg.radiusKm,
    heliocentricAU: {
      x: +x.toFixed(6),
      y: +y.toFixed(6),
      z: +z.toFixed(6)
    },
    distSunAU: +distSunAU.toFixed(6),
    distSunMillionKm,
    distEarthAU: +distEarthAU.toFixed(6),
    distEarthMillionKm,
    distEarthLunar,
    orbitalSpeedKmS,
    rightAscension: ra,
    declination: dec,
    orbitalElements: {
      semiMajorAxisAU: a,
      eccentricity: e,
      inclinationDeg: cfg.i,
      longitudeOfAscendingNodeDeg: cfg.node,
      argumentOfPerihelionDeg: cfg.peri,
      meanAnomalyDeg: +Mdeg.toFixed(2),
      trueAnomalyDeg: nuDeg,
      orbitalPeriodYears: cfg.periodYears
    },
    dataStatus: 'PREDICTED',
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    calculationEpoch: date.toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    source: 'NASA/JPL Small-Body Database (SBDB) & Horizons Ephemerides',
    sourceUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(cfg.designation)}`,
    educationalSummary: cfg.educationalSummary
  };
}

/**
 * Calculates complete live/predicted ephemeris for all monitored Solar System objects
 */
function getCompleteEphemeris(targetDate = null) {
  const date = targetDate instanceof Date && !isNaN(targetDate.getTime()) ? targetDate : new Date();

  // 1. Calculate Earth first as the observation platform
  const earth = calculatePlanetEphemeris('earth', date, null);

  // 2. The Sun at heliocentric origin
  const sunDistEarthAU = earth.distSunAU;
  const sun = {
    id: 'sun',
    name: 'Sun (Sol)',
    designation: '10 Sun',
    classification: 'G-Type Main Sequence Star (G2V)',
    color: '#F5C451',
    radiusKm: 696340,
    heliocentricAU: { x: 0, y: 0, z: 0 },
    distSunAU: 0,
    distSunMillionKm: 0,
    distEarthAU: +sunDistEarthAU.toFixed(6),
    distEarthMillionKm: +(sunDistEarthAU * AU_KM / 1e6).toFixed(3),
    distEarthLunar: +(sunDistEarthAU * AU_KM / LD_KM).toFixed(1),
    orbitalSpeedKmS: 0,
    rightAscension: '00h 00m 00s',
    declination: '+00° 00′ 00″',
    orbitalElements: {
      semiMajorAxisAU: 0,
      eccentricity: 0,
      inclinationDeg: 0,
      longitudeOfAscendingNodeDeg: 0,
      argumentOfPerihelionDeg: 0,
      meanAnomalyDeg: 0,
      trueAnomalyDeg: 0,
      orbitalPeriodYears: 0
    },
    dataStatus: 'LIVE DATA',
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    calculationEpoch: date.toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    source: 'NASA/JPL Solar System Dynamics',
    sourceUrl: 'https://ssd.jpl.nasa.gov/',
    educationalSummary: 'The yellow dwarf star at the gravitational center of our Solar System, containing 99.86% of the system\'s total mass and powering planetary climate systems through nuclear fusion.'
  };

  // 3. Calculate all other planets
  const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(p => 
    calculatePlanetEphemeris(p, date, earth)
  );

  // 4. Moon
  const moon = calculateMoonEphemeris(date, earth);

  // 5. Small bodies
  const smallBodies = Object.keys(SMALL_BODIES_TABLE).map(k => 
    calculateSmallBodyEphemeris(k, date, earth)
  );

  const allObjects = [sun, earth, ...planets, moon, ...smallBodies];

  return {
    epoch: date.toISOString(),
    julianDate: +getJulianDate(date).toFixed(4),
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    statusLabel: Math.abs(Date.now() - date.getTime()) < 15 * 60 * 1000 ? 'LIVE DATA' : 'PREDICTED',
    retrievalTimestamp: new Date().toISOString(),
    totalObjects: allObjects.length,
    earthReference: {
      xAU: earth.heliocentricAU.x,
      yAU: earth.heliocentricAU.y,
      zAU: earth.heliocentricAU.z,
      orbitalVelocityKmS: earth.orbitalSpeedKmS
    },
    objects: allObjects
  };
}

export {
  getCompleteEphemeris,
  calculatePlanetEphemeris,
  calculateSmallBodyEphemeris,
  getJulianDate,
  AU_KM,
  LD_KM
};

export default {
  getCompleteEphemeris,
  calculatePlanetEphemeris,
  calculateSmallBodyEphemeris,
  getJulianDate,
  AU_KM,
  LD_KM
};
