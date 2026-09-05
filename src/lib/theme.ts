export type ThemeMode = "light" | "dark";
export type AccentKey = "orange" | "cyan" | "violet" | "green" | "pink" | "blue";

export const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: "orange", label: "Orange", swatch: "oklch(0.72 0.19 55)" },
  { key: "cyan", label: "Cyan", swatch: "oklch(0.75 0.14 195)" },
  { key: "violet", label: "Violet", swatch: "oklch(0.65 0.2 300)" },
  { key: "green", label: "Green", swatch: "oklch(0.72 0.17 155)" },
  { key: "pink", label: "Pink", swatch: "oklch(0.68 0.22 350)" },
  { key: "blue", label: "Blue", swatch: "oklch(0.65 0.18 255)" },
];

const MODE_KEY = "cinaauth-theme";
const ACCENT_KEY = "cinaauth-accent";

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function applyAccent(accent: AccentKey) {
  document.documentElement.setAttribute("data-accent", accent);
  try {
    localStorage.setItem(ACCENT_KEY, accent);
  } catch {
    /* ignore */
  }
}

export function readThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function readAccent(): AccentKey {
  try {
    const stored = localStorage.getItem(ACCENT_KEY) as AccentKey | null;
    if (stored && ACCENTS.some((a) => a.key === stored)) return stored;
  } catch {
    /* ignore */
  }
  return "orange";
}

/** Applies the stored preferences to <html>. Safe to call on mount only. */
export function initTheme() {
  applyThemeMode(readThemeMode());
  applyAccent(readAccent());
  if (readAutoSeason()) applySeasonalAccent();
}

/* ---------- Seasonal auto theme + ambient effects ---------- */

const AUTO_KEY = "cinaauth-accent-auto";
const EFFECTS_KEY = "cinaauth-effects";
export const EFFECTS_EVENT = "cinaauth:effects-changed";

export function readAutoSeason(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAutoSeason(on: boolean) {
  try {
    localStorage.setItem(AUTO_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (on) applySeasonalAccent();
}

export function readEffectsEnabled(): boolean {
  try {
    const v = localStorage.getItem(EFFECTS_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export function setEffectsEnabled(on: boolean) {
  try {
    localStorage.setItem(EFFECTS_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EFFECTS_EVENT));
}

export function applySeasonalAccent() {
  // Imported lazily to avoid a circular import at module load.
  import("@/lib/seasons").then(({ getSeasonInfo }) => {
    const info = getSeasonInfo();
    document.documentElement.setAttribute("data-season", info.key);
    applyAccent(info.accent);
  });
}
