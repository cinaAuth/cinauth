import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, FileText, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationsRead } from "@/lib/checkout.functions";
import { ACCENTS, applyAccent, applyThemeMode, applySeasonalAccent, readAccent, readAutoSeason, readEffectsEnabled, readThemeMode, setAutoSeason, setEffectsEnabled, type AccentKey, type ThemeMode } from "@/lib/theme";
import { getSeasonInfo } from "@/lib/seasons";
import { cn } from "@/lib/utils";

const iconBtn = "h-8 w-8 text-muted-foreground hover:text-sidebar-foreground";

function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    setMode(readThemeMode());
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={iconBtn}
      aria-label="Toggle light or dark mode"
      onClick={() => {
        const next: ThemeMode = mode === "dark" ? "light" : "dark";
        setMode(next);
        applyThemeMode(next);
      }}
    >
      {mode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

function AccentPicker() {
  const [accent, setAccent] = useState<AccentKey>("orange");
  const [auto, setAuto] = useState(false);
  const [effects, setEffects] = useState(true);
  const season = getSeasonInfo();

  useEffect(() => {
    setAccent(readAccent());
    setAuto(readAutoSeason());
    setEffects(readEffectsEnabled());
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={iconBtn} aria-label="Accent color">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 rounded-none">
        <p className="mb-3 font-display text-[11px] uppercase tracking-widest text-muted-foreground">// Accent color</p>
        <div className="grid grid-cols-6 gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-label={a.label}
              title={a.label}
              onClick={() => {
                setAccent(a.key);
                applyAccent(a.key);
                setAuto(false);
                setAutoSeason(false);
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center border transition-transform hover:scale-110",
                accent === a.key ? "border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: a.swatch }}
            >
              {accent === a.key ? <Check className="h-3.5 w-3.5 text-background" /> : null}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-foreground">
            <span>
              Seasonal theme
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                Now: {season.label}
              </span>
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={auto}
              onChange={(e) => {
                const on = e.target.checked;
                setAuto(on);
                setAutoSeason(on);
                if (on) {
                  applySeasonalAccent();
                  setAccent(season.accent);
                }
              }}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-foreground">
            <span>Seasonal effects</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={effects}
              onChange={(e) => {
                setEffects(e.target.checked);
                setEffectsEnabled(e.target.checked);
              }}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type Notification = { id: string; title: string; message: string | null; read: boolean; created_at: string };

function Notifications() {
  const fetchNotifications = useServerFn(getNotifications);
  const markRead = useServerFn(markNotificationsRead);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(),
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: () => markRead({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = ((data?.notifications ?? []) as Notification[]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(iconBtn, "relative")} aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-none p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="font-display text-[11px] uppercase tracking-widest text-muted-foreground">// Notifications</p>
          {unread > 0 ? (
            <button
              type="button"
              className="text-[11px] uppercase tracking-wider text-primary hover:underline"
              onClick={() => mutation.mutate()}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">[ NO_NOTIFICATIONS ]</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id} className={cn("px-3 py-2.5", !n.read && "bg-primary/5")}>
                  <div className="flex items-start gap-2">
                    {!n.read ? <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> : null}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{n.title}</p>
                      {n.message ? <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p> : null}
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function HeaderControls() {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <ThemeToggle />
      <Button variant="ghost" size="icon" className={iconBtn} asChild>
        <Link to="/changelog" aria-label="Changelog">
          <FileText className="h-4 w-4" />
        </Link>
      </Button>
      <AccentPicker />
      <Notifications />
    </div>
  );
}
