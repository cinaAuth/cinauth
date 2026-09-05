import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return { roles, isAdmin: roles.includes("admin"), isStaff: roles.includes("admin") || roles.includes("moderator") };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const [{ data: stores }, { data: products }, { data: orders }, { data: subs }, { data: roles }] =
      await Promise.all([
        context.supabase.from("stores").select("id, name, slug, is_active, created_at").order("created_at", { ascending: false }),
        context.supabase.from("products").select("id, name, price, currency, is_active, store_id"),
        context.supabase
          .from("orders")
          .select("id, order_number, buyer_email, total, currency, status, platform_fee, seller_earnings, created_at, store_id")
          .order("created_at", { ascending: false })
          .limit(50),
        context.supabase.from("subscriptions").select("id, status"),
        context.supabase.from("user_roles").select("user_id, role, created_at").order("created_at", { ascending: false }),
      ]);

    const allOrders = orders ?? [];
    const paid = allOrders.filter((o: { status: string }) => o.status === "paid");
    const storeNames = new Map((stores ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

    return {
      stats: {
        stores: (stores ?? []).length,
        products: (products ?? []).length,
        paidOrders: paid.length,
        revenue: paid.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0),
        platformFees: paid.reduce((sum: number, o: { platform_fee: number }) => sum + Number(o.platform_fee), 0),
        activeSubscriptions: (subs ?? []).filter((s: { status: string }) => s.status === "active" || s.status === "trialing").length,
      },
      stores: (stores ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.is_active,
        products: (products ?? []).filter((p: { store_id: string }) => p.store_id === s.id).length,
      })),
      orders: allOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        buyerEmail: o.buyer_email,
        total: Number(o.total),
        currency: o.currency,
        status: o.status,
        platformFee: Number(o.platform_fee),
        createdAt: o.created_at,
        storeName: storeNames.get(o.store_id) ?? "—",
      })),
      staff: (roles ?? []).filter((r: { role: string }) => r.role !== "user"),
    };
  });

export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum(["admin", "moderator"]),
        action: z.enum(["grant", "revoke"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) return { error: "Could not look up accounts" };

    const target = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!target) return { error: "No account found with that email" };

    if (data.action === "revoke") {
      if (target.id === context.userId && data.role === "admin") {
        return { error: "You cannot remove your own admin access" };
      }
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", target.id).eq("role", data.role);
      if (error) return { error: error.message };
      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: data.role }, { onConflict: "user_id,role" });
    if (error) return { error: error.message };
    return { success: true };
  });
