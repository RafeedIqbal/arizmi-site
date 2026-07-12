"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Disclosure/accordion primitive (TASK-004): native button semantics,
 * aria-expanded/aria-controls with stable generated IDs, and a labelled
 * panel region. Uncontrolled by default (`defaultOpen`); pass `open` +
 * `onOpenChange` for controlled single-open accordions. Content stays in
 * the DOM when closed (collapsed + inert), so open panels remain fully
 * usable without animation.
 */
export default function Disclosure({
  summary,
  headingLevel,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  summaryClassName,
  panelClassName,
  children,
}: {
  /** Button content; keep it visible-text-first for accessible naming. */
  summary: ReactNode;
  /** Wraps the trigger in a heading for the ARIA accordion pattern. */
  headingLevel?: 2 | 3 | 4;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  summaryClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  const buttonId = useId();
  const panelId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const toggle = () => {
    if (controlledOpen === undefined) setUncontrolledOpen((current) => !current);
    onOpenChange?.(!isOpen);
  };

  const trigger = (
    <button
      type="button"
      id={buttonId}
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={toggle}
      className={[
        "group flex min-h-11 w-full items-center justify-between gap-4 text-left text-[var(--ui-ink)]",
        summaryClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {summary}
      <svg
        width="14"
        height="9"
        viewBox="0 0 14 9"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none"
      >
        <path
          d="M1 1.5l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  const Heading =
    headingLevel === 2 ? "h2" : headingLevel === 3 ? "h3" : headingLevel === 4 ? "h4" : null;

  return (
    <div className={className}>
      {Heading ? <Heading className="m-0">{trigger}</Heading> : trigger}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        data-open={isOpen || undefined}
        className={["ui-disclosure__panel", panelClassName].filter(Boolean).join(" ")}
      >
        {/* inert removes the collapsed content from the tab order and the
            accessibility tree while the grid transition animates height. */}
        <div inert={!isOpen} className="ui-disclosure__content">
          {children}
        </div>
      </div>
    </div>
  );
}
