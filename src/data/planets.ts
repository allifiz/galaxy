export interface BodyColors {
  light: string;
  base: string;
  dark: string;
  glow: string; // rgba()
  accent: string; // solid UI accent
}

export interface Body {
  id: string;
  name: string;
  kind: "G-type star" | "Terrestrial" | "Gas giant" | "Ice giant";
  colors: BodyColors;
  diameterKm: number;
  au: number; // 0 for the Sun
  distLabel: string;
  periodDays: number; // 0 for the Sun
  periodLabel: string;
  dayLabel: string;
  moonsLabel: string;
  tempLabel: string;
  speedKms: number; // mean orbital velocity
  fact: string;
  ring?: "saturn" | "uranus";
  bands?: boolean;
  hasMoon?: boolean;
  theta0: number; // starting orbital angle (rad)
}

export const SUN: Body = {
  id: "sun",
  name: "Sun",
  kind: "G-type star",
  colors: {
    light: "#fff6d8",
    base: "#ffc24d",
    dark: "#ff8a3d",
    glow: "rgba(255,178,77,0.55)",
    accent: "#ffb547",
  },
  diameterKm: 1392700,
  au: 0,
  distLabel: "System center",
  periodDays: 0,
  periodLabel: "— (≈230 Myr around the Milky Way)",
  dayLabel: "≈27 Earth days (equator)",
  moonsLabel: "8 planets in tow",
  tempLabel: "5,505 °C surface",
  speedKms: 0,
  fact: "The Sun holds 99.86% of all the mass in the Solar System — everything else, from Mercury to Neptune, is a rounding error.",
  theta0: 0,
};

export const PLANETS: Body[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "Terrestrial",
    colors: {
      light: "#d9c9b8",
      base: "#9c8e84",
      dark: "#5c524b",
      glow: "rgba(196,180,164,0.5)",
      accent: "#c4b4a4",
    },
    diameterKm: 4879,
    au: 0.39,
    distLabel: "57.9M km · 0.39 AU",
    periodDays: 87.97,
    periodLabel: "88 Earth days",
    dayLabel: "59 Earth days",
    moonsLabel: "0",
    tempLabel: "167 °C mean",
    speedKms: 47.4,
    fact: "Mercury races around the Sun in just 88 days — yet one full day–night cycle there lasts 176 Earth days, two of its years.",
    theta0: 0.9,
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Terrestrial",
    colors: {
      light: "#f7e3ae",
      base: "#e3b96a",
      dark: "#9c6f33",
      glow: "rgba(232,196,122,0.5)",
      accent: "#ecc878",
    },
    diameterKm: 12104,
    au: 0.72,
    distLabel: "108.2M km · 0.72 AU",
    periodDays: 224.7,
    periodLabel: "225 Earth days",
    dayLabel: "243 Earth days, retrograde",
    moonsLabel: "0",
    tempLabel: "464 °C — hottest planet",
    speedKms: 35.0,
    fact: "Venus spins backwards, so its Sun rises in the west — and its day is longer than its entire year.",
    theta0: 2.4,
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Terrestrial",
    colors: {
      light: "#a8dcff",
      base: "#3d84c6",
      dark: "#1b3f78",
      glow: "rgba(93,169,230,0.55)",
      accent: "#5da9e6",
    },
    diameterKm: 12756,
    au: 1.0,
    distLabel: "149.6M km · 1.00 AU",
    periodDays: 365.25,
    periodLabel: "365.25 days",
    dayLabel: "24 hours",
    moonsLabel: "1 — the Moon",
    tempLabel: "15 °C mean",
    speedKms: 29.8,
    fact: "Earth is the only world known to hold liquid-water oceans on its surface — and the only one known to hold anyone looking back.",
    hasMoon: true,
    theta0: 4.4,
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Terrestrial",
    colors: {
      light: "#ffb08f",
      base: "#d95f40",
      dark: "#8a2f1c",
      glow: "rgba(226,110,80,0.5)",
      accent: "#e26e50",
    },
    diameterKm: 6792,
    au: 1.52,
    distLabel: "227.9M km · 1.52 AU",
    periodDays: 686.98,
    periodLabel: "687 Earth days",
    dayLabel: "24.6 hours",
    moonsLabel: "2 — Phobos & Deimos",
    tempLabel: "−63 °C mean",
    speedKms: 24.1,
    fact: "Mars hosts Olympus Mons, a volcano nearly three times the height of Everest — the tallest known mountain in the Solar System.",
    theta0: 5.6,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    colors: {
      light: "#f3d3a0",
      base: "#cf9257",
      dark: "#7e4f2b",
      glow: "rgba(219,161,101,0.5)",
      accent: "#db9f63",
    },
    diameterKm: 142984,
    au: 5.2,
    distLabel: "778.5M km · 5.20 AU",
    periodDays: 4332.59,
    periodLabel: "11.9 Earth years",
    dayLabel: "9.9 hours — fastest spin",
    moonsLabel: "95 confirmed",
    tempLabel: "−108 °C",
    speedKms: 13.1,
    fact: "Jupiter's Great Red Spot is a storm wider than Earth that has been raging for at least 190 years.",
    bands: true,
    theta0: 1.7,
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    colors: {
      light: "#f7e7bd",
      base: "#dfc084",
      dark: "#937441",
      glow: "rgba(226,199,138,0.5)",
      accent: "#e6c98a",
    },
    diameterKm: 120536,
    au: 9.58,
    distLabel: "1.43B km · 9.58 AU",
    periodDays: 10759.22,
    periodLabel: "29.4 Earth years",
    dayLabel: "10.7 hours",
    moonsLabel: "146 confirmed",
    tempLabel: "−139 °C",
    speedKms: 9.7,
    fact: "Saturn is less dense than water — given a big enough bathtub, it would float.",
    ring: "saturn",
    bands: true,
    theta0: 3.6,
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    colors: {
      light: "#d8f4f2",
      base: "#8fd4d4",
      dark: "#468a94",
      glow: "rgba(141,212,212,0.5)",
      accent: "#8fd4d4",
    },
    diameterKm: 51118,
    au: 19.2,
    distLabel: "2.87B km · 19.2 AU",
    periodDays: 30688.5,
    periodLabel: "84 Earth years",
    dayLabel: "17.2 hours, tilted 98°",
    moonsLabel: "28 confirmed",
    tempLabel: "−197 °C",
    speedKms: 6.8,
    fact: "Uranus rolls around the Sun on its side — each pole gets 42 years of daylight, then 42 years of night.",
    ring: "uranus",
    theta0: 5.1,
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    colors: {
      light: "#9db4ff",
      base: "#4666c4",
      dark: "#22346e",
      glow: "rgba(91,125,216,0.55)",
      accent: "#5b7dd8",
    },
    diameterKm: 49528,
    au: 30.05,
    distLabel: "4.50B km · 30.1 AU",
    periodDays: 60190,
    periodLabel: "164.8 Earth years",
    dayLabel: "16.1 hours",
    moonsLabel: "16 confirmed",
    tempLabel: "−201 °C",
    speedKms: 5.4,
    fact: "Neptune's winds top 2,000 km/h — the fastest in the Solar System — on a world discovered with mathematics before telescopes ever found it.",
    bands: true,
    theta0: 0.3,
  },
];

export const BODIES: Body[] = [SUN, ...PLANETS];

export const MAX_AU = 30.05;
export const EARTH_DIAMETER = 12756;
export const MAX_DIAMETER = 142984;

export function bodyById(id: string | null): Body | null {
  if (!id) return null;
  return BODIES.find((b) => b.id === id) ?? null;
}
