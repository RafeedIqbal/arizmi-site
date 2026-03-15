# Arizmi

Marketing site for Arizmi — a technical co-founder service that builds start-up apps and websites.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Animation:** GSAP + ScrollTrigger
- **Testing:** Manual smoke testing

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
  layout.tsx       Root layout (fonts, metadata)
  page.tsx         Home page
  globals.css      Design tokens + Tailwind config
  robots.ts        Robots.txt generation
  sitemap.ts       Sitemap generation
components/
  Nav.tsx           Floating pill navbar
  HeroSection.tsx   Full-viewport hero with scroll animation
  ServicesSection.tsx  Word-by-word text highlight
  ProofSection.tsx    Overlapping card stack
  HowItWorksSection.tsx  Vertical timeline
  WhyChooseUsSection.tsx  Feature grid with reveal
  ContactSection.tsx  CTA section
  ContactModal.tsx    Contact form modal
lib/
  motion.ts        Shared GSAP/ScrollTrigger setup
public/
  fonts/           Self-hosted Inter + Instrument Serif
```

## Deployment

Deploy to Vercel or any platform supporting Next.js:

```bash
npm run build
npm run start
```

Fonts are self-hosted — no external network fetches required during build.

## Release Checklist

1. `npm run ci` passes
2. Lighthouse: Performance >= 85, Accessibility >= 95, Best Practices >= 95, SEO >= 95
3. Manual check on mobile and desktop
4. Verify security headers via response headers
