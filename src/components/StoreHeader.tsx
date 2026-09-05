import { Link } from "@tanstack/react-router";
import { Zap, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

interface StoreHeaderProps {
  store?: { name: string; slug: string; logo_url?: string | null } | null;
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const { count } = useCart();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {store ? (
          <Link
            to="/$storeSlug"
            params={{ storeSlug: store.slug }}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
          >
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
            )}
            {store.name}
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            cinaAuth
          </Link>
        )}
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSelector />
          <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
            {t("store.track")}
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:border-primary/40"
            aria-label={t("store.cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
