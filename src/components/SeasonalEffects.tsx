import { useEffect, useMemo, useState } from "react";
import { getSeasonInfo } from "@/lib/seasons";
import { readEffectsEnabled, EFFECTS_EVENT } from "@/lib/theme";

type Particle = {
  id: number;
  glyph: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

const COUNT = 26;

export function SeasonalEffects() {
  const [enabled, setEnabled] = useState(false);
  const season = useMemo(() => getSeasonInfo(), []);

  useEffect(() => {
    const sync = () => setEnabled(readEffectsEnabled());
    sync();
    window.addEventListener(EFFECTS_EVENT, sync);
    return () => window.removeEventListener(EFFECTS_EVENT, sync);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      glyph: season.glyphs[i % season.glyphs.length] ?? "•",
      left: Math.random() * 100,
      size: 8 + Math.random() * 14,
      duration: season.speed + Math.random() * season.speed * 0.8,
      delay: -Math.random() * season.speed * 1.5,
      drift: (Math.random() - 0.5) * 120,
      opacity: 0.25 + Math.random() * 0.45,
    }));
  }, [season]);

  if (!enabled) return null;

  return (
    <div className="seasonal-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="seasonal-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
