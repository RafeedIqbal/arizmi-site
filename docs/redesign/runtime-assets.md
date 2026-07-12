# Runtime asset aliases

Created by `TASK-001`. The supplied originals in [`public/New_Assets`](../../public/New_Assets/) are the
provenance copies and remain unchanged; components must reference only the URL-safe runtime aliases
under `public/assets/arizmi/`.

All aliases are byte-identical copies of their source files. Every SVG carries a
`viewBox="0 0 2000 2000"`, so intrinsic aspect ratio is preserved when sized via CSS or `next/image`.

## Logos

| Runtime path (`/assets/arizmi/…`) | Source (`public/New_Assets/Logo/…`) | Intended use |
| --- | --- | --- |
| `logomark-gradient.svg` | `2. Logomark/ArizmiLabs_Logomark_Gradient SVG File -01.svg` | Preferred light-canvas hero/nav logomark |
| `logomark-black.svg` | `2. Logomark/ArizmiLabs_Logomark_Black-01.svg` | Black single-colour mark |
| `logomark-solid-teal.svg` | `2. Logomark/ArizmiLabs_Logomark_Solid SVG File-01.svg` | Solid teal single-colour mark |
| `logomark-white.png` | `2. Logomark/ArizmiLabs_Logomark_White PNG File-01.png` | Logomark on card-black surfaces |
| `logo-primary-gradient.svg` | `1. Primary_Logo/ArizmiLabs_Primary_Gradient SVG File-01.svg` | Full primary logo where the wordmark is needed |
| `logo-primary-black.svg` | `1. Primary_Logo/ArizmiLabs_Primary_Black SVG File-01.svg` | Black primary logo |
| `logo-primary-solid-teal.svg` | `1. Primary_Logo/ArizmiLabs_Primary_Solid SVG File -01.svg` | Solid teal primary logo |
| `logo-primary-white.png` | `1. Primary_Logo/ArizmiLabs_Primary_White PNG File-01.png` | Primary logo on card-black surfaces |
| `wordmark-gradient.svg` | `3. Logo workmark/Wordmark Gradient Color SVG -01.svg` | Standalone wordmark |
| `wordmark-black.svg` | `3. Logo workmark/Wordmark Black Color SVG File-01.svg` | Black wordmark |
| `wordmark-white.png` | `3. Logo workmark/Wordmark White PNG File-01.png` | Wordmark on card-black surfaces |
| `logo-horizontal-full-color.png` | `Horizantal-Logo-Full-Color.png` | Horizontal full-colour lockup |
| `logo-vertical-full-color.png` | `Vertical-Logo-Full-Color-Logo-PNG-File.png` | Vertical full-colour lockup |

## Card backs

| Runtime path (`/assets/arizmi/…`) | Source (`public/New_Assets/…`) | Intended use |
| --- | --- | --- |
| `card-back-live-teal.png` | `arizmi_card_back_live_teal.png` | Live-build card back |
| `card-back-blueprint-tech-blue.png` | `arizmi_card_back_blueprint_tech_blue.png` | BluePrint card back |
| `card-back-concept-deep-violet.png` | `arizmi_card_back_concept_deep_violet.png` | Concept card back |

## Fonts

Fonts are not copied into `public/assets/arizmi`; `next/font/local` in `app/layout.tsx` loads them
directly from their source paths (which contain no spaces) and serves hashed, self-hosted copies:

| Source (`public/New_Assets/Fonts/…`) | CSS variable | Role |
| --- | --- | --- |
| `Manrope/Manrope-VariableFont_wght.ttf` (weights 200–800) | `--font-manrope` | Main UI typeface, default via `--font-sans` / body |
| `Space_Mono/SpaceMono-Regular.ttf` (400) | `--font-space-mono` | Metadata typeface, via Tailwind `font-mono` or the `.font-meta` class |
| `Space_Mono/SpaceMono-Bold.ttf` (700) | `--font-space-mono` | Metadata bold |

Legacy Inter/Instrument Serif files under `public/fonts/` remain loaded only for the superseded
dark-theme components and are removed once every section migrates.

## Remaining source-only variants

AI/PDF source files (`Logo/4. Logo Source File/…`) and unused PNG/SVG variants stay available in
`public/New_Assets/Logo` without runtime aliases. Add an alias here if a downstream task needs one.
