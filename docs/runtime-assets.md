# Runtime asset map

`public/` is runtime-only. Canonical masters and reference artwork remain outside the web root in [`brand-source/`](./brand-source/) and [`reference-assets/`](./reference-assets/).

## Public layout

```text
public/
├── assets/arizmi/
│   ├── card-backs/
│   │   ├── blueprint.webp
│   │   ├── concept.webp
│   │   └── live.webp
│   └── logos/
│       ├── logomark-gradient.svg
│       ├── logomark-white.svg
│       └── wordmark-gradient.svg
├── fonts/
│   ├── manrope-variable.woff2
│   ├── space-mono-bold.woff2
│   └── space-mono-regular.woff2
└── llms.txt
```

Next.js metadata images use the file-convention sources in `app/` (`favicon.ico`, `icon.svg`, `apple-icon.tsx`, and `opengraph-image.tsx`) and are deliberately not duplicated in `public/`.

The standards-aligned discovery file is `/llms.txt`; `next.config.ts` permanently redirects the previous singular `/llm.txt` URL for compatibility.

## Image derivatives

| Runtime path | Source master | Processing | Use |
| --- | --- | --- | --- |
| `assets/arizmi/card-backs/live.webp` | `brand-source/arizmi_card_back_live_teal.png` | Exact alpha crop, transparent padding to 390×614, then lossless VP8L WebP encoding; no artwork resize | Live-build hero cards, served without further image optimization |
| `assets/arizmi/card-backs/blueprint.webp` | `brand-source/arizmi_card_back_blueprint_tech_blue.png` | Exact alpha crop, transparent padding to 390×614, then lossless VP8L WebP encoding; no artwork resize | BluePrint hero cards, served without further image optimization |
| `assets/arizmi/card-backs/concept.webp` | `brand-source/arizmi_card_back_concept_deep_violet.png` | Exact alpha crop, transparent padding to 390×614, then lossless VP8L WebP encoding; no artwork resize | Concept hero cards, served without further image optimization |
| `assets/arizmi/logos/logomark-gradient.svg` | `brand-source/Logo/2. Logomark/ArizmiLabs_Logomark_Gradient SVG File -01.svg` | Illustrator metadata and wrapper groups removed | Navigation |
| `assets/arizmi/logos/logomark-white.svg` | `brand-source/Logo/2. Logomark/ArizmiLabs_Logomark_Black-01.svg` | Matching vector geometry with a white fill | Navigation on card-black surfaces |
| `assets/arizmi/logos/wordmark-gradient.svg` | `brand-source/Logo/3. Logo workmark/Wordmark Gradient Color SVG -01.svg` | ViewBox cropped to artwork (`262 845 1476 310`) and optimized with SVGO | Footer |

## Font derivatives

`next/font/local` in `app/layout.tsx` loads the WOFF2 files below and emits hashed, self-hosted font assets. The runtime files retain Latin, Latin Extended, punctuation, currency, and arrow characters used by the English-language site; full source fonts and OFL licences remain in `docs/brand-source/Fonts/`.

| Runtime path | Source master | CSS variable | Weight |
| --- | --- | --- | --- |
| `fonts/manrope-variable.woff2` | `brand-source/Fonts/Manrope/Manrope-VariableFont_wght.ttf` | `--font-manrope` | 200–800 |
| `fonts/space-mono-regular.woff2` | `brand-source/Fonts/Space_Mono/SpaceMono-Regular.ttf` | `--font-space-mono` | 400 |
| `fonts/space-mono-bold.woff2` | `brand-source/Fonts/Space_Mono/SpaceMono-Bold.ttf` | `--font-space-mono` | 700 |

## Rules

- Keep public filenames lowercase and kebab-case.
- Add only files with a current runtime consumer or an explicitly documented compatibility purpose.
- Keep editable, print, provenance, and unapproved content outside `public/`.
- Re-run visual checks and `npm run ci` after changing a derivative or its path.
