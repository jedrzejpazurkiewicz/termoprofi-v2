import type { Metadata, Viewport } from "next";
import { Jost, Inter } from "next/font/google";
import "./globals.css";

import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import Header from "@/components/layout/Header";
import StickyCanvas from "@/components/three/StickyCanvas";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/lib/constants";

const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://termoprofi.com";

// Placeholder OG/Twitter image — reusing an existing high-quality render.
// Dimensions match the actual file (2396×1334); replace with dedicated 1200×630 art later.
const OG_IMAGE = {
  url: "/images/gabriel-3d-1.png",
  width: 2396,
  height: 1334,
  alt: "TermoProfi FIBERTHERM — ciepła ramka dystansowa do szyb zespolonych",
};

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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "TermoProfi — Ciepłe ramki do szyb zespolonych",
    description:
      "FIBERTHERM — ciepła ramka dystansowa do szyb zespolonych. Mniej strat ciepła, mniej kondensacji.",
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0F14",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE.brand,
      legalName: SITE.company,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo-original.png`,
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ul. Strefowa 30",
        addressLocality: "Lubartów",
        postalCode: "21-100",
        addressCountry: "PL",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: SITE.brand,
      legalName: SITE.company,
      url: SITE_URL,
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ul. Strefowa 30",
        addressLocality: "Lubartów",
        postalCode: "21-100",
        addressCountry: "PL",
      },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${jost.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg font-inter text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
