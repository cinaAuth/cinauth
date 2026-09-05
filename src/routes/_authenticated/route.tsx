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
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <DashboardSidebar
          isAdmin={Boolean(roleData?.isAdmin)}
          store={storeData?.store ? { name: storeData.store.name, slug: storeData.store.slug } : null}
          user={user ? { email: user.email ?? "—" } : null}
          onSignOut={() => supabase.auth.signOut()}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border/50 bg-background/80 px-3 backdrop-blur-md">
            <SidebarTrigger />
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
