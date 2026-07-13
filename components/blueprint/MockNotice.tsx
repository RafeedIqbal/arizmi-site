/**
 * Development-mode boundary marker (TASK-011 acceptance). Whenever generation
 * ran through the deterministic mock adapter, this notice makes the result
 * impossible to confuse with a production BluePrint. Rendered only when the
 * server reports `mode === "mock"`.
 */
export default function MockNotice() {
  return (
    <div
      role="note"
      className="mb-5 rounded-[var(--radius-lg)] border border-warning/50 bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] p-4"
    >
      <p className="font-meta text-xs uppercase tracking-wider text-warning">Development preview</p>
      <p className="mt-1 text-sm text-ink">
        This result was produced by a local development stub, not the BluePrint AI model. It is for
        wiring and layout only and is not a real diagnosis.
      </p>
    </div>
  );
}
