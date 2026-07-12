/**
 * Pure interaction math shared by pointer/wheel-driven browsing UI (the
 * homepage rotary archive, featured Builds slider).
 *
 * A roving-focus helper was deliberately not built: every planned consumer
 * drives a single active index with explicit previous/next controls, which
 * these utilities plus `PrevNextControls` already cover. Revisit only if a
 * consumer genuinely needs arrow-key focus movement across sibling items.
 */

/**
 * Pointer travel (in CSS px) below which a pointerdown→pointerup pair is
 * treated as a click/tap; at or above it, it is a drag and must not select.
 */
export const DRAG_THRESHOLD_PX = 8;

/** True when pointer travel is a drag rather than a click/tap. */
export function isDragGesture(
  deltaX: number,
  deltaY: number,
  threshold: number = DRAG_THRESHOLD_PX,
): boolean {
  return Math.hypot(deltaX, deltaY) >= threshold;
}

/** Nearest valid index in a list of `length`, bounded (no wrap-around). */
export function clampIndex(index: number, length: number): number {
  if (length <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.round(index), 0), length - 1);
}

/** Valid index in a list of `length`, wrapping past either end. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0 || !Number.isFinite(index)) return 0;
  const rounded = Math.round(index);
  return ((rounded % length) + length) % length;
}

/**
 * Index reached by moving `delta` steps from `current`. Bounded by default;
 * pass `wrap: true` for cyclic consumers (e.g. a looping carousel).
 */
export function stepIndex(
  current: number,
  delta: number,
  length: number,
  options: { wrap?: boolean } = {},
): number {
  const target = current + delta;
  return options.wrap ? wrapIndex(target, length) : clampIndex(target, length);
}
