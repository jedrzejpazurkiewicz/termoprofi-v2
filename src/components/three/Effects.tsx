"use client";

/**
 * Effects — postprocessing stack (TEMPORARILY DISABLED for performance).
 *
 * The Bloom + fullscreen EffectComposer pass was a measurable per-frame cost on
 * mid GPUs and the page stuttered. Disabled until we gate it behind a capability
 * check (strong GPU + not reduced-motion). The thermal glow still reads via the
 * material emissive + the accent point light, just without the bloom bleed.
 */
export default function Effects() {
  return null;
}
