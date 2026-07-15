# Arizmi

Marketing site for Arizmi Labs — a technical co-founder service that builds start-up apps and websites.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens in `app/globals.css`)
- **Animation:** CSS transitions + GSAP/ScrollTrigger, gated on `prefers-reduced-motion`
- **Email:** Nodemailer over Gmail SMTP (contact form + BluePrint delivery)
- **Testing:** Manual smoke testing (no automated test suite)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run ci` | Full CI pipeline: lint + typecheck + build |

## Project Structure

```
app/
  layout.tsx        Root layout (self-hosted fonts, metadata)
  page.tsx          Home page
  builds/           Portfolio archive with filters
  blueprint-ai/     Multi-step AI intake flow (BluePrint)
  services/         Services accordion
  about/            About page (team, stats, ticker)
  actions/          Contact form server action
  globals.css       Design tokens + Tailwind v4 theme
  robots.ts         Robots.txt generation
  sitemap.ts        Sitemap generation
components/
  ui/               Shared accessible primitives (Button, Dialog, Disclosure, ...)
  home|builds|blueprint|about|services/  Per-page components
  SiteNav, SiteMenu, SiteFooter, PageShell, ContactModal, ...
lib/
  site.ts           Canonical origin + route map
  content/          Typed page copy and data (approved verbatim)
  blueprint/        Browser-safe BluePrint flow, schemas, validation
  server/           Server-only config and BluePrint AI/leads/email adapters
public/
  fonts/            Self-hosted Manrope + Space Mono (WOFF2)
  assets/arizmi/    Runtime-ready brand assets
docs/
  brand-source/     Supplied brand masters (kept outside the web root)
  reference-*/      Legacy artwork and layout references
```

## Environment Variables

All server env reads centralize in `lib/server/config.ts` (plus provider selectors in `lib/server/blueprint/{ai,leads}.ts`). Unconfigured features fail closed with a disabled state. See `example.env` for a copy-ready template with setup notes.

| Variable | Purpose |
|---|---|
| `BOOKING_URL` | Booking CTA destination (falls back to `NEXT_PUBLIC_CALENDLY_LINK`) |
| `PRIVACY_POLICY_URL` | Optional override of the built-in `/privacy` page with an external policy URL |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Shared SMTP identity for all outbound email |
| `CONTACT_RECIPIENT` | Contact form recipient override |
| `BLUEPRINT_LEAD_RECIPIENT` | BluePrint lead notification recipient override |
| `BLUEPRINT_AI_PROVIDER` | AI provider selector — `gemini` is wired; dev falls back to a mock that refuses to run in production |
| `GEMINI_API_KEY` / `BLUEPRINT_AI_MODEL` | Google AI Studio key + optional model override (default `gemini-2.5-flash`) |
| `LEAD_STORAGE` | Lead persistence selector — `upstash` is wired; the in-memory dev adapter refuses production |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis for lead storage + shared rate limiting (`KV_REST_API_URL` / `KV_REST_API_TOKEN` accepted as fallbacks) |
| `GOOGLE_SHEETS_CLIENT_EMAIL` / `GOOGLE_SHEETS_PRIVATE_KEY` / `GOOGLE_SHEETS_SPREADSHEET_ID` | Optional best-effort Google Sheets lead mirror (service account) |

## Deployment

Deploy to Vercel or any platform supporting Next.js:

```bash
npm run build
npm run start
```

Fonts are self-hosted — no external network fetches required during build. Security headers (CSP, X-Frame-Options, etc.) are set in `next.config.ts`. The full go-live checklist (Vercel env setup, Upstash provisioning, Google Sheet + service account, Gemini key, copy sign-off) lives in `docs/PRODUCTION.md`.

## Release Checklist

1. `npm run ci` passes
2. Lighthouse: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95
3. Manual check on mobile and desktop
4. Verify security headers via response headers
