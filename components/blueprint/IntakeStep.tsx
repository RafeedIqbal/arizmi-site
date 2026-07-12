import { INTAKE_QUESTIONS } from "@/lib/blueprint/content";
import type { IntakeField } from "@/lib/blueprint/schema";
import { TextAreaField } from "./Fields";

/**
 * Step 2 — one intake page (one or two questions), so the progress model stays
 * clear. The orchestrator validates only this page's fields before advancing.
 */
export default function IntakeStep({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: readonly IntakeField[];
  values: Record<IntakeField, string>;
  errors: Record<string, string>;
  onChange: (field: IntakeField, value: string) => void;
}) {
  const questions = INTAKE_QUESTIONS.filter((q) => fields.includes(q.field));
  return (
    <div className="space-y-8">
      {questions.map((q) => (
        <TextAreaField
          key={q.field}
          name={q.field}
          label={q.label}
          value={values[q.field] ?? ""}
          onChange={(v) => onChange(q.field, v)}
          required={q.required}
          maxLength={q.maxLength}
          help={q.help}
          error={errors[q.field]}
        />
      ))}
    </div>
  );
}
