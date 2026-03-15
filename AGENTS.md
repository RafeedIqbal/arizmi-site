# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router marketing site for Arizmi. Route files live in `app/` (`page.tsx`, `layout.tsx`, `robots.ts`, `sitemap.ts`). Reusable UI sections live in `components/` and are imported into `app/page.tsx`. Shared motion setup lives in `lib/motion.ts`. Static assets and self-hosted fonts live in `public/`. End-to-end coverage lives in `tests/`, and design reference files are kept in `sitedesign/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run dev` starts the local dev server at `http://localhost:3000`.
- `npm run build` creates the production build.
- `npm run start` serves the production build locally.
- `npm run lint` runs ESLint against the codebase.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run test:e2e` runs Playwright smoke tests.
- `npm run ci` runs the full validation pipeline: lint, typecheck, build, and e2e tests.

## Coding Style & Naming Conventions
Use TypeScript and React function components throughout. Follow the existing structure: route files use Next.js conventions (`page.tsx`, `layout.tsx`), component files use PascalCase (`HeroSection.tsx`), and tests use `*.spec.ts`. Prefer 2-space indentation and keep imports grouped at the top. Styling is handled with Tailwind CSS v4 plus `app/globals.css` custom properties; keep reusable tokens in CSS variables instead of hard-coding repeated values. Run `npm run lint` before opening a PR.

## Testing Guidelines
Playwright is the current test framework. Add or update smoke coverage in `tests/` for any user-visible behavior change, especially navigation, modal flows, and section rendering. Name tests by behavior, for example `contact modal opens and closes`. Use `npm run test:e2e` locally; use `npm run ci` before merging.

## Commit & Pull Request Guidelines
Recent history includes descriptive commits like `Update HeroSection.tsx`, but also unhelpful subjects like `.`. Use short, imperative commit messages that state the change clearly, for example `Refine hero CTA copy`. PRs should include a brief summary, linked issue when applicable, and before/after screenshots for UI changes. Note any SEO, metadata, animation, or test-impacting changes explicitly.
