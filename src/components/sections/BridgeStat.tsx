"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * BridgeStat — the narrative "bridge" between the two opening films:
 * Hero (pierwsze ciepło / dom, komfort) → EdgeApproach (przybliżenie ramki /
 * technika, detal). A scroll-triggered THREE-ACT story, not a static banner.
 *
 * Motion: a single GSAP timeline driven by ScrollTrigger (start "top 65%",
 * play ONCE — no reverse/restart on scroll-up).
 *   ACT 1 — line 1 reveals word-by-word (~0.06s apart, ~1.5s total). The "22%"
 *           span enters with a slight overshoot (scale 0.8→1, back.out) while
 *           its color tweens white → tp-red.
 *   ACT 2 — line 2 fades + slides up (y 20→0, ~0.8s), starting ~0.4s after act 1.
 *   ACT 3 — line 3 fades in only (~1s), ~0.6s after act 2, and lingers as the
 *           closing beat while the user continues toward film 2.
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
  scrollTo: (
    target: number,
    opts?: { immediate?: boolean; force?: boolean; lock?: boolean },
  ) => void;
};

const EASE = "power2.out";
const STEP = 0.06; // seconds between words in act 1

export default function BridgeStat() {
  const section = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);

  // ── True scroll lock for the reveal (Lenis-aware) ──────────────────────────
  // This site runs Lenis smooth-scroll, which reads wheel/touch deltas itself
  // and IGNORES e.preventDefault() + body overflow:hidden. So we intercept on the
  // CAPTURE phase (before Lenis' bubble-phase window listeners) and stopPropagation
  // — Lenis then never sees the event. Only DOWNWARD intent is blocked, so the user
  // can always scroll back UP to leave; keyboard down-keys are cancelled natively.
  // No pin is used, so the 3D scroll-spine ([data-spine]) is left untouched.
  const lockedRef = useRef(false);
  const playedRef = useRef(false);
  const touchYRef = useRef(0);
  const handlers = useRef<{
    wheel: (e: WheelEvent) => void;
    touchStart: (e: TouchEvent) => void;
    touchMove: (e: TouchEvent) => void;
    key: (e: KeyboardEvent) => void;
  } | null>(null);

  if (!handlers.current) {
    const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
    const isField = (t: EventTarget | null) => {
      const n = t as HTMLElement | null;
      return (
        !!n &&
        (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.isContentEditable)
      );
    };
    handlers.current = {
      wheel: (e) => {
        if (lockedRef.current && e.deltaY > 0) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      touchStart: (e) => {
        touchYRef.current = e.touches[0]?.clientY ?? 0;
      },
      touchMove: (e) => {
        if (!lockedRef.current) return;
        const y = e.touches[0]?.clientY ?? 0;
        // finger up (y decreases) => content scrolls DOWN => block; up stays free.
        if (y < touchYRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      key: (e) => {
        if (!lockedRef.current || isField(e.target)) return;
        if (DOWN_KEYS.has(e.key)) e.preventDefault();
      },
    };
  }

  const lockScroll = () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const h = handlers.current!;
    window.addEventListener("wheel", h.wheel, { capture: true, passive: false });
    window.addEventListener("touchmove", h.touchMove, { capture: true, passive: false });
    window.addEventListener("touchstart", h.touchStart, { capture: true, passive: true });
    window.addEventListener("keydown", h.key, { capture: true });
  };

  const unlockScroll = () => {
    lockedRef.current = false;
    const h = handlers.current!;
    window.removeEventListener("wheel", h.wheel, { capture: true });
    window.removeEventListener("touchmove", h.touchMove, { capture: true });
    window.removeEventListener("touchstart", h.touchStart, { capture: true });
    window.removeEventListener("keydown", h.key, { capture: true });
  };

  // React 18 StrictMode / unmount: never let listeners outlive the component.
  useEffect(() => unlockScroll, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const sec = section.current ?? el;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const words = gsap.utils.toArray<HTMLElement>("[data-bridge-word]", el);
      const stat = el.querySelector<HTMLElement>("[data-bridge-stat]");
      const line2 = el.querySelector<HTMLElement>("[data-bridge-line2]");
      const line3 = el.querySelector<HTMLElement>("[data-bridge-line3]");
      const link = el.querySelector<HTMLElement>("[data-bridge-link]");

      // Reduced motion: everything is already in its final visual state in the
      // DOM; just make sure nothing is left hidden and bail out.
      if (reduce) {
        gsap.set([...words, stat, line2, line3, link], {
          clearProps: "all",
          opacity: 1,
        });
        if (stat) gsap.set(stat, { color: "#cf2e2e" });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isMobile: boolean };
          // Mobile runs ~25-30% shorter.
          const k = isMobile ? 0.72 : 1;

          // Initial (pre-animation) state. Set imperatively so the static DOM
          // stays visible until the timeline mounts.
          gsap.set(words, { opacity: 0, yPercent: 60 });
          if (stat) gsap.set(stat, { scale: 0.8, color: "#ffffff" });
          if (line2) gsap.set(line2, { opacity: 0, y: 20 });
          if (line3) gsap.set(line3, { opacity: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sec,
              start: "top top", // engage when the section reaches the top
              toggleActions: "play none none none", // play ONCE
              onEnter: () => {
                if (playedRef.current) return; // only the first reveal locks
                playedRef.current = true;
                // SNAP first: kill Lenis' residual momentum so the section sits
                // EXACTLY at the top before we freeze — otherwise the ease carries
                // it ~150px past the trigger and the Hero peeks above. Absolute Y
                // via rect (offsetTop is relative to the offsetParent, unreliable).
                const targetY = Math.round(
                  window.scrollY + sec.getBoundingClientRect().top,
                );
                const lenis = (window as unknown as { __lenis?: LenisLike })
                  .__lenis;
                if (lenis) {
                  lenis.scrollTo(targetY, {
                    immediate: true,
                    force: true,
                    lock: false,
                  });
                } else {
                  window.scrollTo({
                    top: targetY,
                    behavior: "instant" as ScrollBehavior,
                  });
                }
                // Lock on the next frame so the snap paints before we freeze.
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => lockScroll()),
                );
              },
            },
            onComplete: unlockScroll, // release immediately when the reveal finishes
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
          if (line2) {
            tl.to(
              line2,
              {
                opacity: 1,
                y: 0,
                duration: 0.8 * k,
                ease: EASE,
                onComplete: unlockScroll, // PRIMARY: unlock as soon as "Mała rzecz. Duży efekt." lands (~2s)
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
            gsap.set(link, { opacity: 0, y: 12 });
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
      );
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
