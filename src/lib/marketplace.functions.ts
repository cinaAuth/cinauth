import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type RatingRow = { product_id: string; rating: number };

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  product_type: string;
  billing_interval: string | null;
  category_id: string | null;
  rating_avg: number | null;
  rating_count: number;
};

function summarizeRatings(rows: RatingRow[]) {
  const map = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const entry = map.get(r.product_id) ?? { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    map.set(r.product_id, entry);
  }
  return map;
}

// Public catalog: search + category filter + ratings
export const getStoreCatalog = createServerFn({ method: "GET" })
  .validator((data: { storeSlug: string; search?: string | undefined; categorySlug?: string | undefined }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, name, slug, description, logo_url, is_active")
      .eq("slug", data.storeSlug)
      .eq("is_active", true)
      .single();
    if (error || !store) throw new Error("Store not found");

    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug")
      .eq("store_id", store.id)
      .order("name");

    const { data: productsRaw, error: productsError } = await supabaseAdmin.rpc("get_public_products", {
      store_slug: data.storeSlug,
      result_limit: 200,
    });
    if (productsError) throw new Error("Unable to load products");

    let products = (productsRaw ?? []) as unknown as Array<{
      id: string; name: string; slug: string; description: string | null;
      price: number; currency: string; product_type: string;
      billing_interval: string | null; category_id: string | null;
    }>;

    if (data.categorySlug) {
      const cat = (categories ?? []).find((c) => c.slug === data.categorySlug);
      products = cat ? products.filter((p) => p.category_id === cat.id) : products;
    }
    if (data.search?.trim()) {
      const q = data.search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }

    const ids = products.map((p) => p.id);
    let ratings = new Map<string, { sum: number; count: number }>();
    if (ids.length > 0) {
      const { data: reviewRows } = await supabaseAdmin
        .from("reviews")
        .select("product_id, rating")
        .in("product_id", ids);
      ratings = summarizeRatings((reviewRows ?? []) as RatingRow[]);
    }

    const enriched: CatalogProduct[] = products.map((p) => {
      const r = ratings.get(p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        price: Number(p.price),
        currency: p.currency,
        product_type: p.product_type,
        billing_interval: p.billing_interval ?? null,
        category_id: p.category_id ?? null,
        rating_avg: r ? Math.round((r.sum / r.count) * 10) / 10 : null,
        rating_count: r?.count ?? 0,
      };
    });

    return { store, categories: categories ?? [], products: enriched };
  });

// Reviews for one product (public)
export const getProductReviews = createServerFn({ method: "GET" })
  .validator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, verified_purchase, created_at, user_id")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    // Attach reviewer first names from profiles
    const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
    let names = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, name")
        .in("id", userIds);
      names = new Map((profiles ?? []).map((p) => [p.id as string, (p.name as string) ?? "Customer"]));
    }

    return {
      reviews: (reviews ?? []).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        verified_purchase: r.verified_purchase,
        created_at: r.created_at,
        author: names.get(r.user_id) ?? "Customer",
      })),
    };
  });

// Add or update my review (auth). verified_purchase computed from real orders.
export const addReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { productId: string; rating: number; comment?: string | undefined }) => data)
  .handler(async ({ data, context }) => {
    const rating = Math.round(data.rating);
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

    const { data: product, error: productError } = await context.supabase
      .from("products")
      .select("id, store_id")
      .eq("id", data.productId)
      .single();
    if (productError || !product) throw new Error("Product not found");

    // Verified purchase: completed order by this user containing the product
    const { data: orders } = await context.supabase
      .from("orders")
      .select("id")
      .eq("buyer_user_id", context.userId)
      .eq("status", "completed");
    const orderIds = (orders ?? []).map((o) => o.id);
    let verified = false;
    if (orderIds.length > 0) {
      const { data: items } = await context.supabase
        .from("order_items")
        .select("id")
        .in("order_id", orderIds)
        .eq("product_id", data.productId)
        .limit(1);
      verified = (items ?? []).length > 0;
    }

    const { data: review, error } = await context.supabase
      .from("reviews")
      .upsert(
        {
          product_id: data.productId,
          store_id: product.store_id,
          user_id: context.userId,
          rating,
          comment: data.comment?.trim() || null,
          verified_purchase: verified,
        },
        { onConflict: "product_id,user_id" }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { review };
  });

// Related products: same store, prefer same category, ordered by sales
export const getRelatedProducts = createServerFn({ method: "GET" })
  .validator((data: { storeSlug: string; productId: string; categoryId?: string | null | undefined }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: productsRaw } = await supabaseAdmin.rpc("get_public_products", {
      store_slug: data.storeSlug,
      result_limit: 100,
    });
    type Row = {
      id: string; name: string; slug: string; price: number | string;
      currency: string; category_id: string | null;
    };
    const products = ((productsRaw ?? []) as unknown as Row[]).filter((p) => p.id !== data.productId);

    // Sales counts
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_id, quantity");
    const sales = new Map<string, number>();
    for (const it of (items ?? []) as { product_id: string; quantity: number }[]) {
      sales.set(it.product_id, (sales.get(it.product_id) ?? 0) + (it.quantity ?? 1));
    }

    products.sort((a, b) => {
      const aCat = data.categoryId && a.category_id === data.categoryId ? 1 : 0;
      const bCat = data.categoryId && b.category_id === data.categoryId ? 1 : 0;
      if (aCat !== bCat) return bCat - aCat;
      return (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0);
    });

    return {
      products: products.slice(0, 4).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        currency: p.currency,
        category_id: p.category_id ?? null,
      })),
    };
  });

// Wishlist
export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { productId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", context.userId)
      .eq("product_id", data.productId)
      .maybeSingle();

    if (existing) {
      await context.supabase.from("wishlists").delete().eq("id", existing.id);
      return { wished: false };
    }
    const { error } = await context.supabase
      .from("wishlists")
      .insert({ user_id: context.userId, product_id: data.productId });
    if (error) throw new Error(error.message);
    return { wished: true };
  });

export const getMyWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { productIds: (data ?? []).map((w) => w.product_id as string) };
  });
