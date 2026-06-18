/**
 * scroll-store — plain module (no React, no 'use client').
 *
 * A tiny, allocation-free source of truth for scroll-driven animation.
 * `scroll.progress` is the global spine progress (0..1) written by the
 * spine ScrollTrigger in SmoothScrollProvider. `scroll.beats` holds the
 * local progress (0..1) of each <BeatAnchor> as it crosses the viewport.
 *
 * Everything here is read every frame inside useFrame, so it must stay
 * cheap: no closures created per read, no object allocation.
 */
export const scroll = {
  /** Global progress along the [data-spine] element, 0..1. */
  progress: 0,
  /** Per-beat local progress, keyed by beat number, 0..1. */
  beats: {} as Record<number, number>,
  /** True while the Discovery section intersects the viewport. A reliable
   *  IntersectionObserver-driven signal that the 3D unit MUST be visible —
   *  independent of GSAP/ScrollTrigger/pin refresh timing, so the model can
   *  never silently stay at scale 0 when the user is looking at Discovery. */
  discoveryInView: false,
};

/** Store the local progress for a given beat anchor. */
export function setBeat(n: number, p: number) {
  scroll.beats[n] = p;
}

/** Read a beat's local progress (0 if it has never reported). */
export function getBeat(n: number) {
  return scroll.beats[n] ?? 0;
}

/** Clamp a value into the inclusive [0, 1] range. */
export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Remap `v` from the range [a, b] onto [0, 1] and clamp.
 * Useful for slicing a sub-window out of a beat's progress, e.g.
 * `remap(getBeat(1), 0.2, 0.8)` to ignore the head and tail.
 */
export function remap(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}
