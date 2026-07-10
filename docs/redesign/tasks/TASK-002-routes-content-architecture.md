---
id: TASK-002
title: Create route shells and shared content architecture
depends_on: [TASK-001]
status: ready
---

# Objective

Create the public route structure and typed content/config modules that downstream page tasks can consume, without implementing complex interactions.

# Required context

- All files in [`../specs`](../specs/)
- `app/page.tsx`, `app/layout.tsx`, `app/sitemap.ts`, and current components

# Scope

- Add route shells for `/builds`, `/blueprint-ai`, `/services`, and `/about` with route metadata and a shared page shell.
- Establish typed modules for service content, team content, Builds entries, navigation, and centralized CTA/config destinations.
- Transcribe approved content from the specs exactly; add source comments only where they help resolve D-08 or another explicit decision.
- Model Builds status, visibility, capabilities, filter categories, featured state, and CTA separately so taxonomy conflicts are not hidden.
- Keep server-only configuration separate from browser-safe content.
- Add route-level loading/error boundaries only where they are meaningful; do not add fake loading screens to static pages.
- Prepare sitemap entries for the five defined routes.

# Out of scope

- Final page design, filters, sliders, BluePrint logic, database, AI, email, or PDF generation.
- Careers/privacy routes without approved content.

# Acceptance criteria

- All five routes compile and render an intentional semantic shell.
- Repeated content exists once and is exported with strict TypeScript types.
- Protected/public Builds fields cannot be confused by the type model.
- No server secret or environment value is imported into a client component.
- Metadata and sitemap use the defined routes and canonical base.

# Validation

- Run `npm run ci`.
- Visit all five routes directly and via client navigation; verify no 404, hydration error, or duplicate H1.

