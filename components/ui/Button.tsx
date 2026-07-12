import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/*
 * Shared button/link variants (TASK-004). Server-safe: no client boundary.
 * Colors come from the surface-scoped --ui-* tokens in app/globals.css, so
 * the same variant is contrast-safe on the warm off-white canvas and inside
 * any container marked data-surface="card".
 */
const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors";

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
 * Classes for a visibly disabled CTA placeholder (unresolved destinations
 * like D-01 booking). Render as a `span` with `aria-disabled="true"` and a
 * reason, never a dead link.
 */
export function disabledCtaClassName(className?: string): string {
  return [
    BASE_CLASSES,
    "cursor-not-allowed border border-[var(--ui-border)] text-[var(--ui-ink-muted)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
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
