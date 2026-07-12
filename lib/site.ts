/**
 * Canonical origin and route map for the five public routes defined in
 * docs/redesign/specs/global.md. Browser-safe: contains no environment reads.
 *
 * Careers, contact, and privacy routes are intentionally absent until D-02,
 * D-14, and D-15 are resolved.
 */
export const SITE_URL = "https://www.arizmilabs.com";

export const ROUTES = {
  home: "/",
  builds: "/builds",
  blueprintAi: "/blueprint-ai",
  services: "/services",
  about: "/about",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
