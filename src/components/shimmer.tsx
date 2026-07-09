export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`} />
  );
}

export function PageShimmer() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-28 w-full" />
        ))}
      </div>
      <Shimmer className="h-64 w-full" />
    </div>
  );
}
