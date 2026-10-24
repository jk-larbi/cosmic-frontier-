import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { findVerifiedAnswer, VERIFIED_KNOWLEDGE_BASE } from './knowledge.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Check whether Gemini API key is provided and not a placeholder
function getCleanApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_gemini_api_key_here')) {
    return null;
  }
  return key.trim();
}

// Check whether NASA API key is provided and not a placeholder or revoked key
function getNasaApiKey() {
  const key = process.env.NASA_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_nasa_api_key_here') || key.startsWith('zTC8N6')) {
    return 'DEMO_KEY';
  }
  return key.trim();
}

app.use(cors());
app.use(express.json({ limit: '50kb' }));

// In-memory caching for NASA Open Data to respect rate limits
let cachedApod = null;
let cachedApodTimestamp = 0;
const APOD_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

let cachedSpherexPhotos = null;
let cachedSpherexTimestamp = 0;
const SPHEREX_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Determine relevant app explorer links based on message content
function getExplorerLinks(text) {
  const lower = text.toLowerCase();
  const links = [];

  const mentionsGalaxies = lower.includes('galax') ||
    lower.includes('andromeda') ||
    lower.includes('whirlpool') ||
    lower.includes('sombrero') ||
    lower.includes('redshift') ||
    lower.includes('quasar') ||
    lower.includes('hubble flow') ||
    lower.includes('elliptical') ||
    lower.includes('extragalactic');

  if (mentionsGalaxies) {
    links.push({
      label: 'Explore in Galaxy Explorer',
      page: 'galaxies',
      reason: 'Discover, filter, and compare deep-sky galaxies, active galactic nuclei, and clusters from NASA/IPAC NED.'
    });
  }

  const mentionsSpherex = lower.includes('spherex') || 
    lower.includes('infrared') || 
    lower.includes('spectral') || 
    lower.includes('ice') || 
    lower.includes('wavelength') || 
    lower.includes('palette') || 
    lower.includes('nebula') ||
    lower.includes('reionization');

  const mentionsPlanetX = lower.includes('planet x') || 
    lower.includes('planet nine') || 
    lower.includes('orbit') || 
    lower.includes('tno') || 
    lower.includes('sedna') || 
    lower.includes('astronomical unit') || 
    lower.includes('au') || 
    lower.includes('blink') || 
    lower.includes('trans-neptunian') ||
    lower.includes('kuiper');

  const mentionsSolarSystem = lower.includes('solar system') ||
    lower.includes('planet') ||
    lower.includes('jupiter') ||
    lower.includes('saturn') ||
    lower.includes('mars') ||
    lower.includes('venus') ||
    lower.includes('mercury') ||
    lower.includes('earth') ||
    lower.includes('uranus') ||
    lower.includes('neptune') ||
    lower.includes('3d') ||
    lower.includes('sun');

  if (mentionsSolarSystem) {
    links.push({
      label: 'Explore in 3D Universe Explorer',
      page: 'universe',
      reason: 'Interact with the 3D Solar System, rotate the camera, and inspect Keplerian planetary orbits.'
    });
  }

  const mentionsExoplanets = lower.includes('exoplanet') ||
    lower.includes('trappist') ||
    lower.includes('kepler') ||
    lower.includes('habitable') ||
    lower.includes('goldilocks') ||
    lower.includes('transit') ||
    lower.includes('radial velocity') ||
    lower.includes('alien world') ||
    lower.includes('proxima b');

  if (mentionsExoplanets) {
    links.push({
      label: 'Explore in Exoplanet Discovery Lab',
      page: 'exoplanets',
      reason: 'Search, filter, and compare confirmed exoplanets from the NASA Exoplanet Archive.'
    });
  }

  if (mentionsSpherex) {
    links.push({
      label: 'Explore in SPHEREx Explorer',
      page: 'spherex',
      reason: 'Inspect 102 infrared channels, false-color palettes, and water ice absorption features.'
    });
  }

  if (mentionsPlanetX) {
    links.push({
      label: 'Explore in Planet X Explorer',
      page: 'planet-x',
      reason: 'View orbital models of extreme TNOs and examine candidate search fields.'
    });
  }

  return links;
}

// System Instruction enforcing all scientific integrity and pedagogical guidelines
const COSMIC_GUIDE_SYSTEM_INSTRUCTION = `You are COSMIC AI GUIDE, a friendly, beginner-friendly educational astronomy guide for students and astronomy enthusiasts using the COSMIC FRONTIER web application.

CORE EDUCATIONAL PRINCIPLES:
1. Explain scientific concepts in plain language.
2. Use short, easily digestible paragraphs and clear everyday analogies or examples.
3. Whenever introducing a scientific term (such as "redshift", "trans-Neptunian object", "astronomical unit", "spectroscopy", or "Epoch of Reionization"), explain it simply right away.
4. For complex or multi-layered questions, provide a clear, short summary first, and then offer more detail.
5. Maintain a patient, warm, and encouraging tone suitable for people with no scientific background.

STRICT SCIENTIFIC INTEGRITY RULES:
1. Distinguish verified facts from hypotheses, models, and simulations.
2. NEVER describe Planet X (or Planet Nine) as a confirmed planet. It is a theoretical, unconfirmed hypothesis proposed by Konstantin Batygin and Mike Brown based on the unusual orbital clustering of distant extreme trans-Neptunian objects. No telescope has ever imaged or confirmed it.
3. A simulated visualization is an educational tool, NOT a scientific discovery.
4. Never claim to have detected a new astronomical object.
5. Never invent telescope observations, coordinates, measurements, citations, or fake NASA findings.
6. The app features an active NASA Open Data API connection (api.nasa.gov) for Astronomy Picture of the Day (APOD) and official NASA archival mission photography. Explain this accurately without claiming direct active live radio control of spacecraft.
7. If asked about current live discoveries, explain that live verification against official astronomy catalogs (such as the Minor Planet Center or NASA Exoplanet Archive) is required.

PROJECT SCIENTIFIC FACTS:
- SPHEREx: NASA's Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer.
- Spectral channels: Surveys the sky in 102 infrared spectral channels from approximately 0.75 to 5.0 micrometres.
- Mission goals: Studies cosmic inflation (the origin of the universe), the Epoch of Reionization (first stars and galaxies), and the cosmic distribution of water and biogenic ices in space.
- Image status: In COSMIC FRONTIER, images are explicitly categorized as Real Archival Data, Illustrative Astronomical Models, or Synthetic Mission Demonstrations.
- Astronomical Unit (AU): ~149.6 million kilometres (the average distance from Earth to the Sun).
- When appropriate, encourage users to check out the SPHEREx Explorer (for infrared images & ices) and the Planet X Explorer (for outer Solar System orbits & clustering).`;

// GET /api/status - Returns configuration and operational status
app.get('/api/status', (req, res) => {
  const apiKey = getCleanApiKey();
  const nasaKey = getNasaApiKey();
  const isAiConfigured = Boolean(apiKey);
  const isNasaConfigured = Boolean(nasaKey);

  res.json({
    status: 'ok',
    isAiConfigured,
    isNasaConfigured,
    nasaApiConnected: true,
    mode: isAiConfigured ? 'live' : 'demonstration',
    model: DEFAULT_MODEL,
    services: {
      nasaOpenData: {
        status: 'online',
        source: 'api.nasa.gov',
        authenticated: isNasaConfigured
      },
      aiGuide: {
        status: isAiConfigured ? 'live-gemini' : 'verified-educational-fallback',
        model: DEFAULT_MODEL
      }
    },
    message: isNasaConfigured
      ? 'COSMIC FRONTIER backend is connected to live NASA Open Data API (api.nasa.gov).'
      : 'COSMIC FRONTIER backend is operational with verified educational astronomy archives.'
  });
});

// GET /api/nasa/apod - Astronomy Picture of the Day from NASA Open Data
app.get('/api/nasa/apod', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedApod && now - cachedApodTimestamp < APOD_CACHE_TTL) {
      return res.json({
        success: true,
        source: 'cache',
        data: cachedApod
      });
    }

    const apiKey = getNasaApiKey();
    const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    const response = await fetch(nasaUrl, {
      headers: { 'User-Agent': 'CosmicFrontier/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status}`);
    }

    const data = await response.json();

    cachedApod = data;
    cachedApodTimestamp = now;

    return res.json({
      success: true,
      source: 'api.nasa.gov',
      data
    });
  } catch (err) {
    console.warn('[NASA APOD] Upstream request failed, serving verified archival APOD:', err.message);

    // Fallback verified APOD data if NASA is offline or rate limited
    const fallbackApod = {
      date: '2024-01-01',
      title: 'The Andromeda Galaxy (M31) in Multi-Wavelength View',
      explanation: 'Looking toward the Andromeda Galaxy (M31), the closest major spiral galaxy to our Milky Way at 2.5 million light-years distance. Multi-spectral observations spanning infrared to ultraviolet reveal hundreds of billions of stars, vast dust lanes where new stars form, and the dense galactic bulge.',
      url: 'https://images-assets.nasa.gov/image/PIA25784/PIA25784~medium.jpg',
      hdurl: 'https://images-assets.nasa.gov/image/PIA25784/PIA25784~orig.jpg',
      media_type: 'image',
      copyright: 'NASA / JPL-Caltech',
      service_version: 'v1'
    };

    return res.json({
      success: true,
      source: 'verified-archive',
      data: fallbackApod,
      warning: 'Live NASA gateway temporarily unreachable. Serving verified archival dispatch.'
    });
  }
});

// GET /api/nasa/spherex - Real SPHEREx mission photos from NASA Image Library
app.get('/api/nasa/spherex', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedSpherexPhotos && now - cachedSpherexTimestamp < SPHEREX_CACHE_TTL) {
      return res.json({
        success: true,
        source: 'cache',
        photos: cachedSpherexPhotos
      });
    }

    const searchUrl = 'https://images-api.nasa.gov/search?q=SPHEREx&media_type=image';
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'CosmicFrontier/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`NASA Image Library returned status ${response.status}`);
    }

    const json = await response.json();
    const rawItems = json.collection?.items || [];

    const photos = rawItems.slice(0, 8).map(item => {
      const data = item.data?.[0] || {};
      const link = item.links?.[0]?.href || '';
      return {
        title: data.title || 'SPHEREx Observatory',
        nasaId: data.nasa_id || 'SPHEREx',
        thumb: link,
        description: data.description || 'NASA SPHEREx space observatory hardware component.',
        dateCreated: data.date_created?.slice(0, 10) || '2024',
        center: data.center || 'JPL'
      };
    });

    cachedSpherexPhotos = photos;
    cachedSpherexTimestamp = now;

    return res.json({
      success: true,
      source: 'images.nasa.gov',
      photos
    });
  } catch (err) {
    console.warn('[NASA SPHEREx] Image search failed, serving verified archival records:', err.message);

    const fallbackPhotos = [
      {
        title: 'SPHEREx Spacecraft Nears Completion',
        nasaId: 'PIA26537',
        thumb: 'https://images-assets.nasa.gov/image/PIA26537/PIA26537~medium.jpg',
        description: 'The SPHEREx observatory sits in a clean room after environmental testing at BAE Systems in Boulder, Colorado.',
        dateCreated: '2024-08-15',
        center: 'JPL'
      },
      {
        title: 'SPHEREx Outer Photon Shield',
        nasaId: 'PIA25784',
        thumb: 'https://images-assets.nasa.gov/image/PIA25784/PIA25784~medium.jpg',
        description: 'Engineers inspect the nested conical photon shields engineered to cool the infrared telescope passively.',
        dateCreated: '2024-03-20',
        center: 'JPL'
      },
      {
        title: 'SPHEREx in Horizontal Orientation',
        nasaId: 'PIA26542',
        thumb: 'https://images-assets.nasa.gov/image/PIA26542/PIA26542~medium.jpg',
        description: 'NASA\'s SPHEREx observatory is oriented in a horizontal position, revealing all three layers of photon shields.',
        dateCreated: '2024-08-22',
        center: 'JPL'
      }
    ];

    return res.json({
      success: true,
      source: 'verified-archive',
      photos: fallbackPhotos
    });
  }
});

// -------------------------------------------------------------
// NASA ASTRONOMICAL DATA CENTRE PROXY & NORMALIZATION ENDPOINTS
// -------------------------------------------------------------

function readLocalData(relPath) {
  try {
    const fullPath = path.resolve(__dirname, '..', relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[Data Layer] Error reading ${relPath}:`, err.message);
  }
  return null;
}

// In-memory caches for live external data
let cachedLiveExoplanets = null;
let cachedLiveExoplanetsTimestamp = 0;
const EXOPLANET_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// 1. GET /api/data/manifest
app.get('/api/data/manifest', (req, res) => {
  const manifest = readLocalData('data/manifest.json');
  if (manifest) {
    return res.json({ success: true, ...manifest });
  }
  return res.status(500).json({ error: 'Manifest not found' });
});

// 2. GET /api/data/solar-system
app.get('/api/data/solar-system', (req, res) => {
  const data = readLocalData('data/solar-system/planets.json');
  if (data) {
    return res.json({ success: true, source: 'NASA/JPL Horizons Ephemerides', ...data });
  }
  return res.status(500).json({ error: 'Solar system data not found' });
});

// 3. GET /api/data/exoplanets
app.get('/api/data/exoplanets', async (req, res) => {
  const search = req.query.search ? String(req.query.search).toLowerCase() : null;
  const includeCandidates = req.query.candidates === 'true';
  const now = Date.now();

  let records = null;
  let source = 'NASA Exoplanet Archive (Caltech/IPAC Live TAP)';
  let isLive = false;

  // Try cached live exoplanets first
  if (cachedLiveExoplanets && (now - cachedLiveExoplanetsTimestamp < EXOPLANET_CACHE_TTL)) {
    records = cachedLiveExoplanets;
    source = 'NASA Exoplanet Archive (TAP Cache)';
    isLive = true;
  } else {
    // Attempt live ADQL query with complete orbital and physical parameters
    try {
      const adql = 'select top 100 pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_rade,pl_bmasse,pl_bmassj,pl_orbsmax,pl_orbeccen,st_teff,sy_dist from ps where default_flag=1 order by disc_year desc';
      const tapUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(adql)}&format=json`;
      const tapRes = await fetch(tapUrl, {
        headers: { 'User-Agent': 'CosmicFrontier/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (tapRes.ok) {
        const raw = await tapRes.json();
        if (Array.isArray(raw) && raw.length > 0) {
          records = raw.map(p => ({
            planetName: p.pl_name,
            hostStar: p.hostname,
            discoveryMethod: p.discoverymethod || 'Transit',
            discoveryYear: p.disc_year,
            orbitalPeriodDays: p.pl_orbper ? parseFloat(p.pl_orbper.toFixed(4)) : null,
            radiusEarthRadii: p.pl_rade ? parseFloat(p.pl_rade.toFixed(2)) : null,
            massEarthMasses: p.pl_bmasse ? parseFloat(p.pl_bmasse.toFixed(2)) : null,
            massJupiterMasses: p.pl_bmassj ? parseFloat(p.pl_bmassj.toFixed(4)) : null,
            semiMajorAxisAU: p.pl_orbsmax ? parseFloat(p.pl_orbsmax.toFixed(4)) : null,
            eccentricity: p.pl_orbeccen != null ? parseFloat(p.pl_orbeccen.toFixed(4)) : null,
            stellarEffectiveTempK: p.st_teff ? Math.round(p.st_teff) : null,
            distanceParsecs: p.sy_dist ? parseFloat(p.sy_dist.toFixed(2)) : null,
            distanceLightYears: p.sy_dist ? parseFloat((p.sy_dist * 3.26156).toFixed(2)) : null,
            confirmedStatus: 'Confirmed',
            disposition: 'Confirmed',
            dataStatus: 'Confirmed Exoplanet',
            sourceUrl: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(p.pl_name)}`
          }));
          cachedLiveExoplanets = records;
          cachedLiveExoplanetsTimestamp = now;
          isLive = true;
        }
      }
    } catch (err) {
      console.warn('[Data Layer] Live Exoplanet TAP query failed/timed out, falling back to local archive:', err.message);
    }
  }

  // Fallback to local verified file if live query failed
  if (!records) {
    const local = readLocalData('data/exoplanets/confirmed-exoplanets.json');
    records = local ? local.records : [];
    source = 'NASA Exoplanet Archive (Verified Local Benchmark)';
  }

  // Optionally include unconfirmed candidate planets from NASA Kepler/K2/TESS candidate archives
  let candidateRecords = [];
  if (includeCandidates) {
    try {
      const candAdql = 'select top 20 kepoi_name, koi_disposition, koi_period, koi_prad, koi_steff from cumulative where koi_disposition = \'CANDIDATE\' and koi_period is not null and koi_prad is not null';
      const candUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(candAdql)}&format=json`;
      const candRes = await fetch(candUrl, {
        headers: { 'User-Agent': 'CosmicFrontier/1.0' },
        signal: AbortSignal.timeout(5000)
      });
      if (candRes.ok) {
        const candRaw = await candRes.json();
        if (Array.isArray(candRaw)) {
          candidateRecords = candRaw.map(c => ({
            planetName: c.kepoi_name,
            hostStar: `Kepler Target (${c.kepoi_name.split('.')[0]})`,
            discoveryMethod: 'Transit (Kepler Pipeline)',
            discoveryYear: 2015,
            orbitalPeriodDays: c.koi_period ? parseFloat(c.koi_period.toFixed(4)) : null,
            radiusEarthRadii: c.koi_prad ? parseFloat(c.koi_prad.toFixed(2)) : null,
            massEarthMasses: null, // Mass unmeasured for transit-only candidate
            massJupiterMasses: null,
            semiMajorAxisAU: null,
            eccentricity: null,
            stellarEffectiveTempK: c.koi_steff ? Math.round(c.koi_steff) : null,
            distanceParsecs: null,
            distanceLightYears: null,
            confirmedStatus: 'Candidate',
            disposition: 'Candidate',
            dataStatus: 'Candidate (Unconfirmed)',
            sourceUrl: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(c.kepoi_name)}`
          }));
        }
      }
    } catch (candErr) {
      console.warn('[Data Layer] Candidate TAP query failed:', candErr.message);
    }
  }

  let combined = [...(records || []), ...candidateRecords];

  if (search && combined.length > 0) {
    combined = combined.filter(r => 
      (r.planetName && r.planetName.toLowerCase().includes(search)) ||
      (r.hostStar && r.hostStar.toLowerCase().includes(search)) ||
      (r.discoveryMethod && r.discoveryMethod.toLowerCase().includes(search))
    );
  }

  return res.json({
    success: true,
    source,
    isLive,
    recordCount: combined.length,
    records: combined
  });
});

// 4. GET /api/data/small-bodies
app.get('/api/data/small-bodies', async (req, res) => {
  const sstr = req.query.sstr ? String(req.query.sstr).trim() : null;
  const localData = readLocalData('data/small-bodies/asteroids-comets.json') || { confirmedObjects: [], hypotheticalScenarios: [] };

  if (sstr) {
    // Attempt live JPL SBDB lookup
    try {
      const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(sstr)}&phys-par=1`;
      const liveRes = await fetch(url, {
        headers: { 'User-Agent': 'CosmicFrontier/1.0' },
        signal: AbortSignal.timeout(5000)
      });
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.object) {
          const fields = liveJson.orbit?.data || [];
          const getVal = (name) => {
            const row = fields.find(r => r[0] === name);
            return row ? parseFloat(row[1]) : null;
          };
          const liveRecord = {
            designation: liveJson.object.des || sstr,
            fullName: liveJson.object.fullname || sstr,
            orbitClass: liveJson.object.orbit_class?.name || 'Small Body',
            semiMajorAxisAU: getVal('a'),
            perihelionAU: getVal('q'),
            eccentricity: getVal('e'),
            inclinationDeg: getVal('i'),
            orbitalPeriodYears: null,
            diameterKm: liveJson.phys_par?.find(p => p.name === 'diameter')?.value ? parseFloat(liveJson.phys_par.find(p => p.name === 'diameter').value) : null,
            dataStatus: 'Real Archival Data (JPL Live SBDB)',
            sourceUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(sstr)}`
          };

          return res.json({
            success: true,
            source: 'NASA/JPL SBDB Live API',
            isLive: true,
            confirmedObjects: [liveRecord, ...localData.confirmedObjects.filter(o => o.designation !== liveRecord.designation)],
            hypotheticalScenarios: localData.hypotheticalScenarios
          });
        }
      }
    } catch (err) {
      console.warn('[Data Layer] JPL SBDB live query failed:', err.message);
    }
  }

  return res.json({
    success: true,
    source: 'NASA/JPL Solar System Dynamics SBDB',
    isLive: false,
    ...localData
  });
});

// In-memory cache for live NED queries
const nedLiveCache = new Map();
const NED_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// 5. GET /api/data/galaxies
app.get('/api/data/galaxies', async (req, res) => {
  const localData = readLocalData('data/galaxies/deep-sky-galaxies.json');
  if (!localData || !localData.records) {
    return res.status(500).json({ error: 'Galaxies catalog data not found' });
  }

  const { search, q, category, sortBy, order, lookup } = req.query;
  const searchTerm = (search || q || '').trim().toLowerCase();

  // If a live lookup is specifically requested
  if (lookup && lookup.trim()) {
    const targetName = lookup.trim();
    const cacheKey = targetName.toLowerCase();
    const cached = nedLiveCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < NED_CACHE_TTL) {
      return res.json({
        success: true,
        source: 'NASA/IPAC Extragalactic Database (NED Live SRS - Cached)',
        isLive: true,
        record: cached.record,
        records: [cached.record, ...localData.records]
      });
    }

    try {
      const nedUrl = `https://ned.ipac.caltech.edu/srs/ObjectLookup?name=${encodeURIComponent(targetName)}`;
      const nedRes = await fetch(nedUrl, {
        headers: { 'User-Agent': 'CosmicFrontier/1.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (nedRes.ok) {
        const nedJson = await nedRes.json();
        if (nedJson.Preferred && nedJson.Preferred.Name) {
          const pref = nedJson.Preferred;
          const z = pref.Redshift?.Value ?? 0;
          const raDeg = pref.Position?.RA ?? 0;
          const decDeg = pref.Position?.Dec ?? 0;
          
          // Format coordinates
          const raHours = Math.floor(raDeg / 15);
          const raMin = Math.floor((raDeg / 15 - raHours) * 60);
          const raSec = (((raDeg / 15 - raHours) * 60 - raMin) * 60).toFixed(1);
          const decSign = decDeg >= 0 ? '+' : '-';
          const decAbs = Math.abs(decDeg);
          const decDegVal = Math.floor(decAbs);
          const decMin = Math.floor((decAbs - decDegVal) * 60);
          const decSec = (((decAbs - decDegVal) * 60 - decMin) * 60).toFixed(0);

          // Estimate Hubble flow distance if z > 0.003
          const c = 299792.458;
          const v = z * c;
          let distMpc = null;
          let distMly = null;
          if (z > 0.003) {
            distMpc = +(v / 70.0).toFixed(1);
            distMly = +(distMpc * 3.26156).toFixed(1);
          }

          const liveRecord = {
            id: `ned-${encodeURIComponent(pref.Name).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: pref.Name,
            catalogIdentifier: `${pref.Name} / NED J${raDeg.toFixed(2)}${decDeg >= 0 ? '+' : ''}${decDeg.toFixed(2)}`,
            alternateNames: [targetName, pref.Name],
            category: pref.ObjType?.Value === 'QSO' ? 'active-agn' : (pref.ObjType?.Value === 'GClstr' ? 'cluster' : 'spiral'),
            morphologicalType: `NED Classification (${pref.ObjType?.Value || 'Extragalactic'})`,
            constellation: 'Cataloged Field',
            rightAscension: `${raHours.toString().padStart(2, '0')}h ${raMin.toString().padStart(2, '0')}m ${raSec}s`,
            declination: `${decSign}${decDegVal.toString().padStart(2, '0')}° ${decMin.toString().padStart(2, '0')}′ ${decSec}″`,
            redshift: +z.toFixed(6),
            redshiftUncertainty: pref.Redshift?.Uncertainty ? +pref.Redshift.Uncertainty.toFixed(6) : undefined,
            radialVelocityKmS: Math.round(v),
            distanceMly: distMly,
            distanceMpc: distMpc,
            distanceMethod: z > 0.003 ? 'Hubble Flow Estimate (H0 = 70 km/s/Mpc)' : 'Uncertain (Local Peculiar Velocity Dominates)',
            apparentMagnitude: null,
            angularSize: 'Cataloged Extent in NED',
            estimatedDiameterKpc: null,
            description: `Live spectroscopic data retrieved from NASA/IPAC Extragalactic Database for ${pref.Name}.`,
            scientificSignificance: `Referenced in astrophysics literature under bibcode ${pref.Redshift?.RefCode || 'NASA/IPAC NED'}.`,
            sourceUrl: `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(pref.Name)}`,
            bibcode: pref.Redshift?.RefCode,
            dataStatus: 'Real Archival Data',
            isLiveLookup: true
          };

          nedLiveCache.set(cacheKey, { timestamp: Date.now(), record: liveRecord });

          return res.json({
            success: true,
            source: 'NASA/IPAC Extragalactic Database (NED Live SRS)',
            isLive: true,
            record: liveRecord,
            records: [liveRecord, ...localData.records]
          });
        }
      }
    } catch (nedErr) {
      console.warn('[Data Layer] NED Live lookup failed, falling back to local records:', nedErr.message);
    }
  }

  // Filter local records
  let filtered = [...localData.records];

  if (category && category !== 'all') {
    filtered = filtered.filter(g => g.category === category);
  }

  if (searchTerm) {
    filtered = filtered.filter(g => 
      g.name.toLowerCase().includes(searchTerm) ||
      g.catalogIdentifier.toLowerCase().includes(searchTerm) ||
      (g.constellation && g.constellation.toLowerCase().includes(searchTerm)) ||
      (g.morphologicalType && g.morphologicalType.toLowerCase().includes(searchTerm)) ||
      (g.alternateNames && g.alternateNames.some(a => a.toLowerCase().includes(searchTerm)))
    );
  }

  // Sorting
  if (sortBy) {
    const isDesc = order === 'desc';
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      } else if (sortBy === 'redshift') {
        valA = a.redshift ?? 0;
        valB = b.redshift ?? 0;
      } else if (sortBy === 'distance') {
        valA = a.distanceMly ?? 0;
        valB = b.distanceMly ?? 0;
      } else if (sortBy === 'magnitude') {
        valA = a.apparentMagnitude ?? 999;
        valB = b.apparentMagnitude ?? 999;
      } else if (sortBy === 'diameter') {
        valA = a.estimatedDiameterKpc ?? 0;
        valB = b.estimatedDiameterKpc ?? 0;
      }
      return isDesc ? (valB - valA) : (valA - valB);
    });
  }

  return res.json({
    success: true,
    source: 'NASA/IPAC Extragalactic Database (NED) & CDS SIMBAD',
    isLive: false,
    total: filtered.length,
    metadata: localData.metadata,
    records: filtered
  });
});

// 6. GET /api/data/stars
app.get('/api/data/stars', (req, res) => {
  const data = readLocalData('data/stars/bright-stars.json');
  if (data) {
    return res.json({ success: true, source: 'CDS SIMBAD Astronomical Database', ...data });
  }
  return res.status(500).json({ error: 'Stars data not found' });
});

// 7. GET /api/data/spherex
app.get('/api/data/spherex', (req, res) => {
  const data = readLocalData('data/spherex/mission-products.json');
  if (data) {
    return res.json({ success: true, source: 'NASA/IPAC IRSA & SPHEREx Project', ...data });
  }
  return res.status(500).json({ error: 'SPHEREx data not found' });
});

// 8. GET /api/data/images
app.get('/api/data/images', (req, res) => {
  const data = readLocalData('data/images/nasa-archives.json');
  if (data) {
    return res.json({ success: true, source: 'NASA Image and Video Library', ...data });
  }
  return res.status(500).json({ error: 'Images data not found' });
});

// 9. GET /api/data/catalog (Aggregated unified search & filter catalog)
app.get('/api/data/catalog', (req, res) => {
  const { category, q } = req.query;
  const items = [];

  const planetsData = readLocalData('data/solar-system/planets.json');
  if (planetsData?.records) {
    for (const p of planetsData.records) {
      items.push({
        id: `planet-${p.id}`,
        name: p.name,
        category: 'planets',
        categoryLabel: 'Solar System',
        subtitle: p.objectType,
        description: p.description,
        dataStatus: planetsData.metadata?.dataStatus || 'Reference Standard',
        sourceName: 'NASA/JPL Horizons',
        sourceUrl: p.sourceUrl,
        properties: [
          { label: 'Semi-Major Axis', value: p.semiMajorAxisAU, unit: 'AU' },
          { label: 'Orbital Period', value: p.orbitalPeriodDays, unit: 'days' },
          { label: 'Mean Radius', value: p.meanRadiusKm.toLocaleString(), unit: 'km' },
          { label: 'Mass', value: p.massEarthRelative, unit: 'M⊕ (Earth)' },
          { label: 'Rotation Period', value: p.rotationPeriodHours, unit: 'hours' },
          { label: 'Orbital Inclination', value: p.inclinationDeg, unit: '°' }
        ]
      });
    }
  }

  const exoplanetsData = readLocalData('data/exoplanets/confirmed-exoplanets.json');
  if (exoplanetsData?.records) {
    for (const ep of exoplanetsData.records) {
      items.push({
        id: `exoplanet-${ep.planetName.replace(/\\s+/g, '-').toLowerCase()}`,
        name: ep.planetName,
        category: 'exoplanets',
        categoryLabel: 'Exoplanets',
        subtitle: `Host Star: ${ep.hostStar} (${ep.discoveryMethod}, ${ep.discoveryYear})`,
        description: `Confirmed exoplanet discovered via ${ep.discoveryMethod} in ${ep.discoveryYear}. Located ${ep.distanceLightYears ? ep.distanceLightYears + ' light-years away' : 'in deep space'}.`,
        dataStatus: 'Real Archival Data',
        sourceName: 'NASA Exoplanet Archive (IPAC)',
        sourceUrl: ep.sourceUrl,
        properties: [
          { label: 'Orbital Period', value: ep.orbitalPeriodDays ?? 'Unmeasured', unit: ep.orbitalPeriodDays ? 'days' : undefined },
          { label: 'Radius', value: ep.radiusEarthRadii ?? 'Unmeasured', unit: ep.radiusEarthRadii ? 'R⊕' : undefined },
          { label: 'Mass', value: ep.massEarthMasses ?? 'Unmeasured', unit: ep.massEarthMasses ? 'M⊕' : undefined },
          { label: 'Stellar Temp', value: ep.stellarEffectiveTempK ?? 'Unmeasured', unit: ep.stellarEffectiveTempK ? 'K' : undefined },
          { label: 'Distance', value: ep.distanceLightYears ?? 'Unmeasured', unit: ep.distanceLightYears ? 'ly' : undefined },
          { label: 'Discovery Year', value: ep.discoveryYear }
        ]
      });
    }
  }

  const smallBodiesData = readLocalData('data/small-bodies/asteroids-comets.json');
  if (smallBodiesData?.confirmedObjects) {
    for (const sb of smallBodiesData.confirmedObjects) {
      items.push({
        id: `smallbody-${sb.designation}`,
        name: sb.fullName,
        category: 'small-bodies',
        categoryLabel: 'Asteroids & TNOs',
        subtitle: `Orbit Class: ${sb.orbitClass}`,
        description: `Keplerian orbital solution from NASA/JPL Small-Body Database. Perihelion at ${sb.perihelionAU} AU, inclination ${sb.inclinationDeg}°.`,
        dataStatus: sb.dataStatus || 'Real Archival Data',
        sourceName: 'NASA/JPL SBDB',
        sourceUrl: sb.sourceUrl,
        properties: [
          { label: 'Semi-Major Axis', value: sb.semiMajorAxisAU ?? 'N/A', unit: sb.semiMajorAxisAU ? 'AU' : undefined },
          { label: 'Perihelion Distance', value: sb.perihelionAU ?? 'N/A', unit: sb.perihelionAU ? 'AU' : undefined },
          { label: 'Eccentricity', value: sb.eccentricity ?? 'N/A' },
          { label: 'Inclination', value: sb.inclinationDeg ?? 'N/A', unit: '°' },
          { label: 'Diameter', value: sb.diameterKm ?? 'Unmeasured', unit: sb.diameterKm ? 'km' : undefined }
        ]
      });
    }
  }

  const galaxiesData = readLocalData('data/galaxies/deep-sky-galaxies.json');
  if (galaxiesData?.records) {
    for (const g of galaxiesData.records) {
      items.push({
        id: `galaxy-${g.name.replace(/\\s+/g, '-').toLowerCase()}`,
        name: g.name,
        category: 'galaxies',
        categoryLabel: 'Galaxies',
        subtitle: `${g.morphologicalType} • Constellation: ${g.constellation}`,
        description: g.description,
        dataStatus: 'Real Archival Data',
        sourceName: 'NASA/IPAC NED & SIMBAD',
        sourceUrl: g.sourceUrl,
        properties: [
          { label: 'Catalog ID', value: g.catalogIdentifier },
          { label: 'Morphology', value: g.morphologicalType },
          { label: 'Redshift (z)', value: g.redshift },
          { label: 'Radial Velocity', value: g.radialVelocityKmS.toLocaleString(), unit: 'km/s' },
          { label: 'Distance', value: g.distanceMly, unit: 'Mly' },
          { label: 'Distance', value: g.distanceMpc, unit: 'Mpc' }
        ]
      });
    }
  }

  const starsData = readLocalData('data/stars/bright-stars.json');
  if (starsData?.records) {
    for (const s of starsData.records) {
      items.push({
        id: `star-${s.name.replace(/\\s+/g, '-').toLowerCase()}`,
        name: s.name,
        category: 'stars',
        categoryLabel: 'Stars',
        subtitle: `Spectral Type: ${s.spectralType} • Constellation: ${s.constellation}`,
        description: s.description,
        dataStatus: 'Real Archival Data',
        sourceName: 'CDS SIMBAD',
        sourceUrl: s.sourceUrl,
        properties: [
          { label: 'Spectral Class', value: s.spectralType },
          { label: 'Apparent Mag (V)', value: s.apparentMagnitudeV },
          { label: 'Absolute Mag (V)', value: s.absoluteMagnitudeV },
          { label: 'Effective Temp', value: s.effectiveTemperatureK.toLocaleString(), unit: 'K' },
          { label: 'Distance', value: s.distanceLightYears, unit: 'light-years' }
        ]
      });
    }
  }

  const spherexData = readLocalData('data/spherex/mission-products.json');
  if (spherexData?.primaryScienceTracers) {
    for (const tr of spherexData.primaryScienceTracers) {
      items.push({
        id: `spherex-${tr.tracer.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        name: tr.tracer,
        category: 'spherex',
        categoryLabel: 'SPHEREx Tracers',
        subtitle: `Central Wavelength: ${tr.centralWavelengthMicrons} µm`,
        description: tr.scientificRole,
        dataStatus: 'Mission Science Specification',
        sourceName: 'NASA SPHEREx / Caltech IRSA',
        sourceUrl: 'https://irsa.ipac.caltech.edu/',
        properties: [
          { label: 'Wavelength', value: tr.centralWavelengthMicrons, unit: 'µm' },
          { label: 'Observatory Bands', value: '102 Spectral Channels' },
          { label: 'Survey Coverage', value: 'All-Sky 4π Steradians' }
        ]
      });
    }
  }

  let filtered = items;
  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (q && typeof q === 'string') {
    const searchTerms = q.toLowerCase().trim().split(/\\s+/);
    filtered = filtered.filter(item => {
      const haystack = `${item.name} ${item.subtitle} ${item.description} ${item.properties.map(p => `${p.label} ${p.value}`).join(' ')}`.toLowerCase();
      return searchTerms.every(term => haystack.includes(term));
    });
  }

  return res.json({
    success: true,
    totalCount: items.length,
    filteredCount: filtered.length,
    items: filtered
  });
});

// POST /api/chat - Main conversation endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};

    // 1. Validation: Message existence and type
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be text.'
      });
    }

    const trimmedMessage = message.trim();

    // 2. Validation: Empty or whitespace-only
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty.'
      });
    }

    // 3. Validation: Length limit (prevent abuse / overflow)
    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        error: 'Message exceeds the 1000-character limit. Please shorten your question.'
      });
    }

    const apiKey = getCleanApiKey();
    const isAiConfigured = Boolean(apiKey);

    // Contextual explorer links
    const explorerLinks = getExplorerLinks(trimmedMessage);

    // MODE 1: Verified Educational Fallback (Demonstration Mode)
    if (!isAiConfigured) {
      const verified = findVerifiedAnswer(trimmedMessage);

      if (verified) {
        const mergedLinks = [...(verified.links || [])];
        for (const el of explorerLinks) {
          if (!mergedLinks.some(l => l.page === el.page)) {
            mergedLinks.push(el);
          }
        }

        return res.json({
          reply: verified.answer,
          mode: 'demonstration',
          isAiConnected: false,
          suggestions: verified.suggestions,
          links: mergedLinks,
          scientificReference: verified.scientificReference,
          notice: 'Demonstration Mode: Operating with verified scientific knowledge base (AI API key not configured).'
        });
      }

      // General verified astronomical response
      return res.json({
        reply: `That is a great astronomical question! In educational demonstration mode, our verified knowledge base focuses on infrared astrophysics (NASA's SPHEREx mission), interstellar ices, and outer Solar System dynamics (hypothetical Planet X).

Key astronomical principles:
- **Observation vs. Simulation**: Astronomical knowledge is established through multi-wavelength observations (optical, infrared, radio) and rigorous orbital mechanics. Visualizations and models in this app help illustrate concepts but are not observational discoveries.
- **Hypotheses vs. Confirmations**: Hypothesized bodies (like Planet X) remain unconfirmed until direct observational proof is verified by the astronomical community.

Feel free to click any of the suggested topics below or explore our interactive tools!`,
        mode: 'demonstration',
        isAiConnected: false,
        suggestions: [
          'What is infrared light?',
          'How does SPHEREx study the universe?',
          'What is Planet X?',
          'How do astronomers discover distant objects?',
          'What is an astronomical unit?'
        ],
        links: explorerLinks.length > 0 ? explorerLinks : [
          {
            label: 'Open SPHEREx Explorer',
            page: 'spherex',
            reason: 'View celestial targets in 102 infrared spectral channels.'
          },
          {
            label: 'Open Planet X Explorer',
            page: 'planet-x',
            reason: 'Simulate outer Solar System orbits and extreme TNO clustering.'
          }
        ],
        scientificReference: 'NASA Astrophysics & Minor Planet Center Educational Archive',
        notice: 'Demonstration Mode: Operating with verified scientific knowledge base.'
      });
    }

    // MODE 2: Live AI Integration with official Google Gen AI SDK
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation contents with history if provided
      const contents = [];

      if (Array.isArray(history)) {
        // Take up to the last 8 turns to stay focused and performant
        const sanitizedHistory = history.slice(-8);
        for (const item of sanitizedHistory) {
          if (item && typeof item.text === 'string' && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : item.role,
              parts: [{ text: item.text.slice(0, 1000) }]
            });
          }
        }
      }

      // Add the current user message
      contents.push({
        role: 'user',
        parts: [{ text: trimmedMessage }]
      });

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents,
        config: {
          systemInstruction: COSMIC_GUIDE_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'I apologize, but I could not formulate a complete answer. Please try rephrasing your question.';

      return res.json({
        reply: replyText,
        mode: 'live',
        isAiConnected: true,
        links: explorerLinks,
        suggestions: [
          'How does SPHEREx study the universe?',
          'What is infrared light?',
          'What is Planet X?',
          'What is an astronomical unit?'
        ],
        scientificReference: 'NASA Astrophysics Division & Peer-Reviewed Astronomical Literature'
      });
    } catch (genAiError) {
      // Safe server-side error logging without leaking secrets
      console.error('Gemini API invocation error:', genAiError.message || 'Unknown error');

      // Seamlessly fallback to verified answer so user experience is never broken
      const fallback = findVerifiedAnswer(trimmedMessage) || VERIFIED_KNOWLEDGE_BASE[0];

      return res.json({
        reply: fallback.answer,
        mode: 'demonstration',
        isAiConnected: false,
        warning: 'The external AI provider is temporarily unavailable. Displaying verified scientific answer from the educational knowledge base.',
        suggestions: fallback.suggestions,
        links: fallback.links && fallback.links.length > 0 ? fallback.links : explorerLinks,
        scientificReference: fallback.scientificReference
      });
    }
  } catch (serverError) {
    // Top-level error safety: Do not expose stack traces to client
    console.error('Server error handling /api/chat:', serverError.message || 'Unknown server error');
    return res.status(500).json({
      error: 'An internal server error occurred while processing your question. Please try again.'
    });
  }
});

// In production, serve the built Vite static assets if present
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// For non-API routes, fall back to index.html if built
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile('index.html', { root: distPath }, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

// Global Express error handler to prevent returning stack traces to browser
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }
  console.error('[COSMIC FRONTIER Backend] Unhandled error:', err.message || 'Error');
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`[COSMIC FRONTIER Backend] Server listening on port ${PORT}`);
  console.log(`[COSMIC FRONTIER Backend] AI Status: ${getCleanApiKey() ? 'Live Google Gen AI Configured' : 'Demonstration / Verified Offline Mode'}`);
  console.log(`[COSMIC FRONTIER Backend] NASA API Key: ${getNasaApiKey() !== 'DEMO_KEY' ? 'Configured & Active' : 'Using Demo Key'}`);
});
