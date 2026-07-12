import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { CTA_LABELS } from "@/lib/content/cta";
import { ROUTES } from "@/lib/site";

const HERO_COPY =
  "Arizmi BluePrint AI helps turn a rough idea, workflow or product opportunity into a Product Requirements Document (PRD)-style plan before development begins.";

export const metadata: Metadata = {
  title: "BluePrint AI — Arizmi Labs",
  description: HERO_COPY,
  alternates: { canonical: ROUTES.blueprintAi },
  openGraph: {
    title: "BluePrint AI — Arizmi Labs",
    description: HERO_COPY,
    url: ROUTES.blueprintAi,
  },
};

export default function BlueprintAiPage() {
  return (
    <PageShell currentRoute={ROUTES.blueprintAi}>
      <header className="mx-auto max-w-[var(--page-narrow)] px-[var(--section-px)] py-[var(--section-py)]">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to BluePrint AI.
        </h1>
        <p className="mt-6 text-lg text-ink-muted">{HERO_COPY}</p>
        {/* The guided intake flow ships in TASK-011–TASK-014; until then the
            entry CTA is visibly disabled rather than pointing anywhere fake. */}
        <p className="mt-8">
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-full border border-border-soft px-6 py-3 text-sm font-semibold text-ink-muted"
          >
            {CTA_LABELS.startBlueprint}
            <span className="font-meta text-xs uppercase tracking-wider">
              Guided intake coming soon
            </span>
          </span>
        </p>
      </header>
    </PageShell>
  );
}
