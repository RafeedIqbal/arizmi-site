# Global design, navigation, content, and interaction specification

## Route map

| Route | Purpose | Primary spec |
| --- | --- | --- |
| `/` | Marketing homepage | [`homepage.md`](./homepage.md) |
| `/builds` | Filterable build archive | [`builds.md`](./builds.md) |
| `/blueprint-ai` | Guided product-scoping application | [`blueprint-ai.md`](./blueprint-ai.md) |
| `/services` | Service categories and fit | [`services.md`](./services.md) |
| `/about` | Studio story, principles, and team | [`about.md`](./about.md) |

Potential `/careers`, `/contact`, and `/privacy` routes are not defined by the source brief. Resolve D-02, D-14, and D-15 before adding indexed routes.

## Visual language

- Default canvas: warm off-white `#F7F5EF`.
- Primary dark surface: card black `#101313`.
- Primary brand spectrum: teal dark `#019099`, teal mid `#00AFA7`, teal light `#03B6A3`.
- State accents: tech blue `#2F8ED8` for BluePrint; deep violet `#6B4FD3` for Concept.
- Main font: Manrope for headings, body, labels, and controls.
- Metadata font: Space Mono for indexes, statuses, categories, counters, and compact system labels.
- Visual tone: premium product archive, clear and technical without looking like generic “AI” software.
- Repeated motifs may include fine rules, broad arcs, grid/coordinate marks, restrained foil glints, black cards, and concise Space Mono metadata.

Build semantic CSS tokens in `app/globals.css`; components should not repeat raw brand hex values. Retire the current Inter/Instrument Serif theme only after every existing component has been migrated or replaced.

## Navigation

### Closed state

- Top-left uses the Arizmi logomark only.
- Top-right uses a minimal menu icon.
- The controls remain legible on warm off-white and card-black contexts.
- The current route is exposed to assistive technology even if the visual design stays minimal.

### Open state

Use Rive & Limn's menu as general inspiration, with card black as the base color. No URL was provided, so written behavior is authoritative.

Primary links, in this order:

1. Builds
2. Services
3. BluePrint AI
4. About
5. Book your build

Secondary links:

- Careers
- Get in touch

Supporting line:

> For people building something that does not exist yet.

Required behavior:

- Full keyboard operation, visible focus, Escape-to-close, focus containment, and focus restoration.
- Body scroll is locked only while the menu is open.
- Selecting an internal route closes the menu.
- Booking is an external/environment-configured action; “Get in touch” follows the decision in D-15.
- On reduced motion, use a short opacity transition or no transition.

## Footer

The Google Doc's Footer tab is empty. Until D-13 is resolved, use a restrained global footer with:

- full Arizmi logo or wordmark
- the five primary destinations
- booking and contact actions
- legal link placeholders only when their routes exist
- dynamic copyright year
- no invented address, company number, social account, or policy link

## Shared CTA vocabulary

Use copy consistently:

- `Book a build call` for the primary booking action used on the homepage and About page.
- `Book your build call` only where the Services source copy explicitly uses it, unless copy is normalized by approval.
- `Start your BluePrint` for the BluePrint flow entry.
- `Discover your BluePrint` for the homepage hero's secondary CTA.
- `Book a call` inside diagnosis-dependent BluePrint conversion panels.

Centralize destinations rather than scattering environment lookups. External actions must use meaningful disabled/error behavior when configuration is absent.

## Shared responsive and accessibility requirements

- Design from 320 px upward; verify representative mobile, tablet, laptop, and wide desktop sizes.
- Keep headings readable at browser zoom up to 200% without clipped content.
- Preserve DOM reading order when visual elements overlap or follow an arc.
- Every disclosure, card selection, filter, carousel, drawer, and modal must have a keyboard path and programmatic state.
- Touch targets should be at least 44 × 44 CSS pixels.
- Do not make hover the only way to reveal content.
- Animations must not hijack normal vertical scrolling outside their bounded interaction area.
- Reduced-motion mode must retain all content and selection behavior without large rotation, flipping, parallax, or marquee motion.
- Use `next/image` with intrinsic dimensions for raster assets; use descriptive alt text for content imagery and empty alt text for decorative mockup layers.
- Keep focus indicators visible against every brand surface.

## Shared motion direction

- Motion should feel controlled, weighted, and product-led.
- Default to transform and opacity animation; avoid layout thrashing.
- ScrollTrigger instances must be scoped and cleaned up.
- Pointer/drag interactions must distinguish a click from a drag.
- Do not recreate a fast prize-wheel feel in the hero.
- Pausable auto-rotation or auto-advance is preferred; stop it on interaction and when the section is offscreen.

## Content and implementation architecture

- Store repeated service and build content in typed data modules, not duplicated JSX.
- Keep server-only integration logic under `lib/server` or route/server-action modules.
- Keep AI prompt templates versioned and editable in one server-only location.
- Use schema validation at form, API, AI-output, and persistence boundaries.
- Keep page sections reusable where content truly overlaps, but do not force visually distinct sections into a single overly generic component.

