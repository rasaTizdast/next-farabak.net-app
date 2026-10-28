export default function WarrantyTrackingLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1580px] animate-pulse px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="mx-auto mb-8 max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div className="mx-auto mb-2 h-8 w-2/3 rounded-md bg-slate-200" />
        <div className="mx-auto mb-10 h-4 w-4/5 rounded bg-slate-100" />

        <div className="mb-8 flex items-start justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 && <div className="h-0.5 flex-1 bg-slate-200" />}
                <div
                  className={`mx-1 size-9 shrink-0 rounded-full ${i === 0 ? "border-2 border-slate-300" : "bg-slate-200"}`}
                />
                {i < 2 && <div className="h-0.5 flex-1 bg-slate-200" />}
              </div>
              <div className="h-3 w-12 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="mb-4 h-6 w-1/3 rounded-md bg-slate-200" />
        <div className="mb-6 h-4 w-2/3 rounded bg-slate-100" />
        <div className="mb-6 flex gap-3">
          <div className="h-12 w-full rounded-lg bg-slate-100" />
          <div className="h-12 w-24 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
