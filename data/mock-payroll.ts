import { Payee, PayrollPayment } from "@/types/payroll";

// Illustrative estimate only — NOT a real Nigerian PAYE/pension calculation.
// Real payroll tax withholding depends on progressive tax bands, reliefs,
// and pension scheme specifics that this simplified flat-rate estimate
// doesn't model. Treat these numbers as a placeholder for a real payroll
// tax module, not as tax advice.
const PENSION_RATE = 0.08; // employee contribution, flat estimate
const PAYE_RATE = 0.07; // flat estimate, not a real progressive-band calculation

function computeDeductions(gross: number) {
  const pensionDeduction = Math.round(gross * PENSION_RATE);
  const payeDeduction = Math.round(gross * PAYE_RATE);
  const netAmount = gross - pensionDeduction - payeDeduction;
  return { pensionDeduction, payeDeduction, netAmount };
}

const PAYEES: Payee[] = [
  {
    id: "payee_ngozi",
    name: "Ngozi Adaeze",
    initials: "NA",
    role: "Virtual Assistant",
    payType: "Retainer",
    frequency: "Monthly",
    rate: 35000,
    currency: "NGN",
    status: "active",
    bankName: "GTBank",
    accountNumberMasked: "•••• 2201",
    startDate: "2024-06-01",
    lastPaidDate: "2024-06-28",
    lastPaidAmount: 35000,
  },
  {
    id: "payee_chidi",
    name: "Chidi Okafor",
    initials: "CO",
    role: "Backend Developer",
    payType: "Per-project",
    frequency: "One-off",
    rate: 85000,
    currency: "NGN",
    status: "active",
    bankName: "Access Bank",
    accountNumberMasked: "•••• 7734",
    startDate: "2024-07-15",
    lastPaidDate: "2024-08-10",
    lastPaidAmount: 85000,
  },
  {
    id: "payee_kunle",
    name: "Kunle Adebayo",
    initials: "KA",
    role: "Graphic Designer",
    payType: "Per-project",
    frequency: "One-off",
    rate: 25000,
    currency: "NGN",
    status: "active",
    bankName: "Zenith Bank",
    accountNumberMasked: "•••• 5560",
    startDate: "2024-09-01",
    lastPaidDate: "2024-10-08",
    lastPaidAmount: 25000,
  },
  {
    id: "payee_amara",
    name: "Amara Chidozie",
    initials: "AC",
    role: "Bookkeeper",
    payType: "Retainer",
    frequency: "Monthly",
    rate: 20000,
    currency: "NGN",
    status: "active",
    bankName: "UBA",
    accountNumberMasked: "•••• 3391",
    startDate: "2024-11-01",
    lastPaidDate: null,
    lastPaidAmount: null,
  },
  {
    id: "payee_emeka",
    name: "Emeka Uche",
    initials: "EU",
    role: "Social Media Manager",
    payType: "Retainer",
    frequency: "Monthly",
    rate: 18000,
    currency: "NGN",
    status: "active",
    bankName: "Kuda",
    accountNumberMasked: "•••• 9012",
    startDate: "2024-11-05",
    lastPaidDate: null,
    lastPaidAmount: null,
  },
];

// These three mirror exp_002, exp_005, and exp_011 in the Expenses page's
// mock data exactly — same dates, same amounts. Payroll payments are the
// same real-world events as those expense line items, not a second,
// disconnected record of them.
const PAYMENTS: PayrollPayment[] = [
  {
    id: "pay_001",
    payeeId: "payee_ngozi",
    date: "2024-06-28",
    grossAmount: 35000,
    currency: "NGN",
    linkedExpenseId: "exp_002",
    ...computeDeductions(35000),
  },
  {
    id: "pay_002",
    payeeId: "payee_chidi",
    date: "2024-08-10",
    grossAmount: 85000,
    currency: "NGN",
    linkedExpenseId: "exp_005",
    ...computeDeductions(85000),
  },
  {
    id: "pay_003",
    payeeId: "payee_kunle",
    date: "2024-10-08",
    grossAmount: 25000,
    currency: "NGN",
    linkedExpenseId: "exp_011",
    ...computeDeductions(25000),
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPayees(): Promise<Payee[]> {
  await delay(500);
  return PAYEES;
}

export async function getPayrollPayments(): Promise<PayrollPayment[]> {
  await delay(400);
  return [...PAYMENTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface CreatePayeeInput {
  name: string;
  role: string;
  payType: Payee["payType"];
  frequency: Payee["frequency"];
  rate: number;
  currency: Payee["currency"];
  bankName: string;
  accountNumberMasked: string;
}

export async function createPayee(input: CreatePayeeInput): Promise<Payee> {
  await delay(500);
  const initials = input.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const payee: Payee = {
    id: `payee_${Math.random().toString(36).slice(2, 9)}`,
    initials: initials || "?",
    status: "active",
    startDate: new Date().toISOString().slice(0, 10),
    lastPaidDate: null,
    lastPaidAmount: null,
    ...input,
  };
  PAYEES.push(payee);
  return payee;
}

/**
 * Records a payroll payment for an existing payee and updates their
 * last-paid fields. Does NOT create the linked expense — that's
 * deliberately handled in the Server Action layer (see app/payroll/actions.ts),
 * which calls this and Expenses' createExpense() together so the two
 * writes happen as one conceptual operation without this data layer
 * needing to import Expenses' internals directly.
 */
export async function recordPayrollPayment(
  payeeId: string,
  grossAmount: number
): Promise<{ payment: PayrollPayment; payee: Payee }> {
  await delay(500);
  const payee = PAYEES.find((p) => p.id === payeeId);
  if (!payee) throw new Error(`Unknown payee: ${payeeId}`);

  const payment: PayrollPayment = {
    id: `pay_${Math.random().toString(36).slice(2, 9)}`,
    payeeId,
    date: new Date().toISOString().slice(0, 10),
    grossAmount,
    currency: payee.currency,
    linkedExpenseId: null, // filled in by the Server Action after the expense is created
    ...computeDeductions(grossAmount),
  };
  PAYMENTS.unshift(payment);

  payee.lastPaidDate = payment.date;
  payee.lastPaidAmount = grossAmount;

  return { payment, payee };
}

export async function attachLinkedExpense(paymentId: string, expenseId: string): Promise<void> {
  const payment = PAYMENTS.find((p) => p.id === paymentId);
  if (payment) payment.linkedExpenseId = expenseId;
}
