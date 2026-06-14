"use client";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { COUNTRIES } from "@/lib/constants";

/**
 * TrustedBy — placeholder shell. FIBERTHERM ships across four continents; this
 * section will eventually carry a map and partner marks. For now: the real
 * heading, an intro line, and the live country list rendered as a clean grid of
 * chips so the geographic reach reads immediately.
 */
export default function TrustedBy() {
  return (
    <Section id="zaufali" eyebrow="Zaufali nam" variant="dark">
      <ScrollReveal>
        <div className="max-w-2xl">
          <h2 className="text-balance font-jost text-display-sm font-bold text-ink">
            Obecni na czterech kontynentach.
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-ink-2">
            Producenci szyb zespolonych w kilkunastu krajach wybierają nasze
            ciepłe ramki — od Polski po Kanadę i Koreę.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3 sm:gap-x-px lg:grid-cols-4">
          {COUNTRIES.map((country) => (
            <li
              key={country}
              className="flex items-center gap-3 bg-surface/50 px-5 py-4 text-sm text-ink-2"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tp-red/70" aria-hidden />
              {country}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </Section>
  );
}
