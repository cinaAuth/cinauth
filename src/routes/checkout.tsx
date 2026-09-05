import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useServerFn } from "@tanstack/react-start";
import { StoreHeader } from "@/components/StoreHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useCart } from "@/lib/cart";
import { createCartCheckout } from "@/lib/checkout.functions";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <StoreHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        {!clientSecret ? (
          <form onSubmit={start} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6">
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

            <div className="space-y-2 border-t border-border pt-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">
                  ${total.toFixed(2)} {currency}
                </span>
              </div>
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
          </form>
        ) : (
          <div className="mt-8" id="checkout">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </main>
    </div>
  );
}
