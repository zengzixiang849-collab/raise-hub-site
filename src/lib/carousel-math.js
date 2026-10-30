// Pure logic for the poster carousel — no DOM, so it is unit-tested in Node
// (scripts/test-interactive.mjs). Positions are fractional: pos = 1.5 sits
// halfway between poster 1 and poster 2.

/** Degrees the dial turns per poster. */
export const STEP_DEG = 8;
/** Horizontal distance between poster centres, in % of a poster's width. */
export const SLIDE_SHIFT = 62;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Index of the poster closest to a (possibly fractional) position. */
export const nearestIndex = (pos, n) => clamp(Math.round(pos), 0, n - 1);

/** Rotation of the tick dial for a position (counter-clockwise as pos grows). */
export const dialRotation = (pos, stepDeg = STEP_DEG) => -pos * stepDeg;

/**
 * Poster picked by clicking the dial.
 * screenDeg: clicked angle measured clockwise from straight up, around the dial centre.
 */
export const indexFromScreenAngle = (screenDeg, pos, n, stepDeg = STEP_DEG) =>
  clamp(Math.round(screenDeg / stepDeg + pos), 0, n - 1);

/** Position while dragging: moving right (dx > 0) brings the previous poster in. */
export const dragToPos = (startPos, dx, pxPerUnit, n) => clamp(startPos - dx / pxPerUnit, -0.25, n - 1 + 0.25);

/** Keyboard: new index, or null when the key is not handled. */
export function keyToIndex(key, index, n) {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clamp(index + 1, 0, n - 1);
    case 'ArrowLeft':
    case 'ArrowDown':
      return clamp(index - 1, 0, n - 1);
    case 'Home':
      return 0;
    case 'End':
      return n - 1;
    default:
      return null;
  }
}

/** Where one slide sits, given its offset from the current position (slide index − pos). */
export function slideLayout(offset) {
  const a = Math.abs(offset);
  const opacity = a <= 1 ? 1 - 0.5 * a : a < 1.8 ? (0.5 * (1.8 - a)) / 0.8 : 0;
  return {
    x: offset * SLIDE_SHIFT,
    scale: 1 - 0.18 * Math.min(a, 1.5),
    rotateY: clamp(-offset * 12, -16, 16),
    opacity: Math.max(0, opacity),
    z: 10 - Math.round(a * 3),
  };
}
