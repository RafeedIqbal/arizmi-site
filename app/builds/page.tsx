import type { Metadata } from "next";
import Link from "next/link";
import BookingCta from "@/components/BookingCta";
import PageShell from "@/components/PageShell";
import { BUILDS, type Build } from "@/lib/content/builds";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
import { ROUTES } from "@/lib/site";

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

function BuildCta({ cta }: { cta: Build["cta"] }) {
  if (cta.kind === "internal") {
    return (
      <Link
        href={cta.href}
        className="inline-flex min-h-11 items-center font-semibold text-teal-ink underline-offset-4 hover:underline"
      >
        {cta.label}
      </Link>
    );
  }
  if (cta.kind === "external" && cta.url !== null) {
    return (
      <a
        href={cta.url}
        className="inline-flex min-h-11 items-center font-semibold text-teal-ink underline-offset-4 hover:underline"
      >
        {cta.label}
      </a>
    );
  }
  if (cta.kind === "external") {
    // D-06: no verified destination yet — disabled semantics, not a fake URL.
    return (
      <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 text-ink-muted">
        <span className="font-semibold">{cta.label}</span>
        <span className="font-meta text-xs uppercase tracking-wider">
          Link coming soon
        </span>
      </span>
    );
  }
  // Protected builds: non-navigational status text only.
  return (
    <span className="font-meta inline-flex min-h-11 items-center text-xs uppercase tracking-wider text-ink-muted">
      {cta.label}
    </span>
  );
}

export default function BuildsPage() {
  return (
    <PageShell>
      <header className="mx-auto max-w-[var(--page-content)] px-[var(--section-px)] pb-[var(--space-2xl)] pt-[var(--space-3xl)]">
        <h1 className="max-w-[22ch] text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          A look inside the systems we’ve shaped, built and launched.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-ink-muted">{HERO_COPY}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={CTA_ROUTES.blueprint}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-card px-6 py-3 text-sm font-semibold text-ink-on-card"
          >
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
        {/* Semantic shell only: filters, featured slider, and disclosure
            interactions arrive in TASK-008–TASK-010. */}
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {BUILDS.map((build) => (
            <li key={build.id}>
              <article className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-border-soft bg-white/40 p-6">
                <h3 className="text-xl font-semibold">{build.name}</h3>
                <dl className="font-meta flex flex-wrap gap-x-6 gap-y-1 text-xs uppercase tracking-wider text-ink-muted">
                  <div className="flex gap-2">
                    <dt>Status</dt>
                    <dd className="text-ink">{build.sourceStatus}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>Visibility</dt>
                    <dd className="text-ink">{build.visibilityLabel}</dd>
                  </div>
                </dl>
                <p className="font-meta text-xs text-ink-muted">
                  {build.capabilities.join(" · ")}
                </p>
                <p className="text-sm text-ink-muted">{build.summary}</p>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">
                    What Arizmi shaped:{" "}
                  </span>
                  {build.contribution}
                </p>
                <div className="mt-auto pt-2">
                  <BuildCta cta={build.cta} />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
