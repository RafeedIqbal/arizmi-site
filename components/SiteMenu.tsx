"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ContactModal from "@/components/ContactModal";
import { UnavailableCta } from "@/components/ui/Button";
import {
  NAV_SUPPORTING_LINE,
  PRIMARY_NAV,
  SECONDARY_NAV,
  type NavItem,
} from "@/lib/content/navigation";
import { lockBodyScroll } from "@/lib/scrollLock";
import { ROUTES } from "@/lib/site";

const ROUTE_ITEMS = PRIMARY_NAV.filter(
  (item): item is Extract<NavItem, { kind: "route" }> => item.kind === "route",
);

/**
 * Global navigation: fixed logomark + menu trigger on every route, opening a
 * full-screen card-black menu. Built on the native <dialog> element so focus
 * containment, Escape handling, and focus restoration come from the platform
 * (D-18: no Rive & Limn reference URL was supplied, so the written spec in
 * docs/specs/global.md is authoritative).
 */
export default function SiteMenu({
  bookingUrl,
}: {
  /** Server-resolved booking destination; null while D-01 is unresolved. */
  bookingUrl: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* "Get in touch" must open the contact dialog only after the menu's
     top-layer <dialog> has closed, or the portal-based modal would render
     underneath it and be inert. */
  const pendingContactRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Body scroll is locked only while the menu is open.
  useEffect(() => {
    if (!open) return;
    return lockBodyScroll();
  }, [open]);

  // Route changes (link activation, back/forward) close the menu.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const isCurrent = (href: string) =>
    href === ROUTES.home
      ? pathname === ROUTES.home
      : pathname === href || pathname.startsWith(`${href}/`);

  const currentLabel =
    pathname === ROUTES.home
      ? "Home"
      : ROUTE_ITEMS.find((item) => isCurrent(item.href))?.label;

  const handleDialogClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
    if (pendingContactRef.current) {
      pendingContactRef.current = false;
      setContactOpen(true);
    }
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
        <nav
          aria-label="Site"
          className="flex items-center justify-between pl-[max(env(safe-area-inset-left),var(--section-px))] pr-[max(env(safe-area-inset-right),var(--section-px))] pt-[max(env(safe-area-inset-top),1rem)]"
        >
          <Link
            href={ROUTES.home}
            aria-current={pathname === ROUTES.home ? "page" : undefined}
            className="chrome-chip h-11 w-11"
          >
            <Image
              src="/assets/arizmi/logos/logomark-gradient.svg"
              alt="Arizmi Labs — home"
              width={26}
              height={26}
              priority
            />
          </Link>
          {/* The closed state stays visually minimal, so the current route is
              announced to assistive technology here. */}
          {currentLabel ? (
            <span className="sr-only">Current page: {currentLabel}</span>
          ) : null}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label="Open menu"
            className="chrome-chip h-11 w-11 text-ink transition-colors hover:text-teal-ink"
          >
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1h16M1 11h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="site-menu"
        onClose={handleDialogClose}
      >
        <div className="flex min-h-full flex-col gap-[var(--space-xl)] pb-[max(env(safe-area-inset-bottom),1.5rem)] pl-[max(env(safe-area-inset-left),var(--section-px))] pr-[max(env(safe-area-inset-right),var(--section-px))] pt-[max(env(safe-area-inset-top),1rem)]">
          <div className="flex items-center justify-between">
            <Link
              href={ROUTES.home}
              aria-current={pathname === ROUTES.home ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center"
            >
              <Image
                src="/assets/arizmi/logos/logomark-gradient.svg"
                alt="Arizmi Labs — home"
                width={36}
                height={36}
              />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-on-card-strong)] text-ink-on-card transition-colors hover:border-teal-light hover:text-teal-light"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 1.5l13 13M14.5 1.5l-13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Primary" className="flex flex-1 items-center">
            <ol className="flex flex-col gap-2">
              {PRIMARY_NAV.map((item, index) => (
                <li key={item.label} className="flex items-baseline gap-4">
                  <span
                    aria-hidden="true"
                    className="font-meta text-xs text-ink-on-card-muted"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.kind === "route" ? (
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`inline-flex min-h-11 items-center text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-tight tracking-tight transition-colors ${
                        isCurrent(item.href)
                          ? "text-teal-light"
                          : "text-ink-on-card hover:text-teal-light"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : bookingUrl ? (
                    <a
                      href={bookingUrl}
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-tight tracking-tight text-ink-on-card transition-colors hover:text-teal-light"
                    >
                      {item.label}
                    </a>
                  ) : (
                    /* D-01: booking is unconfigured — meaningful disabled
                       semantics, never a "#" link. */
                    <UnavailableCta
                      label={item.label}
                      reason="Booking opens soon"
                      className="justify-start border-0 px-0 text-left text-[clamp(2rem,6vw,3.25rem)] leading-tight tracking-tight"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-6 border-t border-border-on-card pt-6">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {SECONDARY_NAV.map((item) => (
                <li key={item.label}>
                  {item.kind === "contact" ? (
                    <button
                      type="button"
                      onClick={() => {
                        pendingContactRef.current = true;
                        setOpen(false);
                      }}
                      className="inline-flex min-h-11 items-center text-base text-ink-on-card transition-colors hover:text-teal-light"
                    >
                      {item.label}
                    </button>
                  ) : (
                    /* D-14: Careers has no approved route or content yet, so
                       it is marked unavailable rather than linked anywhere. */
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-11 items-center gap-2 text-base text-ink-on-card-muted"
                    >
                      {item.label}
                      <span className="rounded-full border border-[var(--border-on-card-strong)] px-2 py-0.5 font-meta text-[0.65rem] uppercase tracking-wider">
                        Soon
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="font-meta text-xs text-ink-on-card-muted sm:text-sm">
              {NAV_SUPPORTING_LINE}
            </p>
          </div>
        </div>
      </dialog>

      {contactOpen ? (
        <ContactModal onClose={() => setContactOpen(false)} />
      ) : null}
    </>
  );
}
