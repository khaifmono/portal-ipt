export default function CoursesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Course cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 overflow-hidden shadow-sm"
          >
            {/* Gradient header placeholder */}
            <div className="h-40 bg-gray-200 animate-pulse" />

            {/* Card footer */}
            <div className="bg-white px-4 py-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
