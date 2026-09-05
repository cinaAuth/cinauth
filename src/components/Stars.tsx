import { Star, StarHalf } from "lucide-react";

export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-primary">
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? (
          <Star key={i} className={`${className} fill-current`} />
        ) : i === full && half ? (
          <StarHalf key={i} className={`${className} fill-current`} />
        ) : (
          <Star key={i} className={`${className} text-muted-foreground/40`} />
        )
      )}
    </span>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
          className="text-primary transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 ${n <= value ? "fill-current" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  );
}
