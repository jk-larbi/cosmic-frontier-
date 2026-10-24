export type ColorPalette = 'grayscale' | 'inferno' | 'viridis' | 'magma' | 'plasma';
export type StretchFunction = 'linear' | 'logarithmic' | 'sqrt' | 'asinh';

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Color stops for scientific perceptually uniform colormaps
const COLORMAP_STOPS: Record<ColorPalette, { pos: number; color: RGB }[]> = {
  grayscale: [
    { pos: 0.0, color: { r: 0, g: 0, b: 0 } },
    { pos: 1.0, color: { r: 255, g: 255, b: 255 } }
  ],
  inferno: [
    { pos: 0.0, color: { r: 0, g: 0, b: 4 } },
    { pos: 0.2, color: { r: 40, g: 11, b: 84 } },
    { pos: 0.4, color: { r: 101, g: 21, b: 110 } },
    { pos: 0.6, color: { r: 187, g: 55, b: 84 } },
    { pos: 0.8, color: { r: 249, g: 142, b: 9 } },
    { pos: 1.0, color: { r: 252, g: 255, b: 164 } }
  ],
  viridis: [
    { pos: 0.0, color: { r: 68, g: 1, b: 84 } },
    { pos: 0.25, color: { r: 59, g: 82, b: 139 } },
    { pos: 0.5, color: { r: 33, g: 145, b: 140 } },
    { pos: 0.75, color: { r: 94, g: 201, b: 98 } },
    { pos: 1.0, color: { r: 253, g: 231, b: 37 } }
  ],
  magma: [
    { pos: 0.0, color: { r: 0, g: 0, b: 4 } },
    { pos: 0.25, color: { r: 81, g: 18, b: 124 } },
    { pos: 0.5, color: { r: 182, g: 54, b: 121 } },
    { pos: 0.75, color: { r: 251, g: 136, b: 97 } },
    { pos: 1.0, color: { r: 252, g: 253, b: 191 } }
  ],
  plasma: [
    { pos: 0.0, color: { r: 13, g: 8, b: 135 } },
    { pos: 0.25, color: { r: 126, g: 3, b: 168 } },
    { pos: 0.5, color: { r: 204, g: 71, b: 120 } },
    { pos: 0.75, color: { r: 248, g: 149, b: 64 } },
    { pos: 1.0, color: { r: 240, g: 249, b: 33 } }
  ]
};

// Interpolate between stops
function interpolateColor(stops: { pos: number; color: RGB }[], t: number): RGB {
  const clampedT = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (clampedT >= s1.pos && clampedT <= s2.pos) {
      const range = s2.pos - s1.pos;
      const factor = range === 0 ? 0 : (clampedT - s1.pos) / range;
      return {
        r: Math.round(s1.color.r + factor * (s2.color.r - s1.color.r)),
        g: Math.round(s1.color.g + factor * (s2.color.g - s1.color.g)),
        b: Math.round(s1.color.b + factor * (s2.color.b - s1.color.b))
      };
    }
  }
  return stops[stops.length - 1].color;
}

// Generate 256-element lookup tables for instant fast rendering
const COLORMAP_LUTS: Record<ColorPalette, Uint8ClampedArray> = {
  grayscale: new Uint8ClampedArray(256 * 3),
  inferno: new Uint8ClampedArray(256 * 3),
  viridis: new Uint8ClampedArray(256 * 3),
  magma: new Uint8ClampedArray(256 * 3),
  plasma: new Uint8ClampedArray(256 * 3)
};

(Object.keys(COLORMAP_STOPS) as ColorPalette[]).forEach((palette) => {
  const stops = COLORMAP_STOPS[palette];
  const lut = COLORMAP_LUTS[palette];
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const c = interpolateColor(stops, t);
    lut[i * 3] = c.r;
    lut[i * 3 + 1] = c.g;
    lut[i * 3 + 2] = c.b;
  }
});

// Astronomical Display Stretch Transformations
export function applyStretch(normalizedVal: number, stretch: StretchFunction): number {
  const v = Math.max(0, Math.min(1, normalizedVal));
  switch (stretch) {
    case 'sqrt':
      return Math.sqrt(v);
    case 'logarithmic': {
      // log10(1 + a*v) / log10(1 + a) with a = 100
      const a = 100;
      return Math.log10(1 + a * v) / Math.log10(1 + a);
    }
    case 'asinh': {
      // asinh(v / Q) / asinh(1 / Q) with softening parameter Q = 0.1
      const Q = 0.1;
      return Math.asinh(v / Q) / Math.asinh(1 / Q);
    }
    case 'linear':
    default:
      return v;
  }
}

/**
 * Transforms an image data array by calculating luminance, applying brightness and contrast,
 * calculating mathematical astronomical display stretch (Linear, Sqrt, Log, Asinh),
 * and mapping to scientific color palette (Viridis, Inferno, Magma, Plasma, Grayscale).
 */
export function processImageData(
  sourceData: ImageData,
  destData: ImageData,
  palette: ColorPalette,
  stretch: StretchFunction,
  brightness: number, // 50 to 200, 100 is 1.0x
  contrast: number = 100 // 50 to 200, 100 is 1.0x
): void {
  const src = sourceData.data;
  const dest = destData.data;
  const lut = COLORMAP_LUTS[palette];
  const bMultiplier = brightness / 100;
  const cFactor = contrast / 100;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const a = src[i + 3];

    // Standard relative luminance (ITU-R BT.601)
    const rawLum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Apply brightness
    let lum = rawLum * bMultiplier;

    // Apply contrast centered around midpoint 0.5
    lum = (lum - 0.5) * cFactor + 0.5;
    lum = Math.max(0, Math.min(1, lum));

    // Apply astronomical stretch
    const stretched = applyStretch(lum, stretch);

    // Map through colormap LUT (0 to 255)
    const lutIdx = Math.max(0, Math.min(255, Math.round(stretched * 255))) * 3;

    dest[i] = lut[lutIdx];
    dest[i + 1] = lut[lutIdx + 1];
    dest[i + 2] = lut[lutIdx + 2];
    dest[i + 3] = a; // preserve alpha
  }
}

