import Disclosure from "@/components/ui/Disclosure";
import MetaLabel from "@/components/ui/MetaLabel";
import { SERVICES } from "@/lib/content/services";

/**
 * Progressive-disclosure list of the six services (TASK-015). Inspired by the
 * Accordion Service reference without copying it: each row keeps its number,
 * service name and one-line fit visible in the trigger, and only the longer
 * `Includes` / `Best for` detail collapses into the panel — so no service is
 * ever hidden and the closed page is still a scannable directory.
 *
 * Chosen behavior: independent, multi-open rows. Each Disclosure owns its own
 * state (unique generated button/panel ids), matching the compact Builds
 * archive, so a keyboard or screen-reader user can open several services at
 * once to compare them and opening one never closes or re-announces another.
 * All copy comes from the shared SERVICES source, so this page and the homepage
 * "What Arizmi builds" section cannot diverge.
 */
function DetailList({
  label,
  items,
}: {
  label: string;
  items: readonly string[];
}) {
  return (
    <div>
      <MetaLabel as="h4">{label}</MetaLabel>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-ink"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesAccordion() {
  return (
    <ol className="mt-10 flex flex-col divide-y divide-border-soft border-y border-border-soft">
      {SERVICES.map((service, index) => (
        <li key={service.id}>
          <Disclosure
            headingLevel={3}
            landmark={false}
            summaryClassName="py-6"
            summary={
              <span className="flex flex-1 flex-col gap-2 pr-4">
                <span className="flex items-baseline gap-3">
                  {/* Decorative ordinal — kept out of the button's name. */}
                  <span aria-hidden="true">
                    <MetaLabel as="span" tone="accent">
                      {String(index + 1).padStart(2, "0")}
                    </MetaLabel>
                  </span>
                  <span className="text-lg font-semibold sm:text-xl">
                    {service.title}
                  </span>
                </span>
                <span className="text-sm font-normal text-ink-muted">
                  {service.fit}
                </span>
              </span>
            }
          >
            <div className="grid gap-6 pb-7 sm:grid-cols-2">
              <DetailList label="Includes" items={service.includes} />
              <DetailList label="Best for" items={service.bestFor} />
            </div>
          </Disclosure>
        </li>
      ))}
    </ol>
  );
}
