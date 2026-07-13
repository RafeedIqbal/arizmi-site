import type { Metadata } from "next";
import Image from "next/image";
import AboutTicker from "@/components/about/AboutTicker";
import TeamGallery from "@/components/about/TeamGallery";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { CTA_LABELS } from "@/lib/content/cta";
import { ROUTES } from "@/lib/site";

/**
 * D-10: no approved statistics exist. The image-first stats layout is gated to
 * non-production so mockup numbers can never ship as fact; it exists only as a
 * clearly-labelled placeholder to review the layout before values are approved.
 */
const SHOW_STATS_PLACEHOLDER = process.env.NODE_ENV !== "production";

const HERO_COPY =
  "Arizmi Labs is a product and software studio helping founders, operators and teams turn early ideas into working digital products, platforms and AI-enabled systems.";

export const metadata: Metadata = {
  title: "About Arizmi Labs",
  description: HERO_COPY,
  alternates: { canonical: ROUTES.about },
  openGraph: {
    title: "About Arizmi Labs",
    description: HERO_COPY,
    url: ROUTES.about,
  },
};

const PRINCIPLES = [
  {
    name: "Move fast, with structure",
    copy: "Speed matters, but so do the decisions behind the build.",
  },
  {
    name: "Build around the user",
    copy: "The product has to make sense for the people using it, not just the team commissioning it.",
  },
  {
    name: "Leave room for the next version",
    copy: "A strong first version should be able to launch, learn and improve.",
  },
] as const;

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        title="For people building something that does not exist yet."
        titleClassName="max-w-[22ch]"
        description={
          <>
            <p>{HERO_COPY}</p>
            <p>
              We bring together product thinking, technical build and commercial
              judgement, so the thing in your head can become something people can
              use.
            </p>
          </>
        }
      />

      {/* Statistics section is gated: no approved label/value pairs exist yet
          (D-10), so the reference-mockup numbers must never ship as facts. In
          production this branch is absent; in development it shows a labelled
          placeholder that holds the image-first layout for review. */}
      {SHOW_STATS_PLACEHOLDER ? (
        <Section
          aria-labelledby="stats-heading"
          paddingY="none"
          containerClassName="pb-[var(--space-2xl)]"
        >
          <div className="rounded-[var(--radius-lg)] border border-dashed border-warning/50 bg-[var(--surface-subtle)] p-6">
            <p className="font-meta text-xs uppercase tracking-wider text-warning">
              Development only — awaiting approved statistics (D-10)
            </p>
            <h2
              id="stats-heading"
              className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              By the numbers
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((slot) => (
                <li key={slot} className="border-t border-border-soft pt-4">
                  <p className="text-3xl font-semibold text-ink-muted">—</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Stat {slot}: value pending approval
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <Section
        aria-labelledby="why-arizmi-heading"
        paddingY="none"
        containerClassName="pb-[var(--space-2xl)]"
      >
        <div className="about-why">
          <div>
            <SectionHeading
              id="why-arizmi-heading"
              title="Why Arizmi?"
              description={
                <>
                  <p>
                    The name Arizmi is drawn from al-Khwarizmi, one of history’s great
                    system thinkers. His work helped give the world algebra, algorithms
                    and a new way to break complexity down into something solvable.
                  </p>
                  <p>
                    This is the idea behind the studio: take something complex, find
                    the logic inside it and turn it into something useful.
                  </p>
                </>
              }
            />
          </div>
          {/* D-12: no approved "Why Arizmi?" image exists, so this is an
              abstract brand-system panel (not stock imagery) built from brand
              tokens and the gradient logomark. Decorative only. */}
          <div className="about-why__visual" aria-hidden="true">
            <Image
              src="/assets/arizmi/logomark-white.png"
              alt=""
              width={140}
              height={140}
              className="about-why__mark"
            />
          </div>
        </div>
      </Section>

      <Section
        aria-labelledby="principles-heading"
        paddingY="none"
        containerClassName="pb-[var(--space-2xl)]"
      >
        <SectionHeading
          id="principles-heading"
          title="The way we think"
          description={<p>We work with three core principles in mind:</p>}
        />
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.name}
              className="rounded-[var(--radius-lg)] border border-border-soft bg-[var(--surface-raised)] p-6"
            >
              <p className="font-meta text-xs uppercase tracking-wider text-teal-ink">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{principle.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{principle.copy}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        aria-labelledby="team-heading"
        paddingY="none"
        containerClassName="pb-[var(--space-2xl)]"
      >
        <SectionHeading
          id="team-heading"
          title="The team in the lab"
          description={
            <p>
              Arizmi brings together product, software, AI, strategy and operations
              thinking, so ideas can be shaped, built and improved from more than
              one angle.
            </p>
          }
        />
        <TeamGallery />
      </Section>

      <section className="pb-[var(--space-2xl)]">
        <AboutTicker />
      </section>

      <Section
        aria-labelledby="ready-heading"
        width="narrow"
        paddingY="none"
        containerClassName="pb-[var(--section-py)]"
      >
        <SectionHeading
          id="ready-heading"
          title="Ready to build?"
          description={
            <>
              <p>
                Early idea, messy workflow, ambitious product or system nobody has
                built for you properly yet, this is where Arizmi is useful.
              </p>
              <p>
                We help find the shape, build the system and move it towards
                something people can use.
              </p>
            </>
          }
        />
        <div className="mt-8">
          <BookingCta label={CTA_LABELS.bookBuildCall} />
        </div>
      </Section>
    </PageShell>
  );
}
