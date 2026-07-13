import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { NAV_SUPPORTING_LINE } from "@/lib/content/navigation";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = localFont({
  src: "../public/fonts/manrope-variable.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

const spaceMono = localFont({
  src: [
    {
      path: "../public/fonts/space-mono-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/space-mono-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-mono",
  display: "swap",
});

const siteUrl = SITE_URL;

// Approved homepage copy (docs/specs/homepage.md hero + global menu
// supporting line). The share image comes from app/opengraph-image.tsx, so no
// static og:image path is declared here.
const HOME_TITLE = `Arizmi Labs — ${NAV_SUPPORTING_LINE}`;
const HOME_DESCRIPTION =
  "For founders and teams building beyond the obvious. We shape ideas, build systems and ship digital products that need more than a dev shop.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: siteUrl,
    siteName: "Arizmi Labs",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceMono.variable} antialiased`}
      >
        <a
          href="#main"
          className="sr-only rounded-md bg-card px-4 py-2 text-ink-on-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120]"
        >
          Skip to content
        </a>
        <SiteNav />
        {children}
        <SiteFooter />
        {process.env.VERCEL ? <Analytics /> : null}
        <Toaster
          position="bottom-center"
          theme="dark"
          closeButton
          toastOptions={{
            style: {
              background: "var(--surface-card)",
              border: "1px solid var(--border-on-card)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lifted)",
              color: "var(--ink-on-card)",
            },
          }}
        />
      </body>
    </html>
  );
}
