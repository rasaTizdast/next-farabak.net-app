export default function MainLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <div className="skeleton-shimmer aspect-1920/900 max-h-[calc(100vh-64px)] w-full" />

      <div className="flex w-full flex-col items-center px-6 py-8 min-[576px]:px-12 min-[992px]:px-20 min-[1200px]:px-24 md:px-16 2xl:px-40">
        <div className="skeleton-shimmer mb-12 h-10 w-44 rounded-md border-b-3" />
        <div className="flex w-full max-w-[1580px] flex-col gap-8">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex w-full flex-row gap-8 max-[768px]:flex-col">
              <div
                className={`skeleton-shimmer flex-1 rounded-lg ${rowIndex % 2 === 1 ? "max-[768px]:flex-[1_1_100%]" : ""}`}
                style={{ height: 220 }}
              />
              <div
                className={`skeleton-shimmer flex-1 rounded-lg ${rowIndex % 2 === 1 ? "max-[768px]:flex-[1_1_100%]" : ""}`}
                style={{ height: 220 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center px-6 py-4 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
        <div className="skeleton-shimmer mb-12 h-10 w-40 rounded-md border-b-3" />
        <div className="grid w-full max-w-[1580px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-52 w-full flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="skeleton-shimmer h-6 w-1/2 rounded" />
              <div className="w-full space-y-2">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-3/4 rounded" />
              </div>
              <div className="skeleton-shimmer h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
