import type { Metadata } from "next";
import localFont from "next/font/local";
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

const siteUrl = "https://arizmi.com";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Arizmi — Start-Up Apps & Websites",
    description:
      "Your technical co-founder, combining business strategy and software engineering to turn your idea into a successful business.",
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
      </body>
    </html>
  );
}
