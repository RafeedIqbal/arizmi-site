import type { ReactNode } from "react";

/** Consistent hierarchy for route sections and compact handoff blocks. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="font-meta text-xs uppercase tracking-wider text-ink-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={`${eyebrow ? "mt-2 " : ""}text-balance text-2xl font-semibold tracking-tight sm:text-3xl`}
      >
        {title}
      </h2>
      {description ? (
        <div className="mt-4 max-w-[60ch] space-y-3 text-ink-muted">
          {description}
        </div>
      ) : null}
    </div>
  );
}
