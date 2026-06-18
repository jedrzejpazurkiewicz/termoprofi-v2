"use client";

import Button from "@/components/ui/Button";
import { HERO } from "@/lib/constants";

/**
 * Hero — full-screen opening. The hero video is the visual focal point.
 * The copy is wrapped in a div that uses a CSS animation (`.hero-copy-in`)
 * so the text is reliably visible even if the JS motion / scroll stack
 * never hydrates. The framer-motion `initial={opacity: 0}` SSR output was
 * leaving elements invisible when the JS chunk failed to load.
 */
export default function Hero() {
  return (
    <section
      id="poczatek"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Hero video loop — Higgsfield-generated (5s, seamless).
          Foreground = steaming cup of coffee, background = window with garden.
          The video itself does a focus pull from coffee → window, which sets up
          the scroll-driven 3D reveal in the next section. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-loop.jpg"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        aria-hidden
        onError={(e) => {
          // If the video source fails, keep the poster visible by leaving the
          // <video> element painted with its poster (it still renders the
          // poster frame on error). Nothing else needed — just swallow the error.
          e.currentTarget.style.objectFit = "cover";
        }}
      >
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric overlays — warm interior glow meeting cool window edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_92%,rgba(207,46,46,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_88%_8%,rgba(79,168,255,0.12),transparent_60%)]" />
        {/* Deep vertical settle so the copy reads against the base. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,20,0.30)_0%,rgba(11,15,20,0.12)_42%,rgba(11,15,20,0.86)_100%)]" />
      </div>

      <div className="hero-copy-in relative z-10 mx-auto w-full max-w-container px-6 pb-[clamp(4rem,10vh,8rem)] md:px-10">
        <div className="max-w-3xl">
          <span className="mb-7 inline-flex items-center gap-3 text-eyebrow uppercase text-ink-2">
            <span className="h-px w-8 bg-tp-red/70" aria-hidden />
            Ciepłe ramki dystansowe
          </span>

          <h1 className="text-balance font-jost font-bold text-ink">
            <span className="block text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.15] text-ink/75">
              Nie widzisz jej.
            </span>
            <span className="block text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.15] mt-2">
              Czujesz
            </span>
            <span className="block text-tp-red text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[1.0] mt-1">
              Codziennie
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-2 md:text-xl">
            {HERO.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#odkrycie">{HERO.cta}</Button>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 rounded-full border border-ink/30 bg-white/5 px-6 py-3 font-inter font-semibold text-sm text-ink transition-all duration-200 hover:border-tp-red hover:bg-tp-red hover:text-white"
            >
              {HERO.ctaSecondary}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quiet scroll affordance. */}
      <div
        aria-hidden
        className="hero-affordance pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-ink-2"
      >
        <span className="text-[0.7rem] uppercase tracking-[0.3em]">Przewiń</span>
        <span className="scroll-line block h-8 w-px bg-gradient-to-b from-ink-2/70 to-transparent" />
      </div>
    </section>
  );
}
