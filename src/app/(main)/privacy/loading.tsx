import { PublicShell } from "@/components/public/PublicShell";

export default function PrivacyLoading() {
  return (
    <PublicShell
      as="main"
      className="py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری سیاست حریم خصوصی"
    >
      <div className="space-y-5 py-10 md:py-16">
        <div className="skeleton-shimmer h-4 w-28 rounded-full" />
        <div className="skeleton-shimmer h-12 w-72 rounded-2xl" />
        <div className="skeleton-shimmer h-5 w-full max-w-2xl rounded-full" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="skeleton-shimmer h-56 rounded-3xl border border-slate-100 bg-white shadow-sm" />
        <article className="space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <section key={i} className="space-y-4">
              <div className="skeleton-shimmer h-7 w-1/2 rounded-2xl" />
              <div className="skeleton-shimmer h-4 w-full rounded-full" />
              <div className="skeleton-shimmer h-4 w-full rounded-full" />
              <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
            </section>
          ))}
        </article>
      </div>
    </PublicShell>
  );
}
