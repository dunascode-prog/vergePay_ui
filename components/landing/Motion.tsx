"use client";

import Lenis from "lenis";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The landing page's motion, after the Clario template: Lenis smooth scroll,
// sections that slide in once as they come into view, and an FAQ that opens
// smoothly. The look lives in globals.css (.vp-reveal, .vp-faq); everything
// is switched off for visitors who ask for reduced motion.

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Inertial smooth scrolling, anchor links included (they honour scroll-margin). */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
    return () => lenis.destroy();
  }, []);
  return null;
}

type From = "up" | "left" | "right" | "rise";

/**
 * Hidden until it scrolls into view, then slides in once:
 * headings from the left, body text from the right, cards up.
 * `spring` picks Clario's two curves: "soft" (no bounce) or "bouncy".
 */
export function Reveal({
  as: Tag = "div",
  from = "up",
  delay = 0,
  spring = "soft",
  className,
  children,
}: {
  as?: "div" | "li" | "section" | "figure";
  from?: From;
  delay?: number;
  spring?: "soft" | "bouncy";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // with reduced motion the CSS shows everything at once
    if (!el || reducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-from={from}
      data-spring={spring}
      data-shown={shown || undefined}
      style={delay ? ({ "--vp-delay": `${delay}s` } as React.CSSProperties) : undefined}
      className={cn("vp-reveal", className)}
    >
      {children}
    </Tag>
  );
}

/** Numbered questions that open with a smooth height change. */
export function Faq({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <Reveal key={q} delay={i * 0.06}>
            <div className={cn("rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] transition-colors duration-300", isOpen && "bg-[#111]")}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left font-medium"
                >
                  <span className="text-sm text-(--vp-accent) tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{q}</span>
                  <Plus className={cn("vp-faq-icon size-4 shrink-0 text-white/50", isOpen && "rotate-45 text-(--vp-accent)")} />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="vp-faq" data-open={isOpen || undefined} inert={!isOpen}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 pl-[3.75rem] text-sm leading-relaxed text-white/60">{a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
