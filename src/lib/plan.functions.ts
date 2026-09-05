import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

export const PLAN_PRICE_IDS = [
  "cinaauth_signal_monthly",
  "cinaauth_signal_yearly",
  "cinaauth_empire_monthly",
  "cinaauth_empire_yearly",
] as const;

export type PlanPriceId = (typeof PLAN_PRICE_IDS)[number];

type CheckoutResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");

  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length && found.data[0]) return found.data[0].id;

  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }

  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createPlanCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!PLAN_PRICE_IDS.includes(data.priceId as PlanPriceId)) throw new Error("Unknown plan price");
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const { data: userData } = await context.supabase.auth.getUser();
      const email = userData.user?.email ?? undefined;

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId], limit: 1 });
      const price = prices.data[0];
      if (!price) throw new Error("Plan price not found");

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId: context.userId });

      const metadata = {
        userId: context.userId,
        platformPlan: "true",
        planPriceId: data.priceId,
      };

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: `${data.returnUrl.replace(/\/$/, "")}/panel/storefront/subscription-plan?checkout=success`,
        customer: customerId,
        line_items: [{ price: price.id, quantity: 1 }],
        subscription_data: { metadata },
        metadata,
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("subscriptions")
      .select("price_id, status, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .in("price_id", PLAN_PRICE_IDS as unknown as string[])
      .order("created_at", { ascending: false })
      .limit(1);

    const row = rows?.[0] ?? null;
    if (!row) return { plan: null };
    return {
      plan: {
        priceId: row.price_id,
        status: row.status,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
      },
    };
  });
