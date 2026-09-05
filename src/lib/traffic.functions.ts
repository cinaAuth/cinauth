import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ViewRow = {
  path: string;
  visitor_id: string;
  session_id: string;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

function count(rows: ViewRow[], pick: (r: ViewRow) => string | null) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const key = pick(r);
    if (!key) continue;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function summarize(rows: ViewRow[]) {
  const sessions = new Map<string, { first: number; last: number; views: ViewRow[] }>();
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    const s = sessions.get(r.session_id);
    if (!s) sessions.set(r.session_id, { first: t, last: t, views: [r] });
    else {
      s.first = Math.min(s.first, t);
      s.last = Math.max(s.last, t);
      s.views.push(r);
    }
  }
  const all = [...sessions.values()];
  const bounced = all.filter((s) => s.views.length <= 1).length;
  const totalTime = all.reduce((sum, s) => sum + (s.last - s.first), 0);

  return {
    pageviews: rows.length,
    visitors: new Set(rows.map((r) => r.visitor_id)).size,
    sessions: all.length,
    bounceRate: all.length ? (bounced / all.length) * 100 : 0,
    avgSessionSeconds: all.length ? Math.round(totalTime / all.length / 1000) : 0,
  };
}

export const getStoreTraffic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { storeId: string }) => data)
  .handler(async ({ data, context }) => {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await context.supabase
      .from("store_page_views")
      .select(
        "path, visitor_id, session_id, referrer, browser, os, device, country, utm_source, utm_medium, utm_campaign, created_at",
      )
      .eq("store_id", data.storeId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const views = (rows ?? []) as ViewRow[];
    const now = Date.now();
    const DAY = 86_400_000;
    const d = new Date();
    const startOfToday = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const inRange = (from: number, to: number) =>
      views.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= from && t < to;
      });

    const current = inRange(startOfToday - 6 * DAY, now + 1);
    const previous = inRange(startOfToday - 13 * DAY, startOfToday - 6 * DAY);

    const series = [...Array(7)].map((_, i) => {
      const dayStart = startOfToday - (6 - i) * DAY;
      const dayViews = inRange(dayStart, dayStart + DAY);
      const day = new Date(dayStart);
      return {
        label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        pageviews: dayViews.length,
        sessions: new Set(dayViews.map((r) => r.session_id)).size,
      };
    });

    const entryPaths = new Map<string, ViewRow>();
    const exitPaths = new Map<string, ViewRow>();
    for (const r of current) {
      if (!entryPaths.has(r.session_id)) entryPaths.set(r.session_id, r);
      exitPaths.set(r.session_id, r);
    }
    const pathCount = (list: ViewRow[]) => count(list, (r) => r.path);

    return {
      live: new Set(
        views.filter((r) => now - new Date(r.created_at).getTime() < 5 * 60_000).map((r) => r.visitor_id),
      ).size,
      current: summarize(current),
      previous: summarize(previous),
      series,
      pages: {
        path: pathCount(current),
        entry: pathCount([...entryPaths.values()]),
        exit: pathCount([...exitPaths.values()]),
      },
      sources: {
        referrer: count(current, (r) => r.referrer),
        channel: count(current, (r) => (r.utm_medium ? r.utm_medium : r.referrer ? "Referral" : "Direct")),
      },
      environment: {
        browser: count(current, (r) => r.browser),
        os: count(current, (r) => r.os),
        device: count(current, (r) => r.device),
      },
      location: count(current, (r) => r.country),
      campaigns: count(current, (r) => r.utm_campaign),
    };
  });
