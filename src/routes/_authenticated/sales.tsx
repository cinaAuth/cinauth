import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyStore } from "@/lib/stores.functions";
import { getStoreSales } from "@/lib/checkout.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Sales history — cinaAuth" },
      { name: "description", content: "Track every order, payout amount, and platform fee for your cinaAuth store." },
      { property: "og:title", content: "Sales history — cinaAuth" },
      { property: "og:description", content: "Track every order, payout amount, and platform fee for your cinaAuth store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const getMyStoreFn = useServerFn(getMyStore);
  const getStoreSalesFn = useServerFn(getStoreSales);

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ["my-store"],
    queryFn: () => getMyStoreFn(),
  });

  const storeId = storeData?.store?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["store-sales", storeId],
    queryFn: () => getStoreSalesFn({ data: { storeId: storeId! } }),
    enabled: Boolean(storeId),
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            cinaAuth
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Sales history</h1>
        <p className="mt-2 text-muted-foreground">
          {data?.storeName ? `Every order placed in ${data.storeName}.` : "Every order placed in your store."}
        </p>

        {storeLoading || isLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !storeId ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Create your store first to see sales.</p>
            <Link to="/dashboard" className="mt-6 inline-block">
              <Button>Go to dashboard</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Paid orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.stats.paidCount ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.stats.pendingCount ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Gross revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${(data?.stats.revenue ?? 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Your payout</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${(data?.stats.earnings ?? 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">After 5% platform fee</p>
                </CardContent>
              </Card>
            </div>

            {!data?.orders.length ? (
              <div className="mt-8 rounded-2xl border border-border bg-card p-12 text-center">
                <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Buyer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Your payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{order.buyerEmail}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.products.map((p: { name: string; quantity: number }) => `${p.name} ×${p.quantity}`).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              order.status === "paid"
                                ? "bg-primary/15 text-primary"
                                : order.status === "failed"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">
                          ${order.sellerEarnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
