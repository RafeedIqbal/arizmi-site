---
id: TASK-013
title: Implement the BluePrint lead gate, consent, and persistence
depends_on: [TASK-011, TASK-012]
status: production_blocked_by_decisions
---

# Objective

Add the post-diagnosis lead gate and persist one validated lead record per successful submission, with consent tracked separately and safely.

# Required context

- Lead-gate and internal-record sections in [`../specs/blueprint-ai.md`](../specs/blueprint-ai.md)
- Decisions D-02, D-04, and D-16
- `lib/formGuard.tsx`, `lib/guardSubmission.ts`, and `app/actions/contact.ts`

# Scope

- Add name, email, phone, company, role, budget range, timeline, optional marketing consent, and linked Privacy Policy copy.
- Validate client-side and server-side with the shared schema.
- Track consent boolean, timestamp, and consent-copy/version independently of required service/contact processing.
- Define a lead repository interface and a development adapter; implement the production adapter only after D-04.
- Persist qualifying answers, guided intake, diagnosis, full plan, recommendation, submission time, and prompt/schema versions.
- Add idempotency so refresh/retry cannot create duplicate leads or trigger duplicate full-plan generations.
- Add production-capable abuse/rate limits before enabling costly generation.
- Escape/normalize inputs at output boundaries without destroying the original validated text needed for the plan.

# Out of scope

- Final email/PDF delivery UI, marketing automation, or a generic admin dashboard.

# Acceptance criteria

- Name and email block continuation when invalid; marketing consent never does.
- Consent state is auditable and not inferred from form completion.
- Persistence failures retain the user's local flow state and offer a safe retry.
- One idempotency key maps to one lead record.
- Production cannot start with a dev-only storage adapter or placeholder Privacy Policy.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
