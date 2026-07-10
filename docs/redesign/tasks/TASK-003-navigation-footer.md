---
id: TASK-003
title: Implement global navigation and minimal footer
depends_on: [TASK-001, TASK-004]
status: ready_with_decision_gates
---

# Objective

Replace the floating pill navigation with the logomark/menu system and add a restrained shared footer based on the written brief.

# Required context

- [`../specs/global.md`](../specs/global.md)
- Decisions D-13, D-14, and D-18 in [`../SOURCE-OF-TRUTH.md`](../SOURCE-OF-TRUTH.md)
- `components/Nav.tsx`, `app/layout.tsx`, and the shared interaction primitives

# Scope

- Implement top-left logomark and top-right minimal menu trigger across routes.
- Build a card-black open menu containing the five primary links, secondary Careers/Get in touch actions when valid, and the supporting line.
- Add current-route semantics, keyboard navigation, focus trap/restoration, Escape close, body scroll lock, and reduced-motion behavior.
- Add a shared minimal footer using only confirmed content. Mark or omit unresolved Careers/legal destinations according to D-13/D-14.
- Ensure the nav remains readable over warm and dark surfaces.

# Out of scope

- Recreating Rive & Limn pixel-for-pixel without a supplied reference.
- Creating empty Careers or Privacy pages.
- Final booking/contact integration, owned by TASK-017.

# Acceptance criteria

- Every valid route is reachable from the menu and the active route is announced.
- No background element can receive focus while the modal-style menu is open.
- Escape and link activation close the menu and restore sensible focus.
- Menu/footer do not contain fake URLs or invented company data.
- Mobile safe-area insets and 200% zoom do not clip controls.

# Validation

- Run `npm run ci`.
- Test mouse, keyboard-only, touch-size viewport, Escape, back/forward navigation, and reduced motion on at least `/` and `/about`.

