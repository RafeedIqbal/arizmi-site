---
id: TASK-004
title: Build shared accessible interaction and motion primitives
depends_on: [TASK-001]
status: ready
---

# Objective

Provide the small reusable primitives needed by the menu, archive, disclosures, team details, and BluePrint flow so page tasks do not reimplement accessibility and motion behavior inconsistently.

# Scope

- Create shared button/link variants, metadata labels, section containers, focus styles, and visually hidden/live-region utilities.
- Create an accessible dialog/drawer primitive with focus containment/restoration, Escape handling, labelled title/description, portal behavior, and scroll locking.
- Create a disclosure/accordion primitive using button semantics and stable IDs.
- Create reusable previous/next controls and a roving-focus or selection helper only if the actual consumers require it.
- Add a React-safe reduced-motion hook that updates when the media query changes; keep the existing GSAP utility compatible.
- Establish utilities for click-versus-drag thresholds and bounded index math if used by the archive.

# Out of scope

- Page-specific layouts or animation choreography.
- Adding a component library unless a downstream requirement clearly justifies it.

# Acceptance criteria

- Primitives work without animation and expose correct ARIA state.
- Opening nested page UI does not leak body scroll locks or event listeners.
- Server components can consume presentational primitives without unnecessary client boundaries.
- Styles are token-driven and work on warm off-white and card black.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
