---
id: TASK-018
title: Complete redesign release QA, performance, accessibility, and SEO
depends_on: [all_release_tasks]
status: final_gate
---

# Objective

Verify the integrated redesign as a release candidate and fix only integration/quality issues discovered during the pass; route substantial feature defects back to their owning task.

# Automated validation

- Run `npm run ci` from a clean working tree state that includes all intended files.
- Add/run unit or integration tests introduced by BluePrint and content-schema tasks.
- Check production start, not just build output.
- Crawl the five routes for broken internal links, duplicate IDs, missing images, console errors, and unhandled server errors.

# Manual viewport/input matrix

Test at minimum:

- 320 × 568 mobile
- 390 × 844 mobile
- 768 × 1024 tablet
- 1366 × 768 short laptop
- 1440 × 900 desktop
- wide desktop
- browser zoom at 200%

For interactive areas, test mouse, precision trackpad, touch, keyboard-only, screen-reader landmarks/state, and `prefers-reduced-motion`.

# Required flows

- Open/close navigation, traverse every route, and restore focus.
- Browse/open/close hero cards while retaining normal page scroll.
- Activate all four process steps and six homepage/service disclosures.
- Apply every Builds filter; inspect all 12 project details; verify protected behavior.
- Complete BluePrint happy path, edit/regenerate path, validation errors, provider failure, persistence failure, email failure, duplicate submit, and all three conversion classifications.
- Open/close all team bios and pause/disable ticker motion.
- Exercise every booking, BluePrint, contact, Privacy, Careers, and project CTA.

# Accessibility and performance

- Target Lighthouse Accessibility, Best Practices, and SEO ≥ 95; Performance ≥ 85 on representative production builds, matching the repository release checklist.
- Confirm one H1 per page, logical heading order, landmarks, visible focus, correct names/descriptions/states, contrast, alt text, error announcements, and no keyboard traps.
- Confirm images have stable dimensions and appropriate formats, fonts are self-hosted/subset sensibly, and no motion loop runs offscreen.
- Profile hero/archive and featured slider for long tasks, forced layout, and excessive GPU/memory use.

# SEO/security/release checks

- Verify page titles/descriptions, canonical URLs, Open Graph/Twitter assets, sitemap, robots, and relevant public structured data.
- Ensure protected Builds data, AI prompts, secrets, and raw lead content are absent from client bundles and logs.
- Verify CSP/headers still support required self-hosted assets and server calls without broadening policy unnecessarily.
- Confirm every release-blocking decision in `SOURCE-OF-TRUTH.md` is resolved or the affected feature is explicitly excluded from launch.

# Acceptance criteria

- `npm run ci` and all added tests pass.
- No critical/serious accessibility issue, broken route, fake link, fabricated fact, lost form state, duplicate lead, or secret exposure remains.
- Known non-blocking issues are recorded with owner, severity, route, reproduction, and follow-up task.
- Before/after screenshots are captured for the eventual PR handoff.

