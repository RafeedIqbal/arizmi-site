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

Next.js 15 app using the App Router, TypeScript, and Tailwind CSS.

- `app/` — App Router pages and layouts. `app/layout.tsx` is the root layout; `app/page.tsx` is the home route.
- `public/` — Static assets served at the root path.
- `next.config.ts` — Next.js configuration.
- `tailwind.config` is inlined via PostCSS (`postcss.config.mjs`).

New routes are created by adding `page.tsx` files inside subdirectories of `app/`. Shared UI should live in a `components/` directory (not yet created).
