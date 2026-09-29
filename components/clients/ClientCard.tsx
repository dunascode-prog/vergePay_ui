import { ClientProfile } from "@/types/client";
import { ClientAvatar } from "./ClientAvatar";
import { formatMoney, formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LuMail, LuPhone, LuMapPin, LuSparkles, LuRepeat } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: ClientProfile;
  onClick: () => void;
}

function healthTone(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const isAtRisk = client.healthScore < 55;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="border-gray-200 shadow-none cursor-pointer transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <ClientAvatar name={client.name} initials={client.initials} size="md" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{client.name}</p>
              <p className="text-xs text-gray-400 truncate">{client.industry}</p>
            </div>
          </div>
          <span className={cn("text-sm font-semibold shrink-0", healthTone(client.healthScore))}>
            {client.healthScore}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {client.isVip && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
              VIP
            </Badge>
          )}
          {client.isNew && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              New
            </Badge>
          )}
          {client.recurringPlanStatus === "active" && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              <LuRepeat className="h-3 w-3 mr-1" />
              Recurring
            </Badge>
          )}
          {isAtRisk && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              At risk
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <p className="flex items-center gap-1.5 truncate">
            <LuMapPin className="h-3 w-3 shrink-0" />
            {client.location}
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <LuMail className="h-3 w-3 shrink-0" />
            {client.email}
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <LuPhone className="h-3 w-3 shrink-0" />
            {client.phone}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm mb-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-gray-400 text-xs">Lifetime revenue</p>
            <p className="font-medium text-gray-900">
              {formatMoney(client.totalRevenue, client.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Last activity</p>
            <p className="font-medium text-gray-900">{formatShortDate(client.lastActivityDate)}</p>
          </div>
        </div>

        <div className="flex gap-2 rounded-md bg-gray-50 px-2.5 py-2">
          <LuSparkles className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600 leading-relaxed">{client.aiNote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
