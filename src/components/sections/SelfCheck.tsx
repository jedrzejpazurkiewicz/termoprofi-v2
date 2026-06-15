"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/animations/ScrollReveal";

/**
 * SelfCheck — "A Ty masz jaką ramkę?".
 *
 * The page's conversion pivot. After the cinematic termo-reveal has made the
 * thermal-conductivity argument felt, this delayed-reveal panel turns it
 * personal: the visitor picks the spacer in *their* window and gets an
 * immediate, honest verdict, then a single CTA to act on it.
 *
 * Interaction: a real radiogroup (roving tabindex + arrow keys), with a result
 * callout that animates in below the choice. Selecting a tone (warm/neutral/
 * positive) recolours the callout to match the brand thermal language.
 *
 * Reduced motion / hydration: FIBERTHERM is selected by default, so a complete,
 * meaningful final state is visible immediately even with no motion and even if
 * the motion layer never hydrates.
 */

type OptionId = "aluminium" | "stal" | "fibertherm";
type Tone = "warm" | "neutral" | "positive";

interface Option {
  id: OptionId;
  label: string;
  /** Verdict shown in the result callout. */
  result: string;
  tone: Tone;
}

const OPTIONS: readonly Option[] = [
  {
    id: "aluminium",
    label: "Aluminium",
    result:
      "Najsłabszy wybór. Zimą krawędź szyby robi się zimna — stąd najwięcej uciekającego ciepła i najczęściej zaparowane okna.",
    tone: "warm",
  },
  {
    id: "stal",
    label: "Stal",
    result:
      "Trochę lepsza od aluminium, ale wciąż wychładza krawędź szyby. To dalej nie jest ciepła ramka.",
    tone: "neutral",
  },
  {
    id: "fibertherm",
    label: "FIBERTHERM",
    result:
      "Najlepszy wybór. Trzyma ciepło wielokrotnie lepiej niż aluminium i stal — cieplejsza krawędź, mniej zaparowanych okien i do 22% mniejsze straty ciepła.",
    tone: "positive",
  },
] as const;

/** The visitor opens on the best case, so the panel is never empty. */
const DEFAULT_ID: OptionId = "fibertherm";

const EASE_CALM = [0.22, 1, 0.36, 1] as const;

/** Per-tone styling for the selected option chip + the result callout. */
const TONE: Record<
  Tone,
  {
    /** Selected option card. */
    optionSelected: string;
    /** Result callout container. */
    callout: string;
    /** Leading accent dot / rule. */
    accent: string;
    /** Result text emphasis. */
    text: string;
    /** Screen-reader verdict prefix. */
    srVerdict: string;
  }
> = {
  warm: {
    optionSelected:
      "border-thermal-warm/60 bg-thermal-warm/[0.08] text-ink shadow-[0_18px_50px_-24px_rgba(225,29,42,0.6)]",
    callout:
      "border-thermal-warm/40 bg-thermal-warm/[0.06] shadow-[0_24px_60px_-34px_rgba(225,29,42,0.55)]",
    accent: "bg-thermal-warm-hot",
    text: "text-ink",
    srVerdict: "Zły wybór:",
  },
  neutral: {
    optionSelected:
      "border-white/25 bg-white/[0.05] text-ink shadow-[0_18px_50px_-28px_rgba(0,0,0,0.7)]",
    callout: "border-hairline bg-white/[0.035]",
    accent: "bg-ink-2",
    text: "text-ink",
    srVerdict: "Średni wybór:",
  },
  positive: {
    optionSelected:
      "border-tp-red/50 bg-tp-red/[0.07] text-ink shadow-glow",
    callout:
      "border-thermal-cold/35 bg-gradient-to-br from-thermal-cold/[0.07] to-tp-red/[0.06] shadow-[0_24px_60px_-34px_rgba(79,168,255,0.4)]",
    accent: "bg-gradient-to-b from-thermal-cold to-tp-red",
    text: "text-ink",
    srVerdict: "Najlepszy wybór:",
  },
};

export default function SelfCheck() {
  const reduceMotion = useReducedMotion();
  const groupName = useId();
  const [selectedId, setSelectedId] = useState<OptionId>(DEFAULT_ID);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = OPTIONS.find((o) => o.id === selectedId) ?? OPTIONS[2];
  const selectedIndex = OPTIONS.findIndex((o) => o.id === selectedId);
  const tone = TONE[selected.tone];

  /** Roving focus: arrow keys move the active radio and select it. */
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const { key } = event;
    let nextIndex: number | null = null;

    if (key === "ArrowRight" || key === "ArrowDown") {
      nextIndex = (index + 1) % OPTIONS.length;
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      nextIndex = (index - 1 + OPTIONS.length) % OPTIONS.length;
    } else if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = OPTIONS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setSelectedId(OPTIONS[nextIndex].id);
      optionRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <Section id="autotest" eyebrow="Twoje okno">
      <ScrollReveal>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-hairline bg-surface/70 px-7 py-12 shadow-ambient backdrop-blur-md sm:px-12 sm:py-16">
          {/* top hairline sheen — depth over the dark page */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <header className="max-w-xl">
            <h2 className="text-balance font-jost text-display-sm font-bold leading-[1.05] text-ink">
              A Ty masz jaką ramkę?
            </h2>
            <p className="mt-5 max-w-prose text-pretty text-base leading-relaxed text-ink-2 sm:text-lg">
              Zajrzyj na krawędź swojej szyby zespolonej. To, co tam jest,
              decyduje o cieple przy oknie. Sprawdź swój wybór:
            </p>
          </header>

          {/* ── Options — a real radiogroup ───────────────────────────────── */}
          <div
            role="radiogroup"
            aria-label="Materiał ramki dystansowej w Twoim oknie"
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            {OPTIONS.map((option, index) => {
              const isSelected = option.id === selectedId;
              const selectedTone = TONE[option.tone];
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelectedId(option.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={[
                    "flex-1 rounded-xl border px-5 py-4 text-center font-jost text-base font-semibold tracking-tight transition-all duration-300 ease-calm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tp-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    isSelected
                      ? selectedTone.optionSelected
                      : "border-hairline bg-white/[0.02] text-ink-2 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05] hover:text-ink",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* ── Result callout ────────────────────────────────────────────── */}
          <div aria-live="polite" className="mt-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: EASE_CALM }}
                className={[
                  "flex items-start gap-4 rounded-xl border p-5 sm:p-6",
                  tone.callout,
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "mt-1.5 h-9 w-1 flex-none rounded-pill",
                    tone.accent,
                  ].join(" ")}
                />
                <p className={["text-pretty text-base leading-relaxed sm:text-lg", tone.text].join(" ")}>
                  <span className="sr-only">{tone.srVerdict} </span>
                  {selected.result}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <div className="mt-9 flex flex-col items-start gap-4 sm:mt-10">
            <Button href="#kontakt" size="lg">
              Sprawdź, czy możesz zmienić ramkę
            </Button>
            {selectedIndex !== 2 && (
              <p className="text-sm leading-snug text-ink-2">
                Większość pakietów da się przeprojektować na ciepłą krawędź.
                Doradzimy, jak.
              </p>
            )}
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
