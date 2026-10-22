"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#product", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/** Top bar: clear over the hero, blurred once you scroll; a menu sheet on phones. */
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
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-200",
        scrolled || open ? "border-white/[0.06] bg-[#050505]/80 backdrop-blur-md" : "border-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="VergePay home" className="shrink-0">
          <BrandMark onDark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-white/80 transition-colors duration-300 hover:text-(--vp-accent)">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={signedIn ? "/dashboard" : "/signin"}
            className="group inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-[15px] font-medium text-white transition-[background-color,color,box-shadow] duration-500 ease-(--vp-soft) hover:bg-(--vp-accent) hover:text-[#050505] hover:shadow-[0_0_28px_-6px_var(--vp-accent)]"
          >
            {signedIn ? "Dashboard" : "Sign in"} <ArrowUpRight className="size-4 transition-transform duration-500 ease-(--vp-bouncy) group-hover:rotate-45" />
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-(--vp-accent) px-5 py-2.5 text-[15px] font-medium text-[#050505] shadow-[0_0_24px_-4px_var(--vp-accent)] transition-shadow duration-500 ease-(--vp-soft) hover:shadow-[0_0_44px_-2px_var(--vp-accent)]"
          >
            Get started <ArrowUpRight className="size-4 transition-transform duration-500 ease-(--vp-bouncy) group-hover:rotate-45" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" data-lenis-prevent className="vp-sheet h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/[0.06] bg-[#050505] px-4 pt-4 pb-10 lg:hidden">
          <ul className="vp-stagger space-y-1">
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 text-lg font-medium text-white hover:bg-white/5">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="vp-stagger mt-6 grid gap-3" style={{ "--i": LINKS.length } as React.CSSProperties}>
            <Link href="/signup" className="rounded-full bg-(--vp-accent) py-3.5 text-center font-semibold text-[#050505]">
              Get started
            </Link>
            <Link href="/signin" className="rounded-full bg-[#171717] py-3.5 text-center font-semibold text-white">
              Sign in
            </Link>
            {signedIn && (
              <Link href="/dashboard" className="py-2 text-center font-semibold text-(--vp-accent)">
                Go to your dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
