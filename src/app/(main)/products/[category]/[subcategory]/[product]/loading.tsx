export default function ProductLoading() {
  return (
    <div className="animate-pulse space-y-8 p-4" role="status" aria-label="در حال بارگذاری">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-[500px] w-full rounded-xl bg-gray-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-24 w-full rounded bg-gray-200" />
          <div className="h-12 w-full rounded bg-gray-200" />
          <div className="h-12 w-1/3 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
