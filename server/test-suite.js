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
  const appRoutes = ['/', '/universe', '/exoplanets', '/spherex', '/planet-x', '/data-centre', '/ai-guide', '/about'];
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
    assert(Array.isArray(galJson.records) && galJson.records.length === 6, 'Test 10.14: Galaxies catalog contains 6 deep-sky targets');

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
