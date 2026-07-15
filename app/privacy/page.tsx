import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  PRIVACY_DRAFT_NOTICE,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from "@/lib/content/privacy";
import { ROUTES } from "@/lib/site";

const DESCRIPTION =
  "How Arizmi Labs collects and uses personal information submitted through this website.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.privacy },
  openGraph: {
    title: "Privacy Policy",
    description: DESCRIPTION,
    url: ROUTES.privacy,
  },
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description={<p>Last updated: {PRIVACY_LAST_UPDATED}</p>}
      />

      {/* D-02: draft copy pending owner approval. Remove this banner (and the
          draft flag in lib/content/privacy.ts) only once the copy is approved. */}
      <Section paddingY="none" containerClassName="pb-[var(--space-2xl)]" width="narrow">
        <div className="rounded-[var(--radius-lg)] border border-dashed border-warning/50 bg-[var(--surface-subtle)] p-6">
          <p className="font-meta text-xs uppercase tracking-wider text-warning">
            {PRIVACY_DRAFT_NOTICE}
          </p>
        </div>
      </Section>

      {PRIVACY_SECTIONS.map((section, index) => {
        const headingId = `privacy-section-${index + 1}`;
        return (
          <Section
            key={section.heading}
            aria-labelledby={headingId}
            width="narrow"
            paddingY="none"
            containerClassName="pb-[var(--space-2xl)]"
          >
            <SectionHeading
              id={headingId}
              title={section.heading}
              description={
                <>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </>
              }
            />
            {section.bullets ? (
              <ul className="mt-6 max-w-[60ch] list-disc space-y-2 pl-5 text-ink-muted">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </Section>
        );
      })}
    </PageShell>
  );
}
