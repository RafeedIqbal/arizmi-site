import Link from "next/link";
import { useId } from "react";
import type { ComponentPropsWithoutRef } from "react";

/*
 * Shared button/link variants (TASK-004). Server-safe: no client boundary.
 * Colors come from the surface-scoped --ui-* tokens in app/globals.css, so
 * the same variant is contrast-safe on the warm off-white canvas and inside
 * any container marked data-surface="card".
 */
const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-[var(--ui-border)] disabled:bg-transparent disabled:text-[var(--ui-ink-muted)] disabled:opacity-70 disabled:hover:bg-transparent disabled:hover:text-[var(--ui-ink-muted)]";

const VARIANT_CLASSES = {
  solid:
    "bg-[var(--ui-solid-bg)] text-[var(--ui-solid-ink)] hover:bg-[var(--ui-solid-hover-bg)] hover:text-[var(--ui-solid-hover-ink)]",
  outline:
    "border border-[var(--ui-border-strong)] text-[var(--ui-ink)] hover:border-[var(--ui-accent)] hover:text-[var(--ui-accent)]",
  ghost:
    "text-[var(--ui-ink)] underline-offset-4 hover:underline",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;

/** Variant classes for controls that cannot use these components directly. */
export function buttonClassName(
  variant: ButtonVariant = "solid",
  className?: string,
): string {
  return [BASE_CLASSES, VARIANT_CLASSES[variant], className]
    .filter(Boolean)
    .join(" ");
}

/**
 * Focusable, non-operative CTA for destinations that are intentionally
 * unavailable until a business decision is configured. `aria-disabled`
 * preserves discoverability for keyboard and screen-reader users, while the
 * responsive layout keeps the reason readable at the 320px baseline.
 */
export function UnavailableCta({
  label,
  reason,
  className,
}: {
  label: string;
  reason: string;
  className?: string;
}) {
  const reasonId = useId();

  return (
    <button
      type="button"
      aria-disabled="true"
      aria-describedby={reasonId}
      className={[
        BASE_CLASSES,
        "max-w-full cursor-not-allowed flex-wrap border border-[var(--ui-border)] text-[var(--ui-ink-muted)] sm:flex-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{label}</span>
      <span
        id={reasonId}
        className="basis-full font-meta text-[0.65rem] uppercase tracking-wider sm:basis-auto sm:text-xs"
      >
        {reason}
      </span>
    </button>
  );
}

export function Button({
  variant = "solid",
  type = "button",
  className,
  ...rest
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button type={type} className={buttonClassName(variant, className)} {...rest} />
  );
}

/**
 * Link styled as a button. Internal paths render a Next.js `Link`; external
 * URLs render a plain anchor.
 */
export function ButtonLink({
  variant = "solid",
  href,
  className,
  ...rest
}: ComponentPropsWithoutRef<"a"> & { variant?: ButtonVariant; href: string }) {
  const classes = buttonClassName(variant, className);
  if (href.startsWith("/")) {
    return <Link href={href} className={classes} {...rest} />;
  }
  return <a href={href} className={classes} {...rest} />;
}
