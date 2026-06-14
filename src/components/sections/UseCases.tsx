"use client";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";

/**
 * UseCases — placeholder shell. A filterable gallery of installations
 * (residential / commercial / facades). For now: the real heading and intro,
 * filter chips, and a 3×2 grid of empty image cards that read as "in
 * preparation" rather than broken. Imagery and copy land in a later pass.
 */

const FILTERS = [
  "Wszystkie",
  "Budownictwo mieszkaniowe",
  "Obiekty komercyjne",
  "Fasady",
] as const;

export default function UseCases() {
  return (
    <Section id="zastosowania" eyebrow="Zastosowania">
      <ScrollReveal>
        <div className="max-w-2xl">
          <h2 className="text-balance font-jost text-display-sm font-bold text-ink">
            Tam, gdzie liczy się każdy detal.
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-ink-2">
            Od okien w domach jednorodzinnych po wielkoformatowe fasady — ciepła
            ramka FIBERTHERM pracuje wszędzie tam, gdzie zależy nam na komforcie
            i niższych rachunkach.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <div className="mt-12 flex flex-wrap gap-2.5">
          {FILTERS.map((filter, i) => (
            <span
              key={filter}
              className={`rounded-pill border px-4 py-2 text-sm transition-colors ${
                i === 0
                  ? "border-tp-red/50 bg-tp-red/10 text-ink"
                  : "border-hairline text-ink-2"
              }`}
            >
              {filter}
            </span>
          ))}
        </div>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScrollReveal key={i} delay={0.04 * i}>
            <div
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-hairline bg-surface/50"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs uppercase tracking-[0.25em] text-ink-2/50">
                  Wkrótce
                </span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
