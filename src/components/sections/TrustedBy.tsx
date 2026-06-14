"use client";

import Image from "next/image";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { COUNTRIES } from "@/lib/constants";

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
  return (
    <Section id="zaufali" variant="dark">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
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
              <div className="relative overflow-hidden rounded-xl">
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

            <h2 className="mt-6 text-balance font-jost text-display-sm font-bold leading-[1.05] text-ink">
              {MARKET_COUNT} krajów.
              <br />
              <span className="text-ink-2">3 kontynenty.</span>
            </h2>

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
            {COUNTRIES.map((country) => {
              const muted = country.iso2 === "";
              return (
                <div
                  key={country.iso2 || country.name}
                  className="flex items-center gap-3 border-b border-hairline/70 py-3"
                >
                  <span
                    aria-hidden
                    className={
                      "h-1.5 w-1.5 shrink-0 rounded-full " +
                      (muted
                        ? "bg-ink-2/40"
                        : "bg-tp-red shadow-[0_0_10px_rgba(207,46,46,0.6)]")
                    }
                  />
                  <span
                    className={
                      "text-sm " +
                      (muted ? "italic text-ink-2/70" : "text-ink")
                    }
                  >
                    {country.name}
                  </span>
                </div>
              );
            })}
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
