import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttentionItem } from "@/types/business";
import { LuTriangleAlert, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface NeedsAttentionCardProps {
  items: AttentionItem[];
}

export function NeedsAttentionCard({ items }: NeedsAttentionCardProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Needs attention</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700 py-2">
            <LuCircleCheck className="h-4 w-4" />
            Nothing urgent right now.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start gap-2.5 rounded-md border border-gray-100 hover:border-gray-200 hover:bg-gray-50 px-3 py-2.5 transition-colors"
              >
                <LuTriangleAlert
                  className={cn(
                    "h-4 w-4 mt-0.5 shrink-0",
                    item.severity === "high" ? "text-red-500" : "text-amber-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
                <span className="text-xs text-emerald-700 whitespace-nowrap mt-0.5">
                  {item.linkLabel} →
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
