import CategorySliderLoader from "@/app/_components/ui/SkeletonLoader";

export const BreadcrumbSkeleton = () => (
  <div className="mb-5 h-12 w-full animate-pulse rounded-lg bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] p-4 shadow-lg" />
);

export const CategorySliderSkeleton = () => <CategorySliderLoader amount={8} />;

export const ProductGridSkeleton = () => (
  <div
    className="grid w-full grid-cols-1 items-stretch justify-items-center gap-4 min-[485px]:grid-cols-2 min-[485px]:gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
    role="status"
    aria-label="در حال بارگذاری محصولات"
  >
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="flex w-full min-w-[130px] animate-pulse flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
      >
        <div className="mb-3 aspect-square w-full rounded-md bg-gray-200 sm:mb-4" />
        <div className="flex w-full flex-1 flex-col items-start gap-2">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="mt-auto w-full space-y-2">
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-5 w-2/3 rounded bg-gray-200" />
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