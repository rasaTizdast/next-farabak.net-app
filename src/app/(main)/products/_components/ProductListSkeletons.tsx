import CategorySliderLoader from "@/app/_components/ui/SkeletonLoader";

export const BreadcrumbSkeleton = () => (
  <div className="from-dark-blue via-fourth to-third mb-5 h-12 w-full animate-pulse rounded-lg bg-linear-to-l p-4 shadow-lg" />
);

export const CategorySliderSkeleton = () => <CategorySliderLoader amount={8} />;

export const ProductGridSkeleton = () => (
  <div
    className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
    role="status"
    aria-label="در حال بارگذاری محصولات"
  >
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="flex w-full animate-pulse flex-col overflow-hidden rounded-2xl border border-(--farabak-ink-deep)/10 bg-white shadow-sm"
      >
        <div className="aspect-square w-full bg-(--farabak-paper) p-4 sm:p-6">
          <div className="size-full rounded-xl bg-slate-200" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="h-5 w-1/3 rounded-full bg-slate-200" />
          <div className="h-5 w-4/5 rounded bg-slate-200" />
          <div className="mt-auto space-y-2 border-t border-slate-200 pt-3">
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-5 w-1/2 rounded bg-slate-200" />
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
