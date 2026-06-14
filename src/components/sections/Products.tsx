import Image from "next/image";

import ScrollReveal from "@/components/animations/ScrollReveal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import { PRODUCTS } from "@/lib/constants";

/**
 * Nasze produkty — the catalogue overview.
 *
 * Three interactive cards (ramki dystansowe / szprosy / akcesoria) pulled from
 * PRODUCTS sit side-by-side on desktop and stack to one column on mobile. Each
 * leads with a Gabriel 3D render or product photo in a recessed, hairline-framed
 * well, then the tagline (tp-red eyebrow), name (Jost), description, tp-red dot
 * bullets, and a ghost "Zamów próbkę" CTA pinned to the bottom so cards align.
 *
 * The Card carries the warm hover lift; the image well runs its own scoped
 * `group/well` so the render zooms gently on hover (pure CSS, no JS). Reveals
 * stagger as the row enters view via ScrollReveal (reduced-motion aware).
 */

/** Map product id → hero image (renders / photos live in /public/images). */
const PRODUCT_IMAGES: Record<string, { src: string; alt: string }> = {
  "ramki-dystansowe": {
    src: "/images/gabriel-3d-1.png",
    alt: "Ramka dystansowa FIBERTHERM — profil ciepłej krawędzi w pakiecie szybowym",
  },
  szprosy: {
    src: "/images/szpros.png",
    alt: "Szpros wewnątrzszybowy TermoProfi dzielący taflę pakietu",
  },
  akcesoria: {
    src: "/images/gabriel-3d-2.png",
    alt: "Akcesoria montażowe TermoProfi — łączniki i komponenty pakietu",
  },
};

export default function Products() {
  return (
    <Section id="produkty" eyebrow="Produkty" variant="dark">
      <div className="max-w-2xl">
        <h2 className="text-balance font-jost text-display-sm font-bold leading-[1.05] text-ink">
          Kompletny system ciepłej krawędzi.
        </h2>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-ink-2">
          Ramki dystansowe, szprosy i akcesoria — wszystko, czego potrzebuje
          producent szyb zespolonych, dopasowane do siebie i do normy.
        </p>
      </div>

      <ScrollReveal
        stagger
        y={28}
        className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-3"
      >
        {PRODUCTS.map((product) => {
          const image = PRODUCT_IMAGES[product.id];

          return (
            <Card
              key={product.id}
              as="article"
              interactive
              className="flex h-full flex-col gap-6 p-6 sm:p-7"
            >
              {/* Render well — recessed panel with hairline frame + top sheen. */}
              <div className="group/well relative aspect-[5/4] overflow-hidden rounded-xl border border-hairline bg-bg">
                {image ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 90vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-calm group-hover/well:scale-[1.04]"
                  />
                ) : null}
                {/* vignette to seat the render into the dark card */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_90%_at_50%_6%,transparent_52%,rgba(8,10,13,0.6)_100%)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-hairline-top"
                />
              </div>

              {/* Title block. */}
              <div className="flex flex-col gap-2">
                <span className="text-eyebrow font-medium uppercase text-tp-red">
                  {product.tagline}
                </span>
                <h3 className="font-jost text-2xl font-medium tracking-tight text-ink">
                  {product.name}
                </h3>
              </div>

              <p className="text-pretty text-[0.95rem] leading-relaxed text-ink-2">
                {product.description}
              </p>

              {/* Feature bullets — tp-red dots, hairline-divided from the copy. */}
              <ul className="flex flex-col gap-3 border-t border-hairline pt-6">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-snug text-ink"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.4rem] h-1.5 w-1.5 flex-none rounded-full bg-tp-red shadow-[0_0_10px_-1px_rgba(207,46,46,0.75)]"
                    />
                    <span className="text-pretty">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA pinned to the bottom so cards align across the row. */}
              <div className="mt-auto pt-1">
                <Button variant="ghost" href="#kontakt" className="w-full">
                  Zamów próbkę
                </Button>
              </div>
            </Card>
          );
        })}
      </ScrollReveal>
    </Section>
  );
}
