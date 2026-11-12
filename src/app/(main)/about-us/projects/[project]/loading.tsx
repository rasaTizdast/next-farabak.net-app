import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ProjectDetailLoading() {
  return (
    <PublicShell
      as="main"
      className="pt-6 pb-12 sm:pt-8 sm:pb-14"
      role="status"
      aria-label="در حال بارگذاری پرونده پروژه"
    >
      <div aria-hidden="true">
        <BreadcrumbSkeleton />
        <header className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
          <div className="skeleton-shimmer h-4 w-32 rounded-full" />
          <div className="skeleton-shimmer h-10 w-full max-w-2xl rounded-2xl md:h-14" />
          <div className="flex flex-wrap gap-3">
            <div className="skeleton-shimmer h-11 w-40 rounded-xl" />
            <div className="skeleton-shimmer h-11 w-36 rounded-xl" />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8 lg:p-10">
            <section>
              <div className="skeleton-shimmer h-4 w-32 rounded-full" />
              <div className="skeleton-shimmer mt-4 h-8 w-3/4 rounded-2xl" />
              <div className="mt-7 space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`skeleton-shimmer h-4 rounded-full ${i === 6 ? "w-2/3" : "w-full"}`}
                  />
                ))}
              </div>
            </section>
            <figure className="mt-10 overflow-hidden rounded-3xl bg-slate-950 p-2 sm:p-3">
              <div className="skeleton-shimmer aspect-video rounded-2xl" />
              <div className="skeleton-shimmer mx-auto mt-4 h-4 w-48 rounded-full" />
            </figure>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] lg:sticky lg:top-28">
            <div className="skeleton-shimmer h-6 w-2/3 rounded-xl" />
            <div className="mt-5 divide-y divide-slate-100">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="skeleton-shimmer h-4 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
