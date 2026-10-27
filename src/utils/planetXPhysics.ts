/**
 * COSMIC FRONTIER — Planet Nine Dynamical Physics & Keplerian Orbital Mechanics
 * 
 * Provides verified mathematical conversions, hypothesis parameter validation,
 * published literature reference sets, and educational secular perturbation models.
 * 
 * References:
 * - Batygin, K. & Brown, M. E. (2016), 'Evidence for a Distant Giant Planet in the Solar System',
 *   The Astronomical Journal, 151:22, DOI: 10.3847/1538-3881/151/2/22
 * - Batygin, K. & Brown, M. E. (2021), 'The Orbit of Planet Nine',
 *   The Astronomical Journal, 162:219, DOI: 10.3847/1538-3881/ac2056
 * - Trujillo, C. A. & Sheppard, S. S. (2014), 'A Sedna-like body with a perihelion of 80 astronomical units',
 *   Nature, 507, 471–474, DOI: 10.1038/nature13156
 */

export interface OrbitalParameters {
  semiMajorAxisAU: number;
  eccentricity: number;
  perihelionAU: number;
  aphelionAU: number;
  inclinationDeg: number;
  argumentOfPerihelionDeg: number;
  longitudeOfAscendingNodeDeg: number;
  longitudeOfPerihelionDeg: number; // ϖ = Ω + ω (mod 360)
  orbitalPeriodYears: number;
  massEarth: number;
}

export interface HypothesisValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PlanetNinePreset {
  id: string;
  name: string;
  citation: string;
  doi: string;
  year: number;
  massEarth: number;
  semiMajorAxisAU: number;
  eccentricity: number;
  perihelionAU: number;
  aphelionAU: number;
  inclinationDeg: number;
  argumentOfPerihelionDeg: number;
  longitudeOfAscendingNodeDeg: number;
  longitudeOfPerihelionDeg: number;
  orbitalPeriodYears: number;
  description: string;
  isHypothetical: true;
}

/**
 * Standard mass of the Sun in Earth masses for precise Keplerian third law:
 * M_sun / M_earth ≈ 332,946.0487
 */
export const SOLAR_MASS_IN_EARTH_MASSES = 332946.0487;

/**
 * Derives full orbital parameters given perihelion distance q (in AU) and eccentricity e.
 *
 * For an elliptical orbit (0 <= e < 1):
 *   a = q / (1 - e)
 *   Q = a * (1 + e) = q * (1 + e) / (1 - e)
 *   P = sqrt( a^3 / (1 + M_planet / M_sun) ) ≈ a^(3/2) years
 *   ϖ = (Ω + ω) mod 360
 */
export function deriveOrbitalParametersFromQ(
  perihelionAU: number,
  eccentricity: number,
  options?: Partial<Omit<OrbitalParameters, 'perihelionAU' | 'eccentricity' | 'semiMajorAxisAU' | 'aphelionAU' | 'orbitalPeriodYears'>>
): OrbitalParameters {
  if (perihelionAU <= 0) {
    throw new RangeError(`Perihelion distance q must be strictly positive (received ${perihelionAU} AU).`);
  }
  if (eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError(`Eccentricity e must be bound between 0 and 1 for an elliptical orbit (received ${eccentricity}).`);
  }

  const e = eccentricity;
  const q = perihelionAU;
  const a = q / (1 - e);
  const Q = a * (1 + e);

  const massEarth = options?.massEarth ?? 6.2;
  // Kepler's Third Law in heliocentric astronomical units and years:
  // P = sqrt(a^3 / (M_sun + M_p9)) where M_sun = 1 solar mass.
  const totalMassSolar = 1 + massEarth / SOLAR_MASS_IN_EARTH_MASSES;
  const orbitalPeriodYears = Math.sqrt(Math.pow(a, 3) / totalMassSolar);

  const inc = options?.inclinationDeg ?? 16.0;
  const omega = options?.argumentOfPerihelionDeg ?? 150.0;
  const node = options?.longitudeOfAscendingNodeDeg ?? 95.0;
  const varpi = ((node + omega) % 360 + 360) % 360;

  return {
    semiMajorAxisAU: Number(a.toFixed(4)),
    eccentricity: Number(e.toFixed(4)),
    perihelionAU: Number(q.toFixed(4)),
    aphelionAU: Number(Q.toFixed(4)),
    inclinationDeg: Number(inc.toFixed(2)),
    argumentOfPerihelionDeg: Number(omega.toFixed(2)),
    longitudeOfAscendingNodeDeg: Number(node.toFixed(2)),
    longitudeOfPerihelionDeg: Number(varpi.toFixed(2)),
    orbitalPeriodYears: Number(orbitalPeriodYears.toFixed(2)),
    massEarth: Number(massEarth.toFixed(2))
  };
}

/**
 * Derives full orbital parameters given semi-major axis a (in AU) and eccentricity e.
 *
 *   q = a * (1 - e)
 *   Q = a * (1 + e)
 *   P ≈ a^(3/2) years
 */
export function deriveOrbitalParametersFromA(
  semiMajorAxisAU: number,
  eccentricity: number,
  options?: Partial<Omit<OrbitalParameters, 'semiMajorAxisAU' | 'eccentricity' | 'perihelionAU' | 'aphelionAU' | 'orbitalPeriodYears'>>
): OrbitalParameters {
  if (semiMajorAxisAU <= 0) {
    throw new RangeError(`Semi-major axis a must be strictly positive (received ${semiMajorAxisAU} AU).`);
  }
  if (eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError(`Eccentricity e must be bound between 0 and 1 for an elliptical orbit (received ${eccentricity}).`);
  }

  const a = semiMajorAxisAU;
  const e = eccentricity;
  const q = a * (1 - e);
  const Q = a * (1 + e);

  const massEarth = options?.massEarth ?? 6.2;
  const totalMassSolar = 1 + massEarth / SOLAR_MASS_IN_EARTH_MASSES;
  const orbitalPeriodYears = Math.sqrt(Math.pow(a, 3) / totalMassSolar);

  const inc = options?.inclinationDeg ?? 16.0;
  const omega = options?.argumentOfPerihelionDeg ?? 150.0;
  const node = options?.longitudeOfAscendingNodeDeg ?? 95.0;
  const varpi = ((node + omega) % 360 + 360) % 360;

  return {
    semiMajorAxisAU: Number(a.toFixed(4)),
    eccentricity: Number(e.toFixed(4)),
    perihelionAU: Number(q.toFixed(4)),
    aphelionAU: Number(Q.toFixed(4)),
    inclinationDeg: Number(inc.toFixed(2)),
    argumentOfPerihelionDeg: Number(omega.toFixed(2)),
    longitudeOfAscendingNodeDeg: Number(node.toFixed(2)),
    longitudeOfPerihelionDeg: Number(varpi.toFixed(2)),
    orbitalPeriodYears: Number(orbitalPeriodYears.toFixed(2)),
    massEarth: Number(massEarth.toFixed(2))
  };
}

/**
 * Validates hypothetical Planet Nine parameter ranges based on published constraints.
 */
export function validateHypothesisParams(params: {
  massEarth: number;
  semiMajorAxisAU?: number;
  perihelionAU?: number;
  eccentricity: number;
  inclinationDeg?: number;
}): HypothesisValidationResult {
  const errors: string[] = [];

  if (typeof params.massEarth !== 'number' || isNaN(params.massEarth) || params.massEarth < 0.5 || params.massEarth > 35) {
    errors.push('Planet Nine mass must be between 0.5 and 35 Earth masses (published nominal: 5–10 M⊕).');
  }

  if (typeof params.eccentricity !== 'number' || isNaN(params.eccentricity) || params.eccentricity < 0.01 || params.eccentricity >= 0.95) {
    errors.push('Eccentricity must be between 0.01 and 0.95 (published nominal: 0.15–0.50).');
  }

  if (params.semiMajorAxisAU !== undefined) {
    if (typeof params.semiMajorAxisAU !== 'number' || isNaN(params.semiMajorAxisAU) || params.semiMajorAxisAU < 100 || params.semiMajorAxisAU > 1500) {
      errors.push('Semi-major axis must be between 100 and 1500 AU (published nominal: 380–500 AU).');
    }
  }

  if (params.perihelionAU !== undefined) {
    if (typeof params.perihelionAU !== 'number' || isNaN(params.perihelionAU) || params.perihelionAU < 50 || params.perihelionAU > 800) {
      errors.push('Perihelion distance must be between 50 and 800 AU (published nominal: 240–300 AU).');
    }
  }

  if (params.inclinationDeg !== undefined) {
    if (typeof params.inclinationDeg !== 'number' || isNaN(params.inclinationDeg) || params.inclinationDeg < 0 || params.inclinationDeg > 90) {
      errors.push('Orbital inclination must be between 0° and 90° (published nominal: 15°–25°).');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verified Published Scientific Literature Reference Presets
 */
export const PLANET_NINE_PRESETS: Record<string, PlanetNinePreset> = {
  batyginBrown2021: {
    id: 'batyginBrown2021',
    name: 'Batygin & Brown (2021) Nominal Posterior',
    citation: 'Batygin, K. & Brown, M. E. (2021), The Astronomical Journal, 162:219',
    doi: '10.3847/1538-3881/ac2056',
    year: 2021,
    massEarth: 6.2,
    semiMajorAxisAU: 380,
    eccentricity: 0.35,
    perihelionAU: 247, // 380 * (1 - 0.35)
    aphelionAU: 513, // 380 * (1 + 0.35)
    inclinationDeg: 16.0,
    argumentOfPerihelionDeg: 150.0,
    longitudeOfAscendingNodeDeg: 95.0,
    longitudeOfPerihelionDeg: 245.0,
    orbitalPeriodYears: 7408.0,
    description: 'Updated 2021 dynamical model accounting for observational survey biases, placing Planet Nine closer, less massive, and on a less eccentric orbit than originally proposed.',
    isHypothetical: true
  },
  batyginBrown2016: {
    id: 'batyginBrown2016',
    name: 'Batygin & Brown (2016) Initial Hypothesis',
    citation: 'Batygin, K. & Brown, M. E. (2016), The Astronomical Journal, 151:22',
    doi: '10.3847/1538-3881/151/2/22',
    year: 2016,
    massEarth: 10.0,
    semiMajorAxisAU: 700,
    eccentricity: 0.60,
    perihelionAU: 280,
    aphelionAU: 1120,
    inclinationDeg: 30.0,
    argumentOfPerihelionDeg: 150.0,
    longitudeOfAscendingNodeDeg: 92.0,
    longitudeOfPerihelionDeg: 242.0,
    orbitalPeriodYears: 18520.0,
    description: 'Original 2016 theoretical calculation explaining the simultaneous clustering in physical argument of perihelion and physical space of the six most distant discovered TNOs.',
    isHypothetical: true
  },
  trujilloSheppard2014: {
    id: 'trujilloSheppard2014',
    name: 'Trujillo & Sheppard (2014) Shepherding Hypothesis',
    citation: 'Trujillo, C. A. & Sheppard, S. S. (2014), Nature, 507, 471–474',
    doi: '10.1038/nature13156',
    year: 2014,
    massEarth: 5.0,
    semiMajorAxisAU: 450,
    eccentricity: 0.30,
    perihelionAU: 315,
    aphelionAU: 585,
    inclinationDeg: 20.0,
    argumentOfPerihelionDeg: 145.0,
    longitudeOfAscendingNodeDeg: 100.0,
    longitudeOfPerihelionDeg: 245.0,
    orbitalPeriodYears: 9546.0,
    description: 'The earliest modern discovery paper announcing sednoid 2012 VP113 and identifying the peculiar clustering of arguments of perihelion near ω ≈ 0° in the ecliptic frame.',
    isHypothetical: true
  }
};

/**
 * Educational Secular Perturbation Simulator Types & Utilities
 */
export interface SecularParticle {
  id: string;
  name: string;
  semiMajorAxisAU: number;
  eccentricity: number;
  perihelionAU: number;
  inclinationDeg: number;
  longitudeOfPerihelionDeg: number; // ϖ in degrees
  angularPrecessionRateDegPerMyr: number; // dϖ/dt in deg/Myr
  isRealEtno: boolean;
  isResonant: boolean;
}

export interface SecularSimulationState {
  timeMyr: number; // Time in Million Years (Myr)
  particles: SecularParticle[];
  planetNine: OrbitalParameters;
  withPlanetNine: boolean;
  clusteringMetric: number; // Mean resultant length R ∈ [0, 1] (1 = perfect alignment, 0 = isotropic dispersion)
  dispersionStdDeg: number; // Angular standard deviation of ϖ in degrees
}

/**
 * Generates initial test particles for the secular perturbation demonstration:
 * Combines 6 known real extreme TNOs with 14 synthetic scattered disk test particles.
 */
export function generateSecularTestParticles(): SecularParticle[] {
  // 6 Verified Real Extreme TNOs
  const realEtnos: SecularParticle[] = [
    {
      id: 'sedna',
      name: '90377 Sedna',
      semiMajorAxisAU: 506.8,
      eccentricity: 0.849,
      perihelionAU: 76.2,
      inclinationDeg: 11.93,
      longitudeOfPerihelionDeg: 95.9, // (144.5 + 311.4) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    },
    {
      id: 'vp113',
      name: '2012 VP113',
      semiMajorAxisAU: 261.0,
      eccentricity: 0.692,
      perihelionAU: 80.5,
      inclinationDeg: 24.1,
      longitudeOfPerihelionDeg: 24.5, // (90.8 + 293.7) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    },
    {
      id: 'leleakuhonua',
      name: '541132 Leleākūhonua',
      semiMajorAxisAU: 1094.0,
      eccentricity: 0.940,
      perihelionAU: 65.2,
      inclinationDeg: 11.66,
      longitudeOfPerihelionDeg: 59.0, // (301.0 + 118.0) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    },
    {
      id: '2004vn112',
      name: '474640 Alicanto (2004 VN112)',
      semiMajorAxisAU: 328.6,
      eccentricity: 0.856,
      perihelionAU: 47.3,
      inclinationDeg: 25.56,
      longitudeOfPerihelionDeg: 33.1, // (66.0 + 327.1) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    },
    {
      id: '2013rf98',
      name: '2013 RF98',
      semiMajorAxisAU: 349.0,
      eccentricity: 0.897,
      perihelionAU: 36.1,
      inclinationDeg: 29.61,
      longitudeOfPerihelionDeg: 19.4, // (67.6 + 311.8) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    },
    {
      id: '2007tg422',
      name: '2007 TG422',
      semiMajorAxisAU: 492.7,
      eccentricity: 0.928,
      perihelionAU: 35.6,
      inclinationDeg: 18.59,
      longitudeOfPerihelionDeg: 38.6, // (112.9 + 285.7) % 360
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: true,
      isResonant: true
    }
  ];

  // 14 Synthetic Test Particles initially clustered around the observed eTNO mean ϖ ≈ 45°
  const syntheticParticles: SecularParticle[] = [];
  const baseSemis = [280, 310, 340, 370, 410, 440, 480, 520, 560, 600, 650, 720, 800, 900];

  for (let i = 0; i < baseSemis.length; i++) {
    const a = baseSemis[i];
    const e = 0.70 + (i % 5) * 0.04;
    const q = a * (1 - e);
    // Initial distribution near observed cluster with small random spread ±25°
    const varpiInit = (45 + ((i * 37) % 51 - 25) + 360) % 360;

    syntheticParticles.push({
      id: `syn-p${i + 1}`,
      name: `Synthetic Test Particle #${i + 1}`,
      semiMajorAxisAU: a,
      eccentricity: Number(e.toFixed(3)),
      perihelionAU: Number(q.toFixed(1)),
      inclinationDeg: Number((14 + (i % 4) * 3.5).toFixed(1)),
      longitudeOfPerihelionDeg: Number(varpiInit.toFixed(1)),
      angularPrecessionRateDegPerMyr: 0,
      isRealEtno: false,
      isResonant: true
    });
  }

  return [...realEtnos, ...syntheticParticles];
}

/**
 * Computes circular statistics alignment metric (mean resultant length R):
 * R = sqrt( (sum cos θ)^2 + (sum sin θ)^2 ) / N
 * R = 1 implies all perihelia point in the exact same direction.
 * R ≈ 0 implies uniform random isotropic dispersion across 360°.
 */
export function calculateClusteringMetric(particles: SecularParticle[]): {
  meanResultantLength: number;
  circularStdDeg: number;
  meanDirectionDeg: number;
} {
  if (particles.length === 0) {
    return { meanResultantLength: 0, circularStdDeg: 180, meanDirectionDeg: 0 };
  }

  let sumCos = 0;
  let sumSin = 0;

  for (const p of particles) {
    const rad = (p.longitudeOfPerihelionDeg * Math.PI) / 180;
    sumCos += Math.cos(rad);
    sumSin += Math.sin(rad);
  }

  const N = particles.length;
  const C = sumCos / N;
  const S = sumSin / N;
  const R = Math.sqrt(C * C + S * S);

  const meanRad = Math.atan2(S, C);
  const meanDeg = ((meanRad * 180 / Math.PI) % 360 + 360) % 360;

  // Circular standard deviation: s = sqrt(-2 ln(R)) in radians
  const clampedR = Math.max(0.001, Math.min(0.9999, R));
  const circStdRad = Math.sqrt(-2 * Math.log(clampedR));
  const circStdDeg = Math.min(180, (circStdRad * 180) / Math.PI);

  return {
    meanResultantLength: Number(R.toFixed(4)),
    circularStdDeg: Number(circStdDeg.toFixed(1)),
    meanDirectionDeg: Number(meanDeg.toFixed(1))
  };
}

/**
 * Steps the educational secular perturbation simulation forward by dtMyr (Million Years).
 *
 * Physical Model:
 * 1. Inner giant planets (Jupiter, Saturn, Uranus, Neptune) cause uniform prograde
 *    secular precession of perihelion:
 *      dϖ_giants / dt ≈ + K_giants / (a^(7/2) * (1 - e^2)^2)   [deg / Myr]
 * 2. An eccentric, anti-aligned perturber (Planet Nine) exerts a secular torque:
 *    Near anti-alignment (Δϖ = ϖ - ϖ_p9 ≈ 180°), the secular potential produces
 *    a restoring torque (libration):
 *      dϖ_p9 / dt ≈ - K_p9 * (M_p9 / M_sun) * (a / a_p9)^2 * sin(2 * (ϖ - ϖ_p9))
 * 3. Without Planet Nine (withPlanetNine = false), the giant planets cause steady
 *    differential precession, dispersing the cluster uniformly across 0°–360° over 10^8 years.
 *
 * Academic Distinction & Scientific Modeling Limitations:
 * This simulation is a stylized 1D educational secular model demonstrating the qualitative
 * physics of giant planet quadrupole precession versus resonant secular torque. It is designed
 * for interactive conceptual learning and is NOT a 4-billion-year N-body symplectic gravitational
 * integration (such as REBOUND or MERCURY), nor does it compute high-order mean-motion resonances.
 */
export function stepSecularSimulation(
  state: SecularSimulationState,
  dtMyr: number,
  p9Params: OrbitalParameters,
  withPlanetNine: boolean
): SecularSimulationState {
  const K_giants = 15.0; // Scaled giant planet quadrupole constant for educational visualization
  const K_p9 = 1.2; // Scaled Planet Nine secular resonance torque coefficient

  const updatedParticles: SecularParticle[] = state.particles.map(p => {
    const aNorm = p.semiMajorAxisAU / 200;
    const denom = Math.pow(aNorm, 3.5) * Math.pow(1 - p.eccentricity * p.eccentricity, 2);
    const rateGiants = K_giants / Math.max(1, denom); // Always prograde (+)

    let rateP9 = 0;
    if (withPlanetNine && p9Params.massEarth > 0) {
      const deltaVarpiDeg = p.longitudeOfPerihelionDeg - p9Params.longitudeOfPerihelionDeg;
      const deltaRad = (deltaVarpiDeg * Math.PI) / 180;
      // Resonant restoring torque near Δϖ ≈ 180°:
      const massRatio = p9Params.massEarth / 6.2;
      const ratioA = Math.min(2.0, p.semiMajorAxisAU / p9Params.semiMajorAxisAU);
      rateP9 = -K_p9 * massRatio * Math.pow(ratioA, 2) * Math.sin(2 * deltaRad);
    }

    const totalRate = rateGiants + rateP9;
    const newVarpi = ((p.longitudeOfPerihelionDeg + totalRate * dtMyr) % 360 + 360) % 360;

    return {
      ...p,
      longitudeOfPerihelionDeg: Number(newVarpi.toFixed(2)),
      angularPrecessionRateDegPerMyr: Number(totalRate.toFixed(4))
    };
  });

  const stats = calculateClusteringMetric(updatedParticles);

  return {
    timeMyr: Number((state.timeMyr + dtMyr).toFixed(2)),
    particles: updatedParticles,
    planetNine: p9Params,
    withPlanetNine,
    clusteringMetric: stats.meanResultantLength,
    dispersionStdDeg: stats.circularStdDeg
  };
}

/**
 * Astronomical constants for distance and light calculations
 */
export const AU_IN_KM = 149597870.7;
export const SPEED_OF_LIGHT_KM_S = 299792.458;
export const LIGHT_SECONDS_PER_AU = AU_IN_KM / SPEED_OF_LIGHT_KM_S; // ~499.00478 seconds

export interface ReflectedFluxResult {
  distanceAU: number;
  refDistAU: number;
  fluxRatio: number;
  factorFainter: number;
  deltaMagnitude: number;
  lightTravelTimeSeconds: number;
  lightTravelTimeFormatted: string;
  detectionDifficulty: 'Trivial' | 'Moderate' | 'Challenging' | 'Extreme Deep-Sky' | 'Near-Limit of Human Instruments';
}

/**
 * Computes the reflected sunlight flux ratio and light-travel time based on the
 * inverse-fourth-power law (F ∝ 1 / r^4) for an externally illuminated solar system body.
 */
export function computeReflectedFlux(distAU: number, refDistAU: number = 30.1): ReflectedFluxResult {
  const d = Math.max(0.1, distAU);
  const ref = Math.max(0.1, refDistAU);

  const fluxRatio = Math.pow(ref / d, 4);
  const factorFainter = Math.pow(d / ref, 4);
  const deltaMagnitude = 10 * Math.log10(d / ref);

  const lightSeconds = d * LIGHT_SECONDS_PER_AU;
  let formattedTime = '';
  if (lightSeconds < 60) {
    formattedTime = `${lightSeconds.toFixed(1)} seconds`;
  } else if (lightSeconds < 3600) {
    formattedTime = `${(lightSeconds / 60).toFixed(1)} minutes`;
  } else if (lightSeconds < 86400) {
    formattedTime = `${(lightSeconds / 3600).toFixed(1)} hours`;
  } else {
    formattedTime = `${(lightSeconds / 86400).toFixed(1)} days`;
  }

  let difficulty: ReflectedFluxResult['detectionDifficulty'] = 'Trivial';
  if (d < 5) difficulty = 'Trivial';
  else if (d <= 35) difficulty = 'Moderate';
  else if (d <= 100) difficulty = 'Challenging';
  else if (d <= 450) difficulty = 'Extreme Deep-Sky';
  else difficulty = 'Near-Limit of Human Instruments';

  return {
    distanceAU: Number(d.toFixed(2)),
    refDistAU: Number(ref.toFixed(2)),
    fluxRatio: Number(fluxRatio.toExponential(4)),
    factorFainter: Number(factorFainter.toFixed(1)),
    deltaMagnitude: Number(deltaMagnitude.toFixed(2)),
    lightTravelTimeSeconds: Number(lightSeconds.toFixed(1)),
    lightTravelTimeFormatted: formattedTime,
    detectionDifficulty: difficulty
  };
}

export interface DistanceBenchmark {
  id: string;
  name: string;
  category: 'planet' | 'boundary' | 'probe' | 'hypothetical' | 'deep-space';
  distanceAU: number;
  description: string;
  plainComparison: string;
}

export const DISTANCE_SCALE_BENCHMARKS: DistanceBenchmark[] = [
  {
    id: 'earth',
    name: 'Earth (1 AU)',
    category: 'planet',
    distanceAU: 1.0,
    description: 'Average distance between Earth and the Sun (~149.6 million kilometers).',
    plainComparison: 'If Earth were 1 meter from the Sun...'
  },
  {
    id: 'mars',
    name: 'Mars (1.52 AU)',
    category: 'planet',
    distanceAU: 1.52,
    description: 'Outer boundary of the warm inner rocky terrestrial planets.',
    plainComparison: '...Mars would be 1.5 meters away.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter (5.2 AU)',
    category: 'planet',
    distanceAU: 5.2,
    description: 'The giant planet whose immense gravity shapes asteroid belts and cometary orbits.',
    plainComparison: '...Jupiter would be over 5 meters away.'
  },
  {
    id: 'neptune',
    name: 'Neptune (30.1 AU)',
    category: 'planet',
    distanceAU: 30.1,
    description: 'Outermost recognized classical planet in our Solar System (4.5 billion km).',
    plainComparison: '...Neptune would be 30 meters away (a 10-story building length).'
  },
  {
    id: 'pluto',
    name: 'Pluto & Kuiper Belt (39.5 AU)',
    category: 'boundary',
    distanceAU: 39.5,
    description: 'The classical Kuiper Belt: a vast disk of primordial icy remnants beyond Neptune.',
    plainComparison: '...Pluto would be 40 meters away in deep freezing cold.'
  },
  {
    id: 'voyager1',
    name: 'Voyager 1 Spacecraft (~165 AU)',
    category: 'probe',
    distanceAU: 165.0,
    description: 'The most distant human-made artifact, traveling outward into interstellar space since 1977.',
    plainComparison: '...Voyager 1 would be 165 meters away, still sending faint radio signals back.'
  },
  {
    id: 'sedna-perihelion',
    name: 'Sedna at Closest Point (76.2 AU)',
    category: 'boundary',
    distanceAU: 76.2,
    description: 'Detached sednoid perihelion: far beyond Neptune’s gravitational reach.',
    plainComparison: '...Sedna never gets closer than 76 meters, baffling astronomers.'
  },
  {
    id: 'planet-nine-perihelion',
    name: 'Planet Nine Closest (247 AU)',
    category: 'hypothetical',
    distanceAU: 247.0,
    description: 'Batygin & Brown (2021) calculated perihelion for the hypothetical perturber.',
    plainComparison: '...Planet Nine at its closest would be nearly 250 meters away.'
  },
  {
    id: 'planet-nine-aphelion',
    name: 'Planet Nine Farthest (513 AU)',
    category: 'hypothetical',
    distanceAU: 513.0,
    description: 'Aphelion where Planet Nine spends the vast majority of its multi-thousand-year orbit.',
    plainComparison: '...At its farthest, it is over 500 meters away—more than 5 football fields!'
  },
  {
    id: 'sedna-aphelion',
    name: 'Sedna at Farthest Point (937 AU)',
    category: 'boundary',
    distanceAU: 937.0,
    description: 'Sedna’s extreme aphelion reaches nearly 1,000 AU into the inner Oort Cloud.',
    plainComparison: '...Sedna swings out nearly 1 kilometer away before returning.'
  }
];

export interface MissionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningMission {
  id: string;
  missionNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  estimatedMinutes: number;
  objectives: string[];
  lessonNarrative: string;
  plainConcept: string;
  interactiveChallenge: {
    instruction: string;
    actionLabel: string;
    targetTab?: 'orbit' | 'distance' | 'evidence' | 'blink';
  };
  question: MissionQuestion;
}

export const GUIDED_LEARNING_MISSIONS: LearningMission[] = [
  {
    id: 'mission-1',
    missionNumber: 1,
    title: 'Voyage to the Outer Solar System',
    subtitle: 'Understanding Cosmic Distances and the Astronomical Unit',
    badge: 'Solar System Scale',
    estimatedMinutes: 4,
    objectives: [
      'Learn what an Astronomical Unit (AU) represents in human terms',
      'Discover where Neptune orbits relative to Earth and the Sun',
      'Understand the vast emptiness beyond the classical planets'
    ],
    lessonNarrative: 'To explore deep space, astronomers measure distance using the Astronomical Unit (AU). One AU is the average distance from Earth to the Sun: approximately 150 million kilometers (93 million miles). Light from the Sun takes about 8.3 minutes to reach Earth. Neptune, the outermost recognized major planet, orbits at 30.1 AU—meaning sunlight takes over 4 hours to reach it! Beyond Neptune lies a realm so vast that traditional kilometers become incomprehensible.',
    plainConcept: 'If Earth were 1 meter away from the Sun, Neptune would be 30 meters away, and the predicted orbit of Planet Nine would stretch between 250 and 500 meters away—five football fields into freezing darkness.',
    interactiveChallenge: {
      instruction: 'Switch to the "Cosmic Distance Playground" tab and use the interactive distance slider to compare Earth, Neptune, and the hypothetical Planet Nine.',
      actionLabel: 'Open Distance Playground',
      targetTab: 'distance'
    },
    question: {
      id: 'q1',
      question: 'If Earth is 1 AU from the Sun, approximately how far away does Neptune orbit?',
      options: ['5.2 AU', '30.1 AU', '150 AU', '1,000 AU'],
      correctIndex: 1,
      explanation: 'Neptune orbits at an average distance of approximately 30.1 AU (about 4.5 billion km from the Sun), marking the outer frontier of the recognized classical planets.'
    }
  },
  {
    id: 'mission-2',
    missionNumber: 2,
    title: 'The Mystery of Detached Sednoids',
    subtitle: 'Extreme Trans-Neptunian Objects That Defy Standard Models',
    badge: 'eTNO Dynamics',
    estimatedMinutes: 5,
    objectives: [
      'Understand how gravity shapes orbits through close planetary scattering',
      'Discover extreme Trans-Neptunian Objects (Sedna, 2012 VP113, Leleākūhonua)',
      'Identify why these bodies cannot be explained by Neptune alone'
    ],
    lessonNarrative: 'In textbook astronomy, icy bodies in the Kuiper Belt get knocked onto stretched-out elliptical orbits when they pass too close to Neptune (30 AU). But in 2003, astronomers discovered Sedna, an icy world whose closest approach (perihelion) is 76.2 AU—more than double Neptune\'s distance! Because Sedna never comes anywhere near Neptune, Neptune could not have put it into that orbit. Something else must have pulled it outward.',
    plainConcept: 'Imagine a tennis ball bouncing around a court. If you find a tennis ball balanced on the stadium roof, you know the players on the court could not have gently tapped it there—some other force or player must have launched it.',
    interactiveChallenge: {
      instruction: 'Go to the "Orbit Lab & Simulation" tab, select "Sedna" from the fleet selector, and inspect its perihelion and aphelion distances.',
      actionLabel: 'Inspect Sedna in Orbit Lab',
      targetTab: 'orbit'
    },
    question: {
      id: 'q2',
      question: 'Why does Sedna\'s orbit puzzle planetary scientists?',
      options: [
        'Sedna moves faster than the speed of light',
        'Sedna’s closest point (76 AU) is far beyond Neptune’s gravitational reach (30 AU)',
        'Sedna is composed entirely of liquid hydrogen',
        'Sedna orbits backwards around the galaxy'
      ],
      correctIndex: 1,
      explanation: 'Because Sedna never approaches closer than 76.2 AU, Neptune’s gravity (at 30 AU) is far too distant to have scattered it into its elongated orbit. An external perturber or passing star is required to lift its perihelion.'
    }
  },
  {
    id: 'mission-3',
    missionNumber: 3,
    title: 'The Shepherding Hypothesis',
    subtitle: 'Simulating How a Distant Planet Could Cluster Distant Orbits',
    badge: 'Orbital Mechanics',
    estimatedMinutes: 6,
    objectives: [
      'Understand orbital precession (how elliptical orbits slowly pivot over time)',
      'Experiment with Planet Nine parameters (mass, semi-major axis, eccentricity)',
      'Compare test particle clustering WITH vs. WITHOUT a shepherd planet'
    ],
    lessonNarrative: 'Normally, the gravitational tugs of Jupiter, Saturn, Uranus, and Neptune cause distant elliptical orbits to slowly pivot (precess) at slightly different rates. Over 100 million years, this differential precession scrambles any initial grouping, spreading the orbits uniformly across the full 360° circle. Caltech researchers Konstantin Batygin and Mike Brown showed that an undiscovered 5–8 Earth-mass planet on a tilted, eccentric orbit could exert secular resonant torques that "shepherd" the orbits, keeping them locked together on one side of the sky.',
    plainConcept: 'Like a sheepdog keeping a flock from scattering across a wide hillside, a hypothetical distant planet could nudge straying orbits back toward the cluster each time they drift away.',
    interactiveChallenge: {
      instruction: 'In the Orbit Lab, toggle the "Planet Nine Gravity" switch between ON and OFF to see how the clustering metric R behaves over 50 Million Years of simulation.',
      actionLabel: 'Test Dynamical Simulation',
      targetTab: 'orbit'
    },
    question: {
      id: 'q3',
      question: 'What happens to the clustered test particles over millions of years if Planet Nine does NOT exist?',
      options: [
        'They instantly fall into the Sun',
        'Giant planet perturbations cause differential precession, dispersing them evenly across 360°',
        'Their orbits freeze permanently in place',
        'They all collide with Earth simultaneously'
      ],
      correctIndex: 1,
      explanation: 'Without a distant shepherd planet to provide restoring torques, the known giant planets cause differential apsidal precession, causing the orbits to spread out randomly over ~100–500 million years.'
    }
  },
  {
    id: 'mission-4',
    missionNumber: 4,
    title: 'The Evidence Trial: Clustering vs. Bias',
    subtitle: 'How Scientists Test Alternate Hypotheses and Observational Bias',
    badge: 'Scientific Method',
    estimatedMinutes: 5,
    objectives: [
      'Learn what observational selection bias means in astronomical sky surveys',
      'Explore the Outer Solar System Origins Survey (OSSOS) critique',
      'Discover alternative explanations like collective Kuiper Belt self-gravity'
    ],
    lessonNarrative: 'Good science requires exploring every possible explanation before claiming a new planet exists. Ground-based telescopes in Hawaii and Chile can only observe the sky during clear, moonless nights and certain seasons. In 2017, the OSSOS research team pointed out that if telescopes only look in certain directions, all the objects you discover will naturally appear clustered in those directions! Astronomers must use rigorous statistical debiasing to prove the clustering is real physics rather than where we happened to look.',
    plainConcept: 'If you only look for your lost keys under the streetlamp because that is where the light is, finding them there does not prove keys only exist under streetlamps! Astronomers must account for where their telescopes were pointing.',
    interactiveChallenge: {
      instruction: 'Open the "Evidence Detective" tab and review the side-by-side comparison cards for the Shepherding Hypothesis, Selection Bias, and Collective Disk Gravity.',
      actionLabel: 'Open Evidence Detective',
      targetTab: 'evidence'
    },
    question: {
      id: 'q4',
      question: 'What is "observational selection bias" in the search for outer Solar System bodies?',
      options: [
        'Astronomers deliberately hiding images from the public',
        'Sky surveys observing preferentially during specific seasons and directions, making detections appear artificially clustered',
        'Telescopes bending light in random directions',
        'Spacecraft engines failing during launch'
      ],
      correctIndex: 1,
      explanation: 'Observational selection bias occurs because telescopes can only look when weather, seasons, and galactic coordinates permit. Without statistical debiasing, the sky coverage pattern can mimic physical orbital clustering.'
    }
  },
  {
    id: 'mission-5',
    missionNumber: 5,
    title: 'Hunting for Moving Targets in the Dark',
    subtitle: 'Blink Comparators, Infrared Thermals, and the Vera C. Rubin Survey',
    badge: 'Observational Astronomy',
    estimatedMinutes: 5,
    objectives: [
      'Understand the inverse-fourth-power law (why distant objects are so faint)',
      'Practice Clyde Tombaugh\'s blink comparator discovery technique',
      'Learn how the Vera C. Rubin Observatory (LSST) will test the hypothesis'
    ],
    lessonNarrative: 'Why haven’t we seen Planet Nine if it’s out there? Sunlight has to travel all the way OUT to the planet (dimming as 1/r²), and then the reflected light has to travel all the way BACK to Earth (dimming by another 1/r²). That means detected brightness drops as 1/r⁴! At 500 AU, an object reflects over 75,000 times less light back to Earth than at Neptune\'s distance. Astronomers use multi-epoch blink comparators to spot tiny shifts against background stars, and the upcoming Vera C. Rubin Observatory in Chile will scan the entire southern sky every few nights with a 3.2-gigapixel camera.',
    plainConcept: 'If a friend holds a flashlight 30 meters away, you see it easily. If they walk 500 meters away and hold up a dull coin reflecting a tiny candle, finding that coin in the pitch-black night requires an extraordinarily sensitive telescope.',
    interactiveChallenge: {
      instruction: 'Navigate to the "Candidate Blink Search" tab and classify the simulated candidate fields to test your ability to detect moving objects and rule out detector artifacts.',
      actionLabel: 'Launch Blink Comparator',
      targetTab: 'blink'
    },
    question: {
      id: 'q5',
      question: 'Why does reflected sunlight from an object at 500 AU fade by the inverse-fourth power (1/r⁴)?',
      options: [
        'Telescope mirrors absorb twice as much light in space',
        'Sunlight dims as 1/r² traveling to the object, and the reflected light dims by another 1/r² returning to Earth',
        'Einstein’s relativity bends outer space into a prism',
        'Interstellar dust consumes three-quarters of the photons'
      ],
      correctIndex: 1,
      explanation: 'Because outer solar system bodies are not self-luminous stars, they only shine by reflected sunlight. Light dims by 1/r² on the way out and 1/r² on the way back, multiplying to 1/r⁴.'
    }
  }
];

export const PLAIN_LANGUAGE_EXPLANATIONS = {
  antiAlignment: {
    title: 'Why Does Planet Nine Point Opposite to the Clustered Objects?',
    subtitle: 'The Orbital Dance of Anti-Alignment',
    plainText: 'Imagine two dancers on a large circular floor. If both their long orbits pointed in the same direction, they would cross paths and crash into each other after a few laps. But if their orbits point in opposite directions (anti-aligned by 180°), their paths never intersect when both bodies are at their closest approach to the Sun! This geometric shielding prevents disruptive collisions and keeps the clustered icy bodies stable over billions of years.'
  },
  gravitationalShielding: {
    title: 'What is Gravitational Shielding / Secular Resonance?',
    subtitle: 'How an Unseen Planet Protects the Cluster',
    plainText: 'The giant planets (Jupiter and Saturn) act like noisy neighbors: their strong gravity constantly pulls on distant icy bodies, trying to scramble their orbits in different directions. A hypothetical Planet Nine acts like a stabilizing anchor. Each time an icy body’s orbit starts to drift or precess too quickly, Planet Nine’s gravitational torque pulls it back toward the pack. This delicate balance between the inner giants and the outer perturber keeps the cluster intact.'
  },
  inverseFourthPower: {
    title: 'The Inverse-Fourth-Power Law Explained Simply',
    subtitle: 'Why Distant Objects Are So Incredibly Faint',
    plainText: 'Stars like our Sun generate their own light, so their brightness dims according to the inverse-square law (1/r²). But cold planets and asteroids do not produce their own light—they act like tiny mirrors reflecting sunlight. Sunlight must travel outward from the Sun to the object (dimming by 1/r²), and then bounce all the way back across the Solar System to telescope mirrors on Earth (dimming by another factor of 1/r²). When you multiply these together, brightness plummets as 1/r⁴! An object at 500 AU reflects over 75,000 times less sunlight back to our telescopes than an identical object at Neptune (30 AU).'
  },
  astronomicalUnit: {
    title: 'What is an Astronomical Unit (AU)?',
    subtitle: 'The Measuring Tape of the Solar System',
    plainText: 'Space is too immense for kilometers or miles. An Astronomical Unit (AU) is defined as the average distance from the center of Earth to the center of the Sun: exactly 149,597,870.7 kilometers (about 93 million miles). Sunlight takes 8 minutes and 20 seconds to travel 1 AU. Using AU lets us compare planetary distances easily: Earth is 1 AU, Mars is 1.5 AU, Jupiter is 5.2 AU, Neptune is 30.1 AU, and the proposed orbit of Planet Nine stretches from 250 to 500 AU.'
  },
  perihelion: {
    title: 'What is Perihelion?',
    subtitle: 'Closest Approach to the Sun',
    plainText: 'Planets do not orbit in perfect circles; they travel along ellipses. Perihelion is the unique point in an orbit where a planet or asteroid is closest to the Sun. At this point, the Sun’s gravitational pull is strongest, so the object speeds along at its highest velocity.'
  },
  aphelion: {
    title: 'What is Aphelion?',
    subtitle: 'Farthest Reach into Deep Space',
    plainText: 'Aphelion is the exact opposite of perihelion: it is the farthest point an orbiting object reaches from the Sun. Out here, solar gravity is at its weakest, and the object slows down to its minimum orbital speed before coasting back inward.'
  },
  eccentricity: {
    title: 'What is Orbital Eccentricity?',
    subtitle: 'Measuring Ovalness from 0 to 1',
    plainText: 'Eccentricity is a number describing the shape of an orbit. An eccentricity of 0 means a flawless circle. As the number increases toward 1, the orbit stretches into an elongated oval. Earth has an eccentricity of 0.017 (almost perfectly round), while Sedna has an eccentricity of 0.85 (extremely elongated).'
  },
  precession: {
    title: 'What is Apsidal Precession?',
    subtitle: 'The Slow Rotation of an Orbit',
    plainText: 'An orbit does not stay frozen in space like a wire hoop. Over millions of years, the gravitational nudges from other planets cause the entire ellipse to slowly swivel around the Sun, like an oval traced on a Spirograph wheel.'
  },
  sednoid: {
    title: 'What is a Sednoid / Extreme TNO?',
    subtitle: 'Mysterious Deep-Freeze Wanderers',
    plainText: 'A Sednoid is an extreme trans-Neptunian object whose closest point to the Sun (perihelion) is so far away (beyond 50 AU) that Neptune’s gravity can never touch it. Because no known planet can steer them into these extreme orbits, scientists suspect an unseen massive planet must have shaped their paths.'
  },
  clusteringMetric: {
    title: 'What is the Apsidal Clustering Metric (R)?',
    subtitle: 'Testing Random Chance vs Physical Order',
    plainText: 'The clustering metric R measures how neatly a group of orbital axes point in the same direction. If orbits are scattered randomly all over the compass rose, R equals 0. If they all point in the exact same direction, R equals 1. Extreme TNOs score R ≈ 0.84, showing strong alignment that is unlikely to occur purely by random luck.'
  }
};

export interface AstronomyGlossaryItem {
  id: string;
  term: string;
  symbol?: string;
  pronunciation?: string;
  category: 'Orbital Mechanics' | 'Distance & Scale' | 'Observational Astronomy' | 'Planet X Science';
  simpleDefinition: string;
  analogy: string;
  example: string;
  relatedTopicPage?: 'planet-x' | 'observatory' | 'asteroid-watch' | 'universe' | 'data-centre';
}

export const ASTRONOMY_GLOSSARY: AstronomyGlossaryItem[] = [
  {
    id: 'astronomical-unit',
    term: 'Astronomical Unit',
    symbol: 'AU',
    pronunciation: 'ay-yoo',
    category: 'Distance & Scale',
    simpleDefinition: 'The average distance from the center of Earth to the center of the Sun, standardized at exactly 149,597,870.7 kilometers (92.96 million miles).',
    analogy: 'The universal measuring tape of the Solar System. Instead of writing millions of kilometers, Earth is simply 1 AU.',
    example: 'Earth is 1 AU from the Sun, Jupiter is 5.2 AU, Neptune is 30.1 AU, and Planet Nine is hypothesized between 380 and 500 AU.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'perihelion',
    term: 'Perihelion',
    symbol: 'q',
    pronunciation: 'per-ih-HEE-lee-un',
    category: 'Orbital Mechanics',
    simpleDefinition: 'The point along an orbit where a celestial body is closest to the Sun.',
    analogy: 'The bottom of a roller coaster drop where you move fastest and feel the most pull.',
    example: 'Earth reaches perihelion every January at ~0.983 AU. Sedna’s perihelion is located at 76.2 AU, far beyond Neptune.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'aphelion',
    term: 'Aphelion',
    symbol: 'Q',
    pronunciation: 'af-HEE-lee-un',
    category: 'Orbital Mechanics',
    simpleDefinition: 'The point along an orbit where a celestial body is farthest from the Sun.',
    analogy: 'The peak of a swing where motion pauses for an instant before falling back inward.',
    example: 'Earth reaches aphelion in early July at 1.017 AU. Sedna’s aphelion reaches a staggering 937 AU.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'eccentricity',
    term: 'Orbital Eccentricity',
    symbol: 'e',
    pronunciation: 'ek-sen-TRIS-ih-tee',
    category: 'Orbital Mechanics',
    simpleDefinition: 'A unitless number between 0 and 1 describing how elongated or flattened an orbit is compared to a perfect circle.',
    analogy: 'A value of 0 is a circular dinner plate; 0.5 is an egg; 0.85 is a stretched surfboard.',
    example: 'Earth has a nearly circular orbit (e = 0.0167). Pluto has e = 0.249. Extreme TNO Sedna has e = 0.855.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'apsidal-precession',
    term: 'Apsidal Precession',
    symbol: 'ϖ̇ (dϖ/dt)',
    pronunciation: 'AP-sih-dul pree-SESH-un',
    category: 'Orbital Mechanics',
    simpleDefinition: 'The gradual rotation of an elliptical orbit’s major axis within its orbital plane over long periods of time.',
    analogy: 'Tracing an oval on a Spirograph wheel—each successive loop points in a slightly shifted direction.',
    example: 'Mercury’s perihelion precesses 43 arcseconds per century due to Einstein’s General Relativity. Giant planets cause outer TNO orbits to precess over millions of years.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'semi-major-axis',
    term: 'Semi-Major Axis',
    symbol: 'a',
    pronunciation: 'sem-ee MAY-jer AK-sis',
    category: 'Orbital Mechanics',
    simpleDefinition: 'Half the length of the longest diameter of an elliptical orbit; represents the average orbital distance from the focal body.',
    analogy: 'The average distance of an object during one full lap around the Sun.',
    example: 'Earth: a = 1.0 AU. Jupiter: a = 5.2 AU. Planet Nine hypothesis: a = 380–500 AU.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'orbital-inclination',
    term: 'Orbital Inclination',
    symbol: 'i',
    pronunciation: 'in-clih-NAY-shun',
    category: 'Orbital Mechanics',
    simpleDefinition: 'The tilt angle of an orbit plane relative to the reference plane (usually Earth’s ecliptic plane).',
    analogy: 'Holding a frisbee flat vs tilting it sideways at a steep angle.',
    example: 'Earth is 0° by definition; Mercury is tilted 7°; Pluto is tilted 17.2°; Planet Nine is modeled at ~16° tilt.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'tno',
    term: 'Trans-Neptunian Object (TNO)',
    symbol: 'TNO',
    pronunciation: 'T-N-O',
    category: 'Observational Astronomy',
    simpleDefinition: 'Any minor planet or minor body in the Solar System that orbits the Sun at a greater average distance than Neptune (30.1 AU).',
    analogy: 'The icy frontier islands of our solar system past the realm of the giant planets.',
    example: 'Pluto, Eris, Makemake, Haumea, and thousands of Kuiper Belt asteroids are classified as TNOs.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'sednoid',
    term: 'Sednoid / Extreme TNO',
    symbol: 'eTNO',
    pronunciation: 'SED-noyd',
    category: 'Planet X Science',
    simpleDefinition: 'Distant trans-Neptunian objects with a perihelion greater than 50 AU and semi-major axis greater than 150 AU, completely detached from Neptune.',
    analogy: 'Isolated oceanic lighthouses so far out that the shore tides of Neptune cannot reach or stir them.',
    example: '90377 Sedna, 2012 VP113 ("Biden"), and 2015 TG387 ("Leleākūhonua").',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'light-travel-time',
    term: 'Light-Travel Time',
    symbol: 't = d / c',
    pronunciation: 'lyt TRAV-ul tyme',
    category: 'Distance & Scale',
    simpleDefinition: 'The time required for electromagnetic waves (light, radio signals) to travel across a given distance in a vacuum.',
    analogy: 'A cosmic delay: looking into space is looking backward into history.',
    example: 'Sunlight takes 8.3 minutes to reach Earth, 4.2 hours to Neptune, and ~70 hours (almost 3 days) to reach Planet Nine at 500 AU.',
    relatedTopicPage: 'observatory'
  },
  {
    id: 'inverse-fourth-power',
    term: 'Inverse-Fourth-Power Law',
    symbol: 'F ∝ 1 / r⁴',
    pronunciation: 'in-vers FORTH pow-er',
    category: 'Observational Astronomy',
    simpleDefinition: 'The physical law stating that the apparent brightness of an astronomical body illuminated by the Sun decreases inversely with the fourth power of its distance.',
    analogy: 'Using a flashlight to see a tiny coin in a dark field: light must travel there, bounce off the coin, and travel all the way back.',
    example: 'An icy planet at 500 AU appears over 75,000 times fainter than an identical body at Neptune’s distance (30 AU).',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'apsidal-clustering',
    term: 'Apsidal Clustering Metric',
    symbol: 'R',
    pronunciation: 'AP-sih-dul KLUS-ter-ing',
    category: 'Planet X Science',
    simpleDefinition: 'A statistical Rayleigh vector length metric between 0 and 1 quantifying how tightly orbital perihelia cluster toward a common direction in space.',
    analogy: 'A flock of compass needles: pointing in every direction gives R = 0; locked in parallel gives R = 1.',
    example: 'The known extreme TNOs have R ≈ 0.84, pointing within a narrow 60° sector opposite Planet Nine’s aphelion.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'blink-comparator',
    term: 'Blink Comparator',
    symbol: 'Blink Technique',
    pronunciation: 'blink kum-PAIR-uh-ter',
    category: 'Observational Astronomy',
    simpleDefinition: 'An optical microscope device that alternates rapidly between two photographic plates of the same patch of sky taken nights apart to detect moving objects.',
    analogy: 'An astronomical flipbook: immovable background stars stay static while nearby moving objects jump back and forth.',
    example: 'Used by Clyde Tombaugh in February 1930 at Lowell Observatory to spot Pluto shifting against the star background.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'secular-resonance',
    term: 'Secular Resonance',
    symbol: 'Kozai-Lidov',
    pronunciation: 'SEK-yoo-lur REZ-uh-nuns',
    category: 'Planet X Science',
    simpleDefinition: 'A gravitational phenomenon occurring when the slow precession rate of an orbit matches that of a perturbing massive body, creating synchronized oscillations.',
    analogy: 'Pushing a child on a swing at the exact natural frequency of the swing to sustain the motion over long periods.',
    example: 'Planet Nine exerts secular torques that keep extreme TNO orbits anti-aligned and protects them from Neptune’s disruptive scattering.',
    relatedTopicPage: 'planet-x'
  },
  {
    id: 'geometric-albedo',
    term: 'Geometric Albedo',
    symbol: 'p',
    pronunciation: 'al-BEE-doh',
    category: 'Observational Astronomy',
    simpleDefinition: 'The ratio of the actual brightness of a celestial body as viewed from the light source to that of an idealized, fully reflecting diffuse disk.',
    analogy: 'A measure of reflectivity: black charcoal is albedo ~0.04; fresh white snow is albedo ~0.90.',
    example: 'Enceladus has an albedo of ~0.99 (nearly pure fresh ice), whereas carbonaceous asteroids like Bennu have an albedo of ~0.04.',
    relatedTopicPage: 'asteroid-watch'
  }
];

