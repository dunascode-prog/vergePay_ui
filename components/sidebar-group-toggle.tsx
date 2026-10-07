"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** A sidebar group's label as a row that opens and closes the group (hidden when the sidebar is icons only). */
export function GroupToggle({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex h-7 w-full items-center justify-between rounded-md px-2 text-xs leading-none font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none group-data-[collapsible=icon]:hidden"
    >
      {title}
      <ChevronRight className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")} />
    </button>
  );
}
