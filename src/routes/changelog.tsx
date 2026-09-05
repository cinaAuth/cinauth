import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ScrollReveal } from "@/components/ScrollReveal";

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

type Entry = { text: string; bold?: string };
type Release = {
  date: string;
  label: string;
  category: string;
  title: string;
  entries: Entry[];
};

const RELEASES: Release[] = [
  {
    date: "September 5, 2026",
    label: "2026-09-05",
    category: "Features",
    title: "Customizable Panel & Direct Onboarding",
    entries: [
      { text: "Light/dark mode and a 6-color accent palette now work across the entire site.", bold: "Light/dark mode" },
      { text: "Real notification center with an unread counter and mark-all-as-read.", bold: "Real notification center" },
      { text: "Panel header with a compact logo and quick access to notifications, theme and changelog.", bold: "Panel header" },
      { text: "All glows and accents now sync with the color chosen in the palette.", bold: "All glows and accents" },
      { text: "If you already have a store, onboarding takes you straight to the dashboard.", bold: "onboarding" },
      { text: "Seasonal ambient effects (snow, petals, leaves) and automatic seasonal accent themes.", bold: "Seasonal ambient effects" },
    ],
  },
  {
    date: "September 5, 2026",
    label: "2026-09-05-b",
    category: "Features",
    title: "Cyber Effects & New Homepage",
    entries: [
      { text: "Floating back-to-top button available across the whole site.", bold: "back-to-top button" },
      { text: "Visual effects: neon border glow, card lift on hover, scroll reveals and cyber glitch.", bold: "Visual effects" },
      { text: "Asymmetric landing page with a dashboard preview connected to real data.", bold: "Asymmetric landing page" },
      { text: "New cinaAuth logo with transparent background, applied to the panel and favicon.", bold: "New cinaAuth logo" },
      { text: "Site unified under the cyber theme: black background, orange accent, Orbitron + JetBrains Mono.", bold: "cyber theme" },
      { text: "The panel now shows the store owner's name on the profile card.", bold: "store owner's name" },
      { text: "Duplicate store slugs now generate a free variant automatically.", bold: "Duplicate store slugs" },
      { text: "Fixed a notifications field error.", bold: "Fixed" },
    ],
  },
  {
    date: "September 4, 2026",
    label: "2026-09-04",
    category: "Features",
    title: "Platform Launch",
    entries: [
      { text: "Public marketplace: search, categories, verified reviews, wishlist and recommendations.", bold: "Public marketplace" },
      { text: "Persistent cart and Stripe checkout with one-time payments and subscriptions.", bold: "Stripe checkout" },
      { text: "Subscriptions with sign-up, cancellation, upgrade and downgrade.", bold: "Subscriptions" },
      { text: "Full seller panel with 11 sections and real-time metrics.", bold: "Full seller panel" },
      { text: "3-step onboarding: Account, Shop and Launch.", bold: "3-step onboarding" },
      { text: "Sign in with email, Google OAuth and optional 2FA (TOTP).", bold: "Google OAuth" },
      { text: "Staff roles (admin, moderator, user) with an admin console.", bold: "Staff roles" },
      { text: "Traffic analytics: visits, sessions, sources, devices and countries.", bold: "Traffic analytics" },
      { text: "Store subdomains on *.cinaauth.com.", bold: "Store subdomains" },
    ],
  },
];

function EntryText({ entry }: { entry: Entry }) {
  if (!entry.bold) return <>{entry.text}</>;
  const idx = entry.text.indexOf(entry.bold);
  if (idx === -1) return <>{entry.text}</>;
  return (
    <>
      {entry.text.slice(0, idx)}
      <strong className="font-semibold text-foreground">{entry.bold}</strong>
      {entry.text.slice(idx + entry.bold.length)}
    </>
  );
}

function ChangelogPage() {
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
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Latest updates, improvements, and fixes to cinaAuth.
        </p>

        <div className="mt-12">
          {RELEASES.map((release, ri) => (
            <ScrollReveal key={release.label} delay={ri * 100}>
              <section className="relative border-l border-border py-2 pl-8 sm:pl-10">
                {/* Timeline dot */}
                <span className="absolute -left-[7.5px] top-4 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background" />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-primary/60 px-3 py-1 text-sm text-primary">
                    {release.category}
                  </span>
                  <time className="text-sm text-muted-foreground">{release.date}</time>
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {release.title}
                </h2>

                <ul className="mt-6 space-y-4">
                  {release.entries.map((entry) => (
                    <li key={entry.text} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      <span className="text-[15px] leading-relaxed text-muted-foreground">
                        <EntryText entry={entry} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} cinaAuth — End of log
        </p>
      </main>
    </div>
  );
}
