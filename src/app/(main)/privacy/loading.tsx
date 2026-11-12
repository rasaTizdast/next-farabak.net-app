import { PublicShell } from "@/components/public/PublicShell";

export default function PrivacyLoading() {
  return (
    <PublicShell
      as="main"
      className="py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری سیاست حریم خصوصی"
    >
      <div aria-hidden="true">
        <header className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
          <div className="skeleton-shimmer h-4 w-28 rounded-full" />
          <div className="skeleton-shimmer h-10 w-72 max-w-full rounded-2xl md:h-14" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-full max-w-3xl rounded-full" />
            <div className="skeleton-shimmer h-4 w-4/5 max-w-2xl rounded-full" />
          </div>
          <div className="skeleton-shimmer h-11 w-48 rounded-xl" />
        </header>

        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <nav
            aria-hidden="true"
            className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] lg:sticky lg:top-28"
          >
            <div className="skeleton-shimmer mb-2 h-5 w-2/3 rounded-xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl px-3 py-2">
                <div className="skeleton-shimmer h-4 w-5 rounded-full" />
                <div
                  className={`skeleton-shimmer h-4 flex-1 rounded-full ${i === 2 ? "max-w-24" : ""}`}
                />
              </div>
            ))}
          </nav>

          <article className="space-y-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-10 lg:p-12">
            {Array.from({ length: 5 }).map((_, i) => (
              <section key={i} className="space-y-4">
                <div className="skeleton-shimmer h-8 w-1/2 rounded-2xl" />
                <div className="space-y-3">
                  <div className="skeleton-shimmer h-4 w-full rounded-full" />
                  <div className="skeleton-shimmer h-4 w-full rounded-full" />
                  <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </PublicShell>
  );
}
