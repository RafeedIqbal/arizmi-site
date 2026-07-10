---
id: TASK-010
title: Complete the compact Builds archive and page integration
depends_on: [TASK-008, TASK-009]
status: ready_with_disabled_urls
---

# Objective

Add the four compact archive entries, finish the page composition, and make the complete Builds experience resilient across viewport, input, and metadata states.

# Scope

- Render Private CRM System, Private AI System, Clinic Conversion Concept, and Growth Map Diagnostic below the featured area.
- Closed state contains project name and status only; activation expands details directly underneath.
- Use accessible single- or multi-open disclosure behavior and document the choice.
- Integrate page hero, CTAs, heading, filters, featured section, compact archive, empty state, and footer.
- Add route metadata and appropriate structured data only for public factual content.
- Keep missing public CTAs disabled/annotated until D-06.

# Acceptance criteria

- All four compact entries expose every approved detail from the spec.
- Expanding one row never causes another row's content to be announced incorrectly.
- Filter, featured selection, and compact disclosure state do not conflict.
- Page layout remains stable at 320 px, 200% zoom, and reduced motion.
- Metadata does not expose protected project details beyond approved copy.

# Validation

- Run `npm run ci`.
- Smoke-test all 12 entries and six filters with keyboard, pointer, touch viewport, copied URL, refresh, and back/forward.

