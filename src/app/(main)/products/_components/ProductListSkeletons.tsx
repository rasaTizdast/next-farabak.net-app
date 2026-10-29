import CategorySliderLoader from "@/app/_components/ui/SkeletonLoader";
import { Skeleton } from "@/components/ui/skeleton";

export const BreadcrumbSkeleton = () => (
  <div className="mb-5 flex h-12 w-full items-center rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <Skeleton className="h-3 w-40" />
  </div>
);

export const CategorySliderSkeleton = () => <CategorySliderLoader amount={8} />;

export const ProductGridSkeleton = () => (
  <div
    className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
    role="status"
    aria-label="در حال بارگذاری محصولات"
  >
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-(--farabak-ink-deep)/10 bg-white shadow-sm"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-(--farabak-paper) p-4 sm:p-6">
          <Skeleton className="size-full rounded-xl" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <Skeleton className="h-5 w-1/3 rounded-full" />
          <Skeleton className="h-5 w-4/5" />
          <div className="mt-auto space-y-2 border-t border-slate-200 pt-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const CategoryPageSkeleton = () => (
  <div className="animate-pulse space-y-6" role="status" aria-label="در حال بارگذاری">
    <CategorySliderSkeleton />
    <ProductGridSkeleton />
  </div>
);
