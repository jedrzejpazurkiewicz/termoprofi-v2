"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import TextReveal from "@/components/animations/TextReveal";
import { COUNTRIES } from "@/lib/constants";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * TrustedBy — "Zaufali nam".
 *
 * Split layout: the distribution map (left) sits inside a soft hairline frame
 * with a quiet red glow; the copy (right) leads with reach — eleven countries
 * across three continents — followed by the live country list rendered as a
 * refined two-column grid of rows, each marked by a small tp-red dot and
 * staggered into view on scroll. One calm stat line closes the block.
 *
 * Scope-local copy lives here; structured data comes from constants.
 */

const INTRO =
  "Producenci szyb zespolonych na trzech kontynentach montują nasze ciepłe ramki — od Lubartowa po Toronto i Seul. Tę samą jakość wysyłamy w każdy z tych adresów.";

// COUNTRIES ends with an "i wiele innych" world entry; the named markets are
// everything before it. We surface the count from the named markets so the
// heading and the list never drift apart.
const NAMED_COUNTRIES = COUNTRIES.filter((c) => c.iso2 !== "");
const MARKET_COUNT = NAMED_COUNTRIES.length;

export default function TrustedBy() {
  const mapRef = useRef<HTMLDivElement>(null);

  // Flag pins "hammer in" — drop from above with a bounce, staggered, once the
  // map scrolls into view. Reduced-motion shows them in place. The pins live on
  // an inner [data-map-pin] element so GSAP owns its transform without fighting
  // the CSS centering transform on the positioning wrapper.
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const pins =
        mapRef.current?.querySelectorAll<HTMLElement>("[data-map-pin]");
      if (!pins || pins.length === 0) return;

      if (reduce) {
        gsap.set(pins, { opacity: 1, yPercent: 0 });
        return;
      }

      gsap.set(pins, { opacity: 0, yPercent: -200 });

      gsap.to(pins, {
        opacity: 1,
        yPercent: 0,
        duration: 0.7,
        ease: "back.out(1.6)",
        stagger: 0.12,
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: mapRef },
  );

  return (
    <Section id="zaufali" className="bg-zinc-600">
      <div data-map-group className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* LEFT — distribution map */}
        <ScrollReveal y={28}>
          <figure className="group relative">
            {/* ambient red glow behind the frame */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(60%_55%_at_50%_45%,rgba(207,46,46,0.16),transparent_70%)] blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface/40 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-[2px]">
              {/* top sheen hairline for depth */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <div ref={mapRef} className="relative overflow-hidden rounded-xl">
                <Image
                  src="/images/mapa-dystrybucji.png"
                  alt="Mapa dystrybucji ciepłych ramek FIBERTHERM — Europa, Ameryka Północna i Azja"
                  width={2494}
                  height={1627}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-auto w-full"
                  priority={false}
                />
                {/* subtle vignette to seat the image into the dark surface */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.06]"
                />

                {/* Halo overlays — pulsujące halo nad statycznymi pinezkami
                    wpalonymi w PNG. Pozycje wykryte z mapa-dystrybucji.png
                    (środki kropek), nie z geografii. Każde halo startuje z
                    lekkim opóźnieniem → efekt fali. */}
                {[
                  { iso2: "CA", flag: "🇨🇦", x: 18, y: 15 },
                  { iso2: "KR", flag: "🇰🇷", x: 38, y: 19 },
                  { iso2: "PL", flag: "🇵🇱", x: 67, y: 56 },
                  { iso2: "DE", flag: "🇩🇪", x: 62, y: 59 },
                  { iso2: "UA", flag: "🇺🇦", x: 75, y: 63 },
                  { iso2: "RO", flag: "🇷🇴", x: 73, y: 70 },
                  { iso2: "IT", flag: "🇮🇹", x: 61, y: 73 },
                  { iso2: "BG", flag: "🇧🇬", x: 73, y: 75 },
                  { iso2: "XK", flag: "🇽🇰", x: 69, y: 76 },
                  { iso2: "PT", flag: "🇵🇹", x: 44, y: 81 },
                ].map((pin, i) => (
                  <div
                    key={pin.iso2}
                    data-country={pin.iso2}
                    aria-label={`${pin.iso2} — dystrybucja FIBERTHERM`}
                    className="group/pin pointer-events-auto absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-default"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  >
                    <span
                      className="absolute inset-0 rounded-full bg-tp-red/30 animate-ping"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: "2.4s",
                      }}
                    />
                    {/* Flag — drops from above on hover. Hidden at rest, slides in
                        with a soft bounce so it reads as a "flag landing on the pin". */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl leading-none opacity-0 -translate-y-[150%] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/pin:opacity-100 group-hover/pin:translate-y-[-50%] group-focus-visible/pin:opacity-100 group-focus-visible/pin:translate-y-[-50%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                      style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
                    >
                      {pin.flag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </figure>
        </ScrollReveal>

        {/* RIGHT — reach copy + country grid */}
        <div>
          <ScrollReveal y={24}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-8 bg-gradient-to-r from-tp-red to-transparent"
              />
              <span className="text-eyebrow font-medium uppercase text-tp-red">
                Dystrybucja
              </span>
            </div>

            <TextReveal
              as="h2"
              className="mt-6 text-balance font-jost text-display-sm font-bold leading-[1.05] text-ink"
            >
              {`${MARKET_COUNT} krajów.`}
            </TextReveal>
            <TextReveal
              as="h2"
              delay={0.3}
              className="text-balance font-jost text-display-sm font-bold leading-[1.05] text-tp-red"
            >
              3 kontynenty.
            </TextReveal>

            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-ink-2">
              {INTRO}
            </p>
          </ScrollReveal>

          <ScrollReveal
            stagger
            y={16}
            delay={0.05}
            className="mt-10 grid grid-cols-1 gap-x-10 gap-y-0 sm:grid-cols-2"
          >
            {COUNTRIES.filter((c) => c.iso2 !== "").map((country) => (
              <div
                key={country.iso2}
                data-country={country.iso2}
                className="country-row flex items-center gap-3 border-b border-hairline/70 py-3 transition-colors duration-200"
              >
                <span
                  aria-hidden
                  className="country-dot h-1.5 w-1.5 shrink-0 rounded-full bg-tp-red shadow-[0_0_10px_rgba(207,46,46,0.6)] transition-all duration-200"
                />
                <span className="country-name text-sm text-ink transition-colors duration-200">
                  {country.name}
                </span>
              </div>
            ))}
          </ScrollReveal>

          {/* one quiet stat line */}
          <ScrollReveal y={16} delay={0.12}>
            <p className="mt-8 text-sm text-ink-2">
              <span className="font-jost text-base font-semibold text-ink">
                Setki ton profili
              </span>{" "}
              opuszczają Lubartów każdego roku — w nieprzerwanej, powtarzalnej
              jakości.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
