---
id: TASK-015
title: Implement the Services page
depends_on: [TASK-001, TASK-002, TASK-003, TASK-004]
status: ready_with_booking_config
---

# Objective

Build the Services route with exact source copy, accessible service disclosures, and a clear BluePrint handoff.

# Required context

- [`../specs/services.md`](../specs/services.md)
- Shared service data from TASK-002 and disclosure primitive from TASK-004

# Scope

- Implement hero, copy, booking CTA, `What we do / Services` heading structure, six service items, and BluePrint closing section.
- Render full `Includes` and `Best for` lists from shared typed data.
- Create the accordion behavior inspired by the reference without copying it.
- Add route metadata and suitable internal links.
- Use centralized booking/BluePrint destinations.

# Acceptance criteria

- Copy, lists, and labels match the spec.
- Homepage summaries and Services details use one data source.
- Disclosure state is keyboard/touch accessible and readable without motion.
- Page works at 320 px, 200% zoom, and reduced motion.
- Missing booking config has intentional non-production behavior.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
