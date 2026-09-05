import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useServerFn } from "@tanstack/react-start";
import { StoreHeader } from "@/components/StoreHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { createCartCheckout } from "@/lib/checkout.functions";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, Mail, ShieldCheck, Zap, LifeBuoy, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — cinaAuth" },
      { name: "description", content: "Pay securely and get instant access to your digital products on cinaAuth." },
      { property: "og:title", content: "Checkout — cinaAuth" },
      { property: "og:description", content: "Pay securely and get instant access to your digital products on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Order info", "Confirm & pay", "Receive products"];

function Steps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 border-b border-border pb-4 sm:gap-3">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                done || active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutPage() {
  const { items, total, currency, storeSlug } = useCart();
  const createCheckout = useServerFn(createCartCheckout);
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const buyerUserId = sessionData.session?.user?.id;
      const result = await createCheckout({
        data: {
          storeSlug: storeSlug!,
          buyerEmail: email,
          ...(buyerUserId && { buyerUserId }),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          returnUrl: window.location.origin,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      setClientSecret(result.clientSecret);
      // Remember the order so the return page and cart cleanup can use it.
      sessionStorage.setItem("cinaauth.lastOrder", result.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Nothing to pay for</h1>
          <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
          <Link to="/cart" className="mt-6 inline-block">
            <Button variant="outline">Back to cart</Button>
          </Link>
        </main>
      </div>
    );
  }

  const storeName = items[0]?.storeName ?? "this store";
  const money = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <StoreHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        {/* Invoice summary */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="overflow-hidden rounded-none border border-border bg-card">
            <div className="border-b border-border p-6">
              <Logo />
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Paying to {storeName}
              </p>
              <p className="mt-1 font-display text-4xl font-black tracking-tight">
                {money(total)}
              </p>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.productId} className="flex items-start justify-between gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 font-mono text-xs text-primary">
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
                <span>{money(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-primary">Instant</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {money(total)} {currency}
                </span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border bg-background/60 p-5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Check your email</p>
                <p className="text-xs text-muted-foreground">
                  We send the order confirmation and your products to{" "}
                  <span className="text-foreground">{email || "your email"}</span>. Check the spam folder too.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main flow */}
        <section>
          <Steps current={clientSecret ? 1 : 0} />

          <h1 className="mt-8 text-center font-display text-3xl font-black tracking-tight sm:text-4xl">
            {clientSecret ? "Confirm & pay" : "Order info"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
            {clientSecret
              ? "Choose your payment method. Your products unlock right after payment."
              : "Tell us where to deliver your products, then continue to payment."}
          </p>

          {!clientSecret ? (
            <form onSubmit={start} className="mt-8 space-y-6 rounded-none border border-border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email for delivery</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Your products and order link are tied to this email.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue to payment
              </Button>

              <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-3 border border-border p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Secure checkout</p>
                    <p className="text-xs text-muted-foreground">Card details never touch this store.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-border p-4">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Instant delivery</p>
                    <p className="text-xs text-muted-foreground">Products unlock right after payment.</p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-8 rounded-none border border-border bg-card p-4" id="checkout">
              <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              to="/orders"
              className="flex items-center justify-between border border-border bg-card p-4 transition-colors hover:border-primary/60"
            >
              <span className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">Track an order</span>
                  <span className="block text-xs text-muted-foreground">Look it up by order number</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/cart"
              className="flex items-center justify-between border border-border bg-card p-4 transition-colors hover:border-primary/60"
            >
              <span className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 rotate-180 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">Back to cart</span>
                  <span className="block text-xs text-muted-foreground">Change quantities or items</span>
                </span>
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
