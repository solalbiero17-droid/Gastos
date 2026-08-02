/**
 * React Native's color parser doesn't understand CSS oklch() strings (unlike
 * react-native-web/browsers), so every oklch value from the design spec is
 * converted to a concrete hex color here.
 */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function toSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return clamp01(v);
}

const cache = new Map<string, string>();

/** Converts an OKLCH color (L 0-1, C, H degrees, optional alpha 0-1) to a hex/rgba string. */
export function oklch(l: number, c: number, h: number, alpha = 1): string {
  const key = `${l},${c},${h},${alpha}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const r = Math.round(toSrgb(rLin) * 255);
  const g = Math.round(toSrgb(gLin) * 255);
  const bl = Math.round(toSrgb(bLin) * 255);

  const result =
    alpha < 1
      ? `rgba(${r}, ${g}, ${bl}, ${alpha})`
      : `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  cache.set(key, result);
  return result;
}

export function categoryColor(hue: number): string {
  return oklch(0.6, 0.16, hue);
}

export function categorySoft(hue: number): string {
  return oklch(0.95, 0.04, hue);
}
