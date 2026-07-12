import Section from "@/components/ui/Section";
import BookingCta from "@/components/BookingCta";
import { CTA_LABELS } from "@/lib/content/cta";

/**
 * Homepage closing CTA (TASK-007). Copy transcribed exactly from
 * docs/specs/homepage.md section 5. The booking action routes through
 * the centralized, environment-backed BookingCta (D-01), which renders a
 * visibly disabled control — never a "#" link — until the URL is configured.
 */
export default function ClosingCta() {
  return (
    <Section width="narrow" aria-labelledby="closing-cta-heading">
      <h2
        id="closing-cta-heading"
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Good ideas deserve better systems.
      </h2>
      <p className="mt-6 text-lg text-ink-muted">
        Arizmi helps teams move from idea to live product quickly, with the
        structure, workflow and technical thinking needed to build it properly
        from the start.
      </p>
      <p className="mt-4 text-lg text-ink-muted">
        This means fewer wasted decisions, cleaner handovers and a first version
        that is easier to launch, test and improve.
      </p>
      <div className="mt-8">
        <BookingCta label={CTA_LABELS.bookBuildCall} />
      </div>
    </Section>
  );
}
