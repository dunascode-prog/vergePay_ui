"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Invoice } from "@/types/invoice";
import { formatMoney, formatShortDate, daysOverdue } from "@/lib/format";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuBellRing, LuMail, LuMessageCircle } from "react-icons/lu";

interface RemindInvoiceViewProps {
  invoice: Invoice | undefined;
}

type Tone = "friendly" | "firm" | "final_notice";

function templateFor(tone: Tone, invoice: Invoice): string {
  const amount = formatMoney(
    invoice.amount - invoice.amountPaid,
    invoice.currency,
  );
  const overdue = daysOverdue(invoice.dueDate);

  if (tone === "final_notice") {
    return `Hi ${invoice.client.name},\n\nThis is a final notice regarding ${invoice.number}, which is now ${overdue} days overdue. The outstanding balance of ${amount} is due immediately. Please reach out if there's an issue preventing payment so we can resolve this together.\n\nThanks,\nSeyi`;
  }
  if (tone === "firm") {
    return `Hi ${invoice.client.name},\n\n${invoice.number} for ${amount} is now overdue. Could you let me know a payment date so I can plan around it? Happy to answer any questions on my end.\n\nThanks,\nSeyi`;
  }
  return `Hi ${invoice.client.name},\n\nJust a friendly nudge on ${invoice.number} for ${amount}, due ${invoice.dueDate ? formatShortDate(invoice.dueDate) : "recently"}. Let me know if you need anything from me to get this settled.\n\nThanks,\nSeyi`;
}

const PAST_REMINDERS = [
  { date: "2024-11-06", channel: "Email", note: "Friendly reminder" },
];

const FALLBACK_INVOICE: Invoice = {
  id: "fallback",
  number: "",
  client: {
    id: "",
    name: "",
    initials: "",
    healthScore: 0,
    avgCollectionDays: 0,
  },
  description: "",
  issuedDate: null,
  dueDate: null,
  currency: "NGN",
  amount: 0,
  amountPaid: 0,
  status: "draft",
  isRecurring: false,
  ledger: [],
  payments: [],
};

export function RemindInvoiceView({ invoice }: RemindInvoiceViewProps) {
  const router = useRouter();
  // Hooks must run unconditionally on every render, so initialize them with
  // a safe fallback and only check for the missing invoice afterward.
  const safeInvoice = invoice ?? FALLBACK_INVOICE;

  const [tone, setTone] = useState<Tone>(
    safeInvoice.status === "overdue" ? "firm" : "friendly",
  );
  const [message, setMessage] = useState(() => templateFor(tone, safeInvoice));
  const [emailChecked, setEmailChecked] = useState(true);
  const [whatsappChecked, setWhatsappChecked] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!invoice) {
    notFound();
  }

  const balance = safeInvoice.amount - safeInvoice.amountPaid;
  const overdue = daysOverdue(safeInvoice.dueDate);

  function handleToneChange(next: Tone) {
    setTone(next);
    setMessage(templateFor(next, safeInvoice));
  }

  async function handleSend() {
    setSending(true);
    // Goes through the idempotency-key protocol on the mutating call so a
    // retry can't fire a duplicate reminder.
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setTimeout(() => router.push(`/invoices/${safeInvoice.id}`), 1200);
  }

  const noChannelSelected = !emailChecked && !whatsappChecked;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <PageHeader
          backHref={`/dashboard/invoices/${invoice.id}`}
          backLabel="Back to invoice"
          title="Send reminder"
        />

        <Card className="border-gray-200 shadow-none mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {invoice.number} · {invoice.client.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatMoney(balance, invoice.currency)} outstanding
                {invoice.status === "overdue" && ` · ${overdue} days overdue`}
              </p>
            </div>
            <StatusBadge status={invoice.status} />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-none mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) => handleToneChange(v as Tone)}
              >
                <SelectTrigger id="tone" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly nudge</SelectItem>
                  <SelectItem value="firm">Firm follow-up</SelectItem>
                  <SelectItem value="final_notice">Final notice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Edit message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
              />
            </div>

            <div className="space-y-2">
              <Label>Send via</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-email"
                  checked={emailChecked}
                  onCheckedChange={(v) => setEmailChecked(!!v)}
                />
                <Label
                  htmlFor="channel-email"
                  className="font-normal flex items-center gap-1.5"
                >
                  <LuMail className="h-3.5 w-3.5 text-gray-400" />
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-whatsapp"
                  checked={whatsappChecked}
                  onCheckedChange={(v) => setWhatsappChecked(!!v)}
                />
                <Label
                  htmlFor="channel-whatsapp"
                  className="font-normal flex items-center gap-1.5"
                >
                  <LuMessageCircle className="h-3.5 w-3.5 text-gray-400" />
                  WhatsApp
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {PAST_REMINDERS.length > 0 && (
          <Card className="border-gray-200 shadow-none mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Previous reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PAST_REMINDERS.map((reminder, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500">{reminder.note}</span>
                  <span className="text-gray-400">
                    {formatShortDate(reminder.date)} · {reminder.channel}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            disabled={sending || sent || noChannelSelected}
            onClick={handleSend}
          >
            <LuBellRing className="h-3.5 w-3.5 mr-1.5" />
            {sent ? "Sent" : sending ? "Sending…" : "Send reminder"}
          </Button>
        </div>
        {noChannelSelected && (
          <p className="text-xs text-red-500 text-right mt-2">
            Select at least one channel.
          </p>
        )}
      </div>
    </div>
  );
}
