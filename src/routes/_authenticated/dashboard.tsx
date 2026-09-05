import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerFn } from "@tanstack/react-start";
import { getMyStore } from "@/lib/stores.functions";
import { Store, Compass, Zap, Calendar, Package, SlidersHorizontal, Info, Loader2, DollarSign, ShoppingCart, Users, Box, ArrowRight, Eye, Globe, Clock, CornerUpLeft, MousePointerClick } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getStoreSales } from "@/lib/checkout.functions";
import { getStoreTraffic } from "@/lib/traffic.functions";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { dashT, type DashKey } from "@/lib/i18n-dash";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — cinaAuth" },
      { name: "description", content: "Manage your digital store, products, and orders." },
      { property: "og:title", content: "Dashboard — cinaAuth" },
      { property: "og:description", content: "Manage your digital store, products, and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type SaleRow = {
  id: string;
  buyerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  sellerEarnings: number;
  products: { name: string; quantity: number; price: number }[];
};

function timeAgo(iso: string, d: (k: DashKey) => string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return d("justNow");
  if (m < 60) return `${m} ${d("minAgo")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${d("hoursAgo")}`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} ${d("daysAgo")}`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w} ${d("weeksAgo")}`;
  const mo = Math.floor(days / 30);
  return `${mo} ${d("monthsAgo")}`;
}

function SectionCard({
  icon: Icon,
  title,
  children,
  viewAllTo,
  action,
  viewAllLabel = "View all",
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  viewAllTo?: string;
  action?: React.ReactNode;
  viewAllLabel?: string;
}) {
  return (
    <Card className="rounded-none border-primary/20 bg-card/80 transition-all card-hover-lift glow-border-hover hover:glow-border-primary">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-primary/15 py-4">
        <CardTitle className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
        {action ?? <Info className="h-4 w-4 text-muted-foreground/60" />}
      </CardHeader>
      <CardContent className="p-0">
        {children}
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="flex items-center justify-center gap-1 border-t border-primary/15 py-3 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            {viewAllLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyPeriod() {
  const { lang } = useI18n();
  const d = dashT(lang);
  return <p className="py-10 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">[ NO_DATA // {d("noData")} ]</p>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="rounded-none border-primary/20 bg-card/80 transition-all card-hover-lift glow-border-hover hover:glow-border-primary">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatChart({
  icon: Icon,
  title,
  data,
  dataKey,
  color,
  formatValue,
}: {
  icon: any;
  title: string;
  data: { label: string; date: string; value: number }[];
  dataKey: string;
  color: string;
  formatValue: (n: number) => string;
}) {
  return (
    <Card className="rounded-none border-primary/20 bg-card/80 transition-all card-hover-lift glow-border-hover hover:glow-border-primary">
      <CardHeader className="border-b border-primary/15 py-4">
        <CardTitle className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v: number) => formatValue(v)}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]!.payload as { date: string; value: number };
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-center shadow-lg">
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                      <p className="text-sm font-bold text-foreground">{formatValue(p.value)}</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { lang } = useI18n();
  const d = dashT(lang);
  const getMyStoreFn = useServerFn(getMyStore);
  const getStoreSalesFn = useServerFn(getStoreSales);
  const [tab, setTab] = useState<"revenue" | "traffic">("revenue");

  const { data, isLoading } = useQuery({
    queryKey: ["my-store"],
    queryFn: () => getMyStoreFn(),
  });
  const store = data?.store;

  const { data: salesData } = useQuery({
    queryKey: ["store-sales", store?.id],
    queryFn: () => getStoreSalesFn({ data: { storeId: store!.id } }),
    enabled: !!store?.id,
  });

  const [productsTab, setProductsTab] = useState<"best" | "decliners" | "risers">("best");

  const orders: SaleRow[] = salesData?.orders ?? [];
  const paid = orders.filter((o) => o.status === "paid");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const DAY = 24 * 60 * 60 * 1000;

  const series = [...Array(7)].map((_, i) => {
    const dayStart = startOfToday - (6 - i) * DAY;
    const dayEnd = dayStart + DAY;
    const dayOrders = paid.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    });
    const d = new Date(dayStart);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Product rankings from real order items in the DB
  const weekStart = startOfToday - 6 * DAY;
  const prevWeekStart = weekStart - 7 * DAY;
  type ProductStat = { name: string; revenue: number; qty: number; prevRevenue: number };
  const productMap = new Map<string, ProductStat>();
  for (const o of paid) {
    const t = new Date(o.createdAt).getTime();
    const inCurrent = t >= weekStart;
    const inPrev = t >= prevWeekStart && t < weekStart;
    if (!inCurrent && !inPrev) continue;
    for (const p of o.products ?? []) {
      const cur = productMap.get(p.name) ?? { name: p.name, revenue: 0, qty: 0, prevRevenue: 0 };
      if (inCurrent) {
        cur.revenue += p.price * p.quantity;
        cur.qty += p.quantity;
      } else {
        cur.prevRevenue += p.price * p.quantity;
      }
      productMap.set(p.name, cur);
    }
  }
  const allProductStats = [...productMap.values()];
  const bestProducts = allProductStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const risers = allProductStats
    .filter((p) => p.revenue - p.prevRevenue > 0)
    .sort((a, b) => b.revenue - b.prevRevenue - (a.revenue - a.prevRevenue))
    .slice(0, 5);
  const decliners = allProductStats
    .filter((p) => p.revenue - p.prevRevenue < 0)
    .sort((a, b) => a.revenue - a.prevRevenue - (b.revenue - b.prevRevenue))
    .slice(0, 5);
  const shownProducts = productsTab === "best" ? bestProducts : productsTab === "risers" ? risers : decliners;

  // Top spenders from paid orders
  const spenderMap = new Map<string, number>();
  for (const o of paid) spenderMap.set(o.buyerEmail, (spenderMap.get(o.buyerEmail) ?? 0) + o.total);
  const topSpenders = [...spenderMap.entries()]
    .map(([email, total]) => ({ email, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Most used payment methods (all payments go through card checkout today)
  const mostUsedMethods = paid.length > 0 ? [{ name: "Card", count: paid.length }] : [];

  const currency = salesData?.stats.currency ?? "USD";
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

  return (
    <div className="text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
        <main className="flex-1 pb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">// {d("status")}</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
            <span className="text-glow-primary text-primary">{d("title")}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {d("subtitle")}
          </p>

          {isLoading ? (
            <div className="mt-8 flex items-center justify-center rounded-none border border-primary/20 bg-card p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : store ? (
            <>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/$storeSlug" params={{ storeSlug: store.slug }}>
                  <Button variant="outline" className="gap-2 rounded-none border-primary/30 uppercase tracking-widest hover:border-primary hover:text-primary">
                    <Compass className="h-4 w-4" /> {d("tour")}
                  </Button>
                </Link>
                <Link to="/products">
                  <Button className="gap-2 rounded-none bg-primary text-primary-foreground uppercase tracking-widest hover:bg-primary/85">
                    <Zap className="h-4 w-4" /> {d("quickSetup")}
                  </Button>
                </Link>
              </div>

              {/* Tabs */}
              <div className="mt-8 border-b border-primary/20">
                <div className="flex gap-8">
                  <button
                    onClick={() => setTab("revenue")}
                    className={`pb-3 font-display text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                      tab === "revenue"
                        ? "border-b-2 border-primary text-glow-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d("tabRevenue")}
                  </button>
                  <button
                    onClick={() => setTab("traffic")}
                    className={`pb-3 font-display text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                      tab === "traffic"
                        ? "border-b-2 border-primary text-glow-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d("tabTraffic")}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 rounded-none border border-primary/20 bg-card/80 px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" /> {d("today")}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-none border border-primary/20 bg-card/80 px-3 text-xs uppercase tracking-widest text-muted-foreground">
                    <Package className="h-4 w-4 shrink-0 text-primary" /> <span className="truncate">{d("allProducts")}</span>
                  </div>
                  <div className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-none border border-primary/20 bg-card/80 px-3 text-xs uppercase tracking-widest text-muted-foreground">
                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" /> {d("filters")}
                  </div>
                  <div className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-none border border-primary/20 bg-card/80 px-3 text-xs font-medium uppercase tracking-widest text-foreground">
                    {currency}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {tab === "revenue" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={DollarSign}
                  label={d("totalRevenue")}
                  value={fmtMoney(paid.reduce((s, o) => s + o.total, 0))}
                  sub={`${paid.length} ${d("completedOrders")}`}
                />
                <StatCard
                  icon={ShoppingCart}
                  label={d("totalOrders")}
                  value={String(orders.length)}
                  sub={`${paid.length} ${d("paid")} · ${orders.length - paid.length} ${d("pending")}`}
                />
                <StatCard
                  icon={Users}
                  label={d("uniqueCustomers")}
                  value={String(new Set(orders.map((o) => o.buyerEmail)).size)}
                  sub={d("basedOnEmail")}
                />
              </div>
              )}


              {tab === "revenue" ? (
                <div className="mt-4 grid gap-4">
                  <StatChart
                    icon={DollarSign}
                    title={d("revenue")}
                    data={series.map((s) => ({ label: s.label, date: s.date, value: s.revenue }))}
                    dataKey="revenue"
                    color="var(--primary)"
                    formatValue={fmtMoney}
                  />
                  <StatChart
                    icon={ShoppingCart}
                    title={d("orders")}
                    data={series.map((s) => ({ label: s.label, date: s.date, value: s.orders }))}
                    dataKey="orders"
                    color="var(--chart-2)"
                    formatValue={(n) => String(Math.round(n))}
                  />

                  {/* Latest completed orders */}
                  <SectionCard icon={ShoppingCart} title={d("latestOrders")} viewAllTo="/sales" viewAllLabel={d("viewAll")}>
                    {paid.length === 0 ? (
                      <EmptyPeriod />
                    ) : (
                      <ul className="divide-y divide-border">
                        {paid.slice(0, 10).map((o) => {
                          const first = o.products?.[0];
                          const name = first?.name ?? d("order");
                          const extra = (o.products?.length ?? 0) - 1;
                          return (
                            <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-primary/30 bg-primary/15 text-sm font-bold text-primary">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {name}
                                  {extra > 0 && <span className="text-muted-foreground"> +{extra}</span>}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{o.buyerEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">{fmtMoney(o.total)}</p>
                                <p className="text-xs text-muted-foreground">{timeAgo(o.createdAt, d)}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </SectionCard>

                  {/* Products */}
                  <SectionCard
                    icon={Box}
                    title={d("products")}
                    viewAllTo="/products"
                    viewAllLabel={d("viewAll")}
                    action={
                      <div className="flex gap-1 rounded-none border border-primary/20 p-1">
                        {(["best", "decliners", "risers"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setProductsTab(t)}
                            className={`rounded-none px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                              productsTab === t
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {d(t as DashKey)}
                          </button>
                        ))}
                      </div>
                    }
                  >
                    {shownProducts.length === 0 ? (
                      <EmptyPeriod />
                    ) : (
                      <ul className="divide-y divide-border">
                        {shownProducts.map((p) => (
                          <li key={p.name} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-primary/30 bg-primary/15 text-sm font-bold text-primary">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.qty} {d("soldThisWeek")}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{fmtMoney(p.revenue)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>

                  {/* Top spenders */}
                  <SectionCard icon={Users} title={d("topSpenders")}>
                    {topSpenders.length === 0 ? (
                      <EmptyPeriod />
                    ) : (
                      <ul className="divide-y divide-border">
                        {topSpenders.map((s) => (
                          <li key={s.email} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-primary/20 bg-muted text-sm font-bold text-foreground">
                              {s.email.charAt(0).toUpperCase()}
                            </div>
                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{s.email}</p>
                            <p className="text-sm font-semibold text-foreground">{fmtMoney(s.total)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>

                  {/* Most used methods */}
                  <SectionCard icon={DollarSign} title={d("mostUsedMethods")}>
                    {mostUsedMethods.length === 0 ? (
                      <EmptyPeriod />
                    ) : (
                      <ul className="divide-y divide-border">
                        {mostUsedMethods.map((m) => (
                          <li key={m.name} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground">
                              {m.name.charAt(0)}
                            </div>
                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{m.name}</p>
                            <p className="text-sm font-semibold text-foreground">{m.count} {d("ordersLabel")}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>
                </div>
              ) : (
                <TrafficPanel storeId={store.id} paidOrders={paid.length} />
              )}


            </>
          ) : (
            <Card className="mt-8 border-border bg-card">
              <CardHeader className="items-center text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                  <Store className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground">{d("createStore")}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {d("createStoreDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/onboarding" className="block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {d("createStoreBtn")}
                  </Button>
                </Link>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {d("createStoreHint")}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function pct(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: any;
  label: string;
  value: string;
  change: number;
}) {
  const { lang } = useI18n();
  const changeLabel = dashT(lang)("change");
  const up = change > 0;
  const flat = change === 0;
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Icon className="h-4 w-4" /> {label}
          </p>
          <Info className="h-4 w-4 text-muted-foreground/60" />
        </div>
        <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-2 flex items-center gap-1 text-sm">
          <span className={flat ? "text-muted-foreground" : up ? "text-emerald-500" : "text-red-500"}>
            {flat ? "—" : up ? "↗" : "↘"} {change.toFixed(2)}%
          </span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  tabs,
  data,
  empty,
}: {
  title: string;
  tabs: readonly string[];
  data: Record<string, { name: string; value: number }[]>;
  empty?: React.ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]!);
  const rows = data[active] ?? [];
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border py-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {tabs.length > 1 && (
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`rounded-none px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                  active === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          empty ?? <EmptyPeriod />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.name} className="relative px-4 py-3">
                <div
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-foreground">{r.name}</span>
                  <span className="text-sm font-semibold text-foreground">{r.value}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TrafficPanel({ storeId, paidOrders }: { storeId: string; paidOrders: number }) {
  const { lang } = useI18n();
  const d = dashT(lang);
  const getStoreTrafficFn = useServerFn(getStoreTraffic);
  const { data, isLoading } = useQuery({
    queryKey: ["store-traffic", storeId],
    queryFn: () => getStoreTrafficFn({ data: { storeId } }),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const c = data.current;
  const p = data.previous;
  const conversion = c.sessions ? (paidOrders / c.sessions) * 100 : 0;

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4">
        <span className="h-3 w-3 rounded-full bg-emerald-500" />
        <p className="text-sm text-foreground">
          <span className="font-bold">{data.live}</span>{" "}
          <span className="text-muted-foreground">{d("liveVisitors")}</span>
        </p>
      </div>

      <MetricCard icon={Eye} label={d("pageviews")} value={String(c.pageviews)} change={pct(c.pageviews, p.pageviews)} />
      <MetricCard icon={Users} label={d("visitors")} value={String(c.visitors)} change={pct(c.visitors, p.visitors)} />
      <MetricCard icon={Globe} label={d("visits")} value={String(c.sessions)} change={pct(c.sessions, p.sessions)} />
      <MetricCard
        icon={CornerUpLeft}
        label={d("bounceRate")}
        value={`${c.bounceRate.toFixed(1)}%`}
        change={pct(c.bounceRate, p.bounceRate)}
      />
      <MetricCard
        icon={Clock}
        label={d("avgSession")}
        value={`${c.avgSessionSeconds}s`}
        change={pct(c.avgSessionSeconds, p.avgSessionSeconds)}
      />
      <MetricCard icon={MousePointerClick} label={d("conversionRate")} value={`${conversion.toFixed(2)}%`} change={0} />

      <StatChart
        icon={Eye}
        title={d("pageviews")}
        data={data.series.map((s) => ({ label: s.label, date: s.date, value: s.pageviews }))}
        dataKey="pageviews"
        color="var(--primary)"
        formatValue={(n) => String(Math.round(n))}
      />
      <StatChart
        icon={Globe}
        title={d("sessions")}
        data={data.series.map((s) => ({ label: s.label, date: s.date, value: s.sessions }))}
        dataKey="sessions"
        color="var(--chart-2)"
        formatValue={(n) => String(Math.round(n))}
      />

      <BreakdownCard title={d("pages")} tabs={["path", "entry", "exit"] as const} data={data.pages} />
      <BreakdownCard title={d("sources")} tabs={["referrer", "channel"] as const} data={data.sources} />
      <BreakdownCard title={d("environment")} tabs={["browser", "os", "device"] as const} data={data.environment} />
      <BreakdownCard title={d("location")} tabs={["country"] as const} data={{ country: data.location }} />
      <BreakdownCard
        title={d("utm")}
        tabs={["campaign"] as const}
        data={{ campaign: data.campaigns }}
        empty={
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-foreground">{d("noCampaigns")}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {d("noCampaignsDesc")}
            </p>
          </div>
        }
      />
    </div>
  );
}
