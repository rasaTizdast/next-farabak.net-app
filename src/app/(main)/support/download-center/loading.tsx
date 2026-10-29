import { Skeleton } from "@/components/ui/skeleton";

export default function DownloadCenterLoading() {
  return (
    <section
      className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <header className="flex flex-col gap-5 py-10 md:gap-6 md:py-16">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-12 w-full max-w-3xl md:h-16" />
        <div className="max-w-3xl space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </header>

      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div
          key={groupIndex}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-3 border-b border-slate-100 p-5 md:p-8">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            {Array.from({ length: 2 }).map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="min-h-36 rounded-xl border border-slate-200 bg-(--farabak-paper) p-4"
              >
                <div className="flex gap-3">
                  <Skeleton className="size-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="mt-5 h-10 w-40 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
