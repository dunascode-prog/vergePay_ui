import { pageClass } from "@/lib/layout";
function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`} />;
}

export default function ExpensesLoading() {
  return (
    <div>
      <div className={pageClass("wide", { stack: false })}>
        <div className="mb-6">
          <Pulse className="h-4 w-32 mb-3" />
          <Pulse className="h-8 w-40" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <Pulse className="h-3 w-20 mb-3" />
                <Pulse className="h-7 w-16 mb-2" />
                <Pulse className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Pulse className="h-16 w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Pulse className="h-96 w-full" />
          <div className="space-y-4">
            <Pulse className="h-56 w-full" />
            <Pulse className="h-56 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
