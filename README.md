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

All server env reads centralize in `lib/server/config.ts` (plus provider selectors in `lib/server/blueprint/`). Unconfigured features fail closed with a disabled state.

| Variable | Purpose |
|---|---|
| `BOOKING_URL` | Booking CTA destination (falls back to `NEXT_PUBLIC_CALENDLY_LINK`) |
| `PRIVACY_POLICY_URL` | Consent link; production lead capture is blocked until configured |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Shared SMTP identity for all outbound email |
| `CONTACT_RECIPIENT` | Contact form recipient override |
| `BLUEPRINT_LEAD_RECIPIENT` | BluePrint lead notification recipient override |
| `BLUEPRINT_AI_PROVIDER` | AI provider selector (dev mock refuses to run in production) |
| `LEAD_STORAGE` | Lead persistence selector (in-memory dev adapter refuses production) |

## Deployment

Deploy to Vercel or any platform supporting Next.js:

```bash
npm run build
npm run start
```

Fonts are self-hosted — no external network fetches required during build. Security headers (CSP, X-Frame-Options, etc.) are set in `next.config.ts`.

## Release Checklist

1. `npm run ci` passes
2. Lighthouse: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95
3. Manual check on mobile and desktop
4. Verify security headers via response headers
