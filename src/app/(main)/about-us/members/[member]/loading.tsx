import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function MemberDetailLoading() {
  return (
    <PublicShell
      as="main"
      className="pt-6 pb-12 sm:pt-8 sm:pb-14"
      role="status"
      aria-label="در حال بارگذاری معرفی عضو"
    >
      <div aria-hidden="true">
        <BreadcrumbSkeleton />
        <header className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
          <div className="skeleton-shimmer h-4 w-40 rounded-full" />
          <div className="skeleton-shimmer h-10 w-full max-w-xl rounded-2xl md:h-14" />
          <div className="skeleton-shimmer h-5 w-2/3 max-w-lg rounded-full" />
          <div className="skeleton-shimmer h-11 w-44 rounded-xl" />
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-10">
            <div className="skeleton-shimmer h-4 w-32 rounded-full" />
            <div className="skeleton-shimmer h-8 w-3/4 rounded-2xl" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`skeleton-shimmer h-4 rounded-full ${i === 5 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
          </section>

          <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-7 lg:sticky lg:top-28">
            <div className="skeleton-shimmer aspect-5/4 w-full rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="skeleton-shimmer h-12 rounded-2xl" />
              <div className="skeleton-shimmer h-12 rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
