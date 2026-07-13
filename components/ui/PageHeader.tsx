import type { ReactNode } from "react";
import Section from "@/components/ui/Section";

/** Shared route hero rhythm for every non-home marketing page. */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  width = "content",
  titleClassName,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  width?: "content" | "narrow";
  titleClassName?: string;
}) {
  return (
    <Section
      as="header"
      width={width}
      paddingY="none"
      containerClassName="pb-[var(--space-2xl)] pt-[var(--space-3xl)]"
    >
      {eyebrow ? (
        <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={[
          "text-balance text-4xl font-semibold tracking-tight sm:text-5xl",
          titleClassName ?? "max-w-[24ch]",
        ].join(" ")}
      >
        {title}
      </h1>
      {description ? (
        <div className="mt-6 max-w-[60ch] space-y-3 text-lg text-ink-muted">
          {description}
        </div>
      ) : null}
      {actions ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>
      ) : null}
    </Section>
  );
}
