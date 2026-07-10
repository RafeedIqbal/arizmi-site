---
id: TASK-005
title: Implement the homepage rotary archive hero
depends_on: [TASK-001, TASK-002, TASK-004]
status: ready_with_seed_data
---

# Objective

Replace the current particle/text-glow hero with the full-viewport product-archive composition and its bounded rotary card interaction.

# Required context

- Hero section in [`../specs/homepage.md`](../specs/homepage.md)
- Preserved hero mockups in `../reference-images`
- Production card backs and normalized Builds data
- `components/HeroSection.tsx`, `components/TextGlowHero.tsx`, and `lib/motion.ts`

# Scope

- Implement exact headline, supporting copy, CTA labels, logo/menu positioning, and full-viewport layout.
- Lay cards along a mathematically broad offscreen-right arc driven by one active index.
- Support bounded wheel/trackpad input over the archive, pointer/touch drag, keyboard previous/next, and explicit controls.
- Avoid page-scroll trapping: only consume input when the intent is to move the archive, and allow vertical page progression at bounds or outside the interaction region.
- Implement hover/focus lift, selected-card detach, front reveal, background archive softening, and close/return.
- Render project fronts from Builds data. Use a documented seed subset pending D-08/D-09.
- Provide mobile composition and reduced-motion alternative with the same content and controls.
- Remove obsolete hero-only code after confirming it has no remaining consumer.

# Out of scope

- Builds page filtering, final project URLs, or inventing card-front impact data.
- Embedding Framer components.

# Acceptance criteria

- Hero copy and teal full stop match the spec.
- All three production card-back types appear and retain correct aspect ratio.
- Selection is never triggered accidentally after a drag.
- A keyboard user can browse, open, read, close, and continue down the page.
- Touch users can still scroll the page naturally.
- Reduced motion removes large rotation/flip without removing functionality.
- No continuous animation runs when the hero is offscreen.

# Validation

- Run `npm run ci`.
- Manually test 320 × 568, 768 × 1024, 1440 × 900, and a wide desktop.
- Test mouse wheel, precision trackpad, drag, touch drag, keyboard, Escape, zoom 200%, and reduced motion.
- Inspect for layout shift, dropped frames, hydration errors, and horizontal overflow.

