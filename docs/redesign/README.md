# Arizmi Labs redesign implementation pack

This directory converts the [Arizmi Labs website redesign brief](https://docs.google.com/document/d/1X_7Q1O-kl6DjNw7rXmlaWj18yjpy45b78S-5mGQ9Trs/edit?usp=sharing) into bounded, dependency-aware work for AI implementation.

The pack is documentation only. It does not authorize an agent to invent missing business content, pick production vendors, or deploy the site.

## How to use this pack

For each implementation task, give the agent this context in order:

1. [`AGENTS.md`](../../AGENTS.md)
2. this file
3. [`SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md)
4. the relevant file in [`specs/`](./specs/)
5. one task file from [`tasks/`](./tasks/)
6. the current code and assets named by that task

Run one task per AI thread or working branch. Do not ask an agent to “implement the redesign” as a single change: the hero interaction, archive, and BluePrint AI workflow each require isolated implementation and verification.

## Source precedence

When sources disagree, use this order:

1. a written decision added to the Open decisions table in [`SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md)
2. the Google Doc redesign brief
3. files in [`public/New_Assets`](../../public/New_Assets/)
4. the page specifications in this pack
5. the current site implementation

The current implementation is useful for reusable infrastructure, but its existing dark theme, Inter/Instrument Serif typography, copy, and single-page information architecture are superseded by the redesign brief.

## Work sequence

| Phase | Tasks | Outcome |
| --- | --- | --- |
| Foundation | `TASK-001`–`TASK-004` | Brand assets, tokens, routes, content models, shared interaction primitives |
| Marketing pages | `TASK-005`–`TASK-010`, `TASK-015`–`TASK-016` | Homepage, Builds, Services, and About |
| BluePrint AI | `TASK-011`–`TASK-014` | Guided intake, AI generation, lead capture, delivery, and reveal |
| Integration | `TASK-017`–`TASK-018` | CTA/contact wiring, accessibility, performance, SEO, and release QA |

See [`tasks/README.md`](./tasks/README.md) for the dependency graph and status checklist.

## Non-negotiable implementation rules

- Preserve approved copy exactly unless the task explicitly says copy may be edited.
- Treat Framer and Makora links as interaction/layout references, not code or assets to copy. Reimplement the behavior in the existing Next.js stack and verify any third-party licensing before reuse.
- Use the self-hosted Manrope and Space Mono files supplied in `public/New_Assets/Fonts`.
- Use the production card-back PNGs in `public/New_Assets`; the Google Doc mockups are visual references only.
- Keep animation usable with keyboard and touch, and provide a coherent `prefers-reduced-motion` state.
- Keep AI keys, SMTP credentials, database credentials, and prompt internals server-side.
- Do not ship invented About statistics, project URLs, legal URLs, case-study media, or team cards. Use an explicit, visually intentional placeholder only where the spec permits it.
- Run `npm run ci` for every implementation task. Also perform the manual checks named by the task.

## Definition of done for the redesign

- All five public routes render: `/`, `/builds`, `/blueprint-ai`, `/services`, and `/about`.
- Global navigation, booking, BluePrint, archive, and contact paths work on mobile and desktop.
- The homepage rotary archive remains understandable and operable with mouse, trackpad, touch, keyboard, and reduced motion.
- Builds filtering and details use one typed data source, with no contradictory labels.
- BluePrint AI validates every step, generates structured server-side output, stores the lead, records consent separately, sends the promised outputs, and handles failures without losing answers.
- Metadata, sitemap, robots, social previews, and canonical URLs reflect the new routes.
- No unresolved placeholder is presented as a verified fact.
- `npm run ci` passes and the smoke-test matrix in `TASK-018` is complete.

