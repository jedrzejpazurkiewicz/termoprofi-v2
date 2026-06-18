"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to delay the reveal. */
  delay?: number;
  /** Pixels to translate up from. */
  y?: number;
  /** Stagger direct children instead of revealing the wrapper as one. */
  stagger?: boolean;
}

/**
 * Fade + slide-up on scroll, powered by GSAP ScrollTrigger.
 * Honors prefers-reduced-motion (renders content immediately, no transform).
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) {
        gsap.set(stagger ? el.children : el, { opacity: 1, y: 0 });
        return;
      }

      const targets = stagger ? Array.from(el.children) : el;

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
          stagger: stagger ? 0.14 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default ScrollReveal;
