export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4" role="status" aria-label="در حال بارگذاری">
      <div className="flex gap-4">
        <div className="h-screen w-64 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-gray-100 p-4">
                <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
                <div className="h-8 w-12 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="h-96 w-full rounded-xl bg-gray-100 p-4">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/6 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
