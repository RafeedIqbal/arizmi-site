import type { BuildSourceStatus } from "@/lib/content/builds";

/**
 * Shared visual state for build placeholders and the approved archive backs.
 *
 * The source status taxonomy is intentionally preserved in `builds.ts`. This
 * display-only grouping keeps that content model intact while giving every
 * surface one deterministic visual treatment: public live work is teal,
 * concepts are violet, and work still in flight uses BluePrint blue.
 */
export type BuildDisplayState = "live" | "blueprint" | "concept";

export interface BuildCardBackArt {
  /** URL-safe runtime derivative of the approved brand artwork. */
  readonly src: string;
  readonly alt: string;
  /** Short state label used by build detail surfaces. */
  readonly stateLabel: string;
  /** Archive code printed on the approved card back (`// ARZ-...`). */
  readonly stateCode: string;
}

/** Native, shared canvas size of every approved card-back derivative. */
export const BUILD_CARD_BACK_SIZE = {
  width: 390,
  height: 614,
} as const;

/** The single state-to-art mapping used by the homepage and Builds page. */
export const BUILD_CARD_BACKS: Readonly<
  Record<BuildDisplayState, BuildCardBackArt>
> = {
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

type BuildWithSourceStatus = {
  readonly sourceStatus: BuildSourceStatus;
};

export function buildDisplayState(
  build: BuildWithSourceStatus,
): BuildDisplayState {
  switch (build.sourceStatus) {
    case "Live Build":
      return "live";
    case "Concept Build":
      return "concept";
    default:
      return "blueprint";
  }
}

export function cardBackArtFor(build: BuildWithSourceStatus): BuildCardBackArt {
  return BUILD_CARD_BACKS[buildDisplayState(build)];
}
