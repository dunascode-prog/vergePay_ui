import { LuMap } from "react-icons/lu";

export function RoadmapNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-gray-300 bg-white/60 px-4 py-3">
      <LuMap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-600">On the roadmap</p>
        <p className="text-sm text-gray-400 mt-0.5">
          A client-facing portal where clients create their own account, view invoices, and reach
          out to freelancers directly — planned as a separate page, not part of this one.
        </p>
      </div>
    </div>
  );
}
