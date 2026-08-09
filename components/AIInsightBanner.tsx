import { LuSparkles } from "react-icons/lu";

interface AIInsightBannerProps {
  message: string;
}

export function AIInsightBanner({ message }: AIInsightBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
      <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-0.5">
          AI invoice insight
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
