import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createStore, getMyStore } from "@/lib/stores.functions";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { UserPlus, Store, Rocket, Loader2, Check, ArrowLeft, PartyPopper, MailCheck } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your shop — cinaAuth" },
      { name: "description", content: "Create your cinaAuth account and launch your digital storefront in minutes." },
      { property: "og:title", content: "Create your shop — cinaAuth" },
      {
        property: "og:description",
        content: "Create your cinaAuth account and launch your digital storefront in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  { id: 1, label: "Account", icon: UserPlus },
  { id: 2, label: "Shop", icon: Store },
  { id: 3, label: "Launch", icon: Rocket },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function OnboardingPage() {
  const navigate = useNavigate();
  const createStoreFn = useServerFn(createStore);
  const getMyStoreFn = useServerFn(getMyStore);

  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [existingStore, setExistingStore] = useState<{ name: string; slug: string } | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  // Step 1 — account
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submittingAccount, setSubmittingAccount] = useState(false);

  // Step 2 — shop
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        setSignedIn(true);
        setEmail(data.user.email ?? "");
        setOwnerName((data.user.user_metadata?.["name"] as string | undefined) ?? "");
        setStep(2);
        try {
          const res = await getMyStoreFn();
          if (active && res?.store) setExistingStore({ name: res.store.name, slug: res.store.slug });
        } catch {
          /* ignore */
        }
      }
      if (active) setChecking(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAccount = async () => {
    setSubmittingAccount(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { name: ownerName.trim() },
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        setSignedIn(true);
        setStep(2);
      } else {
        setConfirmSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
    } finally {
      setSubmittingAccount(false);
    }
  };

  const handleGoogle = async () => {
    if (!agreed) {
      setError("You must accept the Terms of Service and Acceptable Use policy to continue.");
      return;
    }
    setSubmittingAccount(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/onboarding`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setSubmittingAccount(false);
      setError(result.error.message);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleLaunch = async () => {
    setCreating(true);
    setError(null);
    try {
      await createStoreFn({ data: { name, slug, description } });
      setLaunched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setCreating(false);
    }
  };

  if (checking) {
    return (
      <Shell step={1}>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (confirmSent) {
    return (
      <Shell step={1}>
        <div className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p className="mt-3 text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it and
            you'll come back here to set up your shop.
          </p>
        </div>
      </Shell>
    );
  }

  if (existingStore && !launched) {
    return (
      <Shell step={3}>
        <div className="text-center">
          <PartyPopper className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">You already have a shop</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-semibold text-foreground">{existingStore.name}</span> is live at{" "}
            <span className="font-mono text-primary">/{existingStore.slug}</span>.
          </p>
          <div className="mt-8 space-y-3">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Go to dashboard
            </Button>
            <Link to="/$storeSlug" params={{ storeSlug: existingStore.slug }} className="block">
              <Button variant="outline" className="w-full">
                View public shop
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (launched) {
    return (
      <Shell step={3}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Your shop is live</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-semibold text-foreground">{name}</span> is ready at{" "}
            <span className="font-mono text-primary">/{slug}</span>. Add your first product to start selling.
          </p>
          <div className="mt-8 space-y-3">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate({ to: "/products" })}
            >
              Add your first product
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const accountValid =
    ownerName.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 8 && agreed;

  return (
    <Shell step={step}>
      {step === 1 && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-3 text-muted-foreground">You'll set up your shop in the next step.</p>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ob-owner">Your name</Label>
              <p className="text-sm text-muted-foreground">The shop owner shown on invoices and customer emails.</p>
              <Input
                id="ob-owner"
                placeholder="Jane Doe"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-email">Email address</Label>
              <Input
                id="ob-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-password">Password</Label>
              <Input
                id="ob-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
              <span>
                I accept the Terms of Service and Acceptable Use policy, and I will only sell products I own or have
                the rights to.
              </span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!accountValid || submittingAccount}
              onClick={handleCreateAccount}
            >
              {submittingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase text-muted-foreground"><span className="bg-card px-2">Or continue with</span></div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={!agreed || submittingAccount}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="font-medium text-foreground underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your shop</h1>
          <p className="mt-3 text-muted-foreground">You can change these details later in Storefront settings.</p>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ob-name">Shop name</Label>
              <p className="text-sm text-muted-foreground">Displayed on your shop page and in customer emails.</p>
              <Input
                id="ob-name"
                placeholder="My Awesome Shop"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-slug">Subdomain</Label>
              <p className="text-sm text-muted-foreground">
                Part of your shop URL. Lowercase letters, numbers, and hyphens only.
              </p>
              <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                <input
                  id="ob-slug"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
                  placeholder="my-awesome-shop"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
                <span className="border-l border-input px-3 py-2 text-sm text-muted-foreground">.cinaauth.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-desc">Description</Label>
              <Input
                id="ob-desc"
                placeholder="What do you sell?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              {!signedIn && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={name.trim().length < 2 || slug.length < 2}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>

            {email && (
              <p className="text-center text-sm text-muted-foreground">
                Signed in as <span className="text-foreground">{email}</span>.{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/auth", replace: true });
                  }}
                >
                  Log out
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ready to launch</h1>
          <p className="mt-3 text-muted-foreground">Review your storefront and go live.</p>

          <div className="mt-8 space-y-4 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Shop name</span>
              <span className="font-medium text-foreground">{name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Public URL</span>
              <span className="font-mono text-sm text-primary">/{slug}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Owner</span>
              <span className="font-medium text-foreground">{ownerName || email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform fee</span>
              <span className="font-medium text-foreground">5% per sale</span>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} disabled={creating}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={creating}
              onClick={handleLaunch}
            >
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
              Launch my shop
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-2xl sm:p-12">
        <Link to="/" className="block text-center text-3xl font-bold tracking-tight">
          <span className="text-foreground">cina</span>
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Auth</span>
        </Link>

        <div className="mt-10 mb-10 flex items-center justify-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={
                      done
                        ? "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : active
                          ? "flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary"
                          : "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                    }
                  >
                    {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="mx-4 mb-6 h-px w-12 bg-border sm:w-20" />}
              </div>
            );
          })}
        </div>

        {children}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © 2026 cinaAuth · Terms of Service · Acceptable Use
      </p>
    </div>
  );
}
