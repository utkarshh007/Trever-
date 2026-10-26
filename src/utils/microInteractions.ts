export interface MagneticOffset {
  x: number;
  y: number;
  innerX: number;
  innerY: number;
}

/**
 * Computes magnetic pull offsets for a button and its inner content layer
 * given pointer coordinates and element bounding box.
 * Guarded against NaN, infinite values, and missing rect bounds.
 */
export function calculateMagneticPull(
  clientX: number,
  clientY: number,
  rect?: { left: number; top: number; width: number; height: number } | null,
  strength = 0.32,
  maxDisplacement = 14
): MagneticOffset {
  if (
    !rect ||
    typeof rect !== 'object' ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0 ||
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY)
  ) {
    return { x: 0, y: 0, innerX: 0, innerY: 0 };
  }

  const safeStrength = Number.isFinite(strength) && strength > 0 ? strength : 0.32;
  const safeMax = Number.isFinite(maxDisplacement) && maxDisplacement > 0 ? maxDisplacement : 14;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const deltaX = (clientX - centerX) * safeStrength;
  const deltaY = (clientY - centerY) * safeStrength;

  const clamp = (val: number, max: number) => Math.max(-max, Math.min(max, val));

  const x = Number(clamp(deltaX, safeMax).toFixed(2));
  const y = Number(clamp(deltaY, safeMax * 0.75).toFixed(2));

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    innerX: Number.isFinite(x) ? Number((x * 0.45).toFixed(2)) : 0,
    innerY: Number.isFinite(y) ? Number((y * 0.45).toFixed(2)) : 0,
  };
}

/**
 * Computes normalized proximity intensity (0..1) of a word/glyph center to the pointer
 * using a smooth cosine falloff within maxRadius.
 * Guarded against NaN and negative radius values.
 */
export function calculateCharProximity(
  pointerX: number,
  pointerY: number,
  charCenterX: number,
  charCenterY: number,
  maxRadius = 140
): { intensity: number; liftY: number; scale: number } {
  if (
    !Number.isFinite(pointerX) ||
    !Number.isFinite(pointerY) ||
    !Number.isFinite(charCenterX) ||
    !Number.isFinite(charCenterY) ||
    !Number.isFinite(maxRadius) ||
    maxRadius <= 0
  ) {
    return { intensity: 0, liftY: 0, scale: 1 };
  }

  const dx = pointerX - charCenterX;
  const dy = pointerY - charCenterY;
  const dist = Math.hypot(dx, dy);

  if (dist >= maxRadius || !Number.isFinite(dist)) {
    return { intensity: 0, liftY: 0, scale: 1 };
  }

  // Smooth cosine bell falloff
  const ratio = dist / maxRadius;
  const intensity = Number((0.5 * (1 + Math.cos(ratio * Math.PI))).toFixed(3));
  const liftY = Number((-intensity * 4.5).toFixed(2));
  const scale = Number((1 + intensity * 0.045).toFixed(3));

  return {
    intensity: Number.isFinite(intensity) ? intensity : 0,
    liftY: Number.isFinite(liftY) ? liftY : 0,
    scale: Number.isFinite(scale) ? scale : 1,
  };
}

const TECH_GLYPHS = '0123456789ABCDEF<>/_·';

/**
 * Deterministically scrambles a text string for a given progress (0..1),
 * revealing original characters from left to right.
 * Guarded against null, undefined, and non-finite progress.
 */
export function decodeLivingText(targetText: unknown, progress: number): string {
  const str = typeof targetText === 'string' ? targetText : '';
  if (!str) return '';

  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  if (p >= 1) return str;

  const revealCount = Math.floor(str.length * p);
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ' || i < revealCount) {
      out += ch;
    } else {
      const glyphIdx = (i * 7 + Math.floor(p * 23)) % TECH_GLYPHS.length;
      out += TECH_GLYPHS[glyphIdx];
    }
  }
  return out;
}
