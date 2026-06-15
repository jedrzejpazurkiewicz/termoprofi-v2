/**
 * scene-refs — the shared wiring between <GlassUnit/> (which owns the
 * meshes + the thermal uniform) and <SceneController/> (which animates them
 * every frame from scroll state).
 *
 * Why a module-level object instead of React context?
 *  - useFrame runs outside React's render cycle; reaching refs through
 *    context would mean a re-render or a ref-of-a-ref dance.
 *  - There is exactly one GlassUnit and one SceneController on the page, so
 *    a singleton is honest about the actual cardinality.
 *  - Reads happen 60+ times/second; a plain object property access is the
 *    cheapest possible path.
 *
 * GlassUnit populates these on mount (and nulls them on unmount). The
 * controller must null-check before using them, since mount order between
 * sibling components inside <Canvas> is not guaranteed.
 */
import type { Group, PointLight, Object3D } from "three";

/** A `{ value: number }` uniform handle, the shape three.js uniforms use. */
export type Uniform<T> = { value: T };

export interface SceneRefs {
  /** Outer group: world transform + scroll-driven rotation.y. */
  group: Group | null;
  /** The 4-bar spacer frame group: slides out from between the panes. */
  spacer: Group | null;
  /** The two-pane glass group: slides apart to expose the spacer. */
  glass: Group | null;
  /** Thermal emissive intensity, 0 (cold) .. 1 (hot). Shared uniform. */
  uHeat: Uniform<number>;
  /** Accent point light inside the unit; intensity tracks uHeat. */
  heatLight: PointLight | null;
  /** Real-model glass panes (named "szyba*"); slide apart on beat 1 — the
   *  "rozbierz okno" reveal that exposes the FIBERTHERM ramka between them. */
  panes: { obj: Object3D; baseX: number }[];
  /** Centroid X of the panes (model-local units) — the explosion pivot. */
  paneCenterX: number;
}

/**
 * The single shared instance. `uHeat` is created here (not null) so the
 * ThermalMaterial and the controller bind to the *same* uniform object from
 * the very first frame — that identity is what makes the heat reveal work.
 */
export const sceneRefs: SceneRefs = {
  group: null,
  spacer: null,
  glass: null,
  uHeat: { value: 0.3 },
  heatLight: null,
  panes: [],
  paneCenterX: 0,
};
