---
id: TASK-014
title: Implement the BluePrint reveal, user delivery, and internal notification
depends_on: [TASK-013]
status: production_blocked_by_delivery_decisions
---

# Objective

Complete the BluePrint conversion experience: concise on-screen preview, diagnosis-dependent CTA, full user artifact, and internal lead notification.

# Required context

- Reveal, conversion, delivery, and lead-handling sections in [`../specs/blueprint-ai.md`](../specs/blueprint-ai.md)
- Decisions D-01, D-05, and D-17
- Existing Nodemailer server action and chosen persistence adapter

# Scope

- Render the six preview fields from validated structured output.
- Render the correct early-stage/build-ready/complex message from the validated classification.
- Wire `Book a call` to centralized booking config with no fake production URL.
- Generate the complete 11-section artifact in the approved formatted email/PDF design.
- Send the user artifact only after explicit action where the UI promises `Email me the full BluePrint`.
- Send an internal Arizmi notification containing the approved lead summary.
- Use durable idempotent delivery state with pending/sent/failed status and retry strategy; distinguish plan success from email failure.
- Escape user content, avoid email header injection, limit attachment size, and avoid exposing storage URLs publicly without authorization.
- Present clear success, partial-failure, and retry states.

# Out of scope

- Building a full CRM/admin product or making generated content a binding quote.

# Acceptance criteria

- Preview fields and conversion message exactly match validated output.
- Each user action sends at most one intended user email and one intended internal notification.
- A failed email does not discard the lead or regenerate the plan unnecessarily.
- The full artifact contains all 11 sections and readable hierarchy on mobile/email/PDF.
- Production delivery is blocked until sender, artifact, booking, and download decisions are resolved.

# Validation

- Run `npm run ci` plus email/document tests.
- Test all three classifications, email/PDF rendering, duplicate click, mail failure, retry, long content, missing booking config, and redacted logs.

