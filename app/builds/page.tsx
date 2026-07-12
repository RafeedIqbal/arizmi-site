import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import BuildsBaseList from "@/components/builds/BuildsBaseList";
import BuildsExplorer from "@/components/builds/BuildsExplorer";
import { BUILDS } from "@/lib/content/builds";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
import { buttonClassName } from "@/components/ui/Button";
import { ROUTES, SITE_URL } from "@/lib/site";

const HERO_COPY =
  "From public websites and digital platforms to private AI systems, internal tools and product concepts, the Arizmi build archive shows the range of ideas we help turn into working systems.";

export const metadata: Metadata = {
  title: "Builds — Arizmi Labs",
  description: HERO_COPY,
  alternates: { canonical: ROUTES.builds },
  openGraph: {
    title: "Builds — Arizmi Labs",
    description: HERO_COPY,
    url: ROUTES.builds,
  },
};

/**
 * Structured data for public factual builds only (TASK-010). Protected work is
 * excluded and only approved name/summary copy is emitted — no contribution
 * detail, no visibility internals, and no URLs (D-06).
 */
function BuildsStructuredData() {
  const publicBuilds = BUILDS.filter((build) => build.visibility !== "protected");
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Builds — Arizmi Labs",
    description: HERO_COPY,
    url: `${SITE_URL}${ROUTES.builds}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: publicBuilds.map((build, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: build.name,
          description: build.summary,
        },
      })),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function BuildsPage() {
  return (
    <PageShell>
      <BuildsStructuredData />
      <header className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)] pt-[var(--space-3xl)]">
        <h1 className="max-w-[22ch] text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          A look inside the systems we’ve shaped, built and launched.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-ink-muted">{HERO_COPY}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href={CTA_ROUTES.blueprint} className={buttonClassName("solid")}>
            {CTA_LABELS.startBlueprint}
          </Link>
          <BookingCta label={CTA_LABELS.bookBuildCall} variant="secondary" />
        </div>
      </header>

      <section
        aria-labelledby="archive-heading"
        className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--section-py)]"
      >
        <h2
          id="archive-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Welcome to the Archive
        </h2>
        {/* useSearchParams in the explorer requires a Suspense boundary; the
            fallback is the semantic base list, which is also the no-JS view. */}
        <Suspense fallback={<BuildsBaseList />}>
          <BuildsExplorer />
        </Suspense>
      </section>
    </PageShell>
  );
}
