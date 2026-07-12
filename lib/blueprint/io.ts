/**
 * Serializable request/response contract for the BluePrint server actions
 * (TASK-011–TASK-014). Browser-safe: imported by both the client flow and the
 * "use server" action module. Only plain, serializable data crosses the
 * boundary; the full plan never returns to the client (only the six-field
 * preview), and error messages are pre-rendered user-safe strings.
 */
import type {
  BluePrintPreview,
  ConversionCategory,
  DeliveryStatus,
  Diagnosis,
  GenerationMode,
} from "./schema";

export interface DiagnoseRequest {
  readonly qualifying: Record<string, string>;
  readonly intake: Record<string, string>;
  readonly addedDetail?: string;
}

export interface LeadRequest {
  readonly qualifying: Record<string, string>;
  readonly intake: Record<string, string>;
  readonly addedDetail?: string;
  readonly lead: Record<string, string>;
  readonly marketingConsent: boolean;
  /** Stable per submission attempt; dedupes leads and plan generation. */
  readonly idempotencyKey: string;
}

export interface EmailRequest {
  readonly leadId: string;
  readonly idempotencyKey: string;
}

/** Coarse, user-safe error codes the UI maps to recovery affordances. */
export type BlueprintErrorCode =
  | "validation"
  | "rate_limited"
  | "ai_unavailable"
  | "ai_invalid"
  | "blocked"
  | "storage"
  | "not_found"
  | "unknown";

export interface ActionError {
  readonly ok: false;
  readonly code: BlueprintErrorCode;
  readonly message: string;
  /** Present for validation errors so the UI can map to specific fields. */
  readonly fieldErrors?: Record<string, string>;
}

export type DiagnoseResponse =
  | { readonly ok: true; readonly diagnosis: Diagnosis; readonly mode: GenerationMode }
  | ActionError;

export type LeadResponse =
  | {
      readonly ok: true;
      readonly leadId: string;
      readonly preview: BluePrintPreview;
      readonly conversionCategory: ConversionCategory;
      readonly mode: GenerationMode;
      /** Whether the internal notification was sent as part of this submission. */
      readonly internalNotified: boolean;
    }
  | ActionError;

export type EmailResponse =
  | { readonly ok: true; readonly status: DeliveryStatus }
  | ActionError;
