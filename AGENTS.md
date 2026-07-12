# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router marketing site for Arizmi Labs with five routes (`/`, `/builds`, `/blueprint-ai`, `/services`, `/about`). Route files live in `app/` (`page.tsx`, `layout.tsx`, `robots.ts`, `sitemap.ts`, server actions). Reusable UI lives in `components/` (shared chrome, per-page directories, and accessible primitives in `components/ui/`). Typed page copy/data lives in `lib/content/`, browser-safe BluePrint logic in `lib/blueprint/`, and server-only config/adapters in `lib/server/`. Static assets and self-hosted fonts live in `public/`. Design specs, the decision registry, and the production plan are kept in `docs/`, and verification is done with manual smoke testing.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run dev` starts the local dev server at `http://localhost:3000`.
- `npm run build` creates the production build.
- `npm run start` serves the production build locally.
- `npm run lint` runs ESLint against the codebase.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run ci` runs the full validation pipeline: lint, typecheck, and build.

## Coding Style & Naming Conventions
Use TypeScript and React function components throughout. Follow the existing structure: route files use Next.js conventions (`page.tsx`, `layout.tsx`), and component files use PascalCase (`HomeHero.tsx`). Prefer 2-space indentation and keep imports grouped at the top. Styling is handled with Tailwind CSS v4 plus `app/globals.css` custom properties; keep reusable tokens in CSS variables instead of hard-coding repeated values. Run `npm run lint` before opening a PR.

## Testing Guidelines
Manual smoke testing is the current verification approach. For any user-visible behavior change, check key flows by hand, especially navigation, modal flows, section rendering, and mobile/desktop responsiveness. Use `npm run ci` before merging.

## Commit & Pull Request Guidelines
Recent history includes descriptive commits like `Update HeroSection.tsx`, but also unhelpful subjects like `.`. Use short, imperative commit messages that state the change clearly, for example `Refine hero CTA copy`. PRs should include a brief summary, linked issue when applicable, and before/after screenshots for UI changes. Note any SEO, metadata, animation, or test-impacting changes explicitly.
