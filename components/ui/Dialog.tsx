"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { lockBodyScroll } from "@/lib/scrollLock";

/**
 * Accessible dialog/drawer primitive (TASK-004) for nested page UI: Builds
 * detail on small screens, team bios, and similar. Built on the native
 * <dialog> element, so focus containment, Escape handling, focus
 * restoration, and top-layer stacking (stronger than a portal) come from
 * the platform — the same approach as SiteMenu. The full-screen menu and
 * the legacy ContactModal remain their own implementations.
 *
 * The dialog surface is card black and sets data-surface="card", so nested
 * primitives restyle themselves automatically.
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  variant = "center",
  dismissOnBackdrop = true,
  closeLabel = "Close dialog",
  className,
  children,
}: {
  open: boolean;
  /** Called for every close path: Escape, close button, backdrop click. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** "center" is a modal card; "drawer" slides in from the right edge. */
  variant?: "center" | "drawer";
  dismissOnBackdrop?: boolean;
  closeLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    return lockBodyScroll();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-surface="card"
      className={[`ui-dialog ui-dialog--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      /* Fires on every native close path (Escape included); keeps the
         controlling state in sync. */
      onClose={onClose}
      onClick={(event) => {
        /* With zero padding on the <dialog>, only backdrop clicks hit the
           element itself. */
        if (dismissOnBackdrop && event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
    >
      <div className="flex min-h-full flex-col p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <header className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={closeLabel}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ui-border-strong)] text-[var(--ui-ink)] transition-colors hover:border-[var(--ui-accent)] hover:text-[var(--ui-accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M1.5 1.5l13 13M14.5 1.5l-13 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm text-[var(--ui-ink-muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex-1">{children}</div>
      </div>
    </dialog>
  );
}
