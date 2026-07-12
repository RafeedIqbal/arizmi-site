import { DIAGNOSIS, ADDED_DETAIL, nextStepLabel } from "@/lib/blueprint/content";
import { ADDED_DETAIL_MAX, type Diagnosis, type GenerationMode } from "@/lib/blueprint/schema";
import type { AsyncStatus } from "@/lib/blueprint/flow";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "./Fields";
import MockNotice from "./MockNotice";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border-soft py-3 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-44 shrink-0 font-meta text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

export default function DiagnosisStep({
  status,
  diagnosis,
  mode,
  error,
  showAddedDetail,
  addedDetail,
  onAddedDetailChange,
  onContinue,
  onEdit,
  onToggleAddedDetail,
  onRegenerate,
  onRetry,
}: {
  status: AsyncStatus;
  diagnosis: Diagnosis | null;
  mode: GenerationMode | null;
  error: string | null;
  showAddedDetail: boolean;
  addedDetail: string;
  onAddedDetailChange: (v: string) => void;
  onContinue: () => void;
  onEdit: () => void;
  onToggleAddedDetail: () => void;
  onRegenerate: () => void;
  onRetry: () => void;
}) {
  if (status === "loading") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="bp-spinner" aria-hidden="true" />
        <p className="text-ink-muted">Reading your answers and drafting a diagnosis. This can take a few seconds.</p>
      </div>
    );
  }

  if (status === "error" || !diagnosis) {
    return (
      <div className="rounded-lg border border-border-soft p-6">
        <p className="text-ink">{error ?? "We couldn’t generate a diagnosis. Your answers are safe."}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="solid" onClick={onRetry}>
            Try again
          </Button>
          <Button variant="ghost" onClick={onEdit}>
            {DIAGNOSIS.actions.edit}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {mode === "mock" ? <MockNotice /> : null}
      <p className="text-lg font-semibold text-ink">{DIAGNOSIS.intro}</p>
      <dl className="mt-3">
        <Row label={DIAGNOSIS.labels.buildType} value={diagnosis.buildType} />
        <Row label={DIAGNOSIS.labels.stage} value={diagnosis.stage} />
        <Row label={DIAGNOSIS.labels.mainUsers} value={diagnosis.mainUsers} />
        <Row label={DIAGNOSIS.labels.coreNeed} value={diagnosis.coreNeed} />
        <Row label={DIAGNOSIS.labels.likelyComplexity} value={diagnosis.likelyComplexity} />
        <Row label={DIAGNOSIS.labels.recommendedNextStep} value={nextStepLabel(diagnosis.recommendedNextStep)} />
      </dl>

      <p className="mt-6 text-base font-semibold text-ink">{DIAGNOSIS.confirm}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="solid" onClick={onContinue}>
          {DIAGNOSIS.actions.continue}
        </Button>
        <Button variant="outline" onClick={onEdit}>
          {DIAGNOSIS.actions.edit}
        </Button>
        <Button
          variant="ghost"
          onClick={onToggleAddedDetail}
          aria-expanded={showAddedDetail}
          aria-controls="bp-added-detail"
        >
          {DIAGNOSIS.actions.addDetail}
        </Button>
      </div>

      {showAddedDetail ? (
        <div id="bp-added-detail" className="mt-6 rounded-lg border border-border-soft p-4">
          <TextAreaField
            name="addedDetail"
            label={ADDED_DETAIL.label}
            value={addedDetail}
            onChange={onAddedDetailChange}
            maxLength={ADDED_DETAIL_MAX}
          />
          <div className="mt-3">
            <Button variant="solid" onClick={onRegenerate}>
              Regenerate diagnosis
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
