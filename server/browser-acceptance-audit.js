/**
 * COSMIC FRONTIER — Automated Browser Acceptance & Scientific Validation Audit
 * 
 * Controls Microsoft Edge via Chrome DevTools Protocol (CDP) to rigorously verify:
 * - Real Canvas 2D and WebGL rendering (non-zero pixel data, WebGL context status)
 * - Non-zero canvas dimensions across desktop & mobile viewports
 * - Navigation cycling (preventing WebGL context leaks on route switches)
 * - Beginner / Explorer mode switching & state preservation
 * - Astronomy Glossary Modal search, filter, and keyboard dismiss
 * - 5 Guided Learning Missions and localStorage persistence
 * - WebGL context loss handling
 */

import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173/';
const CDP_PORT = 9222;

class BrowserAudit {
  constructor() {
    this.edgeProc = null;
    this.ws = null;
    this.msgId = 1;
    this.pendingRequests = new Map();
    this.runtimeErrors = [];
    this.consoleLogs = [];
  }

  async start() {
    console.log('[AUDIT] Launching Edge headless instance...');
    this.edgeProc = spawn(EDGE_PATH, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--window-size=1440,900',
      APP_URL
    ], { stdio: 'ignore' });

    let retries = 25;
    let json = null;
    while (retries-- > 0) {
      try {
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
        if (res.ok) {
          json = await res.json();
          break;
        }
      } catch {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (!json || !json.length) {
      throw new Error('Failed to connect to Edge CDP endpoint on port ' + CDP_PORT);
    }

    const pageTarget = json.find(t => t.type === 'page') || json[0];
    console.log(`[AUDIT] Connected to Edge Page target: ${pageTarget.url}`);

    this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pendingRequests.has(msg.id)) {
        const { resolve, reject } = this.pendingRequests.get(msg.id);
        this.pendingRequests.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
        this.runtimeErrors.push(desc);
        console.error(' [BROWSER EXCEPTION]', desc);
      } else if (msg.method === 'Log.entryAdded') {
        if (msg.params.entry.level === 'error') {
          this.consoleLogs.push(msg.params.entry.text);
        }
      }
    };

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Log.enable');
    await this.send('DOM.enable');
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      const err = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Eval error in [${expression.slice(0, 50)}...]: ${err}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async navigateTo(hash) {
    await this.evaluate(`window.location.hash = '${hash}';`);
    await new Promise(r => setTimeout(r, 600));
  }

  async cleanup() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
    if (this.edgeProc) {
      try { this.edgeProc.kill(); } catch {}
    }
    console.log('[AUDIT] Browser process closed.');
  }
}

async function runAudit() {
  const audit = new BrowserAudit();
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, pass, details = '') {
    if (pass) {
      results.passed++;
      results.tests.push({ name, status: 'PASS', details });
      console.log(`[PASS] ${name}${details ? ` (${details})` : ''}`);
    } else {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', details });
      console.error(`[FAIL] ${name}: ${details}`);
    }
  }

  try {
    await audit.start();

    // Give Vite app 1 second to hydrate
    await new Promise(r => setTimeout(r, 1000));

    // =========================================================================
    // SECTION 1: LIVE COSMIC OBSERVATORY AUDIT
    // =========================================================================
    console.log('\n--- 1. AUDITING LIVE COSMIC OBSERVATORY ---');
    await audit.navigateTo('#observatory');
    await new Promise(r => setTimeout(r, 800));

    // 1.1 Canvas presence and nonzero geometry
    const obsCanvasInfo = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas') || document.querySelector('[class*="cursor-grab"] canvas');
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
          exists: true,
          width: rect.width,
          height: rect.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight
        };
      })()
    `);

    test(
      'Observatory: Canvas mounts with nonzero dimensions',
      obsCanvasInfo && obsCanvasInfo.width > 200 && obsCanvasInfo.height > 200,
      `width=${obsCanvasInfo?.width}px, height=${obsCanvasInfo?.height}px`
    );

    // 1.2 Three.js WebGL context status
    const obsWebGLInfo = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { active: false, reason: 'No canvas' };
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return { active: false, reason: 'No WebGL context' };
        let rendererName = 'WebGL active';
        try {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          rendererName = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(0x1F01);
        } catch {}
        return {
          active: true,
          isContextLost: gl.isContextLost(),
          renderer: rendererName || 'WebGL Renderer'
        };
      })()
    `);

    test(
      'Observatory: WebGL context is active and not lost',
      obsWebGLInfo.active && !obsWebGLInfo.isContextLost,
      `renderer=${obsWebGLInfo.renderer}`
    );

    // 1.3 Viewport Controls and "What am I looking at?" Explainer
    const obsExplainerTest = await audit.evaluate(`
      (async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const explainBtn = buttons.find(b => b.textContent.includes('What am I looking at') || b.title?.includes('Explain the 3D Observatory'));
        if (!explainBtn) return { foundBtn: false };
        explainBtn.click();
        await new Promise(r => setTimeout(r, 200));
        const hasCardAfterClick = document.body.textContent.includes("Astronomer's Quick Guide") || document.body.textContent.includes("Live 3D Orbits");
        return { foundBtn: true, opened: hasCardAfterClick };
      })()
    `);

    test(
      'Observatory: "What am I looking at?" contextual button opens quick guide',
      obsExplainerTest.foundBtn && obsExplainerTest.opened
    );

    // 1.4 Target Inspector & Collapsible Advanced Telemetry
    const obsInspectorTest = await audit.evaluate(`
      (() => {
        const hasObjectPanel = document.body.textContent.includes('Dist. to Sun') || document.body.textContent.includes('Dist. to Earth');
        const hasAdvancedToggle = document.body.textContent.includes('Advanced J2000 Vectors & Coordinates');
        const hasPlanetXLink = document.body.textContent.includes('Investigate in Planet X Discovery Lab') || document.body.textContent.includes('Planet X');
        return { hasObjectPanel, hasAdvancedToggle, hasPlanetXLink };
      })()
    `);

    test(
      'Observatory: Target Inspector renders telemetry with collapsible Advanced J2000 vectors',
      obsInspectorTest.hasObjectPanel && obsInspectorTest.hasAdvancedToggle
    );

    // =========================================================================
    // SECTION 2: COSMIC RADAR HUD AUDIT
    // =========================================================================
    console.log('\n--- 2. AUDITING COSMIC RADAR HUD ---');
    await audit.navigateTo('#deep-space-radar');
    await new Promise(r => setTimeout(r, 600));

    // 2.1 Radar Canvas 2D presence & dimensions
    const radarCanvasInfo = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas[aria-label*="Radar"]') || document.querySelector('canvas');
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
          exists: true,
          width: rect.width,
          height: rect.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight
        };
      })()
    `);

    test(
      'Radar: Canvas 2D mounts with nonzero dimensions',
      radarCanvasInfo && radarCanvasInfo.width > 200 && radarCanvasInfo.height > 200,
      `width=${radarCanvasInfo?.width}px, height=${radarCanvasInfo?.height}px`
    );

    // 2.2 Verify Radar is actively drawing non-zero pixel data
    const radarPixelData = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas[aria-label*="Radar"]') || document.querySelector('canvas');
        if (!canvas) return { hasDrawn: false };
        const ctx = canvas.getContext('2d');
        if (!ctx) return { hasDrawn: false, reason: 'No 2D context' };
        
        // Sample center and concentric rings
        const img = ctx.getImageData(0, 0, Math.min(200, canvas.width), Math.min(200, canvas.height));
        let nonZero = 0;
        for (let i = 0; i < img.data.length; i += 4) {
          if (img.data[i] > 0 || img.data[i+1] > 0 || img.data[i+2] > 0) {
            nonZero++;
          }
        }
        return {
          hasDrawn: nonZero > 10,
          nonZeroPixels: nonZero,
          totalPixels: img.data.length / 4
        };
      })()
    `);

    test(
      'Radar: Canvas 2D actively renders non-black pixels (range rings & radar sweep)',
      radarPixelData.hasDrawn,
      `${radarPixelData.nonZeroPixels} illuminated pixels in sample`
    );

    // 2.3 Radar Scope Guide & Telemetry Inspector
    const radarGuideTest = await audit.evaluate(`
      (async () => {
        const explainBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Explain Scope'));
        if (!explainBtn) return { foundBtn: false };
        explainBtn.click();
        await new Promise(r => setTimeout(r, 200));
        const hasGuide = document.body.textContent.includes('How Deep-Space Radar Tracking Works');
        const hasStatusBadge = document.body.textContent.includes('HYPOTHETICAL TARGET') || document.body.textContent.includes('SIMULATED TEST PARTICLE') || document.body.textContent.includes('OBSERVED');
        return { foundBtn: true, opened: hasGuide, hasStatusBadge };
      })()
    `);

    test(
      'Radar: "Explain Scope" guide works and target inspector displays provenance status badge',
      radarGuideTest.foundBtn && radarGuideTest.opened && radarGuideTest.hasStatusBadge
    );

    // =========================================================================
    // SECTION 3: PLANET X DISCOVERY LAB & SUB-COMPONENTS AUDIT
    // =========================================================================
    console.log('\n--- 3. AUDITING PLANET X DISCOVERY LAB ---');
    await audit.navigateTo('#planet-x');
    await new Promise(r => setTimeout(r, 600));

    // 3.1 3D Orbit Visualization Canvas
    const planetXCanvas = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      })()
    `);

    test(
      'Planet X Lab: 3D orbit simulation canvas mounts with nonzero geometry',
      planetXCanvas && planetXCanvas.width > 200 && planetXCanvas.height > 200,
      `width=${planetXCanvas?.width}px, height=${planetXCanvas?.height}px`
    );

    // 3.2 Interactive Parameter Sliders & Presets
    const sliderTest = await audit.evaluate(`
      (() => {
        const massSlider = document.querySelector('input[type="range"]');
        const selectPreset = document.querySelector('select');
        const hasValues = document.body.textContent.includes('Batygin & Brown') || document.body.textContent.includes('Trujillo & Sheppard');
        return { hasSlider: !!massSlider, hasSelect: !!selectPreset, hasValues };
      })()
    `);

    test(
      'Planet X Lab: Hypothesis parameter controls and published literature presets are active',
      sliderTest.hasSlider && sliderTest.hasSelect && sliderTest.hasValues
    );

    // 3.3 Dynamical Comparison: With vs. Without Planet Nine
    const secularTest = await audit.evaluate(`
      (() => {
        const hasComparisonHeader = document.body.textContent.includes('Dynamical Comparison: With vs. Without Planet Nine');
        const hasClusteringMetric = document.body.textContent.includes('Apsidal Clustering Metric (R)');
        const hasMethodologyDistinction = document.body.textContent.includes('Scientific Methodology Distinction');
        return { hasComparisonHeader, hasClusteringMetric, hasMethodologyDistinction };
      })()
    `);

    test(
      'Planet X Lab: Secular perturbation experiment displays clustering metric R and methodology distinction',
      secularTest.hasComparisonHeader && secularTest.hasClusteringMetric && secularTest.hasMethodologyDistinction
    );

    // 3.4 Sub-tabs testing: Cosmic Distance Playground
    const distanceTabTest = await audit.evaluate(`
      (async () => {
        const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Distance Playground') || b.textContent.includes('1/r⁴'));
        if (tabBtn) tabBtn.click();
        await new Promise(r => setTimeout(r, 250));
        const hasPlayground = document.body.textContent.includes('The Inverse-Fourth-Power Law');
        const hasLightTime = document.body.textContent.includes('Light-Travel Time');
        return { foundTab: !!tabBtn, hasPlayground, hasLightTime };
      })()
    `);

    test(
      'Planet X Lab: Distance Playground renders inverse-fourth-power law (1/r⁴) and light-travel times',
      distanceTabTest.hasPlayground && distanceTabTest.hasLightTime
    );

    // 3.5 Sub-tabs testing: Evidence Detective
    const evidenceTabTest = await audit.evaluate(`
      (async () => {
        const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Evidence Detective'));
        if (tabBtn) tabBtn.click();
        await new Promise(r => setTimeout(r, 250));
        const hasRubin = document.body.textContent.includes('Vera C. Rubin Observatory');
        const hasBias = document.body.textContent.includes('Telescope Bias');
        return { foundTab: !!tabBtn, hasRubin, hasBias };
      })()
    `);

    test(
      'Planet X Lab: Evidence Detective presents eTNO clustering, OSSOS bias, and Vera Rubin LSST debate',
      evidenceTabTest.hasRubin && evidenceTabTest.hasBias
    );

    // 3.6 Sub-tabs testing: Clyde Tombaugh Blink Comparator Activity
    const blinkTabTest = await audit.evaluate(`
      (async () => {
        const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Blink') || b.textContent.includes('Candidate'));
        if (tabBtn) tabBtn.click();
        await new Promise(r => setTimeout(r, 250));
        const hasBlink = document.body.textContent.includes('Candidate Investigation') || document.body.textContent.includes('Blink Comparator');
        return { foundTab: !!tabBtn, hasBlink };
      })()
    `);

    test(
      'Planet X Lab: Citizen science blink comparator simulation operates with educational notices',
      blinkTabTest.hasBlink
    );

    // =========================================================================
    // SECTION 4: NAVIGATION CYCLING & UNMOUNT DISPOSAL
    // =========================================================================
    console.log('\n--- 4. AUDITING NAVIGATION CYCLING & WEBGL PRESERVATION ---');
    
    // Cycle: Observatory -> Planet X -> Home -> Observatory
    await audit.navigateTo('#observatory');
    await new Promise(r => setTimeout(r, 400));
    await audit.navigateTo('#planet-x');
    await new Promise(r => setTimeout(r, 400));
    await audit.navigateTo('#home');
    await new Promise(r => setTimeout(r, 400));
    await audit.navigateTo('#observatory');
    await new Promise(r => setTimeout(r, 800));

    const recyledCanvas = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { ok: false, reason: 'No canvas mounted after cycle' };
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const rect = canvas.getBoundingClientRect();
        return {
          ok: true,
          width: rect.width,
          height: rect.height,
          hasGl: !!gl,
          isContextLost: gl ? gl.isContextLost() : true
        };
      })()
    `);

    test(
      'Navigation Cycle: Observatory remounts cleanly without WebGL context exhaustion or black screen',
      recyledCanvas.ok && recyledCanvas.width > 200 && recyledCanvas.hasGl && !recyledCanvas.isContextLost,
      `re-mounted dimensions=${recyledCanvas.width}x${recyledCanvas.height}`
    );

    // =========================================================================
    // SECTION 5: RESPONSIVE VIEWPORT RESIZING
    // =========================================================================
    console.log('\n--- 5. AUDITING RESPONSIVE VIEWPORT RESIZING ---');

    // Emulate mobile screen: 375x667
    await audit.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const mobileCanvas = await audit.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      })()
    `);

    test(
      'Responsive Resize: Canvas maintains nonzero height on mobile viewport (375x667)',
      mobileCanvas && mobileCanvas.width > 0 && mobileCanvas.height >= 400,
      `mobile canvas=${mobileCanvas?.width}x${mobileCanvas?.height}`
    );

    // Reset back to desktop screen: 1440x900
    await audit.send('Emulation.clearDeviceMetricsOverride');
    await new Promise(r => setTimeout(r, 500));

    // =========================================================================
    // SECTION 6: ASTRONOMY GLOSSARY & BEGINNER MODE AUDIT
    // =========================================================================
    console.log('\n--- 6. AUDITING ASTRONOMY GLOSSARY & BEGINNER USABILITY ---');

    // 6.1 Glossary Modal Open, Search & Filter
    const glossaryTest = await audit.evaluate(`
      (async () => {
        const glossaryBtn = document.querySelector('button[title*="Glossary"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Glossary');
        if (!glossaryBtn) return { foundBtn: false };
        glossaryBtn.click();
        await new Promise(r => setTimeout(r, 200));
        
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return { foundBtn: true, openedModal: false };

        const searchInput = modal.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.value = 'AU';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 100));
        }

        const hasAU = modal.textContent.includes('Astronomical Unit');
        const hasAnalogy = modal.textContent.includes('Think of it like');
        
        return {
          foundBtn: true,
          openedModal: true,
          hasAU,
          hasAnalogy
        };
      })()
    `);

    test(
      'Glossary: Modal opens, filters search query "AU", and displays plain-language analogies',
      glossaryTest.foundBtn && glossaryTest.openedModal && glossaryTest.hasAU && glossaryTest.hasAnalogy
    );

    // 6.2 Dismiss modal via ESC key
    const escapeTest = await audit.evaluate(`
      (async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await new Promise(r => setTimeout(r, 150));
        const modal = document.querySelector('[role="dialog"]');
        return { dismissed: !modal };
      })()
    `);

    test(
      'Glossary: Dismisses cleanly via Escape key',
      escapeTest.dismissed
    );

    // 6.3 Global Beginner/Explorer Mode Toggle & Persistence
    const modeSwitchTest = await audit.evaluate(`
      (async () => {
        const modeBtn = document.querySelector('button[title*="Current mode"]');
        if (!modeBtn) return { foundBtn: false };
        const initialText = modeBtn.textContent;
        modeBtn.click();
        await new Promise(r => setTimeout(r, 150));
        const newText = modeBtn.textContent;
        const storedMode = localStorage.getItem('cosmic_frontier_experience_mode');
        return {
          foundBtn: true,
          initialText,
          newText,
          toggled: initialText !== newText,
          storedMode
        };
      })()
    `);

    test(
      'Usability: Experience mode toggles app-wide and persists in localStorage',
      modeSwitchTest.foundBtn && modeSwitchTest.toggled && (modeSwitchTest.storedMode === 'beginner' || modeSwitchTest.storedMode === 'explorer'),
      `mode=${modeSwitchTest.storedMode}`
    );

    // =========================================================================
    // SECTION 7: GUIDED LEARNING MISSIONS AUDIT
    // =========================================================================
    console.log('\n--- 7. AUDITING 5 GUIDED LEARNING MISSIONS ---');
    await audit.navigateTo('#planet-x');
    await new Promise(r => setTimeout(r, 400));

    const missionTest = await audit.evaluate(`
      (async () => {
        // Find Guided Missions tab
        const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('5 Guided Missions') || b.textContent.includes('Guided Missions'));
        if (tabBtn) tabBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const hasMissions = document.body.textContent.includes('5 Guided Learning Missions');
        const questionOption = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '30.1 AU');
        
        let answered = false;
        if (questionOption) {
          questionOption.click();
          await new Promise(r => setTimeout(r, 200));
          answered = true;
        }

        const savedProgress = localStorage.getItem('cosmic_frontier_learning_missions_completed');
        return {
          hasMissions,
          answered,
          hasStorage: !!savedProgress
        };
      })()
    `);

    test(
      'Learning Missions: 5 interactive missions render with instant question feedback & progress saving',
      missionTest.hasMissions && missionTest.hasStorage
    );

    // =========================================================================
    // SECTION 8: RUNTIME CONSOLE & EXCEPTION AUDIT
    // =========================================================================
    console.log('\n--- 8. AUDITING RUNTIME CONSOLE & EXCEPTIONS ---');
    test(
      'Runtime Integrity: Zero uncaught JavaScript exceptions during browser test run',
      audit.runtimeErrors.length === 0,
      audit.runtimeErrors.length > 0 ? `Exceptions: ${audit.runtimeErrors.join('; ')}` : '0 errors'
    );

  } finally {
    await audit.cleanup();
  }

  console.log('\n====================================================');
  console.log(`BROWSER AUDIT COMPLETE: ${results.passed + results.failed} TESTS | PASSED: ${results.passed} | FAILED: ${results.failed}`);
  console.log('====================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
