import type { Metadata } from "next";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import { CTA_LABELS } from "@/lib/content/cta";
import { TEAM } from "@/lib/content/team";
import { ROUTES } from "@/lib/site";

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
    <PageShell currentRoute={ROUTES.about}>
      <header className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)] pt-[var(--space-3xl)]">
        <h1 className="max-w-[22ch] text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          For people building something that does not exist yet.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-ink-muted">{HERO_COPY}</p>
        <p className="mt-3 max-w-[60ch] text-lg text-ink-muted">
          We bring together product thinking, technical build and commercial
          judgement, so the thing in your head can become something people can
          use.
        </p>
      </header>

      {/* Statistics section intentionally omitted: D-10 — no approved
          label/value pairs exist, and the reference-mockup numbers must not
          ship as facts. TASK-016 adds the section once values are approved. */}

      <section
        aria-labelledby="why-arizmi-heading"
        className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] pb-[var(--space-2xl)]"
      >
        <h2
          id="why-arizmi-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Why Arizmi?
        </h2>
        {/* Copy-only shell: the paired image/brand visual is pending D-12. */}
        <p className="mt-4 text-ink-muted">
          The name Arizmi is drawn from al-Khwarizmi, one of history’s great
          system thinkers. His work helped give the world algebra, algorithms
          and a new way to break complexity down into something solvable.
        </p>
        <p className="mt-3 text-ink-muted">
          This is the idea behind the studio: take something complex, find the
          logic inside it and turn it into something useful.
        </p>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)]"
      >
        <h2
          id="principles-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          The way we think
        </h2>
        <p className="mt-4 text-ink-muted">
          We work with three core principles in mind:
        </p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.name}
              className="rounded-[var(--radius-lg)] border border-border-soft bg-white/40 p-6"
            >
              <p className="font-meta text-xs uppercase tracking-wider text-teal-ink">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{principle.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{principle.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="team-heading"
        className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)]"
      >
        <h2
          id="team-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          The team in the lab
        </h2>
        <p className="mt-4 max-w-[60ch] text-ink-muted">
          Arizmi brings together product, software, AI, strategy and operations
          thinking, so ideas can be shaped, built and improved from more than
          one angle.
        </p>
        {/* Semantic shell only: the carousel/"Read more" disclosure and the
            D-11 image placeholder treatment arrive in TASK-016. Full bios are
            rendered inline so no content hides behind a missing interaction. */}
        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {TEAM.map((member) => (
            <li key={member.id}>
              <article className="h-full rounded-[var(--radius-lg)] border border-border-soft bg-white/40 p-6">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="mt-2 font-medium">{member.cardLead}</p>
                {member.bio.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm text-ink-muted">
                    {paragraph}
                  </p>
                ))}
                <p className="font-meta mt-4 text-xs uppercase tracking-wider text-ink-muted">
                  Focus: {member.focus.join(", ")}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Ticker deferred to TASK-016: its copy duplicates the H1 above, and
          the motion/reduced-motion behavior belongs with that task. */}

      <section
        aria-labelledby="ready-heading"
        className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] pb-[var(--section-py)]"
      >
        <h2
          id="ready-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Ready to build?
        </h2>
        <p className="mt-4 text-ink-muted">
          Early idea, messy workflow, ambitious product or system nobody has
          built for you properly yet, this is where Arizmi is useful.
        </p>
        <p className="mt-3 text-ink-muted">
          We help find the shape, build the system and move it towards
          something people can use.
        </p>
        <div className="mt-8">
          <BookingCta label={CTA_LABELS.bookBuildCall} />
        </div>
      </section>
    </PageShell>
  );
}
