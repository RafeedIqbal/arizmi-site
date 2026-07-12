import type { ReactNode } from "react";

/**
 * Visually hidden live region for announcing dynamic state (active archive
 * card, filter result counts, async form status) to screen readers.
 * Server-safe. Mount it once, empty, before updates begin — live regions
 * only announce content that changes after they exist in the DOM.
 */
export default function LiveRegion({
  assertive = false,
  children,
}: {
  /** Use assertive only for time-critical messages (errors); default polite. */
  assertive?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}
