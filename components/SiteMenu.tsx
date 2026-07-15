"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
import { useReducedMotion } from "@/lib/useReducedMotion";

const ROUTE_ITEMS = PRIMARY_NAV.filter(
  (item): item is Extract<NavItem, { kind: "route" }> => item.kind === "route",
);

/**
 * Global navigation: fixed logomark + menu trigger on every route, opening a
 * full-screen card-black menu. Built on the native <dialog> element so focus
 * containment and top-layer isolation come from the platform. A short visual
 * state machine keeps the dialog mounted long enough for a true exit sequence
 * before focus is restored.
 */
export default function SiteMenu({
  bookingUrl,
}: {
  /** Server-resolved booking destination; null while D-01 is unresolved. */
  bookingUrl: string | null;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [menuState, setMenuState] = useState<
    "closed" | "opening" | "open" | "closing"
  >("closed");
  const [contactOpen, setContactOpen] = useState(false);
  const [chromeTones, setChromeTones] = useState<{
    logo: "light" | "dark";
    menu: "light" | "dark";
  }>({ logo: "light", menu: "light" });
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* "Get in touch" must open the contact dialog only after the menu's
     top-layer <dialog> has closed, or the portal-based modal would render
     underneath it and be inert. */
  const pendingContactRef = useRef(false);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || menuState !== "closed") return;
    dialog.showModal();
    setMenuState("opening");
  };

  const closeMenu = useCallback(() => {
    setMenuState((current) =>
      current === "closed" || current === "closing" ? current : "closing",
    );
  }, []);

  // Commit the hidden opening frame before revealing the panel and its
  // contents. This gives every browser a reliable transition start point.
  useEffect(() => {
    if (menuState !== "opening") return;
    const frame = window.requestAnimationFrame(() => setMenuState("open"));
    return () => window.cancelAnimationFrame(frame);
  }, [menuState]);

  // Native dialogs disappear immediately when closed. Defer that final close
  // until the CSS exit sequence has finished so closing feels as intentional
  // as opening.
  useEffect(() => {
    if (menuState !== "closing") return;
    const timer = window.setTimeout(
      () => dialogRef.current?.close(),
      reducedMotion ? 120 : 720,
    );
    return () => window.clearTimeout(timer);
  }, [menuState, reducedMotion]);

  // The closed chrome has no visual container, so its mark/glyph follows the
  // full-bleed surface currently passing beneath the top of the viewport.
  useEffect(() => {
    let rafId: number | null = null;
    const readTone = () => {
      rafId = null;
      const header = headerRef.current;
      const toneBelow = (control: HTMLElement | null): "light" | "dark" => {
        if (!control || !header) return "light";
        const rect = control.getBoundingClientRect();
        const x = Math.max(1, Math.min(window.innerWidth - 1, rect.left + rect.width / 2));
        const y = Math.max(1, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
        const surface = document
          .elementsFromPoint(x, y)
          .filter((element) => !header.contains(element))
          .map((element) => element.closest<HTMLElement>("[data-surface]"))
          .find((element): element is HTMLElement => Boolean(element));
        return surface?.dataset.surface === "card" ? "dark" : "light";
      };
      const next = {
        logo: toneBelow(logoRef.current),
        menu: toneBelow(triggerRef.current),
      } as const;
      setChromeTones((current) =>
        current.logo === next.logo && current.menu === next.menu ? current : next,
      );
    };
    const scheduleRead = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(readTone);
    };

    scheduleRead();
    const settleTimer = window.setTimeout(scheduleRead, 120);
    window.addEventListener("scroll", scheduleRead, { passive: true });
    window.addEventListener("resize", scheduleRead);
    document.addEventListener("transitionend", scheduleRead, true);
    return () => {
      window.removeEventListener("scroll", scheduleRead);
      window.removeEventListener("resize", scheduleRead);
      document.removeEventListener("transitionend", scheduleRead, true);
      window.clearTimeout(settleTimer);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  // Body scroll is locked only while the menu is open.
  const menuVisible = menuState !== "closed";
  useEffect(() => {
    if (!menuVisible) return;
    return lockBodyScroll();
  }, [menuVisible]);

  // Route changes (link activation, back/forward) close the menu.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    closeMenu();
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
    setMenuState("closed");
    triggerRef.current?.focus();
    if (pendingContactRef.current) {
      pendingContactRef.current = false;
      setContactOpen(true);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      >
        <nav
          aria-label="Site"
          className="flex items-center justify-between pl-[max(env(safe-area-inset-left),var(--section-px))] pr-[max(env(safe-area-inset-right),var(--section-px))] pt-[max(env(safe-area-inset-top),1rem)]"
        >
          <Link
            ref={logoRef}
            href={ROUTES.home}
            aria-current={pathname === ROUTES.home ? "page" : undefined}
            className="site-chrome-control site-chrome-logo"
            data-tone={chromeTones.logo}
          >
            <Image
              src={
                chromeTones.logo === "dark"
                  ? "/assets/arizmi/logos/logomark-white.svg"
                  : "/assets/arizmi/logos/logomark-gradient.svg"
              }
              alt="Arizmi Labs — home"
              width={60}
              height={60}
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
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-expanded={menuState === "opening" || menuState === "open"}
            aria-label="Open menu"
            className="site-chrome-control"
            data-tone={chromeTones.menu}
          >
            <svg
              width="26"
              height="18"
              viewBox="0 0 26 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1h24M1 9h24M1 17h24"
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
        data-state={menuState}
        data-surface="card"
        className="site-menu"
        onClose={handleDialogClose}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="site-menu__frame">
          <header className="site-menu__header">
            <Link
              href={ROUTES.home}
              aria-current={pathname === ROUTES.home ? "page" : undefined}
              onClick={closeMenu}
              className="site-menu__brand"
            >
              <Image
                src="/assets/arizmi/logos/logomark-white.svg"
                alt="Arizmi Labs — home"
                width={42}
                height={42}
              />
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="site-menu__close"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2l18 18M20 2L2 20"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <nav aria-label="Primary" className="site-menu__primary">
            <ol className="site-menu__list">
              {PRIMARY_NAV.map((item, index) => (
                <li
                  key={item.label}
                  className="site-menu__item"
                  style={
                    {
                      "--menu-open-delay": `${150 + index * 55}ms`,
                      "--menu-close-delay": `${index * 18}ms`,
                    } as CSSProperties
                  }
                >
                  {item.kind === "route" ? (
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      data-current={isCurrent(item.href) || undefined}
                      onClick={closeMenu}
                      className="site-menu__link"
                    >
                      {item.label}
                    </Link>
                  ) : bookingUrl ? (
                    <a
                      href={bookingUrl}
                      rel="noreferrer"
                      onClick={closeMenu}
                      className="site-menu__link"
                    >
                      {item.label}
                    </a>
                  ) : (
                    /* D-01: booking is unconfigured — meaningful disabled
                       semantics, never a "#" link. */
                    <UnavailableCta
                      label={item.label}
                      reason="Booking opens soon"
                      className="site-menu__link site-menu__link--unavailable"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <footer className="site-menu__footer">
            <ul className="site-menu__secondary">
              {SECONDARY_NAV.map((item) => (
                <li key={item.label}>
                  {item.kind === "contact" ? (
                    <button
                      type="button"
                      onClick={() => {
                        pendingContactRef.current = true;
                        closeMenu();
                      }}
                      className="site-menu__secondary-link"
                    >
                      {item.label}
                    </button>
                  ) : (
                    /* D-14: Careers has no approved route or content yet, so
                       it is marked unavailable rather than linked anywhere. */
                    <span
                      aria-disabled="true"
                      className="site-menu__secondary-link site-menu__secondary-link--unavailable"
                    >
                      {item.label}
                      <span className="site-menu__soon">
                        Soon
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="site-menu__supporting-line">
              <span>{NAV_SUPPORTING_LINE}</span>
            </p>
          </footer>
        </div>
      </dialog>

      {contactOpen ? (
        <ContactModal onClose={() => setContactOpen(false)} />
      ) : null}
    </>
  );
}
