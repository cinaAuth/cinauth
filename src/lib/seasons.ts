import type { AccentKey } from "@/lib/theme";

export type Season = "winter" | "spring" | "summer" | "autumn";

export type SeasonInfo = {
  key: Season;
  label: string;
  accent: AccentKey;
  /** Particle glyphs used by the ambient effect. */
  glyphs: string[];
  /** Base fall speed in seconds. */
  speed: number;
};

export const SEASONS: Record<Season, SeasonInfo> = {
  winter: { key: "winter", label: "Winter", accent: "cyan", glyphs: ["❄", "❅", "❆", "•"], speed: 14 },
  spring: { key: "spring", label: "Spring", accent: "pink", glyphs: ["🌸", "❀", "✿", "·"], speed: 12 },
  summer: { key: "summer", label: "Summer", accent: "orange", glyphs: ["✦", "✧", "•"], speed: 16 },
  autumn: { key: "autumn", label: "Autumn", accent: "orange", glyphs: ["🍂", "🍁", "❧"], speed: 10 },
};

/** Northern-hemisphere seasons by month/day. */
export function getSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;
  if (md >= 1221 || md < 320) return "winter";
  if (md < 621) return "spring";
  if (md < 923) return "summer";
  return "autumn";
}

export function getSeasonInfo(date: Date = new Date()): SeasonInfo {
  return SEASONS[getSeason(date)];
}
