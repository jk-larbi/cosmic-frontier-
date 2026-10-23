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
  const appRoutes = ['/', '/spherex', '/planet-x', '/ai-guide', '/about'];
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
