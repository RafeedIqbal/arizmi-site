import { CONVERSION_MESSAGES, PLAN_DISCLAIMER, REVEAL, nextStepLabel } from "@/lib/blueprint/content";
import type { BluePrintPreview, ConversionCategory, GenerationMode } from "@/lib/blueprint/schema";
import { Button, buttonClassName, disabledCtaClassName } from "@/components/ui/Button";
import MockNotice from "./MockNotice";

function List({ items }: { items: readonly string[] }) {
  if (!items.length) return <p className="text-ink-muted">None specified.</p>;
  return (
    <ul className="list-inside list-disc space-y-1 text-ink">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border-soft py-4">
      <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">{label}</p>
      <div className="mt-1.5 text-ink">{children}</div>
    </div>
  );
}

export default function RevealStep({
  preview,
  conversionCategory,
  mode,
  bookingHref,
  emailStatus,
  emailError,
  onEmail,
}: {
  preview: BluePrintPreview;
  conversionCategory: ConversionCategory;
  mode: GenerationMode;
  bookingHref: string | null;
  emailStatus: "idle" | "sending" | "sent" | "error";
  emailError: string | null;
  onEmail: () => void;
}) {
  return (
    <div>
      {mode === "mock" ? <MockNotice /> : null}

      {/* Six-field preview — the full 11-section plan is delivered by email. */}
      <div>
        <Field label={REVEAL.previewLabels.productSummary}>
          <p>{preview.productSummary}</p>
        </Field>
        <Field label={REVEAL.previewLabels.buildType}>{preview.buildType}</Field>
        <Field label={REVEAL.previewLabels.problemStatement}>
          <p>{preview.problemStatement}</p>
        </Field>
        <Field label={REVEAL.previewLabels.mvpScope}>
          <p className="text-sm font-semibold text-ink">Build first</p>
          <List items={preview.mvpScope.now} />
          <p className="mt-3 text-sm font-semibold text-ink">Build later</p>
          <List items={preview.mvpScope.later} />
        </Field>
        <Field label={REVEAL.previewLabels.likelyComplexity}>{preview.likelyComplexity}</Field>
        <Field label={REVEAL.previewLabels.recommendedNextStep}>
          {nextStepLabel(preview.recommendedNextStep)}
        </Field>
      </div>

      {/* Email delivery — only sent on this explicit action. */}
      <div className="mt-8 rounded-lg border border-border-soft p-5">
        {emailStatus === "sent" ? (
          <p className="text-ink">
            <span className="font-semibold">Check your inbox.</span> Your full BluePrint — all eleven
            sections — is on its way.
          </p>
        ) : (
          <>
            <p className="text-ink-muted">
              Your full BluePrint contains all eleven sections. We’ll send it to the email you provided.
            </p>
            {emailError ? (
              <p role="alert" className="mt-2 text-sm font-medium text-error">
                {emailError}
              </p>
            ) : null}
            <div className="mt-4">
              <Button
                variant="solid"
                onClick={onEmail}
                disabled={emailStatus === "sending"}
                aria-busy={emailStatus === "sending"}
              >
                {emailStatus === "sending" ? "Sending…" : REVEAL.emailAction}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Diagnosis-dependent conversion message + booking CTA. */}
      <div className="mt-8 rounded-lg bg-card p-6 text-ink-on-card" data-surface="card">
        <p className="text-lg">{CONVERSION_MESSAGES[conversionCategory]}</p>
        <div className="mt-4">
          {bookingHref ? (
            <a href={bookingHref} rel="noreferrer" className={buttonClassName("solid")}>
              {REVEAL.bookCta}
            </a>
          ) : (
            <span aria-disabled="true" className={disabledCtaClassName()}>
              {REVEAL.bookCta}
              <span className="font-meta text-xs uppercase tracking-wider">Booking opens soon</span>
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">{PLAN_DISCLAIMER}</p>
    </div>
  );
}
