# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # tsc --noEmit
npm run ci         # lint + typecheck + build — the only validation gate
```

Do not write or run automated tests; the owner smoke-tests manually at release time. Validate changes with `npm run ci`.

## Architecture

Next.js 16 App Router (Turbopack), TypeScript, Tailwind CSS v4. Five public routes: `/`, `/builds`, `/blueprint-ai`, `/services`, `/about`. All routes prerender as static; the only server code paths are the server actions (`app/actions/contact.ts`, `app/blueprint-ai/actions.ts`).

- `app/` — routes, root layout, metadata, `robots.ts`, `sitemap.ts`, OG/apple-icon generators.
- `components/` — top-level chrome (`SiteNav`, `SiteMenu`, `SiteFooter`, `PageShell`, `BookingCta`, `ContactModal`, `HomeHero`) plus per-page directories: `home/`, `builds/`, `blueprint/`, `about/`, `services/`.
- `components/ui/` — shared accessible primitives (`Button`, `Dialog`, `Disclosure`, `LiveRegion`, `MetaLabel`, `PrevNextControls`, `Section`, `VisuallyHidden`). Reuse these rather than reimplementing dialogs/disclosures.
- `lib/content/` — typed page copy and data (builds, services, team, process, hero archive, navigation, CTA vocabulary). **Copy here is approved verbatim from the design brief — do not reword without owner sign-off.**
- `lib/blueprint/` — browser-safe BluePrint flow state machine, schemas, validation, content.
- `lib/server/` — server-only modules (`import "server-only"`): env-backed config (`config.ts`) and the BluePrint AI adapter, prompts, lead repository, email, document rendering, and rate limiting under `blueprint/`.
- `docs/` — production-readiness plan (`PRODUCTION.md`), decision registry (`SOURCE-OF-TRUTH.md`), page specs (`specs/`), asset alias map (`runtime-assets.md`).

## Conventions that matter

- **Decision gates:** unresolved business inputs (booking URL, privacy policy, AI provider, lead storage, project URLs, stats, team photos) are registered as D-01–D-18 in `docs/SOURCE-OF-TRUTH.md`. Unconfigured features must fail closed with a deliberate disabled state — never `href="#"`, fake URLs, or invented facts.
- **CTAs:** labels and internal routes are centralized in `lib/content/cta.ts`; booking/privacy/recipient destinations resolve server-side through `lib/server/config.ts`.
- **Env vars:** `BOOKING_URL`, `PRIVACY_POLICY_URL`, `GMAIL_USER`/`GMAIL_APP_PASSWORD`, `CONTACT_RECIPIENT`, `BLUEPRINT_LEAD_RECIPIENT`, `BLUEPRINT_AI_PROVIDER`, `LEAD_STORAGE`. See the table in `docs/PRODUCTION.md`.
- **Accessibility:** every interactive pattern supports keyboard, touch, screen readers, and `prefers-reduced-motion` (`lib/useReducedMotion.ts` + per-component CSS guards). Keep this bar when adding UI.

## Design tokens

Brand primitives and contrast-safe semantic tokens live in `app/globals.css` `:root`, mapped into Tailwind via `@theme inline`. Components consume semantic tokens (`--canvas`, `--surface-card`, `--ink`, `--teal-*`, `--focus-ring`, …), never raw hex.

| Primitive | Value |
|---|---|
| Warm off-white (canvas) | `#F7F5EF` |
| Card black | `#101313` |
| Arizmi teal light / mid / dark | `#03B6A3` / `#00AFA7` / `#019099` |
| Tech blue (BluePrint) | `#2F8ED8` |
| Deep violet (Concept) | `#6B4FD3` |

Legacy dark-theme tokens (`--bg`, `--surface`, `--accent: #59b0ff`, …) remain in `globals.css` only for the pre-redesign `ContactModal`; do not use them in new work.

## Fonts

Self-hosted via `next/font/local` in `app/layout.tsx` from optimized WOFF2 files in `public/fonts/`:

- **Manrope** (`--font-manrope`, weights 200–800) — main typeface, default body font.
- **Space Mono** (`--font-space-mono`, 400/700) — metadata, via `font-mono` or `.font-meta` / `MetaLabel`.

The supplied TTF files, unused weights/styles, and OFL licences are preserved outside the web root in `docs/brand-source/Fonts/`.

## Brand assets

Components reference only the URL-safe, runtime-ready derivatives in `public/assets/arizmi/` (logomarks, wordmark, and card backs). The supplied originals are preserved outside the web root in `docs/brand-source/`; legacy and unapproved project artwork lives in `docs/reference-assets/`. Never edit the supplied masters in place. Mapping: `docs/runtime-assets.md`.

## Animation

Most motion is CSS transitions gated on reduced-motion. GSAP/ScrollTrigger is used only via `lib/motion.ts` (currently `components/home/ProcessSection.tsx`): register plugins at module level, set up inside `gsap.context(..., rootRef)` in `useLayoutEffect`, and `ctx.revert()` on cleanup.
