"use client";

/**
 * ThermalMaterial — the heart of the "termo-reveal".
 *
 * A MeshStandardMaterial whose shader is patched (onBeforeCompile) so the
 * spacer frame reads like a THERMAL-CAMERA capture: the base material is dark
 * graphite metal, the OUTER skin of each bar stays cool blue, and only the
 * CORE drives warm → hot red as `uHeat` (0..1) rises. SceneController ramps
 * `uHeat` while the user scrolls, so the frame visibly "heats up" by the
 * Statistics beat.
 *
 * The uniform is the SAME object held in scene-refs (`sceneRefs.uHeat`), so the
 * controller animating `sceneRefs.uHeat.value` and this shader reading `uHeat`
 * are wired to one value with zero plumbing.
 *
 * Why a cross-section coreFactor (not whole-frame distance)?
 *   The spacer is four THIN bars; a given bar is long on one local axis and
 *   slim on the other two. `length(position)` is dominated by that long axis,
 *   so it can't tell "core" from "edge" — the old shader bled warm into the
 *   middle of the whole frame and read as a flat pink wash. Instead we drop the
 *   single largest-magnitude axis (that's the length of the bar) and measure
 *   the radius in the remaining cross-section plane. That radius is small at the
 *   metal core and grows toward the bar's surface — exactly the heat gradient a
 *   thermographic camera would see through the profile.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { sceneRefs, type Uniform } from "@/components/three/scene-refs";

export interface UseThermalMaterial {
  /** Ready-to-use material; assign to a <mesh material={...}/>. */
  material: THREE.MeshStandardMaterial;
  /** The shared heat uniform (0..1). Animate `.value` to drive the reveal. */
  uHeat: Uniform<number>;
}

/**
 * Returns a memoized thermal material plus the heat uniform it reads.
 * The material is created once per mount; the uniform is the shared singleton.
 */
export function useThermalMaterial(): UseThermalMaterial {
  const uHeat = sceneRefs.uHeat;

  const material = useMemo(() => {
    // Dark graphite metal base — this is what the bar reads as when cold and
    // what the thermal gradient sits ON TOP of (so it never looks plastic).
    const mat = new THREE.MeshStandardMaterial({
      color: "#16161b",
      metalness: 0.55,
      roughness: 0.42,
    });

    mat.onBeforeCompile = (shader) => {
      // Bind OUR uniform object (identity matters — same ref the controller drives).
      shader.uniforms.uHeat = uHeat;

      // --- Vertex: derive a 0(surface)..1(core) factor from the bar's
      //     CROSS-SECTION, then interpolate it to the fragment stage. ---
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying float vCore;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           // Per-axis distance from the bar centreline.
           vec3 a = abs(position);
           // The largest component is the bar's LENGTH axis — drop it, so the
           // remaining two describe the slim cross-section of this bar.
           float maxC = max(a.x, max(a.y, a.z));
           float crossR = (a.x + a.y + a.z) - maxC; // sum of the two smaller axes
           // Half-thickness of the FIBERTHERM bar (~0.14 box → ~0.07 half).
           // Normalise so r=0 (core) → 1, r≥halfThk (surface) → 0.
           float halfThk = 0.085;
           vCore = clamp(1.0 - crossR / halfThk, 0.0, 1.0);
           // Ease toward the core so the hot zone is a tight filament, not a slab.
           vCore = vCore * vCore;`,
        );

      // --- Fragment: build a thermal-camera emissive and ADD it, gated by
      //     uHeat. Cold edge stays blue; only the core swings to hot red. ---
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uHeat;
           varying float vCore;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>

           // Heat above the cold baseline (controller idles uHeat at ~0.3).
           float hot = clamp((uHeat - 0.3) / 0.7, 0.0, 1.0);

           // Thermal palette (linear-ish RGB).
           vec3 coolBlue = vec3(0.31, 0.66, 1.0);  // #4FA8FF — outer skin, always cool
           vec3 warmRed  = vec3(0.88, 0.11, 0.16);  // #E11D2A — core warming
           vec3 hotRed   = vec3(1.00, 0.30, 0.30);  // #FF4D4D — core at climax

           // Core colour climbs warm→hot as the unit heats.
           vec3 coreColor = mix(warmRed, hotRed, hot);

           // Cold framing glow: a faint blue rim that reads on the OUTER skin
           // (low vCore). Present from the first frame so the metal isn't dead,
           // but kept subtle so it never washes the whole bar blue.
           float rim = (1.0 - vCore);
           vec3 coldGlow = coolBlue * rim * 0.19;

           // Warm filament: confined to the core (vCore high) AND scaled by how
           // hot we are, so at rest the bar is graphite + a hint of blue, and at
           // the climax a bright red core bleeds outward through the section.
           float coreReach = smoothstep(0.15, 1.0, vCore);
           vec3 warmGlow = coreColor * coreReach * hot * 1.35;

           // The cold rim fades as the core takes over, so a hot bar doesn't
           // carry a competing blue halo at the climax.
           totalEmissiveRadiance += coldGlow * (1.0 - hot * 0.8) + warmGlow;`,
        );

      // Stash on userData so a hot-reload / clone can re-inspect if needed.
      mat.userData.shader = shader;
    };

    // Bump the cache key so three compiles our patched program (not a shared one).
    mat.customProgramCacheKey = () => "thermal-material-v2";

    return mat;
    // uHeat is a stable module singleton, so this truly runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { material, uHeat };
}
