"use client";

/**
 * Effects — postprocessing stack.
 *
 * A gentle Bloom to let the thermal emissive glow bleed (the warm core should
 * feel like heat, not paint), plus a soft Vignette to settle attention toward
 * the centre and reinforce the calm, dark mood.
 *
 * We keep the normal pass disabled (`enableNormalPass={false}`) since we run
 * no SSAO/normal-based effects — that keeps the composer cheap. Capability-
 * gating (drop effects on weak GPUs) comes later.
 */
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.6}
        mipmapBlur
        radius={0.7}
      />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  );
}
