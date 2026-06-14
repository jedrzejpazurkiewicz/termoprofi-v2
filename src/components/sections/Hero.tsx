"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import BeatAnchor from "@/components/animations/BeatAnchor";
import { HERO } from "@/lib/constants";

/**
 * Hero — full-screen opening. The fixed 3D canvas (the glass unit, idle/floating)
 * shows through behind this section, so the section itself stays mostly
 * transparent and only lays down a soft atmosphere: a warm interior glow on the
 * lower-left meeting the cool edge on the upper-right — a CSS stand-in for the
 * forthcoming Higgsfield interior photograph. A very slow Ken-Burns drift gives
 * it life without competing with the 3D. The copy sits in editorial Jost type
 * and the CTA scrolls to the Discovery beat.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="poczatek"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Idle-state beat for the 3D scene (floating glass unit). */}
      <BeatAnchor beat={0} className="absolute inset-0" />

      {/* Hero video loop — Higgsfield-generated (5s, seamless).
          Foreground = steaming cup of coffee, background = window with garden.
          The video itself does a focus pull from coffee → window, which sets up
          the scroll-driven 3D reveal in the next section. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/hero-loop.jpg"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric overlays — warm interior glow meeting cool window edge.
          These work WITH the video to keep the atmosphere cohesive. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        initial={reduceMotion ? false : { scale: 1.04 }}
        animate={reduceMotion ? {} : { scale: 1 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_92%,rgba(207,46,46,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_88%_8%,rgba(79,168,255,0.12),transparent_60%)]" />
        {/* Deep vertical settle so the copy reads against the base. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,20,0.30)_0%,rgba(11,15,20,0.12)_42%,rgba(11,15,20,0.86)_100%)]" />
      </motion.div>

      <div className="mx-auto w-full max-w-container px-6 pb-[clamp(4rem,10vh,8rem)] md:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="mb-7 inline-flex items-center gap-3 text-eyebrow uppercase text-ink-2">
            <span className="h-px w-8 bg-tp-red/70" aria-hidden />
            Ciepłe ramki dystansowe
          </span>

          <h1 className="text-balance font-jost text-display font-bold text-ink">
            {HERO.title}
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-2 md:text-xl">
            {HERO.subtitle}
          </p>

          <div className="mt-10">
            <Button href="#odkrycie">{HERO.cta}</Button>
          </div>
        </motion.div>
      </div>

      {/* Quiet scroll affordance. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-ink-2"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
      >
        <span className="text-[0.7rem] uppercase tracking-[0.3em]">Przewiń</span>
        <motion.span
          className="block h-8 w-px bg-gradient-to-b from-ink-2/70 to-transparent"
          animate={reduceMotion ? {} : { scaleY: [0.4, 1, 0.4], originY: 0 }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
