"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ALL_PAGES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Jump to any page: ⌘K / Ctrl+K anywhere, or the sidebar's search box.
 * Type to filter, ↑ ↓ to move, Enter to open.
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_PAGES;
    return ALL_PAGES.filter((p) => `${p.title} ${p.group ?? ""} ${p.keywords ?? ""}`.toLowerCase().includes(q));
  }, [query]);

  const go = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[index]) {
      event.preventDefault();
      go(results[index].url);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          setQuery("");
          setIndex(0);
        }
      }}
    >
      <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
        <DialogTitle className="sr-only">Search pages</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages…"
            aria-label="Search pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[index] ? `command-${index}` : undefined}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id="command-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No pages match.</li>}
          {results.map((page, i) => (
            <li
              key={page.url}
              id={`command-${i}`}
              role="option"
              aria-selected={i === index}
              onMouseEnter={() => setIndex(i)}
              onClick={() => go(page.url)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                i === index && "bg-accent text-accent-foreground",
              )}
            >
              <page.icon className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1">{page.title}</span>
              {page.group && <span className="text-xs text-muted-foreground">{page.group}</span>}
              {i === index && <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden />}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** Opens the palette with ⌘K (Mac) or Ctrl+K. */
export function useCommandShortcut(open: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}
