export default function FaqLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1580px] animate-pulse px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <header className="flex flex-col gap-5 py-10 md:gap-6 md:py-16">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="h-12 w-64 rounded bg-slate-200 md:h-16 md:w-80" />
        <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="mb-6 h-8 w-48 rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <div className="size-5 rounded-full bg-slate-200" />
              <div className="h-5 w-3/4 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl bg-slate-100 p-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="h-7 w-64 rounded bg-slate-200" />
        </div>
        <div className="h-11 w-32 rounded bg-slate-200" />
      </div>
    </div>
  );
}
