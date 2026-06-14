"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

export interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Seconds to delay. */
  delay?: number;
  /** Seconds for the transition. */
  duration?: number;
  /** Travel distance in px. */
  distance?: number;
  direction?: Direction;
  /** Re-animate every time it enters the viewport. */
  once?: boolean;
}

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

/**
 * Framer-motion fade/slide on viewport entry.
 * Respects prefers-reduced-motion (renders fully visible, no transform).
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.7,
  distance = 20,
  direction = "up",
  once = true,
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const move = offset(direction, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...move }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
