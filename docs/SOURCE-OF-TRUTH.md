# Source of truth, assets, references, and decisions

## Captured source

- Primary brief: [Arizmi Labs website — Google Doc](https://docs.google.com/document/d/1X_7Q1O-kl6DjNw7rXmlaWj18yjpy45b78S-5mGQ9Trs/edit?usp=sharing)
- Google Doc ID: `1X_7Q1O-kl6DjNw7rXmlaWj18yjpy45b78S-5mGQ9Trs`
- Capture date: 2026-07-10
- Original asset folder retained for provenance: [Google Drive asset folder](https://drive.google.com/drive/folders/1HUSyg73IWvpOhloBEzV_e4pQJIH90PUK?usp=drive_link)
- Authoritative supplied asset archive: [`brand-source`](./brand-source/)
- Production-ready web derivatives: [`public/assets/arizmi`](../public/assets/arizmi/)

The source Doc contains tabs for Design details, Homepage and its sections, Navigation, Builds, BluePrint AI, Services, and About. The page specs in [`specs/`](./specs/) preserve that content and the links embedded in those tabs.

## Brand foundation

| Role | Value |
| --- | --- |
| Arizmi teal light | `#03B6A3` |
| Arizmi teal mid | `#00AFA7` |
| Arizmi teal dark | `#019099` |
| Arizmi teal gradient | `#019099` → `#03B6A3` |
| Tech blue | `#2F8ED8` |
| Deep violet | `#6B4FD3` |
| Card black | `#101313` |
| Warm off-white | `#F7F5EF` |
| Main typeface | Manrope |
| Metadata typeface | Space Mono |

Contrast-safe semantic tokens derived from these primitives (text, muted text, border, overlay, focus, success, warning, error) live in `app/globals.css` `:root`. Components consume semantic tokens, not raw hex.

## Local asset inventory and intended use

### Production assets

| Runtime asset | Intended use |
| --- | --- |
| [`live.webp`](../public/assets/arizmi/card-backs/live.webp) | Lossless live-build card back with native pixels and a clean alpha canvas |
| [`blueprint.webp`](../public/assets/arizmi/card-backs/blueprint.webp) | Lossless BluePrint card back with native pixels and a clean alpha canvas |
| [`concept.webp`](../public/assets/arizmi/card-backs/concept.webp) | Lossless concept card back with native pixels and a clean alpha canvas |
| [`logomark-gradient.svg`](../public/assets/arizmi/logos/logomark-gradient.svg) | Navigation logomark |
| [`logomark-white.svg`](../public/assets/arizmi/logos/logomark-white.svg) | Logomark on card-black surfaces |
| [`wordmark-gradient.svg`](../public/assets/arizmi/logos/wordmark-gradient.svg) | Compact footer wordmark |
| [`manrope-variable.woff2`](../public/fonts/manrope-variable.woff2) | Main variable font, weights 200–800 |
| [`space-mono-regular.woff2`](../public/fonts/space-mono-regular.woff2) | Metadata regular |
| [`space-mono-bold.woff2`](../public/fonts/space-mono-bold.woff2) | Metadata bold |

Editable artwork, print files, canonical PNGs, full TTFs, and font licences remain untouched in [`brand-source/`](./brand-source/), outside the deployable web root. Legacy brand files and unwired project artwork are retained separately in [`reference-assets/`](./reference-assets/). Runtime transformation details are documented in [`runtime-assets.md`](./runtime-assets.md).

### Preserved Google Doc reference images

These files were extracted from the Doc so implementation does not depend on temporary `googleusercontent.com` URLs.

#### Hero layout concept

![Hero with rotary archive entering from the right](./reference-images/hero-layout-concept.png)

Use for composition, scale, arc direction, and hierarchy. It is not a pixel-perfect final design and its generic card art is superseded by the production card-back PNGs.

#### Archive card system

![Live, BluePrint, and Concept archive card-back system](./reference-images/hero-archive-card-system.png)

Use for the relationship between the three card states and their color semantics.

#### About statistics layout reference

![About image-first statistics section reference](./reference-images/about-stats-layout-reference.png)

Use only for image-plus-stat layout direction. The visible numbers are not approved Arizmi facts and must not be shipped.

## External visual and interaction references

| Area | Reference | Borrow only |
| --- | --- | --- |
| Hero rotary archive | [Interactive Arc Deck](https://www.framer.com/community/marketplace/components/interactive-arc-deck/) | broad off-screen wheel, active-card emphasis, drag/scroll feel |
| Hero rotary archive | [Arc Gallery Pro](https://www.framer.com/community/marketplace/components/arc-gallery-pro/) | curved gallery spacing and controlled motion |
| Homepage process | [Scroll Steps](https://www.framer.com/community/marketplace/components/scroll-steps/) | sequential step activation while scrolling |
| Homepage build categories | [Bento Expand Grid](https://www.framer.com/community/marketplace/components/bentoexpandgrid/) | expandable bento behavior |
| Builds featured area | [Parallax Slider](https://www.framer.com/community/marketplace/components/parallax-slider/) | featured-project browsing motion |
| Builds cards | [Portfolio Card](https://www.framer.com/community/marketplace/components/portfoliocard/) | minimal closed state and expandable detail hierarchy |
| Services | [Accordion Service](https://www.framer.com/community/marketplace/components/accordion-service/) | service disclosure behavior |
| About stats | [Makora Studio About](https://makorastudio.com/about-us) | image-first stats composition |
| About team | [Team Carousel V1](https://www.framer.com/community/marketplace/components/team-carousel-v1/) | team browsing behavior |
| About team | [Tilt Profile Card](https://www.framer.com/community/marketplace/components/tilt-profile-card/) | restrained card depth/tilt and profile hierarchy |
| About ticker | [Hover Preview Ticker](https://www.framer.com/community/marketplace/components/hoverpreviewticker/) | ticker rhythm and hover preview pattern |

The brief also names Rive & Limn's navigation as inspiration but supplies no URL. Record a node-specific URL or screenshot before claiming visual parity.

## Open decisions and missing inputs

Every unresolved row below ships its safe default in the implementation (verified against the code on 2026-07-13). Update the Decision column when an owner resolves an item; [`PRODUCTION.md`](./PRODUCTION.md) maps each row to the concrete configuration or code change needed at launch.

| ID | Missing input or conflict | Where it lands in code | Shipped safe default | Decision |
| --- | --- | --- | --- | --- |
| D-01 | Production booking URL | `BOOKING_URL` in `lib/server/config.ts`; every booking CTA resolves through it | Disabled “Booking opens soon” control; never `#` | Pending |
| D-02 | Privacy Policy URL and approved consent language | `PRIVACY_POLICY_URL` in `lib/server/config.ts`; consent copy in `lib/blueprint/content.ts` | Production BluePrint lead capture hard-blocked until configured | Pending |
| D-03 | AI provider/model, budget, latency, and retention policy | `BLUEPRINT_AI_PROVIDER` + adapter seam in `lib/server/blueprint/ai.ts` | Deterministic mock adapter, dev only; production refuses to generate | Pending |
| D-04 | Lead database/storage provider and retention/deletion policy | `LEAD_STORAGE` + repository seam in `lib/server/blueprint/leads.ts` | In-memory repository, dev only; production refuses to store | Pending |
| D-05 | Full BluePrint PDF/email visual design and sender details | `lib/server/blueprint/document.ts` and `email.ts` | Branded HTML email skeleton; no PDF | Pending |
| D-06 | Public project URLs for all “Open/Explore” CTAs | `cta.url` per entry in `lib/content/builds.ts` | Disabled “Link coming soon” semantics, not fake URLs | Pending |
| D-07 | Featured build video/images | `components/builds/BuildMedia.tsx` | Brand-tinted “Preview coming soon” placeholder with fixed aspect ratio | Pending |
| D-08 | Builds labels conflict: defined taxonomy vs “Product Build” and “Launch Build” statuses | `sourceStatus` vs `filterCategories` in `lib/content/builds.ts` | Raw statuses preserved; only unambiguous filter mappings (so e.g. Freedom Airlines is absent from “Live builds” and Growth Map only appears under “All”) | Pending |
| D-09 | Hero project-card front content and which projects appear first | `HERO_BUILD_IDS` in `lib/content/heroArchive.ts` | Seven-card order reusing qualitative Builds data; BluePrint AI initially active | Approved 2026-07-13: keep the current subset/order and do not invent impact metrics |
| D-10 | About statistics | `SHOW_STATS_PLACEHOLDER` in `app/about/page.tsx` | Stats section renders in dev only; absent from production | Pending |
| D-11 | About team card images are referenced but absent from the supplied brand archive | `lib/content/team.ts`, `components/about/TeamGallery.tsx` | Gradient monogram placeholder, clearly marked for replacement | Pending |
| D-12 | About “Why Arizmi?” image | `app/about/page.tsx` (`.about-why__visual`) | Abstract brand-system logomark treatment, no stock imagery | Pending — shipped treatment may be approved as final |
| D-13 | Footer content is empty in the brief | `components/SiteFooter.tsx` | Wordmark, primary links, booking/contact actions, copyright; no invented legal/social/address | Pending |
| D-14 | Careers route/content | `lib/content/navigation.ts`, `components/SiteMenu.tsx` | Non-linked “Careers — Soon” menu item; no route, nothing indexed | Pending |
| D-15 | Contact recipient and whether the current modal remains | `CONTACT_RECIPIENT` / `BLUEPRINT_LEAD_RECIPIENT` in `lib/server/config.ts`; modal preserved | Recipient centralized and env-overridable, but falls back to a hardcoded `mish@icontraining.app` — confirm before launch | Pending |
| D-16 | Budget-range and timeline option sets in BluePrint lead gate | `lib/blueprint/content.ts` | Typed option sets clearly marked as draft | Pending |
| D-17 | Whether full BluePrint is both emailed and downloadable | `app/blueprint-ai/actions.ts`, `lib/server/blueprint/email.ts` | Email-only fulfilment; no download | Pending |
| D-18 | Verified Rive & Limn navigation reference URL or capture | Menu built from the written brief requirements only | Full-screen card-black menu per brief | Pending — likely closable as-built |

## Implementation status

The redesign implementation pack (18 bounded task files that previously lived in `docs/redesign/tasks/`) was completed and removed on 2026-07-13; see git history before commit `01e5d68` for the task definitions. All five routes, the BluePrint AI flow, and the shared foundation are on `main` and `npm run ci` passes. Remaining launch work is tracked in [`PRODUCTION.md`](./PRODUCTION.md).
