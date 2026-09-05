import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyStore } from "@/lib/stores.functions";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/loading")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Loading — cinaAuth" },
      { name: "description", content: "Loading your cinaAuth dashboard." },
    ],
  }),
  component: LoadingPage,
});

function LoadingPage() {
  const navigate = useNavigate();
  const getMyStoreFn = useServerFn(getMyStore);
  const [status, setStatus] = useState("Checking session...");

  useEffect(() => {
    let active = true;
    async function route() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      setStatus("Loading your store...");
      try {
        const res = await getMyStoreFn();
        if (!active) return;
        if (res?.store) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          navigate({ to: "/onboarding", replace: true });
        }
      } catch {
        if (!active) return;
        navigate({ to: "/onboarding", replace: true });
      }
    }
    route();
    return () => {
      active = false;
    };
  }, [navigate, getMyStoreFn]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6">
        <Logo className="scale-125" />
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium tracking-wide">{status}</span>
        </div>
      </div>
    </div>
  );
}
