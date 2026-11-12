import { PublicShell } from "@/components/public/PublicShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductFinderBoardLoading() {
  return (
    <PublicShell className="py-12" role="status" aria-label="در حال بارگذاری میز تصمیم">
      <div aria-hidden="true" className="rounded-3xl bg-white p-7 shadow-sm sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">میز تصمیم</p>
            <Skeleton className="h-9 w-44" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="mt-8 overflow-hidden">
          {Array.from({ length: 3 }, (_, row) => (
            <div
              key={row}
              className="grid min-w-[640px] grid-cols-4 gap-6 border-b border-slate-200 p-3"
            >
              {Array.from({ length: 4 }, (_, cell) => (
                <Skeleton key={cell} className="h-5 w-3/4" />
              ))}
            </div>
          ))}
        </div>
        <Skeleton className="mt-7 h-11 w-40 rounded-xl" />
      </div>
    </PublicShell>
  );
}
