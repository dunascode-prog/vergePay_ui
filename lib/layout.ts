import { cn } from "@/lib/utils";

// One page layout for every dashboard tab, so spacing can't drift apart.
//
//   workspace padding  16px phones · 24px tablets · 32px wide screens
//                      (app/(protected)/dashboard/layout.tsx; the top bar
//                      uses the same side padding, so its title lines up)
//   page width         "wide" 1440px for overviews and lists,
//                      "narrow" 1024px for detail pages and forms
//   section spacing    20px on phones, 24px from tablets up

/** The workspace's side padding (the top bar uses it too). */
export const WORKSPACE_X = "px-4 sm:px-6 xl:px-8";

/** The space between a page's sections. */
export const SECTION_GAP = "gap-5 sm:gap-6";

/**
 * Classes for a page's outer element: centred at one of the two widths.
 * `stack` (the default) also spaces its children as sections; detail pages
 * that space their own sections pass `stack: false`.
 */
export function pageClass(width: "wide" | "narrow" = "wide", { stack = true }: { stack?: boolean } = {}) {
  return cn("mx-auto w-full min-w-0", width === "wide" ? "max-w-[1440px]" : "max-w-5xl", stack && `flex flex-col ${SECTION_GAP}`);
}
