import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type WalletCardProps = {
  href: string;
  name: string;
  balance: string;
  description: string;
  color: "green" | "blue" | "purple";
  active?: boolean;
};

const colors = {
  green: "bg-emerald-500 shadow-[0_0_12px_theme(colors.emerald.500/40%)]",
  blue: "bg-sky-500 shadow-[0_0_12px_theme(colors.sky.500/40%)]",
  purple: "bg-violet-500 shadow-[0_0_12px_theme(colors.violet.500/40%)]",
};

export function WalletCard({
  href,
  name,
  balance,
  description,
  color,
  active,
}: WalletCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border bg-sidebar-accent/40 p-4 transition-all",
        "hover:bg-sidebar-accent hover:border-primary/20",
        active && "border-primary bg-sidebar-accent",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("h-3 w-3 rounded-full", colors[color])} />

          <div>
            <p className="text-sm font-medium">{name}</p>

            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        {active && (
          <Badge variant="secondary" className="text-[10px]">
            Active
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold tracking-tight tabular-nums">
          {balance}
        </h4>
      </div>
    </Link>
  );
}
