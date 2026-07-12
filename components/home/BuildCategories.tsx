import Section from "@/components/ui/Section";
import Disclosure from "@/components/ui/Disclosure";
import MetaLabel from "@/components/ui/MetaLabel";
import { ButtonLink } from "@/components/ui/Button";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
import { SERVICES } from "@/lib/content/services";

const INTRO =
  "Arizmi Labs designs and develops the digital products, platforms and systems businesses need to launch, operate and grow. From customer-facing apps to internal tools, each build is shaped around the users, workflows and commercial goals behind it.";

/**
 * "What Arizmi builds" (TASK-007). Uses the same typed service source as
 * /services (SERVICES), rendering the shorter homepage summaries. Each card's
 * title and summary are always visible, so the section is fully readable
 * without JavaScript or motion; an expandable "Best for" disclosure adds the
 * supplementary audience detail and operates by keyboard and touch (the
 * Bento Expand Grid behaviour). Copy is transcribed exactly from
 * docs/redesign/specs/homepage.md section 4.
 */
export default function BuildCategories() {
  return (
    <Section aria-labelledby="build-categories-heading">
      <h2
        id="build-categories-heading"
        className="max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        What Arizmi builds
      </h2>
      <p className="mt-6 max-w-[68ch] text-lg text-ink-muted">{INTRO}</p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => (
          <li key={service.id}>
            <article className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-border-soft bg-white/40 p-6">
              <MetaLabel className="text-teal-ink">
                {String(index + 1).padStart(2, "0")}
              </MetaLabel>
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <p className="text-sm text-ink-muted">{service.homepageSummary}</p>
              <Disclosure
                className="mt-auto border-t border-border-soft pt-3"
                summaryClassName="text-sm font-semibold"
                summary={<span>Best for</span>}
              >
                <ul className="flex flex-wrap gap-2 pb-1 pt-3">
                  {service.bestFor.map((item) => (
                    <li
                      key={item}
                      className="font-meta rounded-[var(--radius-pill)] border border-border-soft px-3 py-1 text-xs tracking-wide text-ink-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <ButtonLink href={CTA_ROUTES.blueprint} variant="solid">
          {CTA_LABELS.startBlueprint}
        </ButtonLink>
      </div>
    </Section>
  );
}
