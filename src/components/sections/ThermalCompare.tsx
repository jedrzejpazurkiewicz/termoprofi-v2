"use client";

/**
 * ThermalCompare — a STATIC, high-impact 50/50 thermal split (no slider, no
 * interaction beyond a subtle hover zoom + a tech tooltip). Kowalski sees both
 * windows at once and gets the difference instantly.
 *
 *  Left  — standard aluminium-edge window: cold blue/violet edge, "10,8°C".
 *  Right — TermoProfi FIBERTHERM window:   warm red/orange edge, "+2,4°C".
 *  Bottom — one key number: "DO 22% MNIEJ STRAT".
 *
 * The thermal imagery is rendered with CSS gradients + an inline SVG
 * cross-section (two panes + the edge spacer = the thermal hot/cold spot), so
 * it stays crisp at any size and reads as a thermographic capture.
 */

interface SideProps {
  label: string;
  tone: "cold" | "warm";
  temp: string;
  sub: string;
  tip: string;
}

/** The thermal-camera field + cross-section for one window. */
function ThermalField({ tone }: { tone: "cold" | "warm" }) {
  const cold = tone === "cold";
  const field = cold
    ? "radial-gradient(120% 115% at 34% 80%, #79b8ff 0%, #3a5fd0 22%, #2a1f78 46%, #0b0d1c 76%)"
    : "radial-gradient(120% 115% at 34% 80%, #ffe27a 0%, #ff7a2e 22%, #e11d2a 47%, #2a0b10 78%)";
  const edgeCore = cold ? "#cfe6ff" : "#ffe6a6";
  const edge = cold ? "#6fa8ff" : "#ff8a3c";

  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: field }} />
      <svg
        aria-hidden
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={`edge-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={edgeCore} />
            <stop offset="100%" stopColor={edge} />
          </linearGradient>
        </defs>
        {/* two glass panes */}
        <rect x="116" y="36" width="48" height="470" rx="4" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" />
        <rect x="236" y="36" width="48" height="470" rx="4" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" />
        {/* sealed cavity */}
        <rect x="164" y="36" width="72" height="470" fill="rgba(8,10,18,0.30)" />
        {/* the edge spacer — the thermal hot/cold spot */}
        <rect x="116" y="470" width="168" height="78" rx="7" fill={`url(#edge-${tone})`} />
        <rect x="116" y="470" width="168" height="78" rx="7" fill="none" stroke="rgba(255,255,255,0.32)" />
      </svg>
      {/* soft edge glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: cold
            ? "radial-gradient(75% 100% at 38% 100%, rgba(120,180,255,0.45), transparent 72%)"
            : "radial-gradient(75% 100% at 38% 100%, rgba(255,150,60,0.5), transparent 72%)",
        }}
      />
      {/* top vignette for depth + legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,transparent_46%,rgba(0,0,0,0.6)_100%)]"
      />
    </div>
  );
}

function CompareSide({ label, tone, temp, sub, tip }: SideProps) {
  const warm = tone === "warm";
  return (
    <figure className="group relative flex flex-col">
      {/* Label — top on mobile, beneath the image on desktop. */}
      <figcaption className="order-1 flex items-center gap-2.5 px-6 py-4 md:order-2 md:py-5">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: warm ? "var(--thermal-warm)" : "var(--thermal-cold)" }}
        />
        <span className="font-jost text-xs font-semibold uppercase tracking-[0.18em] text-ink sm:text-sm">
          {label}
        </span>
      </figcaption>

      <div className="relative order-2 h-[440px] overflow-hidden md:order-1 md:h-[600px]">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none">
          <ThermalField tone={tone} />
        </div>

        {/* Big temperature readout. */}
        <div className="pointer-events-none absolute inset-x-7 bottom-8">
          <div className="font-jost text-[clamp(3.5rem,7.5vw,7rem)] font-extralight leading-none tabular-nums text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.7)]">
            {temp}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/75 sm:text-sm">
            {sub}
          </div>
        </div>

        {/* Tech tooltip — appears on hover (desktop) / always faintly on touch. */}
        <div className="pointer-events-none absolute left-7 top-7 max-w-[15rem] rounded-xl border border-white/15 bg-black/55 px-4 py-2.5 text-sm leading-snug text-white/90 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
          {tip}
        </div>
      </div>
    </figure>
  );
}

export default function ThermalCompare() {
  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-gradient-to-b from-[#0c1016] to-black shadow-ambient">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-hairline md:border-b-0 md:border-r">
          <CompareSide
            label="Okno standardowe"
            tone="cold"
            temp="10,8°C"
            sub="zimna krawędź zimą"
            tip="Mostek termiczny — tędy ucieka ciepło i pieniądze."
          />
        </div>
        <CompareSide
          label="TermoProfi FIBERTHERM"
          tone="warm"
          temp="+2,4°C"
          sub="cieplejsza krawędź"
          tip="Profil, krawędź, która trzyma ciepło w środku."
        />
      </div>

      {/* One key number — the whole story in a line. */}
      <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 border-t border-hairline px-6 py-7 text-center">
        <span className="font-jost text-sm uppercase tracking-[0.22em] text-ink-2">Do</span>
        <span className="font-jost text-[clamp(2.5rem,6vw,4rem)] font-bold leading-none text-tp-red">
          22%
        </span>
        <span className="font-jost text-sm uppercase tracking-[0.22em] text-ink-2">
          mniej strat ciepła
        </span>
      </div>
    </div>
  );
}
