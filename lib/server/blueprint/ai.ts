import "server-only";

/**
 * Provider-agnostic BluePrint generation (TASK-012). Server-only.
 *
 * D-03 resolved: Google Gemini is the wired production provider
 * (BLUEPRINT_AI_PROVIDER=gemini + GEMINI_API_KEY; see gemini.ts). The module
 * ships:
 *   - a structured adapter interface (the seam providers plug into),
 *   - a deterministic development mock adapter (works with no API key),
 *   - a selector that switches adapters by explicit env configuration and
 *     refuses to silently return mock output in production,
 *   - a timeout/abort + bounded-retry harness and request-size guard,
 *   - validation of every model response before it is returned for display or
 *     persistence (invalid output is a recoverable error, never a success).
 */
import {
  MAX_TOTAL_INPUT_CHARS,
  SCHEMA_VERSION,
  validateDiagnosis,
  validatePlan,
  type BluePrintPlan,
  type Complexity,
  type ConversionCategory,
  type Diagnosis,
  type GenerationMode,
  type IntakeAnswers,
  type NextStepId,
  type QualifyingAnswers,
} from "@/lib/blueprint/schema";
import { PROMPT_VERSION, buildDiagnosisPrompt, buildPlanPrompt } from "./prompts";
import { createGeminiAdapter } from "./gemini";

export type GenerationErrorKind =
  | "unconfigured" // no usable provider (e.g. production without a real vendor)
  | "too_large" // input exceeded the request-size limit
  | "timeout" // provider did not respond in time
  | "provider_error" // provider call failed
  | "invalid_output"; // provider responded but failed schema validation

export interface GenerationError {
  readonly kind: GenerationErrorKind;
  /** Safe, developer-facing detail. Never contains raw user answers. */
  readonly detail: string;
}

export interface GenerationMeta {
  readonly mode: GenerationMode;
  readonly providerId: string;
  readonly promptVersion: string;
  readonly schemaVersion: string;
  readonly status: "success" | "failed";
  readonly ms: number;
}

export type GenerationResult<T> =
  | { readonly ok: true; readonly value: T; readonly meta: GenerationMeta }
  | { readonly ok: false; readonly error: GenerationError; readonly meta: GenerationMeta };

export interface GenerationInput {
  readonly qualifying: QualifyingAnswers;
  readonly intake: IntakeAnswers;
  readonly addedDetail?: string;
}

/** The seam every provider implements (see gemini.ts for the real one). */
export interface BlueprintAdapter {
  readonly id: string;
  readonly mode: GenerationMode;
  diagnose(input: GenerationInput, signal: AbortSignal): Promise<unknown>;
  plan(input: GenerationInput, signal: AbortSignal): Promise<unknown>;
}

const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 250;

/* ------------------------------------------------------------------ *
 * Development mock adapter — deterministic, no network, no key.
 * Output shape matches the schema so the UI can reach the review and
 * reveal boundaries; the mock mode is surfaced by the caller so it can
 * never be mistaken for a production result (TASK-011).
 * ------------------------------------------------------------------ */

function splitToList(text: string, fallback: readonly string[]): string[] {
  const items = text
    .split(/[\n;,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : [...fallback];
}

const BUILD_TYPE_LABEL: Record<string, string> = {
  "Website / platform": "Website / digital platform",
  "Web app": "Web application",
  "Mobile app": "Mobile application",
  "AI system": "AI-enabled system",
  "CRM / internal tool": "CRM / internal tool",
  "Not sure yet": "To be determined",
};

function mockDiagnosis({ qualifying, intake }: GenerationInput): Diagnosis {
  const buildType = BUILD_TYPE_LABEL[qualifying.buildType] ?? qualifying.buildType;
  const earlyStages = new Set(["Just an idea", "I have notes / a rough brief"]);

  let complexity: Complexity = "Medium";
  if (qualifying.buildType === "AI system") complexity = "High";
  else if (qualifying.buildType === "Website / platform") complexity = "Low";
  if (intake.integrations?.trim()) complexity = complexity === "Low" ? "Medium" : "High";

  let conversionCategory: ConversionCategory;
  if (complexity === "High") conversionCategory = "complex";
  else if (earlyStages.has(qualifying.stage)) conversionCategory = "early-stage";
  else conversionCategory = "build-ready";

  let recommendedNextStep: NextStepId;
  if (qualifying.stage === "I have an existing product") recommendedNextStep = "existing-system-review";
  else if (conversionCategory === "complex") recommendedNextStep = "technical-scoping";
  else if (conversionCategory === "early-stage") recommendedNextStep = "blueprint-review";
  else recommendedNextStep = qualifying.stage === "I have designs" ? "mvp-build" : "ux-product-mapping";

  const mainUsers =
    qualifying.audience === "Other" && qualifying.audienceOther
      ? qualifying.audienceOther
      : qualifying.audience;

  return {
    buildType,
    stage: qualifying.stage,
    mainUsers,
    coreNeed: intake.problem || intake.productHelp || qualifying.mainGoal,
    likelyComplexity: complexity,
    recommendedNextStep,
    conversionCategory,
  };
}

function mockPlan(input: GenerationInput): BluePrintPlan {
  const { qualifying, intake } = input;
  const d = mockDiagnosis(input);
  const features = splitToList(intake.mustHave, ["Core workflow", "User accounts", "Basic reporting"]);
  const later = splitToList(intake.niceToHave, []);

  return {
    productSummary:
      intake.idea ||
      `A ${d.buildType.toLowerCase()} for ${d.mainUsers.toLowerCase()} focused on ${qualifying.mainGoal.toLowerCase()}.`,
    problemStatement: intake.problem || intake.productHelp || "The problem statement needs more detail.",
    targetUsers: {
      primary: intake.whoUses || d.mainUsers,
      secondary: qualifying.audience === "Other" ? "Wider stakeholders" : "Secondary stakeholders",
    },
    userGoals: splitToList(intake.productHelp, [qualifying.mainGoal]),
    coreFeatures: features,
    mvpScope: {
      now: features.slice(0, Math.max(1, Math.ceil(features.length / 2))),
      later,
    },
    userJourneys: [
      {
        title: `${d.mainUsers} — primary flow`,
        steps: [
          "Arrive and understand the value",
          intake.productHelp || "Complete the core task",
          "Achieve the intended outcome",
        ],
      },
    ],
    technicalConsiderations: splitToList(intake.integrations, [
      "Accounts and permissions to define",
      "Data model to confirm",
    ]),
    risksAndComplexity: [
      `Complexity assessed as ${d.likelyComplexity.toLowerCase()} at this stage`,
      "Scope may expand once requirements are validated",
    ],
    openQuestions: [
      "What is the definition of the first successful release?",
      intake.success ? `How will success be measured beyond: ${intake.success}?` : "How will success be measured?",
    ],
    recommendedNextStep: {
      steps: [d.recommendedNextStep],
      rationale: `Based on a ${d.stage.toLowerCase()} ${d.buildType.toLowerCase()} with ${d.likelyComplexity.toLowerCase()} complexity.`,
    },
  };
}

const mockAdapter: BlueprintAdapter = {
  id: "mock",
  mode: "mock",
  async diagnose(input) {
    // Build the versioned prompt so the seam exercises it, then return the
    // deterministic object (the mock does not call a model).
    buildDiagnosisPrompt(input.qualifying, input.intake, input.addedDetail);
    return mockDiagnosis(input);
  },
  async plan(input) {
    buildPlanPrompt(input.qualifying, input.intake, input.addedDetail);
    return mockPlan(input);
  },
};

/* ------------------------------------------------------------------ *
 * Adapter selection — explicit env config, no silent prod fallback.
 * ------------------------------------------------------------------ */

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Memoized per instance; recreated only if the resolved key/model changes.
let geminiAdapter: { key: string; adapter: BlueprintAdapter } | null = null;

function selectAdapter(): { adapter: BlueprintAdapter } | { error: GenerationError; providerId: string } {
  const configured = process.env.BLUEPRINT_AI_PROVIDER?.trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";
  const providerId = configured || (isProduction ? "unconfigured" : "mock");

  if (providerId === "mock") {
    if (isProduction) {
      return {
        error: {
          kind: "unconfigured",
          detail: "The mock generator cannot run in production. Set BLUEPRINT_AI_PROVIDER=gemini.",
        },
        providerId,
      };
    }
    return { adapter: mockAdapter };
  }

  if (providerId === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return {
        error: {
          kind: "unconfigured",
          detail: "BLUEPRINT_AI_PROVIDER=gemini but GEMINI_API_KEY is not set.",
        },
        providerId,
      };
    }
    const model = process.env.BLUEPRINT_AI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
    const memoKey = `${model}:${apiKey}`;
    if (geminiAdapter?.key !== memoKey) {
      geminiAdapter = { key: memoKey, adapter: createGeminiAdapter(apiKey, model) };
    }
    return { adapter: geminiAdapter.adapter };
  }

  // An unknown provider was named. Refusing here keeps production visibly
  // blocked instead of shipping fake output.
  return {
    error: {
      kind: "unconfigured",
      detail: `AI provider "${providerId}" is not wired. Supported: "gemini" (or "mock" in development).`,
    },
    providerId,
  };
}

/* ------------------------------------------------------------------ *
 * Harness: request-size guard, timeout/abort, bounded retries, validate.
 * ------------------------------------------------------------------ */

function totalInputChars({ qualifying, intake, addedDetail }: GenerationInput): number {
  const answers = Object.values(intake).join("");
  const extras = `${qualifying.audienceOther ?? ""}${addedDetail ?? ""}`;
  return answers.length + extras.length;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function runWithHarness<T>(
  input: GenerationInput,
  call: (adapter: BlueprintAdapter, signal: AbortSignal) => Promise<unknown>,
  validate: (raw: unknown) => { ok: true; value: T } | { ok: false; errors: readonly string[] },
  label: "diagnosis" | "plan",
): Promise<GenerationResult<T>> {
  const started = elapsedBase();
  const baseMeta = { promptVersion: PROMPT_VERSION, schemaVersion: SCHEMA_VERSION } as const;

  const selection = selectAdapter();
  if ("error" in selection) {
    const meta: GenerationMeta = {
      ...baseMeta,
      mode: "real",
      providerId: selection.providerId,
      status: "failed",
      ms: elapsedSince(started),
    };
    logGeneration(label, meta, selection.error.kind);
    return { ok: false, error: selection.error, meta };
  }

  const { adapter } = selection;
  const meta = (status: "success" | "failed"): GenerationMeta => ({
    ...baseMeta,
    mode: adapter.mode,
    providerId: adapter.id,
    status,
    ms: elapsedSince(started),
  });

  if (totalInputChars(input) > MAX_TOTAL_INPUT_CHARS) {
    const error: GenerationError = { kind: "too_large", detail: "Input exceeded the allowed size." };
    logGeneration(label, meta("failed"), error.kind);
    return { ok: false, error, meta: meta("failed") };
  }

  let lastError: GenerationError = { kind: "provider_error", detail: "Generation failed." };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const raw = await call(adapter, controller.signal);
      const validated = validate(raw);
      if (!validated.ok) {
        // Invalid model output is never a success and is never persisted.
        lastError = { kind: "invalid_output", detail: validated.errors.join(" ") };
        break;
      }
      logGeneration(label, meta("success"));
      return { ok: true, value: validated.value, meta: meta("success") };
    } catch (err) {
      lastError = controller.signal.aborted
        ? { kind: "timeout", detail: "The generator timed out." }
        : { kind: "provider_error", detail: err instanceof Error ? err.name : "unknown" };
    } finally {
      clearTimeout(timer);
    }
    if (attempt < MAX_ATTEMPTS && lastError.kind !== "invalid_output") await delay(RETRY_DELAY_MS);
  }

  logGeneration(label, meta("failed"), lastError.kind);
  return { ok: false, error: lastError, meta: meta("failed") };
}

/* Time helpers that avoid Date.now() coupling but stay simple. */
function elapsedBase(): number {
  return typeof performance !== "undefined" ? performance.now() : 0;
}
function elapsedSince(base: number): number {
  return Math.round((typeof performance !== "undefined" ? performance.now() : 0) - base);
}

/** Log identifiers/timing/error category only — never raw answers. */
function logGeneration(label: string, meta: GenerationMeta, errorKind?: GenerationErrorKind): void {
  const payload = {
    label,
    providerId: meta.providerId,
    mode: meta.mode,
    status: meta.status,
    ms: meta.ms,
    promptVersion: meta.promptVersion,
    schemaVersion: meta.schemaVersion,
    ...(errorKind ? { errorKind } : {}),
  };
  if (meta.status === "success") console.info("[blueprint] generation", payload);
  else console.warn("[blueprint] generation failed", payload);
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export function generateDiagnosis(input: GenerationInput): Promise<GenerationResult<Diagnosis>> {
  return runWithHarness(input, (a, s) => a.diagnose(input, s), validateDiagnosis, "diagnosis");
}

export function generatePlan(input: GenerationInput): Promise<GenerationResult<BluePrintPlan>> {
  return runWithHarness(input, (a, s) => a.plan(input, s), validatePlan, "plan");
}
