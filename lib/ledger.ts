// Pure helpers that turn API accounts and ledger lines into what the
// dashboard shows. No fetching here, so it's easy to reason about (and test).
import { Account, AccountPurpose, AccountType, ScopedTransaction } from "@/types/account";

export type AccountScope = AccountPurpose | "combined";

const TYPE_LABEL: Record<AccountType, string> = {
  current: "Current",
  savings: "Savings",
  investment_wallet: "Investment wallet",
  loan_holding: "Loan",
};

const PURPOSE_LABEL: Record<AccountPurpose, string> = {
  personal: "Personal",
  business: "Business",
};

export const accountTypeLabel = (type: AccountType) => TYPE_LABEL[type];
export const purposeLabel = (purpose: AccountPurpose) => PURPOSE_LABEL[purpose];

/** "Business · Current" */
export function accountName(account: Account): string {
  return `${PURPOSE_LABEL[account.purpose]} · ${TYPE_LABEL[account.account_type]}`;
}

/** Accounts a person sees as wallets: not the loan system's, not closed. */
export function isWallet(account: Account): boolean {
  return account.account_type !== "loan_holding" && account.account_status !== "closed";
}

export function inScope(account: Account, scope: AccountScope): boolean {
  return scope === "combined" || account.purpose === scope;
}

const LOCALE: Record<string, string> = { NGN: "en-NG", USD: "en-US", GBP: "en-GB", EUR: "en-IE" };

/** 1234567 kobo → "₦12,345.67". compact → "₦12.3K". */
export function formatMinor(
  minor: number,
  currency: string,
  { compact = false, signed = false }: { compact?: boolean; signed?: boolean } = {},
): string {
  const major = minor / 100;
  const text = new Intl.NumberFormat(LOCALE[currency] ?? "en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(major);
  return text;
}

/** The currencies in these accounts, NGN first when present. */
export function currenciesOf(accounts: Account[]): string[] {
  const set = [...new Set(accounts.map((a) => a.currency_code))];
  return set.sort((a, b) => (a === "NGN" ? -1 : b === "NGN" ? 1 : a.localeCompare(b)));
}

export interface MonthKey {
  key: string; // "2026-09"
  label: string; // "Sep"
}

function keyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** The last `count` calendar months, oldest first, ending with this month. */
export function lastMonths(count: number, now = new Date()): MonthKey[] {
  const months: MonthKey[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: keyOf(d), label: d.toLocaleString("en-US", { month: "short" }) });
  }
  return months;
}

/** First day of the oldest of the last `count` months, as YYYY-MM-DD (for from_date). */
export function monthsAgoStart(count: number, now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  return `${keyOf(d)}-01`;
}

/** Ledger lines that actually moved money. Pending card charges have no lines; failed ones none. */
function moved(line: ScopedTransaction): boolean {
  return line.status === "settled" || line.status === "reversed";
}

export interface MonthFlow extends MonthKey {
  income: number;
  spent: number;
  net: number;
}

/**
 * Income and spending per month for the accounts in scope, in one currency.
 * A move between two accounts that are both in scope (e.g. personal → business
 * while viewing Combined) is neither income nor spending, so it's left out.
 */
export function monthlyFlows(
  lines: ScopedTransaction[],
  scopedAccountIds: Set<string>,
  currency: string,
  months: MonthKey[],
): MonthFlow[] {
  const byKey = new Map(months.map((m) => [m.key, { ...m, income: 0, spent: 0, net: 0 }]));
  for (const line of lines) {
    if (!moved(line) || line.currency_code !== currency) continue;
    if (!scopedAccountIds.has(line.account_id)) continue;
    if (line.counterparty_account_id && scopedAccountIds.has(line.counterparty_account_id)) continue;
    const month = byKey.get(keyOf(new Date(line.created_at)));
    if (!month) continue;
    if (line.direction === "credit") month.income += line.amount_minor;
    else month.spent += line.amount_minor;
  }
  return months.map((m) => {
    const flow = byKey.get(m.key)!;
    return { ...flow, net: flow.income - flow.spent };
  });
}

/**
 * Closing balance at the end of each month for the scoped accounts, worked
 * backwards from today's balance. Unlike monthlyFlows this counts every
 * movement, since a transfer out of scope does change the scoped balance.
 */
export function monthlyBalances(
  lines: ScopedTransaction[],
  accounts: Account[],
  currency: string,
  months: MonthKey[],
): number[] {
  const ids = new Set(accounts.filter((a) => a.currency_code === currency).map((a) => a.account_id));
  let balance = accounts
    .filter((a) => ids.has(a.account_id))
    .reduce((sum, a) => sum + a.balance_minor, 0);

  const flowByKey = new Map<string, number>();
  for (const line of lines) {
    if (!moved(line) || !ids.has(line.account_id)) continue;
    const key = keyOf(new Date(line.created_at));
    const signed = line.direction === "credit" ? line.amount_minor : -line.amount_minor;
    flowByKey.set(key, (flowByKey.get(key) ?? 0) + signed);
  }

  const closing: number[] = new Array(months.length);
  for (let i = months.length - 1; i >= 0; i--) {
    closing[i] = balance;
    balance -= flowByKey.get(months[i].key) ?? 0;
  }
  return closing;
}

/** Percent change, or null when there's nothing to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export const TRANSACTION_LABEL: Record<string, string> = {
  transfer: "Transfer",
  card_payment: "Card top-up",
  loan_disbursement: "Loan disbursed",
  loan_repayment: "Loan repayment",
  fee: "Fee",
  refund: "Refund",
  invoice_payment: "Invoice payment",
  bank_deposit: "Bank transfer in",
};
