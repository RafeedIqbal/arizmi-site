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
 * so expanding one row never mutates or re-announces another row's content and
 * a keyboard/screen-reader user can keep several rows open while comparing
 * builds. This is deliberately independent of the featured selection and the
 * active filter, so the three states cannot conflict.
 */
export default function CompactArchive({
  builds,
}: {
  builds: readonly Build[];
}) {
  return (
    <ul className="mt-8 flex flex-col divide-y divide-border-soft border-y border-border-soft">
      {builds.map((build) => (
        <li key={build.id}>
          <Disclosure
            headingLevel={3}
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
