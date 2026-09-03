export default function DownloadCenterLoading() {
  return (
    <section
      className="flex w-full animate-pulse flex-col items-center gap-8"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-48 rounded-md border-b-3 bg-gray-200" />
        <div className="mx-auto max-w-[560px] space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-4/5 rounded bg-gray-200" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-3 rounded-lg bg-white px-4 py-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gray-200 sm:w-[60%]"
          />
        ))}
        <div className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-gray-300 sm:w-[60%]" />
      </div>
    </section>
  );
}
