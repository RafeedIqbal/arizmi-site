import type { Metadata } from "next";
import Link from "next/link";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import ServicesAccordion from "@/components/services/ServicesAccordion";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
import { ROUTES } from "@/lib/site";

const HERO_COPY =
  "Arizmi Labs helps founders, operators and teams shape, design and build digital products, platforms, AI systems and operational tools, from early ideas to live products.";

export const metadata: Metadata = {
  title: "Product and Software Development Services — Arizmi Labs",
  description: HERO_COPY,
  alternates: { canonical: ROUTES.services },
  openGraph: {
    title: "Product and Software Development Services — Arizmi Labs",
    description: HERO_COPY,
    url: ROUTES.services,
  },
};

export default function ServicesPage() {
  return (
    <PageShell>
      <header className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)] pt-[var(--space-3xl)]">
        <h1 className="max-w-[24ch] text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Product and software development for ideas that need more than a
          template.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-ink-muted">{HERO_COPY}</p>
        <div className="mt-8">
          <BookingCta label={CTA_LABELS.bookYourBuildCall} />
        </div>
      </header>

      <section
        aria-labelledby="services-heading"
        className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)]"
      >
        <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">
          What we do
        </p>
        <h2
          id="services-heading"
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Services
        </h2>
        <ServicesAccordion />
      </section>

      <section
        aria-labelledby="blueprint-handoff-heading"
        className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] pb-[var(--section-py)]"
      >
        <h2
          id="blueprint-handoff-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Not sure what you need yet? Start with BluePrint AI
        </h2>
        <p className="mt-4 text-ink-muted">
          If the product is still unclear, Arizmi BluePrint AI helps turn the
          idea, workflow or opportunity into a Product Requirements Document
          (PRD)-style plan before development begins.
        </p>
        <p className="mt-3 text-ink-muted">
          It helps define the users, features, scope, complexity, risks and
          first version, so the right service route becomes easier to choose.
        </p>
        <p className="mt-8">
          <Link
            href={CTA_ROUTES.blueprint}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-card px-6 py-3 text-sm font-semibold text-ink-on-card"
          >
            {CTA_LABELS.startBlueprint}
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
