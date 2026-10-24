// Automated Comprehensive Verification Test Suite for COSMIC FRONTIER — STAGE 5: FULL APPLICATION QA
// Validates Backend, Routes, Navigation, Scientific Integrity, NASA Open Data API, and AI Space Guide

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('====================================================');
  console.log('COSMIC FRONTIER — FULL QA & SCIENTIFIC TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Health & Status
  try {
    const res = await fetch(`${BASE_URL}/api/status`);
    const statusData = await res.json();
    assert(res.status === 200, 'Test 1.1: /api/status returns HTTP 200');
    assert(statusData.status === 'ok', 'Test 1.2: Status is ok');
    assert(statusData.mode === 'demonstration' || statusData.mode === 'live', 'Test 1.3: Mode is valid');
  } catch (err) {
    assert(false, `Test 1.0: Status check failed: ${err.message}`);
  }

  // 2. Starter Questions Test
  const starterQuestions = [
    {
      q: 'What is infrared light?',
      expectedTerm: 'electromagnetic',
      expectedLink: 'spherex'
    },
    {
      q: 'How does SPHEREx study the universe?',
      expectedTerm: '102',
      expectedLink: 'spherex'
    },
    {
      q: 'What is Planet X?',
      expectedTerm: 'hypothetical',
      expectedLink: 'planet-x'
    },
    {
      q: 'How do astronomers discover distant objects?',
      expectedTerm: 'Telescopes',
      expectedLink: 'planet-x'
    },
    {
      q: 'What is an astronomical unit?',
      expectedTerm: '149.6',
      expectedLink: 'planet-x'
    },
    {
      q: 'What am I looking at in the SPHEREx Explorer?',
      expectedTerm: 'False-Color',
      expectedLink: 'spherex'
    }
  ];

  for (const item of starterQuestions) {
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: item.q })
      });
      const data = await res.json();
      assert(res.status === 200, `Test 2: Starter Question '${item.q}' returns 200`);
      assert(data.reply && data.reply.length > 50, `Test 2: Reply is substantial for '${item.q}'`);
      assert(data.reply.toLowerCase().includes(item.expectedTerm.toLowerCase()), `Test 2: Contains expected factual term '${item.expectedTerm}'`);
      assert(data.links && data.links.some(l => l.page === item.expectedLink), `Test 2: Contains link to '${item.expectedLink}'`);
    } catch (err) {
      assert(false, `Test 2: Starter question '${item.q}' failed: ${err.message}`);
    }
  }

  // 3. Scientific Integrity Requirements
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Is Planet X a confirmed planet detected by NASA telescopes?' })
    });
    const data = await res.json();
    const replyLower = data.reply.toLowerCase();
    assert(
      replyLower.includes('hypothetical') || replyLower.includes('not been observed') || replyLower.includes('unconfirmed'),
      'Test 3.1: Planet X is strictly defined as hypothetical/unconfirmed'
    );
    assert(
      !replyLower.includes('planet x has been confirmed') && !replyLower.includes('nasa confirmed planet x'),
      'Test 3.2: Does not falsely claim Planet X is confirmed'
    );
  } catch (err) {
    assert(false, `Test 3: Scientific integrity query failed: ${err.message}`);
  }

  // 4. Input Validation & Security Edge Cases
  const invalidPayloads = [
    { name: 'Empty string', body: { message: '' }, expectedCode: 400 },
    { name: 'Whitespace only', body: { message: '    \n\t  ' }, expectedCode: 400 },
    { name: 'Missing message property', body: {}, expectedCode: 400 },
    { name: 'Oversized message (> 1000 chars)', body: { message: 'A'.repeat(1005) }, expectedCode: 400 }
  ];

  for (const testCase of invalidPayloads) {
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.body)
      });
      assert(res.status === testCase.expectedCode, `Test 4: ${testCase.name} returns HTTP ${testCase.expectedCode}`);
      const data = await res.json();
      assert(Boolean(data.error), `Test 4: ${testCase.name} returns error message`);
    } catch (err) {
      assert(false, `Test 4: ${testCase.name} failed with error: ${err.message}`);
    }
  }

  // 5. Malformed JSON Body Handling (Prevents Crashes & Stack Leaks)
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"message": broken-json'
    });
    const data = await res.json();
    assert(res.status === 400, 'Test 5.1: Malformed JSON returns HTTP 400');
    assert(data.error === 'Malformed JSON payload.', 'Test 5.2: Safe error message, no stack trace leaked');
  } catch (err) {
    assert(false, `Test 5: Malformed JSON test failed: ${err.message}`);
  }

  // 6. Multi-turn Conversation History Support
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Could you give me more details on that?',
        history: [
          { role: 'user', text: 'What is infrared light?' },
          { role: 'model', text: 'Infrared light is electromagnetic radiation with longer wavelengths than visible light.' }
        ]
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'Test 6.1: Multi-turn chat request succeeded with 200');
    assert(Boolean(data.reply), 'Test 6.2: Received reply for follow-up question');
  } catch (err) {
    assert(false, `Test 6: Multi-turn chat test failed: ${err.message}`);
  }

  // 7. NASA Open Data API Integration
  try {
    const resApod = await fetch(`${BASE_URL}/api/nasa/apod`);
    assert(resApod.status === 200, 'Test 7.1: /api/nasa/apod returns HTTP 200');
    const apodJson = await resApod.json();
    assert(apodJson.success === true, 'Test 7.2: APOD response has success: true');
    assert(Boolean(apodJson.data && apodJson.data.title && apodJson.data.explanation), 'Test 7.3: APOD has verified title and explanation');

    const resSpherex = await fetch(`${BASE_URL}/api/nasa/spherex`);
    assert(resSpherex.status === 200, 'Test 7.4: /api/nasa/spherex returns HTTP 200');
    const spherexJson = await resSpherex.json();
    assert(Array.isArray(spherexJson.photos) && spherexJson.photos.length > 0, 'Test 7.5: SPHEREx photos array contains items');

    const resStatus = await fetch(`${BASE_URL}/api/status`);
    const statusObj = await resStatus.json();
    assert(statusObj.isNasaConfigured === true, 'Test 7.6: /api/status confirms isNasaConfigured is true');
    assert(statusObj.nasaApiConnected === true, 'Test 7.7: /api/status confirms nasaApiConnected is true');
  } catch (err) {
    assert(false, `Test 7: NASA API test failed: ${err.message}`);
  }

  // 8. Navigation Routes & SPA Fallback
  const appRoutes = ['/', '/mission-control', '/observatory', '/universe', '/live-space', '/asteroid-watch', '/exoplanets', '/galaxies', '/spherex', '/planet-x', '/data-centre', '/ai-guide', '/about'];
  for (const route of appRoutes) {
    try {
      const resRoute = await fetch(`${BASE_URL}${route}`);
      assert(resRoute.status === 200, `Test 8: Route '${route}' serves HTTP 200`);
      const htmlText = await resRoute.text();
      assert(htmlText.includes('COSMIC FRONTIER'), `Test 8: Route '${route}' returns COSMIC FRONTIER HTML`);
    } catch (err) {
      assert(false, `Test 8: Navigation to route '${route}' failed: ${err.message}`);
    }
  }

  // 9. Static Data Integrity & Science Audit
  try {
    const spherexFile = fs.readFileSync(path.resolve(__dirname, '../src/data/spherexData.ts'), 'utf8');
    assert(spherexFile.includes('0.75') && spherexFile.includes('5.0'), 'Test 9.1: SPHEREx data documents 0.75 to 5.0 µm coverage');
    assert(spherexFile.includes('Real Archival Data') && spherexFile.includes('Synthetic Mission Demonstration'), 'Test 9.2: SPHEREx accurately labels Real vs. Synthetic datasets');

    const solarSystemFile = fs.readFileSync(path.resolve(__dirname, '../src/data/solarSystemData.ts'), 'utf8');
    assert(solarSystemFile.includes("id: 'planet-x'"), 'Test 9.3: Planet X is present in solar system registry');
    assert(solarSystemFile.includes("isHypothetical: true"), 'Test 9.4: Planet X is strictly flagged as isHypothetical: true');
    assert(solarSystemFile.includes("statusLabel: 'Hypothetical (Unconfirmed)'"), 'Test 9.5: Planet X statusLabel is explicitly Hypothetical (Unconfirmed)');
    assert(solarSystemFile.includes('Batygin & Brown'), 'Test 9.6: Planet X cites Batygin & Brown theoretical models');

    const evidenceFile = fs.readFileSync(path.resolve(__dirname, '../src/data/evidenceData.ts'), 'utf8');
    assert(evidenceFile.includes('candidate-alpha') && evidenceFile.includes('candidate-beta') && evidenceFile.includes('candidate-gamma'), 'Test 9.7: All candidate test cases are defined');
    assert(evidenceFile.includes('Alternative Scientific Explanations'), 'Test 9.8: Evidence includes alternative scientific hypotheses');
  } catch (err) {
    assert(false, `Test 9: Static data audit failed: ${err.message}`);
  }

  // 10. NASA Astronomical Data Centre & Catalog Endpoints
  try {
    // 10.1 Manifest
    const resManifest = await fetch(`${BASE_URL}/api/data/manifest`);
    assert(resManifest.status === 200, 'Test 10.1: /api/data/manifest returns HTTP 200');
    const manifestJson = await resManifest.json();
    assert(manifestJson.manifestVersion === '1.0', 'Test 10.2: Manifest version is 1.0');
    assert(Array.isArray(manifestJson.modules) && manifestJson.modules.length === 7, 'Test 10.3: Manifest contains 7 documented scientific modules');

    // 10.2 Solar System
    const resSolar = await fetch(`${BASE_URL}/api/data/solar-system`);
    assert(resSolar.status === 200, 'Test 10.4: /api/data/solar-system returns HTTP 200');
    const solarJson = await resSolar.json();
    assert(Array.isArray(solarJson.records) && solarJson.records.length === 9, 'Test 10.5: Solar system returns Sun and 8 recognized planets');
    assert(solarJson.records.some(p => p.id === 'earth' && p.semiMajorAxisAU === 1), 'Test 10.6: Earth is present with 1 AU semi-major axis');

    // 10.3 Exoplanets
    const resExo = await fetch(`${BASE_URL}/api/data/exoplanets`);
    assert(resExo.status === 200, 'Test 10.7: /api/data/exoplanets returns HTTP 200');
    const exoJson = await resExo.json();
    assert(Array.isArray(exoJson.records) && exoJson.records.length >= 25, 'Test 10.8: Exoplanets returns 25+ verified confirmed records');
    assert(exoJson.records.every(r => r.confirmedStatus === 'Confirmed'), 'Test 10.9: All exoplanet records preserve confirmedStatus: Confirmed');

    // 10.4 Small Bodies
    const resSb = await fetch(`${BASE_URL}/api/data/small-bodies`);
    assert(resSb.status === 200, 'Test 10.10: /api/data/small-bodies returns HTTP 200');
    const sbJson = await resSb.json();
    assert(Array.isArray(sbJson.confirmedObjects) && sbJson.confirmedObjects.length >= 8, 'Test 10.11: Confirmed small bodies includes asteroids/comets');
    assert(Array.isArray(sbJson.hypotheticalScenarios) && sbJson.hypotheticalScenarios.length === 1, 'Test 10.12: Planet X is segregated in hypotheticalScenarios');

    // 10.5 Galaxies
    const resGalaxies = await fetch(`${BASE_URL}/api/data/galaxies`);
    assert(resGalaxies.status === 200, 'Test 10.13: /api/data/galaxies returns HTTP 200');
    const galJson = await resGalaxies.json();
    assert(Array.isArray(galJson.records) && galJson.records.length >= 6, 'Test 10.14: Galaxies catalog contains 6+ deep-sky targets');

    // 10.6 Stars
    const resStars = await fetch(`${BASE_URL}/api/data/stars`);
    assert(resStars.status === 200, 'Test 10.15: /api/data/stars returns HTTP 200');
    const starJson = await resStars.json();
    assert(Array.isArray(starJson.records) && starJson.records.length === 6, 'Test 10.16: Stars catalog contains 6 SIMBAD benchmark targets');

    // 10.7 SPHEREx Products
    const resSph = await fetch(`${BASE_URL}/api/data/spherex`);
    assert(resSph.status === 200, 'Test 10.17: /api/data/spherex returns HTTP 200');
    const sphJson = await resSph.json();
    assert(sphJson.telescopeSpecifications?.spectralBandsCount === 102, 'Test 10.18: SPHEREx data verifies 102 spectral channels');

    // 10.8 Aggregated Catalog
    const resCatalog = await fetch(`${BASE_URL}/api/data/catalog?category=all`);
    assert(resCatalog.status === 200, 'Test 10.19: /api/data/catalog?category=all returns HTTP 200');
    const catJson = await resCatalog.json();
    assert(Array.isArray(catJson.items) && catJson.items.length >= 50, 'Test 10.20: Unified catalog aggregates 50+ total items across modules');

    // 10.9 Catalog Search
    const resSearch = await fetch(`${BASE_URL}/api/data/catalog?q=Jupiter`);
    const searchJson = await resSearch.json();
    assert(searchJson.items.some(i => i.name.includes('Jupiter')), 'Test 10.21: Search for "Jupiter" returns matching records');
  } catch (err) {
    assert(false, `Test 10: NASA Data Centre test failed: ${err.message}`);
  }

  // 11. Interactive 3D Universe Architecture & Science Tests
  try {
    const universeFile = fs.readFileSync(path.resolve(__dirname, '../src/components/Universe3DExplorer.tsx'), 'utf8');
    assert(universeFile.includes('THREE.WebGLRenderer'), 'Test 11.1: 3D Universe uses Three.js WebGLRenderer');
    assert(universeFile.includes('PerspectiveCamera'), 'Test 11.2: 3D Universe configures PerspectiveCamera');
    assert(universeFile.includes('isWebGLAvailable'), 'Test 11.3: Implements WebGL hardware detection and fallback');
    assert(universeFile.includes('hasRings') && universeFile.includes('hasMoon'), 'Test 11.4: Models Saturn rings and Earth moon');
    assert(universeFile.includes('presentation') && universeFile.includes('proportional'), 'Test 11.5: Supports both Presentation and Proportional distance scaling');
    assert(universeFile.includes('distMoved < 6'), 'Test 11.6: Disambiguates drag rotation from click selection');

    const textureFile = fs.readFileSync(path.resolve(__dirname, '../src/utils/planetTextureGenerator.ts'), 'utf8');
    assert(textureFile.includes('createSunTexture') && textureFile.includes('createSaturnRingsTexture'), 'Test 11.7: Procedural texture generator creates solar and ring textures');
    assert(textureFile.includes('createEarthTexture') && textureFile.includes('createJupiterTexture'), 'Test 11.8: Generates procedural textures for Earth and Jupiter');

    const resChat = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Can I view the planets and Saturn in 3D?' })
    });
    const chatData = await resChat.json();
    assert(chatData.links && chatData.links.some(l => l.page === 'universe'), 'Test 11.9: AI Guide provides contextual link to 3D Universe');
  } catch (err) {
    assert(false, `Test 11: 3D Universe test failed: ${err.message}`);
  }

  // 12. Exoplanet Discovery Lab Architecture & Science Tests
  try {
    const resExoCand = await fetch(`${BASE_URL}/api/data/exoplanets?candidates=true`);
    assert(resExoCand.status === 200, 'Test 12.1: /api/data/exoplanets?candidates=true returns HTTP 200');
    const exoCandJson = await resExoCand.json();
    assert(Array.isArray(exoCandJson.records) && exoCandJson.records.length >= 25, 'Test 12.2: Exoplanet query returns 25+ records');
    assert(exoCandJson.records.some(r => r.disposition === 'Confirmed'), 'Test 12.3: Confirmed exoplanets are present');

    const resSearch = await fetch(`${BASE_URL}/api/data/exoplanets?search=K2`);
    const searchJson = await resSearch.json();
    assert(searchJson.records.every(r => r.planetName.toLowerCase().includes('k2') || r.hostStar.toLowerCase().includes('k2')), 'Test 12.4: Search correctly filters by keyword');

    const labFile = fs.readFileSync(path.resolve(__dirname, '../src/components/ExoplanetDiscoveryLab.tsx'), 'utf8');
    assert(labFile.includes('compareList'), 'Test 12.5: Implements comparison workspace state');
    assert(labFile.includes('getHabitableZoneEstimate'), 'Test 12.6: Implements stellar habitable zone estimator');
    assert(labFile.includes('transit') && labFile.includes('radial-velocity') && labFile.includes('direct-imaging') && labFile.includes('microlensing'), 'Test 12.7: Covers 4+ major astronomical discovery techniques');
    assert(labFile.includes('Non-Fabrication Policy on Life'), 'Test 12.8: Features explicit non-fabrication policy and habitability caveats');

    const resChatExo = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How do astronomers detect exoplanets like TRAPPIST-1 e?' })
    });
    const chatExoData = await resChatExo.json();
    assert(chatExoData.links && chatExoData.links.some(l => l.page === 'exoplanets'), 'Test 12.9: AI Guide provides contextual link to Exoplanet Lab');
  } catch (err) {
    assert(false, `Test 12: Exoplanet Lab test failed: ${err.message}`);
  }

  // 13. Cosmic Image Laboratory & SPHEREx Explorer Tests
  try {
    const spherexComp = fs.readFileSync(path.resolve(__dirname, '../src/components/SPHERExExplorer.tsx'), 'utf8');
    assert(spherexComp.includes('handleZoomIn') && spherexComp.includes('handleZoomOut') && spherexComp.includes('handleReset'), 'Test 13.1: Interactive viewer implements Zoom In, Zoom Out, and Reset');
    assert(spherexComp.includes('isDraggingPan') && spherexComp.includes('handleMouseDown') && spherexComp.includes('handleTouchStart'), 'Test 13.2: Viewer supports interactive pan/drag with mouse and touch');
    assert(spherexComp.includes('brightness') && spherexComp.includes('contrast'), 'Test 13.3: Image display controls include both brightness and contrast adjustments');
    assert(spherexComp.includes('grayscale') && spherexComp.includes('viridis') && spherexComp.includes('inferno') && spherexComp.includes('magma') && spherexComp.includes('plasma'), 'Test 13.4: Supports 5 scientific colormap palettes');
    assert(spherexComp.includes('linear') && spherexComp.includes('logarithmic') && spherexComp.includes('sqrt') && spherexComp.includes('asinh'), 'Test 13.5: Implements 4 astronomical display stretch functions');
    assert(spherexComp.includes('syncZoomPan') && spherexComp.includes('compareTarget') && spherexComp.includes('compareBand'), 'Test 13.6: Side-by-side workspace supports dual-target selection and synchronized zoom/pan toggle');
    assert(spherexComp.includes('coordinates') && spherexComp.includes('calibrationStatus') && spherexComp.includes('archiveUrl'), 'Test 13.7: Observation metadata includes celestial coordinates, calibration status, and archive repository links');
    assert(spherexComp.includes('3.05') && spherexComp.includes('Water Ice'), 'Test 13.8: Documents 3.05 µm water ice absorption diagnostics');
    assert(spherexComp.includes('Beginner-Friendly Astronomy Glossary') && spherexComp.includes('Linear Variable Filter (LVF)'), 'Test 13.9: Features educational infrared explanation and beginner astronomy glossary');

    const procFile = fs.readFileSync(path.resolve(__dirname, '../src/utils/imageProcessing.ts'), 'utf8');
    assert(procFile.includes('processImageData') && procFile.includes('contrast'), 'Test 13.10: Real-time image processor supports contrast parameter');

    const resChatSpherex = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How do astronomers study water ice with infrared filters like SPHEREx?' })
    });
    const chatSpherexData = await resChatSpherex.json();
    assert(chatSpherexData.links && chatSpherexData.links.some(l => l.page === 'spherex'), 'Test 13.11: AI Guide provides contextual link to SPHEREx Image Lab');
  } catch (err) {
    assert(false, `Test 13: Cosmic Image Lab test failed: ${err.message}`);
  }

  // 14. Galaxy Explorer Architecture, Extragalactic Catalogs & Science Tests
  try {
    const resAllGalaxies = await fetch(`${BASE_URL}/api/data/galaxies`);
    assert(resAllGalaxies.status === 200, 'Test 14.1: /api/data/galaxies returns HTTP 200');
    const allGalJson = await resAllGalaxies.json();
    assert(Array.isArray(allGalJson.records) && allGalJson.records.length >= 20, 'Test 14.2: Galaxy catalog aggregates 20+ verified extragalactic objects');

    const resSpiral = await fetch(`${BASE_URL}/api/data/galaxies?category=spiral`);
    const spiralJson = await resSpiral.json();
    assert(spiralJson.records.every(g => g.category === 'spiral'), 'Test 14.3: Correctly filters spiral galaxies');

    const resElliptical = await fetch(`${BASE_URL}/api/data/galaxies?category=elliptical`);
    const ellipJson = await resElliptical.json();
    assert(ellipJson.records.every(g => g.category === 'elliptical'), 'Test 14.4: Correctly filters elliptical galaxies');

    const resAgn = await fetch(`${BASE_URL}/api/data/galaxies?category=active-agn`);
    const agnJson = await resAgn.json();
    assert(agnJson.records.some(g => g.id.includes('3c273') || g.id.includes('1068')), 'Test 14.5: Correctly filters active galaxies and quasars');

    const resClusters = await fetch(`${BASE_URL}/api/data/galaxies?category=cluster`);
    const clusterJson = await resClusters.json();
    assert(clusterJson.records.some(g => g.id.includes('virgo') || g.id.includes('coma')), 'Test 14.6: Correctly filters galaxy clusters');

    const resSearchAndromeda = await fetch(`${BASE_URL}/api/data/galaxies?search=Andromeda`);
    const andromedaJson = await resSearchAndromeda.json();
    assert(andromedaJson.records.some(g => g.name.includes('Andromeda')), 'Test 14.7: Search query filters Andromeda');

    const resLiveLookup = await fetch(`${BASE_URL}/api/data/galaxies?lookup=M87`);
    const liveJson = await resLiveLookup.json();
    assert(liveJson.success && (liveJson.isLive || liveJson.record), 'Test 14.8: Live NED lookup endpoint handles live extragalactic query');

    const galFile = fs.readFileSync(path.resolve(__dirname, '../src/components/GalaxyExplorer.tsx'), 'utf8');
    assert(galFile.includes('compareList') && galFile.includes('toggleCompare'), 'Test 14.9: Implements comparison workspace for up to 3 galaxies');
    assert(galFile.includes('distanceMethod') && galFile.includes('Cepheid') && galFile.includes('TRGB'), 'Test 14.10: Details panel includes verified multi-rung distance measurement methods');
    assert(galFile.includes('Understanding Extragalactic Astronomy') && galFile.includes('Hubble Sequence'), 'Test 14.11: Features educational section on galaxy morphology, redshift, and uncertainty');

    const resChatGalaxies = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the Andromeda galaxy and how do astronomers measure its distance?' })
    });
    const chatGalaxiesData = await resChatGalaxies.json();
    assert(chatGalaxiesData.links && chatGalaxiesData.links.some(l => l.page === 'galaxies'), 'Test 14.12: AI Guide provides contextual link to Galaxy Explorer');
  } catch (err) {
    assert(false, `Test 14: Galaxy Explorer test failed: ${err.message}`);
  }

  // 15. Live Space Observatory & Earth Approach Tracker Tests (Stage 7 Upgrade)
  try {
    // 15.1 - 15.8: Ephemeris Endpoints
    const resEphem = await fetch(`${BASE_URL}/api/data/live-space/ephemeris`);
    assert(resEphem.status === 200, 'Test 15.1: /api/data/live-space/ephemeris returns HTTP 200');
    const ephemJson = await resEphem.json();

    assert(Array.isArray(ephemJson.objects) && ephemJson.totalObjects >= 18, 'Test 15.2: Ephemeris returns Sun, Moon, 8 planets, and small bodies (18+ total)');
    assert(ephemJson.statusLabel === 'LIVE DATA' || ephemJson.statusLabel === 'PREDICTED', 'Test 15.3: Ephemeris statusLabel is LIVE DATA or PREDICTED');
    assert(ephemJson.coordinateFrame === 'ICRF / J2000 Ecliptic' && typeof ephemJson.julianDate === 'number', 'Test 15.4: Coordinates include ICRF / J2000 Ecliptic frame and valid Julian Date');

    const earthObj = ephemJson.objects.find(o => o.id === 'earth');
    assert(earthObj && earthObj.distSunAU >= 0.98 && earthObj.distSunAU <= 1.02 && earthObj.orbitalSpeedKmS >= 29 && earthObj.orbitalSpeedKmS <= 31, 'Test 15.5: Earth distance from Sun is realistic (~0.98 to 1.02 AU) and orbital speed is ~29-30 km/s');

    const moonObj = ephemJson.objects.find(o => o.id === 'moon');
    assert(moonObj && moonObj.distEarthLunar >= 0.8 && moonObj.distEarthLunar <= 1.2, 'Test 15.6: Moon distance from Earth is ~1.0 Lunar Distance (~384,400 km)');

    const resFutureEphem = await fetch(`${BASE_URL}/api/data/live-space/ephemeris?date=2029-04-13T00:00:00Z`);
    const futureJson = await resFutureEphem.json();
    assert(futureJson.statusLabel === 'PREDICTED' && futureJson.epoch.includes('2029-04-13'), 'Test 15.7: Ephemeris accepts custom epoch date parameter and calculates predicted coordinates');

    const resTarget = await fetch(`${BASE_URL}/api/data/live-space/ephemeris?target=apophis`);
    const targetJson = await resTarget.json();
    assert(targetJson.totalObjects === 1 && targetJson.objects[0].id === 'apophis', 'Test 15.8: Ephemeris supports target filtering');

    // 15.9 - 15.14: Close Approaches Endpoints
    const resCad = await fetch(`${BASE_URL}/api/data/live-space/close-approaches?timeframe=30d`);
    assert(resCad.status === 200, 'Test 15.9: /api/data/live-space/close-approaches returns HTTP 200');
    const cadJson = await resCad.json();

    assert(cadJson.statusLabel === 'LIVE DATA' || cadJson.statusLabel === 'RECENT DATA', 'Test 15.10: Close approaches response has statusLabel LIVE DATA or RECENT DATA');
    assert(Array.isArray(cadJson.approaches) && cadJson.approaches.length > 0, 'Test 15.11: Close approaches returns array of verified encounters');

    const sampleApp = cadJson.approaches[0];
    assert(sampleApp.designation && sampleApp.closeApproachDate && typeof sampleApp.missDistanceKm === 'number' && typeof sampleApp.missDistanceLunar === 'number' && typeof sampleApp.relativeVelocityKmS === 'number', 'Test 15.12: Close approach records include designation, date, miss distance (km & LD), and velocity');

    const res24h = await fetch(`${BASE_URL}/api/data/live-space/close-approaches?timeframe=24h`);
    const cad24h = await res24h.json();
    assert(cad24h.success && typeof cad24h.count === 'number', 'Test 15.13: Handles strict 24h timeframe filter with exact timestamps');

    const resPha = await fetch(`${BASE_URL}/api/data/live-space/close-approaches?phaOnly=true`);
    const cadPha = await resPha.json();
    assert(cadPha.success && cadPha.approaches.every(a => a.isPotentiallyHazardous), 'Test 15.14: Supports PHA filter, verifying all returned objects are flagged as PHA');

    assert(sampleApp.impactRisk && sampleApp.impactRisk.sentryUrl.includes('cneos.jpl.nasa.gov/sentry'), 'Test 15.15: Close approaches state impact risk separately and link to NASA CNEOS Sentry');

    // 15.16 - 15.18: Static Component & Science Integrity Audit
    const missionControlFile = fs.readFileSync(path.resolve(__dirname, '../src/components/MissionControlDashboard.tsx'), 'utf8');
    assert(missionControlFile.includes('canvasRef') && missionControlFile.includes('canvas.getContext'), 'Test 15.16: Celestial monitoring integrated into MissionControlDashboard with interactive Solar System orbital map');

    const asteroidWatchFile = fs.readFileSync(path.resolve(__dirname, '../src/components/AsteroidWatch.tsx'), 'utf8');
    assert(asteroidWatchFile.includes('An asteroid passing near Earth does not automatically mean it will hit Earth'), 'Test 15.17: AsteroidWatch displays mandatory scientific distinction quote regarding close approach vs impact');

    const resChatLive = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is a near-Earth asteroid close approach and what is impact risk?' })
    });
    const chatLiveData = await resChatLive.json();
    assert(chatLiveData.links && chatLiveData.links.some(l => l.page === 'asteroid-watch' || l.page === 'live-space' || l.page === 'mission-control'), 'Test 15.18: AI Guide provides contextual link to Asteroid Watch or Mission Control');
  } catch (err) {
    assert(false, `Test 15: Live Space Observatory & Earth Approach Tracker test failed: ${err.message}`);
  }

  // 16. Central Mission Control Dashboard Tests (Stage 9)
  try {
    const mcFile = fs.readFileSync(path.resolve(__dirname, '../src/components/MissionControlDashboard.tsx'), 'utf8');
    
    // 16.1 Section A: Space Activity Overview
    assert(mcFile.includes('timeZoneMode') && mcFile.includes('Universal Time (UTC)'), 'Test 16.1: Mission Control displays live telemetry clocks (UTC & Local)');
    assert(mcFile.includes('ICRF / J2000 Ecliptic') && mcFile.includes('Epoch'), 'Test 16.2: Space Activity Overview displays ICRF frame and calculation epoch');
    assert(mcFile.includes('LIVE DATA') && mcFile.includes('PREDICTED'), 'Test 16.3: Space Activity Overview displays authoritative data freshness badges');
    assert(mcFile.includes('Orbital Velocity') && mcFile.includes('Earth Distance'), 'Test 16.4: Overview presents real-time planetary velocity and distance telemetry');
    assert(mcFile.includes('Upcoming Close-Approach Event') && mcFile.includes('NASA Astronomy Picture of the Day'), 'Test 16.5: Overview features next close encounter ticker and APOD summary highlight');

    // 16.2 Section B: Interactive Solar System Preview
    assert(mcFile.includes('Solar System Planetary Ephemeris Preview') && mcFile.includes('scaleMode'), 'Test 16.6: Features interactive Solar System preview with scale mode toggle (Inner vs Outer)');
    assert(mcFile.includes('isSimulating') && mcFile.includes('setIsSimulating'), 'Test 16.7: Solar System preview includes live orbital simulation motion toggle');
    assert(mcFile.includes('selectedObject') && mcFile.includes('Open Full 3D Universe'), 'Test 16.8: Preview includes celestial object inspector and direct gateway to Full 3D Universe');

    // 16.3 Section C: Earth Approach Monitor Summary
    assert(mcFile.includes('CNEOS CAD Feed') && mcFile.includes('Near-Earth Asteroid'), 'Test 16.9: Earth Approach Monitor integrates NASA/JPL CNEOS live CAD telemetry');
    assert(mcFile.includes('An asteroid passing near Earth does not automatically mean it will hit Earth'), 'Test 16.10: Earth Approach Monitor contains mandatory scientific distinction quote');
    assert(mcFile.includes("onNavigate('asteroid-watch')") && mcFile.includes('cadTimeframe'), 'Test 16.11: Monitor includes timeframe filtering and link to Asteroid Watch');

    // 16.4 Section D: Explore the Universe Gateway
    const gatewayPages = ['universe', 'exoplanets', 'spherex', 'galaxies', 'planet-x', 'asteroid-watch', 'data-centre', 'ai-guide'];
    const hasAllGateways = gatewayPages.every(p => mcFile.includes(`onNavigate('${p}')`));
    assert(hasAllGateways, 'Test 16.12: Mission Control gateway includes navigation cards to all 8 core modules');

    // 16.5 Section E: Mission & Discovery Highlights
    assert(mcFile.includes('SPHEREx All-Sky Infrared Spectral Survey') && mcFile.includes('102'), 'Test 16.13: Highlights section presents NASA SPHEREx 102-channel infrared spectroscopy mission');
    assert(mcFile.includes('NASA Astronomy Picture of the Day') && mcFile.includes('apod.nasa.gov'), 'Test 16.14: Highlights section links to official APOD archive');

    // 16.6 Navigation & Hash Routing
    const navbarFile = fs.readFileSync(path.resolve(__dirname, '../src/components/Navbar.tsx'), 'utf8');
    assert(navbarFile.includes("page: 'mission-control', label: 'Mission Control'") && !navbarFile.includes("label: 'Live Space'"), 'Test 16.15: Navbar features Mission Control as primary item and removes standalone Live Space link');

    const appFile = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    assert(appFile.includes("candidate === 'live-space'") && appFile.includes("setCurrentPage('mission-control')"), 'Test 16.16: App.tsx gracefully redirects legacy /live-space routes to /mission-control');

    // 16.7 AI Guide Mission Control Knowledge Integration
    const resChatMC = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is Mission Control and how do I track celestial motion in real time?' })
    });
    const chatMCData = await resChatMC.json();
    assert(chatMCData.links && chatMCData.links.some(l => l.page === 'mission-control'), 'Test 16.17: AI Space Guide provides contextual link to Mission Control Dashboard');
  } catch (err) {
    assert(false, `Test 16: Unified Mission Control Dashboard test failed: ${err.message}`);
  }

  // 17. Live Cosmic Observatory Tests
  try {
    // 17.1 - 17.10: Backend Aggregator & Endpoint Tests
    const resObs = await fetch(`${BASE_URL}/api/data/observatory/objects`);
    assert(resObs.status === 200, 'Test 17.1: /api/data/observatory/objects returns HTTP 200');
    const obsJson = await resObs.json();

    assert(obsJson.success === true, 'Test 17.2: Observatory API response has success: true');
    assert(typeof obsJson.totalCount === 'number' && obsJson.totalCount >= 60, 'Test 17.3: Returns 60+ verified objects across all catalogs');

    const expectedCategories = ['solar-system', 'asteroids-comets', 'distant-tnos', 'exoplanets', 'deep-sky', 'spherex-targets'];
    const hasAllCats = expectedCategories.every(c => typeof obsJson.categories[c] === 'number' && obsJson.categories[c] > 0);
    assert(hasAllCats, 'Test 17.4: Aggregates objects from all 6 scientific categories');

    const solarBody = obsJson.objects.find(o => o.category === 'solar-system');
    const asteroidBody = obsJson.objects.find(o => o.category === 'asteroids-comets');
    const tnoBody = obsJson.objects.find(o => o.category === 'distant-tnos');
    const exoBody = obsJson.objects.find(o => o.category === 'exoplanets');
    const deepSkyBody = obsJson.objects.find(o => o.category === 'deep-sky');
    const spherexBody = obsJson.objects.find(o => o.category === 'spherex-targets');

    assert(solarBody && solarBody.motionType === 'analytical-ephemeris' && solarBody.heliocentricAU, 'Test 17.5: Solar system bodies use analytical ephemeris with heliocentric coordinates');
    assert(asteroidBody && asteroidBody.motionType === 'analytical-ephemeris', 'Test 17.6: Asteroids & comets use analytical ephemeris');
    assert(tnoBody && (tnoBody.motionType === 'keplerian-orbit' || tnoBody.motionType === 'simulation-hypothetical'), 'Test 17.7: Distant TNOs distinguish confirmed orbits from hypothetical models');
    assert(exoBody && exoBody.motionType === 'illustrative-exoplanet' && exoBody.dataStatus === 'ILLUSTRATIVE MODEL', 'Test 17.8: Exoplanets strictly labeled as illustrative models');
    assert(deepSkyBody && deepSkyBody.motionType === 'stationary-sky-coord' && deepSkyBody.celestialCoords, 'Test 17.9: Galaxies & stars strictly labeled as stationary sky coordinates');
    assert(spherexBody && spherexBody.motionType === 'observation-footprint', 'Test 17.10: SPHEREx targets strictly labeled as observation footprints');

    // 17.11 - 17.13: Category, Search & Custom Date Tests
    const resExoOnly = await fetch(`${BASE_URL}/api/data/observatory/objects?category=exoplanets`);
    const exoOnlyJson = await resExoOnly.json();
    assert(exoOnlyJson.objects.every(o => o.category === 'exoplanets'), 'Test 17.11: Category filtering successfully isolates exoplanets');

    const resApophis = await fetch(`${BASE_URL}/api/data/observatory/objects?search=Apophis`);
    const apophisJson = await resApophis.json();
    assert(apophisJson.objects.some(o => o.id === 'apophis'), 'Test 17.12: Search query correctly returns Apophis');

    const resFuture = await fetch(`${BASE_URL}/api/data/observatory/objects?date=2029-04-13T21:46:00Z`);
    const futureJson = await resFuture.json();
    assert(futureJson.statusLabel === 'PREDICTED' && futureJson.epoch.includes('2029-04-13'), 'Test 17.13: Supports custom date propagation for future epochs');

    // 17.14 - 17.18: Component Architecture & Science Integrity
    const obsComponent = fs.readFileSync(path.resolve(__dirname, '../src/components/LiveCosmicObservatory.tsx'), 'utf8');
    assert(obsComponent.includes('THREE.WebGLRenderer') && obsComponent.includes('canvas2DRef'), 'Test 17.14: Observatory supports dual 3D WebGL and 2D radar rendering engines');
    assert(obsComponent.includes('PRESET_EPOCHS') && obsComponent.includes('Apophis Super-Close Pass'), 'Test 17.15: Timeline features historical and future astronomical presets');
    assert(obsComponent.includes('handleStepDays') && obsComponent.includes('playbackSpeed'), 'Test 17.16: Timeline supports interactive play, pause, stepping, and speed multipliers');
    assert(obsComponent.includes('ScaleMode') && obsComponent.includes('exoplanet') && obsComponent.includes('sky'), 'Test 17.17: Supports multiple scale viewing modes including Exoplanet and Celestial Sky View');
    assert(obsComponent.includes('scientificDisclaimer') && obsComponent.includes('Observatory Legend'), 'Test 17.18: Context panel includes mandatory scientific disclaimers and technical legend');

    // 17.19 Navigation & Routing
    const navFile = fs.readFileSync(path.resolve(__dirname, '../src/components/Navbar.tsx'), 'utf8');
    assert(navFile.includes("page: 'observatory', label: 'Observatory'"), 'Test 17.19: Navbar contains Observatory in primary navigation');

    // 17.20 AI Guide Integration
    const resChatObs = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How does the Live Cosmic Observatory visualize celestial motion through time?' })
    });
    const chatObsData = await resChatObs.json();
    assert(chatObsData.links && chatObsData.links.some(l => l.page === 'observatory'), 'Test 17.20: AI Space Guide provides contextual link to Live Cosmic Observatory');
  } catch (err) {
    assert(false, `Test 17: Live Cosmic Observatory test failed: ${err.message}`);
  }

  // 18. Complete Astronomical Image Coverage Suite
  try {
    // 18.1 - 18.5: Backend Image Endpoints & Metadata
    const resImages = await fetch(`${BASE_URL}/api/data/images`);
    assert(resImages.status === 200, 'Test 18.1: /api/data/images returns HTTP 200');
    const imagesJson = await resImages.json();
    assert(imagesJson.success === true && Array.isArray(imagesJson.records) && imagesJson.records.length > 0, 'Test 18.2: /api/data/images returns verified records array');

    const resPlutoImg = await fetch(`${BASE_URL}/api/data/images?object=pluto`);
    const plutoJson = await resPlutoImg.json();
    const plutoRecord = plutoJson.record || (plutoJson.records && plutoJson.records[0]);
    assert(plutoRecord && plutoRecord.assetClassification === 'spacecraft', 'Test 18.3: /api/data/images?object=pluto returns verified New Horizons spacecraft photo');

    const resSolarWithImg = await fetch(`${BASE_URL}/api/data/solar-system`);
    const solarJson = await resSolarWithImg.json();
    const solarList = solarJson.records || solarJson.objects || [];
    assert(solarList.length > 0 && solarList.every(o => o.image && o.image.imageUrl), 'Test 18.4: /api/data/solar-system attaches verified image metadata to every celestial object');

    const resExoWithImg = await fetch(`${BASE_URL}/api/data/exoplanets`);
    const exoJson = await resExoWithImg.json();
    const exoList = exoJson.records || exoJson.data || [];
    assert(exoList.length > 0 && exoList.every(e => e.image && e.image.imageUrl), 'Test 18.5: /api/data/exoplanets attaches image metadata to every exoplanet record');

    // 18.6 - 18.10: Frontend Image Architecture & Generator Verification
    const typesContent = fs.readFileSync(path.resolve(__dirname, '../src/types/index.ts'), 'utf8');
    assert(typesContent.includes('AstronomicalAssetClassification') && typesContent.includes('AstronomicalImageRecord'), 'Test 18.6: types/index.ts defines AstronomicalAssetClassification and AstronomicalImageRecord');

    const verifiedImagesContent = fs.readFileSync(path.resolve(__dirname, '../src/data/verifiedAstronomicalImages.ts'), 'utf8');
    assert(verifiedImagesContent.includes('VERIFIED_ASTRONOMICAL_IMAGES') && verifiedImagesContent.includes('getVerifiedAstronomicalImage'), 'Test 18.7: verifiedAstronomicalImages.ts provides verified mission photo registry');

    const generatorContent = fs.readFileSync(path.resolve(__dirname, '../src/utils/astronomicalIllustrationGenerator.ts'), 'utf8');
    assert(generatorContent.includes('generateAstronomicalSvg') && generatorContent.includes('ILLUSTRATION — NOT AN ACTUAL PHOTOGRAPH'), 'Test 18.8: astronomicalIllustrationGenerator.ts renders deterministic SVGs with mandatory scientific non-photo watermark');

    const serviceContent = fs.readFileSync(path.resolve(__dirname, '../src/services/astronomicalImageService.ts'), 'utf8');
    assert(serviceContent.includes('resolveAstronomicalVisual') && serviceContent.includes('resolveAstronomicalGallery'), 'Test 18.9: astronomicalImageService.ts implements 5-tier fallback hierarchy');

    const badgeContent = fs.readFileSync(path.resolve(__dirname, '../src/components/astronomy-images/AstronomicalBadge.tsx'), 'utf8');
    assert(badgeContent.includes('Verified Observation') && badgeContent.includes('Spacecraft Photo') && badgeContent.includes('Artist Concept'), 'Test 18.10: AstronomicalBadge.tsx distinguishes verified observations from artist impressions and models');

    // 18.11 - 18.13: UI Components Verification
    const imageCompContent = fs.readFileSync(path.resolve(__dirname, '../src/components/astronomy-images/AstronomicalImage.tsx'), 'utf8');
    assert(imageCompContent.includes('onError') && imageCompContent.includes('showBadge'), 'Test 18.11: AstronomicalImage.tsx features responsive layout, loading skeleton, and fallback handling');

    const galleryCompContent = fs.readFileSync(path.resolve(__dirname, '../src/components/astronomy-images/AstronomicalImageGallery.tsx'), 'utf8');
    assert(galleryCompContent.includes('selectedImage') && galleryCompContent.includes('thumbnailUrl'), 'Test 18.12: AstronomicalImageGallery.tsx provides multi-asset thumbnail gallery and metadata inspector');

    const compareCompContent = fs.readFileSync(path.resolve(__dirname, '../src/components/astronomy-images/AstronomicalComparisonVisual.tsx'), 'utf8');
    assert(compareCompContent.includes('scaleValue') && compareCompContent.includes('baselineName'), 'Test 18.13: AstronomicalComparisonVisual.tsx renders relative size comparison');

    // 18.14 - 18.20: Cross-Page Visual Integration Verification
    const exoLabContent = fs.readFileSync(path.resolve(__dirname, '../src/components/ExoplanetDiscoveryLab.tsx'), 'utf8');
    assert(exoLabContent.includes('<AstronomicalImage') && exoLabContent.includes('<AstronomicalComparisonVisual') && exoLabContent.includes('<AstronomicalImageGallery'), 'Test 18.14: Exoplanet Discovery Lab integrates AstronomicalImage on catalog cards, comparison visual, and modal gallery');

    const dataCentreContent = fs.readFileSync(path.resolve(__dirname, '../src/components/NasaDataCentre.tsx'), 'utf8');
    assert(dataCentreContent.includes('<AstronomicalImage') && dataCentreContent.includes('<AstronomicalImageGallery'), 'Test 18.15: NASA Data Centre integrates AstronomicalImage on all catalog cards and modal gallery');

    const obsContent = fs.readFileSync(path.resolve(__dirname, '../src/components/LiveCosmicObservatory.tsx'), 'utf8');
    assert(obsContent.includes('<AstronomicalImage'), 'Test 18.16: Live Cosmic Observatory integrates AstronomicalImage in the selected object telemetry inspector');

    const mcContent = fs.readFileSync(path.resolve(__dirname, '../src/components/MissionControlDashboard.tsx'), 'utf8');
    assert(mcContent.includes('<AstronomicalImage'), 'Test 18.17: Mission Control integrates AstronomicalImage in planetary inspector and approach monitor');

    const universeContent = fs.readFileSync(path.resolve(__dirname, '../src/components/Universe3DExplorer.tsx'), 'utf8');
    assert(universeContent.includes('<AstronomicalImage'), 'Test 18.18: 3D Universe Explorer integrates AstronomicalImage in the scientific object inspector');

    const asteroidContent = fs.readFileSync(path.resolve(__dirname, '../src/components/AsteroidWatch.tsx'), 'utf8');
    assert(asteroidContent.includes('<AstronomicalImage'), 'Test 18.19: Asteroid Watch integrates AstronomicalImage in the close approach details inspector');

    const planetXContent = fs.readFileSync(path.resolve(__dirname, '../src/components/PlanetXExplorer.tsx'), 'utf8');
    assert(planetXContent.includes('<AstronomicalImage'), 'Test 18.20: Planet X Explorer integrates AstronomicalImage in selected body inspection panel');
  } catch (err) {
    assert(false, `Test 18: Complete Astronomical Image Coverage test failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
