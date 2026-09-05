import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getAdminOverview, getMyRoles, setStaffRole } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Staff console — cinaAuth" },
      { name: "description", content: "Platform-wide overview of stores, orders, revenue and staff access on cinaAuth." },
      { property: "og:title", content: "Staff console — cinaAuth" },
      { property: "og:description", content: "Platform-wide overview of stores, orders, revenue and staff access on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const getMyRolesFn = useServerFn(getMyRoles);
  const getAdminOverviewFn = useServerFn(getAdminOverview);
  const setStaffRoleFn = useServerFn(setStaffRole);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("moderator");
  const [saving, setSaving] = useState(false);

  const { data: roleData, isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => getMyRolesFn(),
  });

  const isAdmin = roleData?.isAdmin ?? false;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverviewFn(),
    enabled: isAdmin,
  });

  async function submit(action: "grant" | "revoke") {
    if (!email.trim()) return;
    setSaving(true);
    try {
      const result = await setStaffRoleFn({ data: { email: email.trim(), role, action } });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(action === "grant" ? "Staff access granted" : "Staff access removed");
        setEmail("");
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            cinaAuth
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Staff console</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Platform-wide view of every store, order and staff member.</p>

        {rolesLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !isAdmin ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">This area is restricted to platform staff.</p>
            <Link to="/dashboard" className="mt-6 inline-block">
              <Button>Back to dashboard</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Stores", value: data?.stats.stores ?? 0 },
                { label: "Products", value: data?.stats.products ?? 0 },
                { label: "Paid orders", value: data?.stats.paidOrders ?? 0 },
                { label: "Subscriptions", value: data?.stats.activeSubscriptions ?? 0 },
                { label: "Gross revenue", value: `$${(data?.stats.revenue ?? 0).toFixed(2)}` },
                { label: "Platform fees", value: `$${(data?.stats.platformFees ?? 0).toFixed(2)}` },
              ].map((s) => (
                <Card key={s.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-10">
              <CardHeader>
                <CardTitle>Staff access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="email"
                    placeholder="person@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "admin" | "moderator")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button onClick={() => submit("grant")} disabled={saving}>
                    Grant
                  </Button>
                  <Button variant="outline" onClick={() => submit("revoke")} disabled={saving}>
                    Remove
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {data?.staff.length ?? 0} staff member(s) with elevated access.
                </p>
              </CardContent>
            </Card>

            <h2 className="mt-10 text-xl font-semibold">Stores</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3 text-right">Products</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.stores ?? []).map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">/{s.slug}</td>
                      <td className="px-4 py-3 text-right">{s.products}</td>
                      <td className="px-4 py-3">{s.isActive ? "Active" : "Hidden"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 text-xl font-semibold">Latest orders</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.orders ?? []).map((o) => (
                    <tr key={o.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.storeName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.buyerEmail}</td>
                      <td className="px-4 py-3">{o.status}</td>
                      <td className="px-4 py-3 text-right font-semibold">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-primary">${o.platformFee.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
