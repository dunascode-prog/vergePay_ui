import Image from "next/image";
import Link from "next/link";
import { LuCheck } from "react-icons/lu";
import { BrandMark } from "@/components/landing/BrandMark";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  "Personal and business wallets, side by side",
  "Invoices, retainers and reminders in one place",
  "See which clients pay on time, and which don't",
];

// Split layout for the auth screens: the form on the left, a brand panel on
// the right (hidden on small screens so the form gets the whole width).
// `dark` is for the public pages before sign-in, so they match the landing
// page: near-black, VergePay green, the white-wordmark logo and its motion.
export function AuthShell({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={cn("grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]", dark && "dark vp-auth-dark")}>
      <div className="flex flex-col px-6 py-8 sm:px-10">
        {dark ? (
          <Link href="/" aria-label="VergePay home" className="w-fit">
            <BrandMark onDark />
          </Link>
        ) : (
          // The logo file has ~22px of empty space on its left; -ml lines the wordmark up with the text.
          <Link href="/" aria-label="VergePay home" className="-ml-[22px] flex h-10 w-36 items-center overflow-hidden">
            <Image src="/final_vergepay_logo.svg" alt="VergePay" width={144} height={40} className="object-contain" priority />
          </Link>
        )}

        <main className="flex flex-1 items-center justify-center py-10">
          <div className={cn("w-full max-w-sm", dark && "vp-hero-text")}>{children}</div>
        </main>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VergePay</p>
      </div>

      {dark ? <DarkBrandPanel /> : <LightBrandPanel />}
    </div>
  );
}

function LightBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-emerald-950 text-emerald-50 lg:flex lg:flex-col lg:justify-center lg:px-16">
      {/* soft brand glow, purely decorative */}
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="relative max-w-md">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-300">For freelancers and small businesses</p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">All your money, personal and business, in one clear view.</h2>
        <ul className="mt-10 space-y-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-emerald-100/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                <LuCheck className="h-3 w-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** The landing page's card, glow and light line, around the same message. */
function DarkBrandPanel() {
  return (
    <aside className="hidden p-4 lg:flex">
      <div className="vp-hero-visual relative flex flex-1 flex-col justify-center overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0d0d0d] px-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rounded-full bg-(--vp-accent) opacity-25 blur-[90px]" />
        <div aria-hidden className="absolute top-0 left-1/2 h-px w-[30%] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,var(--vp-accent)_50%,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-32 size-80 rounded-full bg-(--vp-accent) opacity-10 blur-[90px]" />

        <div className="relative max-w-md">
          <span className="inline-flex items-center rounded-lg border border-(--vp-accent)/40 bg-(--vp-accent)/[0.06] px-3 py-1 text-sm font-medium text-(--vp-accent) shadow-[0_0_16px_-6px_var(--vp-accent)]">
            For freelancers and small businesses
          </span>
          <h2 className="mt-6 text-[2.5rem] leading-[1.08] font-medium tracking-[-0.04em] text-white">All your money, personal and business, in one clear view.</h2>
          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--vp-accent)/15 text-(--vp-accent)">
                  <LuCheck className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
