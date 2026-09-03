export default function DashboardLoading() {
  return (
    <div className="animate-pulse" role="status" aria-label="در حال بارگذاری">
      <div className="h-6 w-64 rounded bg-gray-200" />
      <div className="mt-8 flex w-full flex-wrap justify-start gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex w-[30%] max-w-[400px] min-w-[350px] flex-col items-center rounded-lg bg-white px-4 py-6 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:min-w-[250px] lg:w-full lg:max-w-[450px]"
          >
            <div className="mb-4 h-6 w-1/2 rounded bg-gray-200" />
            <div className="mb-4 w-full space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="mt-auto h-10 w-1/2 rounded-[6px] bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
