"use client";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";

/**
 * Fibertherm — placeholder shell. The product-story / technology deep-dive.
 * For now: the real heading, an intro that frames the material, and a tidy
 * skeleton of three feature slots so the structure of the eventual section is
 * legible. Full copy, diagrams and certifications land in a later pass.
 */

const PILLARS = [
  {
    title: "Kompozyt, nie metal",
    body: "Tworzywo wzmacniane włóknem szklanym zamiast aluminium czy stali — drastycznie niższa przewodność cieplna.",
  },
  {
    title: "Ciepła krawędź",
    body: "Wyższa temperatura przy ramce ogranicza kondensację i eliminuje mostki termiczne na obrzeżu szyby.",
  },
  {
    title: "Trwałość EN 1279",
    body: "Stabilność pakietu i szczelność potwierdzone normą dla szyb zespolonych — na lata.",
  },
] as const;

export default function Fibertherm() {
  return (
    <Section id="fibertherm" eyebrow="Technologia FIBERTHERM">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <ScrollReveal>
          <div className="lg:sticky lg:top-28">
            <h2 className="text-balance font-jost text-display-sm font-bold text-ink">
              Materiał, który zmienia regułę.
            </h2>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-ink-2">
              FIBERTHERM to ciepła ramka dystansowa z kompozytu wzmacnianego
              włóknem szklanym. Tam, gdzie aluminium oddaje ciepło, kompozyt je
              zatrzymuje — i to robi całą różnicę dla okna.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline">
          {PILLARS.map((pillar, i) => (
            <ScrollReveal key={pillar.title} delay={0.06 * i}>
              <article className="bg-surface/50 p-7 sm:p-8">
                <div className="flex items-baseline gap-4">
                  <span className="font-jost text-sm tabular-nums text-tp-red">
                    0{i + 1}
                  </span>
                  <h3 className="font-jost text-xl font-medium text-ink">
                    {pillar.title}
                  </h3>
                </div>
                <p className="mt-3 pl-8 text-pretty text-sm leading-relaxed text-ink-2">
                  {pillar.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
