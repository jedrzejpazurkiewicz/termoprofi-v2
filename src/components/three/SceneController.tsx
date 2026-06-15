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
import { useRef } from "react";
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
  // Bulletproof "Discovery in view" detection: read the section's LIVE DOM
  // position (throttled ~10x/s), independent of scroll events / Lenis /
  // ScrollTrigger / IntersectionObserver timing — so the unit can never stay
  // invisible after a reload or a jump straight into the section.
  const tick = useRef(0);
  const discoveryEl = useRef<HTMLElement | null>(null);

  useFrame((_state, dt) => {
    // Guard a stable dt — first frame or a stalled tab can hand us a huge delta.
    const delta = Math.min(dt, 1 / 30);

    const p = clamp01(scroll.progress);
    const b1 = getBeat(1); // emerge
    const b2 = getBeat(2); // rotate
    const b3 = getBeat(3); // heat climax

    // Refresh the reliable visibility flag from the live DOM rect. This is the
    // single source of truth for "the unit must be visible" and works on a cold
    // reload / jump into Discovery, when scroll.progress is still 0.
    if (++tick.current % 6 === 0 || !discoveryEl.current) {
      if (!discoveryEl.current) {
        discoveryEl.current = document.getElementById("odkrycie");
      }
      const el = discoveryEl.current;
      if (el) {
        const r = el.getBoundingClientRect();
        scroll.discoveryInView = r.top < window.innerHeight && r.bottom > 0;
      }
    }

    // ---- Camera: calm push-in + slight orbit driven by global progress. ----
    // Push in along the dolly axis and swing the azimuth a touch; keep it
    // subtle — "magnetyczny spokój", not a flythrough.
    const orbit = p * 0.5; // azimuth swing across the spine
    const push = p * 1.4; // dolly toward the unit (kept moderate so it stays framed)
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
    const { group, spacer, glass, heatLight, uHeat, panes, paneCenterX } =
      sceneRefs;

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

    // EXPLODE (real GLB): once the unit has scaled in, slide the glass panes
    // apart from their centroid to reveal the FIBERTHERM ramka ("rozbierz
    // okno"). Delayed vs the appear so it reads as emerge → then disassemble.
    if (panes.length) {
      const exp = clamp01((b1 - 0.25) / 0.75);
      const spread = 2.4; // multiplier on each pane's offset from the centre
      for (let i = 0; i < panes.length; i++) {
        const pane = panes[i];
        const targetX =
          paneCenterX + (pane.baseX - paneCenterX) * (1 + exp * spread);
        easing.damp(pane.obj.position, "x", targetX, 0.4, delta);
      }
    }

    // ROTATE: present the profile. Beat 2 turns the whole unit; we add a hair
    // of the global progress so it keeps drifting calmly throughout.
    if (group) {
      const targetY = b2 * Math.PI * 0.35 + p * 0.08;
      easing.dampE(group.rotation, [group.rotation.x, targetY, 0], 0.5, delta);
    }

    // APPEAR: the unit scales in as Discovery enters — anchored to beat 1's
    // LOCAL progress (not the global spine progress), so it always reveals at
    // the "Widzisz tę małą ramkę" moment regardless of how much lead-in
    // (hero / bridge / dolot) precedes it in the spine.
    if (group) {
      // Emerge from the dolot (the second film) via the global spine progress —
      // the original, well-loved behaviour: the unit scales in as the camera
      // reaches the window edge (~p 0.34). The IntersectionObserver floor also
      // forces it visible whenever Discovery is on screen (belt-and-suspenders,
      // so it can never silently stay invisible).
      const appear = Math.max(
        clamp01((p - 0.34) / 0.12),
        scroll.discoveryInView ? 1 : 0,
      );
      const sa = appear * appear * (3 - 2 * appear);
      easing.damp3(group.scale, [sa, sa, sa], 0.25, delta);
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
