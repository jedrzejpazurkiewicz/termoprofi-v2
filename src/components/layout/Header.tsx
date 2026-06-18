"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

/**
 * Sticky glassmorphism top bar.
 * Wordmark (Jost) left, anchor nav right, "Do pobrania" pill.
 * On <768px the desktop nav collapses to a hamburger that toggles a
 * full-height, glass slide-in drawer holding all NAV_LINKS + "Do pobrania".
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape; focus the first link on open, restore focus on close.
  useEffect(() => {
    if (open) {
      firstLinkRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
    // Returning focus only after an actual open avoids stealing focus on mount.
    toggleRef.current?.focus();
  }, [open]);

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
            className="group flex items-baseline gap-px rounded-pill font-jost text-lg font-bold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-tp-red/60"
            aria-label="TermoProfi — strona główna"
          >
            <span>Termo</span>
            <span className="text-tp-red transition-colors group-hover:text-thermal-warm-hot">
              Profi
            </span>
          </Link>

          {/* Nav (desktop) */}
          <nav
            aria-label="Główna nawigacja"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative rounded-pill px-3.5 py-2 text-sm text-ink-2 outline-none transition-colors duration-300 hover:text-ink focus-visible:ring-2 focus-visible:ring-tp-red/60"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* "Do pobrania" pill (desktop only — also lives inside the drawer) */}
            <a
              href="#do-pobrania"
              className="hidden items-center gap-1.5 rounded-pill border border-hairline bg-white/[0.03] px-3.5 py-1.5 text-sm font-medium text-ink outline-none transition-all duration-300 ease-calm hover:border-tp-red/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-tp-red/60 md:inline-flex"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-tp-red shadow-[0_0_8px_2px_rgba(207,46,46,0.6)]"
              />
              Do pobrania
            </a>

            {/* Hamburger (mobile only) */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-white/[0.03] text-ink outline-none transition-all duration-300 ease-calm hover:border-tp-red/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-tp-red/60 md:hidden"
            >
              <span className="sr-only">{open ? "Zamknij menu" : "Otwórz menu"}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                className="h-5 w-5"
              >
                {open ? (
                  <>
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden" aria-hidden={!open}>
        {/* Backdrop */}
        <div
          onClick={close}
          className={[
            "pointer-events-none fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm transition-opacity duration-500 ease-calm motion-reduce:transition-none",
            open ? "pointer-events-auto opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Panel */}
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu nawigacji"
          className={[
            "glass pointer-events-auto fixed inset-y-0 right-0 z-50 flex w-[min(20rem,82vw)] flex-col border-l border-hairline px-6 pb-8 pt-6 shadow-ambient transition-transform duration-500 ease-calm will-change-transform motion-reduce:transition-none",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-jost text-sm font-semibold uppercase tracking-[0.18em] text-ink-2">
              Menu
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Zamknij menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-hairline bg-white/[0.03] text-ink outline-none transition-all duration-300 ease-calm hover:border-tp-red/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-tp-red/60"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <nav aria-label="Nawigacja mobilna" className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={close}
                className="rounded-pill px-3 py-3 text-lg text-ink-2 outline-none transition-colors duration-300 hover:text-ink focus-visible:ring-2 focus-visible:ring-tp-red/60"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#do-pobrania"
            onClick={close}
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-pill border border-hairline bg-white/[0.03] px-4 py-3 text-sm font-medium text-ink outline-none transition-all duration-300 ease-calm hover:border-tp-red/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-tp-red/60"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-tp-red shadow-[0_0_8px_2px_rgba(207,46,46,0.6)]"
            />
            Do pobrania
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
