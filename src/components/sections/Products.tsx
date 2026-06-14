"use client";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { PRODUCTS } from "@/lib/constants";

/**
 * Products — placeholder shell. The catalogue overview: distance frames, muntin
 * bars, accessories. For now: the real heading, intro, and one card per product
 * pulled from constants (name + description), each with a quiet "details soon"
 * affordance. Imagery and spec sheets land in a later pass.
 */
export default function Products() {
  return (
    <Section id="produkty" eyebrow="Produkty" variant="dark">
      <ScrollReveal>
        <div className="max-w-2xl">
          <h2 className="text-balance font-jost text-display-sm font-bold text-ink">
            Kompletny system ciepłej krawędzi.
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-ink-2">
            Ramki dystansowe, szprosy i akcesoria — wszystko, czego potrzebuje
            producent szyb zespolonych, dopasowane do siebie i do normy.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PRODUCTS.map((product, i) => (
          <ScrollReveal key={product.name} delay={0.06 * i}>
            <Card className="flex h-full flex-col">
              <div
                className="mb-6 aspect-[5/3] w-full overflow-hidden rounded-xl border border-hairline bg-bg/40"
                aria-hidden
              >
                <div className="h-full w-full bg-[radial-gradient(110%_110%_at_50%_0%,rgba(207,46,46,0.08),transparent_60%)]" />
              </div>

              <h3 className="font-jost text-xl font-medium text-ink">
                {product.name}
              </h3>
              <p className="mt-3 grow text-pretty text-sm leading-relaxed text-ink-2">
                {product.description}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm text-ink-2/70">
                Szczegóły wkrótce
                <span className="h-px w-6 bg-hairline" aria-hidden />
              </span>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.12}>
        <div className="mt-12">
          <Button variant="ghost" href="#kontakt">
            Zapytaj o pełną ofertę
          </Button>
        </div>
      </ScrollReveal>
    </Section>
  );
}
