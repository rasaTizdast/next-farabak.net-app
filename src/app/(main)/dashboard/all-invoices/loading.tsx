export default function AllInvoicesLoading() {
  return (
    <div
      className="flex w-full max-w-6xl flex-col gap-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="motion-safe:animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-48 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-200" />
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <div className="grid grid-cols-5 gap-4 bg-slate-50 p-4 motion-safe:animate-pulse motion-reduce:animate-none">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-4 rounded bg-slate-200" />
          ))}
        </div>
        <div className="space-y-4 p-4 motion-safe:animate-pulse motion-reduce:animate-none">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-10 rounded bg-slate-100" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 motion-safe:animate-pulse motion-reduce:animate-none md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
