import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMyPurchases, getMySubscriptions, createBuyerPortalSession } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Zap, Package, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/purchases")({
  head: () => ({
    meta: [
      { title: "My purchases — cinaAuth" },
      { name: "description", content: "Your orders and subscriptions on cinaAuth." },
      { property: "og:title", content: "My purchases — cinaAuth" },
      { property: "og:description", content: "Your orders and subscriptions on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchasesPage,
});

const STATUS_STYLES: Record<string, string> = {
  paid: "text-emerald-400",
  pending: "text-amber-400",
  failed: "text-red-400",
  refunded: "text-muted-foreground",
};

function PurchasesPage() {
  const getMyPurchasesFn = useServerFn(getMyPurchases);
  const getMySubscriptionsFn = useServerFn(getMySubscriptions);
  const portalFn = useServerFn(createBuyerPortalSession);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: () => getMyPurchasesFn(),
  });

  const { data: subsData } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () => getMySubscriptionsFn({ data: { environment: getStripeEnvironment() } }),
  });

  const activeSub = (subsData?.subscriptions ?? []).find(
    (s: any) => ["active", "trialing", "past_due"].includes(s.status),
  );

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            cinaAuth
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My purchases</h1>
        <p className="mt-2 text-muted-foreground">Everything you bought with this account.</p>

        {activeSub ? (
          <Card className="mt-8 border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" /> Active subscription
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {(activeSub as any).cancel_at_period_end
                  ? `Canceled — access until ${new Date((activeSub as any).current_period_end).toLocaleDateString()}`
                  : `Renews on ${new Date((activeSub as any).current_period_end).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{portalError}</AlertDescription>
                </Alert>
              )}
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage subscription
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Cancel anytime — you keep access until the end of the period you already paid for.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-border bg-card p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.orders.length === 0 ? (
          <Card className="mt-8 border-border bg-card">
            <CardContent className="py-10 text-center text-muted-foreground">
              No purchases yet with this account. Orders are linked when you check out while signed in.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-3">
            {data?.orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {order.products.map((p: { name: string; quantity: number }) => p.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.storeName} · {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium capitalize ${STATUS_STYLES[order.status] ?? "text-muted-foreground"}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {order.currency} {order.total.toFixed(2)}
                  </span>
                  {order.orderNumber ? (
                    <Link to="/orders/$orderNumber" params={{ orderNumber: order.orderNumber }}>
                      <Button variant="outline" size="sm">View order</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
