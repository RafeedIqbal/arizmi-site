"use client";

import { useEffect } from "react";
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

function toUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function writeVisibleState(
  params: URLSearchParams,
  nextFeaturedId: string | null,
  nextOpenIds: readonly string[],
) {
  if (nextFeaturedId) params.set("featured", nextFeaturedId);
  else params.delete("featured");

  params.delete("open");
  for (const id of nextOpenIds) params.append("open", id);
}

/**
 * Client orchestrator for the Builds archive (TASK-008 → TASK-010). The active
 * filter is the single source of truth and lives in the `filter` query
 * parameter, so it is shareable and survives back/forward navigation; an
 * unknown value falls back to "All" without error. Featured selection and the
 * independently open compact rows are URL state too, so the complete view can
 * be shared and restored without turning every card interaction into a browser
 * history entry.
 */
export default function BuildsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawFilter = searchParams.get("filter");
  const active = parseFilterId(rawFilter);

  const featured = filterBuilds(FEATURED_BUILDS, active);
  const compact = filterBuilds(ARCHIVE_BUILDS, active);
  const rawFeaturedId = searchParams.get("featured");
  const selectedFeaturedId =
    featured.find((build) => build.id === rawFeaturedId)?.id ??
    featured[0]?.id ??
    null;
  const requestedOpenIds = new Set(searchParams.getAll("open"));
  const openCompactIds = compact
    .filter((build) => requestedOpenIds.has(build.id))
    .map((build) => build.id);

  // Canonicalise direct/shared URLs: discard unknown filter/build ids, remove
  // duplicate or filtered-out rows, and select the first visible featured
  // build whenever the requested selection is unavailable.
  const currentQuery = searchParams.toString();
  const canonicalParams = new URLSearchParams(currentQuery);
  if (rawFilter !== null && active === ALL_FILTER_ID) {
    canonicalParams.delete("filter");
  }
  writeVisibleState(
    canonicalParams,
    selectedFeaturedId,
    openCompactIds,
  );
  const canonicalQuery = canonicalParams.toString();

  useEffect(() => {
    if (canonicalQuery !== currentQuery) {
      router.replace(
        canonicalQuery ? `${pathname}?${canonicalQuery}` : pathname,
        { scroll: false },
      );
    }
  }, [canonicalQuery, currentQuery, pathname, router]);

  const setFilter = (id: BuildFilterId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === ALL_FILTER_ID) params.delete("filter");
    else params.set("filter", id);

    const nextFeatured = filterBuilds(FEATURED_BUILDS, id);
    const nextCompact = filterBuilds(ARCHIVE_BUILDS, id);
    const nextFeaturedId =
      nextFeatured.find((build) => build.id === selectedFeaturedId)?.id ??
      nextFeatured[0]?.id ??
      null;
    const nextCompactIds = new Set(nextCompact.map((build) => build.id));
    const nextOpenIds = openCompactIds.filter((buildId) =>
      nextCompactIds.has(buildId),
    );
    writeVisibleState(params, nextFeaturedId, nextOpenIds);

    // push (not replace) so browser back/forward restores prior filters.
    router.push(toUrl(pathname, params), { scroll: false });
  };

  const setFeatured = (id: string) => {
    if (!featured.some((build) => build.id === id)) return;
    const params = new URLSearchParams(searchParams.toString());
    writeVisibleState(params, id, openCompactIds);
    router.replace(toUrl(pathname, params), { scroll: false });
  };

  const setCompactOpen = (id: string, isOpen: boolean) => {
    if (!compact.some((build) => build.id === id)) return;
    const requestedIds = new Set(openCompactIds);
    if (isOpen) requestedIds.add(id);
    else requestedIds.delete(id);
    const nextOpenIds = compact
      .filter((build) => requestedIds.has(build.id))
      .map((build) => build.id);

    const params = new URLSearchParams(searchParams.toString());
    writeVisibleState(params, selectedFeaturedId, nextOpenIds);
    router.replace(toUrl(pathname, params), { scroll: false });
  };

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
              <FeaturedBuilds
                key={active}
                builds={featured}
                selectedId={selectedFeaturedId ?? featured[0].id}
                onSelect={setFeatured}
              />
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
              <CompactArchive
                builds={compact}
                openIds={openCompactIds}
                onOpenChange={setCompactOpen}
              />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
