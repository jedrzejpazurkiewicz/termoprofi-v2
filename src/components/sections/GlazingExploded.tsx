"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Budowa pakietu — a STANDALONE, autoplay-looping exploded-glazing section.
 *
 * Five elements sit on a centre line — pane · frame · pane · frame · pane —
 * assembled. When the section scrolls into view a paused GSAP loop is played:
 *
 *   1. HOLD assembled (~0.5s)
 *   2. EXPLODE horizontally (translateX only; outer elements travel further,
 *      ease power2.inOut, stagger 0.1)
 *   3. LABELS fade in beneath each element (ease power1.out, stagger 0.1)
 *   4. RETURN to assembled (~1.5s) and a repeatDelay holds the loop so the whole
 *      cycle lands every ~8-10s.
 *
 * It is one `gsap.timeline({ repeat: -1, repeatDelay })`, played/paused by an
 * IntersectionObserver (threshold ~0.35): it runs ONLY while the section is in
 * the viewport and pauses when scrolled away. No hover, no scrub, no pin, no
 * scroll-hijack. Transform + opacity ONLY → GPU, 60fps.
 *
 * Responsive labels: FULL labels on >=sm, SHORT labels ("Szyba 1/2/3", "Rama")
 * on <768px (both authored in the DOM; CSS toggles which is visible).
 *
 * prefers-reduced-motion / no-hydration: the markup is authored in its FINAL,
 * readable state — glazing already SPREAD, labels visible. The motion layer
 * applies the assembled/hidden states imperatively and only when motion is
 * allowed, so a clear, labeled spread survives even if JS never runs.
 *
 * The pane/frame visuals are SVG placeholders (glassy translucent panes; brushed
 * aluminium-grey spacer bars) — intended to be swapped for real renders later.
 */

const SEG_EASE = "power2.inOut";

type Kind = "pane" | "frame";

interface Layer {
  key: string;
  kind: Kind;
  /** Direction of the explode along X (centre = 0). */
  dir: -1 | 1;
  /** 0..1 weight; outer elements get a larger weight → travel further. */
  weight: number;
  /** Full label (desktop). */
  label: string;
  /** Shortened label (mobile). */
  labelShort: string;
}

/**
 * Five layers on a centre line: pane · frame · pane · frame · pane.
 * dir/weight place each one symmetrically around centre; the centre pane stays
 * put (dir 1 / weight 0 → no travel).
 */
const LAYERS: Layer[] = [
  {
    key: "pane1",
    kind: "pane",
    dir: -1,
    weight: 1,
    label: "Szyba zewnętrzna — hartowana, 4 mm",
    labelShort: "Szyba 1",
  },
  {
    key: "frame1",
    kind: "frame",
    dir: -1,
    weight: 0.5,
    label: "Rama dystansowa — aluminium ciepłe",
    labelShort: "Rama",
  },
  {
    key: "pane2",
    kind: "pane",
    dir: 1,
    weight: 0,
    label: "Szyba środkowa — niskoemisyjna",
    labelShort: "Szyba 2",
  },
  {
    key: "frame2",
    kind: "frame",
    dir: 1,
    weight: 0.5,
    label: "Rama dystansowa — aluminium ciepłe",
    labelShort: "Rama",
  },
  {
    key: "pane3",
    kind: "pane",
    dir: 1,
    weight: 1,
    label: "Szyba wewnętrzna — bezpieczna",
    labelShort: "Szyba 3",
  },
];

/* SVG placeholder for a glass pane: translucent body + soft vertical gradient +
   a thin light edge highlight down the leading edge. */
function PaneSvg() {
  return (
    <svg
      viewBox="0 0 64 240"
      className="h-full w-full"
      aria-hidden
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ge-pane-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3ff" stopOpacity="0.42" />
          <stop offset="50%" stopColor="#7fb4d8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#cfeaff" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id="ge-pane-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="14%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* glassy body */}
      <rect
        x="1"
        y="1"
        width="62"
        height="238"
        rx="8"
        fill="url(#ge-pane-body)"
      />
      {/* thin light edge highlight */}
      <rect
        x="1"
        y="1"
        width="62"
        height="238"
        rx="8"
        fill="url(#ge-pane-edge)"
      />
      {/* crisp hairline outline */}
      <rect
        x="1"
        y="1"
        width="62"
        height="238"
        rx="8"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
    </svg>
  );
}

/* SVG placeholder for a warm-edge spacer frame: narrow bar with a subtle
   vertical gradient reading as brushed aluminium grey. */
function FrameSvg() {
  return (
    <svg
      viewBox="0 0 22 240"
      className="h-full w-full"
      aria-hidden
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ge-frame-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a4047" />
          <stop offset="22%" stopColor="#9aa3ad" />
          <stop offset="50%" stopColor="#c6ccd2" />
          <stop offset="78%" stopColor="#8b939c" />
          <stop offset="100%" stopColor="#343a41" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="20"
        height="238"
        rx="3"
        fill="url(#ge-frame-body)"
      />
      {/* brushed-metal striations */}
      <g stroke="#ffffff" strokeOpacity="0.10" strokeWidth="0.5">
        <line x1="7" y1="6" x2="7" y2="234" />
        <line x1="11" y1="6" x2="11" y2="234" />
        <line x1="15" y1="6" x2="15" y2="234" />
      </g>
      <rect
        x="1"
        y="1"
        width="20"
        height="238"
        rx="3"
        fill="none"
        stroke="#000000"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function GlazingExploded() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const els = gsap.utils.toArray<HTMLElement>(q("[data-layer]"));
      const labels = gsap.utils.toArray<HTMLElement>(q("[data-label]"));
      if (!els.length) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Reduced motion: the DOM already renders the final, fully readable state
      // (glazing spread, labels visible). Bail out — no loop, no transforms.
      if (reduce) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };

          const spread = isMobile ? 100 : 150;
          // Per-layer explode target along X (translateX only → GPU-cheap).
          const explodeX = (i: number) => {
            const layer = LAYERS[i];
            return layer.dir * spread * layer.weight;
          };

          // Author the assembled / hidden-labels state imperatively. Until this
          // runs the static DOM stays in its final spread+labeled state.
          gsap.set(els, { x: 0, willChange: "transform" });
          gsap.set(labels, { opacity: 0, willChange: "opacity" });

          // One paused, infinitely-repeating loop. repeatDelay pads the cycle so
          // the whole thing lands every ~8-10s. Played/paused by the observer.
          const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: 2.2,
            paused: true,
            defaults: { ease: SEG_EASE },
          });

          tl
            // 1. HOLD assembled.
            .to({}, { duration: 0.5 })
            // 2. EXPLODE horizontally — outer elements travel further.
            .to(els, {
              x: (i) => explodeX(i),
              duration: 1.1,
              stagger: 0.1,
            })
            // 3. LABELS fade in beneath each element.
            .to(
              labels,
              { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.1 },
              "<0.25",
            )
            // hold the spread + labels so the assembly is legible.
            .to({}, { duration: 1.3 })
            // 4. RETURN to assembled (labels fade out with it).
            .to(labels, { opacity: 0, duration: 0.5, ease: "power1.in" }, ">-0.1")
            .to(
              els,
              { x: 0, duration: 1.5, stagger: 0.1 },
              "<",
            );

          // Play/pause via IntersectionObserver — runs ONLY while visible.
          const io = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) tl.play();
              else tl.pause();
            },
            { threshold: 0.35 },
          );
          io.observe(root);

          return () => {
            io.disconnect();
            tl.kill();
            gsap.set(els, { clearProps: "willChange,transform" });
            gsap.set(labels, { clearProps: "willChange,opacity" });
          };
        },
      );
    },
    { scope },
  );

  return (
    <section
      id="budowa-pakietu"
      ref={scope}
      aria-label="Budowa pakietu — trzy szyby, dwie ciepłe ramki"
      className="relative scroll-mt-24"
    >
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-y border-hairline px-6 py-24">
        {/* Dark black/graphite base backdrop. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_0%,#161d27_0%,#0b0f14_55%,#070a0e_100%)]"
        />
        {/* Subtle warm glow keeps the dark slab from going flat. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(207,46,46,0.12),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-hairline-top"
        />

        <div className="relative mx-auto flex w-full max-w-container flex-col items-center">
          {/* Eyebrow + heading + lead. */}
          <header className="mb-14 max-w-2xl text-center sm:mb-20">
            <p className="font-jost text-[0.72rem] uppercase tracking-[0.32em] text-tp-red">
              Budowa pakietu
            </p>
            <h2 className="mt-4 text-balance font-jost text-[clamp(1.9rem,5vw,3.25rem)] font-bold leading-[1.06] tracking-tight text-ink">
              Trzy szyby. Dwie ciepłe ramki.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-ink-2 sm:text-lg">
              Tyle dzieli ciepły dom od standardowego okna — szyby i ramki, które
              zatrzymują ciepło w środku.
            </p>
          </header>

          {/* Stage: 5 layers on a centre line. */}
          <div
            className="relative flex items-end justify-center gap-3 sm:gap-5"
            aria-label="Przekrój pakietu szyby zespolonej: trzy szyby rozdzielone dwiema ramkami dystansowymi"
            role="img"
          >
            {LAYERS.map((layer) => {
              const isPane = layer.kind === "pane";
              return (
                <div
                  key={layer.key}
                  className="relative flex flex-col items-center"
                >
                  {/* Animated element — transform-only target. */}
                  <div
                    data-layer
                    data-kind={layer.kind}
                    className={
                      isPane
                        ? "h-44 w-12 shrink-0 sm:h-60 sm:w-16"
                        : "h-44 w-3.5 shrink-0 sm:h-60 sm:w-5"
                    }
                    style={{ transform: "translateX(0px)" }}
                  >
                    {isPane ? <PaneSvg /> : <FrameSvg />}
                  </div>

                  {/* Label beneath each element. Default opacity-100 so the
                      static / no-JS state is fully labeled; GSAP overrides to 0
                      then animates it in once motion runs. Full label on >=sm,
                      short label on <768px. */}
                  <span
                    data-label
                    className="mt-3 block max-w-[5.5rem] text-center text-[11px] leading-snug text-white/70 sm:mt-4 sm:max-w-[7.5rem] sm:text-xs"
                  >
                    <span className="sm:hidden">{layer.labelShort}</span>
                    <span className="hidden sm:inline">{layer.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
