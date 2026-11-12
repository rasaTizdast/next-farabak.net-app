export default function DashboardLoading() {
  return (
    <div
      className="flex w-full max-w-6xl flex-col gap-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="motion-safe:animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-9 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-200" />
      </div>
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3 motion-safe:animate-pulse motion-reduce:animate-none">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-4 w-full max-w-md rounded bg-slate-200" />
          <div className="h-4 w-full max-w-sm rounded bg-slate-200" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-slate-200 motion-safe:animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
}
