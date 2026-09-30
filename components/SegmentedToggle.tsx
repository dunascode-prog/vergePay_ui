"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}

/**
 * A generic segmented control (Personal/Business/Combined-style switcher).
 * Uses radiogroup/radio semantics since it's a single mutually-exclusive
 * choice, not a set of separately-navigable tab panels.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
  ...aria
}: SegmentedToggleProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + dir + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={cn("inline-flex rounded-lg bg-muted p-1", className)}>
      <div
        role="radiogroup"
        aria-label={aria["aria-label"]}
        onKeyDown={handleKeyDown}
        className="relative flex items-center"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full rounded-md bg-background shadow-sm transition-transform duration-200 ease-out"
          style={{
            width: `${100 / options.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {options.map((option, index) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative z-10 flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
