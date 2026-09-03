export default function FaqLoading() {
  return (
    <div className="w-full max-w-[1580px] animate-pulse" role="status" aria-label="در حال بارگذاری">
      <section className="relative mx-auto w-full overflow-hidden rounded-lg bg-gray-200 py-6 shadow-lg md:rounded-xl md:py-10 lg:py-14">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
          <div className="mb-3 size-10 rounded-full bg-gray-300 md:mb-4 md:size-12" />
          <div className="mb-2 h-7 w-40 rounded-md bg-gray-300 md:mb-3 md:h-9 md:w-48" />
          <div className="mx-auto h-4 w-full max-w-xl rounded bg-gray-300" />
        </div>
      </section>

      <div className="my-6 rounded-lg border border-gray-200 bg-white p-3 shadow-md md:my-8 md:p-5">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
              <div className="size-5 rounded-full bg-gray-200" />
              <div className="h-5 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="relative mx-auto w-full max-w-2xl rounded-lg border border-gray-200 bg-gray-100 p-6 shadow-md">
          <div className="mx-auto mb-3 size-10 rounded-full bg-gray-200" />
          <div className="mx-auto mb-3 h-5 w-1/2 rounded bg-gray-200" />
          <div className="mx-auto mb-4 h-4 w-2/3 rounded bg-gray-200" />
          <div className="mx-auto h-10 w-32 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
