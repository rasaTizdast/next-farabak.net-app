export default function CategoryLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4" role="status" aria-label="در حال بارگذاری">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg bg-gray-100 p-4">
            <div className="h-48 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-8 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
