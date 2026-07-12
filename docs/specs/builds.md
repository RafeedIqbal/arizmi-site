# Builds archive specification

## Page purpose

The Builds page presents public work, protected work, concepts, AI systems, and web-presence projects as one premium archive. It must communicate range without exposing protected details.

## Hero

Headline:

> A look inside the systems we’ve shaped, built and launched.

Supporting copy:

> From public websites and digital platforms to private AI systems, internal tools and product concepts, the Arizmi build archive shows the range of ideas we help turn into working systems.

CTAs:

- `Start your BluePrint`
- `Book a build call`

Archive heading: `Welcome to the Archive`

## Filter model

Visible tabs:

- All
- Live builds
- AI systems
- Web presence
- Private builds
- Concepts

The source brief also defines these internal labels:

- **Live Build:** A public-facing build that is live or ready to be shown.
- **Private Build:** A real build where details are protected because of client, IP or launch sensitivity.
- **Concept:** A strategic or product concept created to show what could be built.
- **AI System:** A product or tool with AI built into the workflow, logic or user experience.
- **Web Presence:** A website, landing page or launch environment created to give a brand or product a digital home.

The entries also use `Product Build`, `Launch Build`, and `Concept Build` as statuses. Resolve D-08 by modeling at least two fields—such as lifecycle/status and capability/category—rather than forcing every source label into one enum. Filters must be shareable via query parameters and remain understandable without animation.

## Featured interaction

Eight featured builds use a premium slider/archive treatment. Reference: [Parallax Slider](https://www.framer.com/community/marketplace/components/parallax-slider/).

Closed card content is only:

- project name
- status label

On click, tap, or keyboard activation, open the project in an adjacent detail panel on wide screens and a dialog/drawer or in-flow detail region on smaller screens. Preserve the selected project in URL state if practical. The panel contains status, visibility, capabilities, summary, Arizmi contribution, and CTA.

Featured media will arrive later. Until D-07 is resolved, use consistent, intentional placeholders with correct aspect ratios and project/state labels. Do not use random stock imagery.

## Featured build content

### Icon Training App

- Status: Product Build
- Visibility: Public
- Capabilities: Mobile app, AI system, marketplace, fitness tech
- Summary: AI-enabled fitness marketplace app connecting users with coach-led training experiences, progress-led journeys and scalable product logic.
- What Arizmi shaped: Product direction, user journeys, coach and user flows, AI-assisted training logic and first-version product scope.
- CTA: `Explore Icon Training`

### BluePrint AI

- Status: Product Build
- Visibility: Public
- Capabilities: AI system, PRD builder, product scoping, lead qualification
- Summary: AI-enabled PRD builder that turns rough ideas, workflows and product opportunities into clear product plans before development begins.
- What Arizmi shaped: Guided intake, AI diagnosis flow, PRD-style output, lead capture journey and conversion pathway.
- CTA: `Start your BluePrint`

### Rive & Limn

- Status: Live Build
- Visibility: Public
- Capabilities: Web presence, diagnostic tool, brand strategy, conversion journey
- Summary: Strategy-led website and diagnostic experience for a brand and growth consultancy working with complex businesses.
- What Arizmi shaped: Website structure, proposition, diagnostic journey, service flow and conversion pathway.
- CTA: `Explore Rive & Limn`

### ALPAC London

- Status: Live Build
- Visibility: Public
- Capabilities: Web presence, product storytelling, limited drop, e-commerce
- Summary: Premium fragrance website and product storytelling system for a limited-drop perfume brand.
- What Arizmi shaped: Website direction, product story, drop structure, fragrance page logic and launch journey.
- CTA: `Open ALPAC`

### Freedom Airlines

- Status: Launch Build
- Visibility: Public / semi-public
- Capabilities: Web presence, investor portal, route information, registration system
- Summary: Created the web presence for a regional airline launching domestic routes across Bangladesh, including investor portal, route information and pre-launch registration.
- What Arizmi shaped: Launch website, route information structure, investor portal and pre-launch registration journey.
- CTA: `Open Freedom`

### Basenote Solutions

- Status: Live Build
- Visibility: Public
- Capabilities: Web presence, strategy platform, fragrance tech, founder support
- Summary: Web presence for a strategy and technology platform supporting fragrance entrepreneurs with clearer systems, positioning and product tools.
- What Arizmi shaped: Website structure, proposition, service messaging and product-led positioning.
- CTA: `Open Basenote`

### Icon Training Website

- Status: Live Build
- Visibility: Public
- Capabilities: Web presence, launch website, marketplace, fitness
- Summary: Website and launch presence for an AI-powered fitness coach marketplace, helping users understand the product, coaches and value of personalised training.
- What Arizmi shaped: Launch messaging, website structure, product explanation, coach marketplace positioning and user journey.
- CTA: `Open Icon Training`

### Private AI Formulation Tool

- Status: Private Build
- Visibility: Protected
- Capabilities: AI system, formulation logic, specialist workflow, private product
- Summary: Protected AI-enabled workflow for a specialist formulation process. Details remain private while the system is in development.
- What Arizmi shaped: Product logic, AI-assisted workflow, input and output structure, specialist user journey and first-version scope.
- CTA: `Details protected`

`Details protected` is non-navigational status text or a disabled control with an explanation; it must not link to a fake destination.

## Compact archive entries

Below featured builds, show closed rows or compact minimal cards. Closed content is project name plus status label. Activation expands an open state directly under the row/card.

Interaction reference: [Portfolio Card](https://www.framer.com/community/marketplace/components/portfoliocard/).

### Private CRM System

- Status: Private Build
- Visibility: Protected
- Capabilities: CRM, internal tool, workflow system, operations
- Summary: Custom CRM and operational workflow system for managing clients, projects and internal processes.
- What Arizmi shaped: CRM architecture, workflow mapping, client and project logic, internal dashboard structure and operational scope.
- CTA: `Details protected`

### Private AI System

- Status: Private Build
- Visibility: Protected
- Capabilities: AI system, product logic, workflow design, private product
- Summary: Protected AI-enabled product currently in development.
- What Arizmi shaped: AI workflow logic, product scoping, user journey, input and output structure and first-version build direction.
- CTA: `Details protected`

### Clinic Conversion Concept

- Status: Concept Build
- Visibility: Protected
- Capabilities: Web presence, customer journey, booking flow, conversion
- Summary: Conversion-led digital concept for a clinic website and booking journey.
- What Arizmi shaped: Website concept, customer journey direction, trust-building structure, booking pathway and service page logic.
- CTA: `Details protected`

### Growth Map Diagnostic

- Status: Product Build
- Visibility: Public
- Capabilities: Diagnostic system, lead qualification, growth strategy, email output
- Summary: Diagnostic journey designed to help businesses understand what may be blocking growth before entering a sales conversation.
- What Arizmi shaped: Question flow, diagnostic logic, result categories, email output journey and conversion pathway.
- CTA: `Open Growth Map`

## Data and behavior requirements

- Keep all 12 entries in one typed data source reused by featured cards, compact rows, hero card fronts, filters, metadata, and structured data where appropriate.
- Preserve `visibility` separately from status and capabilities.
- A build may belong to multiple filter categories.
- Never render protected contribution detail beyond the exact approved copy.
- Public project URLs are required before enabling outbound CTAs. See D-06.
- The active filter and expanded entry survive back/forward navigation.
- Use an accessible tabs or toolbar pattern according to actual behavior; do not use `role="tab"` if controls simply filter one list.
- Announce filtered result counts to assistive technology.
- Slider controls have names, disabled states, position context, and a non-slider fallback.

## Builds acceptance criteria

- All source projects and fields are represented once in typed data.
- Defined filters yield correct multi-category results and an intentional empty state.
- Featured and compact disclosures are keyboard/touch accessible and support Escape where overlay UI is used.
- Protected items never create outbound links.
- Missing media and URLs are visibly intentional placeholders, not broken UI.
- The layout works without parallax and under reduced motion.

