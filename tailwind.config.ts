import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand
        "tp-red": "#CF2E2E",
        "tp-red-dark": "#A82525",
        // Surface / ink
        bg: "#0B0F14",
        surface: "#141A22",
        ink: "#E8ECF1",
        "ink-2": "#8A94A3",
        hairline: "rgba(255,255,255,0.10)",
        // Thermal (intended for the 3D layer; exposed for parity / accents)
        "thermal-cold": "#4FA8FF",
        "thermal-warm": "#E11D2A",
        "thermal-warm-hot": "#FF4D4D",
      },
      fontFamily: {
        jost: ["var(--font-jost)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Editorial display scale
        display: [
          "clamp(2.75rem, 6.2vw, 6rem)",
          { lineHeight: "1.02", letterSpacing: "-0.03em" },
        ],
        "display-sm": [
          "clamp(2rem, 4.4vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.025em" },
        ],
        eyebrow: ["0.78rem", { lineHeight: "1", letterSpacing: "0.22em" }],
      },
      maxWidth: {
        container: "1200px",
        prose: "60ch",
      },
      spacing: {
        section: "clamp(6rem, 12vw, 11rem)",
      },
      borderRadius: {
        pill: "999px",
      },
      boxShadow: {
        ambient: "0 30px 80px -40px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(207,46,46,0.4), 0 18px 50px -18px rgba(207,46,46,0.55)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(120% 80% at 50% -10%, rgba(207,46,46,0.10), transparent 55%)",
        "hairline-top":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
