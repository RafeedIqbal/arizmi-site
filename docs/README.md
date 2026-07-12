# Arizmi Labs site documentation

The 2026 redesign described in the [Arizmi Labs website brief](https://docs.google.com/document/d/1X_7Q1O-kl6DjNw7rXmlaWj18yjpy45b78S-5mGQ9Trs/edit?usp=sharing) is fully implemented on `main`. The bounded task files that drove the implementation were removed after completion (2026-07-13); see git history before commit `01e5d68` if you need them.

## What lives here

| File / directory | Purpose |
| --- | --- |
| [`PRODUCTION.md`](./PRODUCTION.md) | What remains to reach production, and the Vercel deployment runbook. Start here. |
| [`SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md) | Captured brief, brand foundation, asset inventory, external references, and the open-decision registry (D-01–D-18). |
| [`runtime-assets.md`](./runtime-assets.md) | Mapping from supplied originals in `public/New_Assets/` to the URL-safe runtime aliases in `public/assets/arizmi/`. |
| [`specs/`](./specs/) | Per-page content specifications preserving the Google Doc brief verbatim (global, homepage, builds, blueprint-ai, services, about). The approved copy source of truth. |
| [`reference-images/`](./reference-images/) | Layout reference images extracted from the brief. |

## Source precedence

When sources disagree, use this order:

1. a written decision in the Open decisions table in [`SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md)
2. the Google Doc redesign brief
3. files in [`public/New_Assets`](../public/New_Assets/)
4. the page specifications in [`specs/`](./specs/)
5. the current site implementation

## Standing rules

- Copy in `lib/content/` and `lib/blueprint/content.ts` is approved verbatim from the brief — do not edit it without owner sign-off.
- Never ship invented business facts (statistics, project URLs, legal links, team imagery). Unresolved inputs fail closed behind the decision gates listed in `SOURCE-OF-TRUTH.md`.
- Validation is `npm run ci` (lint + typecheck + build). No automated tests are written or run; the owner smoke-tests manually at release time (checklist in `PRODUCTION.md`).
