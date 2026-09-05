import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  configFieldsFor,
  PAYMENT_METHODS,
  PAYMENT_METHOD_CATEGORIES,
  PAYMENT_METHOD_MAP,
  DEFAULT_ENABLED_METHODS,
  type PaymentMethodDef,
} from "@/lib/payment-methods";
import { listPaymentMethods, setPaymentMethod } from "@/lib/payment-methods.functions";

function MethodIcon({ method }: { method: PaymentMethodDef }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
      style={{ backgroundColor: method.color }}
      aria-hidden
    >
      {method.slug && !failed ? (
        <img
          src={`https://cdn.simpleicons.org/${method.slug}/white`}
          alt=""
          loading="lazy"
          className="h-6 w-6"
          onError={() => setFailed(true)}
        />
      ) : (
        method.initials
      )}
    </div>
  );
}

function MethodRow({
  method,
  enabled,
  onToggle,
  onConfigure,
  configured,
}: {
  method: PaymentMethodDef;
  enabled: boolean;
  onToggle?: (v: boolean) => void;
  onConfigure?: () => void;
  configured: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <MethodIcon method={method} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{method.name}</p>
        <p className="truncate text-xs text-muted-foreground">{method.description}</p>
      </div>
      <button
        type="button"
        onClick={() => (configured ? onConfigure?.() : onToggle?.(true))}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-primary hover:underline"
      >
        {configured ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {configured ? "Configure" : "Add"}
      </button>
      {configured && <Switch checked={enabled} onCheckedChange={(v) => onToggle?.(v)} aria-label={method.name} />}
    </div>
  );
}

export function PaymentMethodsPanel({ group, title }: { group: string; title: string }) {
  const fetchMethods = useServerFn(listPaymentMethods);
  const saveMethod = useServerFn(setPaymentMethod);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [editing, setEditing] = useState<PaymentMethodDef | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data } = useQuery({ queryKey: ["payment-methods"], queryFn: () => fetchMethods() });

  const state = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const key of DEFAULT_ENABLED_METHODS) map.set(key, true);
    for (const row of data?.methods ?? []) map.set(row.method_key, row.enabled);
    return map;
  }, [data]);

  const configs = useMemo(() => {
    const map = new Map<string, Record<string, string>>();
    for (const row of data?.methods ?? []) map.set(row.method_key, (row as any).config ?? {});
    return map;
  }, [data]);

  function openConfigure(method: PaymentMethodDef) {
    setForm(configs.get(method.key) ?? {});
    setEditing(method);
  }

  const mutation = useMutation({
    mutationFn: (vars: { methodKey: string; enabled: boolean; config?: Record<string, string> }) =>
      saveMethod({ data: vars }),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      const name = PAYMENT_METHOD_MAP[vars.methodKey]?.name ?? vars.methodKey;
      if (vars.config) toast.success(`${name} settings saved`);
      else toast.success(vars.enabled ? `${name} enabled` : `${name} disabled`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const configuredKeys = [...state.keys()];
  const configured = configuredKeys
    .map((k) => PAYMENT_METHOD_MAP[k])
    .filter((m): m is PaymentMethodDef => Boolean(m))
    .filter((m) => (tab === "active" ? state.get(m.key) : !state.get(m.key)));

  const available = PAYMENT_METHODS.filter((m) => !state.has(m.key));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">{group}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">Configure your payment methods.</p>

      {!data?.store && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
          Create your store first to save payment methods.{" "}
          <Link to="/onboarding" className="text-primary underline">
            Create store
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Configured Methods</h2>
        <div className="flex items-center gap-6 border-b border-border">
          {(["active", "inactive"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-2 text-sm capitalize ${
                tab === t ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {configured.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tab === "active" ? "No active methods yet." : "No inactive methods."}
          </p>
        ) : (
          configured.map((m) => (
            <MethodRow
              key={m.key}
              method={m}
              configured
              enabled={!!state.get(m.key)}
              onConfigure={() => openConfigure(m)}
              onToggle={(v) => mutation.mutate({ methodKey: m.key, enabled: v })}
            />
          ))
        )}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Available Payment Methods</h2>
      {PAYMENT_METHOD_CATEGORIES.map((cat) => {
        const items = available.filter((m) => m.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat.label}</p>
            <div className="mt-3 space-y-3">
              {items.map((m) => (
                <MethodRow
                  key={m.key}
                  method={m}
                  configured={false}
                  enabled={false}
                  onToggle={() => mutation.mutate({ methodKey: m.key, enabled: true })}
                />
              ))}
            </div>
          </section>
        );
      })}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editing &&
              configFieldsFor(editing).map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.key === "instructions" ? (
                    <Textarea
                      id={f.key}
                      value={form[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type={f.secret ? "password" : "text"}
                      value={form[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                if (!editing) return;
                mutation.mutate(
                  { methodKey: editing.key, enabled: state.get(editing.key) ?? true, config: form },
                  { onSuccess: () => setEditing(null) },
                );
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
        <Link to="/checkout">
          <Button>Open checkout</Button>
        </Link>
      </div>
    </div>
  );
}
