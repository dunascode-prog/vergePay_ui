import { Envelope, EnvelopeTransaction, EnvelopeView } from "@/types/envelope";
import { getExpenses } from "@/data/mock-expenses";
import { CATEGORY_COLORS } from "@/lib/expense-category";

const ENVELOPES: Envelope[] = [
  {
    id: "env_software",
    name: "Software & tools",
    allocated: 70000,
    currency: "NGN",
    colorClass: CATEGORY_COLORS["Software & tools"],
    linkedCategory: "Software & tools",
    createdDate: "2024-11-01",
  },
  {
    id: "env_contractors",
    name: "Contractor payouts",
    allocated: 160000,
    currency: "NGN",
    colorClass: CATEGORY_COLORS["Contractor payouts"],
    linkedCategory: "Contractor payouts",
    createdDate: "2024-11-01",
  },
  {
    id: "env_marketing",
    name: "Marketing",
    // Deliberately set lower than actual spend so this envelope is over
    // budget — a genuine signal for the AI insight banner to surface, not a
    // scripted one.
    allocated: 35000,
    currency: "NGN",
    colorClass: CATEGORY_COLORS["Marketing"],
    linkedCategory: "Marketing",
    createdDate: "2024-11-01",
  },
  {
    id: "env_utilities",
    name: "Internet & utilities",
    allocated: 30000,
    currency: "NGN",
    colorClass: CATEGORY_COLORS["Internet & utilities"],
    linkedCategory: "Internet & utilities",
    createdDate: "2024-11-01",
  },
  {
    id: "env_other",
    name: "Other",
    allocated: 20000,
    currency: "NGN",
    colorClass: CATEGORY_COLORS["Other"],
    linkedCategory: "Other",
    createdDate: "2024-11-01",
  },
  {
    id: "env_tax",
    name: "Tax savings",
    allocated: 150000,
    currency: "NGN",
    colorClass: "bg-indigo-500",
    linkedCategory: null,
    createdDate: "2024-09-01",
  },
  {
    id: "env_refunds",
    name: "Client refund buffer",
    allocated: 100000,
    currency: "NGN",
    colorClass: "bg-rose-500",
    linkedCategory: null,
    createdDate: "2024-09-01",
  },
];

// Custom envelopes (no linkedCategory) track spend through these withdrawal
// transactions instead of the Expenses page, since "issuing a client
// refund" or "setting aside tax money" isn't itself a business expense.
const TRANSACTIONS: EnvelopeTransaction[] = [
  {
    id: "envtx_001",
    envelopeId: "env_refunds",
    date: "2024-10-20",
    type: "withdraw",
    amount: 20000,
    currency: "NGN",
    note: "Partial refund — DesignAgency Ltd scope change",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEnvelopes(): Promise<Envelope[]> {
  await delay(400);
  return ENVELOPES;
}

export async function getEnvelopeTransactions(): Promise<EnvelopeTransaction[]> {
  await delay(300);
  return [...TRANSACTIONS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Enriches each envelope with a computed spent figure. For envelopes linked
 * to an Expenses category, spend comes directly from real expense records —
 * add or delete an expense on the Expenses page and this number changes
 * with it, automatically. For custom envelopes, spend is the sum of their
 * own withdrawal transactions.
 */
export async function getEnvelopeViews(): Promise<EnvelopeView[]> {
  const [envelopes, expenses, transactions] = await Promise.all([
    getEnvelopes(),
    getExpenses(),
    getEnvelopeTransactions(),
  ]);

  return envelopes.map((envelope) => {
    let spent: number;
    if (envelope.linkedCategory) {
      spent = expenses
        .filter((e) => e.category === envelope.linkedCategory && e.currency === envelope.currency)
        .reduce((sum, e) => sum + e.amount, 0);
    } else {
      spent = transactions
        .filter((t) => t.envelopeId === envelope.id && t.type === "withdraw")
        .reduce((sum, t) => sum + t.amount, 0);
    }

    return {
      ...envelope,
      spent,
      remaining: envelope.allocated - spent,
      isOverBudget: spent > envelope.allocated,
    };
  });
}

export interface CreateEnvelopeInput {
  name: string;
  allocated: number;
  currency: Envelope["currency"];
  linkedCategory: Envelope["linkedCategory"];
  colorClass: string;
}

export async function createEnvelope(input: CreateEnvelopeInput): Promise<Envelope> {
  await delay(500);
  const envelope: Envelope = {
    id: `env_${Math.random().toString(36).slice(2, 9)}`,
    createdDate: new Date().toISOString().slice(0, 10),
    ...input,
  };
  ENVELOPES.push(envelope);
  return envelope;
}

export async function adjustEnvelopeAllocation(id: string, delta: number): Promise<Envelope> {
  await delay(300);
  const envelope = ENVELOPES.find((e) => e.id === id);
  if (!envelope) throw new Error(`Unknown envelope: ${id}`);
  envelope.allocated += delta;
  return envelope;
}

export async function recordWithdrawal(
  envelopeId: string,
  amount: number,
  note: string
): Promise<EnvelopeTransaction> {
  await delay(400);
  const envelope = ENVELOPES.find((e) => e.id === envelopeId);
  if (!envelope) throw new Error(`Unknown envelope: ${envelopeId}`);

  const transaction: EnvelopeTransaction = {
    id: `envtx_${Math.random().toString(36).slice(2, 9)}`,
    envelopeId,
    date: new Date().toISOString().slice(0, 10),
    type: "withdraw",
    amount,
    currency: envelope.currency,
    note,
  };
  TRANSACTIONS.unshift(transaction);
  return transaction;
}
