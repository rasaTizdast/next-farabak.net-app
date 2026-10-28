import { ButtonSkeleton, CardSkeleton, LineSkeleton } from "@/app/_components/ui/PageSkeletons";

export default function SupportLoading() {
  return (
    <section
      className="mx-auto w-full max-w-[1580px] px-6 pb-16 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex flex-col gap-5 py-10 md:gap-6 md:py-16">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-full max-w-2xl animate-pulse rounded bg-slate-200 md:h-16" />
        <LineSkeleton className="max-w-2xl" />
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
