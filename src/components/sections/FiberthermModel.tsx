"use client";

/**
 * FiberthermModel — interaktywny model 3D przekroju szyby zespolonej dla sekcji
 * FIBERTHERM. User obraca (drag) i zoomuje (scroll) przez OrbitControls; idle
 * auto-rotation jest delikatna (~8.6°/s) i wyłącza się pod reduced-motion.
 *
 * To NIE jest własny <Canvas> — komponent renderuje samą ZAWARTOŚĆ sceny;
 * <Canvas> dostarcza Fibertherm.tsx (kamera, dpr, alpha).
 *
 * Model (`/models/szyba.glb`) jest TEN SAM, którego używa GlassUnit w Discovery.
 * useGLTF cache'uje scenę globalnie, a Object3D może mieć tylko jednego rodzica —
 * dlatego KLONUJEMY scenę i materiały. Bez tego drugi <Canvas> "ukradłby" model
 * z Discovery, a nasze przekolorowanie ramki wyciekłoby do tamtej sekcji.
 */
import {
  Component,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Material, Mesh, Object3D } from "three";
import { prefersReducedMotion } from "@/lib/capabilities";

const MODEL = "/models/szyba.glb";

/* Generic boundary: renders null on failure and signals the parent (optional).
   Used for the GLB load (→ procedural fallback) and the city envMap (→ skip). */
class ErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* Real GLB. Cloned + material-isolated so we never mutate the scene GlassUnit
   shares, then centred and scaled to ~3.6 units (same normalisation as GlassUnit). */
function RealModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL, true);

  const model = useMemo(() => {
    const root = scene.clone(true);

    // Inverted detection: in this GLB the frame geometry is named Sphere/Cube/
    // folia/etc. (the "ramka" nodes are empty groups), so finding "ramka" missed
    // everything. Instead we tag the GLASS panes (szyba*) and paint everything
    // else brand-red — only the panes stay transparent.
    const szkloMeshes = new Set<Object3D>();
    root.traverse((o) => {
      if (!/szyba|szkło|szklo|glass|pane/i.test(o.name || "")) return;
      o.traverse((c) => {
        if ((c as Mesh).isMesh) szkloMeshes.add(c);
      });
    });

    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!(mesh as { isMesh?: boolean }).isMesh || !mesh.material) return;
      const isSzklo = szkloMeshes.has(mesh);
      const remap = (m: Material) => {
        const mm = m.clone() as THREE.MeshStandardMaterial;
        if (!isSzklo) {
          if (mm.color) mm.color.set("#CF2E2E");
          mm.metalness = 0.3;
          mm.roughness = 0.38;
          mm.envMapIntensity = 1.25;
        } else if ("envMapIntensity" in mm) {
          mm.envMapIntensity = Math.max(mm.envMapIntensity ?? 1, 1.3);
        }
        mm.needsUpdate = true;
        return mm;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(remap)
        : remap(mesh.material);
    });

    // Normalise: the raw model is huge — centre it and scale to ~3.6 units.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.6 / (Math.max(size.x, size.y, size.z) || 1);
    root.scale.setScalar(s);
    root.position.copy(center.multiplyScalar(-s));
    return root;
  }, [scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return <primitive object={model} />;
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL, true);
}

/* Procedural fallback if the GLB never loads (3s timeout) or errors. */
function FallbackModel() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 0.2]} />
      <meshStandardMaterial
        color="#CF2E2E"
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export default function FiberthermModel() {
  const reduce = prefersReducedMotion();
  const groupRef = useRef<Group>(null);
  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);

  // 3s safety net: if the model still hasn't loaded, show the procedural box.
  useEffect(() => {
    if (ready || useFallback) return;
    const t = setTimeout(() => setUseFallback(true), 3000);
    return () => clearTimeout(t);
  }, [ready, useFallback]);

  // If the real model arrives after the fallback appeared, prefer the real one.
  useEffect(() => {
    if (ready && useFallback) setUseFallback(false);
  }, [ready, useFallback]);

  // Gentle idle auto-rotation (~8.6°/s). Off under reduced-motion / fallback.
  useFrame((_, delta) => {
    if (reduce || useFallback || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-5, -3, 2]} intensity={0.3} />

      {/* "city" envMap so glass + metal reflect a real room. If the preset CDN
          fails, the boundary drops it silently — lights still carry the scene. */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      </ErrorBoundary>

      <group ref={groupRef} position={[0, 0, 0]} rotation={[0, -0.4, 0]}>
        {useFallback ? (
          <FallbackModel />
        ) : (
          <ErrorBoundary onError={() => setUseFallback(true)}>
            <Suspense fallback={null}>
              <RealModel onReady={handleReady} />
            </Suspense>
          </ErrorBoundary>
        )}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.5}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
