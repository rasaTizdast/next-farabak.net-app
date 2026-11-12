export default function ChangePasswordLoading() {
  return (
    <div
      className="flex w-full max-w-2xl flex-col gap-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="motion-safe:animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-52 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-200" />
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 motion-safe:animate-pulse motion-reduce:animate-none sm:p-7">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
        <div className="h-11 w-36 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
