/**
 * Reduced-motion detection shared by the GSAP helpers in lib/motion.ts and
 * the React hook in lib/useReducedMotion.ts. Kept free of GSAP imports so
 * the hook does not pull the animation runtime into every consumer bundle.
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Returns true if the user prefers reduced motion. Safe to call on the server (returns false). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}
