# Homepage specification

## Purpose

The homepage introduces Arizmi as a premium product and software studio, lets visitors interact with a product archive immediately, explains the build process, introduces BluePrint AI, establishes build capabilities, and closes on a direct booking action.

## Section order

1. Full-viewport hero and rotary archive
2. How ideas become systems
3. Start with BluePrint
4. What Arizmi builds
5. Good ideas deserve better systems
6. Global footer

## 1. Hero and rotary archive

### Approved copy

Headline:

> Welcome to Arizmi Labs.

The full stop is teal mid `#00AFA7`.

Supporting copy:

> For founders and teams building beyond the obvious. We shape ideas, build systems and ship digital products that need more than a dev shop.

Primary CTA: `Book a build call`

Secondary CTA: `Discover your BluePrint`

### Composition

- Fill the first viewport on desktop. On mobile, use a readable stacked flow with `min-height: 100svh`; the hero may extend beyond one viewport rather than clipping copy or the archive.
- Top-left: logomark only.
- Top-right: minimal menu icon.
- The visitor should feel that they have entered the Arizmi Labs product archive.
- The rotary archive enters from the right while the headline and CTAs retain a clear left-side reading area.

![Hero layout reference](../reference-images/hero-layout-concept.png)

### Card states

The initial state shows card backs only:

| State | Color | Production asset |
| --- | --- | --- |
| Live build | Arizmi mid teal | [`live.webp`](../../public/assets/arizmi/card-backs/live.webp) |
| BluePrint | Tech blue | [`blueprint.webp`](../../public/assets/arizmi/card-backs/blueprint.webp) |
| Concept | Deep violet | [`concept.webp`](../../public/assets/arizmi/card-backs/concept.webp) |

The lossless WebP derivatives preserve the supplied PNG pixels exactly: only the transparent outer canvas is cropped and a minimal transparent normalization canvas is added. Serve them without further image optimization, and render shadows against the artwork alpha rather than on a rectangular card wrapper.

![Archive card system reference](../reference-images/hero-archive-card-system.png)

### Geometry and motion

- On desktop, cards sit on a very large invisible wheel whose hub is beyond the right edge and vertically centered. Approximately 22 degrees between slots keeps at least five cards partially visible in a broad, elegant sweep rather than a tight circle.
- Decorative rings align with the same hub and fade before they compete with the copy column.
- Users can browse with vertical wheel input, the dominant horizontal or vertical trackpad delta, direction-locked horizontal dragging, and keyboard controls. Vertical touch movement remains available for normal page panning.
- Do not show previous/next buttons or a numeric counter. The archive itself remains focusable and exposes instructions, live announcements, Arrow, Page Up/Down, Home/End, Enter/Space, and Escape behavior.
- While an archive wheel/trackpad burst is active, keep the page position fixed and advance at a controlled rate of roughly one card every 220–240 ms. At the first or last card, consume the rest of that inertial burst; after about 140 ms of quiet, release the next outward gesture to normal page scrolling.
- Cards rotate radially along the curved path: upper cards slope down toward the right-side hub and lower cards slope up toward it. The active card is slightly more prominent; inactive cards remain partially visible.
- Motion is smooth, controlled, and bounded. Do not trap the page or create a fast prize wheel.
- Hover/focus may lift a card slightly, move it a few pixels toward the main canvas, add a subtle border glint, and slightly deepen its shadow.
- On click/tap/keyboard activation, distinguish selection from dragging. The selected card detaches, moves to the visible viewport center, flips to its front, and reveals qualitative project details.
- While selected, the remaining archive stays visible on the right but becomes softer, dimmer, or slightly out of focus.
- Escape or an explicit close/back control returns to the archive without losing the active index.
- Mobile keeps a functional arc/archive, but stacks copy and archive with a safe touch/scroll boundary.
- Reduced motion replaces large arc travel, hover lift, blur animation, and 3D flip with direct index changes and an immediate centered detail reveal.

Project-front content comes from the normalized Builds data and is limited to the archive state, project name, summary, `What Arizmi shaped`, capabilities, and a valid or deliberately disabled CTA. Do not duplicate the raw status label or invent quantitative impact claims.

D-09 approves this seven-card order: Rive & Limn, Icon Training App, ALPAC London, BluePrint AI, Clinic Conversion Concept, Basenote Solutions, and Private AI Formulation Tool. BluePrint AI is initially active. The current mapping remains: live builds use teal, concept builds use violet, and Product, Launch, or Private builds use tech blue while D-08 remains unresolved.

### Interaction references

- [Interactive Arc Deck](https://www.framer.com/community/marketplace/components/interactive-arc-deck/)
- [Arc Gallery Pro](https://www.framer.com/community/marketplace/components/arc-gallery-pro/)

## 2. How ideas become systems

Title: `How ideas become systems`

Show four sequential boxes:

1. `01 Shape the idea` — Turn the rough thought, workflow or opportunity into something clear enough to build.
2. `02 Create your BluePrint` — Map the users, features, journeys, risks and first version.
3. `03 Build the system` — Design and develop the product, platform, app or AI-enabled tool.
4. `04 Improve after launch` — Support, iterate and evolve the product once real users are involved.

Use [Scroll Steps](https://www.framer.com/community/marketplace/components/scroll-steps/) only as behavioral inspiration. Desktop may pin or progressively activate steps when there is enough vertical room; mobile must remain a normal readable flow. The active visual state is supplementary and cannot hide inactive text.

## 3. Start with BluePrint

Title: `Start with BluePrint`

Copy:

> Most ideas are not ready to build on day one. Arizmi BluePrint AI helps turn a rough idea, messy workflow or product opportunity into a clear product plan before development begins.

> It works like a Product Requirements Document (PRD), outlining what the product needs to do, who it is for, what should be built first, what could create complexity and what needs to be considered before anyone starts writing code.

CTA: `Start your BluePrint`

Link to `/blueprint-ai` and make this section a clear visual bridge from the process steps into the working product-scoping experience.

## 4. What Arizmi builds

Title: `What Arizmi builds`

Intro:

> Arizmi Labs designs and develops the digital products, platforms and systems businesses need to launch, operate and grow. From customer-facing apps to internal tools, each build is shaped around the users, workflows and commercial goals behind it.

Categories:

1. **Websites and digital platforms** — Conversion-led websites, landing pages, content-managed platforms and digital experiences built to explain, sell and scale.
2. **Web applications** — SaaS products, portals, booking systems, quote tools, dashboards and custom browser-based software.
3. **Mobile applications** — iOS, Android and cross-platform apps for customers, members, communities, teams and product-led businesses.
4. **AI-enabled systems** — AI assistants, recommendations, document generation, workflow tools and product features where AI adds practical value.
5. **CRM and operational tools** — Custom CRMs, admin systems, inventory tools, reporting workflows and internal platforms that reduce manual work.
6. **Long-term product support** — Iteration, maintenance, analytics, feature development and roadmap support after the first version goes live.

Interaction reference: [Bento Expand Grid](https://www.framer.com/community/marketplace/components/bentoexpandgrid/).

CTA: `Start your BluePrint`

Use the same typed service data as `/services`, with shorter homepage summaries. Expanded content must also be available by keyboard and touch.

## 5. Closing CTA

Title: `Good ideas deserve better systems.`

Copy:

> Arizmi helps teams move from idea to live product quickly, with the structure, workflow and technical thinking needed to build it properly from the start.

> This means fewer wasted decisions, cleaner handovers and a first version that is easier to launch, test and improve.

CTA: `Book a build call`

## Homepage acceptance criteria

- All approved copy and CTA labels match this spec.
- Hero controls work with pointer, touch, keyboard, and reduced motion.
- An owned archive gesture does not move the page; at an archive boundary, the next outward gesture after the inertial burst scrolls the page normally.
- Selected-card content is not duplicated or hard-coded separately from Builds data.
- No visible archive previous/next/count controls or rectangular matte appears around a card back.
- Every section has a coherent 320 px layout and no horizontal overflow.
- Homepage CTAs resolve to the centralized booking destination or `/blueprint-ai` as specified.
- Visual references remain inspiration only; no external component is embedded without an explicit dependency and licensing decision.
