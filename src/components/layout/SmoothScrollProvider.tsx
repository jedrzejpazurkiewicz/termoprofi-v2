"use client";

/**
 * SmoothScrollProvider — owns smooth scrolling and the global scroll "spine".
 *
 * Lenis drives momentum scrolling; we hand its RAF to GSAP's ticker so there is
 * exactly ONE animation loop on the page (no separate requestAnimationFrame).
 * Lenis 'scroll' pumps ScrollTrigger.update so every BeatAnchor stays in sync
 * with the smoothed scroll position.
 *
 * After mount we refresh ScrollTrigger (so it measures the now-laid-out DOM),
 * then create the spine trigger over `[data-spine]` — scrubbed, its progress is
 * written to `scroll.progress`, which SceneController reads for the camera
 * push-in/orbit. Reduced-motion users get scrolling without the smoothing.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scroll } from "@/lib/scroll-store";
import { prefersReducedMotion } from "@/lib/capabilities";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = prefersReducedMotion();

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: !reduced,
    });

    // Keep ScrollTrigger in lockstep with Lenis' smoothed position.
    lenis.on("scroll", ScrollTrigger.update);

    // Single loop: GSAP's ticker drives Lenis. (No second rAF anywhere.)
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Measure after the DOM has settled, then wire the spine.
    ScrollTrigger.refresh();

    const spine = ScrollTrigger.create({
      trigger: "[data-spine]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scroll.progress = self.progress;
      },
    });

    return () => {
      spine.kill();
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
