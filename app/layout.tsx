import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = localFont({
  src: "../public/New_Assets/Fonts/Manrope/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

const spaceMono = localFont({
  src: [
    {
      path: "../public/New_Assets/Fonts/Space_Mono/SpaceMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/New_Assets/Fonts/Space_Mono/SpaceMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-mono",
  display: "swap",
});

/*
 * Legacy fonts for the superseded dark theme. Existing components still
 * reference --font-inter / --font-instrument-serif; remove once every
 * section has migrated to the redesign (TASK-005+).
 */
const inter = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const instrumentSerif = localFont({
  src: "../public/fonts/InstrumentSerif-Regular.woff2",
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "Arizmi — Start-Up Apps & Websites",
  description:
    "Your technical co-founder, combining business strategy and software engineering to turn your idea into a successful business.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Arizmi — Start-Up Apps & Websites",
    description:
      "Your technical co-founder, combining business strategy and software engineering to turn your idea into a successful business.",
    url: siteUrl,
    siteName: "Arizmi",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Arizmi — Start-Up Apps & Websites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arizmi — Start-Up Apps & Websites",
    description:
      "Your technical co-founder, combining business strategy and software engineering to turn your idea into a successful business.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
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
        className={`${manrope.variable} ${spaceMono.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
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
        <Analytics />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            },
          }}
        />
      </body>
    </html>
  );
}
