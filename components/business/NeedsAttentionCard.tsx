import Link from "next/link";
import { ChevronRight, CircleCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttentionItem } from "@/types/business";
import { cn } from "@/lib/utils";

/** Each item links straight to where it can be fixed. */
export function NeedsAttentionCard({ items }: { items: AttentionItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Needs attention</CardTitle>
        <CardDescription>{items.length ? `${items.length} thing${items.length === 1 ? "" : "s"} to look at` : "Overdue invoices, plans and late payers"}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CircleCheck className="size-4" aria-hidden /> Nothing urgent right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <TriangleAlert
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      item.severity === "high" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="mt-0.5 hidden items-center gap-0.5 text-xs font-medium whitespace-nowrap text-emerald-700 sm:flex dark:text-emerald-400">
                    {item.linkLabel} <ChevronRight className="size-3.5" aria-hidden />
                  </span>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground sm:hidden" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
