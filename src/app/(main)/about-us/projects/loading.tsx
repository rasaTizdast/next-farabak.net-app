import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ProjectsLoading() {
  return (
    <PublicShell
      as="main"
      className="pt-6 pb-12 sm:pt-8 sm:pb-14"
      role="status"
      aria-label="در حال بارگذاری پروژه‌ها"
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
          <div className="skeleton-shimmer h-11 w-48 rounded-xl" />
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <article
              key={i}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]"
            >
              <div className="skeleton-shimmer aspect-10/7 w-full" />
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex gap-4">
                  <div className="skeleton-shimmer h-4 w-24 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                </div>
                <div className="skeleton-shimmer mt-5 h-7 w-3/4 rounded-xl" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div
                      key={j}
                      className={`skeleton-shimmer h-4 rounded-full ${j === 2 ? "w-4/5" : "w-full"}`}
                    />
                  ))}
                </div>
                <div className="skeleton-shimmer mt-6 h-11 w-full rounded-xl" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
