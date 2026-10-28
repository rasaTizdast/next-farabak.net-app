export default function DownloadCenterLoading() {
  return (
    <section
      className="mx-auto flex w-full max-w-[1580px] animate-pulse flex-col gap-8 px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <header className="flex flex-col gap-5 py-10 md:gap-6 md:py-16">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="h-12 w-64 rounded bg-slate-200 md:h-16 md:w-80" />
        <div className="max-w-[560px] space-y-2">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mx-5 flex h-20 items-center justify-center gap-2 border-b border-slate-100 bg-slate-100 sm:mx-6"
          />
        ))}
        <div className="mx-5 h-20 bg-slate-200 sm:mx-6" />
      </div>
    </section>
  );
}
