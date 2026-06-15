"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import FormInput, { FormTextarea } from "@/components/ui/FormInput";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { SITE, CONTACT_COPY } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/*  Walidacja formularza — lustro schematu z route.ts                          */
/* -------------------------------------------------------------------------- */

const PURPOSE_OPTIONS = [
  { value: "catalog", label: "Katalog i próbki" },
  { value: "meeting", label: "Spotkanie / konsultacja" },
  { value: "general", label: "Zapytanie ogólne" },
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię (min. 2 znaki)."),
  email: z.string().trim().email("Podaj poprawny adres e-mail."),
  phone: z.string().trim().min(9, "Podaj poprawny numer telefonu."),
  company: z.string().trim().optional().or(z.literal("")),
  purpose: z.enum(["catalog", "meeting", "general"]),
  message: z.string().trim().min(10, "Napisz nieco więcej (min. 10 znaków)."),
  /** Honeypot — niewidoczny dla ludzi, wypełniany przez boty. */
  website: z.string().max(0).optional().or(z.literal("")),
});

type ContactValues = z.infer<typeof contactSchema>;

type Status = "idle" | "loading" | "success" | "error";

/* -------------------------------------------------------------------------- */
/*  Drobne elementy UI                                                         */
/* -------------------------------------------------------------------------- */

const selectLabel = "mb-2 block font-inter text-sm font-medium text-ink-2";
const selectField =
  "w-full appearance-none rounded-xl border border-hairline bg-white/[0.02] px-4 py-3.5 pr-11 font-inter text-[0.95rem] text-ink transition-colors duration-300 ease-calm focus:border-tp-red/60 focus:bg-white/[0.04] focus:outline-none disabled:opacity-50";

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-hairline pt-5">
      <p className="text-eyebrow uppercase text-ink-2">{label}</p>
      <div className="mt-2 font-inter text-ink">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sekcja                                                                      */
/* -------------------------------------------------------------------------- */

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      purpose: "catalog",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (values: ContactValues) => {
    setStatus("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.success) {
        setStatus("success");
        reset();
        return;
      }

      setServerError(data.error ?? CONTACT_COPY.error);
      setStatus("error");
    } catch {
      setServerError(CONTACT_COPY.error);
      setStatus("error");
    }
  };

  // Po udanym wysłaniu przenosimy fokus na komunikat sukcesu,
  // aby czytniki ekranu i klawiatura trafiły prosto do potwierdzenia.
  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  const isLoading = status === "loading";

  return (
    <Section
      id="kontakt"
      variant="dark"
      eyebrow={CONTACT_COPY.eyebrow}
      className="overflow-hidden"
    >
      {/* Atmosferyczny akcent tła */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-tp-red/10 blur-[150px]"
      />

      <div className="relative grid gap-x-16 gap-y-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ----------------------------- LEWA: dane ---------------------------- */}
        <ScrollReveal className="flex flex-col">
          <h2 className="max-w-md text-balance font-jost text-display-sm font-medium leading-[1.05] tracking-tight text-ink">
            {CONTACT_COPY.title}
          </h2>
          <p className="mt-6 max-w-md text-pretty font-inter text-lg leading-relaxed text-ink-2">
            {CONTACT_COPY.subtitle}
          </p>

          <div className="mt-12 flex flex-col gap-6">
            <InfoRow label="Adres">
              <p className="leading-relaxed">
                {SITE.company}
                <br />
                {SITE.street}
                <br />
                {SITE.city}
              </p>
            </InfoRow>

            <InfoRow label="Telefon">
              <a
                href={SITE.phoneHref}
                className="transition-colors duration-300 ease-calm hover:text-tp-red"
              >
                {SITE.phone}
              </a>
            </InfoRow>

            <InfoRow label="E-mail">
              <a
                href={`mailto:${SITE.email}`}
                className="transition-colors duration-300 ease-calm hover:text-tp-red"
              >
                {SITE.email}
              </a>
            </InfoRow>

            <InfoRow label="Social media">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
                {SITE.socials.map((social) =>
                  social.disabled ? (
                    <span
                      key={social.label}
                      aria-disabled="true"
                      className="cursor-not-allowed opacity-50"
                    >
                      {social.label}
                    </span>
                  ) : (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 ease-calm hover:text-ink"
                    >
                      {social.label}
                    </a>
                  ),
                )}
              </div>
            </InfoRow>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-hairline">
            <iframe
              title="Lokalizacja PPH OKSAN — Lubartów"
              src="https://www.google.com/maps?q=Strefowa%2030%2C%2021-100%20Lubart%C3%B3w&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full grayscale-[0.35] [color-scheme:light]"
            />
          </div>
        </ScrollReveal>

        {/* ----------------------------- PRAWA: formularz ---------------------- */}
        <ScrollReveal
          delay={0.08}
          className="relative rounded-3xl border border-hairline bg-gradient-to-b from-white/[0.045] to-white/[0.01] p-7 shadow-ambient sm:p-9"
        >
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* Honeypot — ukryty przed użytkownikami i czytnikami ekranu */}
            <div className="absolute left-[-9999px] top-0" aria-hidden>
              <label htmlFor="website">Nie wypełniaj tego pola</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput
                id="name"
                label="Imię i nazwisko"
                placeholder="Jan Kowalski"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <FormInput
                id="company"
                label="Firma (opcjonalnie)"
                placeholder="Nazwa firmy"
                autoComplete="organization"
                error={errors.company?.message}
                {...register("company")}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormInput
                id="email"
                label="E-mail"
                type="email"
                inputMode="email"
                placeholder="jan@firma.pl"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormInput
                id="phone"
                label="Telefon"
                type="tel"
                inputMode="tel"
                placeholder="+48 600 000 000"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <div className="mt-5">
              <label htmlFor="purpose" className={selectLabel}>
                Cel kontaktu
              </label>
              <div className="relative">
                <select
                  id="purpose"
                  className={selectField}
                  {...register("purpose")}
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-bg">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <FormTextarea
              id="message"
              label="Wiadomość"
              placeholder="Napisz, czego potrzebujesz — dobór ramki, próbki, wycena…"
              className="mt-5"
              rows={5}
              error={errors.message?.message}
              {...register("message")}
            />

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Wysyłanie…</span>
                  </>
                ) : (
                  "Wyślij"
                )}
              </Button>

              <p className="font-inter text-xs leading-relaxed text-ink-2/80 sm:max-w-[15rem] sm:text-right">
                Odpowiadamy zwykle w ciągu jednego dnia roboczego.
              </p>
            </div>

            <div aria-live="polite">
              {status === "success" ? (
                <p
                  ref={successRef}
                  tabIndex={-1}
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-inter text-sm text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {CONTACT_COPY.success}
                </p>
              ) : null}

              {status === "error" ? (
                <p
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-tp-red/40 bg-tp-red/10 px-4 py-3 font-inter text-sm text-tp-red"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {serverError ?? CONTACT_COPY.error}
                </p>
              ) : null}
            </div>
          </form>
        </ScrollReveal>
      </div>
    </Section>
  );
}

export default Contact;
