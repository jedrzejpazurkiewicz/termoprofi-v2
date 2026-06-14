"use client";

import { motion, useReducedMotion } from "framer-motion";
import BeatAnchor from "@/components/animations/BeatAnchor";
import CountUp from "@/components/animations/CountUp";
import { MATERIALS, STATS } from "@/lib/constants";

/**
 * WhyItMatters — the climax of the spine. The termo-reveal (the glass unit fully
 * heated, cold edge bleeding to warm) peaks on the fixed canvas behind these
 * numbers, so the section background stays semi-transparent and only the cards
 * themselves carry a faint surface.
 *
 * Part A — a horizontal bar chart of thermal conductivity (λ, W/m·K). The bars
 * are scaled linearly against the worst performer (Aluminium, 160), which makes
 * the FIBERTHERM bar (0.3) collapse to a near-invisible hairline. That visual
 * collapse *is* the argument.
 *
 * Part B — the three headline statistics, counting up as they enter view.
 */

const MAX_LAMBDA = Math.max(...MATERIALS.map((m) => m.v));

/** Linear share of the worst conductor, floored to a visible sliver. */
function barWidth(v: number): string {
  const pct = (v / MAX_LAMBDA) * 100;
  return `${Math.max(pct, 0.6)}%`;
}

/** Tidy λ readout: integers stay integers, sub-unit values keep their decimal. */
function formatLambda(v: number): string {
  return v >= 1 ? String(Math.round(v)) : v.toFixed(1).replace(".", ",");
}

export default function WhyItMatters() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="dlaczego"
      className="relative py-section"
      aria-label="Dlaczego to ma znaczenie"
    >
      {/* Heat-peak beat for the 3D scene. */}
      <BeatAnchor beat={3} className="pointer-events-none absolute inset-0" />

      <div className="mx-auto max-w-container px-6 md:px-10">
        {/* ── Part A — bar chart ───────────────────────────────────────── */}
        <header className="max-w-2xl">
          <span className="text-eyebrow uppercase text-ink-2">
            Przewodność cieplna
          </span>
          <h2 className="mt-5 text-balance font-jost text-display-sm font-bold text-ink">
            Cała różnica mieści się w jednym materiale.
          </h2>
        </header>

        <div className="mt-14 rounded-2xl border border-hairline bg-surface/40 p-6 backdrop-blur-sm sm:p-10">
          <ul className="flex flex-col gap-7">
            {MATERIALS.map((m, i) => {
              const isHero = m.name === "FIBERTHERM";
              return (
                <li key={m.name} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6">
                  <span
                    className={`truncate text-sm font-medium sm:text-base ${
                      isHero ? "text-ink" : "text-ink-2"
                    }`}
                  >
                    {m.name}
                  </span>

                  <div className="relative h-3 overflow-hidden rounded-pill bg-white/[0.04]">
                    <motion.span
                      className={`absolute inset-y-0 left-0 rounded-pill ${
                        isHero
                          ? "bg-gradient-to-r from-tp-red to-tp-red-dark shadow-glow"
                          : "bg-gradient-to-r from-ink-2/50 to-ink-2/25"
                      }`}
                      initial={reduceMotion ? false : { width: 0 }}
                      whileInView={{ width: barWidth(m.v) }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{
                        duration: 1.1,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.12 * i,
                      }}
                    />
                  </div>

                  <span
                    className={`whitespace-nowrap text-right font-jost text-sm tabular-nums sm:text-base ${
                      isHero ? "text-tp-red" : "text-ink-2"
                    }`}
                  >
                    {formatLambda(m.v)}
                    <span className="ml-1 text-xs text-ink-2/70">W/m·K</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-9 max-w-xl text-pretty text-sm leading-relaxed text-ink-2">
            Zwykła ramka aluminiowa przepuszcza{" "}
            <span className="font-medium text-ink">~500× więcej ciepła.</span>
          </p>
        </div>

        {/* ── Part B — headline statistics ─────────────────────────────── */}
        <div className="mt-section grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-start gap-3 bg-surface/40 px-7 py-10 backdrop-blur-sm sm:py-12"
            >
              <span className="font-jost text-[clamp(2.75rem,5vw,4rem)] font-bold leading-none text-ink">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-sm leading-snug text-ink-2">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
