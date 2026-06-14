"use client";

/**
 * SceneRoot — the R3F <Canvas> and its scene graph.
 *
 * Transparent (alpha, no <color> background) so the DOM's dark gradient shows
 * through and the unit appears to float in the page. ACES tonemapping +
 * "city" environment reproduce the proven prototype look. The controller and
 * postprocessing live inside the Canvas; all scroll wiring reaches them via
 * the shared scroll-store / scene-refs modules.
 */
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import GlassUnit from "@/components/three/GlassUnit";
import SceneController from "@/components/three/SceneController";
import Effects from "@/components/three/Effects";

export default function SceneRoot() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [4.5, 1.5, 5], fov: 38 }}
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
        <GlassUnit />
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.5}
          scale={12}
          blur={2.6}
          far={4}
        />
      </Suspense>

      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 6, 5]} intensity={1.2} castShadow />

      <SceneController />
      <Effects />

      {/* TODO(discovery): OrbitControls handoff for the "inspect" moment —
          enable a constrained drei <OrbitControls/> only while the Discovery
          section is pinned, then hand the camera back to SceneController. */}
    </Canvas>
  );
}
