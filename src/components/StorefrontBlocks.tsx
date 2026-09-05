import type { StorefrontBlock, StorefrontSettings } from "@/lib/storefront";

const radiusClass: Record<StorefrontSettings["radius"], string> = {
  none: "rounded-none",
  md: "rounded-md",
  xl: "rounded-2xl",
};

export function BlockRenderer({
  block,
  settings,
  onCta,
}: {
  block: StorefrontBlock;
  settings: StorefrontSettings;
  onCta?: () => void;
}) {
  if (!block.visible) return null;
  const r = radiusClass[settings.radius];
  const accent = settings.accent;
  const d = block.data ?? {};

  switch (block.type) {
    case "announcement":
      return (
        <div className="w-full px-4 py-2 text-center text-xs font-medium uppercase tracking-wider" style={{ background: accent, color: "#0A0A0A" }}>
          {d.text}
        </div>
      );

    case "hero":
      return (
        <section className={`px-4 py-12 ${d.align === "left" ? "text-left" : "text-center"}`}>
          {d.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
              {d.eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{d.title}</h1>
          {d.subtitle && (
            <p className={`mt-4 max-w-2xl text-lg text-muted-foreground ${d.align === "left" ? "" : "mx-auto"}`}>{d.subtitle}</p>
          )}
          {d.buttonLabel && (
            <button
              onClick={onCta}
              className={`mt-6 px-6 py-3 text-sm font-semibold ${r}`}
              style={{ background: accent, color: "#0A0A0A" }}
            >
              {d.buttonLabel}
            </button>
          )}
        </section>
      );

    case "text":
      return (
        <section className="px-4 py-10">
          {d.title && <h2 className="text-2xl font-bold text-foreground">{d.title}</h2>}
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{d.body}</p>
        </section>
      );

    case "features":
      return (
        <section className="px-4 py-10">
          {d.title && <h2 className="text-2xl font-bold text-foreground">{d.title}</h2>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(d.items ?? []).map((item: any, i: number) => (
              <div key={i} className={`border border-border bg-card p-5 ${r}`} style={{ borderTopColor: accent }}>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="px-4 py-10">
          {d.title && <h2 className="text-2xl font-bold text-foreground">{d.title}</h2>}
          <div className="mt-6 space-y-3">
            {(d.items ?? []).map((item: any, i: number) => (
              <details key={i} className={`border border-border bg-card p-4 ${r}`}>
                <summary className="cursor-pointer font-medium text-foreground">{item.title}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </details>
            ))}
          </div>
        </section>
      );

    case "cta":
      return (
        <section className={`my-10 border border-border bg-card px-6 py-10 text-center ${r}`} style={{ borderColor: accent }}>
          <h2 className="text-2xl font-bold text-foreground">{d.title}</h2>
          {d.body && <p className="mt-2 text-muted-foreground">{d.body}</p>}
          {d.buttonLabel && (
            <a
              href={d.buttonUrl || "#"}
              className={`mt-5 inline-block px-6 py-3 text-sm font-semibold ${r}`}
              style={{ background: accent, color: "#0A0A0A" }}
            >
              {d.buttonLabel}
            </a>
          )}
        </section>
      );

    default:
      return null;
  }
}
