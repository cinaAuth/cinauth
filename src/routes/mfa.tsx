import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Wallet, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/mfa")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Two-step verification — cinaAuth" },
      { name: "description", content: "Secure your cinaAuth account with two-step verification." },
      { property: "og:title", content: "Two-step verification — cinaAuth" },
      { property: "og:description", content: "Secure your cinaAuth account with two-step verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MfaPage,
});

type Enrollment = { id: string; qrCode: string; secret: string };

function MfaPage() {
  const navigate = useNavigate();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function prepare() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        navigate({ to: "/onboarding", replace: true });
        return;
      }

      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (factorError) {
        setMessage(factorError.message);
        setLoading(false);
        return;
      }

      const verified = factors.totp.find((factor) => factor.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "cinaAuth",
      });
      if (!active) return;
      if (error) {
        setMessage(error.message);
      } else {
        setFactorId(data.id);
        setEnrollment({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      }
      setLoading(false);
    }
    prepare();
    return () => { active = false; };
  }, [navigate]);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setLoading(false);
    if (error) {
      setMessage("The code is invalid or has expired. Try again.");
      return;
    }
    navigate({ to: "/loading", replace: true });
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
            Two-step verification
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {enrollment
              ? "Scan the code with your authenticator app, then enter the six-digit code."
              : "Enter the code from your authenticator app to continue."}
          </p>

          {loading && !factorId ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={verify} className="mt-8 space-y-6">
              {enrollment && (
                <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-5 text-center">
                  <img
                    src={enrollment.qrCode}
                    alt="QR code for cinaAuth two-step verification"
                    className="mx-auto h-48 w-48 rounded-md bg-foreground p-2"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Manual setup key</p>
                    <code className="mt-1 block break-all text-xs text-foreground">{enrollment.secret}</code>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="mfa-code" className="text-sm font-semibold text-foreground">
                  Verification code
                </Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-14 rounded-xl border-border bg-muted/40 px-4 text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>

              {message && (
                <Alert className="rounded-xl" variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
                disabled={loading || code.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Verify and continue
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Lost access to your authenticator?{" "}
            <Link to="/auth" className="font-bold text-foreground hover:underline">
              Start over
            </Link>
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
              Secure your<br />
              <span className="text-primary">digital empire.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Add an extra layer of protection to your account and keep every transaction under your control.
            </p>

            <ul className="mt-10 space-y-7">
              {[
                { icon: ShieldCheck, title: "TOTP verification", desc: "Use any authenticator app to generate time-based codes that only you can produce." },
                { icon: Wallet, title: "Account lock protection", desc: "Even if your password leaks, your store and revenue stay protected." },
                { icon: Globe, title: "One setup, every device", desc: "Scan once and sign in securely from anywhere without SMS delays." },
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
