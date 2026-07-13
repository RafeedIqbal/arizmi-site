import Image from "next/image";
import Link from "next/link";
import BookingCta from "@/components/BookingCta";
import ContactTrigger from "@/components/ContactTrigger";
import CopyrightYear from "@/components/CopyrightYear";
import { PRIMARY_NAV, type NavItem } from "@/lib/content/navigation";
import { ROUTES } from "@/lib/site";

const FOOTER_DESTINATIONS: readonly { label: string; href: string }[] = [
  { label: "Home", href: ROUTES.home },
  ...PRIMARY_NAV.filter(
    (item): item is Extract<NavItem, { kind: "route" }> =>
      item.kind === "route",
  ),
];

const BOOKING_LABEL =
  PRIMARY_NAV.find((item) => item.kind === "booking")?.label ??
  "Book your build";

/**
 * Restrained global footer (D-13 safe default): wordmark, the five primary
 * destinations, booking/contact actions, and a dynamic copyright year.
 * Careers (D-14) and legal links (D-02) are intentionally absent until their
 * routes exist; no address, company number, or social accounts are invented.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[var(--page-max)] flex-col gap-[var(--space-xl)] px-[var(--section-px)] py-[var(--space-2xl)]">
        <div className="flex flex-col justify-between gap-[var(--space-xl)] sm:flex-row sm:items-start">
          <Link href={ROUTES.home} className="inline-flex" aria-label="Arizmi Labs — home">
            <Image
              src="/assets/arizmi/logos/wordmark-gradient.svg"
              alt=""
              width={168}
              height={35}
              className="h-auto w-42"
            />
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1 sm:items-end">
              {FOOTER_DESTINATIONS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <BookingCta label={BOOKING_LABEL} variant="secondary" />
          <ContactTrigger
            label="Get in touch"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          />
        </div>
        <p className="font-meta text-xs text-ink-muted">
          © <CopyrightYear /> Arizmi Labs
        </p>
      </div>
    </footer>
  );
}
