// Automated Comprehensive Verification Test Suite for COSMIC FRONTIER — STAGE 4: AI SPACE GUIDE

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('====================================================');
  console.log('COSMIC AI GUIDE — VERIFICATION TEST SUITE');
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
    assert(false, `Test 3: Scientific integrity test failed: ${err.message}`);
  }

  // 4. Input Validation & Edge Cases
  const validationTests = [
    {
      name: 'Empty string',
      body: { message: '' },
      expectedStatus: 400
    },
    {
      name: 'Whitespace only',
      body: { message: '    \t   ' },
      expectedStatus: 400
    },
    {
      name: 'Missing message property',
      body: {},
      expectedStatus: 400
    },
    {
      name: 'Oversized message (> 1000 chars)',
      body: { message: 'A'.repeat(1005) },
      expectedStatus: 400
    }
  ];

  for (const vt of validationTests) {
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vt.body)
      });
      const data = await res.json();
      assert(res.status === vt.expectedStatus, `Test 4: ${vt.name} returns HTTP ${vt.expectedStatus}`);
      assert(Boolean(data.error), `Test 4: ${vt.name} returns error message`);
    } catch (err) {
      assert(false, `Test 4: Validation test ${vt.name} failed: ${err.message}`);
    }
  }

  // 5. Malformed JSON Body Protection (Security test)
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
    assert(res.status === 200, 'Test 6: Multi-turn chat request succeeded with 200');
    assert(Boolean(data.reply), 'Test 6: Received reply for follow-up question');
  } catch (err) {
    assert(false, `Test 6: Multi-turn chat test failed: ${err.message}`);
  }

  // 7. Client Static Serving & SPA fallback
  try {
    const resRoot = await fetch(`${BASE_URL}/`);
    assert(resRoot.status === 200, 'Test 7.1: Root / returns HTTP 200');

    const resAiGuide = await fetch(`${BASE_URL}/ai-guide`);
    assert(resAiGuide.status === 200, 'Test 7.2: /ai-guide route serves index.html with HTTP 200');

    const htmlText = await resAiGuide.text();
    assert(htmlText.includes('COSMIC FRONTIER'), 'Test 7.3: HTML contains COSMIC FRONTIER title');
  } catch (err) {
    assert(false, `Test 7: Static serving test failed: ${err.message}`);
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

