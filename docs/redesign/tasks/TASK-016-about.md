---
id: TASK-016
title: Implement the About page with explicit content gates
depends_on: [TASK-001, TASK-002, TASK-003, TASK-004]
status: ready_with_omissions_or_placeholders
---

# Objective

Build the About route's story, principles, team details, ticker, and closing CTA without presenting unverified stats, images, or claims as facts.

# Required context

- [`../specs/about.md`](../specs/about.md)
- Decisions D-10, D-11, and D-12
- Preserved About layout reference and typed team data

# Scope

- Implement exact hero, Why Arizmi, principles, team intro/bios/focus areas, ticker phrase, and closing CTA.
- Build the stats layout only after values are approved; otherwise omit values or use development-only labeled placeholders that cannot ship.
- Use approved team images when supplied; until then use a restrained typographic placeholder, not stock people.
- Provide compact team cards and accessible `Read more` detail dialog/panel.
- Implement ticker with one semantic phrase, pause-on-interaction, and no continuous movement for reduced motion.
- Add metadata title `About Arizmi Labs`.

# Out of scope

- Inventing statistics, awards evidence, portraits, or a Careers section.

# Acceptance criteria

- All four bios and focus areas match the spec.
- No mockup statistic is shipped as fact.
- Full bio detail is keyboard/touch accessible with correct focus management.
- Ticker does not duplicate screen-reader text and can be paused.
- Missing media is intentional and documented.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
