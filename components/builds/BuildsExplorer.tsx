"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BuildFilters from "@/components/builds/BuildFilters";
import CompactArchive from "@/components/builds/CompactArchive";
import FeaturedBuilds from "@/components/builds/FeaturedBuilds";
import LiveRegion from "@/components/ui/LiveRegion";
import {
  ALL_FILTER_ID,
  ARCHIVE_BUILDS,
  FEATURED_BUILDS,
  FILTER_TABS,
  filterBuilds,
  parseFilterId,
  type BuildFilterId,
} from "@/lib/content/builds";

const FILTER_LABELS = new Map(FILTER_TABS.map((tab) => [tab.id, tab.label]));

/**
 * Client orchestrator for the Builds archive (TASK-008 → TASK-010). The active
 * filter is the single source of truth and lives in the `filter` query
 * parameter, so it is shareable and survives back/forward navigation; an
 * unknown value falls back to "All" without error. The featured selection and
 * per-row compact disclosures are deliberately component-local state, keeping
 * the three interactions independent so they cannot conflict.
 */
export default function BuildsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = parseFilterId(searchParams.get("filter"));

  const setFilter = (id: BuildFilterId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === ALL_FILTER_ID) params.delete("filter");
    else params.set("filter", id);
    const query = params.toString();
    // push (not replace) so browser back/forward restores prior filters.
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const featured = filterBuilds(FEATURED_BUILDS, active);
  const compact = filterBuilds(ARCHIVE_BUILDS, active);
  const total = featured.length + compact.length;
  const label = FILTER_LABELS.get(active) ?? "All";

  return (
    <div className="mt-8">
      <BuildFilters active={active} onSelect={setFilter} />

      <p className="mt-6 font-meta text-xs uppercase tracking-wider text-ink-muted">
        {total} {total === 1 ? "build" : "builds"}
        {active === ALL_FILTER_ID ? "" : ` · ${label}`}
      </p>
      <LiveRegion>
        {`Showing ${total} ${total === 1 ? "build" : "builds"} in ${label}.`}
      </LiveRegion>

      {total === 0 ? (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-border-strong p-8 text-center">
          <p className="text-lg font-semibold">No builds in this filter yet.</p>
          <p className="mt-2 text-ink-muted">
            This category has nothing to show right now.
          </p>
          <button
            type="button"
            onClick={() => setFilter(ALL_FILTER_ID)}
            className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-border-strong px-5 py-2 text-sm font-semibold transition-colors hover:border-teal-ink hover:text-teal-ink"
          >
            View all builds
          </button>
        </div>
      ) : (
        <>
          {featured.length > 0 ? (
            <section aria-labelledby="featured-heading" className="mt-12">
              <h3
                id="featured-heading"
                className="text-xl font-semibold tracking-tight"
              >
                Featured builds
              </h3>
              <FeaturedBuilds key={active} builds={featured} />
            </section>
          ) : null}

          {compact.length > 0 ? (
            <section aria-labelledby="compact-heading" className="mt-16">
              <h3
                id="compact-heading"
                className="text-xl font-semibold tracking-tight"
              >
                More from the archive
              </h3>
              <CompactArchive builds={compact} />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
