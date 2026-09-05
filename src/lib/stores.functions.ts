import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyStore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("stores")
      .select("*")
      .eq("user_id", context.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("name")
      .eq("id", context.userId)
      .maybeSingle();

    return { store: data ?? null, ownerName: profile?.name ?? null };
  });

export const createStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { name: string; slug: string; description?: string }) => data)
  .handler(async ({ data, context }) => {
    const base = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (!base || base.length < 2) throw new Error("Invalid store slug");

    // If this user already has a store, return it instead of failing.
    const { data: own } = await context.supabase
      .from("stores")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (own) return { store: own };

    // Find a free slug (append -2, -3, ... when taken).
    let slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: existing } = await context.supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${i}`;
    }


    const { data: store, error } = await context.supabase
      .from("stores")
      .insert({
        user_id: context.userId,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { store };
  });
