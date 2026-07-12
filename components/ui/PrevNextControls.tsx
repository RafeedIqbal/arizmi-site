/**
 * Explicit previous/next controls (TASK-004) — the assistive/keyboard
 * fallback for drag- and wheel-driven browsing (hero archive, featured
 * Builds slider). Presentational: state and index math live in the
 * consumer (see lib/interaction.ts). No "use client" directive — the
 * function props mean it renders inside an existing client tree.
 *
 * At a bound, pass `previousDisabled`/`nextDisabled`: the button stays
 * focusable (aria-disabled, click ignored) so keyboard focus is not lost
 * mid-interaction, per the ARIA carousel guidance.
 */
const BUTTON_CLASSES =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ui-border-strong)] text-[var(--ui-ink)] transition-colors hover:border-[var(--ui-accent)] hover:text-[var(--ui-accent)] aria-disabled:cursor-not-allowed aria-disabled:border-[var(--ui-border)] aria-disabled:text-[var(--ui-ink-muted)] aria-disabled:hover:border-[var(--ui-border)] aria-disabled:hover:text-[var(--ui-ink-muted)]";

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      width="9"
      height="14"
      viewBox="0 0 9 14"
      fill="none"
      aria-hidden="true"
      className={direction === "previous" ? "rotate-180" : undefined}
    >
      <path
        d="M1.5 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PrevNextControls({
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  label = "Browse items",
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: {
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  /** Group name announced by screen readers, e.g. "Browse the archive". */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={["flex items-center gap-3", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        aria-label={previousLabel}
        aria-disabled={previousDisabled || undefined}
        onClick={previousDisabled ? undefined : onPrevious}
        className={BUTTON_CLASSES}
      >
        <Chevron direction="previous" />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        aria-disabled={nextDisabled || undefined}
        onClick={nextDisabled ? undefined : onNext}
        className={BUTTON_CLASSES}
      >
        <Chevron direction="next" />
      </button>
    </div>
  );
}
