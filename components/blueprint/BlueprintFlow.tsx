"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { HERO, QUALIFYING_QUESTIONS } from "@/lib/blueprint/content";
import { INTAKE_FIELDS, type IntakeField } from "@/lib/blueprint/schema";
import {
  DIAGNOSIS_SCREEN_INDEX,
  FIRST_INTAKE_INDEX,
  PHASE_NAMES,
  PHASE_ORDER,
  SCREENS,
  flowReducer,
  initialState,
  type FlowState,
} from "@/lib/blueprint/flow";
import {
  validateIntakeFields,
  validateIntake,
  validateLead,
  validateQualifying,
} from "@/lib/blueprint/validate";
import { Button } from "@/components/ui/Button";
import LiveRegion from "@/components/ui/LiveRegion";
import {
  diagnoseAction,
  emailBlueprintAction,
  submitLeadAction,
} from "@/app/blueprint-ai/actions";
import {
  ErrorSummary,
  ProgressIndicator,
  StepHeading,
  type SummaryError,
} from "./Fields";
import QualifyingStep from "./QualifyingStep";
import IntakeStep from "./IntakeStep";
import DiagnosisStep from "./DiagnosisStep";
import LeadStep from "./LeadStep";
import RevealStep from "./RevealStep";

const STORAGE_KEY = "arizmi.blueprint.draft.v1";

/**
 * Ordered field list for the error summary. Only the user's own answers are
 * ever surfaced here; matches the ids the field primitives render.
 */
const LEAD_FIELDS = ["name", "email", "phone", "company", "role", "budgetRange", "timeline"] as const;
const FIELD_ORDER: readonly string[] = [
  ...QUALIFYING_QUESTIONS.map((q) => q.field),
  "audienceOther",
  ...INTAKE_FIELDS,
  "addedDetail",
  ...LEAD_FIELDS,
];

const STEP_TITLES: Record<string, string> = {
  qualifying: "A few quick questions",
  intake: "Tell us about your idea",
  diagnosis: "Your first diagnosis",
  lead: "Your BluePrint is ready",
  reveal: "Your BluePrint",
};

export default function BlueprintFlow({
  privacyHref,
  bookingHref,
}: {
  privacyHref: string | null;
  bookingHref: string | null;
}) {
  const [state, dispatch] = useReducer(flowReducer, undefined, initialState);

  // Always-fresh state for async callbacks without stale closures. Updated in
  // an effect (never during render) so it holds the latest committed state by
  // the time any event handler or async callback reads it.
  const stateRef = useRef<FlowState>(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLHeadingElement>(null);
  const skipPersist = useRef(true);
  const mounted = useRef(false);

  const screen = SCREENS[state.screenIndex];

  /* ----------------------- session persistence (draft) ---------------------- */
  // Decision (TASK-011): refresh persistence is enabled but privacy-conscious.
  // Only the user's own idea answers are stored in sessionStorage (cleared on
  // tab close). PII (lead fields), consent, and all generated AI output are
  // never persisted and are cleared on successful submission.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<
          Pick<FlowState, "qualifying" | "intake" | "addedDetail" | "screenIndex">
        >;
        dispatch({ type: "hydrate", draft });
      }
    } catch {
      /* ignore malformed drafts */
    }
  }, []);

  useEffect(() => {
    // Skip the mount run so hydration (which reads the draft) can't be
    // clobbered by writing the empty initial state before it commits.
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          qualifying: state.qualifying,
          intake: state.intake,
          addedDetail: state.addedDetail,
          screenIndex: state.screenIndex,
        }),
      );
    } catch {
      /* storage may be unavailable (private mode); flow still works in-memory */
    }
  }, [state.qualifying, state.intake, state.addedDetail, state.screenIndex]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /* ----------------------------- focus movement ----------------------------- */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return; // don't steal focus on first load
    }
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [state.screenIndex]);

  useEffect(() => {
    if (Object.keys(state.fieldErrors).length) {
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }, [state.fieldErrors]);

  /* ------------------------------ generation -------------------------------- */
  const runDiagnosis = useCallback(async () => {
    const s = stateRef.current;
    dispatch({ type: "diagnosisLoading" });
    const resp = await diagnoseAction({
      qualifying: s.qualifying,
      intake: s.intake,
      addedDetail: s.addedDetail.trim() || undefined,
    });
    if (resp.ok) dispatch({ type: "diagnosisSuccess", diagnosis: resp.diagnosis, mode: resp.mode });
    else dispatch({ type: "diagnosisError", message: resp.message });
  }, []);

  // Generate when the user first reaches the diagnosis screen (or returns to it
  // after an edit invalidated the previous result).
  useEffect(() => {
    if (state.screenIndex === DIAGNOSIS_SCREEN_INDEX && state.diagnosisStatus === "idle") {
      void runDiagnosis();
    }
  }, [state.screenIndex, state.diagnosisStatus, runDiagnosis]);

  const submitLead = useCallback(async () => {
    const s = stateRef.current;
    const lead = validateLead(s.lead);
    const q = validateQualifying(s.qualifying);
    const i = validateIntake(s.intake);
    const fieldErrors = { ...q.errors, ...i.errors, ...lead.errors };
    if (Object.keys(fieldErrors).length) {
      dispatch({ type: "setFieldErrors", errors: fieldErrors });
      return;
    }

    let key = s.idempotencyKey;
    if (!key) {
      key = crypto.randomUUID();
      dispatch({ type: "setIdempotencyKey", key });
    }

    dispatch({ type: "leadSubmitting" });
    const resp = await submitLeadAction({
      qualifying: s.qualifying,
      intake: s.intake,
      addedDetail: s.addedDetail.trim() || undefined,
      lead: s.lead,
      marketingConsent: s.marketingConsent,
      idempotencyKey: key,
    });
    if (resp.ok) {
      clearDraft();
      dispatch({
        type: "leadSuccess",
        reveal: {
          leadId: resp.leadId,
          preview: resp.preview,
          conversionCategory: resp.conversionCategory,
          mode: resp.mode,
          internalNotified: resp.internalNotified,
        },
      });
    } else {
      dispatch({ type: "leadError", message: resp.message, fieldErrors: resp.fieldErrors });
    }
  }, [clearDraft]);

  const sendEmail = useCallback(async () => {
    const s = stateRef.current;
    if (!s.reveal || !s.idempotencyKey) return;
    dispatch({ type: "emailSending" });
    const resp = await emailBlueprintAction({
      leadId: s.reveal.leadId,
      idempotencyKey: s.idempotencyKey,
    });
    if (resp.ok) dispatch({ type: "emailSent" });
    else dispatch({ type: "emailError", message: resp.message });
  }, []);

  /* ------------------------------ navigation -------------------------------- */
  const goNext = useCallback(() => {
    const s = stateRef.current;
    const current = SCREENS[s.screenIndex];
    if (current.phase === "qualifying") {
      const { errors } = validateQualifying(s.qualifying);
      if (Object.keys(errors).length) {
        dispatch({ type: "setFieldErrors", errors });
        return;
      }
      dispatch({ type: "goto", index: FIRST_INTAKE_INDEX });
    } else if (current.phase === "intake") {
      const errors = validateIntakeFields(current.fields ?? [], s.intake);
      if (Object.keys(errors).length) {
        dispatch({ type: "setFieldErrors", errors });
        return;
      }
      dispatch({ type: "goto", index: s.screenIndex + 1 });
    }
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "goto", index: stateRef.current.screenIndex - 1 });
  }, []);

  /* -------------------------------- render ---------------------------------- */
  if (screen.phase === "intro") {
    return (
      <section className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] py-[var(--section-py)]">
        <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">BluePrint AI</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {HERO.headline}
        </h1>
        <p className="mt-6 text-lg text-ink-muted">{HERO.supporting}</p>
        <div className="mt-8">
          <Button variant="solid" onClick={() => dispatch({ type: "goto", index: 1 })}>
            {HERO.cta}
          </Button>
        </div>
      </section>
    );
  }

  const summaryErrors: SummaryError[] = FIELD_ORDER.filter((f) => state.fieldErrors[f]).map((f) => ({
    field: f,
    message: state.fieldErrors[f]!,
  }));

  const phaseIndex = PHASE_ORDER.indexOf(screen.phase);
  const showFooter = screen.phase === "qualifying" || screen.phase === "intake";
  const showBack = state.screenIndex > 0 && screen.phase !== "reveal";

  return (
    <section className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] py-[var(--section-py)]">
      <ProgressIndicator
        phaseNames={PHASE_ORDER.map((p) => PHASE_NAMES[p])}
        currentIndex={phaseIndex}
        currentName={PHASE_NAMES[screen.phase]}
        totalScreens={SCREENS.length}
        screenIndex={state.screenIndex}
      />

      <LiveRegion>{state.announcement}</LiveRegion>

      <ErrorSummary errors={summaryErrors} headingRef={errorRef} />

      <StepHeading headingRef={headingRef} eyebrow={PHASE_NAMES[screen.phase]}>
        {STEP_TITLES[screen.phase]}
      </StepHeading>

      {screen.phase === "qualifying" ? (
        <QualifyingStep
          values={state.qualifying}
          errors={state.fieldErrors}
          onChange={(field, value) => dispatch({ type: "setQualifying", field, value })}
        />
      ) : null}

      {screen.phase === "intake" ? (
        <IntakeStep
          fields={(screen.fields ?? []) as IntakeField[]}
          values={state.intake}
          errors={state.fieldErrors}
          onChange={(field, value) => dispatch({ type: "setIntake", field, value })}
        />
      ) : null}

      {screen.phase === "diagnosis" ? (
        <DiagnosisStep
          status={state.diagnosisStatus}
          diagnosis={state.diagnosis}
          mode={state.diagnosisMode}
          error={state.diagnosisError}
          showAddedDetail={state.showAddedDetail}
          addedDetail={state.addedDetail}
          onAddedDetailChange={(value) => dispatch({ type: "setAddedDetail", value })}
          onContinue={() => dispatch({ type: "goto", index: state.screenIndex + 1 })}
          onEdit={() => dispatch({ type: "goto", index: FIRST_INTAKE_INDEX })}
          onToggleAddedDetail={() => dispatch({ type: "toggleAddedDetail", show: !state.showAddedDetail })}
          onRegenerate={() => void runDiagnosis()}
          onRetry={() => void runDiagnosis()}
        />
      ) : null}

      {screen.phase === "lead" ? (
        <LeadStep
          values={state.lead}
          errors={state.fieldErrors}
          marketingConsent={state.marketingConsent}
          submitting={state.leadStatus === "submitting"}
          submitError={summaryErrors.length ? null : state.leadError}
          privacyHref={privacyHref}
          onChange={(field, value) => dispatch({ type: "setLead", field, value })}
          onConsentChange={(value) => dispatch({ type: "setConsent", value })}
          onSubmit={() => void submitLead()}
        />
      ) : null}

      {screen.phase === "reveal" && state.reveal ? (
        <RevealStep
          preview={state.reveal.preview}
          conversionCategory={state.reveal.conversionCategory}
          mode={state.reveal.mode}
          bookingHref={bookingHref}
          emailStatus={state.emailStatus}
          emailError={state.emailError}
          onEmail={() => void sendEmail()}
        />
      ) : null}

      {showFooter || showBack ? (
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-border-soft pt-6">
          {showBack ? (
            <Button variant="ghost" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {showFooter ? (
            <Button variant="solid" onClick={goNext}>
              Continue
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
