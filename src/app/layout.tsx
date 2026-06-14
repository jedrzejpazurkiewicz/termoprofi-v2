import type { Metadata, Viewport } from "next";
import { Jost, Inter } from "next/font/google";
import "./globals.css";

import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import Header from "@/components/layout/Header";
import StickyCanvas from "@/components/three/StickyCanvas";
import Footer from "@/components/layout/Footer";

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://termoprofi.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TermoProfi — Ciepłe ramki do szyb zespolonych",
    template: "%s — TermoProfi",
  },
  description:
    "FIBERTHERM — ciepła ramka dystansowa do szyb zespolonych. Mniej strat ciepła, mniej kondensacji, dłuższa żywotność pakietu. Produkcja PPH OKSAN, Lubartów.",
  keywords: [
    "ciepła ramka",
    "ramka dystansowa",
    "FIBERTHERM",
    "szyby zespolone",
    "warm edge",
    "TermoProfi",
    "PPH OKSAN",
  ],
  authors: [{ name: "PPH OKSAN" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SITE_URL,
    siteName: "TermoProfi",
    title: "TermoProfi — Ciepłe ramki do szyb zespolonych",
    description:
      "FIBERTHERM — ciepła ramka dystansowa, która zmniejsza straty ciepła o 22% i ogranicza kondensację na krawędzi szyby.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TermoProfi — Ciepłe ramki do szyb zespolonych",
    description:
      "FIBERTHERM — ciepła ramka dystansowa do szyb zespolonych. Mniej strat ciepła, mniej kondensacji.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0F14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${jost.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg font-inter text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-tp-red focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Przejdź do treści
        </a>
        <SmoothScrollProvider>
          <Header />
          <StickyCanvas />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
