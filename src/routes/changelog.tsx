import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GitCommitVertical } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — cinaAuth" },
      { name: "description", content: "Todos los cambios y novedades de la plataforma cinaAuth." },
      { property: "og:title", content: "Changelog — cinaAuth" },
      { property: "og:description", content: "Todos los cambios y novedades de la plataforma cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChangelogPage,
});

type Entry = { type: "added" | "changed" | "fixed"; text: string };
type Release = { date: string; title: string; entries: Entry[] };

const RELEASES: Release[] = [
  {
    date: "2026-09-05",
    title: "Efectos cyber y nueva portada",
    entries: [
      { type: "added", text: "Botón flotante para volver arriba, disponible en toda la web." },
      { type: "added", text: "Efectos visuales: brillo neón en bordes, elevación de tarjetas, aparición al hacer scroll y glitch cyber." },
      { type: "added", text: "Landing asimétrica con maqueta del panel conectada a datos reales." },
      { type: "added", text: "Logo nuevo de cinaAuth sin fondo, aplicado al panel y al favicon." },
      { type: "changed", text: "Web unificada al tema cyber: fondo negro, acento naranja, Orbitron + JetBrains Mono." },
      { type: "changed", text: "El panel muestra el nombre del dueño de la tienda en la tarjeta de perfil." },
      { type: "fixed", text: "Slugs de tienda duplicados generan una variante libre automáticamente." },
      { type: "fixed", text: "Error de campo de notificaciones inexistente." },
    ],
  },
  {
    date: "2026-09-04",
    title: "Lanzamiento de la plataforma",
    entries: [
      { type: "added", text: "Marketplace estilo Amazon: búsqueda, categorías, reviews verificadas, wishlist y recomendaciones." },
      { type: "added", text: "Carrito persistente y checkout con Stripe (pagos únicos y suscripciones)." },
      { type: "added", text: "Suscripciones con alta, cancelación, upgrade y downgrade." },
      { type: "added", text: "Panel de vendedor completo con 11 secciones y métricas en tiempo real." },
      { type: "added", text: "Onboarding en 3 pasos: Account, Shop y Launch." },
      { type: "added", text: "Login con email, Google OAuth y 2FA opcional (TOTP)." },
      { type: "added", text: "Roles de staff (admin, moderator, user) con consola en /admin." },
      { type: "added", text: "Analítica de tráfico: visitas, sesiones, fuentes, dispositivos y países." },
      { type: "added", text: "Subdominios de tienda *.cinaauth.com." },
    ],
  },
];

const BADGE: Record<Entry["type"], { label: string; className: string }> = {
  added: { label: "ADDED", className: "border-landing-accent/50 text-landing-accent" },
  changed: { label: "CHANGED", className: "border-landing-text/30 text-landing-text" },
  fixed: { label: "FIXED", className: "border-landing-muted/40 text-landing-muted" },
};

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-landing-bg text-landing-text cyber-grid">
      <header className="border-b border-landing-accent/20 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-landing-muted transition-colors hover:text-landing-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="font-[family-name:var(--font-display)] text-lg font-black tracking-tighter">
            <span className="text-landing-accent">cina</span>Auth
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-landing-accent">// CHANGELOG</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black uppercase tracking-tight text-glow-primary sm:text-5xl">
            Release log
          </h1>
          <p className="mt-4 max-w-lg text-sm text-landing-muted">
            Every change, fix and improvement shipped to the platform.
          </p>
        </ScrollReveal>

        <div className="mt-14 space-y-14">
          {RELEASES.map((release, ri) => (
            <ScrollReveal key={release.date} delay={ri * 100}>
              <section className="relative border-l-2 border-landing-accent/30 pl-6">
                <span className="absolute -left-[7px] top-1 h-3 w-3 bg-landing-accent" />
                <p className="font-mono text-xs uppercase tracking-widest text-landing-muted">{release.date}</p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight">
                  {release.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {release.entries.map((entry) => (
                    <li key={entry.text} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${BADGE[entry.type].className}`}
                      >
                        <GitCommitVertical className="h-3 w-3" />
                        {BADGE[entry.type].label}
                      </span>
                      <span className="text-sm text-landing-text/90">{entry.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-16 border-t border-landing-accent/10 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-landing-muted">
          © {new Date().getFullYear()} cinaAuth // End of log
        </p>
      </main>
    </div>
  );
}
