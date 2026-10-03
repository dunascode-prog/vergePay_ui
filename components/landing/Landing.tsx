import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Briefcase,
  Check,
  ChevronDown,
  FileText,
  Fingerprint,
  KeyRound,
  Layers,
  LineChart,
  Lock,
  Palette,
  Repeat,
  Scale,
  Send,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { LandingNav } from "./LandingNav";
import {
  AddMoneyMock,
  AlertsMock,
  HeroMock,
  HoldingsMock,
  InsightsMock,
  InvoiceChipMock,
  InvoiceFlowMock,
  NameCheckMock,
  SparkMock,
  WalletsMock,
} from "./Mockups";

// Where investors and partners reach the team. Change it in one place.
export const CONTACT_EMAIL = "hello@vergepay.com";

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cn("text-xs font-semibold tracking-[0.14em] uppercase", dark ? "text-[#63D16B]" : "text-emerald-700")}>{children}</p>
  );
}

function SectionTitle({ eyebrow, title, body, dark = false, center = false }: { eyebrow: string; title: React.ReactNode; body?: React.ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className={cn("mt-3 text-3xl leading-[1.1] font-bold tracking-[-0.03em] sm:text-[2.75rem]", dark ? "text-white" : "text-zinc-950")}>{title}</h2>
      {body && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-emerald-100/80" : "text-zinc-600")}>{body}</p>}
    </div>
  );
}

function PrimaryCta({ signedIn, className }: { signedIn: boolean; className?: string }) {
  return (
    <Link
      href={signedIn ? "/dashboard" : "/signup"}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-800",
        className,
      )}
    >
      {signedIn ? "Go to your dashboard" : "Open a free account"}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

const Tick = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <li className="flex gap-3">
    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", dark ? "bg-[#63D16B]/15 text-[#63D16B]" : "bg-emerald-100 text-emerald-800")}>
      <Check className="size-3" strokeWidth={3} />
    </span>
    <span>{children}</span>
  </li>
);

export function Landing({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="bg-white text-zinc-900 antialiased">
      <LandingNav signedIn={signedIn} />

      <main>
        {/* ---------------------------------------------------------------- hero */}
        <section className="relative overflow-hidden pt-28 pb-28 sm:pt-36 sm:pb-36">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(99,209,107,0.18),transparent),radial-gradient(50%_40%_at_0%_0%,rgba(15,100,82,0.08),transparent)]" />
          <div className={cn(container, "relative grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10")}>
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-900 backdrop-blur">
                <span className="size-1.5 rounded-full bg-[#63D16B]" />
                Built for Nigeria&apos;s freelancers and small businesses
              </span>
              <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-zinc-950 sm:text-6xl lg:text-[3.6rem] xl:text-[4rem]">
                Get paid, spend and grow,
                <span className="block text-emerald-800">all from one account.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
                VergePay gives you a personal and a business wallet, invoices your clients can pay in one tap, and a live picture of where every naira goes. No more juggling five bank apps.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryCta signedIn={signedIn} />
                <a
                  href="#product"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  See what&apos;s inside
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
                {["Free to open", "Two account numbers", "Bank-level security"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-700" strokeWidth={2.5} /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700">
              <HeroMock />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- trust strip */}
        <section aria-label="What VergePay is built on" className="border-y border-zinc-100 bg-zinc-50/60">
          <div className={cn(container, "grid grid-cols-2 gap-x-6 gap-y-5 py-8 md:grid-cols-4")}>
            {[
              { icon: ShieldCheck, title: "Payments by Flutterwave", body: "Cards, transfers and USSD" },
              { icon: Fingerprint, title: "BVN-verified accounts", body: "Every customer is identified" },
              { icon: KeyRound, title: "Two-factor security", body: "On every sensitive action" },
              { icon: Scale, title: "Double-entry ledger", body: "Every kobo accounted for" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-emerald-800" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{title}</p>
                  <p className="text-xs text-zinc-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- everything inside */}
        <section id="product" className="py-24 sm:py-32">
          <div className={container}>
            <SectionTitle
              eyebrow="One platform"
              title="Everything your money needs, in one place"
              body="From the first invoice to the end-of-month review, VergePay replaces the spreadsheets, the screenshots of transfers and the guesswork."
            />
            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
              <FeatureCard className="md:col-span-3" icon={Wallet} title="Personal and business wallets" body="Two wallets with their own account numbers, so business money never mixes with rent and groceries. See one, the other, or both together.">
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><p className="font-semibold">Personal</p><p className="mt-1 font-mono">1000 761 983</p></div>
                  <div className="rounded-xl bg-sky-50 p-3 text-sky-900"><p className="font-semibold">Business</p><p className="mt-1 font-mono">7692 554 005</p></div>
                </div>
              </FeatureCard>
              <FeatureCard className="md:col-span-3" icon={FileText} title="Invoices clients pay in one tap" body="Line items, your own invoice numbers and a secure pay link, emailed for you. Clients pay by card, bank transfer or USSD, no VergePay account needed.">
                <div className="mt-6"><InvoiceChipMock /></div>
              </FeatureCard>
              <FeatureCard className="md:col-span-2" icon={Layers} title="Three ways to add money" body="A permanent bank account number, a linked debit card, or your clients paying your invoices.">
                <div className="mt-5"><AddMoneyMock /></div>
              </FeatureCard>
              <FeatureCard className="md:col-span-2" icon={Send} title="Send with confidence" body="See the recipient's name before you pay, review every detail, and get a receipt. Retries can never pay twice.">
                <div className="mt-5"><NameCheckMock /></div>
              </FeatureCard>
              <FeatureCard className="md:col-span-2" icon={Bell} title="Live alerts" body="The moment money lands or leaves, your balance updates and you get an alert, on every device you're signed in on.">
                <div className="mt-5"><AlertsMock /></div>
              </FeatureCard>
              <FeatureCard className="md:col-span-3" icon={BarChart3} title="Know where every naira goes" body="Income, spending and net for the month, compared with last month, and six months of cash flow, straight from your ledger.">
                <div className="mt-6"><SparkMock /></div>
              </FeatureCard>
              <FeatureCard className="md:col-span-3" icon={LineChart} title="Investments next to your cash" body="Link your brokerage account and see your stocks and crypto beside your wallets, kept up to date automatically.">
                <div className="mt-6"><HoldingsMock /></div>
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ get paid */}
        <section id="get-paid" className="relative overflow-hidden bg-[#06281f] py-24 text-white sm:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_100%_0%,rgba(99,209,107,0.16),transparent)]" />
          <div className={cn(container, "relative grid grid-cols-1 items-center gap-16 lg:grid-cols-2")}>
            <div>
              <SectionTitle
                dark
                eyebrow="Get paid faster"
                title="Send an invoice in a minute. Get paid the same day."
                body="Your client gets a clean email with a secure link. They pay the way they like, and the money goes straight into your business wallet, with a receipt sent for you."
              />
              <ol className="mt-10 space-y-6">
                {[
                  ["Create it", "Add your client, line items and a due date. Totals add up to the kobo."],
                  ["Send it", "We email it with its own pay link. Share it on WhatsApp too."],
                  ["Get paid", "Card, bank transfer or USSD. You're alerted the moment it lands, and a late client is one click from a polite reminder."],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-[#63D16B]">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-100/75">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="pb-8">
              <InvoiceFlowMock />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ wallets */}
        <section className="py-24 sm:py-32">
          <div className={cn(container, "grid grid-cols-1 items-center gap-16 lg:grid-cols-2")}>
            <div className="order-2 lg:order-1">
              <WalletsMock />
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle
                eyebrow="Separate, not scattered"
                title="Your business and your life, finally apart"
                body="A freelancer's money usually lives in one account, mixed up with everything else. VergePay gives each its own wallet and account number, and still shows you the whole picture."
              />
              <ul className="mt-8 space-y-3 text-zinc-700">
                <Tick>A permanent account number for each wallet: anyone can pay you from any Nigerian bank</Tick>
                <Tick>Move money between them instantly, at no cost</Tick>
                <Tick>Switch between Personal, Business and Combined views anywhere in the app</Tick>
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ insights */}
        <section className="bg-zinc-50/70 py-24 sm:py-32">
          <div className={cn(container, "grid grid-cols-1 items-center gap-16 lg:grid-cols-2")}>
            <div>
              <SectionTitle
                eyebrow="Clarity"
                title="See your month at a glance"
                body="Every transaction is recorded in a double-entry ledger, so the numbers on your dashboard are the real ones: what came in, what went out, and how this month compares with the last."
              />
              <ul className="mt-8 space-y-3 text-zinc-700">
                <Tick>Income, spending and net, compared with last month</Tick>
                <Tick>Six months of cash flow, per wallet or combined</Tick>
                <Tick>Every transaction labelled: who, why and which wallet</Tick>
              </ul>
            </div>
            <InsightsMock />
          </div>
        </section>

        {/* ------------------------------------------------------------ security */}
        <section id="security" className="py-24 sm:py-32">
          <div className={container}>
            <SectionTitle
              center
              eyebrow="Security"
              title="Built like a bank, from the ledger up"
              body="Moving money is the one thing that can't go wrong. VergePay was engineered so it doesn't."
            />
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Scale, title: "A ledger that can't drift", body: "Every movement writes a matching debit and credit. Balances are proven against the ledger, so money is never created or lost." },
                { icon: Repeat, title: "Never charged twice", body: "Every payment carries a unique key. A double-tap or a dropped connection replays the result instead of paying again." },
                { icon: BadgeCheck, title: "Verified before credited", body: "Card and transfer payments are confirmed with the processor itself, matching amount, currency and reference, before a kobo is credited." },
                { icon: KeyRound, title: "Two-factor where it matters", body: "Linking a card, changing limits and other sensitive actions ask for a fresh code from your authenticator app." },
                { icon: Fingerprint, title: "Know-your-customer by BVN", body: "Every account holder is verified before money can move. Your BVN is encrypted in a separate vault and never shown back." },
                { icon: Lock, title: "Your card stays with the processor", body: "Card numbers never touch our servers. Sessions use secure, HttpOnly cookies, and secrets are encrypted at rest." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-zinc-100 bg-white p-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-zinc-950">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ who for */}
        <section className="border-t border-zinc-100 bg-zinc-50/70 py-24 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="Who it's for" title="Made for people who work for themselves" />
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Palette, title: "Freelancers and creatives", body: "Designers, developers, writers and photographers billing local and international clients." },
                { icon: Store, title: "Small businesses", body: "Shops and service businesses that want business money kept apart and paid on time." },
                { icon: Briefcase, title: "Consultants and agencies", body: "Retainers, project invoices and clients who need a professional way to pay." },
                { icon: Users, title: "Side hustlers", body: "Anyone earning outside a payslip who wants their income organised from day one." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-zinc-100">
                  <Icon className="size-6 text-emerald-800" />
                  <h3 className="mt-4 text-base font-semibold text-zinc-950">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- why vergepay */}
        <section id="why" className="relative overflow-hidden bg-[#06281f] py-24 text-white sm:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_0%_100%,rgba(99,209,107,0.14),transparent)]" />
          <div className={cn(container, "relative")}>
            <SectionTitle
              dark
              eyebrow="Why VergePay"
              title="The financial home for Africa's independent workforce"
              body="More people across Nigeria earn for themselves than ever. Their money is split across banks, transfers and screenshots, with no single place to get paid, keep business apart and see the whole picture. VergePay is that place."
            />
            <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
              {[
                { title: "The problem", body: "Freelancers and small businesses chase payments over WhatsApp, mix business and personal money, and can't see where they stand until it's too late." },
                { title: "What we built", body: "Wallets, invoicing with pay links, card and transfer funding, live alerts and insights, on a double-entry ledger built to move real money from day one." },
                { title: "Where it goes", body: "Credit for freelancers based on real cash flow, open-banking connections to every account they hold, and AI that spots late payers and shortfalls before they happen." },
              ].map(({ title, body }) => (
                <div key={title} className="bg-[#06281f] p-7">
                  <p className="text-sm font-semibold text-[#63D16B]">{title}</p>
                  <p className="mt-3 leading-relaxed text-emerald-50/85">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("VergePay: investor enquiry")}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#63D16B] px-6 py-3.5 font-semibold text-[#06281f] transition-colors hover:bg-[#7ddc84]"
              >
                Talk to the team <ArrowRight className="size-4" />
              </a>
              <p className="text-sm text-emerald-100/70">Investors and partners: we&apos;d love to show you the product.</p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- how it works */}
        <section className="py-24 sm:py-32">
          <div className={container}>
            <SectionTitle center eyebrow="Getting started" title="Up and running in minutes" />
            <ol className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                ["Sign up", "Create your account with just an email and a password."],
                ["Verify once", "Confirm your identity with your BVN, and open your personal and business wallets."],
                ["Start earning", "Share your account number, send your first invoice, and watch the money land."],
              ].map(([t, b], i) => (
                <li key={t} className="relative rounded-2xl border border-zinc-100 p-7">
                  <span className="text-5xl font-extrabold tracking-tight text-emerald-100">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-950">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------------ faq */}
        <section id="faq" className="border-t border-zinc-100 bg-zinc-50/70 py-24 sm:py-28">
          <div className={cn(container, "grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]")}>
            <SectionTitle eyebrow="FAQ" title="Questions, answered" body={<>Can&apos;t find what you need? Email <a className="font-medium text-emerald-800 underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>} />
            <div className="divide-y divide-zinc-200 rounded-2xl bg-white px-6 ring-1 ring-zinc-100">
              {[
                ["Is it free to open an account?", "Yes. Opening VergePay and both wallets is free, and moving money between your own wallets costs nothing."],
                ["Do my clients need VergePay to pay me?", "No. Every invoice has a secure pay link. Your client pays by card, bank transfer or USSD on a page made for them, and gets a receipt by email."],
                ["How do I add money?", "Send a bank transfer to your wallet's own account number from any Nigerian bank, top up from a linked debit card, or get paid through your invoices."],
                ["Why do you need my BVN?", "To confirm you are who you say you are before money can move, as every financial service must. It's encrypted in a separate vault, used only to verify you, and never shown back."],
                ["Is my money safe?", "Payments are processed by Flutterwave, every movement is recorded on a double-entry ledger, and sensitive actions need two-factor authentication. Card numbers never touch our servers."],
                ["Can I keep business and personal money apart?", "That's the point. You get a personal and a business wallet, each with its own account number, and can view them separately or together."],
              ].map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900">
                    {q}
                    <ChevronDown className="size-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-zinc-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ final cta */}
        <section className="py-24 sm:py-28">
          <div className={container}>
            <div className="relative overflow-hidden rounded-3xl bg-emerald-900 px-6 py-16 text-center sm:px-12 sm:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(99,209,107,0.25),transparent)]" />
              <h2 className="relative mx-auto max-w-2xl text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-5xl">Your money, finally organised.</h2>
              <p className="relative mx-auto mt-4 max-w-lg text-emerald-100/85 sm:text-lg">Open your free account in minutes and send your first invoice today.</p>
              <div className="relative mt-8 flex justify-center">
                <Link
                  href={signedIn ? "/dashboard" : "/signup"}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-emerald-950 transition-colors hover:bg-emerald-50"
                >
                  {signedIn ? "Go to your dashboard" : "Open a free account"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------------- footer */}
      <footer className="border-t border-zinc-100">
        <div className={cn(container, "grid grid-cols-2 gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]")}>
          <div className="col-span-2 md:col-span-1">
            <BrandMark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600">The money app for freelancers and small businesses: get paid, keep business apart, and see where every naira goes.</p>
          </div>
          <FooterColumn title="Product" links={[["#product", "Wallets"], ["#get-paid", "Invoicing"], ["#product", "Insights"], ["#security", "Security"]]} />
          <FooterColumn title="Company" links={[["#why", "Why VergePay"], [`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("VergePay: investor enquiry")}`, "Investors"], [`mailto:${CONTACT_EMAIL}`, "Contact"]]} />
          <FooterColumn title="Account" links={[["/signup", "Open an account"], ["/signin", "Sign in"], ["#faq", "FAQ"]]} />
        </div>
        <div className="border-t border-zinc-100">
          <div className={cn(container, "flex flex-col gap-2 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between")}>
            <p>© {new Date().getFullYear()} VergePay. All rights reserved.</p>
            <p>Payments are processed by Flutterwave. Brokerage accounts are held with the linked provider.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, className, children }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded-3xl border border-zinc-100 bg-zinc-50/60 p-6 transition-colors hover:border-emerald-900/10 hover:bg-emerald-50/40 sm:p-7", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-zinc-100">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
      {children}
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([href, label]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link href={href} className="text-zinc-600 hover:text-zinc-950">{label}</Link>
            ) : (
              <a href={href} className="text-zinc-600 hover:text-zinc-950">{label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
