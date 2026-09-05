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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getLandingStats } from "@/lib/landing.functions";

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
    <div className="min-h-screen bg-landing-bg font-[family-name:var(--font-landing)] text-landing-text antialiased selection:bg-landing-accent selection:text-landing-accent-foreground">
      <Header />
      <main>
        <Hero />
        <DashboardPreview />
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

function Header() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
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
    <header className="sticky top-0 z-50 border-b border-landing-accent/20 bg-landing-bg/90 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-[family-name:var(--font-display)] text-xl font-black tracking-tighter">
          <span className="text-landing-accent">cina</span>Auth
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-landing-muted md:flex">
          <a href="#dashboard" className="transition-colors hover:text-landing-accent">Dashboard</a>
          <a href="#features" className="transition-colors hover:text-landing-accent">Specs</a>
          <a href="#pricing" className="transition-colors hover:text-landing-accent">Licensing</a>
          <a href="#faq" className="transition-colors hover:text-landing-accent">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          {signedIn ? (
            <>
              <button
                onClick={handleSignOut}
                className="hidden font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-text sm:inline"
              >
                Sign out
              </button>
              <Link
                to="/dashboard"
                className="bg-landing-accent px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-text sm:inline"
              >
                Sign in
              </Link>
              <Link
                to="/onboarding"
                className="bg-landing-accent px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
              >
                Start now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ================= Hero ================= */

function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        {/* Asymmetric rail */}
        <div className="relative ml-2 border-l border-landing-accent/30 pl-6 sm:ml-6 sm:pl-10">
          <div className="absolute -left-1 top-0 h-14 w-2 bg-landing-accent" />

          <p className="font-mono text-xs font-bold tracking-[0.2em] text-landing-accent">
            [ INITIALIZING_COMMERCE_PROTOCOL ]
          </p>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            Unleash
            <br />
            <span
              style={{
                WebkitTextStrokeWidth: "2px", WebkitTextStrokeColor: "#f97316",
                color: "transparent",
                paintOrder: "stroke fill",
              }}
            >
              Digital
            </span>
            <br />
            Empire
          </h1>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-landing-muted sm:text-base">
            High-performance infrastructure for digital goods. Instant delivery, zero friction, industrial security — your store live in minutes.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/onboarding"
              className="group relative inline-flex items-center justify-center gap-2 bg-landing-accent px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
            >
              Create free store
              <ArrowRight className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-landing-text group-hover:bg-landing-accent" />
            </Link>
            <Link
              to="/$storeSlug"
              params={{ storeSlug: "demo-cinaauth" }}
              className="inline-flex items-center justify-center border border-landing-border px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-landing-text transition-colors hover:border-landing-accent"
            >
              View demo store
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-landing-muted/70">
            No credit card required // Free to start
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================= Dashboard preview ================= */

function DashboardPreview() {
  const { data } = useSuspenseQuery(landingStatsQuery);
  const money = (v: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(v);

  const maxRevenue = Math.max(...data.days.map((d) => d.revenue), 1);

  return (
    <section id="dashboard" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 ml-2 border-l-4 border-landing-accent pl-4 sm:ml-6 sm:pl-6">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-landing-accent">[ LIVE_TELEMETRY ]</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Command center
          </h2>
          <p className="mt-3 max-w-xl text-sm text-landing-muted">
            Revenue, orders and customers in real time — this is what running your store looks like.
          </p>
        </div>

        <div className="relative border-2 border-landing-accent bg-landing-card p-2">
          <div className="absolute -top-3 right-4 z-10 bg-landing-accent px-2 font-mono text-[10px] font-bold uppercase text-landing-accent-foreground">
            Live_preview
          </div>

          <div className="border border-landing-accent/30 bg-landing-bg">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-landing-accent/20 px-4 py-3">
              <span className="h-2 w-2 bg-landing-accent" />
              <span className="h-2 w-2 bg-landing-accent/40" />
              <span className="h-2 w-2 bg-landing-accent/20" />
              <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-landing-muted">
                cinahub.cinaauth.com/dashboard
              </span>
            </div>

            <div className="grid gap-4 p-4 sm:p-6">
              {/* Revenue row */}
              <div className="flex items-end justify-between border-b border-landing-accent/20 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-landing-muted">Total revenue</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-landing-accent sm:text-3xl">
                    {money(data.totalRevenue, data.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-landing-muted">Orders</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">{data.totalOrders}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-landing-muted">Customers</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">{data.uniqueCustomers}</p>
                </div>
              </div>

              {/* Revenue chart */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-landing-muted">Revenue — last 7 days</p>
                <div className="mt-3 flex h-24 items-end gap-1">
                  {data.days.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date} · ${money(d.revenue, data.currency)}`}
                      className="flex-1 bg-landing-accent/80 transition-colors hover:bg-landing-accent"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Latest orders */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-landing-muted">Latest completed orders</p>
                {data.orders.length === 0 ? (
                  <p className="mt-4 font-mono text-xs text-landing-muted">[ NO_DATA ]</p>
                ) : (
                  <div className="mt-3 divide-y divide-landing-border">
                    {data.orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between gap-2 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{o.product}</p>
                          <p className="font-mono text-[10px] text-landing-muted">{o.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-landing-accent">{money(o.amount, o.currency)}</p>
                          <p className="font-mono text-[10px] text-landing-muted">[ {o.status} ]</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= Features ================= */

const features = [
  { icon: Globe, title: "YOUR_OWN_STOREFRONT", description: "A customizable store with your brand, your slug and a shareable link in minutes." },
  { icon: CreditCard, title: "BUILT_IN_PAYMENTS", description: "Accept cards, Apple Pay, Google Pay and more with Stripe-powered checkout. Money goes straight to you." },
  { icon: Download, title: "INSTANT_DELIVERY", description: "Buyers get their files, license keys or links automatically, milliseconds after payment." },
  { icon: BarChart3, title: "ADV_ANALYTICS", description: "Granular telemetry for every transaction, visitor and product in your catalog." },
  { icon: Shield, title: "ANTI_FRAUD", description: "Authenticated access, encrypted storage and protected data by default." },
  { icon: Zap, title: "ZERO_LATENCY", description: "Edge-powered storefronts that load instantly and scale automatically." },
];

function Features() {
  return (
    <section id="features" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 ml-2 border-l-4 border-landing-accent pl-4 font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight sm:ml-6 sm:pl-6 sm:text-4xl">
          Protocol specs
        </h2>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="group">
              <div className="mb-2 flex items-center gap-3">
                <f.icon className="h-4 w-4 text-landing-accent" />
                <span className="font-mono text-sm font-bold text-landing-accent">
                  {String(i + 1).padStart(2, "0")}. {f.title}
                </span>
              </div>
              <p className="border-t border-landing-accent/10 pt-3 text-sm leading-relaxed text-landing-muted">
                {f.description}
              </p>
            </div>
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
    period: "/forever",
    features: ["1 storefront", "Unlimited products", "5% platform fee", "Instant delivery", "Basic analytics"],
    cta: "Initialize free",
    highlight: false,
  },
  {
    name: "PRO_OPS",
    price: "$29.99",
    period: "/month",
    features: ["Unlimited storefronts", "0% platform fee", "Subscriptions & plans", "Advanced analytics", "API access", "Priority support"],
    cta: "Upgrade node",
    highlight: true,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tighter sm:text-4xl">
          Licensing
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {plans.map((plan) =>
            plan.highlight ? (
              <div key={plan.name} className="relative bg-landing-accent p-7 text-landing-accent-foreground">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-landing-text px-3 py-0.5 font-mono text-[10px] font-bold uppercase text-landing-bg">
                  Recommended
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm opacity-60">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs font-bold">
                      <span className="font-mono">+</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboarding"
                  className="mt-7 block bg-landing-bg py-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-landing-accent transition-colors hover:bg-landing-text hover:text-landing-bg"
                >
                  {plan.cta}
                </Link>
              </div>
            ) : (
              <div key={plan.name} className="relative border border-landing-accent/30 p-7">
                <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-landing-accent" />
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-landing-muted">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-landing-muted">
                      <span className="font-mono text-landing-accent">-</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboarding"
                  className="mt-7 block border border-landing-text py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-landing-text hover:text-landing-bg"
                >
                  {plan.cta}
                </Link>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */

const faqs = [
  { q: "How do I start selling?", a: "Create an account, name your store, add a product and share your link. The whole setup takes under five minutes." },
  { q: "How and when do I get paid?", a: "Payments go straight to your connected Stripe or PayPal account. cinaAuth never holds your money." },
  { q: "What can I sell?", a: "Any digital product you own: files, courses, templates, software, license keys, memberships and subscriptions." },
  { q: "Is there a free plan?", a: "Yes. The Starter plan is free forever with a 5% fee per sale. Upgrade to Pro for 0% fees and advanced features." },
  { q: "Do I need to know how to code?", a: "No. Everything is managed from a visual dashboard — products, orders, customers and your storefront." },
  { q: "Can I use my own domain?", a: "Custom domains are on the roadmap. Today every store gets its own yourstore.cinaauth.com address." },
];

function Faq() {
  return (
    <section id="faq" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 flex items-center gap-4 font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-widest">
          <span className="h-px flex-1 bg-landing-accent/30" />
          FAQ
          <span className="h-px flex-1 bg-landing-accent/30" />
        </h2>
        <div className="space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-landing-border py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-landing-accent [&::-webkit-details-marker]:hidden">
                <span className="font-mono">// {f.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-landing-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 pl-4 text-sm leading-relaxed text-landing-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Final CTA ================= */

function FinalCta() {
  return (
    <section className="relative px-4 pb-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative border-2 border-landing-accent p-8 sm:p-14">
          <div className="absolute -left-px -top-px h-6 w-6 border-l-4 border-t-4 border-landing-accent" />
          <div className="absolute -bottom-px -right-px h-6 w-6 border-b-4 border-r-4 border-landing-accent" />
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-landing-accent">[ DEPLOY_YOUR_STORE ]</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
            The new era of{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStrokeWidth: "1.5px", WebkitTextStrokeColor: "#f97316" }}
            >
              digital commerce
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-sm text-landing-muted">
            Join creators selling templates, courses, art, software and more on cinaAuth.
          </p>
          <Link
            to="/onboarding"
            className="group relative mt-9 inline-flex items-center gap-2 bg-landing-accent px-10 py-4 font-mono text-sm font-bold uppercase tracking-widest text-landing-accent-foreground transition-colors hover:bg-landing-text hover:text-landing-bg"
          >
            Create your store — free
            <ArrowRight className="h-4 w-4" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-landing-text group-hover:bg-landing-accent" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================= Footer ================= */

function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Demo store", "Changelog"] },
    { title: "Resources", links: ["Documentation", "API", "Status", "Support"] },
    { title: "Company", links: ["About", "Blog", "Terms", "Privacy"] },
  ];

  return (
    <footer className="border-t border-landing-accent/20 bg-landing-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <span className="font-[family-name:var(--font-display)] text-xl font-black tracking-tighter">
              <span className="text-landing-accent">cina</span>Auth
            </span>
            <p className="mt-4 text-sm text-landing-muted">
              High-performance infrastructure for digital goods. Instant delivery, zero friction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-landing-accent">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-landing-muted transition-colors hover:text-landing-text">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-landing-accent/10 pt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-landing-muted sm:flex-row">
          <p>© {new Date().getFullYear()} cinaAuth // All rights reserved</p>
          <div className="flex items-center gap-2">
            <Headset className="h-3.5 w-3.5 text-landing-accent" />
            support@cinaauth.com
          </div>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse bg-landing-accent" />
            Status: nominal
          </p>
        </div>
      </div>
    </footer>
  );
}
