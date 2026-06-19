"use client";

import { createElement, Fragment, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
 * Word-by-word reveal: each word fades in and slides up 24px from behind an
 * overflow-clip box, staggered, as it scrolls into view. Framer-motion
 * `whileInView` driven — the exact same effect used in the EdgeApproach section
 * ("Tędy ucieka ciepło. / Z każdego okna…"). Words are authored as real text
 * content (no hidden duplicate); reduced-motion renders them instantly in place.
 */
export function TextReveal({
  children,
  className,
  as = "span",
  stagger = 0.15,
  delay = 0,
}: TextRevealProps): ReactNode {
  const reduce = useReducedMotion();
  const words = children.split(" ");

  const visual = words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="inline-block align-bottom">
        <motion.span
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      </span>
      {/* Space between the clip boxes (parent flow) so it stays visible and the
          line wraps naturally. */}
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));

  return createElement(as, { className }, visual);
}

export default TextReveal;
