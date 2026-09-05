import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Copy, ExternalLink, Eye, EyeOff, FileText, GripVertical, Monitor, Plus, Save, Smartphone, Tablet, Trash2 } from "lucide-react";
import { getMyStorefront, saveMyStorefront } from "@/lib/storefront.functions";
import {
  BLOCK_LABELS,
  DEFAULT_SETTINGS,
  newBlock,
  type BlockType,
  type StorefrontBlock,
  type StorefrontSettings,
} from "@/lib/storefront";
import { BlockRenderer } from "@/components/StorefrontBlocks";

export const Route = createFileRoute("/_authenticated/panel/storefront/visual-editor")({
  head: () => ({
    meta: [
      { title: "Visual Editor — cinaAuth" },
      { name: "description", content: "Build your storefront with drag-free blocks: hero, products, features, FAQ and more." },
      { property: "og:title", content: "Visual Editor — cinaAuth" },
      { property: "og:description", content: "Design your store page block by block and publish it instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisualEditorPage,
});

const ACCENTS = ["#F97316", "#A855F7", "#22D3EE", "#22C55E", "#EF4444", "#3B82F6"];
const ADDABLE: BlockType[] = ["announcement", "hero", "products", "text", "features", "faq", "cta"];

function VisualEditorPage() {
  const loadFn = useServerFn(getMyStorefront);
  const saveFn = useServerFn(saveMyStorefront);
  const { data, isLoading } = useQuery({ queryKey: ["my-storefront"], queryFn: () => loadFn() });

  const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
  const [settings, setSettings] = useState<StorefrontSettings>(DEFAULT_SETTINGS);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"builder" | "settings">("builder");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      setBlocks(data.blocks as StorefrontBlock[]);
      setSettings(data.settings as StorefrontSettings);
      setSelected((data.blocks as StorefrontBlock[])[0]?.id ?? null);
    }
  }, [data]);

  function update(id: string, patch: Partial<StorefrontBlock>) {
    setBlocks((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function updateData(id: string, patch: Record<string, any>) {
    setBlocks((b) => b.map((x) => (x.id === id ? { ...x, data: { ...x.data, ...patch } } : x)));
  }
  function reorder(from: number, to: number) {
    setBlocks((b) => {
      const next = [...b];
      const [moved] = next.splice(from, 1);
      if (!moved) return b;
      next.splice(to, 0, moved);
      return next;
    });
  }
  function move(index: number, dir: -1 | 1) {
    setBlocks((b) => {
      const next = [...b];
      const target = index + dir;
      if (target < 0 || target >= next.length) return b;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
  }
  function add(type: BlockType) {
    const block = newBlock(type);
    setBlocks((b) => [...b, block]);
    setSelected(block.id);
  }

  async function onSave() {
    setSaving(true);
    try {
      await saveFn({ data: { blocks, settings } });
      toast.success("Storefront published");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading editor…</div>;
  }

  if (!data?.store) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">Visual Editor</h1>
        <p className="mt-2 text-muted-foreground">Create your store first to design its page.</p>
        <Link to="/onboarding" className="mt-4 inline-block">
          <Button>Create store</Button>
        </Link>
      </div>
    );
  }

  const current = blocks.find((b) => b.id === selected) ?? null;

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${data.store.slug}`;
  const deviceWidth = device === "mobile" ? 390 : device === "tablet" ? 768 : 1100;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden lg:flex-row">
      {/* Left: builder panel */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card lg:w-[280px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-bold tracking-tight text-foreground">{data.store.name}</span>
          <Button size="sm" onClick={onSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "…" : "Publish"}
          </Button>
        </div>

        <div className="mx-3 mb-3 grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
          {(["builder", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                tab === t ? "bg-background text-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {tab === "builder" ? (
            <>
              <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Components on page
              </p>
              <div className="space-y-1.5">
                {blocks.map((b, i) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
                      setDragIndex(null);
                    }}
                    onClick={() => setSelected(b.id)}
                    className={`group flex cursor-grab items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors ${
                      selected === b.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-foreground hover:border-primary/40"
                    } ${b.visible ? "" : "opacity-50"}`}
                  >
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{BLOCK_LABELS[b.type]}</span>
                    <button
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        update(b.id, { visible: !b.visible });
                      }}
                      aria-label="Toggle visibility"
                    >
                      {b.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                    <button
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlocks((prev) => prev.filter((x) => x.id !== b.id));
                      }}
                      aria-label="Delete block"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="px-1 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Add component
              </p>
              <div className="space-y-1.5">
                {ADDABLE.map((t) => (
                  <button
                    key={t}
                    onClick={() => add(t)}
                    className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" /> {BLOCK_LABELS[t]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <ThemeSettings settings={settings} setSettings={setSettings} />
          )}
        </div>
      </aside>

      {/* Center: canvas */}
      <section className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
          <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="leading-tight">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Page</p>
              <p className="text-xs font-medium text-foreground">Home Page</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border px-2.5 py-2">
            <span className="truncate text-xs text-muted-foreground">{storeUrl}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
                toast.success("Link copied");
              }}
              aria-label="Copy store link"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Link to="/$storeSlug" params={{ storeSlug: data.store.slug }} target="_blank" aria-label="Open store">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([key, Icon]) => (
              <button
                key={key}
                onClick={() => setDevice(key)}
                aria-label={key}
                className={`rounded p-1.5 ${device === key ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div
            className="mx-auto border border-border bg-background shadow-lg transition-all"
            style={{ width: deviceWidth, maxWidth: "100%" }}
          >
            {blocks.map((b) =>
              b.type === "products" ? (
                b.visible ? (
                  <section key={b.id} className="px-4 py-10" onClick={() => setSelected(b.id)}>
                    <h2 className="text-2xl font-bold text-foreground">{b.data.title}</h2>
                    <div className={`mt-6 grid gap-4 ${b.data.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="border border-dashed border-border p-6 text-xs text-muted-foreground">
                          Product {i + 1}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null
              ) : (
                <div key={b.id} onClick={() => setSelected(b.id)} className={selected === b.id ? "ring-1 ring-primary" : ""}>
                  <BlockRenderer block={b} settings={settings} />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Right: inspector */}
      <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card p-4 lg:w-[320px] lg:border-l lg:border-t-0">
        <div className="space-y-4">

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider">
                {current ? BLOCK_LABELS[current.type] : "Block settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!current && <p className="text-sm text-muted-foreground">Pick a block on the left.</p>}

              {current?.type === "announcement" && (
                <Field label="Text">
                  <Input value={current.data.text ?? ""} onChange={(e) => updateData(current.id, { text: e.target.value })} />
                </Field>
              )}

              {current?.type === "hero" && (
                <>
                  <Field label="Eyebrow">
                    <Input value={current.data.eyebrow ?? ""} onChange={(e) => updateData(current.id, { eyebrow: e.target.value })} />
                  </Field>
                  <Field label="Title">
                    <Input value={current.data.title ?? ""} onChange={(e) => updateData(current.id, { title: e.target.value })} />
                  </Field>
                  <Field label="Subtitle">
                    <Textarea value={current.data.subtitle ?? ""} onChange={(e) => updateData(current.id, { subtitle: e.target.value })} />
                  </Field>
                  <Field label="Button label">
                    <Input value={current.data.buttonLabel ?? ""} onChange={(e) => updateData(current.id, { buttonLabel: e.target.value })} />
                  </Field>
                  <Field label="Alignment">
                    <select
                      className="w-full border border-border bg-background p-2 text-sm text-foreground"
                      value={current.data.align ?? "center"}
                      onChange={(e) => updateData(current.id, { align: e.target.value })}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                    </select>
                  </Field>
                </>
              )}

              {current?.type === "products" && (
                <>
                  <Field label="Title">
                    <Input value={current.data.title ?? ""} onChange={(e) => updateData(current.id, { title: e.target.value })} />
                  </Field>
                  <Field label="Columns">
                    <select
                      className="w-full border border-border bg-background p-2 text-sm text-foreground"
                      value={String(current.data.columns ?? 3)}
                      onChange={(e) => updateData(current.id, { columns: Number(e.target.value) })}
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </Field>
                </>
              )}

              {current?.type === "text" && (
                <>
                  <Field label="Title">
                    <Input value={current.data.title ?? ""} onChange={(e) => updateData(current.id, { title: e.target.value })} />
                  </Field>
                  <Field label="Body">
                    <Textarea rows={6} value={current.data.body ?? ""} onChange={(e) => updateData(current.id, { body: e.target.value })} />
                  </Field>
                </>
              )}

              {current?.type === "cta" && (
                <>
                  <Field label="Title">
                    <Input value={current.data.title ?? ""} onChange={(e) => updateData(current.id, { title: e.target.value })} />
                  </Field>
                  <Field label="Body">
                    <Textarea value={current.data.body ?? ""} onChange={(e) => updateData(current.id, { body: e.target.value })} />
                  </Field>
                  <Field label="Button label">
                    <Input value={current.data.buttonLabel ?? ""} onChange={(e) => updateData(current.id, { buttonLabel: e.target.value })} />
                  </Field>
                  <Field label="Button link">
                    <Input value={current.data.buttonUrl ?? ""} onChange={(e) => updateData(current.id, { buttonUrl: e.target.value })} />
                  </Field>
                </>
              )}

              {(current?.type === "features" || current?.type === "faq") && (
                <>
                  <Field label="Title">
                    <Input value={current.data.title ?? ""} onChange={(e) => updateData(current.id, { title: e.target.value })} />
                  </Field>
                  {(current.data.items ?? []).map((item: any, i: number) => (
                    <div key={i} className="space-y-2 border border-border p-2">
                      <Input
                        value={item.title ?? ""}
                        placeholder="Title"
                        onChange={(e) => {
                          const items = [...current.data.items];
                          items[i] = { ...items[i], title: e.target.value };
                          updateData(current.id, { items });
                        }}
                      />
                      <Textarea
                        value={item.body ?? ""}
                        placeholder="Text"
                        onChange={(e) => {
                          const items = [...current.data.items];
                          items[i] = { ...items[i], body: e.target.value };
                          updateData(current.id, { items });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateData(current.id, { items: current.data.items.filter((_: any, j: number) => j !== i) })}
                      >
                        <Trash2 className="mr-2 h-3 w-3" /> Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateData(current.id, { items: [...(current.data.items ?? []), { title: "New item", body: "" }] })}
                  >
                    <Plus className="mr-2 h-3 w-3" /> Add item
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </aside>
    </div>
  );
}

function ThemeSettings({
  settings,
  setSettings,
}: {
  settings: StorefrontSettings;
  setSettings: React.Dispatch<React.SetStateAction<StorefrontSettings>>;
}) {
  return (
    <div className="space-y-4">
      <Field label="Accent">
        <div className="flex gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              aria-label={`Accent ${c}`}
              onClick={() => setSettings((s) => ({ ...s, accent: c }))}
              className={`h-7 w-7 rounded-full border-2 ${settings.accent === c ? "border-foreground" : "border-transparent"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
      <Field label="Corners">
        <select
          className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
          value={settings.radius}
          onChange={(e) => setSettings((s) => ({ ...s, radius: e.target.value as StorefrontSettings["radius"] }))}
        >
          <option value="none">Sharp</option>
          <option value="md">Soft</option>
          <option value="xl">Rounded</option>
        </select>
      </Field>
      <Field label="Content width">
        <select
          className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
          value={settings.width}
          onChange={(e) => setSettings((s) => ({ ...s, width: e.target.value as StorefrontSettings["width"] }))}
        >
          <option value="wide">Wide</option>
          <option value="narrow">Narrow</option>
        </select>
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Search bar</span>
        <Switch checked={settings.showSearch} onCheckedChange={(v) => setSettings((s) => ({ ...s, showSearch: v }))} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Categories</span>
        <Switch checked={settings.showCategories} onCheckedChange={(v) => setSettings((s) => ({ ...s, showCategories: v }))} />
      </div>
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
