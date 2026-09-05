import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("reveal-visible");
    };

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          show();
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("reveal-visible");
        }
      },
      { threshold: Math.min(threshold, 0.01), rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    // Safety net: never leave content hidden.
    const fallback = window.setTimeout(show, 1200);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [delay, once, threshold]);


  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
