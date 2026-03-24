import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

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

const siteUrl = "https://www.arizmilabs.com";

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
        className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
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
