import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Shield, CreditCard, Download, BarChart3, Globe, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFeaturedProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  loader: () => getFeaturedProducts(),
  head: () => ({
    meta: [
      { title: "cinaAuth — Sell Digital Products" },
      { name: "description", content: "The all-in-one platform to sell digital products. Create your store, upload products, and start selling in minutes." },
      { property: "og:title", content: "cinaAuth — Sell Digital Products" },
      { property: "og:description", content: "The all-in-one platform to sell digital products. Create your store, upload products, and start selling in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Fixed cyber grid background */}
      <div className="cyber-grid pointer-events-none fixed inset-0 opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.72_0.19_55/14%),transparent_60%)]" />
      <Header />
      <main className="relative">
        <Hero />
        <FeaturedProducts />
        <Features />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

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
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground [clip-path:polygon(0%_0%,100%_0%,100%_75%,75%_100%,0%_100%)]">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-display text-xl font-black tracking-tighter text-foreground">
            cina<span className="text-primary">Auth</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground md:flex">
          <a href="#products" className="transition-colors hover:text-primary">Market</a>
          <a href="#features" className="transition-colors hover:text-primary">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-primary">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
              <Link
                to="/dashboard"
                className="border border-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Dashboard //
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Sign in
              </Link>
              <Link
                to="/onboarding"
                className="border border-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Start selling //
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <div className="mb-6 inline-block border border-chart-2/50 bg-chart-2/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-chart-2">
          System status: operational
        </div>
        <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
          Sell your digital
          <br />
          <span className="animate-rgb-flicker bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
            products in minutes
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
          The all-in-one platform to create your store, upload products, accept payments, and deliver instantly — without writing code.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/auth"
            className="w-full bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105 sm:w-auto"
          >
            Create free store
          </Link>
          <a
            href="#features"
            className="w-full border border-foreground/20 px-8 py-4 text-sm font-black uppercase tracking-widest text-foreground transition-colors hover:border-foreground sm:w-auto"
          >
            See features
          </a>
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          No credit card required // Free to start
        </p>
      </div>
    </section>
  );
}

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  billing_interval: string | null;
  stores: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function FeaturedProducts() {
  const { products } = Route.useLoaderData() as { products: FeaturedProduct[] };
  if (!products?.length) return null;

  const formatPrice = (p: FeaturedProduct) =>
    `${p.price.toFixed(2)} ${p.currency}${p.billing_interval ? (p.billing_interval === "month" ? "/mo" : "/yr") : ""}`;

  return (
    <section id="products" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 border-l-4 border-primary pl-6">
          <h2 className="font-display text-3xl font-bold uppercase text-foreground">Featured assets</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">
            Live from the network [LOAD_SUCCESS]
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {products.map((p, i) => {
            const store = Array.isArray(p.stores) ? p.stores[0] : p.stores;
            const modId = `MOD_${String(i + 1).padStart(2, "0")}`;
            return (
              <Link
                key={p.id}
                to="/$storeSlug/$productSlug"
                params={{ storeSlug: store?.slug ?? "", productSlug: p.slug }}
                className="group relative overflow-hidden border border-border bg-card p-6 transition-all hover:border-primary"
              >
                <div className="absolute right-0 top-0 p-2 text-[10px] font-bold text-foreground/20">
                  {modId}
                </div>
                <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden border border-border bg-secondary">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent" />
                  <ShoppingBag className="h-10 w-10 text-primary/60 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-primary">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="mb-4 mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{formatPrice(p)}</span>
                  <span className="border-b border-foreground/20 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                    {store ? store.name : "Deploy"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Globe, num: "01", title: "Your own store", description: "Get a customizable storefront with your brand, slug, and domain-ready link.", color: "text-chart-2", border: "border-chart-2", bg: "bg-chart-2/10" },
  { icon: CreditCard, num: "02", title: "Built-in payments", description: "Accept cards, Apple Pay, Google Pay and more with Stripe-powered checkout.", color: "text-primary", border: "border-primary", bg: "bg-primary/10" },
  { icon: Download, num: "03", title: "Instant delivery", description: "Buyers receive their files, license keys, or links automatically after payment.", color: "text-chart-3", border: "border-chart-3", bg: "bg-chart-3/10" },
  { icon: BarChart3, num: "04", title: "Sales dashboard", description: "Track revenue, orders, and customers in real time from one clean dashboard.", color: "text-chart-2", border: "border-chart-2", bg: "bg-chart-2/10" },
  { icon: Shield, num: "05", title: "Secure by default", description: "Authenticated access, encrypted storage, and RLS-protected data.", color: "text-primary", border: "border-primary", bg: "bg-primary/10" },
  { icon: Zap, num: "06", title: "Lightning fast", description: "Edge-powered storefronts that load instantly and scale automatically.", color: "text-chart-3", border: "border-chart-3", bg: "bg-chart-3/10" },
];

function Features() {
  return (
    <section id="features" className="border-y border-border bg-card/50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 border-l-4 border-primary pl-6">
          <h2 className="font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
            Everything you need to sell digital
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">
            From store creation to delivery [MODULES_LOADED]
          </p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center border ${f.border} ${f.bg} ${f.color} font-display text-sm font-black italic`}>
                {f.num}
              </div>
              <h3 className="font-display text-xl uppercase text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 border-l-4 border-primary pl-6">
          <h2 className="font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
            Start selling in three steps
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Create your store", description: "Sign up, pick a name and slug, and customize your storefront." },
            { step: "02", title: "Add products", description: "Upload files, set prices, and choose how buyers receive their purchase." },
            { step: "03", title: "Share & sell", description: "Share your store link, get paid, and deliver automatically." },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative overflow-hidden border border-border bg-card p-8 transition-colors hover:border-primary"
            >
              <span className="font-display text-4xl font-black italic text-primary/30">{item.step}</span>
              <h3 className="mt-4 font-display text-xl uppercase text-foreground group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-primary/20 bg-[radial-gradient(circle_at_50%_100%,oklch(0.72_0.19_55/10%),transparent_50%)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-4xl font-black uppercase italic tracking-widest text-foreground sm:text-5xl">
          Ready to <span className="text-primary text-glow-primary">jack in?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Join creators selling templates, courses, art, software, and more.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/auth"
            className="w-full bg-primary px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_30px_oklch(0.72_0.19_55/30%)] transition-all hover:shadow-[0_0_50px_oklch(0.72_0.19_55/50%)] sm:w-auto"
          >
            Create your store — free
          </Link>
          <Link
            to="/$storeSlug"
            params={{ storeSlug: "demo-cinaauth" }}
            className="w-full border-2 border-chart-2 bg-chart-2/5 px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-chart-2 transition-all hover:bg-chart-2 hover:text-background sm:w-auto"
          >
            View demo store
          </Link>
          <Link
            to="/auth"
            className="w-full border border-foreground/20 px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-foreground/10 sm:w-auto"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-12 text-[10px] uppercase tracking-[0.5em] text-foreground/30">
          cinaAuth network // Secure connection established
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Zap className="h-4 w-4 text-primary" />
          cina<span className="text-primary">Auth</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} cinaAuth // All rights reserved
        </p>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">Privacy</Link>
          <Link to="/" className="transition-colors hover:text-primary">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
