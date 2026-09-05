import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Zap,
  Shield,
  CreditCard,
  Download,
  BarChart3,
  Globe,
  ChevronDown,
  ArrowRight,
  Headset,
  Menu,
  X,
  FileText,
  Package,
  Store,
  LifeBuoy,
  LayoutDashboard,
  Mail,
  Repeat,
  Users,
  Code2,
  MessageCircle,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLandingStats } from "@/lib/landing.functions";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AccentPicker, ThemeToggle } from "@/components/HeaderControls";
import { useI18n } from "@/lib/i18n";

const landingStatsQuery = queryOptions({
  queryKey: ["landing-stats"],
  queryFn: () => getLandingStats(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "cinaAuth — Sell digital products in minutes" },
      { name: "description", content: "High-performance infrastructure for digital goods. Your own storefront, built-in payments and instant delivery." },
      { property: "og:title", content: "cinaAuth — Sell digital products in minutes" },
      { property: "og:description", content: "High-performance infrastructure for digital goods. Your own storefront, built-in payments and instant delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(landingStatsQuery),
  errorComponent: ({ error }) => <div role="alert" className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Page not found.</div>,
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-landing-bg font-[family-name:var(--font-landing)] text-landing-text antialiased selection:bg-landing-accent selection:text-landing-accent-foreground">
      <div className="pointer-events-none absolute inset-0 radial-grid opacity-40" />
      <Header />
      <main className="relative z-10">
        <Hero />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ================= Header ================= */

const PRODUCT_MENU = [
  {
    href: "#visual-editor",
    label: "Visual Editor", labelKey: "menu.visualEditor" as const,
    icon: LayoutDashboard,
    description: "Build and customize your storefront with our intuitive visual editor. No coding required.",
  },
  {
    href: "#global-payments",
    label: "Global Payments", labelKey: "menu.globalPayments" as const,
    icon: CreditCard,
    description: "Cards, wallets, bank transfers and crypto — accept how your customers want to pay.",
  },
  {
    href: "#fraud-protection",
    label: "Fraud Protection", labelKey: "menu.fraudProtection" as const,
    icon: Shield,
    description: "Automatic risk scoring, blocklists and verification to stop chargebacks before they happen.",
  },
  {
    href: "#email-marketing",
    label: "Email Marketing", labelKey: "menu.emailMarketing" as const,
    icon: Mail,
    description: "Order receipts, recovery flows and campaigns sent from your own branded domain.",
  },
  {
    href: "#reseller-program",
    label: "Reseller Program", labelKey: "menu.resellerProgram" as const,
    icon: Repeat,
    description: "Let trusted partners resell your products with their own pricing and stock limits.",
  },
  {
    href: "#affiliate-program",
    label: "Affiliate Program", labelKey: "menu.affiliateProgram" as const,
    icon: Users,
    description: "Track referrals and pay commissions automatically on every completed order.",
  },
] as const;

function Header() {
  const { t } = useI18n();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [productHover, setProductHover] = useState<string>(PRODUCT_MENU[0].href);
  const navigate = useNavigate();



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-landing-accent/20 bg-landing-bg/90 ${menuOpen ? "" : "backdrop-blur-sm"}`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/"><Logo wordClassName="text-landing-text" /></Link>
        <nav className="hidden items-center gap-2 font-mono text-xs uppercase tracking-widest text-landing-muted md:flex">
          <div
            className="relative"
            onMouseEnter={() => setProductOpen(true)}
            onMouseLeave={() => setProductOpen(false)}
          >
            <button
              type="button"
              onClick={() => setProductOpen((v) => !v)}
              aria-expanded={productOpen}
              className={`flex items-center gap-1.5 border px-4 py-2 transition-colors ${
                productOpen
                  ? "border-landing-accent/40 bg-landing-accent/10 text-landing-text"
                  : "border-transparent hover:text-landing-accent"
              }`}
            >
              {t("nav.product")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productOpen ? "rotate-180" : ""}`} />
            </button>

            {productOpen && (
              <div className="absolute left-0 top-full w-[640px] border border-landing-accent/25 bg-landing-bg p-2 shadow-2xl">
                <div className="grid grid-cols-[1fr_260px] gap-2">
                  <div className="space-y-1">
                    {PRODUCT_MENU.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onMouseEnter={() => setProductHover(item.href)}
                        onClick={() => setProductOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm normal-case tracking-normal transition-colors ${
                          productHover === item.href
                            ? "bg-landing-accent/10 text-landing-text"
                            : "text-landing-muted hover:text-landing-text"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center border border-landing-accent/30 bg-landing-accent/10 text-landing-accent">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold">{t(item.labelKey)}</span>
                      </a>
                    ))}
                  </div>
                  <div className="border-l border-landing-accent/15 p-5">
                    {(() => {
                      const active = PRODUCT_MENU.find((i) => i.href === productHover) ?? PRODUCT_MENU[0]!;
                      return (
                        <>
                          <span className="flex h-10 w-10 items-center justify-center border border-landing-accent/30 bg-landing-accent/10 text-landing-accent">
                            <active.icon className="h-5 w-5" />
                          </span>
                          <h3 className="mt-4 text-lg font-bold normal-case tracking-normal text-landing-text">
                            {t(active.labelKey)}
                          </h3>
                          <p className="mt-2 text-sm normal-case leading-relaxed tracking-normal text-landing-muted">
                            {active.description}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#pricing" className="px-3 transition-colors hover:text-landing-accent">{t("nav.licensing")}</a>
          <Link to="/changelog" className="px-3 transition-colors hover:text-landing-accent">{t("nav.developers")}</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="https://discord.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="hidden text-landing-muted transition-colors hover:text-landing-accent sm:inline"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href="https://telegram.org/"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            className="hidden text-landing-muted transition-colors hover:text-landing-accent sm:inline"
          >
            <Send className="h-4 w-4" />
          </a>
          <div className="flex shrink-0 items-center gap-0 border border-landing-accent/30 bg-landing-accent/5">
            <ThemeToggle className="rounded-none text-landing-muted hover:text-landing-accent" />
            <AccentPicker className="rounded-none text-landing-muted hover:text-landing-accent" />
            <LanguageSelector triggerClassName="rounded-none text-landing-muted hover:text-landing-accent" />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-landing-accent/40 bg-landing-accent/10 text-landing-text transition-colors hover:text-landing-accent md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {signedIn ? (
            <>
              <button
                onClick={handleSignOut}
                className="hidden font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-text sm:inline"
              >
                {t("nav.signout")}
              </button>
              <Link
                to="/dashboard"
                className="hidden sm:inline-block bg-landing-accent px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
              >
                {t("nav.dashboard")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-text sm:inline"
              >
                {t("nav.signin")}
              </Link>
              <Link
                to="/onboarding"
                className="hidden sm:inline-block bg-landing-accent px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
              >
                {t("nav.start")}
              </Link>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-landing-bg md:hidden">
          <div className="flex h-16 shrink-0 items-center justify-between px-4">
            <Logo wordClassName="text-landing-text" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center border border-landing-accent/30 text-landing-text transition-colors hover:text-landing-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 px-4 pb-10 pt-4">
            {[
              {
                group: t("nav.product"),
                items: [
                  { href: "#visual-editor", label: t("menu.visualEditor"), icon: LayoutDashboard },
                  { href: "#global-payments", label: t("menu.globalPayments"), icon: CreditCard },
                  { href: "#fraud-protection", label: t("menu.fraudProtection"), icon: Shield },
                  { href: "#email-marketing", label: t("menu.emailMarketing"), icon: Mail },
                  { href: "#reseller-program", label: t("menu.resellerProgram"), icon: Repeat },
                  { href: "#affiliate-program", label: t("menu.affiliateProgram"), icon: Users },
                ],
              },
              {
                group: t("nav.resources"),
                items: [
                  { href: "#pricing", label: t("nav.licensing"), icon: CreditCard },
                  { to: "/changelog", label: t("nav.developers"), icon: Code2 },
                ],
              },
              {
                group: t("nav.community"),
                items: [
                  { external: "https://discord.com/", label: "Discord", icon: MessageCircle },
                  { external: "https://telegram.org/", label: "Telegram", icon: Send },
                ],
              },

            ].map((section) => (
              <div key={section.group} className="mb-8">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-landing-muted">
                  {section.group}
                </p>
                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const inner = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-landing-accent/25 bg-landing-accent/5 text-landing-accent">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-base font-semibold">{item.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-landing-muted" />
                      </>
                    );
                    const cls =
                      "flex items-center gap-4 border border-transparent px-1 py-2 text-landing-text transition-colors hover:border-landing-accent/30 hover:text-landing-accent";
                    return (
                      <li key={`${section.group}-${item.label}`}>
                        {"external" in item && item.external ? (
                          <a
                            href={item.external}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className={cls}
                          >
                            {inner}
                          </a>
                        ) : "to" in item && item.to ? (
                          <Link to={item.to} onClick={() => setMenuOpen(false)} className={cls}>
                            {inner}
                          </Link>
                        ) : (
                          <a href={(item as { href: string }).href} onClick={() => setMenuOpen(false)} className={cls}>
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}


            <div className="mt-auto flex flex-col gap-3 border-t border-landing-accent/20 pt-6">
              {signedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="bg-landing-accent px-5 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      void handleSignOut();
                    }}
                    className="border border-landing-accent/30 px-5 py-3 font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-accent"
                  >
                    {t("nav.signout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/onboarding"
                    onClick={() => setMenuOpen(false)}
                    className="bg-landing-accent px-5 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground"
                  >
                    {t("nav.start")}
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="border border-landing-accent/30 px-5 py-3 text-center font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-accent"
                  >
                    {t("nav.signin")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>


  );
}

/* ================= Hero ================= */

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <ScrollReveal className="lg:col-span-5">
            <div className="flex flex-col items-start">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-[2px] w-12 bg-landing-accent" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-landing-accent">
                  {t("hero.badge")}
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-6xl font-black uppercase leading-[0.9] text-landing-text sm:text-7xl lg:text-8xl">
                cina
                <br />
                <span className="text-landing-accent">Auth</span>
              </h1>

              <div className="relative mb-10 mt-8 border-l border-landing-border pl-6">
                <p className="max-w-sm text-lg leading-relaxed text-landing-muted">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/onboarding"
                  className="group relative inline-flex items-center justify-center gap-2 bg-landing-accent px-8 py-4 font-mono text-xs font-black uppercase tracking-widest text-landing-accent-foreground shadow-[6px_6px_0px_0px_oklch(var(--accent-l)_var(--accent-chroma)_var(--accent-hue)/20%)] transition-all hover:bg-landing-text hover:text-landing-bg hover:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/$storeSlug"
                  params={{ storeSlug: "demo-cinaauth" }}
                  className="inline-flex items-center justify-center border border-landing-border px-8 py-4 font-mono text-xs font-black uppercase tracking-widest text-landing-text transition-colors hover:border-landing-accent hover:text-landing-accent"
                >
                  {t("hero.demo")}
                </Link>
              </div>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-landing-muted/70">
                {t("hero.note")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="lg:col-span-7">
            <TerminalPreview />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ================= Terminal preview ================= */

function TerminalPreview() {
  const { t } = useI18n();
  const { data } = useSuspenseQuery(landingStatsQuery);
  const money = (v: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(v);

  const stats = [
    { label: t("preview.revenue"), value: money(data.totalRevenue, data.currency), accent: false },
    { label: t("preview.orders"), value: data.totalOrders.toString(), accent: true },
    { label: t("preview.customers"), value: data.uniqueCustomers.toString(), accent: false },
    { label: t("preview.status"), value: t("preview.active"), accent: false, status: true },
  ];

  return (
    <div className="relative group">
      <div className="absolute -top-3 -left-3 h-8 w-8 border-t-2 border-l-2 border-landing-accent" />
      <div className="absolute -bottom-3 -right-3 h-8 w-8 border-b-2 border-r-2 border-landing-accent" />

      <div className="relative overflow-hidden border border-landing-border bg-landing-card shadow-[0_0_50px_-12px_oklch(var(--accent-l)_var(--accent-chroma)_var(--accent-hue)/20%)]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(transparent 50%, black 50%)", backgroundSize: "100% 4px" }} />

        <div className="flex items-center justify-between border-b border-landing-border bg-landing-surface/50 px-5 py-3">
          <div className="flex items-center gap-6">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 border border-landing-border bg-landing-bg" />
              <div className="h-2.5 w-2.5 border border-landing-accent/50 bg-landing-accent/50" />
              <div className="h-2.5 w-2.5 border border-landing-border bg-landing-bg" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-landing-muted">
              {t("preview.console")} // Mainframe_Root
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />
            <span className="font-mono text-[9px] text-landing-muted">{t("preview.stable")}</span>
          </div>
        </div>

        <div className="space-y-4 p-6 font-mono text-sm leading-relaxed">
          <div className="flex gap-3">
            <span className="text-landing-accent opacity-50">λ</span>
             <span className="text-landing-text">cina-srv {t("preview.initialize")}</span>
          </div>

          <div className="space-y-1 border-l border-landing-border pl-4">
             <div className="text-landing-muted">[SYS] {t("preview.fetching")}</div>
             <div className="text-landing-muted">[SYS] {t("preview.rotating")}</div>
             <div className="text-landing-text">[OK] {t("preview.connected")}</div>
          </div>

          <div className="grid grid-cols-2 gap-px border border-landing-border bg-landing-border sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-landing-bg p-4">
                <div className="text-[9px] uppercase tracking-tighter text-landing-muted">{s.label}</div>
                <div className={`mt-1 text-xl font-black tracking-tighter ${s.accent ? "text-landing-accent" : s.status ? "text-emerald-500 text-[10px]" : "text-landing-text"}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="animate-pulse text-landing-accent">_</span>
             <span className="text-landing-muted/50">{t("preview.waiting")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Features ================= */

const features = [
  {
    id: "visual-editor",
    icon: LayoutDashboard,
    title: "menu.visualEditor",
    desc: "features.1",
  },
  {
    id: "global-payments",
    icon: CreditCard,
    title: "menu.globalPayments",
    desc: "features.2",
  },
  {
    id: "fraud-protection",
    icon: Shield,
    title: "menu.fraudProtection",
    desc: "features.3",
  },
  {
    id: "email-marketing",
    icon: Mail,
    title: "menu.emailMarketing",
    desc: "features.4",
  },
  {
    id: "reseller-program",
    icon: Repeat,
    title: "menu.resellerProgram",
    desc: "features.5",
  },
  {
    id: "affiliate-program",
    icon: Users,
    title: "menu.affiliateProgram",
    desc: "features.6",
  },
] as const;

function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 ml-2 border-l-4 border-landing-accent pl-4 sm:ml-6 sm:pl-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {t("features.title")}
          </h2>
        </ScrollReveal>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 80}>
              <div
                id={f.id}
                className="group h-full scroll-mt-24 border border-landing-border bg-landing-surface/30 p-5 transition-colors hover:bg-landing-surface card-hover-lift glow-border-hover"
              >
                <div className="mb-2 flex items-center gap-3">
                  <f.icon className="h-4 w-4 text-landing-accent" />
                  <span className="font-mono text-sm font-bold text-landing-accent">
                     {String(i + 1).padStart(2, "0")}. {t(f.title)}
                  </span>
                </div>
                <p className="border-t border-landing-accent/10 pt-3 text-sm leading-relaxed text-landing-muted">
                   {t(f.desc)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Pricing ================= */

const plans = [
  {
    name: "STARTER",
    price: "$0",
    period: "pricing.forever",
    features: ["pricing.f1", "pricing.f2", "pricing.f3", "pricing.f4", "pricing.f5"],
    cta: "pricing.free.cta",
    highlight: false,
  },
  {
    name: "PRO_OPS",
    price: "$29.99",
    period: "pricing.month",
    features: ["pricing.p1", "pricing.p2", "pricing.p3", "pricing.p4", "pricing.p5", "pricing.p6"],
    cta: "pricing.pro.cta",
    highlight: true,
  },
] as const;

function Pricing() {
  const { t } = useI18n();
  return (
    <section id="pricing" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tighter sm:text-4xl">
            {t("pricing.title")}
          </h2>
        </ScrollReveal>
        <div className="grid items-stretch gap-6 pt-4 sm:grid-cols-2">
          {plans.map((plan, i) =>
            plan.highlight ? (
              <ScrollReveal key={plan.name} delay={i * 120} className="h-full">
                <div className="relative flex h-full flex-col border-2 border-landing-text bg-landing-accent p-7 text-landing-accent-foreground card-hover-lift glow-border-hover">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 border border-landing-text bg-landing-text px-3 py-0.5 font-mono text-[10px] font-bold uppercase text-landing-bg">
                    {t("pricing.recommended")}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-sm opacity-60">{t(plan.period)}</span>
                  </div>
                  <ul className="mb-7 mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs font-bold">
                        <span className="font-mono">+</span> {t(f)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/onboarding"
                    className="mt-auto block border border-landing-bg bg-landing-bg py-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-landing-accent transition-colors hover:bg-landing-text hover:text-landing-bg"
                  >
                    {t(plan.cta)}
                  </Link>
                </div>
              </ScrollReveal>
            ) : (
              <ScrollReveal key={plan.name} delay={i * 120} className="h-full">
                <div className="relative flex h-full flex-col border border-landing-accent/60 bg-landing-surface/30 p-7 card-hover-lift glow-border-hover">
                  <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-landing-accent" />
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-sm text-landing-muted">{t(plan.period)}</span>
                  </div>
                  <ul className="mb-7 mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-landing-muted">
                        <span className="font-mono text-landing-accent">-</span> {t(f)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/onboarding"
                    className="mt-auto block border border-landing-text py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-landing-text hover:text-landing-bg glow-border-hover"
                  >
                    {t(plan.cta)}
                  </Link>
                </div>
              </ScrollReveal>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */

const faqs = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
] as const;

function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="mb-10">
          <h2 className="flex items-center gap-4 font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-widest">
            <span className="h-px flex-1 bg-landing-accent/30" />
            FAQ
            <span className="h-px flex-1 bg-landing-accent/30" />
          </h2>
        </ScrollReveal>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <ScrollReveal key={f.q} delay={i * 60}>
              <details className="group border-b border-landing-border py-4 glow-border-hover">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-landing-accent [&::-webkit-details-marker]:hidden">
                  <span className="font-mono">// {t(f.q)}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-landing-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 pl-4 text-sm leading-relaxed text-landing-muted">{t(f.a)}</p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Final CTA ================= */

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative px-4 pb-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="relative border-2 border-landing-accent p-8 sm:p-14 glow-border-hover scanline">
            <div className="absolute -left-px -top-px h-6 w-6 border-l-4 border-t-4 border-landing-accent" />
            <div className="absolute -bottom-px -right-px h-6 w-6 border-b-4 border-r-4 border-landing-accent" />
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-landing-accent">{t("cta.badge")}</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
              {t("cta.title1")}{" "}
              <span
                className="text-glitch text-transparent"
                data-text={t("cta.title2")}
                style={{ WebkitTextStrokeWidth: "1.5px", WebkitTextStrokeColor: "var(--primary)" }}
              >
                {t("cta.title2")}
              </span>
            </h2>
            <p className="mt-5 max-w-lg text-sm text-landing-muted">
              {t("cta.subtitle")}
            </p>
            <Link
              to="/onboarding"
              className="group relative mt-9 inline-flex items-center gap-2 bg-landing-accent px-10 py-4 font-mono text-sm font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg glow-border-hover"
            >
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-landing-text group-hover:bg-landing-accent" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ================= Footer ================= */

function Footer() {
  const { t } = useI18n();
  const columns = [
    { title: "footer.product", links: ["footer.features", "footer.pricing", "footer.demo", "footer.changelog"] },
    { title: "footer.resources", links: ["footer.docs", "footer.api", "footer.status", "footer.support"] },
    { title: "footer.company", links: ["footer.about", "footer.blog", "footer.terms", "footer.privacy"] },
  ] as const;

  return (
    <footer className="border-t border-landing-accent/20 bg-landing-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <span className="font-[family-name:var(--font-display)] text-xl font-black tracking-tighter">
              <span className="text-landing-accent">cina</span>Auth
            </span>
            <p className="mt-4 text-sm text-landing-muted">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-landing-accent">{t(col.title)}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      {l === "footer.changelog" ? (
                        <Link
                          to="/changelog"
                          className="text-sm text-landing-muted transition-colors hover:text-landing-text"
                        >
                          {t(l)}
                        </Link>
                      ) : (
                        <a href="#" className="text-sm text-landing-muted transition-colors hover:text-landing-text">
                          {t(l)}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-landing-accent/10 pt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-landing-muted sm:flex-row">
          <p>© {new Date().getFullYear()} cinaAuth // {t("footer.rights")}</p>
          <div className="flex items-center gap-2">
            <Headset className="h-3.5 w-3.5 text-landing-accent" />
            support@cinaauth.com
          </div>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse bg-landing-accent" />
            {t("footer.nominal")}
          </p>
        </div>
      </div>
    </footer>
  );
}
