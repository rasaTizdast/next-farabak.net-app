import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function BlogDetailLoading() {
  return (
    <PublicShell
      as="main"
      className="animate-pulse py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری مقاله"
    >
      <BreadcrumbSkeleton className="bg-slate-100 shadow-none" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8 lg:p-12">
          <header className="mb-10 space-y-5">
            <div className="h-4 w-24 rounded-full bg-slate-100" />
            <div className="h-12 w-full rounded-2xl bg-slate-200" />
            <div className="h-12 w-4/5 rounded-2xl bg-slate-200" />
            <div className="aspect-1200/630 w-full rounded-3xl bg-slate-100" />
            <div className="h-5 w-2/3 rounded-full bg-slate-100" />
          </header>
          <div className="space-y-5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded-full bg-slate-100 ${i % 4 === 0 ? "w-11/12" : i % 3 === 0 ? "w-10/12" : "w-full"}`}
              />
            ))}
          </div>
        </article>
        <aside className="hidden space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:block">
          <div className="h-5 w-28 rounded-full bg-slate-200" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-slate-100"
              style={{ width: `${75 - i * 7}%` }}
            />
          ))}
        </aside>
      </div>
    </PublicShell>
  );
}
