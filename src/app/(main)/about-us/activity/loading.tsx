import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ActivityLoading() {
  return (
    <PublicShell
      as="main"
      className="pt-6 pb-12 sm:pt-8 sm:pb-14"
      role="status"
      aria-label="در حال بارگذاری فعالیت‌ها"
    >
      <div aria-hidden="true">
        <BreadcrumbSkeleton />
        <header className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
          <div className="skeleton-shimmer h-4 w-32 rounded-full" />
          <div className="skeleton-shimmer h-10 w-full max-w-2xl rounded-2xl md:h-14" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-full max-w-3xl rounded-full" />
            <div className="skeleton-shimmer h-4 w-4/5 max-w-2xl rounded-full" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="skeleton-shimmer h-11 w-36 rounded-xl" />
            <div className="skeleton-shimmer h-11 w-40 rounded-xl" />
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <section
              key={i}
              className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8"
            >
              <div>
                <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                <div className="skeleton-shimmer mt-3 h-7 w-3/4 rounded-xl" />
              </div>
              <ul className="space-y-4 border-t border-slate-100 pt-5">
                {Array.from({ length: 3 }).map((__, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className="skeleton-shimmer size-2 rounded-full" />
                    <div className="skeleton-shimmer h-4 flex-1 rounded-full" />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-16 border-t border-slate-200 pt-10 sm:mt-20 sm:pt-14">
          <div className="mb-6 max-w-2xl space-y-3 sm:mb-8">
            <div className="skeleton-shimmer h-4 w-28 rounded-full" />
            <div className="skeleton-shimmer h-9 w-80 max-w-full rounded-2xl" />
            <div className="skeleton-shimmer h-4 w-full rounded-full" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start">
            <div className="skeleton-shimmer aspect-16/10 rounded-3xl border border-slate-200 p-2" />
            <div className="skeleton-shimmer mx-auto aspect-3/4 w-full max-w-md rounded-3xl border border-slate-200 p-2 lg:max-w-none" />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
