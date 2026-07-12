"use client";

import { useSyncExternalStore } from "react";
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "./reducedMotion";

function subscribe(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Current `prefers-reduced-motion: reduce` state, re-rendering when the
 * media query changes (e.g. the user toggles the OS setting mid-session).
 * Hydration-safe: the server renders the full-motion markup and the client
 * corrects it before paint. One-shot imperative reads (GSAP setup) can keep
 * using `prefersReducedMotion()` from lib/motion.ts.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, getServerSnapshot);
}
