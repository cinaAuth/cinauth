import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicProduct } from "@/lib/products.functions";
import {
  getProductReviews,
  addReview,
  getRelatedProducts,
  toggleWishlist,
  getMyWishlist,
} from "@/lib/marketplace.functions";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Heart, BadgeCheck } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { Stars, StarsInput } from "@/components/Stars";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrackStoreView } from "@/lib/analytics";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/$storeSlug/$productSlug")({
  head: () => ({
    meta: [
      { title: "Product — cinaAuth" },
      { name: "description", content: "Purchase this digital product on cinaAuth." },
      { property: "og:title", content: "Product — cinaAuth" },
      { property: "og:description", content: "Purchase this digital product on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { storeSlug, productSlug } = Route.useParams();
  const getPublicProductFn = useServerFn(getPublicProduct);
  const reviewsFn = useServerFn(getProductReviews);
  const relatedFn = useServerFn(getRelatedProducts);
  const addReviewFn = useServerFn(addReview);
  const toggleWishFn = useServerFn(toggleWishlist);
  const wishlistFn = useServerFn(getMyWishlist);
  const queryClient = useQueryClient();
  const { add } = useCart();
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-product", storeSlug, productSlug],
    queryFn: () => getPublicProductFn({ data: { storeSlug, productSlug } }),
  });

  const productId = data?.product?.id as string | undefined;

  const { data: reviewsData } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => reviewsFn({ data: { productId: productId! } }),
    enabled: !!productId,
  });

  type RelatedProduct = {
    id: string; name: string; slug: string; price: number | string;
    currency: string; category_id: string | null;
  };

  const { data: relatedData } = useQuery({
    queryKey: ["related-products", storeSlug, productId],
    queryFn: async () =>
      (await relatedFn({
        data: {
          storeSlug,
          productId: productId!,
          categoryId: ((data?.product as Record<string, unknown> | undefined)?.["category_id"] as string | null) ?? null,
        },
      })) as { products: RelatedProduct[] },
    enabled: !!productId,
  });

  const { data: wishlist, refetch: refetchWishlist } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: () => wishlistFn(),
    enabled: loggedIn,
  });
  const wished = new Set(wishlist?.productIds ?? []);

  useTrackStoreView(data?.store?.id as string | undefined, `/${storeSlug}/${productSlug}`);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This product doesn't exist or is unavailable.</p>
        <Link to="/" className="mt-6">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  const { store, product } = data;
  const cartItem = {
    productId: product.id as string,
    name: product.name as string,
    price: Number(product.price),
    currency: product.currency as string,
    storeSlug: store.slug as string,
    storeName: store.name as string,
    productSlug: product.slug as string,
  };

  const reviews = reviewsData?.reviews ?? [];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const related = relatedData?.products ?? [];

  async function onSubmitReview() {
    if (!loggedIn) {
      toast.info("Sign in to write a review");
      navigate({ to: "/auth" });
      return;
    }
    setSubmitting(true);
    try {
      await addReviewFn({ data: { productId: productId!, rating, comment: comment || undefined } });
      toast.success("Review published");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish review");
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggleWish() {
    if (!loggedIn) {
      toast.info("Sign in to save favorites");
      navigate({ to: "/auth" });
      return;
    }
    try {
      const res = await toggleWishFn({ data: { productId: productId! } });
      toast.success(res.wished ? "Added to your wishlist" : "Removed from your wishlist");
      refetchWishlist();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update wishlist");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader store={store} />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/$storeSlug" params={{ storeSlug: store.slug }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {store.name}
        </Link>

        <div className="mt-8 rounded-3xl border border-border bg-card p-8 sm:p-12 glow-border-hover transition-all">
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <button
              onClick={onToggleWish}
              aria-label="Toggle wishlist"
              className="rounded-full border border-border bg-background p-2.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className={`h-5 w-5 ${wished.has(String(product.id)) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={avgRating} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
          {product.description && <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>}

          <div className="mt-8 flex items-end justify-between border-t border-border pt-8">
            <div>
              <p className="text-sm text-muted-foreground">
                {product.billing_interval ? "Subscription" : "Price"}
              </p>
              <p className="text-3xl font-bold text-primary">
                ${Number(product.price).toFixed(2)} {product.currency}
                {product.billing_interval ? (
                  <span className="text-base font-medium text-muted-foreground">
                    /{product.billing_interval === "year" ? "year" : "month"}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  add(cartItem);
                  toast.success(`${product.name} added to cart`);
                }}
              >
                Add to cart
              </Button>
              <Button
                size="lg"
                className="bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  add(cartItem);
                  navigate({ to: "/checkout" });
                }}
              >
                {product.billing_interval ? "Subscribe" : "Buy now"}
              </Button>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {product.billing_interval
              ? "Recurring billing. Cancel anytime from your purchases page."
              : "Instant digital delivery after payment."}
          </p>
        </div>

        {/* Reviews */}
        <section className="mt-10 rounded-3xl border border-border bg-card p-8 sm:p-10">
          <h2 className="text-xl font-bold text-foreground">Customer reviews</h2>

          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <ul className="mt-6 space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Stars rating={r.rating} className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium text-foreground">{r.author}</span>
                    {r.verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <BadgeCheck className="h-3 w-3" />
                        Verified purchase
                      </span>
                    )}
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-border p-5">
            <p className="text-sm font-semibold text-foreground">Write a review</p>
            <div className="mt-3">
              <StarsInput value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="What did you think of this product? (optional)"
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <Button className="mt-3" onClick={onSubmitReview} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish review"}
            </Button>
          </div>
        </section>

        {/* Recommendations */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">Customers also bought</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={String(p.id)}
                  to="/$storeSlug/$productSlug"
                  params={{ storeSlug: store.slug, productSlug: String(p.slug) }}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all card-hover-lift glow-border-hover hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">{String(p.name)}</p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    ${Number(p.price).toFixed(2)} {String(p.currency)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
