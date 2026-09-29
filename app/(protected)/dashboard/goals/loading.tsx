function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`}
    />
  );
}

export default function GoalsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <div className="mb-6">
          <Pulse className="h-4 w-40 mb-3" />
          <Pulse className="h-8 w-24" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <Pulse className="h-3 w-20 mb-3" />
                <Pulse className="h-7 w-16 mb-2" />
                <Pulse className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Pulse className="h-16 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <Pulse className="h-9 w-9 rounded-full mb-3" />
              <Pulse className="h-4 w-32 mb-2" />
              <Pulse className="h-2 w-full mb-3" />
              <Pulse className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
