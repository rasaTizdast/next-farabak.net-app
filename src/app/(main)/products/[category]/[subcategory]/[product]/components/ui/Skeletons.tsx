import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonFeatures() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonOverview() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <Skeleton className="h-48 w-full rounded-xl lg:w-1/2" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlog() {
  return (
    <div className="mx-auto w-full rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-5 md:p-7">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full bg-slate-700" />
        <Skeleton className="h-4 w-5/6 bg-slate-700" />
        <Skeleton className="h-4 w-3/4 bg-slate-700" />
        <Skeleton className="h-4 w-full bg-slate-700" />
        <Skeleton className="h-4 w-2/3 bg-slate-700" />
      </div>
    </div>
  );
}

export function SkeletonSpecs() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-40" />
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex gap-4 p-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonFaq() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
      <Skeleton className="h-12 w-full rounded-none bg-blue-100" />
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3">
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductMainSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="در حال بارگذاری محصول">
      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="flex h-full min-h-52 flex-col rounded-2xl border border-(--farabak-ink-deep)/10 bg-(--farabak-paper) p-4 sm:min-h-80 sm:p-6 lg:min-h-96">
          <Skeleton className="flex-1 rounded-xl" />
        </div>
        <div className="flex h-full flex-col rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-5 shadow-[0_18px_45px_rgba(6,26,48,0.08)] sm:p-7">
          <div className="mb-2 max-w-full">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-8 h-7 w-3/4" />
          </div>

          <div className="mt-2 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-auto space-y-3">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
