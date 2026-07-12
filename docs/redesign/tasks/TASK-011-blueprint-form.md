---
id: TASK-011
title: Build the BluePrint AI form foundation, qualification, and intake
depends_on: [TASK-001, TASK-002, TASK-004]
status: ready
---

# Objective

Implement the client-visible BluePrint route through guided intake with robust typed state, validation, navigation, and accessibility, using a deterministic mock transition instead of production AI.

# Required context

- [`../specs/blueprint-ai.md`](../specs/blueprint-ai.md)
- Existing form guard and contact patterns for lessons, not direct reuse without review

# Scope

- Build hero/start state, named progress indicator, qualifying questions, and all ten guided-intake questions.
- Define shared schemas/types and configuration for answers; do not hard-code questions across multiple components.
- Default qualifying groups to single-select; implement the `Other` audience detail.
- Add back/next, validation, error summary, per-field errors, focus movement, and answer persistence within the flow.
- Define a flow state machine or reducer that prevents impossible step transitions.
- Add a development-only deterministic mock diagnosis so the UI can proceed to the diagnosis review boundary without an AI key.
- Decide and document whether refresh persistence is disabled or uses privacy-conscious session storage.

# Out of scope

- Production AI, lead fields, database, email, PDF, and booking conversion.

# Acceptance criteria

- Every source question and option is present exactly once.
- Keyboard and screen-reader users can identify the step, group labels, selection state, required fields, and errors.
- Back navigation preserves valid answers and changing an earlier answer invalidates stale downstream generated state.
- No user answer is placed into raw HTML.
- The mocked boundary is impossible to confuse with a production result.

# Validation

- Run `npm run ci`.
- Manual smoke testing is performed by the owner at the end of the release; do not add or run tests in this task.
