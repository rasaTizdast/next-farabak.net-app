import {
  LoadingBlock,
  SupportIntroSkeleton,
  SupportLoadingShell,
} from "../../_components/LoadingSkeletons";

export function BlogListingSkeleton({ category = false }: { category?: boolean }) {
  return (
    <SupportLoadingShell
      label={category ? "در حال بارگذاری دسته‌بندی مقالات" : "در حال بارگذاری مقالات"}
    >
      <SupportIntroSkeleton />

      <div className="mb-8">
        {!category ? (
          <div className="mb-4 flex items-center justify-between gap-4">
            <LoadingBlock className="h-7 w-36" />
            <LoadingBlock className="h-5 w-16" />
          </div>
        ) : null}
        <div className="flex gap-2 overflow-hidden pb-2">
          {Array.from({ length: 5 }, (_, index) => (
            <LoadingBlock key={index} className="h-11 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <LoadingBlock className="h-5 w-24" />
        <LoadingBlock className="h-8 w-48 md:h-9" />
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:grid-cols-[1.15fr_0.85fr]">
        <LoadingBlock className="aspect-video rounded-none md:aspect-auto md:min-h-96" />
        <div className="flex flex-col justify-center p-6 md:p-10">
          {!category ? <LoadingBlock className="mb-4 h-5 w-24" /> : null}
          <LoadingBlock className="h-16 w-full md:h-20" />
          <LoadingBlock className="mt-5 h-11 w-full rounded-xl" />
          <LoadingBlock className="mt-8 h-5 w-32" />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-5 space-y-2">
          <LoadingBlock className="h-5 w-28" />
          <LoadingBlock className="h-8 w-44 md:h-9" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
            >
              <LoadingBlock className="aspect-video rounded-none" />
              <div className="space-y-3 p-5">
                <LoadingBlock className="h-8 w-4/5" />
                <LoadingBlock className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SupportLoadingShell>
  );
}
