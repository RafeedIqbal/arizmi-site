import type { Metadata } from "next";
import { Suspense } from "react";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import BuildsBaseList from "@/components/builds/BuildsBaseList";
import BuildsExplorer from "@/components/builds/BuildsExplorer";
import { ButtonLink } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { BUILDS } from "@/lib/content/builds";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
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
      <PageHeader
        title="A look inside the systems we’ve shaped, built and launched."
        titleClassName="max-w-[22ch]"
        description={<p>{HERO_COPY}</p>}
        actions={
          <>
          <ButtonLink href={CTA_ROUTES.blueprint} variant="solid">
            {CTA_LABELS.startBlueprint}
          </ButtonLink>
          <BookingCta label={CTA_LABELS.bookBuildCall} variant="secondary" />
          </>
        }
      />

      <Section
        aria-labelledby="archive-heading"
        width="max"
        paddingY="none"
        containerClassName="pb-[var(--section-py)]"
      >
        <SectionHeading
          id="archive-heading"
          title="Welcome to the Archive"
        />
        {/* useSearchParams in the explorer requires a Suspense boundary; the
            fallback is the semantic base list, which is also the no-JS view. */}
        <Suspense fallback={<BuildsBaseList />}>
          <BuildsExplorer />
        </Suspense>
      </Section>
    </PageShell>
  );
}
