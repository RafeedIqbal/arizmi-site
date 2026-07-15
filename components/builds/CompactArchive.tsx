import BuildDetail from "@/components/builds/BuildDetail";
import BuildMedia from "@/components/builds/BuildMedia";
import Disclosure from "@/components/ui/Disclosure";
import MetaLabel from "@/components/ui/MetaLabel";
import type { Build } from "@/lib/content/builds";

/**
 * Portfolio-card archive (TASK-010). Closed content is a branded project
 * preview with the project name and status; activating a card expands the full
 * detail directly underneath it.
 *
 * Disclosure choice — multi-open, independent rows. Each row owns its own
 * expanded state (the Disclosure primitive generates unique button/panel ids),
 * so expanding one row never closes or re-announces another row's content and
 * a keyboard/screen-reader user can keep several rows open while comparing
 * builds. The controlled state is persisted by the explorer in repeated
 * `open` query parameters.
 */
export default function CompactArchive({
  builds,
  openIds,
  onOpenChange,
}: {
  builds: readonly Build[];
  openIds: readonly string[];
  onOpenChange: (id: string, open: boolean) => void;
}) {
  const openIdSet = new Set(openIds);

  return (
    <ul className="build-archive mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {builds.map((build) => {
        const isOpen = openIdSet.has(build.id);

        return (
          <li key={build.id} className="build-archive__item min-w-0">
            <Disclosure
              headingLevel={4}
              open={isOpen}
              onOpenChange={(open) => onOpenChange(build.id, open)}
              className="build-archive-card overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ui-border)] bg-[var(--surface-raised)]"
              summaryClassName="build-archive-card__trigger relative isolate aspect-[4/3] min-h-0 overflow-hidden p-0"
              panelClassName="build-archive-card__panel text-ink"
              summary={
                <span className="build-archive-card__summary absolute inset-0 flex flex-1 flex-col justify-end overflow-hidden">
                  <BuildMedia
                    build={build}
                    variant="archive"
                    className="build-archive-card__media absolute inset-0 h-full w-full"
                  />
                  <span
                    className="build-archive-card__scrim absolute inset-0"
                    aria-hidden="true"
                  />
                  <span
                    aria-hidden="true"
                    className="build-archive-card__affordance absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-pill)] border border-[var(--ui-border)] bg-canvas px-4 py-2 text-sm font-semibold"
                  >
                    {isOpen ? "Hide details" : "View details"}
                  </span>
                  <span className="build-archive-card__caption relative z-10 flex w-full flex-wrap items-end justify-between gap-x-4 gap-y-1 p-5 sm:p-6">
                    <span className="build-archive-card__name text-lg font-semibold">
                      {build.name}
                    </span>
                    <MetaLabel
                      as="span"
                      tone="muted"
                      className="build-archive-card__status"
                    >
                      {build.sourceStatus}
                    </MetaLabel>
                  </span>
                </span>
              }
            >
              <div className="build-archive-card__detail border-t border-[var(--ui-border)] p-5 sm:p-6">
                <BuildDetail build={build} />
              </div>
            </Disclosure>
          </li>
        );
      })}
    </ul>
  );
}
