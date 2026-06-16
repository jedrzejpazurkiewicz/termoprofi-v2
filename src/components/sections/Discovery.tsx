"use client";

import { useScroll, useTransform, useReducedMotion, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import BeatAnchor from "@/components/animations/BeatAnchor";
import { scroll } from "@/lib/scroll-store";

/**
 * Discovery — the reveal stage. Tall (~220vh) so the scroll-driven 3D
 * choreography (the spacer/glass sliding apart = beat 1, the unit rotating to
 * face the viewer = beat 2) has room to breathe. The section stays almost
 * entirely transparent: the fixed canvas behind it carries the visual, and the
 * only DOM here is a single pinned line of narrative copy that resolves into
 * focus as you pass through.
 *
 * Two BeatAnchors split the section into sub-ranges. Each anchor measures the
 * progress of its own band across the viewport, so SceneController can read
 * getBeat(1) for the emerge and getBeat(2) for the rotate independently.
 */
export default function Discovery() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The headline materialises in the central window of the scroll, then settles.
  const copyOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.32, 0.72, 0.94],
    [0, 1, 1, 0.18],
  );
  const copyY = useTransform(scrollYProgress, [0.08, 0.4], [40, 0]);
  const accentWidth = useTransform(scrollYProgress, [0.2, 0.6], ["0%", "100%"]);

  // Reliable "Discovery is on screen" signal for the 3D layer — drives the
  // unit's visibility independent of GSAP/ScrollTrigger/pin refresh quirks.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        scroll.discoveryInView = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      scroll.discoveryInView = false;
    };
  }, []);

  return (
    <section
      id="odkrycie"
      ref={ref}
      className="relative h-[220vh] bg-white/[0.92]"
      aria-label="Odkrycie: czym jest FIBERTHERM"
    >
      {/* Beat 1 — emerge band (upper half). */}
      <BeatAnchor beat={1} className="pointer-events-none absolute inset-x-0 top-0 h-1/2" />
      {/* Beat 2 — rotate band (lower half). */}
      <BeatAnchor beat={2} className="pointer-events-none absolute inset-x-0 top-1/2 h-1/2" />

      {/* Pinned narrative — sits in front of the canvas, centred in the viewport. */}
      <div className="sticky top-0 flex h-[100svh] items-center justify-start">
        <motion.div
          className="max-w-lg px-8 text-left md:pl-16"
          style={reduceMotion ? undefined : { opacity: copyOpacity, y: copyY }}
        >
          <p className="text-balance font-jost text-display-sm font-bold text-[#14171c]">
            Widzisz tę małą ramkę?
          </p>
          <p className="mt-3 text-balance font-jost text-display-sm font-bold text-tp-red">
            To jest FIBERTHERM.
          </p>
          <motion.span
            aria-hidden
            className="mt-8 block h-px max-w-xs bg-gradient-to-r from-tp-red/70 to-transparent"
            style={reduceMotion ? undefined : { width: accentWidth }}
          />
          <p className="mt-8 max-w-md text-pretty text-base leading-relaxed text-[#3b424e]">
            Ramka dystansowa rozdziela szyby w pakiecie. To właśnie tędy — jej
            krawędzią — ucieka najwięcej ciepła z całego okna.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
