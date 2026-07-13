import { BUILDS, type Build } from "@/lib/content/builds";

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
 * D-08 (card-back mapping): the source `sourceStatus` taxonomy is unresolved,
 * so the card back is derived from status by an explicit, documented rule
 * instead of a new enum. Shipped, public builds use the teal "live" back;
 * strategic concepts use the violet "concept" back; everything still in
 * flight (Product / Launch / Private builds) uses the tech-blue "BluePrint"
 * back. Revisit when D-08 normalizes the taxonomy.
 */
export type CardBackState = "live" | "blueprint" | "concept";

interface CardBackArt {
  /** URL-safe runtime alias created in TASK-001. */
  readonly src: string;
  readonly alt: string;
  /** Short human label for the state, shown on the opened detail panel. */
  readonly stateLabel: string;
  /** Archive code printed on the approved card-back art (`// ARZ-…`). */
  readonly stateCode: string;
}

const CARD_BACKS: Record<CardBackState, CardBackArt> = {
  live: {
    src: "/assets/arizmi/card-backs/live.webp",
    alt: "Arizmi Labs live-build archive card",
    stateLabel: "Live build",
    stateCode: "ARZ-LIVE",
  },
  blueprint: {
    src: "/assets/arizmi/card-backs/blueprint.webp",
    alt: "Arizmi Labs BluePrint archive card",
    stateLabel: "BluePrint",
    stateCode: "ARZ-BLUEPRINT",
  },
  concept: {
    src: "/assets/arizmi/card-backs/concept.webp",
    alt: "Arizmi Labs concept archive card",
    stateLabel: "Concept",
    stateCode: "ARZ-CONCEPT",
  },
};

function cardBackStateFor(build: Build): CardBackState {
  switch (build.sourceStatus) {
    case "Live Build":
      return "live";
    case "Concept Build":
      return "concept";
    // Product / Launch / Private builds are real work not yet publicly live,
    // so they carry the tech-blue "BluePrint" back (see D-08 note above).
    default:
      return "blueprint";
  }
}

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
export const HERO_CARD_BACK_SIZE = {
  width: 390,
  height: 614,
} as const;

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
  const state = cardBackStateFor(build);
  const art = CARD_BACKS[state];
  return {
    build,
    state,
    cardBackSrc: art.src,
    cardBackAlt: art.alt,
    stateLabel: art.stateLabel,
    stateCode: art.stateCode,
  };
});
