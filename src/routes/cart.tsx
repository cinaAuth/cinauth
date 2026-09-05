import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StoreHeader } from "@/components/StoreHeader";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — cinaAuth" },
      { name: "description", content: "Review the digital products in your cart before checkout on cinaAuth." },
      { property: "og:title", content: "Your cart — cinaAuth" },
      { property: "og:description", content: "Review the digital products in your cart before checkout on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, currency, setQuantity, remove, clear, storeSlug } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/" className="mt-6 inline-block">
              <Button variant="outline">Browse cinaAuth</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Buying from{" "}
              <Link to="/$storeSlug" params={{ storeSlug: storeSlug! }} className="text-primary hover:underline">
                {items[0]!.storeName}
              </Link>
            </p>

            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} {item.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border">
                    <button
                      className="p-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="p-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(item.productId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-card p-6">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)} {currency}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={clear}>
                  Clear
                </Button>
                <Button size="lg" onClick={() => navigate({ to: "/checkout" })}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
