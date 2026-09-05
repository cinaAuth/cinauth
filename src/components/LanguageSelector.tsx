import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";
import { REGION_FLAGS } from "@/components/RegionFlags";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className, triggerClassName }: { className?: string; triggerClassName?: string }) {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const sorted = [...LANGUAGES].sort((a, b) => a.label.localeCompare(b.label, "es"));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("ui.language")}
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", triggerClassName, className)}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 rounded-none p-1">
        <p className="px-2 py-1.5 font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          // {t("ui.language")}
        </p>
        <ul className="max-h-72 overflow-y-auto">
          {sorted.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => setLang(l.code as LangCode)}
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  l.code === current.code && "text-primary",
                )}
              >
                {REGION_FLAGS[l.code] ?? <span aria-hidden>{l.flag}</span>}
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
