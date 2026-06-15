import { SITE, NAV_LINKS } from "@/lib/constants";

/**
 * Site footer: wordmark, contact, nav + socials, legal line.
 * Dark, hairline top border, atmospheric.
 */
export function Footer() {
  const year = 2026;

  return (
    <footer className="relative z-10 border-t border-hairline bg-bg/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-container px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + address */}
          <div>
            <p className="font-jost text-xl font-bold tracking-tight">
              Termo<span className="text-tp-red">Profi</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">
              Ciepłe ramki dystansowe do szyb zespolonych. Technologia
              FIBERTHERM produkowana przez {SITE.company}.
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic text-ink-2">
              <p>{SITE.street}</p>
              <p>{SITE.city}</p>
              <p>
                <a
                  href={SITE.phoneHref}
                  className="transition-colors hover:text-ink"
                >
                  {SITE.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors hover:text-ink"
                >
                  {SITE.email}
                </a>
              </p>
            </address>
          </div>

          {/* Nav */}
          <nav aria-label="Stopka — nawigacja">
            <h2 className="text-eyebrow font-medium uppercase text-ink-2">
              Nawigacja
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <nav aria-label="Stopka — media społecznościowe">
            <h2 className="text-eyebrow font-medium uppercase text-ink-2">
              Obserwuj
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE.socials.map((social) => (
                <li key={social.label}>
                  {social.disabled ? (
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed text-sm text-ink-2 opacity-50"
                    >
                      {social.label}
                    </span>
                  ) : (
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {social.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal line */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 text-sm text-ink-2 sm:flex-row sm:items-center">
          <p>
            © {year} {SITE.company} ({SITE.brand}). Wszelkie prawa zastrzeżone.
          </p>
          <a href="#" className="transition-colors hover:text-ink">
            Polityka prywatności
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
