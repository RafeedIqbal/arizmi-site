import { FILTER_TABS, type BuildFilterId } from "@/lib/content/builds";

/**
 * Builds filter controls (TASK-008). These filter one list rather than swap
 * panels, so they are a toolbar of toggle buttons with `aria-pressed`, not an
 * ARIA tablist — using `role="tab"` here would mislead assistive technology
 * about the behaviour (docs/specs/builds.md).
 */
export default function BuildFilters({
  active,
  onSelect,
}: {
  active: BuildFilterId;
  onSelect: (id: BuildFilterId) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter builds"
      className="flex flex-wrap gap-2"
    >
      {FILTER_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tab.id)}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-border-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-teal-ink hover:text-teal-ink aria-pressed:border-transparent aria-pressed:bg-card aria-pressed:text-ink-on-card"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
