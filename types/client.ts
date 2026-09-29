import { Currency } from "@/types/invoice";

export interface ClientProfile {
  id: string;
  name: string;
  initials: string;
  industry: string;
  location: string;
  contactName: string;
  email: string;
  phone: string;

  // Manually-set relationship flags — the kind of judgment a freelancer
  // makes themselves, not something derivable from transaction data alone.
  isVip: boolean;
  isNew: boolean;

  // Payment behavior — feeds the same health-score logic used on the
  // invoices and analytics pages, so a client's standing is consistent
  // everywhere they appear in the app.
  healthScore: number; // 0-100
  avgCollectionDays: number;
  onTimeRate: number; // 0-100

  totalRevenue: number;
  currency: Currency;
  activeInvoicesCount: number;
  overdueInvoicesCount: number;

  // Link to a recurring plan if one exists — lets the client detail view
  // deep-link into the recurring billing page instead of duplicating that
  // data here.
  recurringPlanId: string | null;
  recurringPlanStatus: "active" | "paused" | "cancelled" | null;

  clientSince: string; // ISO date
  lastActivityDate: string; // ISO date
  notes: string;

  /**
   * A short, LangChain-style relationship summary. Hardcoded here as mock
   * output — in production this is where the AI insights layer's per-client
   * summary would be generated and cached.
   */
  aiNote: string;
}
