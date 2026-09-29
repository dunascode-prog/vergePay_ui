import { RecurringPlan, RecurringFrequency, RecurringStatus } from "@/types/recurring";
import { Client, Currency } from "@/types/invoice";

const CLIENTS: Client[] = [
  { id: "client_techcorp", name: "TechCorp", initials: "TC", healthScore: 98, avgCollectionDays: 7 },
  { id: "client_startupxyz", name: "StartupXYZ", initials: "SX", healthScore: 62, avgCollectionDays: 18 },
  { id: "client_designagency", name: "DesignAgency Ltd", initials: "DA", healthScore: 85, avgCollectionDays: 8 },
  { id: "client_mediahouse", name: "MediaHouse Nigeria", initials: "MH", healthScore: 74, avgCollectionDays: 12 },
  { id: "client_globalreach", name: "GlobalReach Inc", initials: "GR", healthScore: 90, avgCollectionDays: 10 },
  { id: "client_northwind", name: "Northwind Studios", initials: "NS", healthScore: 41, avgCollectionDays: 34 },
];

export function getClientOptions(): { id: string; name: string }[] {
  return CLIENTS.map(({ id, name }) => ({ id, name }));
}

function findClient(clientId: string): Client {
  return (
    CLIENTS.find((c) => c.id === clientId) ?? {
      id: clientId,
      name: "Unknown client",
      initials: "?",
      healthScore: 0,
      avgCollectionDays: 0,
    }
  );
}

function addInterval(dateISO: string, frequency: RecurringFrequency): string {
  const date = new Date(dateISO);
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().slice(0, 10);
}

const PLANS: RecurringPlan[] = [
  {
    id: "rec_startupxyz",
    client: {
      id: "client_startupxyz",
      name: "StartupXYZ",
      initials: "SX",
      healthScore: 62,
      avgCollectionDays: 18,
    },
    description: "Product strategy retainer",
    amount: 120000,
    currency: "NGN",
    frequency: "monthly",
    status: "active",
    startDate: "2024-08-05",
    nextBillingDate: "2024-12-05",
    invoicesGenerated: 4,
    lastInvoiceDate: "2024-11-05",
  },
  {
    id: "rec_designagency",
    client: {
      id: "client_designagency",
      name: "DesignAgency Ltd",
      initials: "DA",
      healthScore: 85,
      avgCollectionDays: 8,
    },
    description: "Quarterly brand refresh retainer",
    amount: 450000,
    currency: "NGN",
    frequency: "quarterly",
    status: "active",
    startDate: "2024-04-22",
    nextBillingDate: "2025-01-22",
    invoicesGenerated: 3,
    lastInvoiceDate: "2024-10-22",
  },
  {
    id: "rec_globalreach",
    client: {
      id: "client_globalreach",
      name: "GlobalReach Inc",
      initials: "GR",
      healthScore: 90,
      avgCollectionDays: 10,
    },
    description: "Ongoing API integration support",
    amount: 350,
    currency: "USD",
    frequency: "monthly",
    status: "active",
    startDate: "2024-09-01",
    nextBillingDate: "2024-12-01",
    invoicesGenerated: 3,
    lastInvoiceDate: "2024-11-01",
  },
  {
    id: "rec_mediahouse",
    client: {
      id: "client_mediahouse",
      name: "MediaHouse Nigeria",
      initials: "MH",
      healthScore: 74,
      avgCollectionDays: 12,
    },
    description: "Weekly content production",
    amount: 60000,
    currency: "NGN",
    frequency: "weekly",
    status: "paused",
    startDate: "2024-06-10",
    nextBillingDate: null,
    invoicesGenerated: 14,
    lastInvoiceDate: "2024-10-28",
  },
  {
    id: "rec_northwind",
    client: {
      id: "client_northwind",
      name: "Northwind Studios",
      initials: "NS",
      healthScore: 41,
      avgCollectionDays: 34,
    },
    description: "Annual brand assets license",
    amount: 900000,
    currency: "NGN",
    frequency: "yearly",
    status: "cancelled",
    startDate: "2023-11-01",
    nextBillingDate: null,
    invoicesGenerated: 1,
    lastInvoiceDate: "2023-11-01",
  },
];

/**
 * NOTE ON PERSISTENCE: these functions mutate the in-memory `PLANS` array
 * directly. That's fine for local development with a single long-running
 * Node process, but it will NOT persist across serverless cold starts or
 * multiple instances in production. Swap these for real database writes
 * (e.g. Prisma `update`/`create`) when you connect a real backend — the
 * function signatures below are designed to drop in a real implementation
 * without changing any calling code.
 */

export async function setPlanStatus(
  id: string,
  status: RecurringStatus
): Promise<RecurringPlan | undefined> {
  await delay(300);
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) return undefined;

  plan.status = status;
  plan.nextBillingDate = status === "active" ? addInterval(today(), plan.frequency) : null;
  return plan;
}

export interface CreateRecurringPlanInput {
  clientId: string;
  description: string;
  amount: number;
  currency: Currency;
  frequency: RecurringFrequency;
  startDate: string;
}

export async function createRecurringPlan(input: CreateRecurringPlanInput): Promise<RecurringPlan> {
  await delay(500);
  const plan: RecurringPlan = {
    id: `rec_${Math.random().toString(36).slice(2, 9)}`,
    client: findClient(input.clientId),
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    frequency: input.frequency,
    status: "active",
    startDate: input.startDate,
    nextBillingDate: addInterval(input.startDate, input.frequency),
    invoicesGenerated: 0,
    lastInvoiceDate: null,
  };
  PLANS.push(plan);
  return plan;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates fetching from a real database/API, including a realistic
 * network delay — this is what makes loading.tsx's skeleton actually
 * visible instead of a no-op.
 */
export async function getRecurringPlans(): Promise<RecurringPlan[]> {
  await delay(600);
  return PLANS;
}

export async function getRecurringPlanById(id: string): Promise<RecurringPlan | undefined> {
  await delay(400);
  return PLANS.find((plan) => plan.id === id);
}
