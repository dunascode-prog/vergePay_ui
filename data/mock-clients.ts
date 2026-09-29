import { ClientProfile } from "@/types/client";

// Health scores, on-time rates, and revenue figures here mirror the values
// already established on the invoices/analytics/recurring pages, so a
// client looks consistent everywhere they appear. In a real backend this
// would all come from one source (the ledger + invoice tables); here it's
// mirrored by hand across mock files.

const CLIENTS: ClientProfile[] = [
  {
    id: "client_techcorp",
    name: "TechCorp",
    initials: "TC",
    industry: "B2B SaaS",
    location: "Lagos, Nigeria",
    contactName: "Amaka Chukwu",
    email: "amaka@techcorp.ng",
    phone: "+234 803 123 4567",
    isVip: true,
    isNew: false,
    healthScore: 98,
    avgCollectionDays: 7,
    onTimeRate: 100,
    totalRevenue: 1350000,
    currency: "NGN",
    activeInvoicesCount: 1,
    overdueInvoicesCount: 0,
    recurringPlanId: null,
    recurringPlanStatus: null,
    clientSince: "2023-02-14",
    lastActivityDate: "2024-11-08",
    notes:
      "Long-term client, always pays on invoice date. Referred DesignAgency Ltd to us in 2023.",
    aiNote: "Your most reliable client — pays before the due date almost every time.",
  },
  {
    id: "client_startupxyz",
    name: "StartupXYZ",
    initials: "SX",
    industry: "Early-stage Startup",
    location: "Lagos, Nigeria",
    contactName: "Tunde Bakare",
    email: "tunde@startupxyz.io",
    phone: "+234 810 987 6543",
    isVip: false,
    isNew: false,
    healthScore: 62,
    avgCollectionDays: 18,
    onTimeRate: 55,
    totalRevenue: 350000,
    currency: "NGN",
    activeInvoicesCount: 1,
    overdueInvoicesCount: 0,
    recurringPlanId: "rec_startupxyz",
    recurringPlanStatus: "active",
    clientSince: "2024-05-01",
    lastActivityDate: "2024-11-05",
    notes:
      "Early-stage startup, cash flow can be tight — has asked for extra days before. Worth checking in before assuming late payment is a red flag.",
    aiNote: "Payment timing has been inconsistent — consider shorter payment terms.",
  },
  {
    id: "client_designagency",
    name: "DesignAgency Ltd",
    initials: "DA",
    industry: "Creative / Design Agency",
    location: "Lagos, Nigeria",
    contactName: "Ifeoma Nwosu",
    email: "ifeoma@designagency.ng",
    phone: "+234 802 456 7890",
    isVip: false,
    isNew: false,
    healthScore: 85,
    avgCollectionDays: 8,
    onTimeRate: 92,
    totalRevenue: 780000,
    currency: "NGN",
    activeInvoicesCount: 1,
    overdueInvoicesCount: 0,
    recurringPlanId: "rec_designagency",
    recurringPlanStatus: "active",
    clientSince: "2023-06-01",
    lastActivityDate: "2024-10-29",
    notes: "Quarterly retainer for brand work. Reliable, low-maintenance relationship.",
    aiNote: "Steady, low-risk recurring revenue — a good candidate for a longer contract.",
  },
  {
    id: "client_mediahouse",
    name: "MediaHouse Nigeria",
    initials: "MH",
    industry: "Media & Broadcasting",
    location: "Abuja, Nigeria",
    contactName: "Emeka Obi",
    email: "emeka@mediahouseng.com",
    phone: "+234 705 234 5678",
    isVip: false,
    isNew: false,
    healthScore: 74,
    avgCollectionDays: 12,
    onTimeRate: 78,
    totalRevenue: 610000,
    currency: "NGN",
    activeInvoicesCount: 0,
    overdueInvoicesCount: 0,
    recurringPlanId: "rec_mediahouse",
    recurringPlanStatus: "paused",
    clientSince: "2024-03-15",
    lastActivityDate: "2024-10-28",
    notes: "Paused their weekly content plan in October, citing a budget review. Worth a check-in call.",
    aiNote: "Recurring plan paused for 2 weeks — a check-in could prevent churn.",
  },
  {
    id: "client_northwind",
    name: "Northwind Studios",
    initials: "NS",
    industry: "Creative / Design Studio",
    location: "Port Harcourt, Nigeria",
    contactName: "Grace Effiong",
    email: "grace@northwindstudios.com",
    phone: "+234 816 345 6789",
    isVip: false,
    isNew: false,
    healthScore: 41,
    avgCollectionDays: 34,
    onTimeRate: 20,
    totalRevenue: 165000,
    currency: "NGN",
    activeInvoicesCount: 0,
    overdueInvoicesCount: 1,
    recurringPlanId: "rec_northwind",
    recurringPlanStatus: "cancelled",
    clientSince: "2023-09-10",
    lastActivityDate: "2024-10-15",
    notes: "Relationship has cooled — repeat late payer. Last real conversation was over a month ago.",
    aiNote: "Payment reliability has declined sharply — treat new work cautiously.",
  },
  {
    id: "client_globalreach",
    name: "GlobalReach Inc",
    initials: "GR",
    industry: "International Tech (Remote)",
    location: "Austin, USA",
    contactName: "Sarah Kim",
    email: "sarah@globalreach.io",
    phone: "+1 512 555 0142",
    isVip: true,
    isNew: false,
    healthScore: 90,
    avgCollectionDays: 10,
    onTimeRate: 88,
    totalRevenue: 2300,
    currency: "USD",
    activeInvoicesCount: 1,
    overdueInvoicesCount: 0,
    recurringPlanId: "rec_globalreach",
    recurringPlanStatus: "active",
    clientSince: "2024-08-20",
    lastActivityDate: "2024-11-02",
    notes: "US-based, pays in USD via card. Great to work with, just slower on the finance-approval side internally.",
    aiNote: "Slow to start but consistently completes payment — normal for their approval process.",
  },
  {
    id: "client_quantum",
    name: "Quantum Analytics",
    initials: "QA",
    industry: "Fintech",
    location: "Lagos, Nigeria",
    contactName: "Bolaji Adeyemi",
    email: "bolaji@quantumanalytics.ng",
    phone: "+234 809 765 4321",
    isVip: true,
    isNew: false,
    healthScore: 95,
    avgCollectionDays: 5,
    onTimeRate: 96,
    totalRevenue: 980000,
    currency: "NGN",
    activeInvoicesCount: 2,
    overdueInvoicesCount: 0,
    recurringPlanId: null,
    recurringPlanStatus: null,
    clientSince: "2024-10-01",
    lastActivityDate: "2024-11-10",
    notes: "New fintech client, moving fast — multiple projects already in the pipeline within 6 weeks.",
    aiNote: "Fast-growing relationship — revenue from this client has tripled in 6 weeks.",
  },
  {
    id: "client_lagosfresh",
    name: "Lagos Fresh Foods",
    initials: "LF",
    industry: "E-commerce / Food & Grocery",
    location: "Lagos, Nigeria",
    contactName: "Chiamaka Eze",
    email: "chiamaka@lagosfreshfoods.com",
    phone: "+234 701 222 3344",
    isVip: false,
    isNew: true,
    healthScore: 68,
    avgCollectionDays: 15,
    onTimeRate: 70,
    totalRevenue: 210000,
    currency: "NGN",
    activeInvoicesCount: 1,
    overdueInvoicesCount: 0,
    recurringPlanId: null,
    recurringPlanStatus: null,
    clientSince: "2024-11-05",
    lastActivityDate: "2024-11-11",
    notes: "First engagement, onboarding invoice sent. No payment history yet.",
    aiNote: "Too early to assess — no payment history yet.",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getClients(): Promise<ClientProfile[]> {
  await delay(500);
  return CLIENTS;
}

export async function getClientById(id: string): Promise<ClientProfile | undefined> {
  await delay(300);
  return CLIENTS.find((c) => c.id === id);
}

export interface CreateClientInput {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
}

/**
 * Same persistence caveat as the recurring-billing mock data: this mutates
 * an in-memory array, which is fine for local dev but won't survive
 * serverless cold starts. Swap for a real database insert when connected.
 */
export async function createClient(input: CreateClientInput): Promise<ClientProfile> {
  await delay(500);
  const initials = input.name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const client: ClientProfile = {
    id: `client_${Math.random().toString(36).slice(2, 9)}`,
    name: input.name,
    initials: initials || "?",
    industry: input.industry,
    location: input.location,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    isVip: false,
    isNew: true,
    healthScore: 0,
    avgCollectionDays: 0,
    onTimeRate: 0,
    totalRevenue: 0,
    currency: "NGN",
    activeInvoicesCount: 0,
    overdueInvoicesCount: 0,
    recurringPlanId: null,
    recurringPlanStatus: null,
    clientSince: new Date().toISOString().slice(0, 10),
    lastActivityDate: new Date().toISOString().slice(0, 10),
    notes: "",
    aiNote: "No activity yet — insights will appear after the first invoice.",
  };
  CLIENTS.push(client);
  return client;
}
