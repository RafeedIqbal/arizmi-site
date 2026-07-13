import BuildDetail from "@/components/builds/BuildDetail";
import { BUILDS } from "@/lib/content/builds";

/**
 * Semantic, non-interactive archive list (TASK-008). This is the base UI the
 * enhanced explorer (filters + featured slider + compact disclosures) builds
 * on, and it doubles as the Suspense fallback and the no-JavaScript
 * experience: every build and every approved field is present and readable
 * without filtering, motion, or client hydration.
 */
export default function BuildsBaseList() {
  return (
    <div className="mt-10">
      <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">
        {BUILDS.length} builds
      </p>
      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {BUILDS.map((build) => (
          <li key={build.id}>
            <article className="flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border border-border-soft bg-[var(--surface-raised)] p-6">
              <h3 className="text-xl font-semibold">{build.name}</h3>
              <BuildDetail build={build} />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
