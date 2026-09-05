import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — cinaAuth" },
      { name: "description", content: "Choose a new password for your cinaAuth account." },
      { property: "og:title", content: "Reset password — cinaAuth" },
      { property: "og:description", content: "Choose a new password for your cinaAuth account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recovery = window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery";
    supabase.auth.getSession().then(({ data }) => setReady(recovery || Boolean(data.session)));
  }, []);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Choose a new password</CardTitle><CardDescription>Use at least eight characters and avoid a password used elsewhere.</CardDescription></CardHeader>
        <CardContent>
          {!ready ? <Alert variant="destructive"><AlertDescription>This recovery link is invalid or has expired.</AlertDescription></Alert> : (
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
              {message && <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={loading}>Save new password</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}