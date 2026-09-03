import { BreadcrumbSkeleton, ImageSkeleton } from "@/app/_components/ui/PageSkeletons";

export default function BlogCategoryLoading() {
  return (
    <div className="w-full max-w-[1580px] animate-pulse" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />

      <div className="mb-10">
        <div className="mb-5 h-9 w-64 rounded-md bg-gray-200" />
        <ImageSkeleton className="relative block h-96 w-full overflow-hidden rounded-lg bg-gray-200" />
      </div>

      <div className="mb-5 h-9 w-48 rounded-md bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <div className="h-48 w-full rounded-t-lg bg-gray-200" />
            <div className="p-4">
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
