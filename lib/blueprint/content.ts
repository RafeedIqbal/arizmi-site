/**
 * Single typed source for every BluePrint question, option, label, and message
 * (spec docs/redesign/specs/blueprint-ai.md). Copy is transcribed exactly from
 * the brief — do not fork it across components. Browser-safe.
 */
import {
  ADDED_DETAIL_MAX,
  AUDIENCE_OTHER_MAX,
  AUDIENCES,
  BUILD_TYPES,
  type Audience,
  type BuildType,
  type ConversionCategory,
  type IntakeField,
  type MainGoal,
  type NextStepId,
  MAIN_GOALS,
  NEXT_STEPS,
  STAGES,
  type Stage,
} from "./schema";

export const HERO = {
  headline: "Welcome to BluePrint AI.",
  supporting:
    "Arizmi BluePrint AI helps turn a rough idea, workflow or product opportunity into a Product Requirements Document (PRD)-style plan before development begins.",
  cta: "Start your BluePrint",
} as const;

/* ------------------------------------------------------------------ *
 * Step 1: qualifying questions
 * ------------------------------------------------------------------ */

export interface QualifyingQuestion<Value extends string> {
  readonly field: "buildType" | "stage" | "audience" | "mainGoal";
  readonly legend: string;
  readonly options: readonly Value[];
  /** The option that reveals the accessible free-text detail input. */
  readonly otherOption?: Value;
}

export const QUALIFYING_QUESTIONS: readonly QualifyingQuestion<string>[] = [
  {
    field: "buildType",
    legend: "What are you trying to build?",
    options: BUILD_TYPES,
  } satisfies QualifyingQuestion<BuildType>,
  {
    field: "stage",
    legend: "Where are you right now?",
    options: STAGES,
  } satisfies QualifyingQuestion<Stage>,
  {
    field: "audience",
    legend: "Who is this for?",
    options: AUDIENCES,
    otherOption: "Other",
  } satisfies QualifyingQuestion<Audience>,
  {
    field: "mainGoal",
    legend: "What is the main goal?",
    options: MAIN_GOALS,
  } satisfies QualifyingQuestion<MainGoal>,
];

export const AUDIENCE_OTHER = {
  label: "Please tell us who this is for",
  maxLength: AUDIENCE_OTHER_MAX,
} as const;

/* ------------------------------------------------------------------ *
 * Step 2: guided idea intake (ten questions)
 * ------------------------------------------------------------------ */

export interface IntakeQuestion {
  readonly field: IntakeField;
  readonly label: string;
  readonly required: boolean;
  readonly maxLength: number;
  /** Optional short hint; keep examples minimal per the spec. */
  readonly help?: string;
}

export const INTAKE_QUESTIONS: readonly IntakeQuestion[] = [
  { field: "idea", label: "Describe the idea in your own words.", required: true, maxLength: 2000 },
  { field: "problem", label: "What problem does it solve?", required: true, maxLength: 1500 },
  { field: "whoUses", label: "Who will use it?", required: true, maxLength: 1000 },
  {
    field: "currentAlternative",
    label: "What are they currently doing instead?",
    required: false,
    maxLength: 1500,
  },
  {
    field: "productHelp",
    label: "What should the product help them do?",
    required: true,
    maxLength: 1500,
  },
  { field: "mustHave", label: "What are the must-have features?", required: true, maxLength: 1500 },
  {
    field: "niceToHave",
    label: "What would be nice to have later?",
    required: false,
    maxLength: 1500,
  },
  {
    field: "integrations",
    label: "Are there any existing tools, systems or processes it needs to connect with?",
    required: false,
    maxLength: 1500,
  },
  {
    field: "success",
    label: "What would make this project successful?",
    required: false,
    maxLength: 1500,
  },
  {
    field: "timeline",
    label: "When do you want to launch or start building?",
    required: false,
    maxLength: 500,
  },
];

/**
 * Intake is paginated so the progress model stays clear (spec: "one or two
 * questions per screen is acceptable"). Two questions per screen.
 */
export const INTAKE_PAGE_SIZE = 2;

export const ADDED_DETAIL = {
  label: "Add more detail to sharpen the diagnosis",
  maxLength: ADDED_DETAIL_MAX,
} as const;

/* ------------------------------------------------------------------ *
 * Step 3: diagnosis review
 * ------------------------------------------------------------------ */

export const DIAGNOSIS = {
  intro: "Your idea looks like:",
  confirm: "Does this look right?",
  labels: {
    buildType: "Build type",
    stage: "Stage",
    mainUsers: "Main users",
    coreNeed: "Core need",
    likelyComplexity: "Likely complexity",
    recommendedNextStep: "Recommended next step",
  },
  actions: {
    continue: "Yes, continue",
    edit: "Edit my answers",
    addDetail: "Add more detail",
  },
} as const;

export function nextStepLabel(id: NextStepId): string {
  return NEXT_STEPS[id];
}

/* ------------------------------------------------------------------ *
 * Step 4: lead capture gate
 * ------------------------------------------------------------------ */

export const LEAD_GATE = {
  message: "Great, your BluePrint is now ready. Fill in the details below to access it.",
  submit: "Reveal my BluePrint",
} as const;

/**
 * D-16: budget-range and timeline option sets are not finalized. These are
 * clearly marked DRAFT typed options; do not present them as approved pricing
 * bands. Update when D-16 resolves.
 */
export const LEAD_DRAFT_NOTICE = "Draft options — pending confirmation (D-16).";

export const BUDGET_RANGES = [
  "Under £10k",
  "£10k–£25k",
  "£25k–£50k",
  "£50k–£100k",
  "£100k+",
  "Not sure yet",
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const TIMELINES = [
  "As soon as possible",
  "Within 1–3 months",
  "Within 3–6 months",
  "6+ months",
  "Just exploring",
] as const;
export type Timeline = (typeof TIMELINES)[number];

/**
 * Consent copy (verbatim from the brief). D-02: the Privacy Policy link
 * target and approved language are unresolved, so this is versioned and the
 * link is resolved server-side (placeholder allowed in dev, blocked in
 * production). Any wording change must bump the version so stored consent
 * records stay auditable.
 */
export const CONSENT = {
  version: "brief-2026-07-10",
  /** Text before the "Read our Privacy Policy." link. */
  lead:
    "Please tick this box to consent to Arizmi Labs Ltd reaching out to you. If you tick the box, we’ll also send occasional messages from Arizmi Labs. You can unsubscribe anytime. ",
  linkText: "Read our Privacy Policy.",
} as const;

/** Full consent copy as one string, for the persisted/audit record. */
export const CONSENT_COPY = `${CONSENT.lead}${CONSENT.linkText}`;

/* ------------------------------------------------------------------ *
 * Step 5: reveal — preview labels + conversion messages
 * ------------------------------------------------------------------ */

export const REVEAL = {
  previewLabels: {
    productSummary: "Product summary",
    buildType: "Build type",
    problemStatement: "Problem statement",
    mvpScope: "MVP scope",
    likelyComplexity: "Likely complexity",
    recommendedNextStep: "Recommended next step",
  },
  emailAction: "Email me the full BluePrint",
  bookCta: "Book a call",
} as const;

/** Conversion messages keyed by validated category (never keyword matching). */
export const CONVERSION_MESSAGES: Record<ConversionCategory, string> = {
  "early-stage": "Your idea needs more shape before build. Start with a BluePrint review call.",
  "build-ready": "Your idea has enough structure to move into scoping and build planning.",
  complex: "This build has moving parts that need technical scoping before development.",
};

/* ------------------------------------------------------------------ *
 * The 11-section full plan (titles + spec descriptions)
 * ------------------------------------------------------------------ */

export const PLAN_SECTIONS = [
  { key: "productSummary", title: "Product summary", blurb: "Clear plain-English summary of the product." },
  { key: "problemStatement", title: "Problem statement", blurb: "What problem it solves and why it matters." },
  { key: "targetUsers", title: "Target users", blurb: "Primary and secondary users." },
  { key: "userGoals", title: "User goals", blurb: "What users need to achieve inside the product." },
  { key: "coreFeatures", title: "Core features", blurb: "Main features needed for the first version." },
  { key: "mvpScope", title: "MVP scope", blurb: "What should be built first and what should wait." },
  { key: "userJourneys", title: "User journeys", blurb: "Simple flows showing how people will use the product." },
  {
    key: "technicalConsiderations",
    title: "Technical considerations",
    blurb: "Integrations, data, accounts, permissions, payments, AI, dashboards, CMS, and APIs.",
  },
  {
    key: "risksAndComplexity",
    title: "Risks and complexity",
    blurb: "Where the build could become messy, expensive, or unclear.",
  },
  {
    key: "openQuestions",
    title: "Open questions",
    blurb: "What Arizmi must answer before quoting or building.",
  },
  {
    key: "recommendedNextStep",
    title: "Recommended next step",
    blurb: "One or more of: scoping call, UX/product mapping, wireframes, MVP build, or existing-system review.",
  },
] as const;

/**
 * The generated plan is guidance, not a binding commitment. Surfaced in the
 * reveal and the emailed artifact (spec AI behavior requirements).
 */
export const PLAN_DISCLAIMER =
  "This BluePrint is an AI-generated planning aid, not a binding quote, security review, legal opinion, or final technical architecture.";
