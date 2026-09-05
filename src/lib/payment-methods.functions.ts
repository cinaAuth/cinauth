import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getOwnStore(context: any) {
  const { data, error } = await context.supabase
    .from("stores")
    .select("id, name, slug")
    .eq("user_id", context.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export const listPaymentMethods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const store = await getOwnStore(context);
    if (!store) return { store: null, methods: [] as { method_key: string; enabled: boolean; config: Record<string, string> }[] };

    const { data, error } = await context.supabase
      .from("store_payment_methods")
      .select("method_key, enabled, config")
      .eq("store_id", store.id);
    if (error) throw new Error(error.message);

    return { store, methods: data ?? [] };
  });

export const setPaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { methodKey: string; enabled: boolean; config?: Record<string, string> }) => data)
  .handler(async ({ data, context }) => {
    const store = await getOwnStore(context);
    if (!store) throw new Error("Create your store first");

    const { error } = await context.supabase
      .from("store_payment_methods")
      .upsert(
        {
          store_id: store.id,
          method_key: data.methodKey,
          enabled: data.enabled,
          ...(data.config ? { config: data.config } : {}),
        },
        { onConflict: "store_id,method_key" },
      );
    if (error) throw new Error(error.message);

    return { ok: true };
  });
