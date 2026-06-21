export function SkeletonFeatures() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export function SkeletonOverview() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="h-48 w-full animate-pulse rounded-xl bg-gray-200 lg:w-1/2" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlog() {
  return (
    <div className="mx-auto w-full animate-pulse rounded-xl border border-gray-800 bg-gray-800 p-3 sm:p-5 md:p-7">
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-700" />
        <div className="h-4 w-5/6 rounded bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-700" />
        <div className="h-4 w-2/3 rounded bg-gray-700" />
      </div>
    </div>
  );
}

export function SkeletonSpecs() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-4 p-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonFaq() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="h-12 w-full animate-pulse bg-blue-400" />
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductMainSkeleton() {
  return (
    <div className="animate-pulse space-y-8" role="status" aria-label="در حال بارگذاری محصول">
      <div className="flex flex-col gap-8 max-[950px]:flex-col lg:flex-row">
        <div className="aspect-[1340/780] w-full rounded-[6px] bg-gray-200 shadow-md max-[950px]:w-full lg:w-[60%]" />
        <div className="flex w-full flex-col gap-4 rounded-[8px] bg-[#fafafa] p-4 shadow-[0_4px_10px_rgba(0,0,0,0.2)] lg:max-w-[385px]">
          <div className="h-5 w-1/3 rounded bg-gray-200" />
          <div className="h-7 w-3/4 rounded bg-gray-200" />
          <div className="h-5 w-1/2 rounded bg-gray-200" />
          <div className="mt-2 space-y-3">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-4/5 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="mt-auto space-y-3">
            <div className="h-6 w-1/3 rounded-lg bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
            <div className="h-12 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}