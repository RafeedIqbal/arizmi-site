import type { Metadata } from "next";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import ServicesAccordion from "@/components/services/ServicesAccordion";
import { ButtonLink } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
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
      <PageHeader
        title="Product and software development for ideas that need more than a template."
        description={<p>{HERO_COPY}</p>}
        actions={<BookingCta label={CTA_LABELS.bookYourBuildCall} />}
      />

      <Section
        aria-labelledby="services-heading"
        paddingY="none"
        containerClassName="pb-[var(--space-2xl)]"
      >
        <SectionHeading
          id="services-heading"
          eyebrow="What we do"
          title="Services"
        />
        <ServicesAccordion />
      </Section>

      <Section
        aria-labelledby="blueprint-handoff-heading"
        width="narrow"
        paddingY="none"
        containerClassName="pb-[var(--section-py)]"
      >
        <SectionHeading
          id="blueprint-handoff-heading"
          title="Not sure what you need yet? Start with BluePrint AI"
          description={
            <>
              <p>
                If the product is still unclear, Arizmi BluePrint AI helps turn the
                idea, workflow or opportunity into a Product Requirements Document
                (PRD)-style plan before development begins.
              </p>
              <p>
                It helps define the users, features, scope, complexity, risks and
                first version, so the right service route becomes easier to choose.
              </p>
            </>
          }
        />
        <p className="mt-8">
          <ButtonLink href={CTA_ROUTES.blueprint} variant="solid">
            {CTA_LABELS.startBlueprint}
          </ButtonLink>
        </p>
      </Section>
    </PageShell>
  );
}
