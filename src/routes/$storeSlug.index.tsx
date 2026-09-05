import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStoreCatalog, toggleWishlist, getMyWishlist, type CatalogProduct } from "@/lib/marketplace.functions";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Heart } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { Stars } from "@/components/Stars";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrackStoreView } from "@/lib/analytics";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/$storeSlug/")({
  head: () => ({
    meta: [
      { title: "Store — cinaAuth" },
      { name: "description", content: "Browse digital products on cinaAuth." },
      { property: "og:title", content: "Store — cinaAuth" },
      { property: "og:description", content: "Browse digital products on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { storeSlug } = Route.useParams();
  const { add } = useCart();
  const navigate = useNavigate();
  const catalogFn = useServerFn(getStoreCatalog);
  const toggleWishFn = useServerFn(toggleWishlist);
  const wishlistFn = useServerFn(getMyWishlist);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["store-catalog", storeSlug, debouncedSearch, category],
    queryFn: async () =>
      await catalogFn({
        data: {
          storeSlug,
          search: debouncedSearch || undefined,
          categorySlug: category ?? undefined,
        },
      }),
  });

  const { data: wishlist, refetch: refetchWishlist } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: () => wishlistFn(),
    enabled: loggedIn,
  });
  const wished = new Set(wishlist?.productIds ?? []);

  useTrackStoreView(data?.store?.id, `/${storeSlug}`);

  async function onToggleWish(productId: string) {
    if (!loggedIn) {
      toast.info("Sign in to save favorites");
      navigate({ to: "/auth" });
      return;
    }
    try {
      const res = await toggleWishFn({ data: { productId } });
      toast.success(res.wished ? "Added to your wishlist" : "Removed from your wishlist");
      refetchWishlist();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update wishlist");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Store not found</h1>
        <p className="mt-2 text-muted-foreground">This store doesn't exist or is inactive.</p>
        <Link to="/" className="mt-6">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  const { store, products, categories } = data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader store={store} />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{store.name}</h1>
          {store.description && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{store.description}</p>}
        </div>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${store.name}...`}
              className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                category === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                  category === c.slug
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              {debouncedSearch || category ? "No products match your search." : "This store doesn't have any products yet."}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: CatalogProduct) => (
              <div
                key={product.id}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all card-hover-lift glow-border-hover hover:border-primary/30"
              >
                <button
                  onClick={() => onToggleWish(product.id)}
                  aria-label="Toggle wishlist"
                  className="absolute right-4 top-4 rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Heart
                    className={`h-4 w-4 ${wished.has(product.id) ? "fill-primary text-primary" : ""}`}
                  />
                </button>
                <Link
                  to="/$storeSlug/$productSlug"
                  params={{ storeSlug: store.slug, productSlug: product.slug }}
                  className="flex-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">{product.name}</h3>
                  {product.rating_count > 0 ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Stars rating={product.rating_avg ?? 0} />
                      <span className="text-xs text-muted-foreground">
                        {(product.rating_avg ?? 0).toFixed(1)} ({product.rating_count})
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">No reviews yet</p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description || "No description"}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${Number(product.price).toFixed(2)} {product.currency}
                    {product.billing_interval ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        /{product.billing_interval === "year" ? "year" : "month"}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {product.billing_interval ? "Subscription" : product.product_type}
                  </span>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    add({
                      productId: product.id,
                      name: product.name,
                      price: Number(product.price),
                      currency: product.currency,
                      storeSlug: store.slug,
                      storeName: store.name,
                      productSlug: product.slug,
                    });
                    if (product.billing_interval) {
                      toast.success(`${product.name} subscription ready`);
                      navigate({ to: "/checkout" });
                      return;
                    }
                    toast.success(`${product.name} added to cart`);
                  }}
                >
                  {product.billing_interval ? "Subscribe" : "Add to cart"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
