---
id: TASK-008
title: Finalize Builds data, taxonomy, and URL-state filtering
depends_on: [TASK-002, TASK-004]
status: decision_required_for_final_taxonomy
---

# Objective

Turn the 12 source entries into a normalized archive model and implement accessible, shareable filtering before adding advanced presentation.

# Required context

- [`../specs/builds.md`](../specs/builds.md)
- Decisions D-06 and D-08
- Builds content types created by TASK-002

# Scope

- Resolve or explicitly encode the difference between status/lifecycle, visibility, capability, and filter category.
- Populate all eight featured and four compact entries exactly once.
- Implement All, Live builds, AI systems, Web presence, Private builds, and Concepts filters.
- Store active filter in a validated query parameter; unknown values fall back to All without errors.
- Show an announced result count and intentional empty state.
- Keep public URLs optional until D-06; protected entries can never receive outbound URLs.
- Render a simple semantic archive list as the base UI consumed by TASK-009/TASK-010.

# Out of scope

- Featured parallax/slider presentation and final compact-row animation.

# Acceptance criteria

- All 12 entries pass type/schema validation and no content is duplicated across modules.
- Multi-capability projects appear in every correct filter.
- Back/forward and copied URLs restore the filter.
- Filter controls expose pressed/selected state and are not mislabeled as tabs if they are list filters.
- Protected CTAs render as status, not links.

# Validation

- Run `npm run ci`.
- Verify expected result sets for every filter, unknown query handling, no-JavaScript content, and keyboard operation.

