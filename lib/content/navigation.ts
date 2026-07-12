import { ROUTES, type AppRoute } from "@/lib/site";

/**
 * Global navigation content from docs/specs/global.md.
 * TASK-003 consumes this for the full-screen menu; the interim PageShell
 * header renders only the route items.
 */
export type NavItem =
  /** Internal route link. */
  | { readonly kind: "route"; readonly label: string; readonly href: AppRoute }
  /** External booking action, environment-backed until D-01 is resolved. */
  | { readonly kind: "booking"; readonly label: string }
  /** Contact action; behavior follows D-15. */
  | { readonly kind: "contact"; readonly label: string }
  /** Named by the brief but has no approved route/content yet (D-14). */
  | { readonly kind: "unavailable"; readonly label: string };

/** Primary menu links in the exact order defined by the brief. */
export const PRIMARY_NAV: readonly NavItem[] = [
  { kind: "route", label: "Builds", href: ROUTES.builds },
  { kind: "route", label: "Services", href: ROUTES.services },
  { kind: "route", label: "BluePrint AI", href: ROUTES.blueprintAi },
  { kind: "route", label: "About", href: ROUTES.about },
  { kind: "booking", label: "Book your build" },
] as const;

export const SECONDARY_NAV: readonly NavItem[] = [
  { kind: "unavailable", label: "Careers" },
  { kind: "contact", label: "Get in touch" },
] as const;

/** Menu supporting line; also the About hero headline and ticker copy. */
export const NAV_SUPPORTING_LINE =
  "For people building something that does not exist yet.";
