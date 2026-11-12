export default function AdminLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6" role="status" aria-label="در حال بارگذاری">
      <div className="motion-safe:animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-20 rounded bg-slate-700" />
        <div className="mt-3 h-8 w-48 rounded bg-slate-700" />
        <div className="mt-3 h-4 w-64 rounded bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 motion-safe:animate-pulse motion-reduce:animate-none"
          >
            <div className="h-5 w-3/4 rounded bg-slate-700" />
            <div className="mt-5 h-9 w-1/2 rounded bg-slate-700" />
            <div className="mt-3 h-4 w-full rounded bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
