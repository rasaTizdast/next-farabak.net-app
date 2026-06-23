export default function MainLoading() {
  return (
    <div className="animate-pulse space-y-8 p-4" role="status" aria-label="در حال بارگذاری">
      <div className="h-[400px] w-full rounded-xl bg-gray-200" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 w-64 flex-shrink-0 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg bg-gray-100 p-4">
            <div className="h-48 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
