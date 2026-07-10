---
id: TASK-001
title: Establish brand assets, fonts, and design tokens
depends_on: []
status: ready
---

# Objective

Replace the current dark-theme foundation with reusable Arizmi redesign tokens and stable runtime assets, without redesigning page sections yet.

# Required context

- [`../SOURCE-OF-TRUTH.md`](../SOURCE-OF-TRUTH.md)
- [`../specs/global.md`](../specs/global.md)
- `app/layout.tsx`, `app/globals.css`, and `public/New_Assets`

# Scope

- Load self-hosted Manrope variable and Space Mono regular/bold through `next/font/local`; expose meaningful CSS variables.
- Define semantic tokens for canvas, card surface, text, muted text, borders, teal states, BluePrint, Concept, focus, success, warning, error, spacing, radii, shadows, and page widths.
- Create URL-safe runtime aliases under a clear `public/assets/arizmi` structure for the logo variants and three card backs. Preserve originals in `public/New_Assets`.
- Document the mapping between source and runtime filenames.
- Remove `.DS_Store` from the new asset tree and ensure it is ignored.
- Update global body selection/focus/base styles and Tailwind v4 theme variables.
- Keep temporary compatibility aliases only where needed to avoid breaking the current page before downstream replacements land.

# Out of scope

- Page layout changes, navigation behavior, hero interaction, and new routes.
- Converting or visually editing supplied assets.
- Inventing extra brand colors.

# Acceptance criteria

- Manrope is the default UI font and Space Mono can be selected with one semantic class/token.
- Runtime paths contain no spaces and all aliased images render with intrinsic dimensions.
- No component needs to repeat the eight raw brand colors.
- Default text/focus combinations meet WCAG AA contrast.
- The existing site still renders while downstream components are pending.
- Supplied source assets remain unchanged.

# Validation

- Run `npm run ci`.
- Inspect the root page at 320 px and 1440 px for font loading, missing assets, overflow, and unreadable compatibility styles.
- Confirm no `.DS_Store` appears in `git status`.

