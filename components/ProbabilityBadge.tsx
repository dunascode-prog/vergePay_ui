import { cn } from "@/lib/utils";
import { LuSparkles } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProbabilityBadge({ probability }: { probability: number }) {
  const tone =
    probability >= 70
      ? "text-emerald-700 bg-emerald-50"
      : probability >= 45
      ? "text-amber-700 bg-amber-50"
      : "text-red-700 bg-red-50";

  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium cursor-default",
                tone
              )}
            />
          }
        >
          <LuSparkles className="h-3 w-3" />
          {probability}%
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-56">
          AI-predicted probability of on-time payment, based on this client's history.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
