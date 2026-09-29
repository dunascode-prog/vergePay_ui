import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientProfile } from "@/types/client";
import { ClientAvatar } from "./ClientAvatar";
import { formatMoney } from "@/lib/format";
import { LuArrowRight } from "react-icons/lu";

interface TopClientsCardProps {
  clients: ClientProfile[];
}

export function TopClientsCard({ clients }: TopClientsCardProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700">Top clients</CardTitle>
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="h-7 text-gray-500">
            View all
            <LuArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center gap-3">
            <ClientAvatar name={client.name} initials={client.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{client.name}</p>
              <p className="text-xs text-gray-400 truncate">{client.industry}</p>
            </div>
            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
              {formatMoney(client.totalRevenue, client.currency)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
