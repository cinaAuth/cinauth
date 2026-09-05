import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_SETTINGS, defaultBlocks, type StorefrontBlock, type StorefrontSettings } from "./storefront";

export const getMyStorefront = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: store, error } = await context.supabase
      .from("stores")
      .select("id, name, slug, description")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!store) return { store: null, blocks: [] as StorefrontBlock[], settings: DEFAULT_SETTINGS };

    const { data: layout } = await context.supabase
      .from("store_storefront")
      .select("blocks, settings")
      .eq("store_id", store.id)
      .maybeSingle();

    const blocks = (layout?.blocks as StorefrontBlock[] | undefined) ?? defaultBlocks(store.name, store.description);
    const settings = { ...DEFAULT_SETTINGS, ...((layout?.settings as Partial<StorefrontSettings>) ?? {}) };
    return { store, blocks, settings };
  });

export const saveMyStorefront = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { blocks: StorefrontBlock[]; settings: StorefrontSettings }) => data)
  .handler(async ({ data, context }) => {
    const { data: store, error } = await context.supabase
      .from("stores")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!store) throw new Error("Create your store first");

    const { error: saveError } = await context.supabase
      .from("store_storefront")
      .upsert(
        {
          store_id: store.id,
          blocks: data.blocks as unknown as any,
          settings: data.settings as unknown as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id" },
      );
    if (saveError) throw new Error(saveError.message);
    return { ok: true };
  });

export const getPublicStorefront = createServerFn({ method: "GET" })
  .validator((data: { storeSlug: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("id, name, description")
      .eq("slug", data.storeSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (!store) return { blocks: [] as StorefrontBlock[], settings: DEFAULT_SETTINGS };

    const { data: layout } = await supabaseAdmin
      .from("store_storefront")
      .select("blocks, settings")
      .eq("store_id", store.id)
      .maybeSingle();

    const blocks = (layout?.blocks as StorefrontBlock[] | undefined) ?? defaultBlocks(store.name, store.description);
    const settings = { ...DEFAULT_SETTINGS, ...((layout?.settings as Partial<StorefrontSettings>) ?? {}) };
    return { blocks, settings };
  });
