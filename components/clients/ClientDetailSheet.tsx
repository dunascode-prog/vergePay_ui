import Link from "next/link";
import { ClientProfile } from "@/types/client";
import { ClientAvatar } from "./ClientAvatar";
import { formatMoney, formatShortDate } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuSparkles,
  LuRepeat,
  LuFileText,
  LuCalendar,
} from "react-icons/lu";

interface ClientDetailSheetProps {
  client: ClientProfile | null;
  onOpenChange: (open: boolean) => void;
}

function healthTone(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

const RECURRING_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

export function ClientDetailSheet({
  client,
  onOpenChange,
}: ClientDetailSheetProps) {
  return (
    <Sheet open={client !== null} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {client && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <ClientAvatar
                  name={client.name}
                  initials={client.initials}
                  size="lg"
                />
                <div>
                  <SheetTitle className="flex flex-row gap-1">
                    {client.name}
                    <div className="flex flex-wrap gap-1.5">
                      {client.isVip && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          VIP
                        </Badge>
                      )}
                      {client.isNew && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          New
                        </Badge>
                      )}
                      {client.healthScore < 55 && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          At risk
                        </Badge>
                      )}
                    </div>
                  </SheetTitle>
                  <SheetDescription>{client.industry}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="px-3 mb-2 space-y-6">
              <div className="flex gap-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 px-3 py-2.5">
                <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-emerald-900 leading-relaxed">
                  {client.aiNote}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                  Contact
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>{client.contactName}</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 hover:text-emerald-700"
                  >
                    <LuMail className="h-3.5 w-3.5 text-gray-400" />
                    {client.email}
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-2 hover:text-emerald-700"
                  >
                    <LuPhone className="h-3.5 w-3.5 text-gray-400" />
                    {client.phone}
                  </a>
                  <p className="flex items-center gap-2">
                    <LuMapPin className="h-3.5 w-3.5 text-gray-400" />
                    {client.location}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                  Payment behavior
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Health score</p>
                    <p
                      className={`font-semibold ${healthTone(client.healthScore)}`}
                    >
                      {client.healthScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">On-time rate</p>
                    <p className="font-medium text-gray-900">
                      {client.onTimeRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Avg. collection</p>
                    <p className="font-medium text-gray-900">
                      {client.avgCollectionDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Lifetime revenue</p>
                    <p className="font-medium text-gray-900">
                      {formatMoney(client.totalRevenue, client.currency)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                  Activity
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <LuCalendar className="h-3.5 w-3.5 text-gray-400" />
                    Client since {formatShortDate(client.clientSince)}
                  </p>
                  <p className="flex items-center gap-2">
                    <LuFileText className="h-3.5 w-3.5 text-gray-400" />
                    {client.activeInvoicesCount} active,{" "}
                    {client.overdueInvoicesCount} overdue invoice
                    {client.overdueInvoicesCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {client.recurringPlanId && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                      Recurring billing
                    </p>
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <LuRepeat className="h-3.5 w-3.5 text-gray-400" />
                        {
                          RECURRING_STATUS_LABEL[
                            client.recurringPlanStatus ?? ""
                          ]
                        }
                      </div>
                      <Link
                        href={`/dashboard/recurring/${client.recurringPlanId}`}
                      >
                        <Button variant="outline" size="sm" className="h-7">
                          View plan
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                  Notes
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {client.notes || "No notes yet."}
                </p>
              </div>

              <Link href="/dashboard/invoices">
                <Button variant="outline" className="w-full">
                  <LuFileText className="h-4 w-4 mr-1.5" />
                  View invoices
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
