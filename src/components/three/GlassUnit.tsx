"use client";

/**
 * GlassUnit — the 3D glass package on the Discovery spine.
 *
 * Loads the optimised, Draco-compressed /models/szyba-opt.glb (13 meshes / 6
 * materials / ~1.25 MB) so it downloads + parses fast. The raw model is huge
 * (~8000 units) so on load we NORMALISE it (centre + scale). It's pushed to the
 * RIGHT of frame, sits on a soft WHITE backdrop (so the transparent glass reads
 * — invisible on dark), and SCALES IN as the dolot hands off to it (the model
 * "appears" once the camera has zoomed to the window corner).
 *
 * Fallback: a procedural 3-pane + spacer unit if the GLB / Draco decoder fails.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  Suspense,
  ReactNode,
} from "react";
import { Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, PointLight, Object3D, Mesh, MeshBasicMaterial } from "three";
import { useThermalMaterial } from "@/components/three/ThermalMaterial";
import { sceneRefs } from "@/components/three/scene-refs";
import { scroll, clamp01 } from "@/lib/scroll-store";
import { isMobile, prefersReducedMotion } from "@/lib/capabilities";

const MODEL = "/models/szyba.glb";
/** Position offset. Centred (sits at the camera's lookAt, so it stays framed as
 *  the camera dollies/orbits on scroll). Tune here. */
const RIGHT_OFFSET: [number, number, number] = [0, 0.25, 0];
/** Base orientation so the unit faces front (not its back). JJ tunes the Y here. */
const BASE_ROT: [number, number, number] = [0, -0.8, 0];

/* ---- Soft white backdrop — fades in only across the Discovery reveal ----- */

function Backdrop() {
  const ref = useRef<Mesh>(null);

  // A studio-sweep gradient (bright pool behind the unit → cool light grey at
  // the edges) instead of a flat fill. Gives the light section real depth, so
  // the transparent glass reads as catching light rather than sitting on card.
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const edge = "#d6dde4";
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, size, size);
    const g = ctx.createRadialGradient(
      size * 0.5, size * 0.46, 4,
      size * 0.5, size * 0.5, size * 0.13,
    );
    g.addColorStop(0, "#fbfdff");
    g.addColorStop(0.5, "#eef2f6");
    g.addColorStop(1, edge);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    // Fade in with the model as the dolot hands off (global spine progress),
    // with an IntersectionObserver floor so it is always present on Discovery.
    const a = Math.max(
      clamp01((scroll.progress - 0.26) / 0.12),
      scroll.discoveryInView ? 1 : 0,
    );
    const mat = m.material as MeshBasicMaterial;
    mat.opacity += (a - mat.opacity) * 0.12;
  });
  return (
    <mesh ref={ref} position={[0, 0, -4]} renderOrder={-1}>
      <planeGeometry args={[80, 46]} />
      <meshBasicMaterial
        map={texture ?? undefined}
        color="#ffffff"
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

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
  const { scene } = useGLTF(MODEL, true);
  const cfg = useMemo(() => {
    // Guard: only process the freshly-loaded scene once (re-render / HMR safe).
    if (!scene.userData._tpProcessed) {
      // Recolour the FIBERTHERM spacer frames brand-red (they export dark/black)
      // and give them a faint engineered metallic sheen.
      scene.traverse((o) => {
        if (!/ramka/i.test(o.name || "")) return;
        o.traverse((c) => {
          const mesh = c as Mesh;
          if (!(mesh as unknown as { isMesh?: boolean }).isMesh || !mesh.material) return;
          const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const mat = src.clone() as THREE.MeshStandardMaterial;
          if (mat.color) mat.color.set("#CF2E2E");
          mat.metalness = 0.3;
          mat.roughness = 0.38;
          mat.envMapIntensity = 1.25;
          mesh.material = mat;
        });
      });
      // Let the "city" environment read on every PBR surface so the glass and
      // metal reflect a real room instead of looking like flat grey plastic.
      scene.traverse((o) => {
        const mesh = o as Mesh;
        if (!(mesh as unknown as { isMesh?: boolean }).isMesh || !mesh.material) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const mm = m as THREE.MeshStandardMaterial;
          if ("envMapIntensity" in mm) {
            mm.envMapIntensity = Math.max(mm.envMapIntensity ?? 1, 1.3);
            mm.needsUpdate = true;
          }
        });
      });
      // Collect the glass panes (named "szyba*") so the controller can slide
      // them apart on beat 1 — the "rozbierz okno" reveal of the ramka inside.
      const panes: { obj: Object3D; baseX: number }[] = [];
      scene.traverse((o) => {
        if (/^szyba/i.test(o.name || "") && (o as Mesh).isMesh) {
          panes.push({ obj: o, baseX: o.position.x });
        }
      });
      scene.userData._panes = panes;
      scene.userData._tpProcessed = true;
    }
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 3.6 / (Math.max(size.x, size.y, size.z) || 1);
    return {
      scale: s,
      position: center.multiplyScalar(-s).toArray() as [number, number, number],
    };
  }, [scene]);
  useEffect(() => {
    if (!scene) return;
    onReady(scene);
    const panes =
      (scene.userData._panes as { obj: Object3D; baseX: number }[]) || [];
    sceneRefs.panes = panes;
    sceneRefs.paneCenterX = panes.length
      ? panes.reduce((s, p) => s + p.baseX, 0) / panes.length
      : 0;
  }, [scene, onReady]);
  return <primitive object={scene} scale={cfg.scale} position={cfg.position} />;
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL, true);
}

/* ---- Main component. --------------------------------------------------- */

export default function GlassUnit() {
  const group = useRef<Group>(null);
  const spacer = useRef<Group>(null);
  const glass = useRef<Group>(null);
  const heatLight = useRef<PointLight>(null);
  const [modelReady, setModelReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  // Idle bob/wobble: near-imperceptible on desktop, off entirely under
  // reduced-motion or on mobile — the scroll-driven camera carries the motion.
  const calm = prefersReducedMotion() || isMobile();

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
      sceneRefs.panes = [];
      sceneRefs.paneCenterX = 0;
    };
  }, []);

  // Emergency safety net: if nobody has raised the group's scale within 2s
  // (e.g. SceneController's useFrame never ran — cold start / StrictMode
  // double-mount), force it visible — but ONLY while Discovery is on screen, so
  // it matches the controller's gate and never leaks the unit into other sections.
  useEffect(() => {
    const t = setTimeout(() => {
      const g = group.current;
      if (g && g.scale.x === 0 && scroll.discoveryInView) g.scale.set(1, 1, 1);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (modelReady || useFallback) return;
    const t = setTimeout(() => {
      if (!modelReady) setUseFallback(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [modelReady, useFallback]);

  // If the real model becomes ready while the fallback is showing, prefer the
  // real unit over the procedural one.
  useEffect(() => {
    if (modelReady && useFallback) setUseFallback(false);
  }, [modelReady, useFallback]);

  return (
    <>
      <Backdrop />
      <group position={RIGHT_OFFSET} rotation={BASE_ROT}>
        <Float
          speed={calm ? 0 : 0.3}
          rotationIntensity={calm ? 0 : 0.02}
          floatIntensity={calm ? 0 : 0.07}
        >
          {/* scale starts at 0 — SceneController scales it in on the handoff. */}
          <group ref={group} scale={0}>
            <group ref={glass}>
              {useFallback ? (
                <>
                  <FallbackPane x={-0.35} />
                  <FallbackPane x={0.35} />
                </>
              ) : null}
            </group>

            <group ref={spacer}>{useFallback ? <FallbackSpacer /> : null}</group>

            {!useFallback && (
              <GLErrorBoundary onError={() => setUseFallback(true)}>
                <Suspense fallback={null}>
                  <RealModel onReady={() => setModelReady(true)} />
                </Suspense>
              </GLErrorBoundary>
            )}

            <pointLight
              ref={heatLight}
              color="#FF4D4D"
              intensity={0}
              distance={6}
              decay={2}
            />
          </group>
        </Float>
      </group>
    </>
  );
}
