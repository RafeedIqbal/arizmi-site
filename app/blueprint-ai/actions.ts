"use server";

/**
 * BluePrint server actions — the trust boundary between the untrusted client
 * flow and the server-only generation, persistence, and delivery modules
 * (TASK-012–TASK-014). Every input is re-validated here; the full plan is
 * generated behind the lead gate and never returned to the client (only the
 * six-field preview). Credentials and prompts live in server-only modules and
 * cannot reach the browser bundle.
 */
import { headers } from "next/headers";
import { ADDED_DETAIL, CONSENT, CONSENT_COPY } from "@/lib/blueprint/content";
import {
  ADDED_DETAIL_MAX,
  toPreview,
  type IntakeAnswers,
  type QualifyingAnswers,
} from "@/lib/blueprint/schema";
import {
  validateIntake,
  validateLead,
  validateQualifying,
} from "@/lib/blueprint/validate";
import type {
  ActionError,
  DiagnoseRequest,
  DiagnoseResponse,
  EmailRequest,
  EmailResponse,
  LeadRequest,
  LeadResponse,
} from "@/lib/blueprint/io";
import {
  generateDiagnosis,
  generatePlan,
  type GenerationError,
} from "@/lib/server/blueprint/ai";
import {
  getLeadRepository,
  initialDeliveryState,
  type LeadRecord,
} from "@/lib/server/blueprint/leads";
import {
  deliverInternalNotification,
  deliverUserBlueprint,
} from "@/lib/server/blueprint/email";
import { checkRateLimit } from "@/lib/server/blueprint/rateLimit";
import { appendLeadToSheet } from "@/lib/server/blueprint/sheets";
import { isBlueprintLeadCaptureProductionReady } from "@/lib/server/config";

async function clientIp(): Promise<string | null> {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null
  );
}

function fail(code: ActionError["code"], message: string, fieldErrors?: Record<string, string>): ActionError {
  return { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) };
}

const RATE_LIMIT_MESSAGE = "You’re going a little fast. Please wait a moment and try again.";

/** Map a generation error to a user-safe recovery response. */
function generationError(error: GenerationError): ActionError {
  switch (error.kind) {
    case "invalid_output":
      return fail("ai_invalid", "The generated result didn’t come back cleanly. Please try again.");
    case "too_large":
      return fail("validation", "Your answers are a little too long. Please shorten them and try again.");
    case "unconfigured":
      return fail("blocked", "BluePrint AI isn’t available in this environment yet.");
    default:
      return fail("ai_unavailable", "BluePrint AI is temporarily unavailable. Your answers are safe — please try again.");
  }
}

/** Shared input validation for both diagnosis and lead submission. */
function validateAnswers(req: { qualifying: Record<string, string>; intake: Record<string, string>; addedDetail?: string }):
  | { ok: true; qualifying: QualifyingAnswers; intake: IntakeAnswers; addedDetail?: string }
  | { ok: false; error: ActionError } {
  const q = validateQualifying(req.qualifying);
  const i = validateIntake(req.intake);
  const addedDetail = req.addedDetail?.trim();
  const fieldErrors: Record<string, string> = { ...q.errors, ...i.errors };
  if (addedDetail && addedDetail.length > ADDED_DETAIL_MAX) {
    fieldErrors[ADDED_DETAIL.label] = `Keep this under ${ADDED_DETAIL_MAX} characters.`;
  }
  if (!q.value || !i.value || Object.keys(fieldErrors).length) {
    return { ok: false, error: fail("validation", "Please review the highlighted answers.", fieldErrors) };
  }
  return { ok: true, qualifying: q.value, intake: i.value, addedDetail: addedDetail || undefined };
}

export async function diagnoseAction(req: DiagnoseRequest): Promise<DiagnoseResponse> {
  if (!(await checkRateLimit("generate", await clientIp())).allowed) {
    return fail("rate_limited", RATE_LIMIT_MESSAGE);
  }

  const validated = validateAnswers(req);
  if (!validated.ok) return validated.error;

  const result = await generateDiagnosis({
    qualifying: validated.qualifying,
    intake: validated.intake,
    addedDetail: validated.addedDetail,
  });
  if (!result.ok) return generationError(result.error);

  return { ok: true, diagnosis: result.value, mode: result.meta.mode };
}

export async function submitLeadAction(req: LeadRequest): Promise<LeadResponse> {
  if (!(await checkRateLimit("lead", await clientIp())).allowed) {
    return fail("rate_limited", RATE_LIMIT_MESSAGE);
  }

  if (typeof req.idempotencyKey !== "string" || req.idempotencyKey.length < 8 || req.idempotencyKey.length > 100) {
    return fail("unknown", "Something went wrong starting your submission. Please try again.");
  }

  const answers = validateAnswers(req);
  const lead = validateLead(req.lead);
  if (!answers.ok || !lead.value) {
    const fieldErrors = {
      ...(answers.ok ? {} : answers.error.fieldErrors),
      ...lead.errors,
    };
    return fail("validation", "Please review the highlighted fields.", fieldErrors);
  }

  // D-02: production lead capture is blocked until a real Privacy Policy exists.
  if (!isBlueprintLeadCaptureProductionReady()) {
    return fail("blocked", "BluePrint lead capture isn’t available in this environment yet.");
  }

  const repo = getLeadRepository();
  if (!repo.ok) {
    console.warn("[blueprint] lead repository unavailable:", repo.reason);
    return fail("storage", "We can’t save your details right now. Your answers are safe — please try again shortly.");
  }
  const repository = repo.repository;

  // Idempotency: an existing key returns the stored result without
  // regenerating the plan or creating a duplicate lead.
  const existing = await repository.findByIdempotencyKey(req.idempotencyKey);
  if (existing) {
    return {
      ok: true,
      leadId: existing.id,
      preview: toPreview(existing.diagnosis, existing.plan),
      conversionCategory: existing.diagnosis.conversionCategory,
      mode: existing.generation.mode,
      internalNotified: existing.delivery.internalNotification.status === "sent",
    };
  }

  const input = {
    qualifying: answers.qualifying,
    intake: answers.intake,
    addedDetail: answers.addedDetail,
  };

  const diagnosisResult = await generateDiagnosis(input);
  if (!diagnosisResult.ok) return generationError(diagnosisResult.error);

  const planResult = await generatePlan(input);
  if (!planResult.ok) return generationError(planResult.error);

  const record: LeadRecord = {
    id: crypto.randomUUID(),
    idempotencyKey: req.idempotencyKey,
    submittedAt: new Date().toISOString(),
    contact: lead.value,
    consent: {
      marketingConsent: req.marketingConsent === true,
      consentTimestamp: new Date().toISOString(),
      consentCopyVersion: CONSENT.version,
      consentCopy: CONSENT_COPY,
    },
    qualifying: answers.qualifying,
    intake: answers.intake,
    addedDetail: answers.addedDetail,
    diagnosis: diagnosisResult.value,
    plan: planResult.value,
    recommendedNextStep: diagnosisResult.value.recommendedNextStep,
    generation: {
      mode: planResult.meta.mode,
      providerId: planResult.meta.providerId,
      promptVersion: planResult.meta.promptVersion,
      schemaVersion: planResult.meta.schemaVersion,
      status: planResult.meta.status,
    },
    delivery: initialDeliveryState(),
  };

  const created = await repository.create(record);

  // Best-effort Sheets mirror; skipped when an idempotency race returned an
  // earlier record (different id) so a lead is never mirrored twice.
  if (created.id === record.id) await appendLeadToSheet(created);

  // Internal notification is part of the same successful submission. A failure
  // here does not discard the stored lead; the reveal still succeeds.
  const internal = await deliverInternalNotification(repository, created.id);

  return {
    ok: true,
    leadId: created.id,
    preview: toPreview(created.diagnosis, created.plan),
    conversionCategory: created.diagnosis.conversionCategory,
    mode: created.generation.mode,
    internalNotified: internal.status === "sent",
  };
}

export async function emailBlueprintAction(req: EmailRequest): Promise<EmailResponse> {
  if (!(await checkRateLimit("lead", await clientIp())).allowed) {
    return fail("rate_limited", RATE_LIMIT_MESSAGE);
  }
  if (!req.leadId || !req.idempotencyKey) {
    return fail("not_found", "We couldn’t find your BluePrint. Please reveal it again.");
  }

  const repo = getLeadRepository();
  if (!repo.ok) {
    return fail("storage", "We can’t reach your BluePrint right now. Please try again shortly.");
  }

  const record = await repo.repository.get(req.leadId);
  if (!record || record.idempotencyKey !== req.idempotencyKey) {
    return fail("not_found", "We couldn’t find your BluePrint. Please reveal it again.");
  }

  const state = await deliverUserBlueprint(repo.repository, req.leadId);
  if (state.status === "sent") return { ok: true, status: "sent" };
  return fail("unknown", "We couldn’t send your BluePrint email just now. Please try again.");
}
