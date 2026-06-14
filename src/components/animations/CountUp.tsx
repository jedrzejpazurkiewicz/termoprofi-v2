"use client";

import { useEffect, useRef, useState } from "react";

export interface CountUpProps {
  /** Final value to count to (preferred prop, matches the STATS shape). */
  value?: number;
  /** Alias for `value`. One of `value` / `end` must be provided. */
  end?: number;
  /** Duration in milliseconds. */
  duration?: number;
  suffix?: string;
  prefix?: string;
  /** Decimal places to render. */
  decimals?: number;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function format(value: number, decimals: number): string {
  // Polish locale: comma decimal separator, no grouping needed for our scale.
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Animates a number from 0 to `end` once it scrolls into view.
 * IntersectionObserver triggers; requestAnimationFrame + easeOutCubic drives it.
 * Reduced-motion users see the final value immediately.
 */
export function CountUp({
  value,
  end,
  duration = 1800,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const target = value ?? end ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setCurrent(target);
      return;
    }

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setCurrent(target * easeOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setCurrent(target);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(current, decimals)}
      {suffix}
    </span>
  );
}

export default CountUp;
