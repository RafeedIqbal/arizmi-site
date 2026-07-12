/**
 * Shared field-level validation for the BluePrint flow. The client runs these
 * for immediate, accessible usability feedback; the server actions run the
 * exact same functions before trusting any input (spec: "Validate on client
 * for usability and again on server for trust"). Browser-safe.
 *
 * Returns per-field error maps keyed by the field name so the UI can render an
 * error summary plus inline `aria-describedby` messages, and so focus can move
 * to the first invalid field.
 */
import {
  AUDIENCES,
  AUDIENCE_OTHER_MAX,
  BUILD_TYPES,
  MAIN_GOALS,
  MAX_TOTAL_INPUT_CHARS,
  STAGES,
  type Audience,
  type BuildType,
  type IntakeAnswers,
  type IntakeField,
  type MainGoal,
  type QualifyingAnswers,
  type Stage,
} from "./schema";
import {
  BUDGET_RANGES,
  INTAKE_QUESTIONS,
  TIMELINES,
  type BudgetRange,
  type Timeline,
} from "./content";

/**
 * Error map keyed by field name → message. A plain index signature (not a
 * generic Partial) so it flows straight into the reducer/UI without casts;
 * validators only ever assign string messages.
 */
export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reject ASCII control characters (including CR/LF) that would enable email
 * header injection when a field is echoed into a header. Ordinary spaces
 * (0x20) and printable characters are allowed, so normal names pass.
 */
function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function inSet<T extends readonly string[]>(value: unknown, set: T): value is T[number] {
  return typeof value === "string" && (set as readonly string[]).includes(value);
}

/* ------------------------------- qualifying ------------------------------- */

export function validateQualifying(
  input: Partial<QualifyingAnswers>,
): { errors: FieldErrors; value?: QualifyingAnswers } {
  const errors: FieldErrors = {};

  if (!inSet(input.buildType, BUILD_TYPES)) errors.buildType = "Choose what you are trying to build.";
  if (!inSet(input.stage, STAGES)) errors.stage = "Choose where you are right now.";
  if (!inSet(input.audience, AUDIENCES)) errors.audience = "Choose who this is for.";
  if (!inSet(input.mainGoal, MAIN_GOALS)) errors.mainGoal = "Choose the main goal.";

  const other = input.audienceOther?.trim() ?? "";
  if (input.audience === "Other") {
    if (!other) errors.audienceOther = "Tell us who this is for.";
    else if (other.length > AUDIENCE_OTHER_MAX)
      errors.audienceOther = `Keep this under ${AUDIENCE_OTHER_MAX} characters.`;
  }

  if (Object.keys(errors).length) return { errors };

  return {
    errors,
    value: {
      buildType: input.buildType as BuildType,
      stage: input.stage as Stage,
      audience: input.audience as Audience,
      audienceOther: input.audience === "Other" ? other : undefined,
      mainGoal: input.mainGoal as MainGoal,
    },
  };
}

/* --------------------------------- intake --------------------------------- */

export function validateIntake(
  input: Partial<Record<string, string>>,
): { errors: FieldErrors; value?: IntakeAnswers } {
  const errors: FieldErrors = {};
  const value: Record<string, string> = {};
  let total = 0;

  for (const q of INTAKE_QUESTIONS) {
    const raw = (input[q.field] ?? "").trim();
    if (q.required && !raw) {
      errors[q.field] = "This answer is required.";
    } else if (raw.length > q.maxLength) {
      errors[q.field] = `Keep this under ${q.maxLength} characters.`;
    }
    value[q.field] = raw;
    total += raw.length;
  }

  if (total > MAX_TOTAL_INPUT_CHARS) {
    // Attributed to the longest field so focus lands somewhere sensible.
    const longest = INTAKE_QUESTIONS.reduce((a, b) =>
      (value[a.field]?.length ?? 0) >= (value[b.field]?.length ?? 0) ? a : b,
    );
    errors[longest.field] = "Your answers are too long in total. Please shorten them.";
  }

  if (Object.keys(errors).length) return { errors };
  return { errors, value: value as IntakeAnswers };
}

/**
 * Validate only the intake fields shown on the current page, so advancing one
 * screen never surfaces errors for questions the user hasn't reached yet.
 */
export function validateIntakeFields(
  fields: readonly IntakeField[],
  input: Partial<Record<string, string>>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const q of INTAKE_QUESTIONS) {
    if (!fields.includes(q.field)) continue;
    const raw = (input[q.field] ?? "").trim();
    if (q.required && !raw) errors[q.field] = "This answer is required.";
    else if (raw.length > q.maxLength) errors[q.field] = `Keep this under ${q.maxLength} characters.`;
  }
  return errors;
}

/* ---------------------------------- lead ---------------------------------- */

export interface LeadContact {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company: string;
  readonly role: string;
  readonly budgetRange: BudgetRange | "";
  readonly timeline: Timeline | "";
}

export type LeadField = keyof LeadContact;

const OPTIONAL_FREE_TEXT: readonly LeadField[] = ["phone", "company", "role"];

/**
 * Only name and email may block continuation. Optional fields are validated
 * for shape/length but never made required, and marketing consent is handled
 * entirely separately (it can never gate access to the result).
 */
export function validateLead(
  input: Partial<Record<string, string>>,
): { errors: FieldErrors; value?: LeadContact } {
  const errors: FieldErrors = {};

  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();

  if (!name) errors.name = "Your name is required.";
  else if (name.length > 120) errors.name = "Keep your name under 120 characters.";
  else if (hasControlChars(name)) errors.name = "Your name contains invalid characters.";

  if (!email) errors.email = "Your email address is required.";
  else if (!EMAIL_RE.test(email) || email.length > 254)
    errors.email = "Enter a valid email address.";

  for (const field of OPTIONAL_FREE_TEXT) {
    const v = (input[field] ?? "").trim();
    if (v.length > 200) errors[field] = "Keep this under 200 characters.";
    else if (hasControlChars(v)) errors[field] = "This field contains invalid characters.";
  }

  const budgetRange = (input.budgetRange ?? "").trim();
  if (budgetRange && !inSet(budgetRange, BUDGET_RANGES))
    errors.budgetRange = "Choose a budget range from the list.";

  const timeline = (input.timeline ?? "").trim();
  if (timeline && !inSet(timeline, TIMELINES)) errors.timeline = "Choose a timeline from the list.";

  if (Object.keys(errors).length) return { errors };

  return {
    errors,
    value: {
      name,
      email,
      phone: (input.phone ?? "").trim(),
      company: (input.company ?? "").trim(),
      role: (input.role ?? "").trim(),
      budgetRange: budgetRange as BudgetRange | "",
      timeline: timeline as Timeline | "",
    },
  };
}
