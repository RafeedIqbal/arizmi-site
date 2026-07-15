# AGENTS.md

Guidance for coding agents (Codex, etc.) working in this repository. Keep this file and `CLAUDE.md` in sync — they describe the same rules.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run start      # Serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run ci         # lint + typecheck + build — the only validation gate
```

There is no test suite and none should be added: the owner smoke-tests manually at release time. Do not write or run automated tests, and do not run in-browser visual checks (Playwright or otherwise) without asking first; validate every change with `npm run ci`.

## Project structure

Next.js 16 App Router, TypeScript, Tailwind CSS v4, React 19. Marketing site for Arizmi Labs with six public routes — `/`, `/builds`, `/blueprint-ai`, `/services`, `/about`, `/privacy` — defined once in `lib/site.ts` (`ROUTES`, `SITE_URL`). All routes prerender statically; the only server code paths are the server actions (`app/actions/contact.ts` for the contact form, `app/blueprint-ai/actions.ts` for the BluePrint flow).

- `app/` — routes, root layout (self-hosted fonts, metadata), `robots.ts`, `sitemap.ts`, OG/apple-icon generators.
- `components/` — site chrome (`SiteNav`, `SiteMenu`, `SiteFooter`, `PageShell`, `BookingCta`, `ContactModal`, `HomeHero`) plus per-page directories (`home/`, `builds/`, `blueprint/`, `about/`, `services/`).
- `components/ui/` — shared accessible primitives (`Button`, `Dialog`, `Disclosure`, `LiveRegion`, `MetaLabel`, `PageHeader`, `PrevNextControls`, `Section`, `SectionHeading`, `VisuallyHidden`). Reuse these instead of reimplementing dialogs/disclosures.
- `lib/content/` — typed page copy and data (builds, services, team, process, hero archive, navigation, CTA vocabulary). **Copy here is approved verbatim — do not reword without owner sign-off.**
- `lib/blueprint/` — browser-safe BluePrint logic: flow state machine (`flow.ts`), schemas, validation, question content, action IO types.
- `lib/server/` — server-only modules (guarded by `import "server-only"`): env-backed config in `config.ts`, and under `blueprint/` the AI adapters (`ai.ts` harness/selector, `gemini.ts` provider), prompts, lead repository (`leads.ts`, Upstash-backed via `redis.ts`), Google Sheets mirror (`sheets.ts`), email delivery, document rendering, and rate limiting (Redis-backed with in-memory dev fallback).

## Rules that matter

- **Client/server boundary:** environment variables are read only in `lib/server/config.ts` and `lib/server/blueprint/{ai,leads}.ts` — never in components or directly in server actions; the other server modules (`gemini.ts`, `redis.ts`, `sheets.ts`) consume resolved config only. Server actions re-validate every input; the full BluePrint plan stays server-side behind the lead gate (the client only ever receives a six-field preview, and the plan is referenced by opaque lead id for emailing).
- **Env vars:** `BOOKING_URL` (falls back to `NEXT_PUBLIC_CALENDLY_LINK`), `PRIVACY_POLICY_URL` (optional override of `/privacy`), `GMAIL_USER` / `GMAIL_APP_PASSWORD`, `CONTACT_RECIPIENT`, `BLUEPRINT_LEAD_RECIPIENT`, `BLUEPRINT_AI_PROVIDER` (`gemini`) with `GEMINI_API_KEY` / `BLUEPRINT_AI_MODEL`, `LEAD_STORAGE` (`upstash`) with `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (`KV_*` fallbacks), and the optional `GOOGLE_SHEETS_CLIENT_EMAIL` / `GOOGLE_SHEETS_PRIVATE_KEY` / `GOOGLE_SHEETS_SPREADSHEET_ID` mirror. Reference template: `example.env`; go-live steps: `docs/PRODUCTION.md`.
- **Accessibility:** every interactive pattern supports keyboard, touch, screen readers, and `prefers-reduced-motion` (`lib/useReducedMotion.ts` hook, `lib/reducedMotion.ts` for non-React code, per-component CSS guards). Keep this bar for new UI.

## Styling & design tokens

Brand primitives and contrast-safe semantic tokens live in `app/globals.css` `:root`, mapped into Tailwind via `@theme inline`. Components consume semantic tokens (`--canvas`, `--surface-card`, `--ink`, `--ink-muted`, `--teal-*`, `--focus-ring`, `--card-accent`, …), never raw hex. Primitives: warm off-white canvas `#F7F5EF`, card black `#101313`, teal `#03B6A3` / `#00AFA7` / `#019099`, tech blue (BluePrint) `#2F8ED8`, deep violet (Concept) `#6B4FD3`. Documented contrast ratios accompany the text tokens in `globals.css`; keep WCAG AA when adding colors.

## Fonts & brand assets

Fonts are self-hosted via `next/font/local` in `app/layout.tsx` from WOFF2 files in `public/fonts/`: **Manrope** (`--font-manrope`, variable 200–800, default body) and **Space Mono** (`--font-space-mono`, 400/700, metadata via `font-mono` / `.font-meta` / `MetaLabel`). No external network fetches during build.

Components reference only the runtime-ready derivatives in `public/assets/arizmi/`. The supplied brand masters (logos, TTFs, card backs) are preserved outside the web root in `docs/brand-source/` — never edit or serve them directly; legacy/unapproved artwork lives in `docs/reference-assets/`.

## Animation

Most motion is CSS transitions gated on reduced-motion. GSAP/ScrollTrigger is used only via `lib/motion.ts` (currently just `components/home/ProcessSection.tsx`): plugins register at module level; set up inside `gsap.context(..., rootRef)` in `useLayoutEffect` and `ctx.revert()` on cleanup.

## Commits & PRs

Use short, imperative commit messages that state the change (e.g. `Refine hero CTA copy`), not `.`. PRs should include a brief summary and before/after screenshots for UI changes.
