// server/horizonsService.js
// Authoritative ephemeris client for NASA/JPL Horizons Ephemeris System
// Docs: https://ssd.jpl.nasa.gov/api/horizons.api & https://ssd-api.jpl.nasa.gov/doc/horizons.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AU_KM = 149597870.7;
const LD_KM = 384400.0;
const HORIZONS_API_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

// Map common names and designations to Horizons COMMAND identifiers
const HORIZONS_TARGET_MAP = {
  // Major bodies (body centers)
  'sun': '10',
  '10': '10',
  'mercury': '199',
  '199': '199',
  'venus': '299',
  '299': '299',
  'earth': '399',
  '399': '399',
  'moon': '301',
  '301': '301',
  'mars': '499',
  '499': '499',
  'jupiter': '599',
  '599': '599',
  'saturn': '699',
  '699': '699',
  'uranus': '799',
  '799': '799',
  'neptune': '899',
  '899': '899',
  'pluto': '999',
  '999': '999',
  // Small bodies
  'ceres': '1',
  '1': '1',
  'vesta': '4',
  '4': '4',
  'eros': '433',
  '433': '433',
  'toutatis': '4179',
  '4179': '4179',
  'apophis': '99942',
  '99942': '99942',
  'bennu': '101955',
  '101955': '101955',
  'ryugu': '162173',
  '162173': '162173'
};

// In-memory cache for Horizons state vector queries
const horizonsCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Load benchmark fixtures for offline fallback
let benchmarkData = null;
try {
  const benchmarkPath = path.resolve(__dirname, '../data/horizons-benchmarks.json');
  if (fs.existsSync(benchmarkPath)) {
    benchmarkData = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
  }
} catch (err) {
  console.warn('[Horizons Service] Unable to read benchmarks file:', err.message);
}

/**
 * Normalizes input target into a Horizons command code
 */
export function resolveHorizonsCommand(target) {
  if (!target) return '399';
  const clean = String(target).toLowerCase().trim().replace(/^[(]|[)]$/g, '');
  return HORIZONS_TARGET_MAP[clean] || clean;
}

/**
 * Formats a JS Date into a Horizons-compatible time string (UTC/TDB)
 */
export function formatHorizonsDate(date) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Extracts Cartesian vectors from Horizons plain text between $$SOE and $$EOE
 */
export function parseHorizonsVectorResponse(resultText) {
  if (!resultText || typeof resultText !== 'string') {
    throw new Error('Invalid or empty Horizons result text');
  }

  const lines = resultText.split('\n');
  const tag = String.fromCharCode(36, 36);
  const soeIndex = lines.findIndex(l => l.includes(`${tag}SOE`));
  const eoeIndex = lines.findIndex(l => l.includes(`${tag}EOE`));

  if (soeIndex === -1 || eoeIndex === -1 || eoeIndex <= soeIndex + 1) {
    throw new Error('Horizons ephemeris delimiters ($$SOE / $$EOE) not found in response');
  }

  // Parse first record after $$SOE
  const dataLine = lines[soeIndex + 1].trim();
  const parts = dataLine.split(',').map(s => s.trim());

  if (parts.length < 10) {
    throw new Error(`Insufficient Horizons vector columns (found ${parts.length})`);
  }

  const jd = parseFloat(parts[0]);
  const calendarDateTdb = parts[1];
  const xKm = parseFloat(parts[2]);
  const yKm = parseFloat(parts[3]);
  const zKm = parseFloat(parts[4]);
  const vxKmS = parseFloat(parts[5]);
  const vyKmS = parseFloat(parts[6]);
  const vzKmS = parseFloat(parts[7]);
  const rangeKm = parseFloat(parts[9]);
  const rangeRateKmS = parts[10] ? parseFloat(parts[10]) : 0;

  const speedKmS = +Math.hypot(vxKmS, vyKmS, vzKmS).toFixed(3);
  const rangeAU = +(rangeKm / AU_KM).toFixed(6);

  return {
    epochJd: jd,
    calendarDateTdb,
    coordinateFrame: 'ICRF / J2000 Heliocentric Ecliptic',
    origin: 'Sun (Center 500@10)',
    timeScale: 'TDB',
    units: {
      position: 'km and AU',
      velocity: 'km/s',
      distance: 'km, AU, LD'
    },
    positionKm: {
      x: xKm,
      y: yKm,
      z: zKm
    },
    positionAU: {
      x: +(xKm / AU_KM).toFixed(6),
      y: +(yKm / AU_KM).toFixed(6),
      z: +(zKm / AU_KM).toFixed(6)
    },
    velocityKmS: {
      vx: vxKmS,
      vy: vyKmS,
      vz: vzKmS
    },
    speedKmS,
    rangeKm,
    rangeAU,
    rangeLunar: +(rangeKm / LD_KM).toFixed(3),
    rangeRateKmS
  };
}

/**
 * Fetches authoritative Cartesian state vector from NASA/JPL Horizons
 */
export async function getHorizonsVector(target, targetDate = new Date(), options = {}) {
  const command = resolveHorizonsCommand(target);
  const isDateExplicit = !!(options.date || (options.isDateExplicit && targetDate));
  const date = targetDate instanceof Date && !isNaN(targetDate.getTime()) ? targetDate : new Date(targetDate);
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const startTime = formatHorizonsDate(validDate);
  const forceLive = !!(options.forceLive || options.refresh);

  // If date is explicit, cache by exact minute; otherwise cache by current hour/target
  const cacheKey = isDateExplicit ? `${command}_${startTime}` : `${command}_${startTime.slice(0, 13)}`;

  // 1. Check in-memory cache if not forcing refresh
  if (!forceLive) {
    const cached = horizonsCache.get(cacheKey);
    const ttl = cached?.isFallback ? 60 * 1000 : CACHE_TTL_MS;
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      return {
        ...cached.data,
        provenance: {
          source: cached.isFallback ? 'NASA/JPL Horizons Verified Benchmark Archive' : 'NASA/JPL Horizons API (Cached Feed)',
          retrievalStatus: cached.isFallback ? 'archive' : 'cached',
          isLive: false,
          retrievalTimestamp: new Date(cached.timestamp).toISOString(),
          lastSuccessfulRetrieval: new Date(cached.timestamp).toISOString(),
          lastRefreshAttempt: { timestamp: new Date().toISOString(), success: !cached.isFallback },
          cacheAgeSeconds: Math.round((Date.now() - cached.timestamp) / 1000)
        }
      };
    }
  }

  // 2. Query live Horizons API
  const refreshTime = new Date().toISOString();
  let stopTime = formatHorizonsDate(new Date(validDate.getTime() + 60 * 1000));
  if (stopTime === startTime) {
    stopTime = formatHorizonsDate(new Date(validDate.getTime() + 120 * 1000));
  }

  const queryParams = new URLSearchParams({
    format: 'json',
    COMMAND: command,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: '500@10',
    START_TIME: startTime,
    STOP_TIME: stopTime,
    STEP_SIZE: '1m',
    CSV_FORMAT: 'YES',
    REF_PLANE: 'ECLIPTIC'
  });

  try {
    const response = await fetch(`${HORIZONS_API_URL}?${queryParams}`, {
      headers: {
        'User-Agent': 'CosmicFrontier-ScientificObservatory/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(12000)
    });

    if (response.ok) {
      const json = await response.json();
      if (json.result && json.result.includes(String.fromCharCode(36, 36) + 'SOE')) {
        const parsed = parseHorizonsVectorResponse(json.result);
        const resultRecord = {
          target: command,
          inputTarget: target,
          requestedDateIso: validDate.toISOString(),
          ...parsed
        };

        // Cache the successful retrieval
        horizonsCache.set(cacheKey, {
          timestamp: Date.now(),
          data: resultRecord
        });

        return {
          ...resultRecord,
          provenance: {
            source: 'NASA/JPL Horizons Ephemeris API',
            apiEndpoint: HORIZONS_API_URL,
            retrievalStatus: 'live',
            isLive: true,
            retrievalTimestamp: refreshTime,
            lastSuccessfulRetrieval: refreshTime,
            lastRefreshAttempt: { timestamp: refreshTime, success: true },
            cacheAgeSeconds: 0
          }
        };
      }
    }
  } catch (err) {
    console.warn(`[Horizons Service] Live query failed for ${command}:`, err.message);
  }

  // 3. Fallback: Check cached memory regardless of TTL
  const staleCached = horizonsCache.get(cacheKey);
  if (staleCached) {
    return {
      ...staleCached.data,
      provenance: {
        source: 'NASA/JPL Horizons API (Stale Server Cache)',
        retrievalStatus: 'cached',
        isLive: false,
        retrievalTimestamp: new Date(staleCached.timestamp).toISOString(),
        lastSuccessfulRetrieval: new Date(staleCached.timestamp).toISOString(),
        lastRefreshAttempt: { timestamp: refreshTime, success: false, error: 'Live JPL query timed out; serving cache' },
        cacheAgeSeconds: Math.round((Date.now() - staleCached.timestamp) / 1000)
      }
    };
  }

  // 4. Fallback: Check verified benchmark fixtures
  if (benchmarkData?.benchmarks) {
    const fixtureKey = Object.keys(benchmarkData.benchmarks).find(k => {
      const b = benchmarkData.benchmarks[k];
      return b.target === command;
    });

    if (fixtureKey) {
      const b = benchmarkData.benchmarks[fixtureKey];
      const fallbackRecord = {
        target: b.target,
        inputTarget: target,
        requestedDateIso: validDate.toISOString(),
        epochJd: b.epochJd,
        calendarDateTdb: b.calendarDateTdb,
        coordinateFrame: benchmarkData.metadata.coordinateFrame,
        origin: benchmarkData.metadata.origin,
        timeScale: benchmarkData.metadata.timeScale,
        units: {
          position: 'km and AU',
          velocity: 'km/s',
          distance: 'km, AU, LD'
        },
        positionKm: b.positionKm,
        positionAU: b.positionAU,
        velocityKmS: b.velocityKmS,
        speedKmS: b.speedKmS,
        rangeKm: b.rangeKm,
        rangeAU: b.rangeAU,
        rangeLunar: +(b.rangeKm / LD_KM).toFixed(3),
        rangeRateKmS: b.rangeRateKmS
      };

      // Cache fallback temporarily (60s) to prevent consecutive upstream timeout stalls
      horizonsCache.set(cacheKey, {
        timestamp: Date.now(),
        data: fallbackRecord,
        isFallback: true
      });

      return {
        ...fallbackRecord,
        provenance: {
          source: 'NASA/JPL Horizons Verified Benchmark Archive',
          retrievalStatus: 'archive',
          isLive: false,
          retrievalTimestamp: benchmarkData.metadata.generatedAt,
          lastSuccessfulRetrieval: benchmarkData.metadata.generatedAt,
          lastRefreshAttempt: { timestamp: refreshTime, success: false, error: 'Live network unavailable; using verified Horizons archive' },
          cacheAgeSeconds: Math.round((Date.now() - new Date(benchmarkData.metadata.generatedAt).getTime()) / 1000)
        }
      };
    }
  }

  // 5. If no fixture exists, return structured unavailable state
  return {
    target: command,
    inputTarget: target,
    requestedDateIso: validDate.toISOString(),
    epochJd: null,
    calendarDateTdb: 'Not available',
    coordinateFrame: 'ICRF / J2000 Heliocentric Ecliptic',
    origin: 'Sun (Center 500@10)',
    timeScale: 'TDB',
    units: {
      position: 'km and AU',
      velocity: 'km/s',
      distance: 'km, AU, LD'
    },
    positionKm: null,
    positionAU: null,
    velocityKmS: null,
    speedKmS: null,
    rangeKm: null,
    rangeAU: null,
    rangeLunar: null,
    rangeRateKmS: null,
    provenance: {
      source: 'NASA/JPL Horizons API',
      retrievalStatus: 'unavailable',
      isLive: false,
      retrievalTimestamp: null,
      lastSuccessfulRetrieval: null,
      lastRefreshAttempt: { timestamp: refreshTime, success: false, error: 'Horizons service unavailable and no benchmark fixture found' },
      cacheAgeSeconds: null
    }
  };
}
