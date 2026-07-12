/**
 * Shared BluePrint AI input/output schemas and types (TASK-011–TASK-014).
 *
 * Browser-safe on purpose: this module is imported by client step components
 * (for usability validation) AND by server actions/adapters (for trust
 * validation), so it must never import `server-only` or read env. All AI
 * output that reaches the UI or storage passes through the validators here —
 * the data contract is a validated structured object, never arbitrary
 * model-authored Markdown/HTML.
 *
 * Versioning: bump SCHEMA_VERSION whenever the diagnosis/plan shape changes so
 * persisted lead records stay interpretable for support (see lib/server/
 * blueprint/leads.ts). Prompt text is versioned separately in prompts.ts.
 */

export const SCHEMA_VERSION = "2026-07-13.1";

/** Generation source; surfaced so a mock result can never look production. */
export type GenerationMode = "mock" | "real";

/** Durable delivery status shared across the server and the client response. */
export type DeliveryStatus = "pending" | "sent" | "failed";

/* ------------------------------------------------------------------ *
 * Qualifying questions (spec Step 1)
 * ------------------------------------------------------------------ */

export const BUILD_TYPES = [
  "Website / platform",
  "Web app",
  "Mobile app",
  "AI system",
  "CRM / internal tool",
  "Not sure yet",
] as const;
export type BuildType = (typeof BUILD_TYPES)[number];

export const STAGES = [
  "Just an idea",
  "I have notes / a rough brief",
  "I have designs",
  "I have an existing product",
  "I need to fix a workflow",
] as const;
export type Stage = (typeof STAGES)[number];

export const AUDIENCES = [
  "Customers",
  "Internal team",
  "Members / community",
  "Clients",
  "Founders / operators",
  "Other",
] as const;
export type Audience = (typeof AUDIENCES)[number];

export const MAIN_GOALS = [
  "Launch something new",
  "Save time",
  "Automate work",
  "Improve user experience",
  "Replace spreadsheets / manual tools",
  "Scale an existing product",
] as const;
export type MainGoal = (typeof MAIN_GOALS)[number];

/** Max length for the free-text "Other" audience detail. */
export const AUDIENCE_OTHER_MAX = 120;

export interface QualifyingAnswers {
  readonly buildType: BuildType;
  readonly stage: Stage;
  readonly audience: Audience;
  /** Required and non-empty only when `audience === "Other"`. */
  readonly audienceOther?: string;
  readonly mainGoal: MainGoal;
}

/* ------------------------------------------------------------------ *
 * Guided idea intake (spec Step 2) — ten questions
 * ------------------------------------------------------------------ */

export const INTAKE_FIELDS = [
  "idea",
  "problem",
  "whoUses",
  "currentAlternative",
  "productHelp",
  "mustHave",
  "niceToHave",
  "integrations",
  "success",
  "timeline",
] as const;
export type IntakeField = (typeof INTAKE_FIELDS)[number];

export type IntakeAnswers = Readonly<Record<IntakeField, string>>;

/** Ceiling on total untrusted characters accepted for generation (server). */
export const MAX_TOTAL_INPUT_CHARS = 20_000;
export const ADDED_DETAIL_MAX = 1_500;

/* ------------------------------------------------------------------ *
 * Diagnosis (spec Step 3) — validated structured object
 * ------------------------------------------------------------------ */

export const COMPLEXITIES = ["Low", "Medium", "High"] as const;
export type Complexity = (typeof COMPLEXITIES)[number];

/** Finite, validated conversion classification (never keyword matching). */
export const CONVERSION_CATEGORIES = [
  "early-stage",
  "build-ready",
  "complex",
] as const;
export type ConversionCategory = (typeof CONVERSION_CATEGORIES)[number];

/** Finite, validated recommended-next-step enum (TASK-012 acceptance). */
export const NEXT_STEPS = {
  "blueprint-review": "BluePrint review call",
  "ux-product-mapping": "UX / product mapping",
  wireframes: "Wireframes",
  "mvp-build": "MVP build",
  "technical-scoping": "Technical scoping",
  "existing-system-review": "Existing-system review",
} as const;
export type NextStepId = keyof typeof NEXT_STEPS;
export const NEXT_STEP_IDS = Object.keys(NEXT_STEPS) as readonly NextStepId[];

export interface Diagnosis {
  readonly buildType: string;
  readonly stage: string;
  readonly mainUsers: string;
  readonly coreNeed: string;
  readonly likelyComplexity: Complexity;
  readonly recommendedNextStep: NextStepId;
  readonly conversionCategory: ConversionCategory;
}

/* ------------------------------------------------------------------ *
 * Full BluePrint plan (spec Step 5) — 11 sections
 * ------------------------------------------------------------------ */

export interface UserJourney {
  readonly title: string;
  readonly steps: readonly string[];
}

export interface BluePrintPlan {
  readonly productSummary: string;
  readonly problemStatement: string;
  readonly targetUsers: { readonly primary: string; readonly secondary: string };
  readonly userGoals: readonly string[];
  readonly coreFeatures: readonly string[];
  readonly mvpScope: { readonly now: readonly string[]; readonly later: readonly string[] };
  readonly userJourneys: readonly UserJourney[];
  readonly technicalConsiderations: readonly string[];
  readonly risksAndComplexity: readonly string[];
  readonly openQuestions: readonly string[];
  readonly recommendedNextStep: {
    readonly steps: readonly NextStepId[];
    readonly rationale: string;
  };
}

/** The six-field on-screen preview (spec "On-screen preview"). */
export interface BluePrintPreview {
  readonly productSummary: string;
  readonly buildType: string;
  readonly problemStatement: string;
  readonly mvpScope: { readonly now: readonly string[]; readonly later: readonly string[] };
  readonly likelyComplexity: Complexity;
  readonly recommendedNextStep: NextStepId;
  readonly conversionCategory: ConversionCategory;
}

export function toPreview(diagnosis: Diagnosis, plan: BluePrintPlan): BluePrintPreview {
  return {
    productSummary: plan.productSummary,
    buildType: diagnosis.buildType,
    problemStatement: plan.problemStatement,
    mvpScope: plan.mvpScope,
    likelyComplexity: diagnosis.likelyComplexity,
    recommendedNextStep: diagnosis.recommendedNextStep,
    conversionCategory: diagnosis.conversionCategory,
  };
}

/* ------------------------------------------------------------------ *
 * Validation helpers
 * ------------------------------------------------------------------ */

export type Validated<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly string[] };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown, min = 1): v is string[] {
  return Array.isArray(v) && v.length >= min && v.every(isNonEmptyString);
}

function isOneOf<T extends readonly string[]>(
  v: unknown,
  allowed: T,
): v is T[number] {
  return typeof v === "string" && (allowed as readonly string[]).includes(v);
}

/**
 * Validate an untrusted (model-authored) diagnosis object. Returns a typed
 * object only when every field is present and well-formed; otherwise the
 * caller must surface a recoverable retry state and MUST NOT persist it.
 */
export function validateDiagnosis(raw: unknown): Validated<Diagnosis> {
  const errors: string[] = [];
  if (!isPlainObject(raw)) return { ok: false, errors: ["Diagnosis is not an object."] };

  for (const key of ["buildType", "stage", "mainUsers", "coreNeed"] as const) {
    if (!isNonEmptyString(raw[key])) errors.push(`Diagnosis field "${key}" is missing or empty.`);
  }
  if (!isOneOf(raw.likelyComplexity, COMPLEXITIES)) {
    errors.push("Diagnosis complexity is not one of Low/Medium/High.");
  }
  if (!isOneOf(raw.recommendedNextStep, NEXT_STEP_IDS)) {
    errors.push("Diagnosis recommended next step is not a known step.");
  }
  if (!isOneOf(raw.conversionCategory, CONVERSION_CATEGORIES)) {
    errors.push("Diagnosis conversion category is not a known category.");
  }
  if (errors.length) return { ok: false, errors };

  const r = raw as Record<string, string>;
  return {
    ok: true,
    value: {
      buildType: r.buildType.trim(),
      stage: r.stage.trim(),
      mainUsers: r.mainUsers.trim(),
      coreNeed: r.coreNeed.trim(),
      likelyComplexity: r.likelyComplexity as Complexity,
      recommendedNextStep: r.recommendedNextStep as NextStepId,
      conversionCategory: r.conversionCategory as ConversionCategory,
    },
  };
}

/**
 * Validate an untrusted (model-authored) full plan. Enforces that all 11
 * sections are present and non-empty so the reveal/artifact cannot render a
 * partial plan as a trusted result.
 */
export function validatePlan(raw: unknown): Validated<BluePrintPlan> {
  const errors: string[] = [];
  if (!isPlainObject(raw)) return { ok: false, errors: ["Plan is not an object."] };

  if (!isNonEmptyString(raw.productSummary)) errors.push("Section 1 (Product summary) is missing.");
  if (!isNonEmptyString(raw.problemStatement)) errors.push("Section 2 (Problem statement) is missing.");

  const users = raw.targetUsers;
  if (!isPlainObject(users) || !isNonEmptyString(users.primary) || !isNonEmptyString(users.secondary)) {
    errors.push("Section 3 (Target users) needs primary and secondary users.");
  }
  if (!isStringArray(raw.userGoals)) errors.push("Section 4 (User goals) is missing.");
  if (!isStringArray(raw.coreFeatures)) errors.push("Section 5 (Core features) is missing.");

  const mvp = raw.mvpScope;
  if (!isPlainObject(mvp) || !isStringArray(mvp.now) || !isStringArray(mvp.later, 0)) {
    errors.push("Section 6 (MVP scope) needs a build-now and build-later list.");
  }

  const journeys = raw.userJourneys;
  if (
    !Array.isArray(journeys) ||
    journeys.length < 1 ||
    !journeys.every(
      (j) => isPlainObject(j) && isNonEmptyString(j.title) && isStringArray(j.steps),
    )
  ) {
    errors.push("Section 7 (User journeys) is missing or malformed.");
  }

  if (!isStringArray(raw.technicalConsiderations)) errors.push("Section 8 (Technical considerations) is missing.");
  if (!isStringArray(raw.risksAndComplexity)) errors.push("Section 9 (Risks and complexity) is missing.");
  if (!isStringArray(raw.openQuestions)) errors.push("Section 10 (Open questions) is missing.");

  const next = raw.recommendedNextStep;
  if (
    !isPlainObject(next) ||
    !Array.isArray(next.steps) ||
    next.steps.length < 1 ||
    !next.steps.every((s) => isOneOf(s, NEXT_STEP_IDS)) ||
    !isNonEmptyString(next.rationale)
  ) {
    errors.push("Section 11 (Recommended next step) needs at least one known step and a rationale.");
  }

  if (errors.length) return { ok: false, errors };

  const r = raw as Record<string, unknown>;
  const u = r.targetUsers as { primary: string; secondary: string };
  const m = r.mvpScope as { now: string[]; later: string[] };
  const n = r.recommendedNextStep as { steps: NextStepId[]; rationale: string };
  return {
    ok: true,
    value: {
      productSummary: (r.productSummary as string).trim(),
      problemStatement: (r.problemStatement as string).trim(),
      targetUsers: { primary: u.primary.trim(), secondary: u.secondary.trim() },
      userGoals: (r.userGoals as string[]).map((s) => s.trim()),
      coreFeatures: (r.coreFeatures as string[]).map((s) => s.trim()),
      mvpScope: { now: m.now.map((s) => s.trim()), later: m.later.map((s) => s.trim()) },
      userJourneys: (r.userJourneys as UserJourney[]).map((j) => ({
        title: j.title.trim(),
        steps: j.steps.map((s) => s.trim()),
      })),
      technicalConsiderations: (r.technicalConsiderations as string[]).map((s) => s.trim()),
      risksAndComplexity: (r.risksAndComplexity as string[]).map((s) => s.trim()),
      openQuestions: (r.openQuestions as string[]).map((s) => s.trim()),
      recommendedNextStep: { steps: n.steps, rationale: n.rationale.trim() },
    },
  };
}
