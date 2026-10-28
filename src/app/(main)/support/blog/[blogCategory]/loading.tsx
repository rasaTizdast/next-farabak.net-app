import {
  BreadcrumbSkeleton,
  ImageSkeleton,
  LineSkeleton,
} from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function BlogCategoryLoading() {
  return (
    <PublicShell
      as="main"
      className="animate-pulse py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری دسته‌بندی"
    >
      <BreadcrumbSkeleton className="bg-slate-100 shadow-none" />

      <div className="mb-10 space-y-5">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="h-12 w-72 rounded-2xl bg-slate-200 sm:w-96" />
        <div className="h-5 w-full max-w-2xl rounded-full bg-slate-100" />
      </div>

      <div className="mb-10 flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 w-32 shrink-0 rounded-full bg-slate-100" />
        ))}
      </div>

      <div className="mb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <ImageSkeleton className="min-h-72 rounded-3xl bg-slate-100 lg:min-h-96" />
        <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-24 rounded-full bg-slate-100" />
          <div className="h-10 w-full rounded-2xl bg-slate-200" />
          <div className="h-10 w-4/5 rounded-2xl bg-slate-200" />
          <LineSkeleton className="w-full bg-slate-100" />
          <LineSkeleton className="w-3/4 bg-slate-100" />
        </div>
      </div>

      <div className="mb-6 h-8 w-44 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="h-52 bg-slate-100" />
            <div className="space-y-4 p-5">
              <div className="h-5 w-3/4 rounded-full bg-slate-200" />
              <LineSkeleton className="w-full bg-slate-100" />
              <LineSkeleton className="w-1/2 bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </PublicShell>
  );
}
