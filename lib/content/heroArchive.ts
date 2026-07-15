import { BUILDS, type Build } from "@/lib/content/builds";
import {
  BUILD_CARD_BACKS,
  BUILD_CARD_BACK_SIZE,
  buildDisplayState,
  type BuildDisplayState,
} from "@/lib/content/buildVisuals";

/**
 * Homepage rotary-archive seed (TASK-005).
 *
 * D-09 (featured subset + order): the hero reuses the single normalized
 * Builds source (lib/content/builds.ts) rather than inventing card content.
 * `HERO_BUILD_IDS` is the approved subset shown in the arc;
 * every id resolves to a real BUILDS entry and the set deliberately includes
 * all three card-back states so the production art system is exercised. D-09
 * was resolved with the July 2026 hero-reference refinement.
 *
 * D-08 (card-back mapping): the source `sourceStatus` taxonomy remains
 * unresolved. The shared, explicit rule and approved artwork metadata live in
 * `buildVisuals.ts` so the hero and Builds page cannot drift apart.
 */
export type CardBackState = BuildDisplayState;

/**
 * Approved featured subset and arc order (D-09). Ordered so the three card
 * backs alternate across the sweep and the initial active card is a product
 * with a working internal destination (BluePrint AI).
 */
const HERO_BUILD_IDS = [
  "rive-and-limn", // live
  "icon-training-app", // blueprint
  "alpac-london", // live
  "blueprint-ai", // blueprint — initial active card
  "clinic-conversion-concept", // concept
  "basenote-solutions", // live
  "private-ai-formulation-tool", // blueprint
] as const;

/** Index of "blueprint-ai" — centered so the arc fans evenly on first paint. */
export const HERO_INITIAL_INDEX = 3;

/**
 * Native-resolution canvas shared by the card backs. The supplied PNG pixels
 * are alpha-trimmed and padded without resizing, then encoded as lossless WebP.
 */
export const HERO_CARD_BACK_SIZE = BUILD_CARD_BACK_SIZE;

export interface HeroCard {
  readonly build: Build;
  readonly state: CardBackState;
  readonly cardBackSrc: string;
  readonly cardBackAlt: string;
  readonly stateLabel: string;
  readonly stateCode: string;
}

export const HERO_CARDS: readonly HeroCard[] = HERO_BUILD_IDS.map((id) => {
  const build = BUILDS.find((entry) => entry.id === id);
  if (!build) {
    throw new Error(`Hero archive references unknown build id: ${id}`);
  }
  const state = buildDisplayState(build);
  const art = BUILD_CARD_BACKS[state];
  return {
    build,
    state,
    cardBackSrc: art.src,
    cardBackAlt: art.alt,
    stateLabel: art.stateLabel,
    stateCode: art.stateCode,
  };
});
