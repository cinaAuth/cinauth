import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

export const PLATFORM_FEE_RATE = 0.05;

type CheckoutInput = {
  storeSlug: string;
  buyerEmail: string;
  buyerUserId?: string;
  items: { productId: string; quantity: number }[];
  returnUrl: string;
  environment: StripeEnv;
};

type CheckoutResult =
  | { clientSecret: string; orderNumber: string }
  | { error: string };

function orderNumberFromUuid(id: string): string {
  return id.replace(/-/g, "").slice(0, 10).toUpperCase();
}

export const createCartCheckout = createServerFn({ method: "POST" })
  .validator((data: CheckoutInput) => {
    if (!data.items?.length) throw new Error("Cart is empty");
    if (data.items.length > 20) throw new Error("Too many items");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.buyerEmail ?? "")) throw new Error("Invalid email");
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("id, name, slug")
      .eq("slug", data.storeSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (!store) return { error: "Store not found" };

    const ids = data.items.map((i) => i.productId);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, price, currency, store_id, is_active, billing_interval")
      .in("id", ids)
      .eq("store_id", store.id)
      .eq("is_active", true);

    if (!products?.length || products.length !== ids.length) {
      return { error: "Some products are no longer available" };
    }

    const currency = (products[0]!.currency ?? "USD").toLowerCase();
    const lines = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const quantity = Math.max(1, Math.min(99, Math.floor(item.quantity)));
      return { product, quantity, amount: Math.round(Number(product.price) * 100) };
    });

    const subscriptionLine = lines.find((l) => (l.product as { billing_interval?: string | null }).billing_interval);
    if (subscriptionLine && lines.length > 1) {
      return { error: "Subscription products must be purchased on their own" };
    }

    const total = lines.reduce((sum, l) => sum + (l.amount * l.quantity) / 100, 0);
    if (total <= 0) return { error: "Invalid cart total" };

    const platformFee = Math.round(total * PLATFORM_FEE_RATE * 100) / 100;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        store_id: store.id,
        buyer_email: data.buyerEmail.trim().toLowerCase(),
        buyer_user_id: data.buyerUserId ?? null,
        total,
        currency: currency.toUpperCase(),
        status: "pending",
        platform_fee: platformFee,
        seller_earnings: Math.round((total - platformFee) * 100) / 100,
        environment: data.environment,
      })
      .select("id")
      .single();

    if (orderError || !order) return { error: orderError?.message ?? "Could not create order" };

    const orderNumber = orderNumberFromUuid(order.id as string);
    await supabaseAdmin.from("orders").update({ order_number: orderNumber }).eq("id", order.id);

    await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        price: Number(l.product.price),
        quantity: l.quantity,
      })),
    );

    try {
      const stripe = createStripeClient(data.environment);
      const isSubscription = Boolean(subscriptionLine);
      const metadata = {
        orderId: order.id as string,
        orderNumber,
        storeSlug: store.slug as string,
        ...(data.buyerUserId && { userId: data.buyerUserId }),
      };
      // Card (incl. Apple Pay / Google Pay) plus wallets and local methods
      // supported by the account. Stripe rejects methods that aren't active,
      // so we retry with a smaller list and finally with automatic selection.
      const extraMethods: string[] = ["card", "link", "paypal"];
      if (!isSubscription) extraMethods.push("amazon_pay");
      if (currency === "eur") {
        extraMethods.push("klarna", "sepa_debit");
        if (!isSubscription) {
          extraMethods.push("bizum", "ideal", "bancontact", "p24", "eps", "multibanco", "alipay", "wechat_pay");
        }
      }
      if (currency === "usd" && !isSubscription) {
        extraMethods.push("alipay");
      }
      if (currency === "gbp" && !isSubscription) {
        extraMethods.push("klarna");
      }




      const baseParams = {
        mode: isSubscription ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: `${data.returnUrl.replace(/\/$/, "")}/orders/${orderNumber}`,
        customer_email: data.buyerEmail.trim().toLowerCase(),
        line_items: lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency,
            unit_amount: l.amount,
            product_data: { name: l.product.name },
            ...(isSubscription && {
              recurring: {
                interval: (((l.product as { billing_interval?: string | null }).billing_interval) ?? "month") as "month" | "year",
              },
            }),
          },
        })),
        ...(isSubscription
          ? { subscription_data: { metadata } }
          : {
              payment_intent_data: {
                description: `${store.name} — order ${orderNumber}`,
              },
            }),
        ...(extraMethods.includes("wechat_pay") && {
          payment_method_options: { wechat_pay: { client: "web" } },
        }),
        metadata,
      } as any;

      let session;
      const attempts = [extraMethods, ["card", "link", "paypal"], null];
      let lastError: unknown;
      for (const methods of attempts) {
        try {
          session = await stripe.checkout.sessions.create(
            methods ? { ...baseParams, payment_method_types: methods } : baseParams,
          );
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!session) throw lastError;

      await supabaseAdmin
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id);

      return { clientSecret: session.client_secret ?? "", orderNumber };
    } catch (error) {
      await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return { error: getStripeErrorMessage(error) };
    }
  });

export const getOrderByNumber = createServerFn({ method: "GET" })
  .validator((data: { orderNumber: string }) => {
    if (!/^[A-Za-z0-9]{6,32}$/.test(data.orderNumber ?? "")) throw new Error("Invalid order number");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, buyer_email, total, currency, status, created_at, delivered_at, store_id")
      .eq("order_number", data.orderNumber.toUpperCase())
      .maybeSingle();

    if (!order) return { order: null as null, items: [], store: null as null };

    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("name, slug")
      .eq("id", order.store_id)
      .maybeSingle();

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("id, price, quantity, products(name, slug, product_type, file_url, delivery_content)")
      .eq("order_id", order.id);

    const paid = order.status === "paid";
    const cleanedItems = (items ?? []).map((item: any) => ({
      id: item.id as string,
      price: Number(item.price),
      quantity: item.quantity as number,
      name: item.products?.name ?? "Product",
      slug: item.products?.slug ?? "",
      productType: item.products?.product_type ?? "download",
      fileUrl: paid ? (item.products?.file_url ?? null) : null,
      deliveryContent: paid ? (item.products?.delivery_content ?? null) : null,
    }));

    return {
      order: {
        orderNumber: order.order_number as string,
        buyerEmail: (order.buyer_email as string).replace(/^(.{2}).*(@.*)$/, "$1***$2"),
        total: Number(order.total),
        currency: order.currency as string,
        status: order.status as string,
        createdAt: order.created_at as string,
        deliveredAt: order.delivered_at as string | null,
      },
      store,
      items: cleanedItems,
    };
  });

export const getStoreSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { storeId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: store } = await context.supabase
      .from("stores")
      .select("id, user_id, name")
      .eq("id", data.storeId)
      .maybeSingle();

    if (!store) throw new Error("Store not found");
    if (store.user_id !== context.userId) throw new Error("Forbidden");

    const { data: orders, error } = await context.supabase
      .from("orders")
      .select("id, order_number, buyer_email, total, currency, status, created_at, seller_earnings, platform_fee, order_items(id, price, quantity, products(name))")
      .eq("store_id", data.storeId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    const rows = (orders ?? []).map((order: any) => ({
      id: order.id as string,
      orderNumber: (order.order_number ?? "") as string,
      buyerEmail: order.buyer_email as string,
      total: Number(order.total),
      currency: order.currency as string,
      status: order.status as string,
      createdAt: order.created_at as string,
      sellerEarnings: Number(order.seller_earnings ?? 0),
      platformFee: Number(order.platform_fee ?? 0),
      products: (order.order_items ?? []).map((item: any) => ({
        name: item.products?.name ?? "Product",
        quantity: item.quantity as number,
        price: Number(item.price),
      })),
    }));

    const paid = rows.filter((r) => r.status === "paid");

    return {
      storeName: store.name as string,
      orders: rows,
      stats: {
        paidCount: paid.length,
        pendingCount: rows.filter((r) => r.status === "pending").length,
        revenue: Math.round(paid.reduce((s, r) => s + r.total, 0) * 100) / 100,
        earnings: Math.round(paid.reduce((s, r) => s + r.sellerEarnings, 0) * 100) / 100,
        currency: rows[0]?.currency ?? "USD",
      },
    };
  });

/**
 * Fallback for the payment webhook: ask the provider directly whether a
 * pending order was paid. Used by the order page while status is pending.
 */
export const syncOrderPayment = createServerFn({ method: "POST" })
  .validator((data: { orderNumber: string; environment: StripeEnv }) => {
    if (!/^[A-Za-z0-9]{6,32}$/.test(data.orderNumber ?? "")) throw new Error("Invalid order number");
    return data;
  })
  .handler(async ({ data }): Promise<{ status: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status, stripe_session_id")
      .eq("order_number", data.orderNumber.toUpperCase())
      .maybeSingle();

    if (!order) return { status: "not_found" };
    if (order.status !== "pending" || !order.stripe_session_id) return { status: order.status as string };

    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id as string);
      if (session.payment_status && session.payment_status !== "unpaid") {
        await supabaseAdmin
          .from("orders")
          .update({ status: "paid", delivered_at: new Date().toISOString() })
          .eq("id", order.id);
        await notifySale(supabaseAdmin, order.id as string);
        return { status: "paid" };
      }
      if (session.status === "expired") {
        await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
        return { status: "failed" };
      }
      return { status: "pending" };
    } catch {
      return { status: "pending" };
    }
  });

/** Notify the store owner about a paid order (idempotent per order). */
export async function notifySale(supabaseAdmin: any, orderId: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, total, currency, store_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const { data: existing } = await supabaseAdmin
    .from("notifications")
    .select("id")
    .eq("order_id", orderId)
    .eq("type", "sale")
    .maybeSingle();
  if (existing) return;

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("user_id")
    .eq("id", order.store_id)
    .maybeSingle();
  if (!store) return;

  await supabaseAdmin.from("notifications").insert({
    store_id: order.store_id,
    user_id: store.user_id,
    order_id: orderId,
    type: "sale",
    title: "New sale",
    message: `Order ${order.order_number ?? ""} — ${order.currency} ${Number(order.total).toFixed(2)}`,
  });
}

/** Customer purchase history for signed-in buyers. */
export const getMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: orders, error } = await context.supabase
      .from("orders")
      .select("id, order_number, total, currency, status, created_at, environment, order_items(id, quantity, products(name, slug)), stores(name, slug)")
      .eq("buyer_user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    return {
      orders: (orders ?? []).map((order: any) => ({
        id: order.id as string,
        orderNumber: (order.order_number ?? "") as string,
        total: Number(order.total),
        currency: order.currency as string,
        status: order.status as string,
        createdAt: order.created_at as string,
        storeName: order.stores?.name ?? "Store",
        storeSlug: order.stores?.slug ?? "",
        products: (order.order_items ?? []).map((item: any) => ({
          name: item.products?.name ?? "Product",
          quantity: item.quantity as number,
        })),
      })),
    };
  });

/** Seller in-app notifications. */
export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("notifications")
      .select("id, title, message, read, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return { notifications: data ?? [] };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await (context.supabase as any)
      .from("notifications")
      .update({ read: true })
      .eq("user_id", context.userId)
      .eq("read", false);
    return { ok: true };
  });

/** Buyer opens the billing portal to manage/cancel a subscription. */
export const createBuyerPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ url?: string; error?: string }> => {
    const { data: sub } = await (context.supabase as any)
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_customer_id) return { error: "No subscription found" };

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Buyer subscription status for the purchases page. */
export const getMySubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data?: { environment?: StripeEnv }) => data ?? {})
  .handler(async ({ data, context }) => {
    const { data: subs, error } = await (context.supabase as any)
      .from("subscriptions")
      .select("id, product_id, status, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", context.userId)
      .eq("environment", data.environment ?? "sandbox")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return { subscriptions: subs ?? [] };
  });

/** Seller subscriptions for a store. */
export const getStoreSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { storeId: string; environment?: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    const { data: store, error: storeError } = await context.supabase
      .from("stores")
      .select("id, user_id, name")
      .eq("id", data.storeId)
      .maybeSingle();

    if (storeError) throw new Error(storeError.message);
    if (!store) throw new Error("Store not found");
    if (store.user_id !== context.userId) throw new Error("Unauthorized");

    const { data: subs, error } = await (context.supabase as any)
      .from("subscriptions")
      .select("id, buyer_email, user_id, product_id, price_id, status, current_period_start, current_period_end, cancel_at_period_end, environment, created_at")
      .eq("store_id", data.storeId)
      .eq("environment", data.environment ?? "sandbox")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    const productIds = Array.from(
      new Set((subs ?? []).map((s: any) => s.product_id).filter(Boolean)),
    ).filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)),
    ) as string[];
    const nameById = new Map<string, string>();
    if (productIds.length) {
      const { data: prods } = await context.supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);
      for (const p of prods ?? []) nameById.set(p.id as string, p.name as string);
    }

    return {
      storeName: store.name as string,
      subscriptions: (subs ?? []).map((sub: any) => ({
        id: sub.id as string,
        buyerEmail: sub.buyer_email as string,
        buyerUserId: sub.user_id as string | null,
        productId: sub.product_id as string,
        productName: nameById.get(sub.product_id) ?? "Product",
        priceId: sub.price_id as string,
        status: sub.status as string,
        currentPeriodStart: sub.current_period_start as string | null,
        currentPeriodEnd: sub.current_period_end as string | null,
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        environment: sub.environment as string,
        createdAt: sub.created_at as string,
      })),
    };
  });
