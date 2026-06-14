"use client";

/**
 * ThermalMaterial — the heart of the "termo-reveal".
 *
 * A MeshStandardMaterial whose shader is patched (onBeforeCompile) to bleed a
 * cold→warm emissive gradient out of the spacer's core. The gradient is driven
 * by `uHeat` (0..1), which SceneController ramps as the user scrolls, so the
 * frame visibly "warms up" by the Statistics beat.
 *
 * The uniform is the SAME object held in scene-refs (`sceneRefs.uHeat`), so the
 * controller animating `sceneRefs.uHeat.value` and this shader reading `uHeat`
 * are wired to one value with zero plumbing.
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
    const mat = new THREE.MeshStandardMaterial({
      color: "#1a1a1f",
      metalness: 0.3,
      roughness: 0.35,
    });

    mat.onBeforeCompile = (shader) => {
      // Bind OUR uniform object (identity matters — same ref the controller drives).
      shader.uniforms.uHeat = uHeat;

      // --- Vertex: derive a 0(core)..1(edge) factor from local position. ---
      // The spacer bars are thin; the cross-section distance from the local
      // origin gives a clean "core is hot, surface is cold" falloff once we
      // invert it. We compute it in the vertex stage and interpolate.
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying float vEdge;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           // length of the local position, normalised into a soft 0..1 band.
           float edgeDist = length(position) ;
           vEdge = clamp(edgeDist / 1.6, 0.0, 1.0);`,
        );

      // --- Fragment: mix cold→warm and add to emissive, scaled by uHeat. ---
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uHeat;
           varying float vEdge;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           // coreFactor: 1 at the core, fading to 0 at the edge.
           float coreFactor = 1.0 - vEdge;
           vec3 coldColor = vec3(0.31, 0.66, 1.0);  // #4FA8FF-ish, thermal cold
           vec3 warmColor = vec3(0.88, 0.11, 0.16); // #E11D2A-ish, thermal warm
           vec3 thermal = mix(coldColor, warmColor, coreFactor);
           totalEmissiveRadiance += thermal * coreFactor * uHeat * 2.0;`,
        );

      // Stash on userData so a hot-reload / clone can re-inspect if needed.
      mat.userData.shader = shader;
    };

    // Bump the cache key so three compiles our patched program (not a shared one).
    mat.customProgramCacheKey = () => "thermal-material-v1";

    return mat;
    // uHeat is a stable module singleton, so this truly runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { material, uHeat };
}
