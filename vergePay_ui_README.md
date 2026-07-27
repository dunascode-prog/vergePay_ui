# VergePay UI

The dashboard frontend for **VergePay** — a fintech platform helping Nigerian freelancers and SMEs manage income, expenses, and business finance in one place.

> ⚠️ **Status:** Actively in development. UI is being built out module by module and is not yet feature-complete or production-ready.

---

## Overview

VergePay gives freelancers and small business owners a single dashboard to see their full financial picture — personal wallet, business wallet, invoicing, recurring billing, and client payment reliability — instead of piecing it together across banking apps and spreadsheets.

This repository is the Next.js frontend. It talks to the backend API in [`vergePay_api`](https://github.com/dunascode-prog/vergePay_api).

---

## Key Features (in progress)

- **Personal & Business Wallets** — separate balances and quick actions (Add, Send, Transfer, Invoice, Expense).
- **Performance Overview** — income, spend, net cash flow, and investment-rate metrics with trend sparklines, viewable per Personal / Business / Combined mode.
- **Client Health** — payment-reliability scoring for recurring clients, so you can spot accounts that need attention before they become a problem.
- **Upcoming Billing** — a running view of what's due next across auto-sends and auto-debits.
- **Invoices & Recurring Billing** — create invoices, track expenses, and manage subscriptions/retainers.
- **Wealth Tracker** — (planned) a broader view of savings and investment growth over time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui-style components (`components/`) |
| Data Fetching | Custom service layer (`services/`) + `proxy.ts` |
| State/Logic | Custom hooks (`hooks/`) |

---

## Project Structure

```
vergePay_ui/
├── app/            # Next.js app router pages & layouts
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Shared utilities
├── services/       # API client / data-fetching logic
├── types/          # TypeScript type definitions
├── public/         # Static assets
└── proxy.ts        # API proxy configuration
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- The [vergePay_api](https://github.com/dunascode-prog/vergePay_api) backend running locally or accessible remotely

### Installation

```bash
git clone https://github.com/dunascode-prog/vergePay_ui.git
cd vergePay_ui
npm install
```

### Environment Variables

Create a `.env.local` file pointing to your backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:PORT
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Roadmap

- [x] Dashboard shell & navigation
- [x] Personal / Business / Combined view toggle
- [x] Wallet cards & Client Health widget
- [ ] Wealth Tracker module UI
- [ ] Invoicing & recurring billing flows
- [ ] Auth & onboarding
- [ ] Responsive/mobile polish
- [ ] Production deployment

---

## Related Repositories

- Backend: [vergePay_api](https://github.com/dunascode-prog/vergePay_api)

---

## Author

Built by **Seyi** ([dunascode-prog](https://github.com/dunascode-prog)) — Software Engineering student & full-stack/fintech developer.
