import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StoreHeader } from "@/components/StoreHeader";
import { getOrderByNumber, syncOrderPayment } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react";

export const Route = createFileRoute("/orders/$orderNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — cinaAuth` },
      { name: "description", content: "Check your order status and access your purchased digital products." },
      { property: "og:title", content: `Order ${params.orderNumber} — cinaAuth` },
      { property: "og:description", content: "Check your order status and access your purchased digital products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

const statusMeta: Record<string, { label: string; description: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Awaiting payment",
    description: "We haven't received the payment yet. This page updates automatically.",
    icon: Clock,
    className: "text-primary",
  },
  paid: {
    label: "Paid — delivered",
    description: "Payment confirmed. Your products are available below.",
    icon: CheckCircle2,
    className: "text-primary",
  },
  failed: {
    label: "Payment failed",
    description: "The payment didn't go through. You can try buying again.",
    icon: XCircle,
    className: "text-destructive",
  },
};

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const getOrder = useServerFn(getOrderByNumber);
  const syncPayment = useServerFn(syncOrderPayment);
  const { clear } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const result = await getOrder({ data: { orderNumber } });
      if (result.order?.status === "pending") {
        // The payment webhook can lag; confirm with the provider directly.
        try {
          const synced = await syncPayment({
            data: { orderNumber, environment: getStripeEnvironment() },
          });
          if (synced.status !== "pending") return await getOrder({ data: { orderNumber } });
        } catch {
          /* keep showing pending */
        }
      }
      return result;
    },
    refetchInterval: (query) =>
      (query.state.data as any)?.order?.status === "pending" ? 4000 : false,
  });

  const status = data?.order?.status;

  useEffect(() => {
    if (status === "paid") clear();
  }, [status, clear]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-muted-foreground">Check the order number and try again.</p>
          <Link to="/orders" className="mt-6 inline-block">
            <Button variant="outline">Try another number</Button>
          </Link>
        </main>
      </div>
    );
  }

  const order = data.order;
  const meta = statusMeta[order.status] ?? statusMeta['pending']!;
  const StatusIcon = meta.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className={`flex items-center gap-3 ${meta.className}`}>
            <StatusIcon className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{meta.label}</h1>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Order number</dt>
              <dd className="font-mono text-lg font-semibold">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Total</dt>
              <dd className="text-lg font-semibold text-primary">
                ${order.total.toFixed(2)} {order.currency}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Email</dt>
              <dd className="text-sm">{order.buyerEmail}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Store</dt>
              <dd className="text-sm">
                {data.store ? (
                  <Link to="/$storeSlug" params={{ storeSlug: data.store.slug }} className="text-primary hover:underline">
                    {data.store.name}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3 border-t border-border pt-6">
            {data.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {item.name} × {item.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                {order.status === "paid" && (item.fileUrl || item.deliveryContent) && (
                  <div className="mt-3 space-y-2">
                    {item.fileUrl && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full sm:w-auto">
                          <Download className="mr-2 h-4 w-4" />
                          Access your product
                        </Button>
                      </a>
                    )}
                    {item.deliveryContent && (
                      <pre className="whitespace-pre-wrap rounded-lg border border-border bg-card p-3 text-xs text-foreground">
                        {item.deliveryContent}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
