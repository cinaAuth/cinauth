import { createFileRoute, Outlet, useRouteContext } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getMyRoles } from "@/lib/admin.functions";
import { getMyStore } from "@/lib/stores.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const getMyRolesFn = useServerFn(getMyRoles);
  const { data: roleData } = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRolesFn() });
  const getMyStoreFn = useServerFn(getMyStore);
  const { data: storeData } = useQuery({ queryKey: ["my-store"], queryFn: () => getMyStoreFn() });

  return (
    <SidebarProvider>
      <div className="cyber-grid relative flex min-h-screen w-full bg-background text-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.72 0.19 55 / 10%), transparent 70%)" }}
        />
        <DashboardSidebar
          isAdmin={Boolean(roleData?.isAdmin)}
          store={storeData?.store ? { name: storeData.store.name, slug: storeData.store.slug } : null}
          user={user ? { email: user.email ?? "—", name: storeData?.ownerName ?? null } : null}
          onSignOut={() => supabase.auth.signOut()}
        />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center border-b border-primary/20 bg-background/80 px-3 backdrop-blur-md">
            <SidebarTrigger />
            <span className="ml-3 font-display text-[10px] uppercase tracking-[0.3em] text-primary/70">CINAAUTH // CONTROL_PANEL</span>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
