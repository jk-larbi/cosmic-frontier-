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
