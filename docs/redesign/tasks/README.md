# Redesign task index

Each task is intentionally bounded for one AI implementation thread. A task is complete only when its acceptance criteria and validation steps pass; completing a dependency does not authorize starting its dependants in the same change.

## Dependency graph

```text
TASK-001 Brand foundation
├── TASK-002 Routes and content architecture
│   ├── TASK-005 Homepage hero archive
│   ├── TASK-006 Homepage process section
│   ├── TASK-007 Homepage remaining sections
│   ├── TASK-008 Builds data, taxonomy, and filters
│   │   ├── TASK-009 Featured Builds interaction
│   │   └── TASK-010 Compact Builds archive
│   ├── TASK-011 BluePrint form foundation
│   │   ├── TASK-012 BluePrint AI generation
│   │   └── TASK-013 BluePrint lead gate and persistence
│   │       └── TASK-014 BluePrint reveal and delivery
│   ├── TASK-015 Services page
│   └── TASK-016 About page
├── TASK-003 Navigation and footer
└── TASK-004 Shared interaction primitives

TASK-017 CTA, contact, and legal integration follows TASK-003 and all public pages.
TASK-018 release QA follows every task included in the release.
```

## Status checklist

| Task | Description | Dependencies | Decision gates | Status |
| --- | --- | --- | --- | --- |
| [TASK-001](./TASK-001-brand-foundation.md) | Brand assets, fonts, tokens | None | None | Ready |
| [TASK-002](./TASK-002-routes-content-architecture.md) | Route shells, shared content/config architecture | 001 | D-08 noted | Ready |
| [TASK-003](./TASK-003-navigation-footer.md) | Global menu and footer | 001, 004 | D-13, D-14, D-18 | Ready with placeholders |
| [TASK-004](./TASK-004-interaction-primitives.md) | Shared accessible motion/disclosure primitives | 001 | None | Ready |
| [TASK-005](./TASK-005-homepage-hero-archive.md) | Full-viewport rotary archive hero | 001, 002, 004 | D-08, D-09 | Ready with seed data |
| [TASK-006](./TASK-006-homepage-process.md) | Scroll-steps process section | 001, 002, 004 | None | Ready |
| [TASK-007](./TASK-007-homepage-sections.md) | BluePrint promo, build bento, closing CTA | 001–004 | D-01 | Ready with config |
| [TASK-008](./TASK-008-builds-data-filters.md) | Builds data, taxonomy, URL-state filters | 002, 004 | D-06, D-08 | Decision required for final labels |
| [TASK-009](./TASK-009-builds-featured.md) | Featured slider and detail panel | 008 | D-06, D-07 | Ready with approved placeholders |
| [TASK-010](./TASK-010-builds-archive.md) | Compact archive and responsive integration | 008, 009 | D-06 | Ready with disabled URLs |
| [TASK-011](./TASK-011-blueprint-form.md) | BluePrint flow, qualification, intake | 001, 002, 004 | None | Ready |
| [TASK-012](./TASK-012-blueprint-ai.md) | Server AI adapter, prompts, schemas | 011 | D-03 | Adapter ready; production provider blocked |
| [TASK-013](./TASK-013-blueprint-leads.md) | Gate, consent, lead storage | 011, 012 | D-02, D-04, D-16 | Interface ready; production blocked |
| [TASK-014](./TASK-014-blueprint-delivery.md) | Reveal, PDF/email, internal notification | 013 | D-01, D-05, D-17 | Production delivery blocked |
| [TASK-015](./TASK-015-services.md) | Services page and shared service data | 001–004 | D-01 | Ready with config |
| [TASK-016](./TASK-016-about.md) | About story, principles, team, ticker | 001–004 | D-10–D-12 | Ready with explicit omissions/placeholders |
| [TASK-017](./TASK-017-contact-cta-legal.md) | Central CTA config, contact, privacy/careers handling | 003, public pages | D-01, D-02, D-14, D-15 | Decisions required before production |
| [TASK-018](./TASK-018-qa-release.md) | CI, smoke, accessibility, performance, SEO | All release tasks | All release-blocking decisions | Final gate |

## Standard agent handoff

Every implementation thread should report:

- files changed
- behavior delivered
- decisions or placeholders used
- commands run and results
- manual viewport/input checks performed
- remaining risks or follow-up task IDs

