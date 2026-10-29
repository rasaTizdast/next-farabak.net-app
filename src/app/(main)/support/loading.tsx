import { ButtonSkeleton, CardSkeleton, LineSkeleton } from "@/app/_components/ui/PageSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SupportLoading() {
  return (
    <section
      className="mx-auto w-full max-w-[1580px] px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="relative isolate overflow-hidden rounded-3xl bg-(--farabak-ink-deep) px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div className="space-y-5">
            <Skeleton className="h-4 w-36 bg-slate-700" />
            <Skeleton className="h-12 w-full max-w-2xl bg-slate-700 sm:h-16" />
            <Skeleton className="h-4 w-full max-w-2xl bg-slate-700" />
            <Skeleton className="h-4 w-4/5 max-w-2xl bg-slate-700" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-36 rounded-xl bg-slate-700" />
              <Skeleton className="h-11 w-32 rounded-xl bg-slate-700" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <Skeleton className="h-4 w-28 bg-slate-700" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-11 w-full rounded-xl bg-slate-700" />
              <Skeleton className="h-11 w-full rounded-xl bg-slate-700" />
              <Skeleton className="h-11 w-full rounded-xl bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton
            key={i}
            className="min-h-56 rounded-2xl border border-slate-200 shadow-none"
          >
            <div className="size-12 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-7 w-1/2 animate-pulse rounded bg-slate-200" />
            <LineSkeleton className="w-full" />
            <ButtonSkeleton />
          </CardSkeleton>
        ))}
      </div>
    </section>
  );
}
