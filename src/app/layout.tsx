import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieNotice } from "@/components/CookieNotice";
import { SupportWidget } from "@/components/SupportWidget";
import { company } from "@/config/business";

// Self-hosted variable fonts (latin subsets): no build-time or runtime dependency on Google.
const display = localFont({ src: "../fonts/fraunces.woff2", variable: "--font-display", weight: "100 900", display: "swap" });
const body = localFont({ src: "../fonts/manrope.woff2", variable: "--font-body", weight: "200 800", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(company.domain),
  title: { default: "BruFly | Flights and stays across South Africa", template: "%s | BruFly" },
  description: company.tagline,
  openGraph: { siteName: "BruFly", type: "website", locale: "en_ZA" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b2a4a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1" style={{ paddingTop: "var(--header-h)" }}>
          {children}
        </main>
        <Footer />
        <SupportWidget />
        <CookieNotice />
      </body>
    </html>
  );
}
