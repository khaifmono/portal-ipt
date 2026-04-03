export default function CourseDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <span className="text-gray-300">/</span>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Course header card skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gray-200 animate-pulse px-6 py-8 space-y-3">
          <div className="h-7 w-64 bg-gray-300 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-100 bg-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300 mr-2">|</span>}
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Weeks skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="h-5 w-44 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-gray-100 px-4 py-3.5"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
