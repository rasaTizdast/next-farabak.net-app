import { Skeleton } from "@/components/ui/skeleton";

export const BreadcrumbSkeleton = () => (
  <div
    aria-hidden="true"
    className="mb-5 flex h-13 w-full items-center gap-4 rounded-lg bg-(--farabak-ink-deep) p-4"
  >
    <Skeleton className="h-3 w-10" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const CategorySliderSkeleton = ({ subcategories = false }: { subcategories?: boolean }) => (
  <section aria-hidden="true" className="pb-8 md:pb-10">
    <div className="mb-3">
      <p className="text-xs font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
        انتخاب سریع
      </p>
      <p className="mt-1 text-lg font-bold text-(--farabak-ink-deep)">
        {subcategories ? "مرور زیر دسته‌بندی‌ها" : "مرور دسته‌بندی‌ها"}
      </p>
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <Skeleton className="hidden size-10 shrink-0 rounded-full md:block" />
      <div className="flex min-w-0 flex-1 gap-3 overflow-hidden md:gap-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-36 shrink-0 rounded-xl md:w-44" />
        ))}
      </div>
      <Skeleton className="hidden size-10 shrink-0 rounded-full md:block" />
    </div>
  </section>
);

export const ProductGridSkeleton = ({
  showSearch = true,
  announce = true,
}: {
  showSearch?: boolean;
  announce?: boolean;
}) => (
  <div
    role={announce ? "status" : undefined}
    aria-label={announce ? "در حال بارگذاری محصولات" : undefined}
  >
    <div
      aria-hidden="true"
      className="mb-6 flex flex-col gap-4 rounded-2xl border border-(--farabak-ink-deep)/10 bg-(--farabak-paper) p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-h-5 flex-wrap items-center gap-x-4 gap-y-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      {showSearch ? <Skeleton className="h-11 w-full sm:w-32" /> : null}
    </div>
    <div
      aria-hidden="true"
      className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
    >
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-(--farabak-ink-deep)/10 bg-white shadow-sm"
        >
          <div className="aspect-square w-full bg-(--farabak-paper) p-4 sm:p-6">
            <Skeleton className="size-full rounded-xl" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-6 w-1/3 rounded-full" />
              <Skeleton className="h-3 w-1/4 self-center" />
            </div>
            <Skeleton className="h-8 w-4/5" />
            <div className="mt-auto border-t border-(--farabak-ink-deep)/10 pt-3">
              <Skeleton className="h-7 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProductListingSkeleton = ({
  showSearch = true,
  announce = true,
  title,
}: {
  showSearch?: boolean;
  announce?: boolean;
  title?: string;
}) => (
  <div className="w-full">
    <header aria-hidden="true" className="flex flex-col gap-5 py-8 md:gap-6 md:py-12">
      <p className="text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
        کاتالوگ تجهیزات فرابک
      </p>
      <div className="flex flex-col gap-4 md:max-w-3xl">
        <div className="text-3xl leading-tight font-bold tracking-tight text-(--farabak-ink-deep) md:text-5xl">
          {title ?? <span className="skeleton-shimmer block h-[1.25em] w-3/5 rounded-md" />}
        </div>
        <p className="text-base leading-8 text-(--farabak-ink-muted)">
          <span className="flex min-h-8 flex-col justify-center gap-3">
            <span className="skeleton-shimmer block h-4 w-full max-w-2xl rounded-md" />
            <span className="skeleton-shimmer block h-4 w-3/4 rounded-md md:hidden" />
          </span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showSearch ? <Skeleton className="h-11 w-26" /> : null}
        <Skeleton className="h-11 w-30" />
      </div>
    </header>
    <ProductGridSkeleton showSearch={showSearch} announce={announce} />
  </div>
);

export const CategoryPageSkeleton = () => (
  <>
    <CategorySliderSkeleton subcategories />
    <ProductListingSkeleton showSearch={false} />
  </>
);

export const ProductsPageSkeleton = () => (
  <div dir="rtl" role="status" aria-label="در حال بارگذاری محصولات">
    <BreadcrumbSkeleton />
    <CategorySliderSkeleton />
    <ProductListingSkeleton title="تمامی محصولات" announce={false} />
  </div>
);
