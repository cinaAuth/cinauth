import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Terminal } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useI18n } from "@/lib/i18n";
import { changelogT, type ChangelogKey } from "@/lib/i18n-changelog";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — cinaAuth" },
      { name: "description", content: "Latest updates, improvements, and fixes to cinaAuth." },
      { property: "og:title", content: "Changelog — cinaAuth" },
      { property: "og:description", content: "Latest updates, improvements, and fixes to cinaAuth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChangelogPage,
});

type EntryKeys = { lead: ChangelogKey; rest: ChangelogKey };
type ReleaseMeta = {
  iso: string;
  version: string;
  title: ChangelogKey;
  entries: EntryKeys[];
};

const RELEASES: ReleaseMeta[] = [
  {
    iso: "2026-09-05",
    version: "v1.3.0",
    title: "r4.title",
    entries: [
      { lead: "r4.e1.lead", rest: "r4.e1.rest" },
      { lead: "r4.e2.lead", rest: "r4.e2.rest" },
      { lead: "r4.e3.lead", rest: "r4.e3.rest" },
      { lead: "r4.e4.lead", rest: "r4.e4.rest" },
      { lead: "r4.e5.lead", rest: "r4.e5.rest" },
      { lead: "r4.e6.lead", rest: "r4.e6.rest" },
      { lead: "r4.e7.lead", rest: "r4.e7.rest" },
    ],
  },
  {
    iso: "2026-09-05",
    version: "v1.2.0",
    title: "r3.title",
    entries: [
      { lead: "r3.e1.lead", rest: "r3.e1.rest" },
      { lead: "r3.e2.lead", rest: "r3.e2.rest" },
      { lead: "r3.e3.lead", rest: "r3.e3.rest" },
      { lead: "r3.e4.lead", rest: "r3.e4.rest" },
      { lead: "r3.e5.lead", rest: "r3.e5.rest" },
      { lead: "r3.e6.lead", rest: "r3.e6.rest" },
    ],
  },
  {
    iso: "2026-09-05",
    version: "v1.1.0",
    title: "r2.title",
    entries: [
      { lead: "r2.e1.lead", rest: "r2.e1.rest" },
      { lead: "r2.e2.lead", rest: "r2.e2.rest" },
      { lead: "r2.e3.lead", rest: "r2.e3.rest" },
      { lead: "r2.e4.lead", rest: "r2.e4.rest" },
      { lead: "r2.e5.lead", rest: "r2.e5.rest" },
      { lead: "r2.e6.lead", rest: "r2.e6.rest" },
      { lead: "r2.e7.lead", rest: "r2.e7.rest" },
      { lead: "r2.e8.lead", rest: "r2.e8.rest" },
    ],
  },
  {
    iso: "2026-09-04",
    version: "v1.0.0",
    title: "r1.title",
    entries: [
      { lead: "r1.e1.lead", rest: "r1.e1.rest" },
      { lead: "r1.e2.lead", rest: "r1.e2.rest" },
      { lead: "r1.e3.lead", rest: "r1.e3.rest" },
      { lead: "r1.e4.lead", rest: "r1.e4.rest" },
      { lead: "r1.e5.lead", rest: "r1.e5.rest" },
      { lead: "r1.e6.lead", rest: "r1.e6.rest" },
      { lead: "r1.e7.lead", rest: "r1.e7.rest" },
      { lead: "r1.e8.lead", rest: "r1.e8.rest" },
      { lead: "r1.e9.lead", rest: "r1.e9.rest" },
    ],
  },
];

function ChangelogPage() {
  const { lang } = useI18n();
  const t = changelogT(lang);
  const dateFmt = new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/20 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" aria-label="Back to home">
            <Logo iconClassName="h-8 w-8 rounded-none" wordClassName="font-display text-lg uppercase tracking-widest" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-primary/30 px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary">// system_log</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wider text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
          {t("subtitle")}
        </p>

        <div className="mt-12 space-y-8">
          {RELEASES.map((release, ri) => (
            <ScrollReveal key={release.title} delay={ri * 100}>
              <section className="rounded-none border border-primary/20 bg-card/80 transition-all card-hover-lift glow-border-hover hover:glow-border-primary">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/15 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                      {release.version}
                    </span>
                    <span className="border border-primary/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                      {t("category")}
                    </span>
                  </div>
                  <time className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {dateFmt.format(new Date(`${release.iso}T12:00:00Z`))}
                  </time>
                </div>

                <div className="px-5 py-5">
                  <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground sm:text-2xl">
                    {t(release.title)}
                  </h2>

                  <ul className="mt-5 space-y-3">
                    {release.entries.map((entry) => (
                      <li key={entry.lead} className="flex items-start gap-3">
                        <span className="mt-1.5 text-[11px] text-primary">▸</span>
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          <strong className="font-semibold text-foreground">{t(entry.lead)}</strong>
                          {t(entry.rest)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-14 border-t border-primary/20 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          [ © {new Date().getFullYear()} cinaAuth // {t("end")} ]
        </p>
      </main>
    </div>
  );
}
