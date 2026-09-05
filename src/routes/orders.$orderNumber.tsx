import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StoreHeader } from "@/components/StoreHeader";
import { Logo } from "@/components/Logo";
import { getOrderByNumber, syncOrderPayment } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Printer,
  Mail,
  Check,
  Copy,
  ChevronDown,
  LifeBuoy,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
              i <= current
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          {i < 2 && (
            <span
              className={cn("h-px w-20 sm:w-32", i < current ? "bg-primary" : "bg-border")}
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}

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
  const meta = statusMeta[order.status] ?? statusMeta["pending"]!;
  const StatusIcon = meta.icon;
  const paid = order.status === "paid";
  const money = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader {...(data.store ? { store: data.store } : {})} />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Invoice card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <Logo />
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Paid to {data.store?.name ?? "this store"}
            </p>
            <p className="mt-1 font-display text-4xl font-black tracking-tight">
              {money(order.total)}
            </p>
          </div>

          <div className="divide-y divide-border">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10 font-mono text-xs text-primary">
                    {item.quantity}
                  </span>
                  <p className="text-sm font-medium leading-tight">{item.name}</p>
                </div>
                <p className="whitespace-nowrap text-sm text-muted-foreground">
                  {money(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-border p-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{money(order.total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="text-primary">Free</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <span>Total</span>
              <span>
                {money(order.total)} {order.currency}
              </span>
            </div>
          </div>

          <div className="flex gap-3 border-t border-border bg-background/60 p-5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Check your email</p>
              <p className="text-xs text-muted-foreground">
                We sent your order confirmation to{" "}
                <span className="text-foreground">{order.buyerEmail}</span>. Check the spam folder
                too.
              </p>
            </div>
          </div>
        </div>

        <ProgressDots current={paid ? 2 : 1} />

        <div className="text-center">
          <h1 className="font-display text-3xl font-black tracking-tight">
            {paid ? "Order complete!" : meta.label}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {paid ? "Your products are ready. Open them below to reveal your details." : meta.description}
          </p>
        </div>

        {/* Delivered items */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            Delivered items <span className="text-muted-foreground">({data.items.length})</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {data.items.map((item) => (
            <DeliveredItem key={item.id} item={item} paid={paid} />
          ))}
        </div>

        {/* Order information */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Order information
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className={`flex items-center gap-2 text-sm font-semibold ${meta.className}`}>
                <StatusIcon className="h-4 w-4" />
                {meta.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Order</dt>
              <dd className="font-mono text-sm font-semibold">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm">{order.buyerEmail}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="text-sm font-semibold text-primary">
                {money(order.total)} {order.currency}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Store</dt>
              <dd className="text-sm">
                {data.store ? (
                  <Link
                    to="/$storeSlug"
                    params={{ storeSlug: data.store.slug }}
                    className="text-primary hover:underline"
                  >
                    {data.store.name}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Help + actions */}
        <div className="mt-4 space-y-3 print:hidden">
          <Link
            to="/orders"
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
          >
            <span className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <span>
                <span className="block text-sm font-semibold">Need help?</span>
                <span className="block text-xs text-muted-foreground">
                  Look up any order by its number
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link to="/purchases" className="block">
            <Button size="lg" className="w-full">
              View my orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          {data.store ? (
            <Link to="/$storeSlug" params={{ storeSlug: data.store.slug }} className="block">
              <Button size="lg" variant="outline" className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue shopping
              </Button>
            </Link>
          ) : (
            <Link to="/" className="block">
              <Button size="lg" variant="outline" className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue shopping
              </Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

function DeliveredItem({
  item,
  paid,
}: {
  item: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    fileUrl?: string | null;
    deliveryContent?: string | null;
  };
  paid: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const hasDelivery = paid && (item.fileUrl || item.deliveryContent);

  const copy = async () => {
    const text = item.deliveryContent ?? item.fileUrl ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-3">
          {paid ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <span>
            <span className="block text-sm font-semibold">
              {item.name} × {item.quantity}
            </span>
            <span className="block text-xs text-muted-foreground">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </span>
        </span>
        {hasDelivery && (
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      {hasDelivery && open && (
        <div className="space-y-3 border-t border-border p-4">
          {item.deliveryContent && (
            <div className="relative">
              <pre className="whitespace-pre-wrap rounded-xl border border-border bg-background p-3 pr-24 font-mono text-xs text-foreground">
                {item.deliveryContent}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-2 top-2 print:hidden"
                onClick={copy}
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
          {item.fileUrl && (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Access your product
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
