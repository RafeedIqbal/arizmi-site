# Production readiness and Vercel deployment

Status as of **2026-07-13**, after a full audit of `main` (commit `01e5d68`) against the redesign brief.

## Where the site stands

- All five routes (`/`, `/builds`, `/blueprint-ai`, `/services`, `/about`), the full-screen menu, footer, and the complete BluePrint AI flow are implemented. Page copy matches the brief verbatim across every route; keyboard, touch, screen-reader, and `prefers-reduced-motion` support is in place throughout.
- `npm run ci` (lint + typecheck + build) passes. Every route prerenders as static; the only server code paths are the contact and BluePrint server actions.
- Every missing business input (booking URL, privacy policy, AI provider, lead storage, project URLs, stats, team photos, …) **fails closed**: production renders a deliberate disabled state or refuses the operation. Nothing fake ships. The registry of these gates is the decisions table in [`SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md).
- **No Vercel project exists yet.** The repo is on GitHub (`RafeedIqbal/arizmi-site`) with `main` pushed.

Because BluePrint AI fails closed on its own, the site can launch in phases: the marketing site first, BluePrint AI when its providers are wired.

## Phase 1 — take the marketing site live

| # | Item | Where | What to do |
| --- | --- | --- | --- |
| 1 | Booking URL (D-01) | `BOOKING_URL` env var | Until set, every booking CTA site-wide renders a disabled "Booking opens soon" control. Set the real scheduling link. |
| 2 | Contact recipient (D-15) | `CONTACT_RECIPIENT` env var | Falls back to a hardcoded `mish@icontraining.app` in `lib/server/config.ts`. Confirm or override — this address will silently receive production contact mail otherwise. |
| 3 | Mail transport | `GMAIL_USER`, `GMAIL_APP_PASSWORD` env vars | Without them the contact form returns "Messaging is temporarily unavailable". Uses Gmail SMTP via Nodemailer. |
| 4 | Production domain | `SITE_URL` in `lib/site.ts` | Hardcoded to `https://www.arizmilabs.com`; drives canonical URLs, sitemap, robots, and OG metadata. Confirm this is the launch domain or change it. |
| 5 | Owner release QA | — | The manual smoke-test pass (matrix below) has not been run. It is the final gate before promoting to production. |

## Phase 2 — enable BluePrint AI

Production currently refuses BluePrint generation and lead capture (by design). To enable:

| # | Item | Where | What to do |
| --- | --- | --- | --- |
| 1 | Privacy Policy (D-02) | `PRIVACY_POLICY_URL` env var | Lead capture is hard-blocked in production until a real URL is set. Requires an approved policy (and a decision on hosting it as a site route vs external). |
| 2 | AI provider (D-03) | `lib/server/blueprint/ai.ts`, `BLUEPRINT_AI_PROVIDER` env var | Only a deterministic mock adapter exists, and production refuses it. Implement a real adapter behind the existing `BlueprintAdapter` seam (diagnose + plan, validated against the schemas in `lib/blueprint/schema.ts`). Recommended: AI SDK v6 through Vercel AI Gateway so the vendor stays swappable. |
| 3 | Lead storage (D-04) | `lib/server/blueprint/leads.ts`, `LEAD_STORAGE` env var | Only an in-memory repository exists, and production refuses it. Implement `LeadRepository` (idempotent `create`, `findByIdempotencyKey`, `updateDelivery`) on a durable store — Neon Postgres or Upstash Redis via the Vercel Marketplace are the low-friction options. Decide retention/deletion policy at the same time. |
| 4 | Durable rate limiting | `lib/server/blueprint/rateLimit.ts`, `lib/guardSubmission.ts` | Both limiters are in-process Maps — on Vercel, instances don't share state, so limits are best-effort only. Unlike AI/storage, **nothing blocks production from running on them**, and generation costs real money per request. Move to a shared store (e.g. Upstash Redis rate limiting) before enabling generation. |
| 5 | Persist the idempotency key | `components/blueprint/BlueprintFlow.tsx` | The submission idempotency key and reveal state live only in React state (sessionStorage deliberately excludes PII/AI output). If the network drops after the lead is created and the user refreshes, a resubmit mints a new key → duplicate lead; the "Email me the full BluePrint" action is also unrecoverable after refresh. Persist the key (it contains no PII) to close the window. |
| 6 | Email design + sender (D-05), delivery shape (D-17) | `lib/server/blueprint/document.ts`, `email.ts`, `BLUEPRINT_LEAD_RECIPIENT` env var | The full BluePrint is delivered as a branded HTML email (no PDF, no download — the brief's "polished PDF" is unresolved D-17). Approve the design/sender, or accept email-only for launch. Note the email path is *not* decision-gated: it sends in production as soon as SMTP is configured. |
| 7 | Budget/timeline options (D-16) | `lib/blueprint/content.ts` | The lead-gate option sets are marked draft. Confirm final options. |
| 8 | Gmail sending limits | — | Gmail app-password SMTP has daily send caps and weak deliverability for transactional mail. Fine for launch volume; plan a transactional provider (e.g. Resend) if BluePrint volume grows. |

## Phase 3 — content completion (non-blocking)

These improve the site but nothing breaks while they wait:

- **D-06** — real project URLs for the "Open/Explore" CTAs in `lib/content/builds.ts` (all currently disabled "Link coming soon"; only the internal BluePrint AI link is live).
- **D-07** — featured build video/images to replace the "Preview coming soon" placeholders (`components/builds/BuildMedia.tsx`).
- **D-08** — normalize the build taxonomy. Because "Product Build" / "Launch Build" statuses were deliberately not force-mapped: Freedom Airlines is absent from "Live builds", Icon Training App and BluePrint AI appear only under "AI systems", and Growth Map Diagnostic appears only under "All".
- **D-09** — confirm the hero archive's featured subset/order (`lib/content/heroArchive.ts`).
- **D-10** — approved About statistics (section is dev-only until then).
- **D-11** — team card photos to replace the monogram placeholders. Also confirm the "Top 30 Most Influential Fintech Marketers" claim in Kaynat's bio.
- **D-12** — approve (or replace) the abstract logomark treatment used for the "Why Arizmi?" visual.
- **D-13/D-14** — footer legal links and a Careers destination, when they exist.

## Code cleanups from the audit

Smaller fixes, roughly by value:

1. **Accessibility bugs (BluePrint form):** the error-summary links for the four choice groups point at `#bp-<field>` anchors that don't exist (`ChoiceGroup`'s fieldset has no `id` — `components/blueprint/Fields.tsx`), and the progress bar's width transition ignores `prefers-reduced-motion` (`Fields.tsx`). Both are small, worth fixing before Phase 2.
2. **Disabled booking control isn't focusable** — keyboard/screen-reader users can't discover the "Booking opens soon" reason. Moot once `BOOKING_URL` is set.
3. **Builds page state:** the expanded archive entry and featured selection don't survive back/forward navigation (only the filter does), and the featured selection resets when the filter changes.
4. **Accordion landmarks:** six `role="region"` landmarks on the Services accordion are noisy.

## Release QA — owner smoke tests

This checklist (formerly TASK-018) has **not** been run and is the final gate. Run it against a production build (preview deployment or `npm run build && npm run start`).

**Viewports:** 320×568, 390×844, 768×1024, 1366×768, 1440×900, wide desktop, and 200% browser zoom. For interactive areas test mouse, trackpad, touch, keyboard-only, screen-reader landmarks/state, and `prefers-reduced-motion`.

**Flows:**

- Open/close navigation, traverse every route, confirm focus restoration.
- Browse/open/close hero cards while page scroll keeps working.
- Activate all four process steps and the six homepage/services disclosures.
- Apply every Builds filter; inspect all 12 project details; verify protected entries.
- BluePrint: happy path, edit/regenerate path, validation errors, provider failure, persistence failure, email failure, duplicate submit, and all three conversion classifications.
- Open/close all team bios; pause/disable the ticker.
- Exercise every booking, BluePrint, contact, and project CTA in both configured and unconfigured states.

**Targets:** Lighthouse Accessibility / Best Practices / SEO ≥ 95, Performance ≥ 85. One H1 per page, logical heading order, visible focus, no keyboard traps. Verify protected Builds data, AI prompts, secrets, and lead content are absent from client bundles.

## Vercel deployment runbook

The project is a stock Next.js 16 App Router app — no `vercel.json`/`vercel.ts` needed (security headers, including CSP, already live in `next.config.ts`). `@vercel/analytics` is already wired in `app/layout.tsx` and activates automatically once deployed.

1. **Prep:** upgrade the CLI (`npm i -g vercel@latest`), then from the repo root run `vercel link` and create a new project (or import `RafeedIqbal/arizmi-site` from the dashboard → New Project). Framework preset is auto-detected; default build settings are correct.
2. **Environment variables** (Project → Settings → Environment Variables, or `vercel env add <NAME> production`):

   | Variable | Phase | Purpose | When unset |
   | --- | --- | --- | --- |
   | `BOOKING_URL` | 1 | Booking destination for every "Book a call" CTA (falls back to `NEXT_PUBLIC_CALENDLY_LINK`) | CTAs render disabled "Booking opens soon" |
   | `GMAIL_USER` / `GMAIL_APP_PASSWORD` | 1 | Nodemailer Gmail transport (contact + BluePrint mail) | Contact form reports messaging unavailable |
   | `CONTACT_RECIPIENT` | 1 | Contact form recipient | Falls back to hardcoded `mish@icontraining.app` |
   | `PRIVACY_POLICY_URL` | 2 | Consent link; unblocks production lead capture | BluePrint lead capture refused in production |
   | `BLUEPRINT_AI_PROVIDER` | 2 | Selects the AI adapter (real adapter must be implemented first; `mock` is refused in production) | BluePrint generation refused in production |
   | `LEAD_STORAGE` | 2 | Selects the lead repository (durable adapter must be implemented first; memory is refused in production) | Lead persistence refused in production |
   | `BLUEPRINT_LEAD_RECIPIENT` | 2 | Internal lead-notification recipient | Same hardcoded fallback as above |

   Keep local dev in sync with `vercel env pull`.
3. **Preview deploy:** `vercel` (or push a branch once Git is connected) → run the owner smoke tests on the preview URL. **Caveat:** preview builds run with `NODE_ENV=production`, so all production gates apply on previews too — the BluePrint mock adapter will refuse. To demo the mock flow on previews, the gates in `lib/server/blueprint/{ai,leads}.ts` and `config.ts` would need to distinguish `VERCEL_ENV === "preview"` from `"production"` (small code change, not currently implemented).
4. **Production deploy:** `vercel --prod`, or merge to `main` with the Git integration (every push to `main` then auto-deploys production).
5. **Domain:** add `arizmilabs.com` and `www.arizmilabs.com` in Project → Settings → Domains; make `www` primary so it matches `SITE_URL` (apex will redirect). Follow the DNS instructions Vercel shows (A/ALIAS for apex, CNAME for www).
6. **Post-deploy verification:** `robots.txt` and `sitemap.xml` resolve with the right host; OG image renders (paste a URL into a social debugger); contact form delivers to the intended inbox; security headers present (`curl -I`); Analytics events appear in the dashboard.

### Platform notes

- All routes are static, so hosting cost and cold-start exposure are minimal; only form submissions invoke functions (Fluid Compute, Node runtime — Nodemailer works as-is).
- The in-memory rate limiters and lead store do not survive across function instances — this is why Phase 2 items 3–4 exist. The contact form's limiter being best-effort is an acceptable Phase 1 risk (the honeypot still filters bots).
- When implementing the real AI adapter, keep keys server-side via env vars only; `lib/server/` modules already import `server-only` so leakage is a build error.
