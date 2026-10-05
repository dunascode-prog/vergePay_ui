import { Mail, MapPin, Phone, Repeat } from "lucide-react";
import { formatDay } from "@/lib/invoicing";
import { HEALTH_LABEL, HEALTH_TONE, amounts, hasActivePlan, initials, isNewClient, lastActivity } from "@/lib/clients";
import { cn } from "@/lib/utils";
import { ApiClient } from "@/types/invoicing";
import { ClientAvatar } from "./ClientAvatar";

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", className)}>{children}</span>;
}

/** One client in the grid: who they are, how they pay, and why. */
export function ClientCard({ client, onClick }: { client: ApiClient; onClick: () => void }) {
  const { health } = client;
  const subtitle = [client.industry, client.location].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col rounded-xl border bg-card p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 focus-visible:ring-3 focus-visible:ring-emerald-600/20 focus-visible:outline-none dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20",
        client.archived_at && "opacity-70",
      )}
    >
      <div className="mb-3 flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ClientAvatar name={client.name} initials={initials(client.name)} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium">{client.name}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle || client.contact_name || `Client since ${formatDay(client.created_at, false)}`}</p>
          </div>
        </div>
        {health.score !== null && (
          <span
            className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", HEALTH_TONE[health.label])}
            title={`Health score: ${HEALTH_LABEL[health.label]}`}
          >
            {health.score}
          </span>
        )}
      </div>

      <div className="mb-3 flex min-h-5 flex-wrap gap-1.5">
        {client.archived_at && <Tag className="bg-muted text-muted-foreground">Archived</Tag>}
        {client.is_vip && <Tag className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">VIP</Tag>}
        {isNewClient(client) && <Tag className="bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200">New</Tag>}
        {hasActivePlan(client) && (
          <Tag className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <Repeat className="size-3" /> Recurring
          </Tag>
        )}
        {client.overdue_count > 0 && <Tag className="bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200">{client.overdue_count} overdue</Tag>}
      </div>

      <div className="mb-3 space-y-1 text-xs text-muted-foreground">
        {client.email && (
          <p className="flex items-center gap-1.5 truncate">
            <Mail className="size-3 shrink-0" /> {client.email}
          </p>
        )}
        {client.phone && (
          <p className="flex items-center gap-1.5 truncate">
            <Phone className="size-3 shrink-0" /> {client.phone}
          </p>
        )}
        {!client.email && !client.phone && client.location && (
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3 shrink-0" /> {client.location}
          </p>
        )}
      </div>

      <div className="mt-auto flex w-full items-end justify-between gap-3 border-t pt-3 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Paid to you</p>
          <p className="truncate font-medium tabular-nums">{amounts(client.revenue)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Last activity</p>
          <p className="font-medium">{formatDay(lastActivity(client), false)}</p>
        </div>
      </div>
      <p className="mt-3 w-full truncate rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground" title={health.reasons.join(" · ")}>
        {health.reasons[0]}
      </p>
    </button>
  );
}
