"use client";

import { useId, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/animations/ScrollReveal";
import TextReveal from "@/components/animations/TextReveal";
import ThermalCompare from "@/components/sections/ThermalCompare";
import FiberthermModel from "@/components/sections/FiberthermModel";

/**
 * Czym jest FIBERTHERM — the technology deep-dive.
 *
 * Two layers:
 *  1. A plain-language pitch (laymen-friendly) paired with the IGU
 *     cross-section render, framed softly with a caption that points at the
 *     warm-edge spacer inside the sealed unit.
 *  2. An expandable technical-spec panel (useState toggle) for the readers who
 *     want the numbers. The expand is a CSS grid-rows transition, so there is no
 *     layout-measuring JS; reduced-motion users get an instant, transition-free
 *     reveal via the `motion-reduce` utilities.
 *
 * Spec copy lives locally in this file (out of constants by design).
 */

interface SpecItem {
  label: string;
  value: string;
  note: string;
}

const SPEC: SpecItem[] = [
  {
    label: "Materiał",
    value: "Kompozyt szklano-poliestrowy",
    note: "Włókno szklane w matrycy z tworzywa — bez metalu na krawędzi pakietu.",
  },
  {
    label: "Stabilność wymiarowa",
    value: "Wysoka sztywność, brak pełzania",
    note: "Profil trzyma geometrię pakietu przez całą żywotność szyby zespolonej.",
  },
  {
    label: "Kompatybilność z IGU",
    value: "Pełna, bez zmian w linii",
    note: "Wpina się w istniejący proces produkcji szyb zespolonych — bez przezbrajania.",
  },
  {
    label: "Wysokość profilu",
    value: "Jak u rozwiązań konkurencyjnych",
    note: "Ta sama zabudowa krawędzi — zysk cieplny bez kompromisu w geometrii.",
  },
  {
    label: "Przewodność cieplna",
    value: "≈ 500× niższa niż aluminium",
    note: "Krawędź pakietu przestaje być mostkiem termicznym — cieplej przy ramie.",
  },
];

export default function Fibertherm() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Section id="fibertherm" eyebrow="Technologia FIBERTHERM" className="bg-white">
      {/* ---------- TOP: pitch + cross-section ---------- */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <ScrollReveal>
          <div>
            <TextReveal
              as="h2"
              className="text-balance font-jost text-display-sm font-bold text-black"
            >
              Materiał, który zmienia regułę.
            </TextReveal>
            <div className="mt-7 max-w-prose space-y-5 text-pretty text-lg leading-relaxed text-ink-2">
              <p>
                <span className="text-tp-red">FIBERTHERM</span> to ciepła ramka dystansowa nowej generacji —
                kompozyt wzmacniany włóknem szklanym w miejsce aluminium czy
                stali. Tam, gdzie metal oddaje ciepło na zewnątrz, kompozyt je
                zatrzymuje.
              </p>
              <p>
                Efekt czujesz przy oknie: cieplejsza krawędź szyby, mniej
                kondensacji przy ramie, wyższa klasa energetyczna całego
                pakietu — bez grubszej, cięższej konstrukcji.
              </p>
              <p>
                A dla producenta szyb zespolonych najważniejsze jest to, czego
                nie widać: ramka wpina się w istniejącą linię bez żadnych zmian
                w procesie. Ten sam montaż, ten sam rytm produkcji — tylko
                lepszy rezultat.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} y={32}>
          <figure className="relative">
            {/* soft ambient glow behind the render */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-radial-glow opacity-70 blur-2xl"
            />
            <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-ambient">
              <div className="relative aspect-video w-full" data-lenis-prevent>
                <Canvas
                  camera={{ position: [0, 0, 6], fov: 30 }}
                  dpr={[1, 2]}
                  gl={{ antialias: true, alpha: true }}
                  aria-label="Model 3D przekroju szyby zespolonej FIBERTHERM — przeciągnij, aby obrócić"
                >
                  <FiberthermModel />
                </Canvas>
                {/* depth: hairline top sheen + bottom vignette */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-hairline-top"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_60%,rgba(0,0,0,0.15)_100%)]"
                />
              </div>
            </div>
            <figcaption className="mt-4 flex items-start gap-3 px-1 text-sm leading-snug text-ink-2">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tp-red shadow-[0_0_8px_-1px_rgba(207,46,46,0.85)]"
              />
              <span className="text-pretty">
                Przekrój pakietu szyby zespolonej. Ciepła ramka FIBERTHERM
                oddziela tafle na krawędzi — w miejscu, gdzie tradycyjnie
                powstaje mostek termiczny. Przeciągnij, aby obrócić model.
              </span>
            </figcaption>
          </figure>
        </ScrollReveal>
      </div>

      {/* ---------- COMPARE: static 50/50 thermal split (standard vs FIBERTHERM) ---------- */}
      <ScrollReveal delay={0.04} y={32} className="mt-16 lg:mt-20">
        <ThermalCompare />
      </ScrollReveal>

      {/* ---------- EXPANDABLE: technical specification ---------- */}
      <ScrollReveal delay={0.04} className="mt-16 lg:mt-20">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-surface/30 backdrop-blur-[2px]">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="font-jost text-xl font-medium text-ink">
                Specyfikacja techniczna
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                Liczby dla tych, którzy chcą wejść głębiej.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="shrink-0"
            >
              {open ? "Zwiń specyfikację" : "Zobacz specyfikację techniczną"}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform duration-300 ease-calm motion-reduce:transition-none ${
                  open ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </div>

          {/* grid-rows trick: animates 0fr → 1fr without measuring height */}
          <div
            id={panelId}
            role="region"
            aria-label="Specyfikacja techniczna FIBERTHERM"
            className={`grid transition-[grid-template-rows] duration-500 ease-calm motion-reduce:transition-none ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <dl className="border-t border-hairline">
                {SPEC.map((item, i) => (
                  <div
                    key={item.label}
                    className={`grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8 sm:px-8 ${
                      i > 0 ? "border-t border-hairline" : ""
                    }`}
                  >
                    <dt className="flex items-baseline gap-3 font-jost text-sm uppercase tracking-wide text-ink-2">
                      <span className="tabular-nums text-tp-red/80">
                        0{i + 1}
                      </span>
                      {item.label}
                    </dt>
                    <dd>
                      <p className="font-jost text-lg font-medium text-ink">
                        {item.value}
                      </p>
                      <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-2">
                        {item.note}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
