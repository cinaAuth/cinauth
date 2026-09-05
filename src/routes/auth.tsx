import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/Logo";
import { notifyNewLogin } from "@/lib/security.functions";
import { Loader2, ShieldCheck, Globe, Wallet, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — cinaAuth" },
      { name: "description", content: "Sign in or create an account to start selling digital products on cinaAuth." },
      { property: "og:title", content: "Sign in — cinaAuth" },
      { property: "og:description", content: "Sign in or create an account to start selling digital products on cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const navigate = useNavigate();

  /** Avisa por correo de un nuevo inicio de sesión (no bloquea el flujo). */
  const sendNewLoginAlert = (method: string) => {
    void notifyNewLogin({
      data: {
        method,
        device: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown device",
        timeZone:
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "Unknown location",
      },
    }).catch(() => {});
  };

  /** Envía al paso de verificación si la cuenta tiene 2FA activo. */
  const continueAfterAuth = async () => {
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        navigate({ to: "/mfa", replace: true });
        return;
      }
    } catch {
      /* si no se puede consultar, continúa al panel */
    }
    navigate({ to: "/loading", replace: true });
  };

  useEffect(() => {
    let active = true;
    const continueSignedInUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      await continueAfterAuth();
    };
    continueSignedInUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        sendNewLoginAlert("Google");
        void continueAfterAuth();
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    sendNewLoginAlert("Password");
    await continueAfterAuth();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    if (data.session) {
      await continueAfterAuth();
      return;
    }
    setMessage({ type: "success", text: "Check your email to confirm your account." });
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setLoading(false);
      setMessage({ type: "error", text: result.error.message });
      return;
    }
    if (!result.redirected) await continueAfterAuth();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Enter your email address first." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setMessage(error
      ? { type: "error", text: error.message }
      : { type: "success", text: "Check your email for the password reset link." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
        {/* Columna del formulario */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 xl:px-14">
          <Link to="/" className="inline-flex">
            <Logo className="scale-110 origin-left" />
          </Link>

          <h1 className="mt-10 font-display text-4xl font-black tracking-tight text-foreground">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {mode === "signin" ? "Sign in to your dashboard." : "Launch your digital store in minutes."}
          </p>

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-14 rounded-xl border-border bg-muted/40 px-4 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                {mode === "signin" && (
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="h-14 rounded-xl border-border bg-muted/40 px-4 pr-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {message && (
            <Alert className="mt-4 rounded-xl" variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest text-muted-foreground">
              <span className="bg-card px-3">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="h-12 w-full rounded-xl" onClick={handleGoogle} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="mt-8 text-center text-base text-muted-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}
              className="font-bold text-foreground hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Protected by two-step verification.{" "}
            <Link to="/" className="underline hover:text-foreground">Privacy</Link> and{" "}
            <Link to="/" className="underline hover:text-foreground">Terms</Link> apply.
          </p>
        </div>

        {/* Columna informativa */}
        <div className="relative hidden overflow-hidden border-l border-border bg-muted/20 md:block">
          <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          {/* Silueta de globo digital */}
          <div className="pointer-events-none absolute -right-10 top-1/2 w-[26rem] -translate-y-1/2 opacity-20">
            <svg viewBox="0 0 400 400" className="h-full w-full text-primary" fill="currentColor">
              <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <ellipse cx="200" cy="200" rx="180" ry="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <ellipse cx="200" cy="200" rx="60" ry="180" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <ellipse cx="200" cy="200" rx="140" ry="120" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" transform="rotate(30 200 200)" />
              <ellipse cx="200" cy="200" rx="140" ry="120" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" transform="rotate(-30 200 200)" />
            </svg>
          </div>

          <div className="relative flex h-full flex-col justify-center px-8 py-12 xl:px-14">
            <h2 className="font-display text-4xl font-black leading-tight text-foreground">
              The commerce terminal<br />
              <span className="text-primary">for digital builders.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Launch your store, automate delivery, and own every transaction — no middlemen, no hidden cuts.
            </p>

            <ul className="mt-10 space-y-7">
              {[
                { icon: Wallet, title: "Keep what you earn", desc: "Transparent fee structure. Your revenue stays yours, minus standard processor costs." },
                { icon: Globe, title: "Global by default", desc: "Cards, wallets, crypto and local methods ready for buyers in any market." },
                { icon: ShieldCheck, title: "Hardened checkout", desc: "Built-in fraud signals, VPN filtering and secure access controls protect every sale." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-foreground">{item.title}</span>
                    <span className="mt-1 block text-base text-muted-foreground">{item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-12 text-sm text-muted-foreground">
              © {new Date().getFullYear()} cinaAuth - Terms of Service - Acceptable Use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

