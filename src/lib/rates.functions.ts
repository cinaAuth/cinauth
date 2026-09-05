import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_RATES } from "@/lib/currencies";

let cache: { at: number; rates: Record<string, number> } | null = null;
const TTL = 6 * 60 * 60 * 1000;

/** Public: current exchange rates against USD, refreshed a few times a day. */
export const getExchangeRates = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL) return { rates: cache.rates, live: true };

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const json = (await res.json()) as { result?: string; rates?: Record<string, number> };
      if (json.result === "success" && json.rates && json.rates["EUR"]) {
        cache = { at: Date.now(), rates: json.rates };
        return { rates: json.rates, live: true };
      }
    }
  } catch {
    // fall through to offline rates
  }

  return { rates: FALLBACK_RATES, live: false };
});
