"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { OWNER } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Owner — "Właściciel" / founder's word.
 *
 * Editorial 50/50 split: on the left a framed portrait of the factory profile,
 * on the right a generous Jost-italic pull-quote that reveals clause-by-clause
 * on scroll, signed with the owner's name and a values motto.
 *
 * The quote copy is split locally into reading-friendly lines purely for the
 * staggered reveal; OWNER (constants) remains the single source of truth for
 * the words, the author and the role.
 */

/** Local presentation split of OWNER.quote into balanced lines for the reveal. */
const QUOTE_LINES: string[] = [
  "Od początku naszej działalności",
  "w branży szkła zespolonego",
  "kierujemy się przekonaniem,",
  "że prawdziwa jakość rodzi się",
  "z doskonałego połączenia",
  "technologii i precyzji wykonania.",
];

/** Words emphasised in brand red within the pull-quote (the key values). */
const HIGHLIGHT = new Set(["technologii", "precyzji", "wykonania"]);
const normalizeWord = (w: string) => w.toLowerCase().replace(/[.,;:]+$/g, "");

const MOTTO: string[] = ["Doświadczenie", "Wiedza", "Zaangażowanie"];

export default function Owner() {
  const quoteRef = useRef<HTMLQuoteElement>(null);

  useGSAP(
    () => {
      const el = quoteRef.current;
      if (!el) return;

      const lines = el.querySelectorAll<HTMLElement>("[data-quote-line]");
      if (lines.length === 0) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduce) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        lines,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: quoteRef },
  );

  return (
    <Section id="o-nas" eyebrow="O nas" variant="dark">
      {/* Faint editorial backdrop — keeps the dark slab from going flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(110%_80%_at_85%_0%,rgba(255,255,255,0.04),transparent_60%)]"
      />

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-20">
        {/* LEFT — framed portrait */}
        <ScrollReveal className="order-1" y={32}>
          <figure className="group relative">
            {/* Soft offset glow behind the frame */}
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[1.75rem] bg-[radial-gradient(60%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent_70%)] blur-2xl"
            />
            <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
              <div className="relative aspect-square w-full">
                <Image
                  src="/images/owner-andrzej.jpg"
                  alt="Andrzej Tabała — właściciel PPH OKSAN"
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                {/* Inner hairline + vignette for depth */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                />
              </div>
            </div>
          </figure>
        </ScrollReveal>

        {/* RIGHT — quote + signature */}
        <div className="order-2">
          <figure>
            <span
              aria-hidden
              className="block font-jost text-7xl leading-[0.6] text-tp-red/50"
            >
              &ldquo;
            </span>

            <blockquote
              ref={quoteRef}
              className="mt-6 text-balance font-jost text-[clamp(1.6rem,3.1vw,2.6rem)] font-medium italic leading-[1.25] text-ink"
            >
              {QUOTE_LINES.map((line, i) => {
                const words = line.split(" ");
                return (
                  <span key={i} data-quote-line className="block">
                    {words.map((word, j) => (
                      <span
                        key={j}
                        className={
                          HIGHLIGHT.has(normalizeWord(word))
                            ? "text-tp-red"
                            : undefined
                        }
                      >
                        {word}
                        {j < words.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </span>
                );
              })}
            </blockquote>

            <figcaption className="mt-12">
              <ScrollReveal y={16} delay={0.1}>
                {/* Hairline lead-in to the signature */}
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="h-px w-10 bg-gradient-to-r from-tp-red to-transparent"
                  />
                  <span className="font-jost text-lg font-bold uppercase tracking-[0.14em] text-ink not-italic">
                    {OWNER.author}
                  </span>
                </div>
                <p className="mt-2 pl-14 text-sm not-italic text-ink-2">
                  {OWNER.role}
                </p>

                {/* Motto row */}
                <ul className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 not-italic">
                  {MOTTO.map((word, i) => (
                    <li key={word} className="flex items-center gap-4">
                      {i > 0 && (
                        <span
                          aria-hidden
                          className="h-1 w-1 rotate-45 bg-tp-red"
                        />
                      )}
                      <span className="text-eyebrow font-medium uppercase tracking-[0.22em] text-ink-2 transition-colors hover:text-ink">
                        {word}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </figcaption>
          </figure>
        </div>
      </div>
    </Section>
  );
}
