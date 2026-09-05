import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/cinaauth-logo-badge.png.asset.json";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Home,
  Layers,
  ShoppingBag,
  Users,
  Megaphone,
  Wallet,
  Store,
  Settings,
  Shield,
  Terminal,
  User,
  ChevronDown,
  ShieldCheck,
  LogOut,
} from "lucide-react";

type Item = { title: string; url: string };
type Group = { title: string; icon: typeof Home; items: Item[] };

const groups: Group[] = [
  {
    title: "Catalog",
    icon: Layers,
    items: [
      { title: "Products", url: "/products" },
      { title: "Addons", url: "/panel/catalog/addons" },
      { title: "Groups", url: "/panel/catalog/groups" },
      { title: "Categories", url: "/panel/catalog/categories" },
      { title: "Shipping Zones", url: "/panel/catalog/shipping-zones" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingBag,
    items: [
      { title: "Invoices", url: "/sales" },
      { title: "Subscriptions", url: "/panel/sales/subscriptions" },
      { title: "Abandoned Checkouts", url: "/panel/sales/abandoned-checkouts" },
    ],
  },
  {
    title: "Audience",
    icon: Users,
    items: [
      { title: "Customers", url: "/panel/audience/customers" },
      { title: "Resellers", url: "/panel/audience/resellers" },
      { title: "Affiliates", url: "/panel/audience/affiliates" },
      { title: "Feedbacks", url: "/panel/audience/feedbacks" },
      { title: "Tickets", url: "/panel/audience/tickets" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Coupons", url: "/panel/marketing/coupons" },
      { title: "Quantity Deals", url: "/panel/marketing/quantity-deals" },
      { title: "Bundle Offers", url: "/panel/marketing/bundle-offers" },
      { title: "Email Marketing", url: "/panel/marketing/email" },
      { title: "Blog", url: "/panel/marketing/blog" },
    ],
  },
  {
    title: "Wallets",
    icon: Wallet,
    items: [{ title: "Crypto", url: "/panel/wallets/crypto" }],
  },
  {
    title: "Storefront",
    icon: Store,
    items: [
      { title: "Configure", url: "/panel/storefront/configure" },
      { title: "Themes", url: "/panel/storefront/themes" },
      { title: "Visual Editor", url: "/panel/storefront/visual-editor" },
      { title: "Code Editor", url: "/panel/storefront/code-editor" },
      { title: "Custom Pages", url: "/panel/storefront/custom-pages" },
      { title: "Checkout", url: "/panel/storefront/checkout" },
      { title: "Email Settings", url: "/panel/storefront/email-settings" },
      { title: "Images", url: "/panel/storefront/images" },
      { title: "Files", url: "/panel/storefront/files" },
      { title: "Push Notifications", url: "/panel/storefront/push-notifications" },
      { title: "Subscription Plan", url: "/panel/storefront/subscription-plan" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Payment Methods", url: "/panel/settings/payment-methods" },
      { title: "Team", url: "/panel/settings/team" },
      { title: "Domains", url: "/panel/settings/domains" },
      { title: "Activity Logs", url: "/panel/settings/activity-logs" },
    ],
  },
  {
    title: "Anti-Fraud",
    icon: Shield,
    items: [
      { title: "Blacklist", url: "/panel/anti-fraud/blacklist" },
      { title: "Whitelist", url: "/panel/anti-fraud/whitelist" },
      { title: "Fraud Logs", url: "/panel/anti-fraud/fraud-logs" },
    ],
  },
  {
    title: "Developers",
    icon: Terminal,
    items: [
      { title: "API Keys", url: "/panel/developers/api-keys" },
      { title: "Embeds", url: "/panel/developers/embeds" },
      { title: "Webhook Logs", url: "/panel/developers/webhook-logs" },
    ],
  },
  {
    title: "Account",
    icon: User,
    items: [
      { title: "Profile", url: "/panel/account/profile" },
      { title: "Invites", url: "/panel/account/invites" },
      { title: "Referrals", url: "/panel/account/referrals" },
      { title: "My purchases", url: "/purchases" },
    ],
  },
];

export function DashboardSidebar({
  isAdmin = false,
  store,
  user,
  onSignOut,
}: {
  isAdmin?: boolean;
  store?: { name: string; slug: string } | null;
  user?: { email: string; name?: string | null } | null;
  onSignOut?: () => void;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="cinaAuth" className="h-12 w-auto" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="mb-1 flex items-center justify-between px-2 py-2">
                  {store ? (
                    <>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                          <Store className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold uppercase tracking-wider text-sidebar-foreground">{store.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{store.slug}.cinaauth.com</p>
                        </div>
                      </div>
                      <Link to="/$storeSlug" params={{ storeSlug: store.slug }}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-sidebar-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/onboarding" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Store className="h-4 w-4" />
                      Create your store
                    </Link>
                  )}
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem className="px-2 pb-1">
                <div className="h-px bg-sidebar-border" />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link to="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {groups.map((group) => {
                const open = group.items.some((i) => pathname === i.url);
                return (
                  <Collapsible key={group.title} defaultOpen={open} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <group.icon className="h-4 w-4" />
                          <span>{group.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                                <Link to={item.url}>{item.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Staff console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "Profile"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-sidebar-foreground"
            onClick={onSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Terms of Service · Acceptable Use</p>
      </SidebarFooter>
    </Sidebar>
  );
}
