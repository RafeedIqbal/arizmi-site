"use client";

/**
 * Dynamic copyright year (D-13). Client-rendered, with the hydration warning
 * suppressed so statically generated pages cannot show a stale build-time
 * year after a calendar rollover.
 */
export default function CopyrightYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
