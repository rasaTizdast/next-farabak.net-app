import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ContactUsLoading() {
  return (
    <PublicShell
      as="main"
      className="pt-6 pb-12 sm:pt-8 sm:pb-14"
      role="status"
      aria-label="در حال بارگذاری تماس با فرابک"
    >
      <div aria-hidden="true">
        <BreadcrumbSkeleton />
        <header className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
          <div className="skeleton-shimmer h-4 w-36 rounded-full" />
          <div className="skeleton-shimmer h-10 w-full max-w-3xl rounded-2xl md:h-14" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-full max-w-3xl rounded-full" />
            <div className="skeleton-shimmer h-4 w-4/5 max-w-2xl rounded-full" />
          </div>
          <div className="skeleton-shimmer h-11 w-48 rounded-xl" />
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)] lg:items-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8">
            <div className="skeleton-shimmer h-4 w-32 rounded-full" />
            <div className="skeleton-shimmer mt-3 h-7 w-2/3 rounded-xl" />
            <div className="mt-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                  <div className="skeleton-shimmer h-5 w-full rounded-full" />
                  {i === 0 ? <div className="skeleton-shimmer h-4 w-2/3 rounded-full" /> : null}
                </div>
              ))}
            </div>
          </section>

          <aside>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]">
              <div className="skeleton-shimmer h-72 w-full sm:h-96" />
              <div className="space-y-3 p-6 sm:p-7">
                <div className="skeleton-shimmer h-6 w-2/3 rounded-xl" />
                <div className="skeleton-shimmer h-4 w-full rounded-full" />
                <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
