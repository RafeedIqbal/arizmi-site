import BuildCta from "@/components/builds/BuildCta";
import MetaLabel from "@/components/ui/MetaLabel";
import type { Build } from "@/lib/content/builds";

/**
 * Shared detail body for a build — status, visibility, capabilities, summary,
 * the approved "What Arizmi shaped" contribution, and the CTA. Server-safe and
 * presentational, so the featured detail panel (TASK-009), the compact archive
 * disclosure (TASK-010), and the no-JS base list all render identical content
 * from the one typed source. The project name is rendered by the consumer (as
 * a heading or disclosure summary), never duplicated here.
 *
 * Only the exact approved contribution copy is ever shown; nothing derives or
 * embellishes protected detail (docs/specs/builds.md).
 */
export default function BuildDetail({ build }: { build: Build }) {
  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-wrap gap-x-8 gap-y-2">
        <div className="flex flex-col gap-1">
          <MetaLabel as="dt">Status</MetaLabel>
          <dd className="text-sm font-semibold">{build.sourceStatus}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <MetaLabel as="dt">Visibility</MetaLabel>
          <dd className="text-sm font-semibold">{build.visibilityLabel}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <MetaLabel>Capabilities</MetaLabel>
        <ul className="flex flex-wrap gap-2">
          {build.capabilities.map((capability) => (
            <li
              key={capability}
              className="font-meta rounded-[var(--radius-pill)] border border-[var(--ui-border)] px-3 py-1 text-xs tracking-wide text-[var(--ui-ink-muted)]"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[var(--ui-ink-muted)]">{build.summary}</p>

      <div className="flex flex-col gap-1">
        <MetaLabel>What Arizmi shaped</MetaLabel>
        <p className="text-sm">{build.contribution}</p>
      </div>

      <div className="pt-1">
        <BuildCta cta={build.cta} />
      </div>
    </div>
  );
}
