export default function NewInvoiceLoading() {
  return (
    <div
      className="flex w-full max-w-6xl flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="motion-safe:animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-52 rounded bg-slate-200" />
        <div className="mt-5 h-14 w-full rounded-xl bg-slate-100" />
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 motion-safe:animate-pulse motion-reduce:animate-none md:block">
        <div className="h-12 bg-slate-100" />
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-4 border-t border-slate-100 p-4">
            {Array.from({ length: 7 }).map((__, cellIndex) => (
              <div key={cellIndex} className="h-10 rounded bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-3 motion-safe:animate-pulse motion-reduce:animate-none md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-slate-200 motion-safe:animate-pulse motion-reduce:animate-none" />
    </div>
  );
}
