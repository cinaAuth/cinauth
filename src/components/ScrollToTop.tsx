import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center",
        "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(249,115,22,0.35)]",
        "rounded-none border border-primary/60",
        "transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(249,115,22,0.55)]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
