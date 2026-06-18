// StickyCanvas — DISABLED 2026-06-16. The 3D glass unit caused a white-screen
// gap between the preceding film and the Discovery section, and it lagged the
// page on lower-end devices. Discovery now renders as text-only, with no 3D
// background. The scene pipeline (SceneRoot / GlassUnit / SceneController …)
// is left intact under src/components/three/ — re-enable by restoring the
// next/dynamic <Scene /> mount below when a lighter 3D pipeline is ready.
export default function StickyCanvas() {
  return null;
}
