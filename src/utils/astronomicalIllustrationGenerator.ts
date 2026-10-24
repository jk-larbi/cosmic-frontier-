import type { AstronomicalImageRecord } from '../types';

export interface IllustrationParams {
  id: string;
  name: string;
  category?: 'exoplanet' | 'planet' | 'star' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'small-body' | 'observation';
  radiusEarthRadii?: number | null;
  radiusKm?: number | string | null;
  massEarthMasses?: number | null;
  temperatureK?: number | null;
  stellarType?: string | null;
  orbitalPeriodDays?: number | null;
  discoveryMethod?: string | null;
  disposition?: string | null;
}

/**
 * Deterministic string hasher for reproducible visual patterns
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Maps stellar temperature or spectral type to light color
 */
function getStarLightColor(tempK: number | null | undefined, spectralType: string | null | undefined): string {
  if (tempK) {
    if (tempK < 3700) return '#EF4444'; // M-dwarf (crimson/red)
    if (tempK < 5200) return '#F59E0B'; // K-dwarf (orange/gold)
    if (tempK < 6000) return '#FEF08A'; // G-dwarf (yellow-white, like Sun)
    if (tempK < 7500) return '#E0F2FE'; // F-dwarf (crisp white)
    return '#60A5FA'; // A/B/O star (blue-white)
  }
  if (spectralType) {
    const s = spectralType.toUpperCase();
    if (s.startsWith('M')) return '#EF4444';
    if (s.startsWith('K')) return '#F59E0B';
    if (s.startsWith('G')) return '#FEF08A';
    if (s.startsWith('F')) return '#E0F2FE';
    if (s.startsWith('A') || s.startsWith('B') || s.startsWith('O')) return '#60A5FA';
  }
  return '#FEF08A'; // default solar yellow
}

/**
 * Determines exoplanet physical archetype from radius and temperature
 */
export function classifyExoplanetVisualType(
  radius: number | null | undefined,
  tempK: number | null | undefined
): {
  typeLabel: string;
  primaryColor: string;
  secondaryColor: string;
  atmosphereGlowColor: string;
  hasBands: boolean;
  hasCraters: boolean;
  hasThermalGlow: boolean;
} {
  const r = radius ?? 1.0;
  const t = tempK ?? 288;

  // Ultra-hot worlds (> 1300 K)
  if (t > 1300) {
    return {
      typeLabel: r >= 4.0 ? 'Ultra-Hot Gas Giant' : 'Lava-Surface Terrestrial',
      primaryColor: '#7F1D1D', // dark magma
      secondaryColor: '#EA580C', // incandescent lava
      atmosphereGlowColor: '#F97316',
      hasBands: r >= 4.0,
      hasCraters: r < 2.0,
      hasThermalGlow: true
    };
  }

  // Gas Giants (r >= 4.0 R_earth)
  if (r >= 4.0) {
    if (t < 250) {
      // Cold gas giant (Jovian/Saturnian)
      return {
        typeLabel: 'Cold Gas Giant',
        primaryColor: '#0369A1',
        secondaryColor: '#38BDF8',
        atmosphereGlowColor: '#7DD3FC',
        hasBands: true,
        hasCraters: false,
        hasThermalGlow: false
      };
    } else {
      // Warm / Hot Jupiter
      return {
        typeLabel: 'Warm Gas Giant',
        primaryColor: '#78350F',
        secondaryColor: '#D97706',
        atmosphereGlowColor: '#FBBF24',
        hasBands: true,
        hasCraters: false,
        hasThermalGlow: false
      };
    }
  }

  // Sub-Neptunes (2.0 <= r < 4.0 R_earth)
  if (r >= 2.0) {
    return {
      typeLabel: 'Sub-Neptune (Volatile Envelope)',
      primaryColor: '#0F766E', // deep teal
      secondaryColor: '#2DD4BF', // cyan haze
      atmosphereGlowColor: '#5EEAD4',
      hasBands: true,
      hasCraters: false,
      hasThermalGlow: false
    };
  }

  // Super-Earths (1.25 <= r < 2.0 R_earth)
  if (r >= 1.25) {
    return {
      typeLabel: 'Super-Earth (Dense Terrestrial)',
      primaryColor: '#1E293B',
      secondaryColor: '#475569',
      atmosphereGlowColor: '#94A3B8',
      hasBands: false,
      hasCraters: true,
      hasThermalGlow: false
    };
  }

  // Rocky Terrestrial (r < 1.25 R_earth)
  if (t >= 250 && t <= 360) {
    // Temperate rocky world
    return {
      typeLabel: 'Temperate Rocky World',
      primaryColor: '#1E3A8A', // ocean-like deep blue
      secondaryColor: '#3B82F6', // condensation white/blue
      atmosphereGlowColor: '#60A5FA',
      hasBands: false,
      hasCraters: true,
      hasThermalGlow: false
    };
  } else {
    // Airless / desiccated rocky world
    return {
      typeLabel: 'Rocky Terrestrial',
      primaryColor: '#334155', // basaltic gray
      secondaryColor: '#64748B',
      atmosphereGlowColor: '#94A3B8',
      hasBands: false,
      hasCraters: true,
      hasThermalGlow: false
    };
  }
}

/**
 * Generates deterministic SVG markup for any astronomical body
 */
export function generateAstronomicalSvg(params: IllustrationParams, width = 640, height = 360): string {
  const seed = hashString(params.name || params.id || 'astronomical-object');
  const cat = params.category || 'exoplanet';

  const starLight = getStarLightColor(params.temperatureK, params.stellarType);
  const cx = width / 2;
  const cy = height / 2;

  // Background gradient with fine star dots
  const planetGradId = `planet-grad-${seed}`;
  const atmoGlowId = `atmo-glow-${seed}`;
  const thermalGlowId = `thermal-glow-${seed}`;

  // Deterministic stars in background
  const numStars = 35;
  const starElements: string[] = [];
  for (let i = 0; i < numStars; i++) {
    const sx = ((seed * (i + 13) * 17) % (width - 20)) + 10;
    const sy = ((seed * (i + 29) * 23) % (height - 20)) + 10;
    const sr = (i % 5 === 0) ? 1.5 : (i % 2 === 0 ? 1 : 0.6);
    const op = ((i * 13) % 60 + 30) / 100;
    starElements.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#FFFFFF" opacity="${op}" />`);
  }

  // 1. STAR CATEGORY
  if (cat === 'star') {
    const starRadius = Math.min(width, height) * 0.28;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <radialGradient id="${planetGradId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="45%" stop-color="${starLight}" />
            <stop offset="85%" stop-color="${starLight}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#050B1A" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="${atmoGlowId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${starLight}" stop-opacity="0.6" />
            <stop offset="50%" stop-color="${starLight}" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#050B1A" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="#050B1A" />
        ${starElements.join('\n')}
        <!-- Stellar Corona -->
        <circle cx="${cx}" cy="${cy}" r="${starRadius * 1.5}" fill="url(#${atmoGlowId})" />
        <!-- Stellar Photosphere -->
        <circle cx="${cx}" cy="${cy}" r="${starRadius}" fill="url(#${planetGradId})" />
        <circle cx="${cx}" cy="${cy}" r="${starRadius * 0.35}" fill="#FFFFFF" opacity="0.9" />
        <!-- Scientific Watermark -->
        <g transform="translate(16, ${height - 20})">
          <text fill="#94A3B8" font-size="10" font-family="monospace" letter-spacing="1">
            SCIENTIFIC MODEL • ${params.stellarType || 'STARS'} (${params.temperatureK ? `${params.temperatureK} K` : 'CALIBRATED'})
          </text>
        </g>
      </svg>
    `.trim();
  }

  // 2. ASTEROID / COMET CATEGORY
  if (cat === 'asteroid' || cat === 'comet' || cat === 'small-body') {
    const isComet = cat === 'comet' || params.name.toLowerCase().includes('comet') || params.name.includes('1P');
    const rockRadius = Math.min(width, height) * 0.22;
    // Irregular asteroid polygon vertices
    const points: string[] = [];
    const numVerts = 12;
    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * 2 * Math.PI;
      const variation = 0.8 + (((seed * (i + 7)) % 40) / 100);
      const px = cx + Math.cos(angle) * rockRadius * variation;
      const py = cy + Math.sin(angle) * rockRadius * variation;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <linearGradient id="${planetGradId}" x1="20%" y1="20%" x2="90%" y2="90%">
            <stop offset="0%" stop-color="#94A3B8" />
            <stop offset="50%" stop-color="#475569" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
          <linearGradient id="cometTail" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.7" />
            <stop offset="70%" stop-color="#8B5CF6" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#050B1A" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="#050B1A" />
        ${starElements.join('\n')}
        ${isComet ? `
          <!-- Comet Dust & Ion Tail -->
          <polygon points="${cx},${cy} ${cx + width * 0.45},${cy - 40} ${cx + width * 0.45},${cy + 40}" fill="url(#cometTail)" />
        ` : ''}
        <!-- Irregular Asteroid Silhouette -->
        <polygon points="${points.join(' ')}" fill="url(#${planetGradId})" stroke="#334155" stroke-width="1.5" />
        <!-- Impact Craters -->
        <circle cx="${cx - 15}" cy="${cy - 10}" r="8" fill="#1E293B" stroke="#0F172A" opacity="0.7" />
        <circle cx="${cx + 20}" cy="${cy + 15}" r="12" fill="#1E293B" stroke="#0F172A" opacity="0.6" />
        <circle cx="${cx - 5}" cy="${cy + 25}" r="6" fill="#1E293B" stroke="#0F172A" opacity="0.8" />
        <!-- Scientific Watermark -->
        <g transform="translate(16, ${height - 20})">
          <text fill="#94A3B8" font-size="10" font-family="monospace" letter-spacing="1">
            ${isComet ? 'COMET MODEL' : 'ASTEROID SCHEMATIC'} • REGOLITH TOPOGRAPHY
          </text>
        </g>
      </svg>
    `.trim();
  }

  // 3. EXOPLANET / PLANET CATEGORY (PHYSICALLY GROUNDED MODEL)
  const classification = classifyExoplanetVisualType(params.radiusEarthRadii, params.temperatureK);
  const planetRadius = Math.min(width, height) * 0.28;

  // Band elements for Gas Giants & Sub-Neptunes
  const bandElements: string[] = [];
  if (classification.hasBands) {
    const numBands = 6;
    for (let i = 0; i < numBands; i++) {
      const by = cy - planetRadius * 0.75 + (i * (planetRadius * 1.5 / numBands));
      const bh = planetRadius * 0.18;
      const op = 0.25 + (((seed * (i + 3)) % 40) / 100);
      bandElements.push(`
        <ellipse cx="${cx}" cy="${by}" rx="${planetRadius * 0.96}" ry="${bh}" fill="${classification.secondaryColor}" opacity="${op}" clip-path="url(#planet-clip-${seed})" />
      `);
    }
  }

  // Crater elements for Rocky Worlds
  const craterElements: string[] = [];
  if (classification.hasCraters) {
    const numCraters = 4;
    for (let i = 0; i < numCraters; i++) {
      const crX = cx - planetRadius * 0.5 + (((seed * (i + 11)) % 70) * (planetRadius / 70));
      const crY = cy - planetRadius * 0.5 + (((seed * (i + 19)) % 70) * (planetRadius / 70));
      const crR = 6 + ((seed * (i + 5)) % 10);
      craterElements.push(`
        <circle cx="${crX}" cy="${crY}" r="${crR}" fill="#0F172A" opacity="0.5" stroke="#1E293B" stroke-width="1" clip-path="url(#planet-clip-${seed})" />
      `);
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <clipPath id="planet-clip-${seed}">
          <circle cx="${cx}" cy="${cy}" r="${planetRadius}" />
        </clipPath>
        <!-- 3D Spherical Light Gradient (Directional light from host star) -->
        <radialGradient id="${planetGradId}" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
          <stop offset="25%" stop-color="${classification.secondaryColor}" />
          <stop offset="70%" stop-color="${classification.primaryColor}" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <!-- Atmospheric Rim Glow (Rayleigh scattering) -->
        <radialGradient id="${atmoGlowId}" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stop-color="${classification.atmosphereGlowColor}" stop-opacity="0" />
          <stop offset="97%" stop-color="${classification.atmosphereGlowColor}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${classification.atmosphereGlowColor}" stop-opacity="0" />
        </radialGradient>
        <!-- Thermal Magma Glow for Ultra-Hot Worlds -->
        ${classification.hasThermalGlow ? `
          <radialGradient id="${thermalGlowId}" cx="75%" cy="65%" r="45%">
            <stop offset="0%" stop-color="#EF4444" stop-opacity="0.7" />
            <stop offset="60%" stop-color="#B91C1C" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
        ` : ''}
      </defs>

      <rect width="${width}" height="${height}" fill="#050B1A" />
      ${starElements.join('\n')}

      <!-- Atmospheric Scattering Outer Ring -->
      <circle cx="${cx}" cy="${cy}" r="${planetRadius * 1.05}" fill="url(#${atmoGlowId})" />

      <!-- Planet Base Sphere -->
      <circle cx="${cx}" cy="${cy}" r="${planetRadius}" fill="url(#${planetGradId})" />

      <!-- Surface Features (Bands or Craters) -->
      ${bandElements.join('\n')}
      ${craterElements.join('\n')}

      <!-- Thermal Glow (If applicable) -->
      ${classification.hasThermalGlow ? `
        <circle cx="${cx}" cy="${cy}" r="${planetRadius}" fill="url(#${thermalGlowId})" clip-path="url(#planet-clip-${seed})" />
      ` : ''}

      <!-- Shadow Terminator (Spherical Day/Night shadow) -->
      <ellipse cx="${cx + planetRadius * 0.4}" cy="${cy}" rx="${planetRadius * 0.95}" ry="${planetRadius}" fill="#000000" opacity="0.55" clip-path="url(#planet-clip-${seed})" />

      <!-- Scientific Disclaimer Badge -->
      <g transform="translate(16, ${height - 20})">
        <text fill="#94A3B8" font-size="10" font-family="monospace" letter-spacing="0.5">
          ILLUSTRATION — NOT AN ACTUAL PHOTOGRAPH • ${classification.typeLabel.toUpperCase()}
        </text>
      </g>
    </svg>
  `.trim();
}

/**
 * Converts SVG string into a valid browser Data URL
 */
export function generateAstronomicalSvgDataUrl(params: IllustrationParams, width = 640, height = 360): string {
  const svg = generateAstronomicalSvg(params, width, height);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Creates a complete AstronomicalImageRecord for any unphotographed object
 */
export function createDeterministicImageRecord(params: IllustrationParams): AstronomicalImageRecord {
  const dataUrl = generateAstronomicalSvgDataUrl(params);
  const classification = classifyExoplanetVisualType(params.radiusEarthRadii, params.temperatureK);

  const radiusLabel = params.radiusEarthRadii ? `${params.radiusEarthRadii} R⊕` : 'radius estimated';
  const tempLabel = params.temperatureK ? `${params.temperatureK} K` : 'temperature estimated';

  return {
    id: `model-${params.id || hashString(params.name)}`,
    associatedObjectId: params.id,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    hdUrl: dataUrl,
    title: `${params.name} (Calculated Astrophysical Model)`,
    caption: `Deterministic physical illustration calculated from peer-reviewed catalog data (${classification.typeLabel}, ${radiusLabel}, ${tempLabel}). Direct optical surface photographs do not yet exist for this body.`,
    sourceOrganization: 'COSMIC FRONTIER Astrophysical Modeling Engine',
    sourceUrl: 'https://exoplanetarchive.ipac.caltech.edu/',
    credit: 'COSMIC FRONTIER Deterministic Physical Model (NASA Exoplanet Archive parameters)',
    assetClassification: 'scientific-illustration',
    isVerifiedRealObservation: false,
    instrument: 'Calculated Planetary Architecture',
    processing: 'Deterministic physical vector render grounded in verified astronomical measurements'
  };
}
