import type { ReactNode } from "react";

const TONE_CLASSES = {
  muted: "text-[var(--ui-ink-muted)]",
  accent: "text-[var(--ui-accent)]",
  inherit: "",
} as const;

/**
 * Space Mono metadata label (indexes, statuses, categories, counters).
 * Server-safe; colors follow the surrounding data-surface.
 */
export default function MetaLabel({
  as: Tag = "span",
  tone = "muted",
  className,
  children,
}: {
  as?: "span" | "p" | "dt" | "dd" | "h3" | "h4";
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={["font-meta text-xs uppercase tracking-wider", TONE_CLASSES[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
