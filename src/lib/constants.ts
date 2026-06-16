/**
 * Centralna treść strony (PL) oraz dane firmowe TermoProfi / PPH OKSAN.
 * Wszystkie sekcje konsumują eksporty z tego pliku.
 */

/* -------------------------------------------------------------------------- */
/*  Firma / dane kontaktowe                                                    */
/* -------------------------------------------------------------------------- */

export interface SocialLink {
  label: string;
  href: string;
  /** When true, the link is a placeholder (no real account yet) and should render non-interactive. */
  disabled?: boolean;
}

export interface SiteInfo {
  company: string;
  brand: string;
  street: string;
  city: string;
  /** Single-line address (street + city) for compact display. */
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  socials: SocialLink[];
}

export const SITE: SiteInfo = {
  company: "PPH OKSAN",
  brand: "TermoProfi",
  street: "Ul. Strefowa 30",
  city: "21-100 Lubartów",
  address: "Ul. Strefowa 30, 21-100 Lubartów",
  phone: "+48 81 854 6226",
  phoneHref: "tel:+48818546226",
  email: "info@termoprofi.com",
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/", disabled: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/", disabled: true },
    { label: "Instagram", href: "https://www.instagram.com/", disabled: true },
    { label: "YouTube", href: "https://www.youtube.com/", disabled: true },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Nawigacja                                                                  */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Produkty", href: "#produkty" },
  // "Zastosowania" / Realizacje — przeniesione na osobną zakładkę; przywrócić jako route, gdy powstanie.
  { label: "Zaufali nam", href: "#zaufali-nam" },
  { label: "O nas", href: "#o-nas" },
  { label: "Kontakt", href: "#kontakt" },
];

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export interface Hero {
  title: string;
  subtitle: string;
  cta: string;
  ctaSecondary: string;
}

export const HERO: Hero = {
  title: "Nie widzisz jej. Czujesz codziennie",
  subtitle:
    "Mały element w Twoim oknie, który ma wielki wpływ. Zmniejsza straty ciepła o 22%.",
  cta: "Poznaj FIBERTHERM",
  ctaSecondary: "Umów rozmowę",
};

/* -------------------------------------------------------------------------- */
/*  Statystyki (CountUp)                                                       */
/* -------------------------------------------------------------------------- */

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: 22, suffix: "%", label: "mniej strat energii" },
  { value: 70, suffix: "%", label: "mniej kondensacji" },
  { value: 30, suffix: " lat", label: "żywotności (EN 1279)" },
];

/* -------------------------------------------------------------------------- */
/*  Przewodność cieplna materiałów (W/mK) — porównanie                         */
/* -------------------------------------------------------------------------- */

export interface Material {
  name: string;
  /** Przewodność cieplna λ w W/(m·K) — im niżej, tym lepiej. */
  v: number;
}

export const MATERIALS: Material[] = [
  { name: "Aluminium", v: 160 },
  { name: "Stal", v: 50 },
  { name: "FIBERTHERM", v: 0.3 },
];

/* -------------------------------------------------------------------------- */
/*  Rynki / kraje obecności                                                    */
/* -------------------------------------------------------------------------- */

export interface Country {
  name: string;
  flag: string;
  iso2: string;
  /** Pozycja na mapie w procentach (0-100, od lewej do prawej / od góry do dołu). */
  mapPos?: { x: number; y: number };
}

export const COUNTRIES: Country[] = [
  { name: "Polska", flag: "🇵🇱", iso2: "PL", mapPos: { x: 51, y: 38 } },
  { name: "Włochy", flag: "🇮🇹", iso2: "IT", mapPos: { x: 48, y: 47 } },
  { name: "Ukraina", flag: "🇺🇦", iso2: "UA", mapPos: { x: 55, y: 36 } },
  { name: "Bułgaria", flag: "🇧🇬", iso2: "BG", mapPos: { x: 54, y: 46 } },
  { name: "Portugalia", flag: "🇵🇹", iso2: "PT", mapPos: { x: 36, y: 47 } },
  { name: "Kanada", flag: "🇨🇦", iso2: "CA", mapPos: { x: 12, y: 22 } },
  { name: "Korea Południowa", flag: "🇰🇷", iso2: "KR", mapPos: { x: 78, y: 38 } },
  { name: "Rumunia", flag: "🇷🇴", iso2: "RO", mapPos: { x: 54, y: 42 } },
  { name: "Kosowo", flag: "🇽🇰", iso2: "XK", mapPos: { x: 52, y: 46 } },
  { name: "Niemcy", flag: "🇩🇪", iso2: "DE", mapPos: { x: 48, y: 36 } },
  { name: "i wiele innych", flag: "🌍", iso2: "" },
];

/* -------------------------------------------------------------------------- */
/*  Produkty                                                                   */
/* -------------------------------------------------------------------------- */

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "ramki-dystansowe",
    name: "Ramki dystansowe",
    tagline: "Serce ciepłej krawędzi",
    description:
      "Profil FIBERTHERM z kompozytu wzmacnianego włóknem szklanym oddziela szyby zespolone, niemal całkowicie eliminując mostek termiczny na krawędzi pakietu. Cieplej przy ramie, mniej kondensacji, wyższa klasa energetyczna okna.",
    features: [
      "Przewodność λ na poziomie 0,3 W/(m·K)",
      "Zgodność z normą EN 1279",
      "Dostępne w szerokim zakresie szerokości i kolorów",
    ],
  },
  {
    id: "szprosy",
    name: "Szprosy",
    tagline: "Detal, który definiuje styl",
    description:
      "Szprosy wewnątrzszybowe i konstrukcyjne, które dzielą taflę bez utraty szczelności i estetyki pakietu. Precyzyjne łączenia, równe podziały i powtarzalna jakość w każdej serii.",
    features: [
      "Bogata paleta profili i kolorów",
      "Idealne podziały dla okien stylowych i historyzujących",
      "Trwałe, odporne na warunki we wnętrzu pakietu",
    ],
  },
  {
    id: "akcesoria",
    name: "Akcesoria",
    tagline: "Wszystko, co spina pakiet",
    description:
      "Łączniki, narożniki, korki i komponenty montażowe dopracowane tak, by produkcja szyby zespolonej była szybka, czysta i powtarzalna. Kompletny system, który po prostu pasuje.",
    features: [
      "Łączniki proste i narożne dopasowane do profili",
      "Komponenty wspierające automatyzację produkcji",
      "Pełna kompatybilność z ramkami TermoProfi",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Cytat właściciela / O nas                                                  */
/* -------------------------------------------------------------------------- */

export interface OwnerQuote {
  quote: string;
  author: string;
  role: string;
}

export const OWNER: OwnerQuote = {
  quote:
    "Od początku naszej działalności w branży szkła zespolonego kierujemy się przekonaniem, że prawdziwa jakość rodzi się z doskonałego połączenia technologii i precyzji wykonania.",
  author: "Andrzej Tabała",
  role: "Właściciel, PPH OKSAN",
};

/* -------------------------------------------------------------------------- */
/*  Zastosowania                                                               */
/* -------------------------------------------------------------------------- */

export interface UseCase {
  title: string;
  description: string;
}

export const USE_CASES: UseCase[] = [
  {
    title: "Budownictwo mieszkaniowe",
    description:
      "Cieplejsze krawędzie okien w domach i mieszkaniach — wyższy komfort, niższe rachunki, mniej zaparowanych szyb przy ramie.",
  },
  {
    title: "Obiekty komercyjne",
    description:
      "Duże przeszklenia biurowców i witryn, w których każdy procent oszczędności energii przekłada się na realny wynik.",
  },
  {
    title: "Budownictwo pasywne",
    description:
      "Komponent dla najbardziej wymagających pakietów, gdzie minimalizacja mostka termicznego jest warunkiem koniecznym.",
  },
  {
    title: "Renowacje i obiekty zabytkowe",
    description:
      "Nowoczesna efektywność cieplna ukryta we wnętrzu pakietu, bez kompromisu dla oryginalnego charakteru stolarki.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Materiały do pobrania                                                      */
/* -------------------------------------------------------------------------- */

export interface Download {
  label: string;
  href: string;
}

export const DOWNLOADS: Download[] = [
  { label: "Karta techniczna FIBERTHERM (PDF)", href: "#" },
  { label: "Deklaracja właściwości użytkowych (PDF)", href: "#" },
  { label: "Katalog produktów (PDF)", href: "#" },
];

/* -------------------------------------------------------------------------- */
/*  Formularz kontaktowy — etykiety                                            */
/* -------------------------------------------------------------------------- */

export const CONTACT_COPY = {
  eyebrow: "Kontakt",
  title: "Porozmawiajmy o Twoim pakiecie",
  subtitle:
    "Doradzimy dobór ramki, przygotujemy próbki i wycenę. Odpowiadamy zwykle w ciągu jednego dnia roboczego.",
  success: "Dziękujemy — wiadomość została wysłana. Odezwiemy się wkrótce.",
  error: "Coś poszło nie tak. Spróbuj ponownie lub napisz na info@termoprofi.com.",
} as const;
