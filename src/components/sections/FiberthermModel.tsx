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

    // Tag the GLASS panes (szyba*) — they stay transparent. Everything else is
    // the spacer "ramka": its body gets a vertical red→black gradient and the
    // desiccant beads (Sphere*) go solid yellow.
    const szkloMeshes = new Set<Object3D>();
    root.traverse((o) => {
      if (!/szyba|szkło|szklo|glass|pane/i.test(o.name || "")) return;
      o.traverse((c) => {
        if ((c as Mesh).isMesh) szkloMeshes.add(c);
      });
    });

    root.updateWorldMatrix(true, true);

    const TOP = new THREE.Color("#E62920"); // żywa czerwień u góry
    const BOTTOM = new THREE.Color("#808085"); // szary u dołu
    const DOT = new THREE.Color("#F2C200"); // żółte kropki (środek)
    const v = new THREE.Vector3();
    const c = new THREE.Color();

    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!(mesh as { isMesh?: boolean }).isMesh || !mesh.material) return;

      // GLASS — keep transparent, lift reflections a touch.
      if (szkloMeshes.has(mesh)) {
        const bump = (m: Material) => {
          const mm = m.clone() as THREE.MeshStandardMaterial;
          if ("envMapIntensity" in mm)
            mm.envMapIntensity = Math.max(mm.envMapIntensity ?? 1, 1.3);
          mm.needsUpdate = true;
          return mm;
        };
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(bump)
          : bump(mesh.material);
        return;
      }

      // DOTS (desiccant beads) — solid yellow.
      if (/sphere/i.test(mesh.name || "")) {
        const paint = (m: Material) => {
          const mm = m.clone() as THREE.MeshStandardMaterial;
          if (mm.color) mm.color.copy(DOT);
          mm.vertexColors = false;
          mm.metalness = 0.1;
          mm.roughness = 0.5;
          mm.envMapIntensity = 0.4;
          mm.needsUpdate = true;
          return mm;
        };
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(paint)
          : paint(mesh.material);
        return;
      }

      // SPACER BODY — vertical gradient PER MESH: vivid red at the top → grey at
      // the bottom. Clone the geometry first so we never mutate the cached GLB
      // shared with the Discovery GlassUnit.
      const geom = (mesh.geometry as THREE.BufferGeometry).clone();
      mesh.geometry = geom;
      geom.computeBoundingBox();
      const bb = geom.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
      const mMinY = bb.min.y;
      const mSpanY = Math.max(bb.max.y - bb.min.y, 1e-6);
      const pos = geom.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(
          mesh.matrixWorld,
        );
        // Curve keeps red dominant up top; grey only toward the bottom.
        const t = Math.pow(
          THREE.MathUtils.clamp((v.y - mMinY) / mSpanY, 0, 1),
          0.45,
        );
        c.copy(BOTTOM).lerp(TOP, t);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const paint = (m: Material) => {
        const mm = m.clone() as THREE.MeshStandardMaterial;
        mm.vertexColors = true;
        if (mm.color) mm.color.set("#ffffff");
        mm.metalness = 0;
        mm.roughness = 0.45;
        mm.envMapIntensity = 0.3;
        mm.needsUpdate = true;
        return mm;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(paint)
        : paint(mesh.material);
    });

    // Normalise: centre + scale. Slightly smaller than before (2.6 → 2.2) so the
    // model no longer touches the card edges.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.2 / (Math.max(size.x, size.y, size.z) || 1);
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
