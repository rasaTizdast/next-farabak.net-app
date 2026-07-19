export default function InvoicesLoading() {
  return (
    <div className="animate-pulse space-y-4 p-6" role="status" aria-label="در حال بارگذاری">
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-96 w-full rounded-xl bg-gray-200" />
    </div>
  );
}
