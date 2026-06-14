"use client";

/**
 * GlassUnit — the hero object: an insulated glass unit (IGU).
 *
 * Two physical-glass panes with a warm-edge spacer frame between them. The
 * spacer uses ThermalMaterial so it can glow cold→warm. An accent point light
 * sits at the core; its intensity tracks the heat uniform.
 *
 * Geometry is ported verbatim from the proven prototype (lighting/materials
 * preserved). Group refs (group / spacer / glass) and the heat light are
 * published into scene-refs on mount so SceneController can drive the
 * emerge / rotate / heat choreography from scroll state.
 *
 * <Float> gives the calm idle bob in the hero; the controller's damped writes
 * sit on top of it (Float animates the group's own transform, we animate the
 * inner spacer/glass offsets and the group's rotation.y).
 */
import { useEffect, useRef } from "react";
import { Float } from "@react-three/drei";
import type { Group, PointLight } from "three";
import { useThermalMaterial } from "@/components/three/ThermalMaterial";
import { sceneRefs } from "@/components/three/scene-refs";

/** Spacer frame dimensions (prototype-proven). */
const BAR = 0.14;
const FRAME_H = 2.7;
const FRAME_D = 1.7;

/** A single physical-glass pane. */
function GlassPane({ x }: { x: number }) {
  return (
    <mesh position={[x, 0, 0]} castShadow>
      <boxGeometry args={[0.12, 3, 2.2]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.5}
        roughness={0.05}
        ior={1.45}
        clearcoat={1}
        color="#cfe6ff"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/** The 4-bar warm-edge spacer, rendered with the shared thermal material. */
function SpacerFrame() {
  const { material } = useThermalMaterial();
  return (
    <group>
      {/* top / bottom rails (run along Z) */}
      <mesh position={[0, FRAME_H / 2, 0]} material={material} castShadow>
        <boxGeometry args={[BAR, BAR, FRAME_D]} />
      </mesh>
      <mesh position={[0, -FRAME_H / 2, 0]} material={material} castShadow>
        <boxGeometry args={[BAR, BAR, FRAME_D]} />
      </mesh>
      {/* left / right stiles (run along Y) */}
      <mesh position={[0, 0, FRAME_D / 2]} material={material} castShadow>
        <boxGeometry args={[BAR, FRAME_H + BAR, BAR]} />
      </mesh>
      <mesh position={[0, 0, -FRAME_D / 2]} material={material} castShadow>
        <boxGeometry args={[BAR, FRAME_H + BAR, BAR]} />
      </mesh>
    </group>
  );
}

export default function GlassUnit() {
  const group = useRef<Group>(null);
  const spacer = useRef<Group>(null);
  const glass = useRef<Group>(null);
  const heatLight = useRef<PointLight>(null);

  // Publish refs to the shared module so SceneController can animate them.
  useEffect(() => {
    sceneRefs.group = group.current;
    sceneRefs.spacer = spacer.current;
    sceneRefs.glass = glass.current;
    sceneRefs.heatLight = heatLight.current;
    return () => {
      sceneRefs.group = null;
      sceneRefs.spacer = null;
      sceneRefs.glass = null;
      sceneRefs.heatLight = null;
    };
  }, []);

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
      <group ref={group}>
        {/* Glass panes: the group is what slides apart (emerge). */}
        <group ref={glass}>
          <GlassPane x={-0.35} />
          <GlassPane x={0.35} />
        </group>

        {/* Spacer: slides out from between the panes during the reveal. */}
        <group ref={spacer}>
          <SpacerFrame />
        </group>

        {/* Core accent light — intensity driven by uHeat in the controller. */}
        <pointLight
          ref={heatLight}
          color="#FF4D4D"
          intensity={0}
          distance={6}
          decay={2}
        />
      </group>
    </Float>
  );
}
