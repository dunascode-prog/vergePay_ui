function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`} />;
}

export default function RecurringBillingLoading() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Pulse className="h-4 w-24 mb-3" />
          <Pulse className="h-8 w-56" />
        </div>
        <Pulse className="h-9 w-32" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <Pulse className="h-3 w-20 mb-3" />
              <Pulse className="h-7 w-16 mb-2" />
              <Pulse className="h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Pulse className="h-8 w-64 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
