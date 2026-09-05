import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logo de cinaAuth que sigue el color de acento elegido en la paleta. */
export function Logo({
  className,
  iconClassName,
  wordClassName,
}: {
  className?: string;
  iconClassName?: string;
  /** Clase para el color del texto "cina" (útil en secciones con fondo propio). */
  wordClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary",
          iconClassName,
        )}
      >
        <Zap className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
      </span>
      <span className={cn("font-display text-lg font-black tracking-tight text-foreground", wordClassName)}>
        cina<span className="text-primary">Auth</span>
      </span>
    </span>
  );
}
