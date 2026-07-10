---
id: TASK-009
title: Implement featured Builds slider and detail panel
depends_on: [TASK-008]
status: ready_with_placeholders
---

# Objective

Present the eight featured builds as a premium browseable sequence with a minimal closed card and complete accessible detail state.

# Scope

- Build the featured sequence using the normalized data and current filter results.
- Closed card shows only project name and status label.
- Opening a card shows status, visibility, capabilities, summary, Arizmi contribution, and CTA in an adjacent panel, in-flow region, dialog, or drawer appropriate to the viewport.
- Provide named previous/next controls, slide position context, keyboard selection, touch drag if stable, click-versus-drag protection, Escape close where relevant, and focus management.
- Use neutral project-labeled media placeholders pending D-07; preserve final media aspect-ratio slots.
- Keep parallax subtle and disable it for reduced motion.
- If filtering removes the selected project, close or move selection predictably.

# Out of scope

- Inventing project screenshots or enabling missing URLs.
- Copying the Framer component implementation.

# Acceptance criteria

- All eight featured projects are reachable without drag gestures.
- Detail content is complete and focus does not jump unpredictably.
- Protected builds have no navigable CTA.
- Placeholders are consistent, labeled, and cause no layout shift.
- The component works as a static list/detail interface with motion disabled.

# Validation

- Run `npm run ci`.
- Test every filter with open/closed state, keyboard, touch, Escape, 320 px, 200% zoom, and reduced motion.

