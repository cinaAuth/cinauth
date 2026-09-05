import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    );
  }
  return _supabase;
}

async function markOrderPaid(session: any) {
  const orderId = session?.metadata?.orderId;
  const supabase = getSupabase();
  const patch = {
    status: "paid",
    delivered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let targetOrderId: string | null = orderId ?? null;
  if (orderId) {
    await supabase.from("orders").update(patch).eq("id", orderId);
  } else if (session?.id) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    targetOrderId = (order as { id?: string } | null)?.id ?? null;
    if (targetOrderId) await supabase.from("orders").update(patch).eq("id", targetOrderId);
  }

  if (targetOrderId) {
    const { notifySale } = await import("@/lib/checkout.functions");
    await notifySale(supabase, targetOrderId);
  }
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const supabase = getSupabase();
  const metadata = subscription?.metadata ?? {};
  const orderId = metadata.orderId ?? null;

  let buyerEmail: string | null = null;
  let storeId: string | null = null;
  if (orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("buyer_email, store_id")
      .eq("id", orderId)
      .maybeSingle();
    buyerEmail = (order as { buyer_email?: string } | null)?.buyer_email ?? null;
    storeId = (order as { store_id?: string } | null)?.store_id ?? null;
  }

  // Platform plan (a seller subscribing to cinaAuth itself): resolve the
  // seller's own store and email instead of an order.
  if (!orderId && metadata.platformPlan === "true" && metadata.userId) {
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", metadata.userId)
      .maybeSingle();
    storeId = (store as { id?: string } | null)?.id ?? null;
    const { data: authUser } = await (supabase as any).auth.admin.getUserById(metadata.userId);
    buyerEmail = authUser?.user?.email ?? null;
  }

  const item = subscription?.items?.data?.[0];
  const periodStart = item?.current_period_start ?? subscription?.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription?.current_period_end;
  const priceId =
    item?.price?.lookup_key ??
    item?.price?.metadata?.lovable_external_id ??
    metadata.planPriceId ??
    item?.price?.id ??
    "unknown";

  if (!storeId || !buyerEmail) return;

  await (supabase as any).from("subscriptions").upsert(
    {
      user_id: metadata.userId ?? null,
      buyer_email: buyerEmail,
      store_id: storeId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: item?.price?.product ?? "unknown",
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function markOrderFailed(session: any) {
  const orderId = session?.metadata?.orderId;
  if (!orderId) return;
  await getSupabase()
    .from("orders")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", orderId);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status !== "unpaid") await markOrderPaid(session);
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await markOrderPaid(event.data.object);
      break;
    case "checkout.session.async_payment_failed":
      await markOrderFailed(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscription(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await (getSupabase() as any)
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", event.data.object?.id)
        .eq("environment", env);
      break;
    default:
      console.log("Unhandled payments event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
