export default function PrivacyLoading() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse px-4 py-10 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="mb-6 h-9 w-40 rounded-md bg-gray-200" />
      <div className="flex flex-col gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <section key={i}>
            <div className="mb-2 h-6 w-1/2 rounded bg-gray-200" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className={`h-4 rounded bg-gray-200 ${j === 3 ? "w-4/5" : "w-full"}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
