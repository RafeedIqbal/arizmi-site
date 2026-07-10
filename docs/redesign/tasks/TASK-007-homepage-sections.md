---
id: TASK-007
title: Implement the remaining homepage sections
depends_on: [TASK-001, TASK-002, TASK-003, TASK-004]
status: ready_with_config
---

# Objective

Implement the BluePrint promo, expandable build categories, and closing booking CTA, then assemble the homepage in the specified order.

# Scope

- Add “Start with BluePrint” with exact two-paragraph copy and `/blueprint-ai` CTA.
- Add “What Arizmi builds” using the shared six-service data, short descriptions, accessible bento/disclosure behavior, and BluePrint CTA.
- Add “Good ideas deserve better systems” with exact copy and booking CTA.
- Replace obsolete homepage sections once their content has no remaining route consumer.
- Assemble hero, process, these sections, and footer with consistent spacing and section landmarks.
- Use centralized booking config; expose a clear non-production fallback pending D-01.

# Out of scope

- Full Services page details, BluePrint form behavior, and contact modal decisions.

# Acceptance criteria

- Homepage order and copy match the spec.
- Service summaries come from the same source as `/services`.
- Expandable cards operate with keyboard and touch and remain readable when JavaScript/motion is unavailable.
- All CTAs have correct labels and destinations/fallback state.
- Removed components are not referenced by the build.

# Validation

- Run `npm run ci`.
- Smoke-test all homepage CTAs, disclosure states, mobile wrapping, 200% zoom, and reduced motion.

