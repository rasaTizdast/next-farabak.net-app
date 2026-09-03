export default function MainLoading() {
  return (
    <div className="animate-pulse" role="status" aria-label="در حال بارگذاری">
      <div className="aspect-1920/900 max-h-[calc(100vh-64px)] w-full bg-gray-200" />

      <div className="flex w-full flex-col items-center px-6 py-8 min-[576px]:px-12 min-[992px]:px-20 min-[1200px]:px-24 md:px-16 2xl:px-40">
        <div className="mb-12 h-10 w-44 rounded-md border-b-3 bg-gray-200" />
        <div className="flex w-full max-w-[1580px] flex-col gap-8">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex w-full flex-row gap-8 max-[768px]:flex-col">
              <div
                className={`flex-1 rounded-lg bg-gray-200 ${rowIndex % 2 === 1 ? "max-[768px]:flex-[1_1_100%]" : ""}`}
                style={{ height: 220 }}
              />
              <div
                className={`flex-1 rounded-lg bg-gray-200 ${rowIndex % 2 === 1 ? "max-[768px]:flex-[1_1_100%]" : ""}`}
                style={{ height: 220 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center px-6 py-4 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
        <div className="mb-12 h-10 w-40 rounded-md border-b-3 bg-gray-200" />
        <div className="grid w-full max-w-[1580px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-52 w-full flex-col items-center justify-between gap-4 rounded-lg bg-gray-100 p-4"
            >
              <div className="h-6 w-1/2 rounded bg-gray-200" />
              <div className="w-full space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
              <div className="h-9 w-full rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
