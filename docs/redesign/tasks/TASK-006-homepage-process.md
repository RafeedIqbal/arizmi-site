---
id: TASK-006
title: Implement “How ideas become systems”
depends_on: [TASK-001, TASK-002, TASK-004]
status: ready
---

# Objective

Build the four-step homepage process narrative with progressive scroll activation that remains readable as ordinary content.

# Scope

- Render the exact title, numbered step labels, and descriptions from the homepage spec.
- Create a wide-screen sequential activation/pinned treatment inspired by Scroll Steps when viewport height permits.
- Render a simple stacked flow on mobile, short viewports, reduced motion, and no-JavaScript initial output.
- Keep all four steps present in DOM reading order and never visually blur essential inactive content below legibility.
- Scope and clean up any ScrollTrigger instances.

# Out of scope

- Reusing the current three-step timeline copy.
- Adding a new scroll library.

# Acceptance criteria

- All four source steps are visible and ordered correctly.
- The section never traps scroll or leaves blank pinned space on orientation change.
- Active-step styling is supplementary and keyboard/screen-reader users receive the full content.
- Reduced motion uses no pin/scrub animation.

# Validation

- Run `npm run ci`.
- Test mobile portrait/landscape, short laptop viewport, browser resize, back navigation, and reduced motion.

