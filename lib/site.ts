/**
 * Canonical origin and route map for the public routes defined in
 * docs/specs/global.md. Browser-safe: contains no environment reads.
 *
 * Careers and contact routes are intentionally absent until D-14 and D-15 are
 * resolved. The privacy route exists (D-02) with draft copy pending approval.
 */
export const SITE_URL = "https://www.arizmilabs.com";

export const ROUTES = {
  home: "/",
  builds: "/builds",
  blueprintAi: "/blueprint-ai",
  services: "/services",
  about: "/about",
  privacy: "/privacy",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
