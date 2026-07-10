---
id: TASK-017
title: Integrate booking, contact, consent, privacy, and secondary destinations
depends_on: [TASK-003, TASK-005, TASK-007, TASK-010, TASK-014, TASK-015, TASK-016]
status: production_decisions_required
---

# Objective

Remove CTA drift and placeholder-link ambiguity across the redesigned site, then harden the existing contact path for the approved launch behavior.

# Required context

- Decisions D-01, D-02, D-14, and D-15
- All CTA vocabulary in [`../specs/global.md`](../specs/global.md)
- Current contact modal, server action, SMTP configuration, and submission guard

# Scope

- Centralize browser-safe booking, BluePrint, contact, Careers, and Privacy destinations with validated environment/config handling.
- Audit every CTA label and destination across all routes.
- Decide whether `Get in touch` opens the existing modal, navigates to a route/section, or uses another approved channel; implement one consistent behavior.
- Update contact recipient/sender configuration, validation, escaping, error states, and deployment-safe rate limiting as required by D-15.
- Add a Privacy route only with approved content; otherwise block the production BluePrint gate.
- Hide Careers until a valid destination exists or implement the approved link.
- Prevent empty `href="#"`, fake external URLs, and silent no-op controls.

# Out of scope

- Drafting legal policy text or choosing business destinations without approval.

# Acceptance criteria

- Every interactive CTA has one verified destination or an explicit disabled/configuration state.
- Contact and BluePrint emails use approved recipients/senders and server-only secrets.
- Privacy/consent behavior is production-valid before BluePrint launch.
- No Careers/Privacy page is indexed while empty.
- External links use appropriate target/rel behavior and do not leak referrer data unnecessarily.

# Validation

- Run `npm run ci`.
- Crawl/click every header, footer, page, archive, team, contact, and BluePrint action in configured and missing-config environments.

