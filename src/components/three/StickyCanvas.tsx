"use client";

/**
 * StickyCanvas — mounts the 3D scene fixed behind the page content.
 *
 * The Canvas is loaded client-only (ssr:false) via next/dynamic so three.js
 * never runs on the server. While the scene chunk loads we paint a soft radial
 * gradient that matches the scene's mood, so the first paint is calm rather
 * than a hard empty rectangle.
 *
 * Positioning: `fixed inset-0 -z-0 pointer-events-none` — the canvas sits at
 * the base layer and the page's main content (z-10) renders over it. Pointer
 * events pass through so the DOM stays fully interactive.
 */
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/three/SceneRoot"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 90% at 70% 35%, rgba(207,46,46,0.08) 0%, rgba(20,26,34,0.0) 45%), radial-gradient(80% 60% at 50% 60%, rgba(79,168,255,0.06) 0%, rgba(11,15,20,0) 60%)",
      }}
    />
  ),
});

export default function StickyCanvas() {
  return (
    <div className="fixed inset-0 -z-0 pointer-events-none">
      <Scene />
    </div>
  );
}
