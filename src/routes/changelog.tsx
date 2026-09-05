import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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
  title: ChangelogKey;
  entries: EntryKeys[];
};

const RELEASES: ReleaseMeta[] = [
  {
    iso: "2026-09-05",
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
      <header className="px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" aria-label="Back to home">
            <Logo iconClassName="h-8 w-8 rounded-md" wordClassName="text-xl" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-12">
          {RELEASES.map((release, ri) => (
            <ScrollReveal key={release.title} delay={ri * 100}>
              <section className="relative border-l border-border py-2 pl-8 sm:pl-10">
                {/* Timeline dot */}
                <span className="absolute -left-[7.5px] top-4 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background" />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-primary/60 px-3 py-1 text-sm text-primary">
                    {t("category")}
                  </span>
                  <time className="text-sm text-muted-foreground">
                    {dateFmt.format(new Date(`${release.iso}T12:00:00Z`))}
                  </time>
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {t(release.title)}
                </h2>

                <ul className="mt-6 space-y-4">
                  {release.entries.map((entry) => (
                    <li key={entry.lead} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      <span className="text-[15px] leading-relaxed text-muted-foreground">
                        <strong className="font-semibold text-foreground">{t(entry.lead)}</strong>
                        {t(entry.rest)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} cinaAuth — {t("end")}
        </p>
      </main>
    </div>
  );
}
