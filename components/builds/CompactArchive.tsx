import BuildDetail from "@/components/builds/BuildDetail";
import Disclosure from "@/components/ui/Disclosure";
import MetaLabel from "@/components/ui/MetaLabel";
import type { Build } from "@/lib/content/builds";

/**
 * Compact archive rows (TASK-010). Closed content is project name plus status
 * label; activating a row expands the full detail directly underneath it.
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
    <ul className="mt-8 flex flex-col divide-y divide-border-soft border-y border-border-soft">
      {builds.map((build) => (
        <li key={build.id}>
          <Disclosure
            headingLevel={3}
            open={openIdSet.has(build.id)}
            onOpenChange={(open) => onOpenChange(build.id, open)}
            summaryClassName="py-5"
            panelClassName="text-ink"
            summary={
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-lg font-semibold">{build.name}</span>
                <MetaLabel as="span" tone="muted">
                  {build.sourceStatus}
                </MetaLabel>
              </span>
            }
          >
            <div className="pb-6 pt-1">
              <BuildDetail build={build} />
            </div>
          </Disclosure>
        </li>
      ))}
    </ul>
  );
}
