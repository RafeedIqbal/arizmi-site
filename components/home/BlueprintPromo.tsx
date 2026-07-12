import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";

/**
 * "Start with BluePrint" (TASK-007). Rendered on a card-black surface so it
 * reads as a deliberate visual bridge from the process steps into the
 * product-scoping experience. Copy is transcribed exactly from
 * docs/specs/homepage.md section 3.
 */
export default function BlueprintPromo() {
  return (
    <Section
      surface="card"
      width="narrow"
      aria-labelledby="blueprint-promo-heading"
    >
      <h2
        id="blueprint-promo-heading"
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Start with BluePrint
      </h2>
      <p className="mt-6 text-lg text-ink-on-card-muted">
        Most ideas are not ready to build on day one. Arizmi BluePrint AI helps
        turn a rough idea, messy workflow or product opportunity into a clear
        product plan before development begins.
      </p>
      <p className="mt-4 text-lg text-ink-on-card-muted">
        It works like a Product Requirements Document (PRD), outlining what the
        product needs to do, who it is for, what should be built first, what
        could create complexity and what needs to be considered before anyone
        starts writing code.
      </p>
      <div className="mt-8">
        <ButtonLink href={CTA_ROUTES.blueprint} variant="solid">
          {CTA_LABELS.startBlueprint}
        </ButtonLink>
      </div>
    </Section>
  );
}
