/**
 * Presentational form primitives for the BluePrint flow (TASK-011). No client
 * directive of their own — they render inside the client orchestrator. Every
 * control carries an accessible label, a required indicator, error wiring via
 * aria-describedby, and (for text) a live character budget. Colors follow the
 * canvas data-surface tokens.
 */
import type { ReactNode } from "react";

export function fieldId(name: string): string {
  return `bp-${name}`;
}
function errorId(name: string): string {
  return `bp-${name}-error`;
}
function helpId(name: string): string {
  return `bp-${name}-help`;
}

function RequiredMark({ required }: { required: boolean }) {
  return required ? (
    <span className="text-error" aria-hidden="true">
      {" *"}
    </span>
  ) : (
    <span className="ml-1 text-xs font-normal text-ink-muted">(optional)</span>
  );
}

function InlineError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={errorId(name)} className="mt-1.5 text-sm font-medium text-error">
      {message}
    </p>
  );
}

/* ------------------------------- ChoiceGroup ------------------------------ */

export function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  otherOption,
  otherLabel,
  otherValue,
  otherMax,
  otherError,
  onOtherChange,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  otherOption?: string;
  otherLabel?: string;
  otherValue?: string;
  otherMax?: number;
  otherError?: string;
  onOtherChange?: (value: string) => void;
}) {
  return (
    <fieldset id={fieldId(name)} aria-describedby={error ? errorId(name) : undefined}>
      <legend className="text-lg font-semibold text-ink">
        {legend}
        <RequiredMark required />
      </legend>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="bp-choice">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-[var(--teal-dark)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <InlineError name={name} message={error} />
      {otherOption && value === otherOption && onOtherChange ? (
        <div className="mt-3">
          <TextInputField
            name={`${name}Other`}
            label={otherLabel ?? "Please specify"}
            value={otherValue ?? ""}
            onChange={onOtherChange}
            maxLength={otherMax}
            required
            error={otherError}
          />
        </div>
      ) : null}
    </fieldset>
  );
}

/* ------------------------------ Text controls ----------------------------- */

export function TextInputField({
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  autoComplete,
  error,
  help,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error?: string;
  help?: string;
}) {
  const describedBy = [help ? helpId(name) : "", error ? errorId(name) : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={fieldId(name)} className="block text-sm font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      {help ? (
        <p id={helpId(name)} className="mt-1 text-xs text-ink-muted">
          {help}
        </p>
      ) : null}
      <input
        id={fieldId(name)}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="bp-input mt-2"
      />
      <InlineError name={name} message={error} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  value,
  onChange,
  required = false,
  maxLength,
  error,
  help,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  error?: string;
  help?: string;
}) {
  const describedBy = [help ? helpId(name) : "", error ? errorId(name) : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={fieldId(name)} className="block text-base font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      {help ? (
        <p id={helpId(name)} className="mt-1 text-xs text-ink-muted">
          {help}
        </p>
      ) : null}
      <textarea
        id={fieldId(name)}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="bp-input mt-2"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <InlineError name={name} message={error} />
        {maxLength ? (
          <span className="ml-auto shrink-0 font-meta text-xs text-ink-muted" aria-hidden="true">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  error,
  placeholder = "Select…",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={fieldId(name)} className="block text-sm font-semibold text-ink">
        {label}
        <RequiredMark required={false} />
      </label>
      <select
        id={fieldId(name)}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId(name) : undefined}
        className="bp-input bp-select mt-2"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <InlineError name={name} message={error} />
    </div>
  );
}

/* ------------------------------ Error summary ----------------------------- */

export interface SummaryError {
  readonly field: string;
  readonly message: string;
}

/**
 * Error summary rendered above the step when a submit is blocked. The heading
 * is focusable (the orchestrator moves focus here) and each item links to its
 * field so keyboard users can jump straight to it.
 */
export function ErrorSummary({
  errors,
  headingRef,
}: {
  errors: readonly SummaryError[];
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  if (!errors.length) return null;
  return (
    <div
      role="alert"
      className="mb-6 rounded-[var(--radius-lg)] border border-error/40 bg-[color-mix(in_srgb,var(--error)_8%,transparent)] p-4"
    >
      <h2 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-error outline-none">
        Please fix {errors.length} {errors.length === 1 ? "issue" : "issues"} before continuing
      </h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
        {errors.map((e) => (
          <li key={e.field}>
            <a href={`#${fieldId(e.field)}`} className="text-error underline underline-offset-2">
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------- Progress indicator -------------------------- */

export function ProgressIndicator({
  phaseIndex,
  phaseCount,
  currentName,
  intakePosition,
}: {
  /** Zero-based index within the five post-intro phases. */
  phaseIndex: number;
  phaseCount: number;
  currentName: string;
  /** Intake pagination is intentionally separate from overall phase progress. */
  intakePosition?: { readonly current: number; readonly total: number };
}) {
  const step = Math.min(Math.max(phaseIndex + 1, 1), phaseCount);
  const pct = Math.round((step / phaseCount) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <p className="font-meta text-xs uppercase tracking-wider text-teal-ink">
          Step {step} of {phaseCount} — {currentName}
        </p>
        <span className="font-meta text-xs text-ink-muted" aria-hidden="true">
          {pct}%
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-soft"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Progress: ${currentName}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%`, backgroundImage: "var(--gradient-teal)" }}
        />
      </div>
      {intakePosition ? (
        <p className="mt-2 font-meta text-xs text-ink-muted">
          Question set {intakePosition.current} of {intakePosition.total}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------- Step frame ------------------------------- */

/** Focusable step heading — the orchestrator moves focus here on each step. */
export function StepHeading({
  headingRef,
  eyebrow,
  children,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  eyebrow?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">{eyebrow}</p> : null}
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}
