import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyStore } from "@/lib/stores.functions";
import { getStoreSubscriptions } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Users, AlertCircle, CheckCircle2, XCircle, DollarSign } from "lucide-react";

type Subscription = {
  id: string;
  buyerEmail: string;
  buyerUserId: string | null;
  productId: string;
  productName: string;
  priceId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  environment: string;
  createdAt: string;
};

export const Route = createFileRoute("/_authenticated/panel/sales/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — cinaAuth" },
      { name: "description", content: "Manage your store subscriptions on cinaAuth." },
      { property: "og:title", content: "Subscriptions — cinaAuth" },
      { property: "og:description", content: "Manage your store subscriptions on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionsPage,
});

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (["active", "trialing"].includes(normalized)) {
    return <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{status}</Badge>;
  }
  if (normalized === "past_due") {
    return <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Past due</Badge>;
  }
  if (normalized === "canceled") {
    return <Badge className="bg-rose-500/15 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">Canceled</Badge>;
  }
  if (["incomplete", "incomplete_expired", "unpaid", "paused"].includes(normalized)) {
    return <Badge variant="secondary">{status}</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

function SubscriptionsPage() {
  const getMyStoreFn = useServerFn(getMyStore);
  const getStoreSubscriptionsFn = useServerFn(getStoreSubscriptions);

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ["my-store"],
    queryFn: () => getMyStoreFn(),
  });

  const storeId = storeData?.store?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["store-subscriptions", storeId],
    queryFn: () => getStoreSubscriptionsFn({ data: { storeId: storeId!, environment: getStripeEnvironment() } }),
    enabled: Boolean(storeId),
    refetchInterval: 15000,
  });

  const subscriptions: Subscription[] = data?.subscriptions ?? [];
  const activeCount = subscriptions.filter((s) => ["active", "trialing"].includes(s.status.toLowerCase())).length;
  const canceledCount = subscriptions.filter((s) => s.status.toLowerCase() === "canceled").length;
  const pastDueCount = subscriptions.filter((s) => s.status.toLowerCase() === "past_due").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <RefreshCw className="h-5 w-5" />
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Sales // Subscriptions</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight font-display">SUBSCRIPTIONS</h1>
            <p className="mt-2 text-muted-foreground">
              {data?.storeName ? `Recurring revenue for ${data.storeName}.` : "Recurring revenue for your store."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {storeLoading || isLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !storeId ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Create your store first to see subscriptions.</p>
            <Link to="/dashboard" className="mt-6 inline-block">
              <Button>Go to dashboard</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    Canceled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{canceledCount}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Past due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{pastDueCount}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Total subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{subscriptions.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  All subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!subscriptions.length ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No subscriptions yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create a subscription product and complete a test purchase to see it here.</p>
                    <Link to="/products" className="mt-4 inline-block">
                      <Button>Manage products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Status</th>
                          <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Product</th>
                          <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Buyer</th>
                          <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Current period</th>
                          <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Started</th>
                          <th className="py-3 text-left font-medium text-muted-foreground">Environment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub: Subscription) => (
                          <tr key={sub.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3 pr-4">{statusBadge(sub.status)}</td>
                            <td className="py-3 pr-4 font-medium">{sub.productName}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{sub.buyerEmail}</td>
                            <td className="py-3 pr-4 text-muted-foreground">
                              {formatDate(sub.currentPeriodStart)} → {formatDate(sub.currentPeriodEnd)}
                              {sub.cancelAtPeriodEnd && (
                                <span className="ml-2 text-xs text-rose-500">(cancels at period end)</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                            <td className="py-3">
                              <Badge variant="outline" className="capitalize">
                                {sub.environment}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
