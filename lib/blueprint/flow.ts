/**
 * BluePrint flow state machine (TASK-011). Browser-safe reducer used by the
 * client orchestrator. The ordered screen list plus per-transition guards in
 * the orchestrator make impossible step transitions unreachable, and any edit
 * to an earlier answer invalidates downstream generated state (diagnosis,
 * lead reveal, and the idempotency key) so stale AI output can never persist.
 */
import { INTAKE_FIELDS, type BluePrintPreview, type ConversionCategory, type Diagnosis, type GenerationMode, type IntakeField } from "./schema";
import { INTAKE_PAGE_SIZE, INTAKE_QUESTIONS } from "./content";

export type ScreenPhase = "intro" | "qualifying" | "intake" | "diagnosis" | "lead" | "reveal";

export interface Screen {
  readonly phase: ScreenPhase;
  /** Intake screens carry the fields shown on that page. */
  readonly fields?: readonly IntakeField[];
  /** 1-based page number within the intake phase. */
  readonly page?: number;
}

function buildIntakePages(): Screen[] {
  const pages: Screen[] = [];
  for (let i = 0; i < INTAKE_QUESTIONS.length; i += INTAKE_PAGE_SIZE) {
    pages.push({
      phase: "intake",
      page: pages.length + 1,
      fields: INTAKE_QUESTIONS.slice(i, i + INTAKE_PAGE_SIZE).map((q) => q.field),
    });
  }
  return pages;
}

export const SCREENS: readonly Screen[] = [
  { phase: "intro" },
  { phase: "qualifying" },
  ...buildIntakePages(),
  { phase: "diagnosis" },
  { phase: "lead" },
  { phase: "reveal" },
];

export const DIAGNOSIS_SCREEN_INDEX = SCREENS.findIndex((s) => s.phase === "diagnosis");
export const FIRST_INTAKE_INDEX = SCREENS.findIndex((s) => s.phase === "intake");
export const LEAD_SCREEN_INDEX = SCREENS.findIndex((s) => s.phase === "lead");
export const REVEAL_SCREEN_INDEX = SCREENS.findIndex((s) => s.phase === "reveal");

/** Named phases for the progress indicator (intake pages share one name). */
export const PHASE_NAMES: Record<ScreenPhase, string> = {
  intro: "Start",
  qualifying: "Qualify",
  intake: "Describe your idea",
  diagnosis: "Diagnosis",
  lead: "Your details",
  reveal: "Your BluePrint",
};

export const PHASE_ORDER: readonly ScreenPhase[] = [
  "intro",
  "qualifying",
  "intake",
  "diagnosis",
  "lead",
  "reveal",
];

export type AsyncStatus = "idle" | "loading" | "ready" | "error";

export interface RevealData {
  readonly leadId: string;
  readonly preview: BluePrintPreview;
  readonly conversionCategory: ConversionCategory;
  readonly mode: GenerationMode;
  readonly internalNotified: boolean;
}

export interface FlowState {
  readonly screenIndex: number;
  readonly qualifying: Record<string, string>;
  readonly intake: Record<IntakeField, string>;
  readonly addedDetail: string;
  readonly showAddedDetail: boolean;

  readonly diagnosis: Diagnosis | null;
  readonly diagnosisMode: GenerationMode | null;
  readonly diagnosisStatus: AsyncStatus;
  readonly diagnosisError: string | null;

  readonly lead: Record<string, string>;
  readonly marketingConsent: boolean;
  readonly idempotencyKey: string | null;
  readonly leadStatus: "idle" | "submitting" | "error";
  readonly leadError: string | null;

  readonly reveal: RevealData | null;
  readonly emailStatus: "idle" | "sending" | "sent" | "error";
  readonly emailError: string | null;

  readonly fieldErrors: Record<string, string>;
  readonly announcement: string;
}

function emptyIntake(): Record<IntakeField, string> {
  return Object.fromEntries(INTAKE_FIELDS.map((f) => [f, ""])) as Record<IntakeField, string>;
}

export function initialState(): FlowState {
  return {
    screenIndex: 0,
    qualifying: {},
    intake: emptyIntake(),
    addedDetail: "",
    showAddedDetail: false,
    diagnosis: null,
    diagnosisMode: null,
    diagnosisStatus: "idle",
    diagnosisError: null,
    lead: {},
    marketingConsent: false,
    idempotencyKey: null,
    leadStatus: "idle",
    leadError: null,
    reveal: null,
    emailStatus: "idle",
    emailError: null,
    fieldErrors: {},
    announcement: "",
  };
}

export type FlowAction =
  | { type: "goto"; index: number; announcement?: string }
  | { type: "setQualifying"; field: string; value: string }
  | { type: "setIntake"; field: IntakeField; value: string }
  | { type: "setAddedDetail"; value: string }
  | { type: "toggleAddedDetail"; show: boolean }
  | { type: "setLead"; field: string; value: string }
  | { type: "setConsent"; value: boolean }
  | { type: "setFieldErrors"; errors: Record<string, string>; announcement?: string }
  | { type: "diagnosisLoading" }
  | { type: "diagnosisSuccess"; diagnosis: Diagnosis; mode: GenerationMode }
  | { type: "diagnosisError"; message: string }
  | { type: "setIdempotencyKey"; key: string }
  | { type: "leadSubmitting" }
  | { type: "leadError"; message: string; fieldErrors?: Record<string, string> }
  | { type: "leadSuccess"; reveal: RevealData }
  | { type: "emailSending" }
  | { type: "emailSent" }
  | { type: "emailError"; message: string }
  | { type: "hydrate"; draft: Partial<Pick<FlowState, "qualifying" | "intake" | "addedDetail" | "screenIndex">> };

/** Reset every piece of generated/downstream state after an earlier edit. */
function invalidateDownstream(state: FlowState): FlowState {
  return {
    ...state,
    diagnosis: null,
    diagnosisMode: null,
    diagnosisStatus: "idle",
    diagnosisError: null,
    reveal: null,
    idempotencyKey: null,
    leadStatus: "idle",
    leadError: null,
    emailStatus: "idle",
    emailError: null,
  };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "goto":
      return {
        ...state,
        screenIndex: Math.max(0, Math.min(action.index, SCREENS.length - 1)),
        fieldErrors: {},
        announcement: action.announcement ?? state.announcement,
      };

    case "setQualifying":
      return invalidateDownstream({
        ...state,
        qualifying: { ...state.qualifying, [action.field]: action.value },
        fieldErrors: dropError(state.fieldErrors, action.field),
      });

    case "setIntake":
      return invalidateDownstream({
        ...state,
        intake: { ...state.intake, [action.field]: action.value },
        fieldErrors: dropError(state.fieldErrors, action.field),
      });

    case "setAddedDetail":
      // Editing added detail does NOT auto-invalidate the visible diagnosis:
      // it stays until the user explicitly regenerates, and submitLead
      // regenerates server-side with the latest detail regardless.
      return { ...state, addedDetail: action.value };

    case "toggleAddedDetail":
      return { ...state, showAddedDetail: action.show };

    case "setLead":
      return {
        ...state,
        lead: { ...state.lead, [action.field]: action.value },
        fieldErrors: dropError(state.fieldErrors, action.field),
        leadError: null,
      };

    case "setConsent":
      return { ...state, marketingConsent: action.value };

    case "setFieldErrors":
      return {
        ...state,
        fieldErrors: action.errors,
        announcement: action.announcement ?? state.announcement,
      };

    case "diagnosisLoading":
      return { ...state, diagnosisStatus: "loading", diagnosisError: null, announcement: "Generating your diagnosis." };

    case "diagnosisSuccess":
      return {
        ...state,
        diagnosis: action.diagnosis,
        diagnosisMode: action.mode,
        diagnosisStatus: "ready",
        diagnosisError: null,
        announcement: "Your diagnosis is ready.",
      };

    case "diagnosisError":
      return { ...state, diagnosisStatus: "error", diagnosisError: action.message, announcement: action.message };

    case "setIdempotencyKey":
      return { ...state, idempotencyKey: action.key };

    case "leadSubmitting":
      return { ...state, leadStatus: "submitting", leadError: null, announcement: "Submitting your details." };

    case "leadError":
      return {
        ...state,
        leadStatus: "error",
        leadError: action.message,
        fieldErrors: action.fieldErrors ?? state.fieldErrors,
        announcement: action.message,
      };

    case "leadSuccess":
      return {
        ...state,
        leadStatus: "idle",
        leadError: null,
        reveal: action.reveal,
        screenIndex: REVEAL_SCREEN_INDEX,
        fieldErrors: {},
        announcement: "Your BluePrint is ready.",
      };

    case "emailSending":
      return { ...state, emailStatus: "sending", emailError: null, announcement: "Sending your BluePrint." };

    case "emailSent":
      return { ...state, emailStatus: "sent", emailError: null, announcement: "Your BluePrint is on its way." };

    case "emailError":
      return { ...state, emailStatus: "error", emailError: action.message, announcement: action.message };

    case "hydrate":
      return {
        ...state,
        qualifying: action.draft.qualifying ?? state.qualifying,
        intake: { ...state.intake, ...action.draft.intake },
        addedDetail: action.draft.addedDetail ?? state.addedDetail,
        screenIndex: Math.min(action.draft.screenIndex ?? 0, DIAGNOSIS_SCREEN_INDEX),
      };

    default:
      return state;
  }
}

function dropError(errors: Record<string, string>, key: string): Record<string, string> {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}
