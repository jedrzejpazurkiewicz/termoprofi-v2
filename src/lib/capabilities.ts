/**
 * capabilities — runtime feature/affordance detection.
 *
 * Every helper is guarded for SSR (`typeof window`). On the server they
 * return conservative defaults (not mobile, motion allowed) so the markup
 * rendered on the server matches the client's first paint and hydration
 * stays stable; the real values take over after mount.
 */

/** True on coarse-pointer / small-viewport devices. SSR-safe (false). */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;

  // Prefer the pointer/hover media query — it describes the *input*, which is
  // what actually matters for our heavy 3D + scroll interactions — and fall
  // back to a width heuristic for older engines.
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(min-width: 1024px)").matches;

  return coarse || window.innerWidth < 768;
}

/** True when the user has requested reduced motion. SSR-safe (false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Device-pixel-ratio ceiling for the renderer. We never want to pay for
 * more than 2x (diminishing returns, large GPU cost), and on mobile we cap
 * harder to protect the frame budget. SSR-safe (returns the desktop cap).
 */
export function maxDpr(): number {
  if (typeof window === "undefined") return 2;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, isMobile() ? 1.5 : 2);
}
