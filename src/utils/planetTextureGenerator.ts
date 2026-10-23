import * as THREE from 'three';

/**
 * Procedural astronomical texture generator for Solar System bodies.
 * Generates high-fidelity, high-performance canvas textures in memory.
 * No external network requests, zero bandwidth overhead, crisp WebGL rendering.
 */

// Helper to create an offscreen canvas
function createOffscreenCanvas(width = 1024, height = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

// 1. Sun Texture (Emissive solar plasma with convective granulation)
export function createSunTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Deep glowing orange-yellow plasma gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#FFE875');
  grad.addColorStop(0.3, '#FFB703');
  grad.addColorStop(0.5, '#FD9E02');
  grad.addColorStop(0.7, '#FB8500');
  grad.addColorStop(1, '#FF7000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solar flare spots and granulation noise
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 8 + 2;
    const alpha = Math.random() * 0.4 + 0.1;
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cooler sunspot regions
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.6) + canvas.height * 0.2;
    const r = Math.random() * 12 + 6;
    ctx.fillStyle = 'rgba(180, 70, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 2. Mercury Texture (Desaturated, cratered silicate crust)
export function createMercuryTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Base metallic gray-brown
  ctx.fillStyle = '#8C8885';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle tonal patches
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = Math.random() * 120 + 30;
    const h = Math.random() * 80 + 20;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 68, 66, 0.15)' : 'rgba(170, 166, 162, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 6 + 1.5;
    ctx.fillStyle = 'rgba(40, 38, 36, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Crater rim highlight
    ctx.strokeStyle = 'rgba(210, 205, 200, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. Venus Texture (Dense, opaque sulfuric acid cloud deck)
export function createVenusTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Pale amber and cream atmosphere
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#EADBB6');
  grad.addColorStop(0.25, '#F3E5C8');
  grad.addColorStop(0.5, '#DEC695');
  grad.addColorStop(0.75, '#EDD8B4');
  grad.addColorStop(1, '#DFC799');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Broad swirling horizontal bands
  for (let i = 0; i < 25; i++) {
    const y = (i / 25) * canvas.height;
    const thickness = Math.random() * 30 + 10;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(180, 140, 80, 0.12)' : 'rgba(255, 245, 220, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      canvas.width * 0.3, y + Math.sin(i) * 20,
      canvas.width * 0.7, y - Math.cos(i) * 20,
      canvas.width, y
    );
    ctx.lineTo(canvas.width, y + thickness);
    ctx.lineTo(0, y + thickness);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 4. Earth Texture (Vibrant oceans, green/brown continents, cloud patterns)
export function createEarthTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Deep oceanic blue
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#102A54');
  oceanGrad.addColorStop(0.5, '#1B4985');
  oceanGrad.addColorStop(1, '#0D2142');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continental landmasses (stylized Americas, Eurasia, Africa, Australia)
  ctx.fillStyle = '#2D6A4F'; // lush green
  const continents = [
    // North America
    { cx: 220, cy: 160, rx: 90, ry: 60, col: '#3E7B54' },
    // South America
    { cx: 280, cy: 330, rx: 60, ry: 90, col: '#40916C' },
    // Eurasia
    { cx: 650, cy: 150, rx: 170, ry: 75, col: '#52796F' },
    // Africa
    { cx: 550, cy: 270, rx: 80, ry: 100, col: '#8B7355' }, // Sahel/Sahara brown
    // Australia
    { cx: 850, cy: 360, rx: 60, ry: 45, col: '#B08968' }
  ];

  for (const c of continents) {
    ctx.fillStyle = c.col;
    ctx.beginPath();
    ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // White polar ice caps
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 10, canvas.width * 0.45, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 10, canvas.width * 0.45, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling white clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.8) + canvas.height * 0.1;
    const w = Math.random() * 140 + 40;
    const h = Math.random() * 20 + 5;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.sin(x) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5. Moon Texture
export function createMoonTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(512, 256);
  ctx.fillStyle = '#A3A3A3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark lunar maria
  ctx.fillStyle = 'rgba(80, 80, 80, 0.5)';
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 50 + 20;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small craters
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. Mars Texture (Red planet with basaltic features & polar ice)
export function createMarsTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Rust-orange iron oxide terrain
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#C1440E');
  grad.addColorStop(0.3, '#E05A1F');
  grad.addColorStop(0.7, '#D14915');
  grad.addColorStop(1, '#A03000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark volcanic plains (Syrtis Major & Acidalia Planitia)
  ctx.fillStyle = 'rgba(60, 25, 10, 0.4)';
  ctx.beginPath();
  ctx.ellipse(350, 240, 120, 60, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(750, 280, 140, 70, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // White polar caps
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 8, canvas.width * 0.3, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 8, canvas.width * 0.25, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 7. Jupiter Texture (Cloud belts, zones & the Great Red Spot)
export function createJupiterTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Base amber
  ctx.fillStyle = '#E3B778';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Latitudinal cloud belts
  const beltColors = [
    '#B07D4F', '#D9B48F', '#8C5229', '#E4C9A8', '#9E5B32',
    '#D2B48C', '#854D27', '#EED9C4', '#A0633C', '#BF8D63'
  ];

  for (let i = 0; i < beltColors.length; i++) {
    const y = (i / beltColors.length) * canvas.height;
    const h = (canvas.height / beltColors.length) + 4;
    ctx.fillStyle = beltColors[i];
    ctx.fillRect(0, y, canvas.width, h);

    // Subtle wavy turbulence
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let j = 0; j < 10; j++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, y + h / 2, Math.random() * 8 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The Great Red Spot (Southern hemisphere, around y = 330)
  ctx.fillStyle = '#B23A22';
  ctx.beginPath();
  ctx.ellipse(650, 330, 48, 30, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Outer swirling ring around Red Spot
  ctx.strokeStyle = '#D96B43';
  ctx.lineWidth = 4;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 8. Saturn Texture (Atmospheric golden bands)
export function createSaturnTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Golden-ochre atmospheric grad
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#C5AB75');
  grad.addColorStop(0.2, '#E2CD9B');
  grad.addColorStop(0.4, '#D6BD86');
  grad.addColorStop(0.6, '#ECD9A6');
  grad.addColorStop(0.8, '#D8BF89');
  grad.addColorStop(1, '#C2A870');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine banded structure
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * canvas.height;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(150, 120, 60, 0.1)' : 'rgba(255, 240, 200, 0.1)';
    ctx.fillRect(0, y, canvas.width, canvas.height / 40);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 9. Saturn Rings Texture (Concentric rings with Cassini Division)
export function createSaturnRingsTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 64);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Concentric gradient across x-axis (from inner ring to outer ring)
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  // Inner faint C Ring
  grad.addColorStop(0.0, 'rgba(160, 140, 100, 0.0)');
  grad.addColorStop(0.1, 'rgba(170, 150, 110, 0.35)');
  // Dense bright B Ring
  grad.addColorStop(0.25, 'rgba(215, 195, 150, 0.85)');
  grad.addColorStop(0.55, 'rgba(230, 210, 165, 0.95)');
  // Cassini Division (dark gap)
  grad.addColorStop(0.58, 'rgba(30, 25, 20, 0.05)');
  grad.addColorStop(0.64, 'rgba(30, 25, 20, 0.05)');
  // Outer A Ring
  grad.addColorStop(0.68, 'rgba(200, 180, 140, 0.75)');
  grad.addColorStop(0.85, 'rgba(190, 170, 130, 0.7)');
  // Encke Gap and edge
  grad.addColorStop(0.92, 'rgba(170, 150, 110, 0.3)');
  grad.addColorStop(1.0, 'rgba(150, 130, 90, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine particle ripples
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x, 0, 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 10. Uranus Texture (Pale cyan-aquamarine with atmospheric haze)
export function createUranusTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#8AE6E8');
  grad.addColorStop(0.5, '#A4EFF0');
  grad.addColorStop(1, '#7BDADF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Very subtle faint bands
  for (let i = 0; i < 15; i++) {
    const y = (i / 15) * canvas.height;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(90, 180, 190, 0.08)' : 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(0, y, canvas.width, canvas.height / 15);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 11. Neptune Texture (Deep azure blue with methane storm streaks)
export function createNeptuneTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createOffscreenCanvas(1024, 512);

  // Deep azure
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#2155CD');
  grad.addColorStop(0.4, '#2B6BF4');
  grad.addColorStop(0.7, '#1B45B4');
  grad.addColorStop(1, '#163896');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Great Dark Spot
  ctx.fillStyle = '#0F266A';
  ctx.beginPath();
  ctx.ellipse(380, 220, 50, 30, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Bright white methane cirrus cloud streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = Math.random() * 80 + 20;
    ctx.beginPath();
    ctx.ellipse(x, y, w, 2.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

