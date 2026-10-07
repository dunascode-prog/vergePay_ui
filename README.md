# VergePay UI

**The web dashboard for VergePay, a fintech platform for Nigerian freelancers and small businesses. One screen shows personal and business money side by side: wallets, invoices, recurring billing, client payment health, expenses, payroll, savings goals and budget envelopes.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-000000)
![Status](https://img.shields.io/badge/status-connecting_to_the_API-F5A623)

Built by **[Seyitan Omodara](https://github.com/dunascode-prog)** · Backend: [vergePay_api](https://github.com/dunascode-prog/vergePay_api)

> **Project status.** All 11 sections of the app (19 routes) are designed and built. Sign-up and sign-in call the real API. The other screens still show realistic sample data while they're connected to the backend one feature at a time; see [Connecting to the API](#connecting-to-the-api). The backend is finished and tested: 56 endpoints and 664 passing Postman assertions.

---

## At a glance

| | |
|---|---|
| **What it is** | A dashboard for freelancers and small businesses to run personal and business money in one place |
| **Screens** | 21 routes in 11 sections: overview, analytics, invoices (list, new, detail, edit, and the public pay page), recurring billing, clients, business overview, expenses, payroll, goals, envelopes, loans |
| **Stack** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, Recharts, React Hook Form + Zod |
| **Rendering** | Server Components by default. Client Components only where there's interaction. Server Actions for forms |
| **Money** | Naira and US dollars kept separate and never blended at an invented exchange rate. Formatted per locale with `Intl.NumberFormat` |
| **Auth model** | HttpOnly cookie sessions set by the API. The browser's JavaScript never holds a token. Refresh and route guarding are handled for you |
| **Backend** | [vergePay_api](https://github.com/dunascode-prog/vergePay_api): Express 5 + PostgreSQL, with a double-entry ledger, Flutterwave payments, TOTP 2FA and Alpaca investments |

---

## Why VergePay

A Nigerian freelancer usually has a personal account, a business account, a few clients who pay late, retainers that renew every month, and a spreadsheet trying to hold it all together. Banking apps show balances. They don't answer the questions that matter:

- *Who owes me money, and are they likely to pay on time?*
- *How much of this month's income is actually mine after expenses, tax and savings?*
- *Is my business healthier than it was three months ago?*

VergePay answers those on one screen. This repository is that screen. The backend moves the money; this app turns it into decisions.

---

## Screens

The sidebar groups the app the way a small-business owner thinks about their money.

### Home
| Screen | Route | What it shows |
|---|---|---|
| **Landing page** | `/` | The public home page (vergepay.com), in the style of Mono and Flutterwave. A hero ("Built for Nigeria's freelancers and small businesses", with Create free account → `/signup` and Sign in → `/signin`) and a live-looking product preview; what VergePay is built on (Flutterwave payments, BVN verification, 2FA, a double-entry ledger); every feature in one grid; deep dives on invoicing, the two wallets and insights; security; who it's for; a "Why VergePay" section for investors and partners; how to get started; FAQ. Responsive with a phone menu, and signed-in visitors get "Go to dashboard" instead of sign-up. The contact address is `CONTACT_EMAIL` in `components/landing/Landing.tsx` |

### Account
| Screen | Route | What it shows |
|---|---|---|
| **Sign in** | `/signin` | A split layout in the style of fintech sign-in pages: a focused form on the left, and a brand panel on the right that disappears on phones. Email and password with a show/hide toggle; a **two-factor code step** for accounts with 2FA on; clear inline errors; and a return to the page you were trying to open |
| **Sign up** | `/signup` | The same split layout. Username, email and password, with a **live password checklist** (12+ characters, upper and lowercase, a number, a special character) that ticks off as you type. Server errors such as "username already exists" show on the field they belong to |
| **Create your wallet** | `/onboarding` | Right after sign-up: choose a Personal or a Business wallet, and NGN or USD. The dashboard stays locked until the first wallet exists, and the other can be added later |

### Main
| Screen | Route | What it shows |
|---|---|---|
| **Overview** | `/dashboard` | **Live from the ledger.** Every customer has up to two wallets, a **Personal** and a **Business** one, and the **Personal / Business / Combined** toggle shows one, the other, or both. A performance card (income, spent and net this month, and the balance, each compared with last month, with six-month sparklines), the wallet cards (balance, currency, copyable account number, or "Add a business wallet" if it's missing), a six-month income-vs-spending chart and the latest transactions (*Personal wallet → Business wallet*). An **Investments** card links Alpaca and then shows synced holdings. A reminder to link comes back every 3 days until they do. The **Goals** card shows your real savings goals, due soonest first. Widgets whose features aren't connected yet (AI insight, client health, upcoming billing, outstanding invoices, budgets) follow the toggle and are tagged **Sample data**. Money moved into or out of a goal is saving, so it never counts as income or spending |
| **Move money** | wallet card actions | **Add money** by bank transfer (a permanent account number for the wallet) or debit card (linked once through Flutterwave's hosted checkout, then one-tap top-ups, with 3-D Secure handled). **Send** to any VergePay wallet after a name check ("Ada Obi"), with a review screen and receipt. **Transfer** between your own personal and business wallets. The first time money moves, a one-time **identity check** (BVN, legal name, date of birth) runs inside the same dialog, and 2FA is turned on when linking a card needs it |
| **Analytics** | `/dashboard/analytics` | **Live from your invoices and ledger**, following the Personal / Business / Combined toggle and a this month / last 3 months / this year filter. Insights written from your own numbers (overdue invoices, money due this week, one client carrying most of your revenue, revenue up or down), the revenue trend (NGN and USD apart), a cash-flow forecast from unpaid invoices (overdue, next 7 days, 8–30 days, later), collection metrics, client concentration, late-payment ageing, how often reminders led to payment, a client leaderboard and where money went (sent to others, invoices you paid, loan repayments, fees, refunds). The goals card shows your real savings goals and whether each is on pace. The health score is still tagged **Sample data** |

### Payments
| Screen | Route | What it shows |
|---|---|---|
| **Invoices** | `/dashboard/invoices` | **Live from the API.** Outstanding, overdue, paid in the last 30 days and drafts at a glance; **Sent** and **To pay** tabs; filter by status; a table on desktop, cards on a phone. Updates by itself when a client pays |
| **New / edit invoice** | `/dashboard/invoices/new`, `/[id]/edit` | Bill a client (add one without leaving the form), choose the wallet it's paid into, line items with live totals, due-date shortcuts and a note. **Send** (with or without emailing it) or **save a draft** |
| **Invoice detail** | `/dashboard/invoices/[id]` | The invoice as the client sees it, the **pay link** (copy, WhatsApp, email reminder), and an activity trail: sent, emailed (with delivery status), paid by card or wallet, receipt emailed. Send, edit or delete a draft; cancel an unpaid one; refund a wallet payment; pay an invoice you've received |
| **Pay an invoice** | `/pay/[token]` | **Public, no account needed.** The client's hosted invoice page: who, what, how much, by when. Pays through Flutterwave checkout (card, bank transfer, USSD), or from a VergePay wallet when signed in, then confirms the payment with the API |
| **Recurring billing** | `/dashboard/recurring`, `/new`, `/[id]` | **Live.** Bill a client the same amount weekly, monthly, quarterly or yearly, with payment terms (on receipt, 7, 14 or 30 days). The form previews the first billing dates, and a plan that starts today sends its first invoice at once. Monthly recurring revenue, the next invoice, pause, resume, edit or cancel from the list or the plan, the invoices each plan has sent (each links back to its plan), and a warning when a plan couldn't send its last invoice |
| **Clients** | `/dashboard/clients` | **Live.** What clients have paid and owe (per currency, overdue flagged), and who needs attention. Insights from your invoices: overdue clients, one client carrying most of your revenue, reliable payers, new and quiet clients. Cards show each client's health score and why, with VIP, New, Recurring and overdue tags. Filter, search (name, contact, industry, location) and sort. A side sheet has the full record: health and its reasons, paid and owed, on-time payments, days to pay, recurring plans, latest invoices, contact and notes. Add, edit, mark VIP, archive and restore; **New invoice** and **New plan** start with the client chosen |

### Business
| Screen | Route | What it shows |
|---|---|---|
| **Business overview** | `/dashboard/business` | **Live.** Follows the Personal / Business / Combined toggle. Revenue, money out and net this year (per currency, and moves between your own wallets don't count), what clients owe and how much is overdue, revenue and money out over six months, and a **business health score** worked out from five checks shown under it: paying on time, overdue invoices, how much rests on one client, how many months your cash covers, and revenue against the previous 90 days. A **"needs attention"** list links straight to each problem: overdue invoices, plans that couldn't send, late-paying clients, paused plans and unsent drafts. Also top clients, recurring revenue with the next invoice, wallet balances and where money went |
| **Expenses** | `/dashboard/expenses` | Expense table with category breakdown and trend. Flags recurring expenses and **missing receipts** |
| **Payroll** | `/dashboard/payroll`, `/[id]` | **Live, paying real VergePay wallets.** Add a payee by their account number (you see whose wallet it is before saving), with their role, pay type (retainer, per project, hourly), how often (monthly, every two weeks, one-off) and usual amount. Each payee shows what they were last paid and when they're next due; filter by due, type or inactive, or search. **Run payroll** pays everyone ticked from one wallet in one go, each at their usual amount or another, with a note they see: all or nothing, and safe to retry. Recent runs are listed, and each payee has a page with every payment, editing, and making them inactive |

### Wealth
| Screen | Route | What it shows |
|---|---|---|
| **Goals** | `/dashboard/goals`, `/[id]` | **Live, with real money.** Each goal is a savings pot with its own account: **Add money** moves it from a wallet into the goal, **Withdraw** moves it back, both instantly and safe to retry. A goal shows what it holds against its target, the date, a **pace check** (on track, behind, funded or past its date, against a straight line from the day it was made) and how much to save each month to make it. The detail page lists every move in and out with the running balance, and lets you edit the goal or close it, which returns whatever is left to a wallet. Closed goals stay listed with what they saved |
| **Envelopes** | `/dashboard/envelopes` | Budget envelopes that you fund from and withdraw back into your wallets, with spent and remaining amounts for each |
| **Loans** | `/dashboard/loans`, `/apply`, `/[id]` | **Live.** Apply for a personal loan, cash advance, asset finance or mortgage: amount, term, the wallet it's paid into and what it's for, with the one-time identity check in the same flow. An application in review shows its details until it's decided, and a turned-down one shows the reason. Active loans show what's still owed (interest included), progress through the installments and the next payment, with overdue ones flagged. Each loan has its full schedule (principal and interest per month, and paid, due soon, overdue or upcoming) and a one-tap **Pay** for the next installment from either wallet. In development builds an under-review application has Approve and Reject buttons, using the API's `/v1/dev` helpers |

Every feature page follows the same layout: a header with actions, summary cards, the main grid or table, an "add" dialog, and an AI insight banner. Once you've used one page, you know how to use them all.

---

## Engineering highlights

### Server-first rendering
Pages are **React Server Components** by default. They read their data on the server and send finished HTML, so the dashboard's charts and tables don't wait on a client-side fetch. Components are marked `"use client"` only where there's real interaction: toggles, dialogs, forms and charts. Mutations such as creating a client, logging an expense, running payroll or pausing a plan are **Server Actions** (`app/(protected)/dashboard/*/actions.ts`). They refresh only the page they changed.

### A security model that keeps tokens away from JavaScript
The API issues the session as **HttpOnly, `SameSite=Strict` cookies**, so no script on the page, including an injected one, can read the access or refresh token. The UI stores nothing itself: no `localStorage`, and no token in React state.
- **Same-origin by design.** The browser calls `/v1/*` on the UI's own origin, and a rewrite in `next.config.ts` forwards it to the API. The session cookies are therefore first-party to the app in every environment, with no CORS and no cross-site cookies. The API's address (`API_URL`) is server-only.
- **Silent refresh, exactly once.** The access cookie expires with its 15-minute token. When a data request then gets a 401, `lib/api.ts` refreshes the session and retries.
  - Refresh tokens are single use, so parallel requests **share one refresh** instead of racing, which would sign the user out.
  - Auth endpoints are excluded, so a wrong password never triggers a refresh.
  - If the refresh fails, the user goes to `/signin?next=…` and returns to the same page afterwards.
- **`proxy.ts`** (Next.js 16's replacement for middleware) runs before any `/dashboard` route renders. It does a fast cookie check and never contacts the API:
  - no session → `/signin?next=…`
  - password accepted but 2FA code not yet entered → the code step
  - already signed in → `/signin` and `/signup` redirect to the app

  It reads the token's claims **without verifying them**, because the UI deliberately doesn't hold the API's signing key. That's safe because the proxy only decides where to send someone. Every piece of data is still authorised by the API itself.
- **No open redirects.** `?next=` only accepts same-site paths, so `?next=//evil.example` goes to `/dashboard`.
- **Two-factor sign-in.** For accounts with TOTP 2FA on, the password alone gives a limited session that the API refuses for any data. The sign-in form moves to a 6-digit code step (with `autocomplete="one-time-code"`), and a valid code upgrades the session. "Use a different account" revokes the limited session.

### Two wallets, one view
A customer has **at most one personal and one business wallet**; the API refuses a third. Sign-up leads straight to creating the first one. The Personal / Business / Combined toggle maps exactly onto them, so personal spending and business money never blur together. Investments sit in their own optional card: the investment wallet behind them is opened by the API when the customer links Alpaca, and it never shows up as a wallet.

### A dashboard computed from the ledger
The overview has no summary endpoint to trust: it's worked out in the browser from each account's ledger lines, by small pure functions in `lib/ledger.ts`.
- **Scope in the URL.** Personal, Business or Combined is `?scope=`, so the toggle, the sidebar and the page always agree, and a refresh or a shared link keeps the view.
- **Moving money between your own accounts isn't income.** A ₦40,000 move from personal to business is spending in the Personal view and income in the Business view, but in Combined it's neither. The test suite checks exactly those numbers.
- **Balances over time, worked backwards.** Each month's closing balance comes from today's balance, subtracting each month's movements.
- **One currency at a time.** Naira and dollars are never summed. With both, a currency switch appears.
- **Charts built to be read.** Income and spending are a colour pair checked for colour-blind separation and 3:1 contrast in light and dark mode, the chart has a legend and a screen-reader table, and a sparkline only appears once there are two months of data to draw.

### Moving money safely
Every money action is built so that a retry or a double-tap can't pay twice, and so that you see exactly what will happen before it does.
- **Idempotency keys on every attempt.** Each Send, Transfer, top-up and card link carries its own `Idempotency-Key`, so a flaky connection that retries replays the same result instead of moving money again.
- **Name enquiry before paying.** The recipient's name comes from the API before you confirm. Your own wallets are caught ("use Transfer"), and so are currency mismatches.
- **Review, then receipt.** Amount, fee (free), note and destination are shown before sending, then a receipt with a short reference.
- **Cards never touch VergePay.** Card details are typed on Flutterwave's page. After checkout or 3-D Secure, the return page asks the API, which verifies with Flutterwave itself, rather than trusting the redirect.
- **Identity and 2FA in the flow, not a detour.** The one-time BVN check waits for the (asynchronous) verdict and carries straight on. Adding a card turns 2FA on if needed, using the same step as brokerage linking.

### A dashboard that updates itself
When someone sends you money, your balance, charts and history update, a toast says who sent what, and the bell counts it, all without a reload ([`components/realtime/LiveUpdates.tsx`](components/realtime/LiveUpdates.tsx), [`components/notifications/NotificationBell.tsx`](components/notifications/NotificationBell.tsx)).
- **One WebSocket, same session.** It connects to `/v1/ws` on the app's own origin, and the `/v1` rewrite forwards the upgrade to the API. The HttpOnly session cookie goes with it, so JavaScript still never touches a token.
- **Expiry handled quietly.** The API closes the socket (`4401`) when the short-lived access token expires. The client refreshes the session through the same shared `refreshSession()` as HTTP and reconnects.
- **Nothing lost offline.** It reconnects with backoff, straight away when the network or the tab comes back, and then re-reads balances and alerts. The API's notification list is the durable copy; the socket only makes it instant.
- **Toasts only for what you didn't do yourself:** money in and identity decisions. Your own sends just appear in the bell. Reading an alert in one tab clears the badge in the others.

### Money shown honestly
Totals in different currencies are **never added together**. A client paying ₦620,000 and $1,400 is shown as `₦620,000 + $1,400`, not as a single naira figure based on a guessed exchange rate (`lib/format.ts`). Amounts use locale formatting (`en-NG`, `en-US`). The API stores all money as integer minor units (kobo and cents), so no floating-point error ever reaches the screen.

### Forms that validate before the round trip
Forms use **React Hook Form with Zod schemas** whose rules match the API's. For example, sign-up requires a password of at least 12 characters with mixed character types, plus a matching confirmation. Mistakes show up right away, next to the field. If the API still rejects something, its structured error lands on the right input rather than in a generic toast: a conflict names the field (`"username already exists"`), and a validation error lists messages per field. `lib/api.ts` turns both into form errors through `ApiError.fieldErrors()`.

### A typed domain model
Every concept on screen has a TypeScript type in `types/`: `Invoice`, `ClientProfile`, `RecurringPlan`, `Expense`, `Payee` and `PayrollPayment`, `Goal`, `Envelope`, `LedgerSnapshot`, and the analytics series. Invoices carry their own ledger entries and payment records, matching how the backend's double-entry ledger records them. Replacing the sample data with API responses is then a change of data source, not a redesign.

### Business rules kept out of components
Calculations live in small, pure modules in `lib/` rather than inside JSX:
- `recurring-math.ts`: the monthly equivalent of any billing frequency (the business overview's sample data)
- `recurring.ts`: billing dates by the API's rule (counted from the start date, so the 31st stays the 31st where the month has one), monthly recurring revenue, labels
- `goal-pace.ts`: whether a goal is on track for its deadline at the current contribution rate
- `expense-category.ts`: category totals from line items, with colours shared across Analytics, Business and Expenses so a category looks the same everywhere
- `format.ts`: currency formatting and per-currency sums

### Accessible components, dark mode
The UI is built on **shadcn/ui over Base UI** primitives, so dialogs, dropdowns, sheets, tabs and tooltips handle focus, keyboard navigation and ARIA roles properly. The theme is made of CSS variables in Tailwind 4, with light and dark modes via `next-themes`. The sidebar collapses, remembers its state in a cookie, and becomes a sheet on mobile.

---

## Architecture

```mermaid
flowchart LR
    B["Browser"] -->|"pages"| P["proxy.ts<br/>session guard"]
    P --> RSC["Server Components<br/>+ Server Actions"]
    B -->|"fetch /v1/* (same origin,<br/>HttpOnly cookies)"| RW["next.config.ts<br/>rewrite"]
    RW -->|"REST /v1/*"| API["vergePay_api<br/>Express 5"]
    API --> DB[("PostgreSQL<br/>double-entry ledger")]
    API --> FLW["Flutterwave<br/>cards, bank transfers"]
    API --> W["BullMQ worker"] --> ALP["Alpaca<br/>investments"]
```

### Sign-in flow

```mermaid
sequenceDiagram
    participant U as Browser
    participant UI as VergePay UI
    participant API as vergePay_api
    U->>UI: GET /dashboard/invoices (no session)
    UI-->>U: proxy.ts → /signin?next=/dashboard/invoices
    U->>UI: email + password
    UI->>API: POST /v1/auth/signin (via the /v1 rewrite)
    API-->>U: Set-Cookie access_token, refresh_token (HttpOnly)
    alt 2FA enabled
        API-->>UI: two_factor_required: true (session limited)
        U->>UI: 6-digit code
        UI->>API: POST /v1/auth/2fa/verify
        API-->>U: full session cookies
    end
    UI->>U: back to /dashboard/invoices
    Note over UI,API: 15 min later, a request gets 401:<br/>one shared POST /v1/auth/refresh, then retry
```

---

## Connecting to the API

The screens were designed first, using sample data shaped like the real domain. They're now being connected to the finished backend one feature at a time. Each step is a small, reviewed pull request.

| Area | Screens | API endpoints | Status |
|---|---|---|---|
| Sign-up and sign-in | `/signup`, `/signin` | `POST /v1/auth/signup`, `/signin` | ✅ Connected |
| Session, 2FA, sign-out | `proxy.ts`, sign-in, user menu | `/v1/auth/refresh`, `/2fa/verify`, `/logout`, `/v1/users/me` | ✅ Connected |
| Wallets and overview | `/onboarding`, `/dashboard`, sidebar wallets, greeting | `GET`/`POST /v1/accounts` (one personal and one business wallet), `/:id/transactions` | ✅ Connected |
| Add money, Send, Transfer, identity | wallet-card actions, `/dashboard/payments/complete` | `POST /v1/kyc/submissions`, `/v1/accounts/lookup`, `POST /v1/transactions`, `/v1/cards` (link, charges), `/v1/accounts/:id/virtual-account`, `/v1/transactions/:id/sync` | ✅ Connected |
| Notifications and live updates | top-bar bell, toasts, the whole dashboard | `GET /v1/notifications`, `/:id/read`, `/read-all`, WebSocket `/v1/ws` | ✅ Connected |
| Invoices and clients | `/dashboard/invoices/*` | `/v1/invoices` (create, edit and delete drafts, `/send`, `/remind`, `/pay`, `/cancel`, `/refund`), `/v1/clients` | ✅ Connected |
| Pay links | `/pay/[token]` (public) | `/v1/pay/:token`, `/checkout`, `/sync`, `/wallet` | ✅ Connected |
| Investments | dashboard Investments card, link reminder, `/dashboard/investments/linked` | `POST`/`GET /v1/brokerage-links` (opens the investment wallet), `/v1/holdings`, `/v1/auth/2fa/enable` + `/verify` | ✅ Connected |
| Loans | `/dashboard/loans`, `/apply`, `/[id]` | `/v1/loans/applications` (apply, list), `/v1/loans`, `/:id`, `/:id/schedule`, `/:id/repayments` | ✅ Connected |
| Analytics | `/dashboard/analytics` | `/v1/invoices` (with `reminders_sent`, `last_reminder_at`), `/v1/accounts/:id/transactions`, `/v1/goals` | ✅ Connected (health score still sample) |
| Goals | `/dashboard/goals`, `/[id]`, the Home goals card | `/v1/goals` (create, list, get with activity, edit, `/contributions`, `/withdrawals`, `/close`) | ✅ Connected |
| Recurring billing | `/dashboard/recurring/*` | `/v1/recurring-plans` (create, list, get, edit, `/pause`, `/resume`, `/cancel`), `/v1/clients` | ✅ Connected |
| Clients | `/dashboard/clients` | `/v1/clients` (list with stats and health, get with invoices, create, edit, archive, `/restore`) | ✅ Connected |
| Business overview | `/dashboard/business` | `/v1/accounts` and `/:id/transactions`, `/v1/invoices`, `/v1/recurring-plans`, `/v1/clients` | ✅ Connected |
| Payroll | `/dashboard/payroll`, `/[id]` | `/v1/payees` (add, list, get with payments, edit), `/v1/payroll/runs` (pay, list), `/v1/accounts/lookup` | ✅ Connected |
| Expenses, envelopes | their pages | none yet; the backend doesn't have these features | 🎨 Designed, sample data |

---

## Project structure

```
vergepay/
├── app/
│   ├── layout.tsx                  # root layout, fonts, metadata
│   ├── (home)/                     # landing / get started
│   ├── (public)/signin, signup/    # auth pages
│   └── (protected)/dashboard/      # the app: one folder per screen
│       ├── layout.tsx              # sidebar + top bar + theme
│       ├── invoices/[id]/edit, new/
│       ├── recurring/[id], new/
│       └── clients, business, expenses, payroll, goals, envelopes, analytics/
│           └── actions.ts          # Server Actions for that screen
├── components/
│   ├── ui/                         # shadcn/ui primitives on Base UI
│   └── business, clients, expenses, payroll, goals, envelopes, recurring/
│                                   # feature components: header, cards, grid, dialog, AI banner
├── lib/                            # API client, formatting, pure business rules
├── services/                       # API calls grouped by feature (auth, …)
├── types/                          # the domain model
├── data/                           # sample data used until each screen is connected
├── hooks/                          # use-mobile
├── public/                         # logos and static assets
└── proxy.ts                        # route guard for /dashboard (Next.js 16)
```

---

## Getting started

### Prerequisites
- **Node.js 20.9 or newer** (22 LTS recommended)
- The **[vergePay_api](https://github.com/dunascode-prog/vergePay_api)** backend running on `http://localhost:8000`. Its README covers setup. CORS needs no configuration, because the browser only ever talks to the UI's origin.

### Install and run

```bash
git clone https://github.com/dunascode-prog/vergePay_ui.git
cd vergePay_ui
npm install
```

Copy `.env.example` to `.env.local`:

```env
# Where the VergePay API runs. Server-only: the browser calls /v1/* on this
# app, and next.config.ts forwards it here.
API_URL=http://localhost:8000
```

> This app needs **no secrets**. The API issues and verifies sessions, and its JWT signing keys belong only in the API's own `.env`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, create an account at `/signup`, and sign in.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint with the Next.js rules |

---

## Roadmap

- [x] Dashboard shell: sidebar, top bar, light and dark themes, mobile layout
- [x] Personal / Business / Combined views
- [x] All 10 sections designed and built: invoices, recurring billing, clients, business overview, expenses, payroll, goals, envelopes, analytics
- [x] Sign-up and sign-in against the real API
- [x] Clean production build (`next build` with strict TypeScript, zero errors) and every in-app link resolving to a real route
- [x] Route guard, 2FA sign-in step, silent session refresh and sign-out
- [ ] Security settings: turn 2FA on or off from the app
- [x] Wallets, balances, cash flow and transaction history from the ledger, per Personal / Business / Combined
- [x] Add money (bank-transfer account number, or a linked card via Flutterwave), Send with a name check, Transfer between your wallets, and one-time identity verification (BVN)
- [x] Live dashboard: balances update the moment money moves, a notification bell, and toasts for money in
- [x] Invoices on the real API: clients, drafts with line items, send and email, pay links clients pay by card or bank transfer, reminders, cancel and refund
- [x] Investments: link Alpaca (with 2FA set up on the way), synced holdings, a reminder until linked
- [x] Loans: apply, view the repayment schedule, repay
- [x] Savings goals with real money: add, withdraw, pace, activity, edit and close
- [x] Payroll to VergePay wallets: payees, who's due, all-or-nothing pay runs, payment history
- [ ] Remove leftover sample data and unused components
- [ ] Deployment

---

## Related

- **Backend:** [vergePay_api](https://github.com/dunascode-prog/vergePay_api). The money engine: a double-entry ledger, idempotent payments, Flutterwave, TOTP 2FA, Alpaca investments, and a 412-request Postman suite

---

## Author

**Seyitan Omodara**, full-stack and fintech developer. [GitHub @dunascode-prog](https://github.com/dunascode-prog)
