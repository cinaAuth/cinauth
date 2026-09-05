import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getStoreProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { storeId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: store, error: storeError } = await context.supabase
      .from("stores")
      .select("id, user_id")
      .eq("id", data.storeId)
      .single();

    if (storeError || !store) throw new Error("Store not found");
    if (store.user_id !== context.userId) throw new Error("Forbidden");

    const { data: products, error } = await context.supabase
      .from("products")
      .select("*")
      .eq("store_id", data.storeId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { products: products ?? [] };
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: {
    storeId: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency?: string;
    fileUrl?: string;
    productType?: string;
    billingInterval?: "month" | "year" | null;
  }) => data)
  .handler(async ({ data, context }) => {
    const { data: store, error: storeError } = await context.supabase
      .from("stores")
      .select("id, user_id")
      .eq("id", data.storeId)
      .single();

    if (storeError || !store) throw new Error("Store not found");
    if (store.user_id !== context.userId) throw new Error("Forbidden");

    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (!slug || slug.length < 2) throw new Error("Invalid product slug");

    const { data: existing } = await context.supabase
      .from("products")
      .select("id")
      .eq("store_id", data.storeId)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) throw new Error("Product slug already exists in this store");

    const billingInterval =
      data.billingInterval === "month" || data.billingInterval === "year" ? data.billingInterval : null;

    const { data: product, error } = await context.supabase
      .from("products")
      .insert({
        store_id: data.storeId,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() ?? null,
        price: data.price,
        currency: (data.currency ?? "USD").toUpperCase(),
        file_url: data.fileUrl?.trim() ?? null,
        product_type: data.productType ?? "download",
        billing_interval: billingInterval,
      } as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { product };
  });

export const getFeaturedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("get_public_products", {
      result_limit: 6,
    });
    if (error) throw new Error("Unable to load products");
    const products = (data ?? []).map((product) => ({
      ...product,
      stores: { name: product.store_name, slug: product.store_slug_result },
    }));
    return { products };
  });

export const getPublicStore = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, name, slug, description, logo_url, is_active")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .single();

    if (error || !store) throw new Error("Store not found");

    const { data: products, error: productsError } = await supabaseAdmin.rpc("get_public_products", {
      store_slug: data.slug,
      result_limit: 100,
    });
    if (productsError) throw new Error("Unable to load products");

    return { store, products: products ?? [] };
  });

export const getPublicProduct = createServerFn({ method: "GET" })
  .validator((data: { storeSlug: string; productSlug: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, name, slug, description, logo_url, is_active")
      .eq("slug", data.storeSlug)
      .eq("is_active", true)
      .single();

    if (error || !store) throw new Error("Store not found");

    const { data: products, error: productError } = await supabaseAdmin.rpc("get_public_products", {
      store_slug: data.storeSlug,
      product_slug: data.productSlug,
      result_limit: 1,
    });
    const product = products?.[0];

    if (productError || !product) throw new Error("Product not found");
    return { store, product };
  });
