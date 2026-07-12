---
id: TASK-012
title: Implement structured BluePrint AI diagnosis and plan generation
depends_on: [TASK-011]
status: provider_decision_required_for_production
---

# Objective

Build server-only, provider-agnostic structured generation for the first diagnosis and full BluePrint, with validation and safe failure handling.

# Required context

- AI sections in [`../specs/blueprint-ai.md`](../specs/blueprint-ai.md)
- Decision D-03
- Current Next.js version and official provider/SDK documentation once chosen

# Scope

- Define strict schemas for diagnosis, conversion classification, and the 11-section full plan.
- Create versioned server-only prompt templates that delimit untrusted input and ban the source's vague phrases.
- Create a provider adapter, timeout/abort path, bounded retries, request-size limits, and structured error types.
- Implement diagnosis generation and regeneration after added detail.
- Implement full-plan generation behind a server boundary, but do not expose it before lead-gate authorization.
- Validate every model response before display/persistence; return user-safe recovery states.
- Log identifiers/timing/error categories without raw sensitive answers.

# Out of scope

- Selecting a production provider without D-03, lead storage, user email, or PDF rendering.

# Acceptance criteria

- Prompts and credentials cannot enter client bundles.
- Arbitrary Markdown or HTML is never treated as the data contract.
- Invalid output produces a retry/edit path and cannot be stored as successful.
- Recommended next step uses a finite validated enum.
- The UI can switch between mock and real adapters by explicit environment configuration, never silent fallback in production.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
