import {
  BUDGET_RANGES,
  CONSENT,
  LEAD_DRAFT_NOTICE,
  LEAD_GATE,
  TIMELINES,
} from "@/lib/blueprint/content";
import { Button } from "@/components/ui/Button";
import { SelectField, TextInputField } from "./Fields";

/**
 * Step 4 — the lead capture gate. Only Name and Email can block continuation;
 * every other field (including marketing consent) is optional and consent can
 * never gate access to the result. Consent is a distinct, explicit checkbox so
 * it is recorded as its own auditable boolean.
 */
export default function LeadStep({
  values,
  errors,
  marketingConsent,
  submitting,
  submitError,
  privacyHref,
  onChange,
  onConsentChange,
  onSubmit,
}: {
  values: Record<string, string>;
  errors: Record<string, string>;
  marketingConsent: boolean;
  submitting: boolean;
  submitError: string | null;
  privacyHref: string | null;
  onChange: (field: string, value: string) => void;
  onConsentChange: (value: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting) onSubmit();
      }}
    >
      <p className="mb-6 text-ink-muted">{LEAD_GATE.message}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInputField
          name="name"
          label="Name"
          value={values.name ?? ""}
          onChange={(v) => onChange("name", v)}
          required
          autoComplete="name"
          error={errors.name}
        />
        <TextInputField
          name="email"
          label="Email address"
          type="email"
          value={values.email ?? ""}
          onChange={(v) => onChange("email", v)}
          required
          autoComplete="email"
          error={errors.email}
        />
        <TextInputField
          name="phone"
          label="Phone number"
          type="tel"
          value={values.phone ?? ""}
          onChange={(v) => onChange("phone", v)}
          autoComplete="tel"
          error={errors.phone}
        />
        <TextInputField
          name="company"
          label="Company"
          value={values.company ?? ""}
          onChange={(v) => onChange("company", v)}
          autoComplete="organization"
          error={errors.company}
        />
        <TextInputField
          name="role"
          label="Role"
          value={values.role ?? ""}
          onChange={(v) => onChange("role", v)}
          autoComplete="organization-title"
          error={errors.role}
        />
        <div className="sm:col-span-2">
          <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">{LEAD_DRAFT_NOTICE}</p>
          <div className="mt-2 grid gap-5 sm:grid-cols-2">
            <SelectField
              name="budgetRange"
              label="Budget range"
              value={values.budgetRange ?? ""}
              onChange={(v) => onChange("budgetRange", v)}
              options={BUDGET_RANGES}
              error={errors.budgetRange}
            />
            <SelectField
              name="timeline"
              label="Timeline"
              value={values.timeline ?? ""}
              onChange={(v) => onChange("timeline", v)}
              options={TIMELINES}
              error={errors.timeline}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border-soft p-4">
        <input
          id="bp-consent"
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--teal-dark)]"
        />
        <label htmlFor="bp-consent" className="text-sm text-ink-muted">
          {CONSENT.lead}
          {privacyHref ? (
            <a
              href={privacyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-ink underline underline-offset-2"
            >
              {CONSENT.linkText}
            </a>
          ) : (
            <span className="text-ink">
              {CONSENT.linkText}{" "}
              <span className="font-meta text-xs uppercase tracking-wider text-ink-muted">(link coming soon)</span>
            </span>
          )}
        </label>
      </div>

      {submitError ? (
        <p role="alert" className="mt-4 text-sm font-medium text-error">
          {submitError}
        </p>
      ) : null}

      <div className="mt-6">
        <Button type="submit" variant="solid" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Revealing…" : LEAD_GATE.submit}
        </Button>
      </div>
    </form>
  );
}
