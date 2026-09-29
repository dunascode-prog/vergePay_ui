import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function healthTier(score: number): { color: string; label: string } {
  if (score >= 80) return { color: "bg-emerald-500", label: "Healthy" };
  if (score >= 55) return { color: "bg-amber-500", label: "Watch" };
  return { color: "bg-red-500", label: "At risk" };
}

export function HealthDot({
  score,
  avgCollectionDays,
}: {
  score: number;
  avgCollectionDays: number;
}) {
  const tier = healthTier(score);
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex items-center gap-1.5 text-xs text-gray-500 cursor-default" />}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tier.color)} />
          {score}/100
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{tier.label} client</p>
          <p className="text-gray-400">Avg. collection: {avgCollectionDays} days</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
