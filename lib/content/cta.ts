import { ROUTES, type AppRoute } from "@/lib/site";

/**
 * Shared CTA vocabulary from docs/specs/global.md. Use these labels
 * verbatim; do not fork copy per page.
 */
export const CTA_LABELS = {
  /** Primary booking action on the homepage and About page. */
  bookBuildCall: "Book a build call",
  /** Only where the Services source copy explicitly uses it. */
  bookYourBuildCall: "Book your build call",
  /** Entry into the BluePrint flow. */
  startBlueprint: "Start your BluePrint",
  /** Homepage hero secondary CTA. */
  discoverBlueprint: "Discover your BluePrint",
  /** Diagnosis-dependent BluePrint conversion panels only. */
  bookCall: "Book a call",
} as const;

export type CtaLabel = (typeof CTA_LABELS)[keyof typeof CTA_LABELS];

/**
 * Centralized internal CTA destinations. The booking destination is
 * environment-backed and server-resolved (D-01); see lib/server/config.ts
 * and components/BookingCta.tsx — never link booking to "#".
 */
export const CTA_ROUTES = {
  blueprint: ROUTES.blueprintAi,
} as const satisfies Record<string, AppRoute>;
