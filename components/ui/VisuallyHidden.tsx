import type { ReactNode } from "react";

/**
 * Text for assistive technology only. Server-safe. Prefer this over ad-hoc
 * `sr-only` spans so intent stays searchable.
 */
export default function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
