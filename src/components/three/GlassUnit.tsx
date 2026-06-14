"use client";

/**
 * GlassUnit — the hero 3D object on the discovery spine.
 *
 * Loads the real hand-modelled `/models/szyba.glb` (Gabriel's 3D asset):
 *   - 3 insulating glass panes (mesh 77, 78, 79)
 *   - 4-bar FIBERTHERM spacer frame
 *   - 80× desiccant spheres inside the frame
 *   - sealing foil
 *
 * Procedural fallback: if the GLB fails to load (CDN down, GPU too weak,
 * 5s timeout), renders 2 glass panes + a procedural spacer using the same
 * thermal material so the scene still has the right vibe.
 *
 * Mount publishes refs into scene-refs so SceneController can drive the
 * emerge / rotate / heat choreography from one source of truth.
 */
import {
  useEffect,
  useRef,
  useState,
  Component,
  Suspense,
  ReactNode,
} from "react";
import { Float, useGLTF } from "@react-three/drei";
import type { Group, PointLight, Object3D } from "three";
import { useThermalMaterial } from "@/components/three/ThermalMaterial";
import { sceneRefs } from "@/components/three/scene-refs";

/* ---- Procedural fallback (used if GLB fails to load) ------------------- */

const BAR = 0.14;
const FRAME_H = 2.7;
const FRAME_D = 1.7;

function FallbackPane({ x }: { x: number }) {
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

function FallbackSpacer() {
  const { material } = useThermalMaterial();
  return (
    <group>
      <mesh position={[0, FRAME_H / 2, 0]} material={material} castShadow>
        <boxGeometry args={[BAR, BAR, FRAME_D]} />
      </mesh>
      <mesh position={[0, -FRAME_H / 2, 0]} material={material} castShadow>
        <boxGeometry args={[BAR, BAR, FRAME_D]} />
      </mesh>
      <mesh position={[0, 0, FRAME_D / 2]} material={material} castShadow>
        <boxGeometry args={[BAR, FRAME_H + BAR, BAR]} />
      </mesh>
      <mesh position={[0, 0, -FRAME_D / 2]} material={material} castShadow>
        <boxGeometry args={[BAR, FRAME_H + BAR, BAR]} />
      </mesh>
    </group>
  );
}

/* ---- Real GLB loader + ErrorBoundary so a bad load falls back gracefully. */

class GLErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function RealModel({ onReady }: { onReady: (scene: Object3D) => void }) {
  const gltf = useGLTF("/models/szyba.glb");
  useEffect(() => {
    if (gltf?.scene) onReady(gltf.scene);
  }, [gltf, onReady]);
  return <primitive object={gltf.scene} />;
}

/* Preload hint so the bundle is warm by the time the user scrolls there. */
if (typeof window !== "undefined") {
  useGLTF.preload("/models/szyba.glb");
}

/* ---- Main component. --------------------------------------------------- */

export default function GlassUnit() {
  const group = useRef<Group>(null);
  const spacer = useRef<Group>(null);
  const glass = useRef<Group>(null);
  const heatLight = useRef<PointLight>(null);
  const [modelReady, setModelReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Publish refs so SceneController can drive the choreography.
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

  // If GLB is still loading after 5s, swap to the procedural fallback.
  useEffect(() => {
    if (modelReady || useFallback) return;
    const t = setTimeout(() => {
      if (!modelReady) setUseFallback(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [modelReady, useFallback]);

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
      <group ref={group}>
        {/* Glass panes (procedural, only used in fallback) */}
        <group ref={glass}>
          {useFallback ? (
            <>
              <FallbackPane x={-0.35} />
              <FallbackPane x={0.35} />
            </>
          ) : null}
        </group>

        {/* Spacer (procedural fallback or empty container for the GLB) */}
        <group ref={spacer}>
          {useFallback ? <FallbackSpacer /> : null}
        </group>

        {/* Real Gabriel GLB — falls back if it errors or stalls. */}
        {!useFallback && (
          <GLErrorBoundary onError={() => setUseFallback(true)}>
            <Suspense fallback={null}>
              <RealModel onReady={() => setModelReady(true)} />
            </Suspense>
          </GLErrorBoundary>
        )}

        {/* Heat light — intensity driven by uHeat in SceneController. */}
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
