import { AUDIENCE_OTHER, QUALIFYING_QUESTIONS } from "@/lib/blueprint/content";
import { ChoiceGroup } from "./Fields";

/**
 * Step 1 — the four qualifying questions as single-select radio groups. The
 * "Who is this for?" group reveals an accessible free-text detail when the
 * "Other" option is chosen.
 */
export default function QualifyingStep({
  values,
  errors,
  onChange,
}: {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-8">
      {QUALIFYING_QUESTIONS.map((q) => (
        <ChoiceGroup
          key={q.field}
          name={q.field}
          legend={q.legend}
          options={q.options}
          value={values[q.field]}
          onChange={(v) => onChange(q.field, v)}
          error={errors[q.field]}
          otherOption={q.otherOption}
          otherLabel={AUDIENCE_OTHER.label}
          otherValue={values.audienceOther}
          otherMax={AUDIENCE_OTHER.maxLength}
          otherError={errors.audienceOther}
          onOtherChange={q.otherOption ? (v) => onChange("audienceOther", v) : undefined}
        />
      ))}
    </div>
  );
}
