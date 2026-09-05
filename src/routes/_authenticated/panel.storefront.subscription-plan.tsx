import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyStore } from "@/lib/stores.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, ShieldCheck, Rocket, Globe, Sparkles, CreditCard, Loader2 } from "lucide-react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createPlanCheckout, getMyPlan } from "@/lib/plan.functions";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { planT, type PlanKey } from "@/lib/i18n-plan";

export const Route = createFileRoute("/_authenticated/panel/storefront/subscription-plan")({
  head: () => ({
    meta: [
      { title: "Subscription Plan — cinaAuth" },
      { name: "description", content: "Manage your cinaAuth plan, limits, billing and renewals for this store." },
      { property: "og:title", content: "Subscription Plan — cinaAuth" },
      { property: "og:description", content: "Manage your cinaAuth plan, limits, billing and renewals for this store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionPlanPage,
});

type PlanId = "core" | "signal" | "empire";
type T = (key: PlanKey) => string;

function buildPlans(t: T) {
  return [
    {
      id: "core" as PlanId,
      name: "Core",
      tagline: t("taglineCore"),
      monthly: 0,
      yearly: 0,
      priceIds: { monthly: null as string | null, yearly: null as string | null },
      icon: Zap,
      highlight: false,
      intro: t("introCore"),
      features: [t("fCore1"), t("fCore2"), t("fCore3"), t("fCore4"), t("fCore5"), t("fCore6")],
    },
    {
      id: "signal" as PlanId,
      name: "Signal",
      tagline: t("taglineSignal"),
      monthly: 9.99,
      yearly: 99,
      priceIds: { monthly: "cinaauth_signal_monthly" as string | null, yearly: "cinaauth_signal_yearly" as string | null },
      icon: Rocket,
      highlight: false,
      intro: t("introSignal"),
      features: [
        t("fSignal1"), t("fSignal2"), t("fSignal3"), t("fSignal4"),
        t("fSignal5"), t("fSignal6"), t("fSignal7"), t("fSignal8"),
      ],
    },
    {
      id: "empire" as PlanId,
      name: "Empire",
      tagline: t("taglineEmpire"),
      monthly: 29.99,
      yearly: 299,
      priceIds: { monthly: "cinaauth_empire_monthly" as string | null, yearly: "cinaauth_empire_yearly" as string | null },
      icon: ShieldCheck,
      highlight: true,
      intro: t("introEmpire"),
      features: [
        t("fEmpire1"), t("fEmpire2"), t("fEmpire3"), t("fEmpire4"),
        t("fEmpire5"), t("fEmpire6"), t("fEmpire7"), t("fEmpire8"),
      ],
    },
  ];
}

function buildComparison(t: T) {
  const up = (v: string) => `${t("upTo")} ${v}`;
  return [
    {
      group: t("gStorefront"),
      rows: [
        { label: t("rProducts"), core: up("20"), signal: up("100"), empire: up("500") },
        { label: t("rImages"), core: up("5"), signal: up("50"), empire: up("50") },
        { label: t("rCartItems"), core: up("3"), signal: up("100"), empire: up("100") },
        { label: t("rCustomDomain"), core: false, signal: true, empire: true },
        { label: t("rCustomPages"), core: false, signal: true, empire: true },
        { label: t("rVisualEditor"), core: true, signal: true, empire: true },
        { label: t("rPremiumThemes"), core: false, signal: false, empire: true },
        { label: t("rImageUploads"), core: "5 MB", signal: "30 MB", empire: "50 MB" },
      ],
    },
    {
      group: t("gPayments"),
      rows: [
        { label: t("rManualPay"), core: false, signal: up("10"), empire: up("10") },
        { label: t("rCrypto"), core: false, signal: true, empire: true },
        { label: t("rRecurring"), core: false, signal: true, empire: true },
        { label: t("rAbandoned"), core: false, signal: true, empire: true },
        { label: t("rCoupons"), core: up("50"), signal: up("5,000"), empire: up("50,000") },
        { label: t("rDownloads"), core: "10 · 10 MB", signal: "500 · 100 MB", empire: "500 · 100 MB" },
      ],
    },
    {
      group: t("gSecurity"),
      rows: [
        { label: t("rBlacklist"), core: up("10"), signal: up("500"), empire: up("5,000") },
        { label: t("rDisposable"), core: false, signal: true, empire: true },
        { label: t("rVpn"), core: false, signal: true, empire: true },
        { label: t("rAsn"), core: false, signal: true, empire: true },
      ],
    },
    {
      group: t("gGrowth"),
      rows: [
        { label: t("rAffTiers"), core: "1", signal: up("10"), empire: up("500") },
        { label: t("rAffiliates"), core: up("5"), signal: up("500"), empire: up("10,000") },
        { label: t("rReseller"), core: false, signal: false, empire: true },
        { label: t("rBlog"), core: false, signal: up("100"), empire: up("500") },
        { label: t("rTeam"), core: up("2"), signal: up("5"), empire: up("50") },
      ],
    },
  ];
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (value === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/50" />;
  return <span className="text-sm text-foreground/80">{value}</span>;
}

function SubscriptionPlanPage() {
  const { lang } = useI18n();
  const t = useMemo(() => planT(lang), [lang]);
  const plans = useMemo(() => buildPlans(t), [t]);
  const comparison = useMemo(() => buildComparison(t), [t]);

  const getMyStoreFn = useServerFn(getMyStore);
  const { data: storeData } = useQuery({ queryKey: ["my-store"], queryFn: () => getMyStoreFn() });
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const environment = useMemo(() => {
    try {
      return getStripeEnvironment();
    } catch {
      return null;
    }
  }, []);

  const getMyPlanFn = useServerFn(getMyPlan);
  const { data: planData } = useQuery({
    queryKey: ["my-plan", environment],
    queryFn: () => getMyPlanFn({ data: { environment: environment! } }),
    enabled: Boolean(environment),
  });

  const createPlanCheckoutFn = useServerFn(createPlanCheckout);

  const activePriceId = planData?.plan && ["active", "trialing", "past_due"].includes(planData.plan.status)
    ? planData.plan.priceId
    : null;
  const currentPlan: PlanId = activePriceId?.startsWith("cinaauth_empire")
    ? "empire"
    : activePriceId?.startsWith("cinaauth_signal")
      ? "signal"
      : "core";

  const active = useMemo(() => plans.find((p) => p.id === currentPlan)!, [plans, currentPlan]);

  async function startCheckout(priceId: string) {
    if (!environment) {
      toast.error(t("paymentsNotConfigured"));
      return;
    }
    setPending(priceId);
    try {
      const result = await createPlanCheckoutFn({
        data: { priceId, returnUrl: window.location.origin, environment },
      });
      if ("error" in result) throw new Error(result.error);
      setClientSecret(result.clientSecret);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("couldNotStart"));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/70">{t("eyebrow")}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("subtitle")} {storeData?.store?.name ?? ""}.
      </p>

      {/* Current plan */}
      <Card className="mt-6 border-primary/25 bg-card">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                <active.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">{active.name} {t("planWord")}</p>
                  <Badge className="border-emerald-500/20 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20">{t("active")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{active.tagline}</p>
              </div>
            </div>
            <Button className="font-display uppercase tracking-wide" onClick={() => document.getElementById("change-plan")?.scrollIntoView({ behavior: "smooth" })}>
              {t("upgradePlan")}
            </Button>
          </div>
          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: t("renews"),
                value: planData?.plan?.currentPeriodEnd
                  ? new Date(planData.plan.currentPeriodEnd).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" })
                  : "—",
                note: activePriceId ? (planData?.plan?.cancelAtPeriodEnd ? t("accessEnds") : t("renewsAuto")) : t("noPaidPlan"),
              },
              {
                label: t("autoRenewal"),
                value: activePriceId && !planData?.plan?.cancelAtPeriodEnd ? t("on") : t("off"),
                note: activePriceId && !planData?.plan?.cancelAtPeriodEnd ? t("chargedEach") : t("nothingCharged"),
              },
              {
                label: t("status"),
                value: planData?.plan?.status ? planData.plan.status : "—",
                note: activePriceId ? t("currentBilling") : t("noUpcoming"),
              },
              {
                label: t("price"),
                value: activePriceId?.endsWith("yearly") ? `$${active.yearly.toFixed(2)}/yr` : `$${active.monthly.toFixed(2)}/mo`,
                note: `${active.name} ${t("planWord")}`,
              },
            ].map((s) => (
              <div key={s.label} className="bg-card p-5">
                <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change plan */}
      <div id="change-plan" className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t("changePlan")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("changePlanDesc")}</p>
        </div>
        <div className="flex overflow-hidden rounded-none border border-border">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-4 py-2 font-display text-xs uppercase tracking-wider transition-colors ${
                cycle === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "monthly" ? t("monthly") : t("yearly")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = cycle === "monthly" ? plan.monthly : plan.yearly;
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={`flex flex-col border-border bg-card ${plan.highlight ? "border-primary/50 shadow-[0_0_40px_-20px_hsl(var(--primary))]" : ""}`}
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide">{plan.name}</h3>
                  {isCurrent && <Badge variant="outline" className="border-primary/40 text-primary">{t("current")}</Badge>}
                  {plan.highlight && !isCurrent && <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{t("mostPower")}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                <p className="mt-5 text-4xl font-bold tracking-tight">
                  ${price.toFixed(2)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {price === 0 ? t("forever") : cycle === "monthly" ? t("perMonth") : t("perYear")}
                  </span>
                </p>

                <Button
                  className="mt-5 w-full font-display uppercase tracking-wide"
                  variant={isCurrent ? "outline" : plan.highlight ? "default" : "secondary"}
                  disabled={isCurrent || !plan.priceIds[cycle] || pending !== null}
                  onClick={() => {
                    const priceId = plan.priceIds[cycle];
                    if (priceId) void startCheckout(priceId);
                  }}
                >
                  {pending === plan.priceIds[cycle] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? t("yourCurrentPlan") : plan.priceIds[cycle] ? `${t("get")} ${plan.name}` : t("freeForever")}
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("cardRenews")}</p>

                <p className="mt-6 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{plan.intro}</p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Why upgrade */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Globe, title: t("ownDomain"), body: t("ownDomainDesc") },
          { icon: Sparkles, title: t("conversionTools"), body: t("conversionToolsDesc") },
          { icon: CreditCard, title: t("morePayments"), body: t("morePaymentsDesc") },
        ].map((b) => (
          <Card key={b.title} className="border-border bg-card">
            <CardContent className="p-5">
              <b.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-sm font-semibold uppercase tracking-wide">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compare */}
      <h2 className="mt-12 font-display text-2xl font-bold uppercase tracking-wide">{t("comparePlans")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("compareDesc")}</p>

      <Card className="mt-4 overflow-hidden border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{t("feature")}</th>
                {plans.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((section) => (
                <Fragment key={section.group}>
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="px-5 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {section.group}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={section.group + row.label} className="border-t border-border/60">
                      <td className="px-5 py-3 text-sm">{row.label}</td>
                      <td className="px-4 py-3 text-center"><Cell value={row.core} /></td>
                      <td className="px-4 py-3 text-center"><Cell value={row.signal} /></td>
                      <td className="px-4 py-3 text-center"><Cell value={row.empire} /></td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing history */}
      <h2 className="mt-12 font-display text-2xl font-bold uppercase tracking-wide">{t("billingHistory")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("billingHistoryDesc")}</p>
      <Card className="mt-4 border-border bg-card">
        <CardContent className="p-10 text-center">
          <p className="text-sm text-muted-foreground">{t("noPurchases")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard">
              <Button variant="outline">{t("backToDashboard")}</Button>
            </Link>
            <Link to="/panel/sales/subscriptions">
              <Button variant="secondary">{t("customerSubs")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(clientSecret)} onOpenChange={(open) => !open && setClientSecret(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">{t("completePurchase")}</DialogTitle>
          </DialogHeader>
          {clientSecret && (
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
