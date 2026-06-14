"use client";

import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { SITE } from "@/lib/constants";

/**
 * Contact — placeholder shell. The contact section pairs the company's real
 * coordinates (from constants) with a form skeleton. The form is intentionally
 * inert for now — validation (zod + react-hook-form) and delivery (resend) are
 * wired in a later pass — but it is fully semantic and accessible so it reads as
 * finished, not broken.
 */

const FIELDS = [
  { id: "name", label: "Imię i nazwisko", type: "text", autoComplete: "name" },
  { id: "email", label: "Adres e-mail", type: "email", autoComplete: "email" },
  { id: "company", label: "Firma", type: "text", autoComplete: "organization" },
] as const;

export default function Contact() {
  return (
    <Section id="kontakt" eyebrow="Kontakt" variant="dark">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Coordinates — final content. */}
        <ScrollReveal>
          <div>
            <h2 className="text-balance font-jost text-display-sm font-bold text-ink">
              Porozmawiajmy o ciepłej krawędzi.
            </h2>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-ink-2">
              Dobierzemy rozwiązanie do Twojej produkcji i przygotujemy ofertę.
            </p>

            <dl className="mt-10 flex flex-col gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow uppercase text-ink-2">Adres</dt>
                <dd className="text-ink">
                  {SITE.company}
                  <br />
                  {SITE.address}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow uppercase text-ink-2">Telefon</dt>
                <dd>
                  <a
                    href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                    className="text-ink transition-colors hover:text-tp-red"
                  >
                    {SITE.phone}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow uppercase text-ink-2">E-mail</dt>
                <dd>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-ink transition-colors hover:text-tp-red"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </ScrollReveal>

        {/* Form skeleton — inert for now. */}
        <ScrollReveal delay={0.08}>
          <form
            className="flex flex-col gap-5 rounded-2xl border border-hairline bg-surface/50 p-6 backdrop-blur-sm sm:p-8"
            aria-label="Formularz kontaktowy"
            onSubmit={(e) => e.preventDefault()}
          >
            {FIELDS.map((field) => (
              <label key={field.id} className="flex flex-col gap-2 text-sm">
                <span className="text-ink-2">{field.label}</span>
                <input
                  type={field.type}
                  name={field.id}
                  autoComplete={field.autoComplete}
                  className="rounded-xl border border-hairline bg-bg/50 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-2/50 focus:border-tp-red/60"
                />
              </label>
            ))}

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-ink-2">Wiadomość</span>
              <textarea
                name="message"
                rows={4}
                className="resize-none rounded-xl border border-hairline bg-bg/50 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-2/50 focus:border-tp-red/60"
              />
            </label>

            <div className="mt-2">
              <Button type="submit">Wyślij zapytanie</Button>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </Section>
  );
}
