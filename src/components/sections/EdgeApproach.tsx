"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * EdgeApproach — the AI "dolot" transition between the Hero and the 3D Discovery.
 *
 * The 4K-source clip (downscaled to 1080p) flies from the room into a macro of
 * the glass EDGE — answering "a layperson sees WHERE the spacer hides". It
 * AUTOPLAYS (only while on screen, so two videos never decode at once) — scroll
 * is NOT frame-scrubbed, because seeking a compressed clip every scroll tick
 * stutters badly. Scroll drives only the crossfade that hands off to the fixed
 * 3D canvas behind it. Transparent container so the canvas shows through.
 */
export default function EdgeApproach() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playedRef = useRef(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Play only while the section is on screen; pause otherwise.
  useEffect(() => {
    const v = videoRef.current;
    const el = ref.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // If play() rejects (autoplay blocked, decode error, missing source),
        // swallow it — the poster frame stays painted as the static fallback.
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Krótki scroll-lock (~1s) gdy sekcja wchodzi w kadr — "efekt doświadczenia".
  // Odpala się RAZ, na wejściu w widok (nie na mount), więc NIE skacze przy
  // ładowaniu strony. Bez lenisa = no-op (nie blokujemy natywnego scrolla).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const lenis = (
      window as unknown as { __lenis?: { stop: () => void; start: () => void } }
    ).__lenis;
    if (!lenis) return;
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          lenis.stop();
          unlockTimer = setTimeout(() => lenis.start(), 1000);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      clearTimeout(unlockTimer);
      lenis.start();
      io.disconnect();
    };
  }, []);

  const videoOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const copyOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.2, 0.55, 0.75],
    [0, 1, 1, 0],
  );
  const copyY = useTransform(scrollYProgress, [0.05, 0.2], [24, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[160vh] bg-white/[0.92]"
      aria-label="Tędy ucieka ciepło — dolot do krawędzi okna"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: videoOpacity }}>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/dolot-edge.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          >
            <source src="/videos/dolot-edge.mp4" type="video/mp4" />
          </video>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,20,0.25)_0%,transparent_30%,rgba(11,15,20,0.55)_100%)]"
          />
        </motion.div>

        <motion.div className="absolute inset-x-0 bottom-[14vh] mx-auto max-w-2xl px-6 text-center">
          {/* Linia 1 — dwukolorowa: "Tędy ucieka" białe, "ciepło." czerwone */}
          <motion.h1
            className="font-jost text-display-sm font-bold text-white"
            style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}
          >
            Tędy ucieka{" "}
            <span className="text-tp-red">ciepło.</span>
          </motion.h1>
          {/* Linia 2 — większa czcionka, animuje się RAZEM z linią 1 */}
          <motion.p
            className="mt-3 text-pretty text-xl text-ink-2"
            style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}
          >
            Z każdego okna. Każdej zimy. Przez 30 lat.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
