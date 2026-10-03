"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#get-paid", label: "Invoicing" },
  { href: "#security", label: "Security" },
  { href: "#why", label: "Why VergePay" },
  { href: "#faq", label: "FAQ" },
];

/** Top bar: clear over the hero, solid once you scroll; a menu sheet on phones. */
export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // no scrolling behind the open phone menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled || open ? "border-b border-black/5 bg-white/85 shadow-[0_1px_12px_rgba(0,0,0,0.04)] backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="VergePay home" className="shrink-0">
          <BrandMark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <Link href="/dashboard" className="rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/signin" className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
                Open free account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-full text-zinc-800 hover:bg-zinc-100 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-black/5 bg-white px-4 pt-4 pb-10 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 text-lg font-semibold text-zinc-900 hover:bg-zinc-50">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            {signedIn ? (
              <Link href="/dashboard" className="rounded-full bg-emerald-900 py-3.5 text-center font-semibold text-white">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="rounded-full bg-emerald-900 py-3.5 text-center font-semibold text-white">
                  Open free account
                </Link>
                <Link href="/signin" className="rounded-full border border-zinc-200 py-3.5 text-center font-semibold text-zinc-900">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
