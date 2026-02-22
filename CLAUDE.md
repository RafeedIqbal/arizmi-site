# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

Next.js 15 app using the App Router, TypeScript, and Tailwind CSS v4.

- `app/` — App Router pages and layouts. `app/layout.tsx` is the root layout; `app/page.tsx` is the home route.
- `app/globals.css` — CSS custom properties (dark theme design tokens) and Tailwind v4 `@theme` config.
- `components/` — Shared UI components (Nav, section components, modals).
- `public/` — Static assets served at the root path.
- `next.config.ts` — Next.js configuration.
- `tailwind.config` is inlined via PostCSS (`postcss.config.mjs`).

New routes are created by adding `page.tsx` files inside subdirectories of `app/`. Shared UI lives in `components/`.

## Fonts

- **Inter** (`--font-inter`) — body text, nav, cards, headings with weight variation
- **Instrument Serif** (`--font-instrument-serif`) — section headlines (`fontFamily: "var(--font-instrument-serif)"`)

Both are loaded via `next/font/google` in `app/layout.tsx` as CSS variables applied to `<body>`.

## Design Tokens (CSS custom properties)

Defined in `app/globals.css` `:root`:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#06080d` | Page background |
| `--surface` | `#111318` | Card backgrounds |
| `--surface-alt` | `#1c1e24` | Elevated cards |
| `--border` | `rgba(255,255,255,0.08)` | Borders |
| `--text` | `#f0f0f0` | Primary text |
| `--text-muted` | `rgba(240,240,240,0.35)` | Secondary text |
| `--accent` | `#59b0ff` | Cyan accent color |
| `--accent-dim` | `rgba(89,176,255,0.15)` | Transparent accent backgrounds |

## GSAP / ScrollTrigger Pattern

All animated sections are `"use client"` components. The standard pattern:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger); // at module level

// Inside the component:
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // set up ScrollTriggers here
  }, rootRef); // scoped to rootRef element
  return () => ctx.revert(); // cleanup on unmount
}, []);
```

## Components

| File | Description |
|---|---|
| `Nav.tsx` | Fixed floating pill navbar, CSS-only (server component) |
| `HeroSection.tsx` | Full-viewport hero; GSAP scroll-shrink on `contentRef` |
| `ServicesSection.tsx` | Word-by-word text highlight; GSAP pinned ScrollTrigger timeline |
| `ProofSection.tsx` | Overlapping card stack; GSAP pinned with card y-offset animation |
| `HowItWorksSection.tsx` | Vertical timeline draw + 3 Calisto-style cards slide in from right |
| `WhyChooseUsSection.tsx` | 3×2 grid of feature boxes; React `useState` click-to-unblur |
| `ContactSection.tsx` | CTA section with Book a Call + Contact modal trigger |
| `ContactModal.tsx` | `createPortal` modal with name/email/message form |
