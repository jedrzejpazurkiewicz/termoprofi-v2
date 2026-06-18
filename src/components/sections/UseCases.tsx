"use client";

import { useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";

/* -------------------------------------------------------------------------- */
/*  Dane lokalne                                                               */
/* -------------------------------------------------------------------------- */

type Category =
  | "Mieszkania"
  | "Domy"
  | "Biurowce"
  | "Komercyjne"
  | "Publiczne";

interface Project {
  name: string;
  location: string;
  category: Category;
  /** Typ realizacji — krótki tag wyświetlany na kafelku. */
  type: string;
  /** Para kolorów tworząca atmosferyczny gradient tła kafelka. */
  tint: [string, string];
}

const PROJECTS: Project[] = [
  {
    name: "Apartamentowiec nad Narwią",
    location: "Ostrołęka",
    category: "Mieszkania",
    type: "Budownictwo wielorodzinne",
    tint: ["rgba(207,46,46,0.16)", "rgba(79,168,255,0.10)"],
  },
  {
    name: "Biurowiec z restauracją",
    location: "Warszawa, Wola",
    category: "Komercyjne",
    type: "Usługi i gastronomia",
    tint: ["rgba(255,142,60,0.14)", "rgba(207,46,46,0.10)"],
  },
  {
    name: "Dom jednorodzinny",
    location: "Lubartów",
    category: "Domy",
    type: "Inwestycja prywatna",
    tint: ["rgba(79,168,255,0.14)", "rgba(255,255,255,0.05)"],
  },
  {
    name: "Siedziba korporacji",
    location: "Kraków, Zabłocie",
    category: "Biurowce",
    type: "Klasa A, fasada słupowo-ryglowa",
    tint: ["rgba(207,46,46,0.14)", "rgba(20,26,34,0.60)"],
  },
  {
    name: "Przeszklony biurowiec",
    location: "Wrocław",
    category: "Biurowce",
    type: "Pełne przeszklenie",
    tint: ["rgba(79,168,255,0.18)", "rgba(207,46,46,0.08)"],
  },
  {
    name: "Dworzec PKS",
    location: "Nowa Sól",
    category: "Publiczne",
    type: "Obiekt użyteczności publicznej",
    tint: ["rgba(255,142,60,0.12)", "rgba(79,168,255,0.12)"],
  },
];

const FILTERS = [
  "Wszystkie",
  "Mieszkania",
  "Domy",
  "Biurowce",
  "Komercyjne",
  "Publiczne",
] as const;

type Filter = (typeof FILTERS)[number];

/* -------------------------------------------------------------------------- */
/*  Kafelek                                                                    */
/* -------------------------------------------------------------------------- */

function ProjectTile({ project }: { project: Project }) {
  const [from, to] = project.tint;

  return (
    <article className="group relative h-full">
      <div className="relative h-full overflow-hidden rounded-2xl border border-hairline surface-card shadow-ambient transition-all duration-500 ease-calm group-hover:-translate-y-1.5 group-hover:border-tp-red/30 group-hover:shadow-[0_40px_90px_-50px_rgba(207,46,46,0.5)]">
        {/* Tonowane „okno" — placeholder zamiast zrzutu ekranu */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(120% 90% at 25% 10%, ${from}, transparent 60%), radial-gradient(120% 120% at 90% 100%, ${to}, transparent 55%)`,
          }}
        >
          {/* siatka szyb — delikatne hairline'y sugerujące przeszklenie */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 transition-opacity duration-500 ease-calm group-hover:opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          {/* górny połysk + winieta dla głębi */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/40"
          />
          {/* tag typu realizacji */}
          <span className="absolute left-4 top-4 inline-flex items-center rounded-pill border border-hairline bg-black/35 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink-2 backdrop-blur-sm">
            {project.type}
          </span>
        </div>

        {/* Stopka tekstowa */}
        <div className="relative p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-hairline-top"
          />
          <h3 className="font-jost text-xl leading-tight text-ink">
            {project.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-2">
            <span aria-hidden className="text-tp-red">
              &#9679;
            </span>
            <span>{project.location}</span>
          </div>

          {/* cienka czerwona kreska podkreślająca na hover */}
          <span
            aria-hidden
            className="mt-4 block h-px w-10 origin-left bg-tp-red/70 transition-all duration-500 ease-calm group-hover:w-20"
          />
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sekcja                                                                     */
/* -------------------------------------------------------------------------- */

export function UseCases() {
  const [active, setActive] = useState<Filter>("Wszystkie");

  const visible = useMemo(
    () =>
      active === "Wszystkie"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === active),
    [active],
  );

  return (
    <Section id="zastosowania" eyebrow="Realizacje" variant="surface">
      <ScrollReveal>
        <div className="max-w-2xl">
          <h2 className="text-balance font-jost text-display-sm text-ink">
            Tam, gdzie już pracuje
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-2">
            Od mieszkań po dworce — FIBERTHERM trzyma ciepło tam, gdzie szkło
            spotyka ramę. Wybrane obiekty, w których ciepła ramka robi różnicę
            każdego dnia.
          </p>
        </div>
      </ScrollReveal>

      {/* Filtry */}
      <div
        role="group"
        aria-label="Filtruj realizacje według typu"
        className="mt-10 flex flex-wrap gap-2.5"
      >
        {FILTERS.map((filter) => {
          const isActive = filter === active;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              aria-pressed={isActive}
              className={[
                "rounded-pill border px-4 py-2 text-sm font-medium transition-all duration-300 ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tp-red/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "border-tp-red/50 bg-tp-red/15 text-ink shadow-[0_0_0_1px_rgba(207,46,46,0.25)]"
                  : "border-hairline text-ink-2 hover:border-tp-red/30 hover:text-ink",
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Siatka kafelków — klucz wymusza ponowny stagger po zmianie filtra */}
      <ScrollReveal
        key={active}
        stagger
        y={28}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((project) => (
          <ProjectTile key={project.name} project={project} />
        ))}
      </ScrollReveal>
    </Section>
  );
}

export default UseCases;
