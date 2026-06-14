"use client";

/**
 * SceneController — the choreographer. No meshes of its own; it reads scroll
 * state every frame and damps the camera + GlassUnit toward target poses.
 *
 * Beats (each is a <BeatAnchor>'s local 0..1 progress as it crosses the view):
 *   beat 1 — Discovery:  spacer slides OUT from between the panes; panes part.
 *   beat 2 — (rotate):   the whole unit turns to present its profile.
 *   beat 3 — Statistics: heat climaxes (uHeat → ~1.0), the termo-reveal peaks.
 *
 * Heat ramps continuously from ~0.3 (idle) to 1.0 across beats 1→3 so the
 * warm-up reads as one gathering crescendo rather than a step change.
 *
 * Camera does a calm push-in + slight orbit from the GLOBAL spine progress, so
 * it keeps moving smoothly even between beats.
 *
 * Everything is written through easing.damp* for frame-rate independence — we
 * never snap a raw scrub value onto a transform.
 */
import { useThree, useFrame } from "@react-three/fiber";
import * as easing from "maath/easing";
import * as THREE from "three";
import { scroll, getBeat, clamp01 } from "@/lib/scroll-store";
import { sceneRefs } from "@/components/three/scene-refs";

// Reusable scratch vectors — never allocate inside useFrame.
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3(0, 0, 0);

// Idle / hero camera pose (matches SceneRoot's <Canvas camera>).
const CAM_BASE = new THREE.Vector3(4.5, 1.5, 5);

export default function SceneController() {
  const { camera } = useThree();

  useFrame((_state, dt) => {
    // Guard a stable dt — first frame or a stalled tab can hand us a huge delta.
    const delta = Math.min(dt, 1 / 30);

    const p = clamp01(scroll.progress);
    const b1 = getBeat(1); // emerge
    const b2 = getBeat(2); // rotate
    const b3 = getBeat(3); // heat climax

    // ---- Camera: calm push-in + slight orbit driven by global progress. ----
    // Push in along the dolly axis and swing the azimuth a touch; keep it
    // subtle — "magnetyczny spokój", not a flythrough.
    const orbit = p * 0.6; // radians of azimuth across the whole page
    const push = p * 1.7; // how far we dolly toward the unit
    const radius = CAM_BASE.length() - push;
    const baseAzimuth = Math.atan2(CAM_BASE.x, CAM_BASE.z);
    const az = baseAzimuth - orbit;

    camTarget.set(
      Math.sin(az) * radius,
      CAM_BASE.y - p * 0.35, // settle slightly as we descend
      Math.cos(az) * radius,
    );

    easing.damp3(camera.position, camTarget, 0.5, delta);
    camera.lookAt(lookTarget);

    // ---- GlassUnit: emerge (beat 1), rotate (beat 2), heat (beats 1→3). ----
    const { group, spacer, glass, heatLight, uHeat } = sceneRefs;

    // EMERGE: panes part along X, spacer lifts up and toward the viewer so it
    // reads as "pulled out" of the assembly.
    if (glass) {
      easing.damp3(
        glass.position,
        [0, 0, b1 * 0.0], // panes stay centred; their children carry the split
        0.4,
        delta,
      );
      // Split the two panes by scaling the glass group along X.
      const split = 1 + b1 * 0.9;
      easing.damp3(glass.scale, [split, 1, 1], 0.4, delta);
    }

    if (spacer) {
      easing.damp3(
        spacer.position,
        [0, b1 * 0.9, b1 * 0.7], // rise + come forward as it emerges
        0.45,
        delta,
      );
    }

    // ROTATE: present the profile. Beat 2 turns the whole unit; we add a hair
    // of the global progress so it keeps drifting calmly throughout.
    if (group) {
      const targetY = b2 * Math.PI * 0.6 + p * 0.25;
      easing.dampE(group.rotation, [group.rotation.x, targetY, 0], 0.5, delta);
    }

    // HEAT: ramp 0.3 → 1.0 as the reveal progresses. Weight it toward the
    // later beats so the climax lands at Statistics (beat 3).
    const heat = clamp01(0.3 + 0.25 * b1 + 0.2 * b2 + 0.45 * b3);
    easing.damp(uHeat, "value", heat, 0.35, delta);

    // The core light breathes with the heat (offset so cold ≈ dark).
    if (heatLight) {
      const targetIntensity = clamp01((uHeat.value - 0.3) / 0.7) * 6;
      easing.damp(heatLight, "intensity", targetIntensity, 0.35, delta);
    }
  });

  return null;
}
