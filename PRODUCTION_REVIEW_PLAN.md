# Production Readiness Review and Optimization Plan

Date: 2026-02-24  
Repository: `Arizmi-Site`

## Scope and Exclusions
- Reviewed app code, tooling, build/test configuration, and docs for production-readiness.
- Placeholder content/flows were intentionally excluded from findings (for example: `Hero Image (TBD)`, placeholder case-study copy, unimplemented Calendly/email wiring).

## Audit Summary
- TypeScript check passes (`npx tsc --noEmit`).
- Current quality gates are not production-ready due to lint/test/build pipeline issues.
- Main risks are in CI reliability, accessibility, and missing production hardening defaults.

## Findings (Ordered by Severity)

## P0 - Release Blockers
1. Lint pipeline is broken by incompatible ESLint major version.
   - Evidence:
     - [`/Volumes/External Drive/Github/Arizmi-Site/package.json:23`](/Volumes/External Drive/Github/Arizmi-Site/package.json:23) uses `eslint@^10.0.1`.
     - `npm run lint` throws `TypeError` in `react/display-name`.
     - `npm ls` reports invalid peer ranges for Next ESLint plugins (expecting ESLint <=9).
   - Impact: CI cannot reliably enforce static quality checks.

2. E2E test suite is template-only and does not validate this site.
   - Evidence:
     - [`/Volumes/External Drive/Github/Arizmi-Site/tests/example.spec.ts:4`](/Volumes/External Drive/Github/Arizmi-Site/tests/example.spec.ts:4) and `:11` test `playwright.dev` instead of local app.
     - [`/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:32`](/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:32) `baseURL` is commented.
     - [`/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:77`](/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:77) `webServer` is commented.
   - Impact: false confidence; shipping regressions likely.

3. Build reproducibility depends on external font fetch during build.
   - Evidence:
     - [`/Volumes/External Drive/Github/Arizmi-Site/app/layout.tsx:2`](/Volumes/External Drive/Github/Arizmi-Site/app/layout.tsx:2) uses `next/font/google`.
     - `npm run build` fails in restricted network due Google Fonts fetch.
   - Impact: non-deterministic/fragile builds in restricted CI or hardened environments.

## P1 - High Priority
1. Global scrollbar hiding harms accessibility and discoverability.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/app/globals.css:24`](/Volumes/External Drive/Github/Arizmi-Site/app/globals.css:24)-[`33`](/Volumes/External Drive/Github/Arizmi-Site/app/globals.css:33).

2. Modal accessibility is incomplete (focus is set, but not trapped/restored; background scroll not locked).
   - Evidence:
     - [`/Volumes/External Drive/Github/Arizmi-Site/components/ContactModal.tsx:43`](/Volumes/External Drive/Github/Arizmi-Site/components/ContactModal.tsx:43) comment says focus trap, but only initial focus is applied.
     - No focus-loop logic and no previous-focus restore.
     - No body scroll lock while dialog is open.

3. “Why Choose Us” reveal behavior can leave text blurred/dim for non-pointer and keyboard users.
   - Evidence:
     - Blur/low opacity at [`/Volumes/External Drive/Github/Arizmi-Site/components/WhyChooseUsSection.tsx:152`](/Volumes/External Drive/Github/Arizmi-Site/components/WhyChooseUsSection.tsx:152), [`165`](/Volumes/External Drive/Github/Arizmi-Site/components/WhyChooseUsSection.tsx:165).
     - Desktop reveal depends on mouse/touch handlers (`onMouseEnter`, `onTouchStart`) at [`126`](/Volumes/External Drive/Github/Arizmi-Site/components/WhyChooseUsSection.tsx:126)-[`127`](/Volumes/External Drive/Github/Arizmi-Site/components/WhyChooseUsSection.tsx:127).

4. Mobile menu semantics are incomplete for assistive tech.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/components/Nav.tsx:172`](/Volumes/External Drive/Github/Arizmi-Site/components/Nav.tsx:172) has no `aria-expanded`/`aria-controls`; no Esc key close behavior.

5. Heavy motion stack lacks reduced-motion fallback.
   - Evidence:
     - Scroll-driven GSAP in [`HeroSection.tsx:16`](/Volumes/External Drive/Github/Arizmi-Site/components/HeroSection.tsx:16), [`ServicesSection.tsx:18`](/Volumes/External Drive/Github/Arizmi-Site/components/ServicesSection.tsx:18), [`ProofSection.tsx:46`](/Volumes/External Drive/Github/Arizmi-Site/components/ProofSection.tsx:46), [`HowItWorksSection.tsx:32`](/Volumes/External Drive/Github/Arizmi-Site/components/HowItWorksSection.tsx:32), [`Nav.tsx:38`](/Volumes/External Drive/Github/Arizmi-Site/components/Nav.tsx:38).
     - Global smooth scrolling at [`/Volumes/External Drive/Github/Arizmi-Site/app/globals.css:35`](/Volumes/External Drive/Github/Arizmi-Site/app/globals.css:35).

6. No production security headers are configured.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/next.config.ts:3`](/Volumes/External Drive/Github/Arizmi-Site/next.config.ts:3) is effectively empty.

7. Metadata is minimal and misses richer SEO/social fields.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/app/layout.tsx:16`](/Volumes/External Drive/Github/Arizmi-Site/app/layout.tsx:16)-[`20`](/Volumes/External Drive/Github/Arizmi-Site/app/layout.tsx:20).

## P2 - Medium Priority
1. README remains create-next-app boilerplate and mismatches actual project setup.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/README.md:1`](/Volumes/External Drive/Github/Arizmi-Site/README.md:1), [`21`](/Volumes/External Drive/Github/Arizmi-Site/README.md:21), [`34`](/Volumes/External Drive/Github/Arizmi-Site/README.md:34).

2. Playwright config includes unused import.
   - Evidence: [`/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:2`](/Volumes/External Drive/Github/Arizmi-Site/playwright.config.ts:2) imports `path` but does not use it.

3. Codebase uses large inline-style surface area, which slows maintainability and style reuse.
   - Evidence: extensive inline style objects across all section components.

## Remediation Plan (Phased)

## Phase 1: Stabilize Build and CI (Day 0-1)
1. Fix lint compatibility.
   - Pin ESLint to Next-supported major (`^9`) and reinstall lockfile.
   - Verify `npm run lint` is green.
2. Replace template E2E tests.
   - Create smoke tests against local app routes/sections.
   - Enable `baseURL` and `webServer` in Playwright config.
   - Limit default CI matrix to a reliable baseline browser first (`chromium`), expand after stability.
3. Add deterministic CI scripts.
   - Add `typecheck`, `test:e2e`, and `ci` scripts in `package.json`.
   - CI gate: lint + typecheck + build + e2e smoke.

## Phase 2: Accessibility and UX Hardening (Day 1-2)
1. Remove global scrollbar suppression.
2. Implement proper dialog a11y:
   - Focus trap loop, focus restore, body scroll lock, `aria-labelledby`.
3. Add full keyboard/assistive semantics for mobile nav:
   - `aria-expanded`, `aria-controls`, Esc close, focus return.
4. Make “Why Choose Us” content readable by default or reveal via keyboard-focus too.
5. Add reduced-motion support:
   - Respect `prefers-reduced-motion` for GSAP timelines and smooth-scroll behavior.

## Phase 3: Security and SEO Baseline (Day 2-3)
1. Add security headers in `next.config.ts`:
   - `Content-Security-Policy` (report-only first), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`.
2. Expand metadata:
   - Canonical URL, Open Graph, Twitter card, robots directives.
3. Add `app/robots.ts` and `app/sitemap.ts`.

## Phase 4: Performance Optimization (Day 3-4)
1. Motion performance pass:
   - Avoid animating layout-affecting properties where possible.
   - Consolidate GSAP setup utility and avoid repeated plugin registration patterns.
2. Rendering strategy:
   - Keep animation-heavy sections client-side, but move purely static parts to server components where possible.
3. Asset strategy:
   - Decide on font hosting policy (Google fetch vs local self-host for deterministic builds).
4. Add measurable budgets:
   - Lighthouse mobile targets (Performance >=85, Accessibility >=95, Best Practices >=95, SEO >=95).
   - Web Vitals thresholds for LCP/CLS/INP.

## Phase 5: Documentation and Operations (Day 4)
1. Replace boilerplate README with:
   - real setup, scripts, deployment steps, and test strategy.
2. Add release checklist:
   - pre-release command matrix and rollback notes.

## Execution Order
1. Phase 1 (CI blockers)
2. Phase 2 (a11y hardening)
3. Phase 3 (security/SEO)
4. Phase 4 (performance tuning)
5. Phase 5 (docs/ops)

## Definition of Done
- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` passes in CI environment.
- `npm run test:e2e` validates local app behavior (not external websites).
- Lighthouse and accessibility goals meet agreed budgets.
