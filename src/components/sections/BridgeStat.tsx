"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * BridgeStat — the narrative "bridge" between the two opening films:
 * Hero (pierwsze ciepło / dom, komfort) → EdgeApproach (przybliżenie ramki /
 * technika, detal). A scroll-triggered THREE-ACT story, not a static banner.
 *
 * Scroll model: GSAP `pin: true` freezes the section in place for the whole
 * reveal timeline. Lenis is paused via `__lenis.stop()` while pinned and
 * resumed when the timeline completes — so the user cannot scroll past and
 * see the next section's film peek in, and cannot get "stuck" either.
 *
 * Motion: a single GSAP timeline driven by ScrollTrigger (start "top top",
 * play ONCE — no reverse/restart on scroll-up). pinSpacing adds the necessary
 * extra scroll height so the next section can be reached naturally after the
 * reveal.
 *   ACT 1 — line 1 reveals word-by-word (~0.06s apart, ~1.5s total). The "22%"
 *           span enters with a slight overshoot (scale 0.8→1, back.out) while
 *           its color tweens white → tp-red.
 *   ACT 2 — line 2 fades + slides up (y 20→0, ~0.8s), starting ~0.4s after act 1.
 *   ACT 3 — line 3 fades in only (~1s), ~0.6s after act 2, and lingers as the
 *           closing beat while the user continues toward film 2.
 *   ACT 4 — "Dowiedz się więcej" link, ~0.6s after act 3.
 * Total well under 4s. Mobile timings ~25-30% shorter via gsap.matchMedia.
 *
 * Accessibility: prefers-reduced-motion renders ALL lines in their FINAL state
 * immediately (22% already red, no transforms). The markup is also authored in
 * its final visual state (full opacity, red 22%) so a visible result is
 * guaranteed even if the motion layer never hydrates; the entrance transforms
 * are applied imperatively by GSAP only when motion is allowed.
 */

/** Minimal shape of the shared Lenis instance exposed by SmoothScrollProvider. */
type LenisLike = {
  stop: () => void;
  start: () => void;
};
const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const EASE = "power2.out";
const STEP = 0.06; // seconds between words in act 1

export default function BridgeStat() {
  const section = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const sec = section.current ?? el;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      // Mobile runs ~25-30% shorter.
      const k = isMobile ? 0.72 : 1;

      const words = gsap.utils.toArray<HTMLElement>("[data-bridge-word]", el);
      const stat = el.querySelector<HTMLElement>("[data-bridge-stat]");
      const line2 = el.querySelector<HTMLElement>("[data-bridge-line2]");
      const line3 = el.querySelector<HTMLElement>("[data-bridge-line3]");
      const link = el.querySelector<HTMLElement>("[data-bridge-link]");

      // Reduced motion: skip pin, skip animations, just make sure everything
      // is visible and bail out — the page scrolls normally.
      if (reduce) {
        gsap.set("[data-bridge-word]", { opacity: 1, yPercent: 0 });
        if (stat) gsap.set(stat, { scale: 1, color: "#cf2e2e" });
        if (line2) gsap.set(line2, { opacity: 1, y: 0 });
        if (line3) gsap.set(line3, { opacity: 1 });
        if (link) gsap.set(link, { opacity: 1, y: 0 });
        return;
      }

      // Initial (pre-animation) state. Set imperatively so the static DOM
      // stays visible until the timeline mounts.
      gsap.set(words, { opacity: 0, yPercent: 60 });
      if (stat) gsap.set(stat, { scale: 0.8, color: "#ffffff" });
      if (line2) gsap.set(line2, { opacity: 0, y: 20 });
      if (line3) gsap.set(line3, { opacity: 0 });
      if (link) gsap.set(link, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          // Pin the section to the viewport for the full duration of the
          // timeline — GSAP owns the "freeze" so there is no race between
          // Lenis' momentum, our hand-rolled wheel blocker, and the trigger
          // position. pinSpacing adds the necessary extra scroll height so
          // the next section can be reached naturally after the reveal.
          start: "top top",
          // ~15% viewport of pin travel. Long enough for the reveal, short
          // enough that the next film does not feel far away.
          end: "+=" + Math.round(window.innerHeight * 0.15),
          pin: true,
          pinSpacing: true,
          toggleActions: "play none none none", // play ONCE
        },
        // Pause / resume Lenis around the pinned reveal. GSAP's pin freezes
        // the SECTION in place, but Lenis would still happily absorb wheel
        // events and try to scroll the rest of the page — so we stop it for
        // the duration of the timeline, then start it back up.
        onStart: () => getLenis()?.stop(),
        onComplete: () => getLenis()?.start(),
      });

      // ── ACT 1 — line 1, word by word ───────────────────────────────
      tl.to(words, {
        opacity: 1,
        yPercent: 0,
        duration: 0.55 * k,
        ease: EASE,
        stagger: STEP * k,
      });

      // The "22%" overshoot + colour tween, timed to land with its word.
      // It is the second word ("Do 22% ..."), so it begins ~one step in.
      if (stat) {
        const statAt = STEP * k; // align with the 22% word's reveal
        tl.to(
          stat,
          {
            scale: 1,
            duration: 0.6 * k,
            ease: "back.out(1.4)",
          },
          statAt,
        ).to(
          stat,
          {
            color: "#cf2e2e",
            duration: 0.55 * k,
            ease: EASE,
          },
          statAt,
        );
      }

      // ── ACT 2 — line 2, fade + slide-up, ~0.4s after act 1 ─────────
      // The scroll-lock ENDS here: as soon as "Mała rzecz. Duży efekt."
      // lands, the user can scroll on — ACT 3 + ACT 4 continue to play in
      // place, but Lenis is already running, so fast scrollers don't get
      // stuck behind the rest of the timeline.
      if (line2) {
        tl.to(
          line2,
          {
            opacity: 1,
            y: 0,
            duration: 0.8 * k,
            ease: EASE,
            onComplete: () => getLenis()?.start(),
          },
          `>${0.4 * k}`,
        );
      }

      // ── ACT 3 — line 3, fade only, ~0.6s after act 2 (closing beat) ─
      if (line3) {
        tl.to(
          line3,
          {
            opacity: 1,
            duration: 1 * k,
            ease: EASE,
          },
          `>${0.6 * k}`,
        );
      }

      // ── ACT 4 — "Dowiedz się więcej" link, ~0.6s after act 3 ────────
      if (link) {
        tl.to(
          link,
          {
            opacity: 1,
            y: 0,
            duration: 0.6 * k,
            ease: EASE,
          },
          `>${0.6 * k}`,
        );
      }
    },
    { scope: root },
  );

  return (
    <section
      id="hero-22"
      ref={section}
      aria-label="Do 22% mniej strat ciepła"
      className="relative flex min-h-[100svh] items-center justify-center px-6 py-24"
    >
      {/* Subtle warm glow behind the stat — keeps the dark slab from going flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_42%,rgba(207,46,46,0.10),transparent_70%)]"
      />

      <div ref={root} className="mx-auto max-w-3xl text-center">
        {/* ACT 1 — split into word spans (each a wrapped, overflow-clipped slot). */}
        <p className="text-balance font-jost text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.04] tracking-tight text-ink">
          <span className="inline-block overflow-hidden align-bottom">
            <span data-bridge-word className="inline-block">
              Do
            </span>
          </span>{" "}
          <span className="inline-block overflow-hidden align-bottom">
            <span data-bridge-word className="inline-block">
              <span data-bridge-stat className="inline-block text-tp-red">
                22%
              </span>
            </span>
          </span>{" "}
          <span className="inline-block overflow-hidden align-bottom">
            <span data-bridge-word className="inline-block">
              mniej
            </span>
          </span>{" "}
          <span className="inline-block overflow-hidden align-bottom">
            <span data-bridge-word className="inline-block">
              strat
            </span>
          </span>{" "}
          <span className="inline-block overflow-hidden align-bottom">
            <span data-bridge-word className="inline-block">
              ciepła.
            </span>
          </span>
        </p>

        {/* ACT 2 — muted lead, glowing payoff. */}
        <p
          data-bridge-line2
          className="mt-6 font-jost text-[clamp(1.4rem,3.4vw,2.25rem)] font-medium leading-tight"
        >
          <span className="text-ink-2">Mała rzecz.</span>{" "}
          <span className="text-ink [text-shadow:0_0_24px_rgba(232,236,241,0.35)]">
            Duży efekt.
          </span>
        </p>

        {/* ACT 3 — closing line, lands last and lingers. */}
        <p
          data-bridge-line3
          className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-ink-2 sm:text-lg"
        >
          Reszta ucieka standardowym oknem —{" "}
          <span className="text-ink">u Ciebie zostaje w domu.</span>
        </p>

        {/* ACT 4 — "Dowiedz się więcej" link ze strzałką, pojawia się po ACT 3 */}
        <p
          data-bridge-link
          className="mx-auto mt-8 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-ink-2 sm:text-base"
        >
          <a
            href="#fibertherm"
            className="group inline-flex items-center gap-2 transition-colors duration-300 ease-calm hover:text-tp-red"
          >
            <span>Dowiedz się więcej</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 animate-bounce"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </p>
      </div>
    </section>
  );
}
