"use client";

import { useRef, createElement, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface TextRevealProps {
  /** The text to reveal word-by-word. */
  children: string;
  className?: string;
  /** Element to render as (defaults to span). */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Seconds between each word. */
  stagger?: number;
  delay?: number;
}

/**
 * Word-by-word masked reveal: each word rises from behind an overflow-clip line.
 * GSAP ScrollTrigger driven; reduced-motion shows the text statically.
 */
export function TextReveal({
  children,
  className,
  as = "span",
  stagger = 0.05,
  delay = 0,
}: TextRevealProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const words = children.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const inner = el.querySelectorAll<HTMLElement>("[data-word-inner]");
      if (reduce) {
        gsap.set(inner, { yPercent: 0 });
        return;
      }

      gsap.fromTo(
        inner,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          delay,
          ease: "power2.out",
          stagger,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: ref },
  );

  const visual = words.map((word, i) => (
    <span
      key={`${word}-${i}`}
      className="inline-flex overflow-hidden align-bottom"
      aria-hidden="true"
    >
      <span
        data-word-inner
        className="inline-block will-change-transform"
        style={{ transform: "translateY(115%)" }}
      >
        {word}
      </span>
      {i < words.length - 1 ? " " : null}
    </span>
  ));

  return createElement(
    as,
    { ref, className },
    // Accessible, unsplit copy for screen readers.
    <span key="sr" className="sr-only">
      {children}
    </span>,
    visual,
  );
}

export default TextReveal;
