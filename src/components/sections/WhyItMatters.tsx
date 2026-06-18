"use client";

import { motion, useReducedMotion } from "framer-motion";
import BeatAnchor from "@/components/animations/BeatAnchor";
import CountUp from "@/components/animations/CountUp";
import { MATERIALS, STATS } from "@/lib/constants";

/**
 * WhyItMatters — the climax of the spine. The termo-reveal (the spacer fully
 * heated, cool skin bleeding to a hot red core) peaks on the fixed canvas
 * behind these numbers, so everything that carries text or bars sits on a
 * semi-opaque surface panel that lifts it cleanly off the glowing 3D.
 *
 * Part A — a horizontal bar chart of thermal conductivity (λ, W/m·K). Widths
 * are scaled against the worst performer (Aluminium, 160) on a perceptual
 * curve, which makes the FIBERTHERM bar (0.3) collapse to a thin sliver. That
 * visual collapse *is* the argument; the caption names the ~500× gap.
 *
 * Part B — the three headline statistics. The boxes slide in from the side
 * one after another, then the numbers count up as they enter view.
 */

const MAX_LAMBDA = Math.max(...MATERIALS.map((m) => m.v));

/**
 * Bar width as a percentage. We compress the huge 160→0.3 range with a soft
 * power curve so Stal (50) stays clearly readable against Aluminium (160),
 * while FIBERTHERM is floored to a deliberate, just-visible sliver.
 */
function barWidth(v: number): number {
  const linear = v / MAX_LAMBDA; // 1 .. ~0.002
  const shaped = Math.pow(linear, 0.62) * 100;
  return Math.max(shaped, 2.5);
}

/** Tidy λ readout: integers stay integers, sub-unit values keep their decimal. */
function formatLambda(v: number): string {
  return v >= 1 ? String(Math.round(v)) : v.toFixed(1).replace(".", ",");
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function WhyItMatters() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="dlaczego"
      className="relative py-section bg-zinc-600"
      aria-label="Dlaczego to ma znaczenie"
    >
      {/* Heat-peak beat for the 3D scene. */}
      <BeatAnchor beat={3} className="pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-container px-6 md:px-10">
        {/* ── Part A — the conductivity moment ──────────────────────────── */}
        <header className="max-w-2xl">
          <span className="text-eyebrow uppercase text-ink-2">
            Przewodność cieplna
          </span>
          <h2 className="mt-5 text-balance font-jost text-display-sm font-bold leading-[1.05] text-black">
            Cała różnica mieści się w{" "}
            <span className="text-tp-red">jednym materiale.</span>
          </h2>
        </header>

        <div className="mt-12 overflow-hidden rounded-3xl border border-hairline bg-surface/70 shadow-2xl shadow-black/40 backdrop-blur-md sm:mt-14">
          {/* subtle top-light gradient so the panel has depth over the 3D */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
          <div className="p-7 sm:p-12">
            <ul className="flex flex-col gap-8 sm:gap-9">
              {MATERIALS.map((m, i) => {
                const isHero = m.name === "FIBERTHERM";
                return (
                  <li key={m.name} className="flex flex-col gap-3">
                    {/* label row: name + value, sitting above its bar */}
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className={`font-jost text-base font-semibold tracking-tight sm:text-lg ${
                          isHero ? "text-ink" : "text-ink-2"
                        }`}
                      >
                        {m.name}
                        {isHero && (
                          <span className="ml-2 align-middle text-xs font-medium uppercase tracking-wider text-tp-red">
                            FIBERTHERM
                          </span>
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap font-jost text-lg tabular-nums sm:text-xl ${
                          isHero ? "font-bold text-tp-red" : "text-ink-2"
                        }`}
                      >
                        {formatLambda(m.v)}
                        <span className="ml-1.5 text-xs font-normal text-ink-2/70">
                          W/m·K
                        </span>
                      </span>
                    </div>

                    {/* the bar track */}
                    <div
                      className={`relative overflow-hidden rounded-pill bg-white/[0.05] ${
                        isHero ? "h-5" : "h-4"
                      }`}
                    >
                      <motion.span
                        className={`absolute inset-y-0 left-0 rounded-pill ${
                          isHero
                            ? "bg-gradient-to-r from-tp-red-dark via-tp-red to-tp-red shadow-glow"
                            : "bg-gradient-to-r from-ink-2/55 to-ink-2/30"
                        }`}
                        style={
                          reduceMotion
                            ? { width: `${barWidth(m.v)}%` }
                            : undefined
                        }
                        initial={reduceMotion ? false : { width: "0%" }}
                        whileInView={
                          reduceMotion ? undefined : { width: `${barWidth(m.v)}%` }
                        }
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: 1.2,
                          ease: EASE_OUT,
                          delay: 0.15 + 0.18 * i,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* the climax caption */}
            <p className="mt-10 max-w-xl text-pretty font-jost text-xl leading-snug text-ink sm:text-2xl">
              Zwykła ramka aluminiowa przepuszcza{" "}
              <span className="font-bold text-tp-red">
                ~500× więcej ciepła.
              </span>
            </p>
          </div>
        </div>

        {/* ── Part B — headline statistics ─────────────────────────────── */}
        {/* Each box slides in from the side, one after another (staggered by
            index), so the row assembles left-to-right as it enters view. */}
        <div className="mt-section grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-start gap-3 bg-surface/70 px-7 py-11 backdrop-blur-md sm:py-14"
              initial={reduceMotion ? false : { opacity: 0, x: -52 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.14 * i }}
            >
              <span className="font-jost text-[clamp(2.75rem,5vw,4.25rem)] font-bold leading-none text-ink">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                />
              </span>
              <span className="text-sm leading-snug text-ink-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
