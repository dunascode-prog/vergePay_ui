import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Fingerprint,
  KeyRound,
  Lock,
  Repeat,
  Scale,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { LandingNav } from "./LandingNav";
import {
  AlertsMini,
  CashFlowMini,
  HeroDashboardMock,
  InvoiceMini,
  StepPaidMock,
  StepSignUpMock,
  StepVerifyMock,
  WalletsMini,
} from "./Mockups";
import { Faq, Reveal, ScrollTilt, SmoothScroll } from "./Motion";

// Where investors and partners reach the team. Change it in one place.
export const CONTACT_EMAIL = "hello@vergepay.com";

// The page's one accent colour (VergePay's green). Every glow, pill and
// primary button reads it from --vp-accent.
const ACCENT = "#63D16B";

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

/** The small outlined pill above each heading. */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-(--vp-accent)/40 bg-(--vp-accent)/[0.06] px-3 py-1 text-sm font-medium text-(--vp-accent) shadow-[0_0_16px_-6px_var(--vp-accent)]">
      {children}
    </span>
  );
}

/** Heading slides in from the left, its text from the right, as in Clario. */
function SectionTitle({ eyebrow, title, body, center = true, className }: { eyebrow: string; title: React.ReactNode; body?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      <Reveal from="left">
        <Pill>{eyebrow}</Pill>
        <h2 className="mt-5 text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] text-white sm:text-5xl">{title}</h2>
      </Reveal>
      {body && (
        <Reveal from="right" delay={0.1}>
          <p className={cn("mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg", center && "mx-auto")}>{body}</p>
        </Reveal>
      )}
    </div>
  );
}

/** The glowing accent button, Clario's one strong action: the glow grows on hover. */
function PrimaryButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full bg-(--vp-accent) px-6 py-3.5 text-base font-medium text-[#050505] shadow-[0_0_32px_-6px_var(--vp-accent)] transition-[box-shadow,scale] duration-500 ease-(--vp-soft) hover:shadow-[0_0_56px_-2px_var(--vp-accent)] active:scale-[0.97]",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-500 ease-(--vp-bouncy) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-45" />
    </Link>
  );
}

/** The dark button: fills with the accent and glows on hover. */
function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  const cls =
    "group inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-3.5 text-base font-medium text-white transition-[background-color,color,box-shadow,scale] duration-500 ease-(--vp-soft) hover:bg-(--vp-accent) hover:text-[#050505] hover:shadow-[0_0_32px_-6px_var(--vp-accent)] active:scale-[0.97]";
  const arrow = <ArrowUpRight className="size-4 transition-transform duration-500 ease-(--vp-bouncy) group-hover:rotate-45" />;
  return href.startsWith("/") ? (
    <Link href={href} className={cls}>
      {children} {arrow}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children} {arrow}
    </a>
  );
}

const Tick = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-(--vp-accent)/15 text-(--vp-accent)">
      <Check className="size-3" strokeWidth={3} />
    </span>
    <span>{children}</span>
  </li>
);

const investorMail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("VergePay: investor enquiry")}`;

export function Landing({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="bg-[#050505] text-white antialiased" style={{ "--vp-accent": ACCENT } as React.CSSProperties}>
      <SmoothScroll />
      {/* without JavaScript nothing waits to be revealed */}
      <noscript>
        <style>{`.vp-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <LandingNav signedIn={signedIn} />

      <main className="overflow-x-clip">
        {/* ---------------------------------------------------------------- hero */}
        <section className="relative pt-32 sm:pt-40">
          <div className={cn(container, "vp-hero-text text-center")}>
            <Pill>Wallets · Invoices · Insights</Pill>
            <h1 className="mx-auto mt-5 max-w-4xl text-[2.6rem] leading-[1.02] font-medium tracking-[-0.05em] sm:text-6xl lg:text-[4rem]">
              Get paid, keep business apart, see every naira
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              VergePay gives Nigeria&apos;s freelancers and small businesses a personal and a business wallet, invoices clients pay in one tap, and a live picture of their money.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/signup">Get started free</PrimaryButton>
              <SecondaryButton href={signedIn ? "/dashboard" : "/signin"}>{signedIn ? "Go to your dashboard" : "Sign in"}</SecondaryButton>
            </div>
          </div>
          {/* fades in, rises 150px, and tilts flat as you scroll, as in Clario */}
          <div className={cn(container, "vp-hero-visual mt-10 sm:mt-7")}>
            <ScrollTilt className="vp-hero-rise">
              <HeroDashboardMock />
            </ScrollTilt>
          </div>
        </section>

        {/* -------------------------------------------------------- how it works */}
        <section id="how" className="py-20 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="How it works" title="Up and running in three steps" body="No paperwork and no branch visits. Open your account from your phone in minutes." />
            <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: "Sign up", body: "Create your account with just an email and a password.", mock: <StepSignUpMock /> },
                { title: "Verify once", body: "Confirm who you are with your BVN, and your personal and business wallets open with their own account numbers.", mock: <StepVerifyMock /> },
                { title: "Start earning", body: "Share your account number or send your first invoice, and watch the money land.", mock: <StepPaidMock /> },
              ].map((s, i) => (
                <Reveal as="li" key={s.title} spring="bouncy" delay={0.2 * (i + 1)} className="flex flex-col rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] p-6">
                  <span className="w-fit rounded-full bg-[#171717] px-3 py-1 text-xs font-medium text-white/70">Step {i + 1}</span>
                  <h3 className="mt-5 text-xl font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
                  <div className="mt-auto pt-6">{s.mock}</div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------- feature showcase */}
        <section id="product" className="pb-20 sm:pb-28">
          <div className={container}>
            <SectionTitle eyebrow="One app" title="See your money move in real time" body="From the first invoice to the end-of-month review, VergePay replaces the spreadsheets, the screenshots of transfers and the guesswork." />
            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ShowcaseCard delay={0} title="Personal and business wallets" body="Two wallets with their own account numbers, so business money never mixes with rent and groceries.">
                <WalletsMini />
              </ShowcaseCard>
              <ShowcaseCard delay={0.15} title="Invoices clients pay in one tap" body="A secure pay link, emailed for you. Clients pay by card, transfer or USSD, with no VergePay account needed.">
                <InvoiceMini />
              </ShowcaseCard>
              <ShowcaseCard delay={0} title="Know where every naira goes" body="Income, spending and net for the month, and six months of cash flow, straight from your ledger.">
                <CashFlowMini />
              </ShowcaseCard>
              <ShowcaseCard delay={0.15} title="Live alerts" body="The moment money lands or leaves, your balance updates and you get an alert on every device.">
                <AlertsMini />
              </ShowcaseCard>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- stat band */}
        <section className="relative py-20 sm:py-28">
          <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-[min(42rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--vp-accent) opacity-[0.12] blur-[90px]" />
          <Reveal spring="bouncy" className={cn(container, "relative text-center")}>
            <Pill>Free to open</Pill>
            <p className="mt-6 text-7xl font-medium tracking-[-0.06em] sm:text-9xl">₦0</p>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
              to open your account and both wallets. Moving money between your own wallets is free, always.
            </p>
            <PrimaryButton href="/signup" className="mt-8">Get started</PrimaryButton>
          </Reveal>
        </section>

        {/* -------------------------------------------------------- features grid */}
        <section id="security" className="py-20 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="Security" title="Built like a bank, from the ledger up" body="Moving money is the one thing that can't go wrong. VergePay was engineered so it doesn't." />
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Scale, title: "A ledger that can't drift", body: "Every movement writes a matching debit and credit, so money is never created or lost." },
                { icon: Repeat, title: "Never charged twice", body: "A double-tap or a dropped connection replays the result instead of paying again." },
                { icon: BadgeCheck, title: "Verified before credited", body: "Payments are confirmed with the processor itself, amount and reference, before a kobo lands." },
                { icon: UserCheck, title: "Name check before you send", body: "See who owns an account number before you pay, and get a receipt after." },
                { icon: KeyRound, title: "Two-factor where it matters", body: "Linking a card, changing limits and other sensitive actions ask for a fresh code." },
                { icon: Fingerprint, title: "Verified by BVN", body: "Every account holder is verified. Your BVN is encrypted in a separate vault and never shown back." },
              ].map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} spring="bouncy" delay={0.1 * (i % 3)} className="group rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] p-6 hover:border-(--vp-accent)/25">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-(--vp-accent)/10 text-(--vp-accent) transition-transform duration-500 ease-(--vp-bouncy) group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 flex justify-center">
              <PrimaryButton href="/signup">Get started</PrimaryButton>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------- comparison */}
        <section id="why" className="py-20 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="Why VergePay?" title="A smarter way to run your money" body="What getting paid usually looks like, and what it looks like on VergePay." />
            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              <Reveal spring="bouncy" className="rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] p-6 sm:p-8">
                <p className="text-lg font-medium text-white/60">The usual way</p>
                <ul className="mt-6 space-y-4 text-sm text-white/55">
                  {[
                    "Business and personal money in one account",
                    "Chasing payments over WhatsApp",
                    "Screenshots as proof of payment",
                    "Hoping you typed the account number right",
                    "Spreadsheets at the end of the month",
                    "Charged twice on a bad connection",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/45">
                        <X className="size-3" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal spring="bouncy" delay={0.15} className="relative rounded-[20px] border border-(--vp-accent)/30 bg-[#0d0d0d] p-6 shadow-[0_0_60px_-24px_var(--vp-accent)] sm:p-8">
                <BrandMark onDark />
                <ul className="mt-5 space-y-4 text-sm text-white/85">
                  {[
                    "Separate Personal and Business wallets, each with its own account number",
                    "Invoices with a secure pay link and one-click reminders",
                    "An alert and a receipt the moment money lands",
                    "The recipient's name shown before you send",
                    "Income, spending and cash flow, live from your ledger",
                    "Every payment keyed so it can only go through once",
                  ].map((t) => (
                    <Tick key={t}>{t}</Tick>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- mission */}
        <section className="py-20 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="Our mission" title="Built for Africa's independent workforce" body="For investors, partners and anyone who works for themselves." />
            <Reveal as="figure" spring="bouncy" className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0d0d0d] p-8 sm:p-14">
              <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-(--vp-accent) opacity-15 blur-[90px]" />
              <blockquote className="relative text-2xl leading-snug font-medium tracking-[-0.03em] sm:text-[2rem]">
                &ldquo;More people across Nigeria earn for themselves than ever, yet their money is split across banks, transfers and screenshots. VergePay is the one place to get paid, keep business apart and see the whole picture.&rdquo;
              </blockquote>
              <figcaption className="relative mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block font-medium">The VergePay team</span>
                  <span className="block text-sm text-white/55">Next: credit from real cash flow, open banking, and AI that spots late payers early</span>
                </span>
                <SecondaryButton href={investorMail}>Talk to the team</SecondaryButton>
              </figcaption>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------------- pricing */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className={container}>
            <SectionTitle eyebrow="Pricing" title="Simple pricing." body="No monthly fees. You only pay when money leaves VergePay for another bank, and you always see the amount first." />
            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              <PlanCard
                name="Your account"
                price="₦0"
                unit="/month"
                body="Everything a freelancer or small business needs to get paid."
                cta={<PrimaryButton href="/signup" className="w-full">Get started free</PrimaryButton>}
                features={["Personal and Business wallets", "Two permanent account numbers", "Invoices with secure pay links", "Free transfers between your wallets"]}
              />
              <PlanCard
                highlight
                delay={0.15}
                badge="We pay half"
                name="Transfers to other banks"
                price="½"
                unit="the processor fee"
                body="Sending to another Nigerian bank has a small processor fee. You pay half of it; VergePay covers the rest."
                cta={<SecondaryButton href="#faq">How fees work</SecondaryButton>}
                features={["The exact fee shown before you confirm", "The recipient's name checked first", "A receipt for every payment", "Never charged twice"]}
              />
            </div>
            <Reveal delay={0.1} className="mx-auto mt-4 flex max-w-4xl flex-col gap-5 rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-lg font-medium">Paying a team?</p>
                <p className="mt-1 text-sm text-white/60">Payroll is built in. Talk to us about running salaries from your Business wallet.</p>
              </div>
              <SecondaryButton href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("VergePay: payroll for my team")}`}>Talk to us</SecondaryButton>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------------------ faq */}
        <section id="faq" className="py-20 sm:py-28">
          <div className={cn(container, "grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]")}>
            <div>
              <SectionTitle center={false} eyebrow="FAQ" title="Got questions? We've got answers." />
              <Reveal from="right" delay={0.1} className="mt-8">
                <SecondaryButton href={`mailto:${CONTACT_EMAIL}`}>Contact us</SecondaryButton>
              </Reveal>
            </div>
            <Faq
              items={[
                ["Is it free to open an account?", "Yes. Opening VergePay and both wallets is free, and moving money between your own wallets costs nothing."],
                ["What does a transfer to another bank cost?", "Our payment processor charges a small fee to send money to another Nigerian bank. You pay half of it and VergePay covers the rest. You see the exact amount before you confirm."],
                ["Do my clients need VergePay to pay me?", "No. Every invoice has a secure pay link. Your client pays by card, bank transfer or USSD on a page made for them, and gets a receipt by email."],
                ["Why do you need my BVN?", "To confirm you are who you say you are before money can move, as every financial service must. It's encrypted in a separate vault, used only to verify you, and never shown back."],
                ["Is my money safe?", "Payments are processed by Flutterwave, every movement is recorded on a double-entry ledger, and sensitive actions need two-factor authentication. Card numbers never touch our servers."],
                ["Can I keep business and personal money apart?", "That's the point. You get a personal and a business wallet, each with its own account number, and can view them separately or together."],
              ]}
            />
          </div>
        </section>

        {/* ------------------------------------------------------------ final cta */}
        <section className="pb-20 sm:pb-28">
          <div className={container}>
            <Reveal spring="bouncy" className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0d0d0d] px-6 py-16 text-center sm:px-12 sm:py-24">
              <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-2/3 -translate-x-1/2 rounded-full bg-(--vp-accent) opacity-25 blur-[90px]" />
              <h2 className="relative mx-auto max-w-2xl text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl">Ready to run your money smarter?</h2>
              <p className="relative mx-auto mt-4 max-w-lg text-white/65 sm:text-lg">Open your free account in minutes and send your first invoice today.</p>
              <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <PrimaryButton href="/signup">Get started free</PrimaryButton>
                <SecondaryButton href={signedIn ? "/dashboard" : "/signin"}>{signedIn ? "Go to your dashboard" : "Sign in"}</SecondaryButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------------- footer */}
      <footer className="border-t border-white/[0.06]">
        <div className={cn(container, "grid grid-cols-2 gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]")}>
          <div className="col-span-2 md:col-span-1">
            <BrandMark onDark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">The money app for freelancers and small businesses: get paid, keep business apart, and see where every naira goes.</p>
          </div>
          <FooterColumn title="Product" links={[["#how", "How it works"], ["#product", "Features"], ["#security", "Security"], ["#pricing", "Pricing"]]} />
          <FooterColumn title="Company" links={[["#why", "Why VergePay"], [investorMail, "Investors"], [`mailto:${CONTACT_EMAIL}`, "Contact"]]} />
          <FooterColumn title="Account" links={[["/signup", "Open an account"], ["/signin", "Sign in"], ["#faq", "FAQ"]]} />
        </div>
        <div className="border-t border-white/[0.06]">
          <div className={cn(container, "flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between")}>
            <p>© {new Date().getFullYear()} VergePay. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Lock className="size-3" /> Payments are processed by Flutterwave. Brokerage accounts are held with the linked provider.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShowcaseCard({ title, body, delay, children }: { title: string; body: string; delay: number; children: React.ReactNode }) {
  return (
    <Reveal spring="bouncy" delay={delay} className="flex flex-col rounded-[20px] border border-white/[0.06] bg-[#0d0d0d] p-6 hover:border-white/[0.12] sm:p-8">
      <h3 className="text-xl font-medium tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{body}</p>
      <div className="mt-auto pt-8">{children}</div>
    </Reveal>
  );
}

function PlanCard({ name, price, unit, body, cta, features, badge, delay = 0, highlight = false }: { name: string; price: string; unit: string; body: string; cta: React.ReactNode; features: string[]; badge?: string; delay?: number; highlight?: boolean }) {
  return (
    <Reveal spring="bouncy" delay={delay} className={cn("flex flex-col rounded-[20px] border bg-[#0d0d0d] p-6 sm:p-8", highlight ? "border-(--vp-accent)/30 shadow-[0_0_60px_-24px_var(--vp-accent)]" : "border-white/[0.06]")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-medium">{name}</p>
        {badge && <span className="rounded-full bg-(--vp-accent) px-2.5 py-0.5 text-xs font-medium text-[#050505]">{badge}</span>}
      </div>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-medium tracking-[-0.05em]">{price}</span>
        <span className="text-sm text-white/55">{unit}</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{body}</p>
      <div className="mt-6 [&>a]:w-full">{cta}</div>
      <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-6 text-sm text-white/80">
        {features.map((f) => (
          <Tick key={f}>{f}</Tick>
        ))}
      </ul>
    </Reveal>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([href, label]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link href={href} className="text-white/55 transition-colors duration-300 hover:text-(--vp-accent)">{label}</Link>
            ) : (
              <a href={href} className="text-white/55 transition-colors duration-300 hover:text-(--vp-accent)">{label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
