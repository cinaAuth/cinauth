import { createServerFn } from "@tanstack/react-start";

export type LandingDay = { date: string; revenue: number };
export type LandingOrder = {
  id: string;
  reference: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
};
export type LandingStats = {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  currency: string;
  days: LandingDay[];
  orders: LandingOrder[];
};

// Public, aggregate-only platform stats for the landing dashboard preview.
export const getLandingStats = createServerFn({ method: "GET" }).handler(async (): Promise<LandingStats> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  since.setUTCHours(0, 0, 0, 0);

  const { data: paidOrders } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, total, currency, status, buyer_email, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = paidOrders ?? [];
  const totalRevenue = rows.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const uniqueCustomers = new Set(rows.map((o) => o.buyer_email)).size;
  const currency = rows[0]?.currency ?? "USD";

  // Revenue for the last 7 days
  const days: LandingDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    d.setUTCHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const revenue = rows
      .filter((o) => String(o.created_at).slice(0, 10) === key)
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    days.push({ date: key, revenue });
  }

  // Latest 3 paid orders with their first product name
  const latest = rows.slice(0, 3);
  let names = new Map<string, string>();
  if (latest.length) {
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("order_id, products(name)")
      .in(
        "order_id",
        latest.map((o) => o.id),
      );
    for (const it of items ?? []) {
      const productName = (it as { products: { name: string } | null }).products?.name;
      if (productName && !names.has(it.order_id)) names.set(it.order_id, productName);
    }
  }

  const orders: LandingOrder[] = latest.map((o) => ({
    id: o.id,
    reference: `#${(o.order_number ?? o.id).toString().slice(0, 10).toUpperCase()}`,
    product: names.get(o.id) ?? "Digital product",
    amount: Number(o.total ?? 0),
    currency: o.currency ?? currency,
    status: "PAID",
  }));

  return {
    totalRevenue,
    totalOrders: rows.length,
    uniqueCustomers,
    currency,
    days,
    orders,
  };
});
