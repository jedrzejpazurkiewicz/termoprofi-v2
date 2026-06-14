"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Sticky glassmorphism top bar.
 * Wordmark (Jost) left, anchor nav right, "Do pobrania" pill.
 * Collapses to a compact menu on small screens (TIER 3 hamburger skipped).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div
          className={[
            "pointer-events-auto mt-3 flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ease-calm sm:px-5",
            scrolled
              ? "glass border border-hairline shadow-ambient"
              : "border border-transparent",
          ].join(" ")}
        >
          {/* Wordmark */}
          <Link
            href="#top"
            className="group flex items-baseline gap-px font-jost text-lg font-bold tracking-tight text-ink"
            aria-label="TermoProfi — strona główna"
          >
            <span>Termo</span>
            <span className="text-tp-red transition-colors group-hover:text-thermal-warm-hot">
              Profi
            </span>
          </Link>

          {/* Nav */}
          <nav
            aria-label="Główna nawigacja"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative rounded-pill px-3.5 py-2 text-sm text-ink-2 transition-colors duration-300 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Compact nav for small screens */}
            <nav
              aria-label="Nawigacja mobilna"
              className="flex items-center gap-1 md:hidden"
            >
              <a
                href="#produkty"
                className="rounded-pill px-2.5 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                Produkty
              </a>
              <a
                href="#kontakt"
                className="rounded-pill px-2.5 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                Kontakt
              </a>
            </nav>

            <a
              href="#do-pobrania"
              className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-white/[0.03] px-3.5 py-1.5 text-sm font-medium text-ink transition-all duration-300 ease-calm hover:border-tp-red/40 hover:bg-white/[0.06]"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-tp-red shadow-[0_0_8px_2px_rgba(207,46,46,0.6)]"
              />
              Do pobrania
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
