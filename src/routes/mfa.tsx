import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    navigate({ to: "/onboarding", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Two-step verification</CardTitle>
          <CardDescription>
            {enrollment ? "Scan the code with your authenticator app, then enter the six-digit code." : "Enter the code from your authenticator app."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !factorId ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <form onSubmit={verify} className="space-y-5">
              {enrollment && (
                <div className="space-y-3 text-center">
                  <img src={enrollment.qrCode} alt="QR code for cinaAuth two-step verification" className="mx-auto h-48 w-48 rounded-md bg-foreground p-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Manual setup key</p>
                    <code className="mt-1 block break-all text-xs text-foreground">{enrollment.secret}</code>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Verification code</Label>
                <Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" required />
              </div>
              {message && <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and continue
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}