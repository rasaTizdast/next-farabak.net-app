export default function InvoicesLoading() {
  return (
    <div
      className="space-y-4 bg-slate-950 p-6 motion-safe:animate-pulse motion-reduce:animate-none"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-96 w-full rounded-xl bg-gray-200" />
    </div>
  );
}
