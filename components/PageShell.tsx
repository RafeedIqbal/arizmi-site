import Image from "next/image";
import Link from "next/link";
import { PRIMARY_NAV, type NavItem } from "@/lib/content/navigation";
import { ROUTES, type AppRoute } from "@/lib/site";

const ROUTE_NAV_ITEMS = PRIMARY_NAV.filter(
  (item): item is Extract<NavItem, { kind: "route" }> => item.kind === "route",
);

/**
 * Shared shell for the redesigned routes: skip link, an interim header, and
 * the main landmark. The header is a plain route list so the shells are
 * reachable by client navigation; TASK-003 replaces it with the logomark +
 * menu-icon navigation and adds the global footer (D-13).
 */
export default function PageShell({
  currentRoute,
  children,
}: {
  currentRoute: AppRoute;
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-card px-4 py-2 text-ink-on-card focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <header className="mx-auto flex w-full max-w-[var(--page-max)] items-center justify-between gap-6 px-[var(--section-px)] py-5">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center"
          aria-current={currentRoute === ROUTES.home ? "page" : undefined}
        >
          <Image
            src="/assets/arizmi/logomark-gradient.svg"
            alt="Arizmi Labs — home"
            width={40}
            height={40}
            priority
          />
        </Link>
        <nav aria-label="Site">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {ROUTE_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={currentRoute === item.href ? "page" : undefined}
                  className={`font-meta text-xs uppercase tracking-wider underline-offset-4 hover:underline ${
                    currentRoute === item.href ? "text-teal-ink underline" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main">{children}</main>
    </>
  );
}
