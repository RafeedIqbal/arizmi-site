import { ROUTES, type AppRoute } from "@/lib/site";

/**
 * Single typed source for all 12 build entries, transcribed exactly from
 * docs/specs/builds.md. Consumed by the Builds page (featured cards
 * and compact archive), the homepage hero card fronts (D-09), filters
 * (TASK-008), and metadata.
 *
 * D-08: the source taxonomy conflicts — entries carry "Product Build" and
 * "Launch Build" statuses that have no visible filter tab. To keep the
 * conflict visible instead of forcing one enum:
 *   - `sourceStatus` preserves the raw per-entry status label verbatim;
 *   - `filterCategories` holds only unambiguous mappings to the visible tab
 *     taxonomy and stays provisional until D-08 is resolved (see comments on
 *     the conflicted entries).
 */

/** Raw status labels used verbatim by the source entries (D-08). */
export type BuildSourceStatus =
  | "Product Build"
  | "Live Build"
  | "Launch Build"
  | "Private Build"
  | "Concept Build";

/** Visible filter tab taxonomy (excluding "All", which is a UI concern). */
export type BuildFilterCategory =
  | "live-builds"
  | "ai-systems"
  | "web-presence"
  | "private-builds"
  | "concepts";

export interface BuildFilter {
  readonly id: BuildFilterCategory;
  /** Visible tab label. */
  readonly label: string;
  /** Internal label definition from the source brief, verbatim. */
  readonly sourceDefinition: string;
}

export const BUILD_FILTERS: readonly BuildFilter[] = [
  {
    id: "live-builds",
    label: "Live builds",
    sourceDefinition:
      "A public-facing build that is live or ready to be shown.",
  },
  {
    id: "ai-systems",
    label: "AI systems",
    sourceDefinition:
      "A product or tool with AI built into the workflow, logic or user experience.",
  },
  {
    id: "web-presence",
    label: "Web presence",
    sourceDefinition:
      "A website, landing page or launch environment created to give a brand or product a digital home.",
  },
  {
    id: "private-builds",
    label: "Private builds",
    sourceDefinition:
      "A real build where details are protected because of client, IP or launch sensitivity.",
  },
  {
    id: "concepts",
    label: "Concepts",
    sourceDefinition:
      "A strategic or product concept created to show what could be built.",
  },
] as const;

/**
 * CTA is modeled separately from status/visibility. External URLs are null
 * until D-06 supplies verified destinations — render disabled "Link coming
 * soon" semantics, never a fake URL.
 */
export type PublicBuildCta =
  | { readonly kind: "external"; readonly label: string; readonly url: string | null }
  | { readonly kind: "internal"; readonly label: string; readonly href: AppRoute };

/** Non-navigational status text or a disabled control with an explanation. */
export interface ProtectedBuildCta {
  readonly kind: "protected";
  readonly label: "Details protected";
}

interface BuildBase {
  readonly id: string;
  readonly name: string;
  /** Raw source status label, preserved verbatim (D-08). */
  readonly sourceStatus: BuildSourceStatus;
  readonly capabilities: readonly string[];
  /** Provisional, unambiguous-only tab mapping until D-08 is resolved. */
  readonly filterCategories: readonly BuildFilterCategory[];
  readonly summary: string;
  /** "What Arizmi shaped" — the only approved contribution copy. */
  readonly contribution: string;
  /** Featured slider entry (true) vs compact archive entry (false). */
  readonly featured: boolean;
}

/**
 * The visibility discriminant splits the union so protected and public
 * entries cannot be confused: a protected build can only carry the
 * non-navigational "Details protected" CTA, and a public/semi-public CTA
 * cannot be attached to a protected entry.
 */
export interface PublicBuild extends BuildBase {
  readonly visibility: "public" | "semi-public";
  /** Exact source visibility label, e.g. "Public / semi-public". */
  readonly visibilityLabel: string;
  readonly cta: PublicBuildCta;
}

export interface ProtectedBuild extends BuildBase {
  readonly visibility: "protected";
  readonly visibilityLabel: "Protected";
  readonly cta: ProtectedBuildCta;
}

export type Build = PublicBuild | ProtectedBuild;

/** All 12 entries in source order: 8 featured, then 4 compact archive. */
export const BUILDS: readonly Build[] = [
  {
    id: "icon-training-app",
    name: "Icon Training App",
    // D-08: "Product Build" has no visible filter tab; only the unambiguous
    // capability mapping (AI system) is applied until taxonomy is normalized.
    sourceStatus: "Product Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: ["Mobile app", "AI system", "marketplace", "fitness tech"],
    filterCategories: ["ai-systems"],
    summary:
      "AI-enabled fitness marketplace app connecting users with coach-led training experiences, progress-led journeys and scalable product logic.",
    contribution:
      "Product direction, user journeys, coach and user flows, AI-assisted training logic and first-version product scope.",
    featured: true,
    cta: { kind: "external", label: "Explore Icon Training", url: null },
  },
  {
    id: "blueprint-ai",
    name: "BluePrint AI",
    // D-08: "Product Build" has no visible filter tab (see above).
    sourceStatus: "Product Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: [
      "AI system",
      "PRD builder",
      "product scoping",
      "lead qualification",
    ],
    filterCategories: ["ai-systems"],
    summary:
      "AI-enabled PRD builder that turns rough ideas, workflows and product opportunities into clear product plans before development begins.",
    contribution:
      "Guided intake, AI diagnosis flow, PRD-style output, lead capture journey and conversion pathway.",
    featured: true,
    cta: {
      kind: "internal",
      label: "Start your BluePrint",
      href: ROUTES.blueprintAi,
    },
  },
  {
    id: "rive-and-limn",
    name: "Rive & Limn",
    sourceStatus: "Live Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: [
      "Web presence",
      "diagnostic tool",
      "brand strategy",
      "conversion journey",
    ],
    filterCategories: ["live-builds", "web-presence"],
    summary:
      "Strategy-led website and diagnostic experience for a brand and growth consultancy working with complex businesses.",
    contribution:
      "Website structure, proposition, diagnostic journey, service flow and conversion pathway.",
    featured: true,
    cta: { kind: "external", label: "Explore Rive & Limn", url: null },
  },
  {
    id: "alpac-london",
    name: "ALPAC London",
    sourceStatus: "Live Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: [
      "Web presence",
      "product storytelling",
      "limited drop",
      "e-commerce",
    ],
    filterCategories: ["live-builds", "web-presence"],
    summary:
      "Premium fragrance website and product storytelling system for a limited-drop perfume brand.",
    contribution:
      "Website direction, product story, drop structure, fragrance page logic and launch journey.",
    featured: true,
    cta: { kind: "external", label: "Open ALPAC", url: null },
  },
  {
    id: "freedom-airlines",
    name: "Freedom Airlines",
    // D-08: "Launch Build" has no visible filter tab; not force-mapped to
    // "Live builds" until taxonomy is normalized.
    sourceStatus: "Launch Build",
    visibility: "semi-public",
    visibilityLabel: "Public / semi-public",
    capabilities: [
      "Web presence",
      "investor portal",
      "route information",
      "registration system",
    ],
    filterCategories: ["web-presence"],
    summary:
      "Created the web presence for a regional airline launching domestic routes across Bangladesh, including investor portal, route information and pre-launch registration.",
    contribution:
      "Launch website, route information structure, investor portal and pre-launch registration journey.",
    featured: true,
    cta: { kind: "external", label: "Open Freedom", url: null },
  },
  {
    id: "basenote-solutions",
    name: "Basenote Solutions",
    sourceStatus: "Live Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: [
      "Web presence",
      "strategy platform",
      "fragrance tech",
      "founder support",
    ],
    filterCategories: ["live-builds", "web-presence"],
    summary:
      "Web presence for a strategy and technology platform supporting fragrance entrepreneurs with clearer systems, positioning and product tools.",
    contribution:
      "Website structure, proposition, service messaging and product-led positioning.",
    featured: true,
    cta: { kind: "external", label: "Open Basenote", url: null },
  },
  {
    id: "icon-training-website",
    name: "Icon Training Website",
    sourceStatus: "Live Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: ["Web presence", "launch website", "marketplace", "fitness"],
    filterCategories: ["live-builds", "web-presence"],
    summary:
      "Website and launch presence for an AI-powered fitness coach marketplace, helping users understand the product, coaches and value of personalised training.",
    contribution:
      "Launch messaging, website structure, product explanation, coach marketplace positioning and user journey.",
    featured: true,
    cta: { kind: "external", label: "Open Icon Training", url: null },
  },
  {
    id: "private-ai-formulation-tool",
    name: "Private AI Formulation Tool",
    sourceStatus: "Private Build",
    visibility: "protected",
    visibilityLabel: "Protected",
    capabilities: [
      "AI system",
      "formulation logic",
      "specialist workflow",
      "private product",
    ],
    filterCategories: ["private-builds", "ai-systems"],
    summary:
      "Protected AI-enabled workflow for a specialist formulation process. Details remain private while the system is in development.",
    contribution:
      "Product logic, AI-assisted workflow, input and output structure, specialist user journey and first-version scope.",
    featured: true,
    cta: { kind: "protected", label: "Details protected" },
  },
  {
    id: "private-crm-system",
    name: "Private CRM System",
    sourceStatus: "Private Build",
    visibility: "protected",
    visibilityLabel: "Protected",
    capabilities: ["CRM", "internal tool", "workflow system", "operations"],
    filterCategories: ["private-builds"],
    summary:
      "Custom CRM and operational workflow system for managing clients, projects and internal processes.",
    contribution:
      "CRM architecture, workflow mapping, client and project logic, internal dashboard structure and operational scope.",
    featured: false,
    cta: { kind: "protected", label: "Details protected" },
  },
  {
    id: "private-ai-system",
    name: "Private AI System",
    sourceStatus: "Private Build",
    visibility: "protected",
    visibilityLabel: "Protected",
    capabilities: [
      "AI system",
      "product logic",
      "workflow design",
      "private product",
    ],
    filterCategories: ["private-builds", "ai-systems"],
    summary: "Protected AI-enabled product currently in development.",
    contribution:
      "AI workflow logic, product scoping, user journey, input and output structure and first-version build direction.",
    featured: false,
    cta: { kind: "protected", label: "Details protected" },
  },
  {
    id: "clinic-conversion-concept",
    name: "Clinic Conversion Concept",
    sourceStatus: "Concept Build",
    visibility: "protected",
    visibilityLabel: "Protected",
    capabilities: [
      "Web presence",
      "customer journey",
      "booking flow",
      "conversion",
    ],
    filterCategories: ["concepts", "web-presence"],
    summary:
      "Conversion-led digital concept for a clinic website and booking journey.",
    contribution:
      "Website concept, customer journey direction, trust-building structure, booking pathway and service page logic.",
    featured: false,
    cta: { kind: "protected", label: "Details protected" },
  },
  {
    id: "growth-map-diagnostic",
    name: "Growth Map Diagnostic",
    // D-08: "Product Build" status and no capability that maps to a visible
    // tab — appears only under "All" until taxonomy is normalized.
    sourceStatus: "Product Build",
    visibility: "public",
    visibilityLabel: "Public",
    capabilities: [
      "Diagnostic system",
      "lead qualification",
      "growth strategy",
      "email output",
    ],
    filterCategories: [],
    summary:
      "Diagnostic journey designed to help businesses understand what may be blocking growth before entering a sales conversation.",
    contribution:
      "Question flow, diagnostic logic, result categories, email output journey and conversion pathway.",
    featured: false,
    cta: { kind: "external", label: "Open Growth Map", url: null },
  },
] as const;

export const FEATURED_BUILDS: readonly Build[] = BUILDS.filter(
  (build) => build.featured,
);

export const ARCHIVE_BUILDS: readonly Build[] = BUILDS.filter(
  (build) => !build.featured,
);

/* ------------------------------------------------------------------ */
/* Filtering (TASK-008)                                                */
/* ------------------------------------------------------------------ */

/** "All" is a UI concern, not a source category — kept separate here. */
export const ALL_FILTER_ID = "all" as const;
export type BuildFilterId = typeof ALL_FILTER_ID | BuildFilterCategory;

/** Ordered tab list rendered by the filter toolbar: "All" then the source tabs. */
export const FILTER_TABS: readonly { id: BuildFilterId; label: string }[] = [
  { id: ALL_FILTER_ID, label: "All" },
  ...BUILD_FILTERS.map(({ id, label }) => ({ id, label })),
];

const FILTER_IDS: ReadonlySet<string> = new Set(FILTER_TABS.map((tab) => tab.id));

/**
 * Coerce an untrusted query-parameter value to a valid filter id. Unknown or
 * missing values fall back to "All" without throwing (TASK-008: shareable,
 * fault-tolerant URL state).
 */
export function parseFilterId(value: string | null | undefined): BuildFilterId {
  return value && FILTER_IDS.has(value)
    ? (value as BuildFilterId)
    : ALL_FILTER_ID;
}

/** True when a build belongs to the given filter. "All" matches everything. */
export function matchesFilter(build: Build, filter: BuildFilterId): boolean {
  return (
    filter === ALL_FILTER_ID || build.filterCategories.includes(filter)
  );
}

/** Entries from `list` that match `filter`, preserving source order. */
export function filterBuilds(
  list: readonly Build[],
  filter: BuildFilterId,
): readonly Build[] {
  return filter === ALL_FILTER_ID
    ? list
    : list.filter((build) => matchesFilter(build, filter));
}

/* Compatibility exports for existing build-content consumers. The canonical
 * display-state rule and approved art mapping live in buildVisuals.ts. */
export {
  buildDisplayState,
  type BuildDisplayState,
} from "@/lib/content/buildVisuals";
