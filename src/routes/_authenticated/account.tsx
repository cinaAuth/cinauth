import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyPurchases, getMySubscriptions, createBuyerPortalSession } from "@/lib/checkout.functions";
import { getMyWishlistProducts } from "@/lib/marketplace.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Logo } from "@/components/Logo";
import { Package, Loader2, CreditCard, Heart, Wallet, Receipt, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — cinaAuth" },
      { name: "description", content: "Your customer dashboard: orders, subscriptions, wishlist and billing." },
      { property: "og:title", content: "My account — cinaAuth" },
      { property: "og:description", content: "Your customer dashboard: orders, subscriptions, wishlist and billing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerDashboard,
});

const STATUS_STYLES: Record<string, string> = {
  paid: "text-emerald-400",
  active: "text-emerald-400",
  trialing: "text-emerald-400",
  pending: "text-amber-400",
  past_due: "text-amber-400",
  failed: "text-red-400",
  canceled: "text-muted-foreground",
  refunded: "text-muted-foreground",
};

function money(currency: string, amount: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function CustomerDashboard() {
  const getPurchasesFn = useServerFn(getMyPurchases);
  const getSubsFn = useServerFn(getMySubscriptions);
  const getWishlistFn = useServerFn(getMyWishlistProducts);
  const portalFn = useServerFn(createBuyerPortalSession);

  const [portalError, setPortalError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: () => getPurchasesFn(),
  });
  const { data: subsData } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () => getSubsFn({ data: { environment: getStripeEnvironment() } }),
  });
  const { data: wishlist } = useQuery({
    queryKey: ["my-wishlist-products"],
    queryFn: () => getWishlistFn(),
  });

  const orders = purchases?.orders ?? [];
  const subs = (subsData?.subscriptions ?? []) as any[];
  const wished = wishlist?.items ?? [];

  const paid = orders.filter((o) => o.status === "paid");
  const currency = paid[0]?.currency ?? orders[0]?.currency ?? "USD";
  const spent = paid.reduce((sum, o) => sum + o.total, 0);
  const activeSubs = subs.filter((s) => ["active", "trialing", "past_due"].includes(s.status));

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const result = await portalFn({ data: { environment: getStripeEnvironment() } });
      if ("error" in result && result.error) throw new Error(result.error);
      if (result.url) window.open(result.url, "_blank");
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const stats = [
    { label: "Orders", value: String(orders.length), icon: Receipt },
    { label: "Total spent", value: money(currency, spent), icon: Wallet },
    { label: "Subscriptions", value: String(activeSubs.length), icon: CreditCard },
    { label: "Wishlist", value: String(wished.length), icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <Logo className="h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/orders">
              <Button variant="ghost" size="sm">Track order</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Seller panel</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">My account</h1>
        <p className="mt-2 text-muted-foreground">Your orders, subscriptions and saved products.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {portalError ? (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{portalError}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                text="No orders yet with this account. Orders are linked when you check out while signed in."
              />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {order.products.map((p: { name: string }) => p.name).join(", ") || "Order"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.storeName} · {order.orderNumber} ·{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-medium capitalize ${STATUS_STYLES[order.status] ?? "text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold">{money(order.currency, order.total)}</span>
                      {order.orderNumber ? (
                        <Link to="/invoice/$orderNumber" params={{ orderNumber: order.orderNumber }}>
                          <Button variant="outline" size="sm">Invoice</Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            {subs.length === 0 ? (
              <EmptyState icon={CreditCard} text="You have no subscriptions yet." />
            ) : (
              <div className="space-y-3">
                {subs.map((sub) => (
                  <Card key={sub.id} className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between gap-3 text-base">
                        <span>{sub.productName ?? sub.product_name ?? "Subscription"}</span>
                        <span className={`text-sm font-medium capitalize ${STATUS_STYLES[sub.status] ?? "text-muted-foreground"}`}>
                          {String(sub.status).replace("_", " ")}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {sub.current_period_end
                          ? sub.cancel_at_period_end
                            ? `Canceled — access until ${new Date(sub.current_period_end).toLocaleDateString()}`
                            : `Renews on ${new Date(sub.current_period_end).toLocaleDateString()}`
                          : "Recurring plan"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" onClick={openPortal} disabled={portalLoading}>
                        {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Manage billing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="mt-4">
            {wished.length === 0 ? (
              <EmptyState icon={Heart} text="Nothing saved yet. Tap the heart on any product to save it here." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {wished.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.storeName} · {money(item.currency, item.price)}
                        {item.billingInterval ? ` / ${item.billingInterval}` : ""}
                      </p>
                    </div>
                    {item.storeSlug && item.slug ? (
                      <Link to="/$storeSlug/$productSlug" params={{ storeSlug: item.storeSlug, productSlug: item.slug }}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Package; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
