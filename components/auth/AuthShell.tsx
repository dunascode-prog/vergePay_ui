import Image from "next/image";
import Link from "next/link";
import { LuCheck } from "react-icons/lu";

const HIGHLIGHTS = [
  "Personal and business wallets, side by side",
  "Invoices, retainers and reminders in one place",
  "See which clients pay on time, and which don't",
];

// Split layout for the auth screens: the form on the left, a brand panel on
// the right (hidden on small screens so the form gets the whole width).
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        {/* The logo file has ~22px of empty space on its left; -ml lines the wordmark up with the text. */}
        <Link
          href="/"
          aria-label="VergePay home"
          className="-ml-[22px] flex h-10 w-36 items-center overflow-hidden"
        >
          <Image
            src="/final_vergepay_logo.svg"
            alt="VergePay"
            width={144}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VergePay</p>
      </div>

      <aside className="relative hidden overflow-hidden bg-emerald-950 text-emerald-50 lg:flex lg:flex-col lg:justify-center lg:px-16">
        {/* soft brand glow, purely decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl"
        />

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-300">
            For freelancers and small businesses
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            All your money, personal and business, in one clear view.
          </h2>
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
    </div>
  );
}
