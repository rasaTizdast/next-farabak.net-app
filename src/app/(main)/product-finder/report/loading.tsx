import { PublicShell } from "@/components/public/PublicShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductFinderReportLoading() {
  return (
    <PublicShell className="py-12" role="status" aria-label="در حال بارگذاری گزارش انتخاب">
      <div aria-hidden="true" className="rounded-3xl bg-white p-7 shadow-sm sm:p-12">
        <Skeleton className="ms-auto h-11 w-40 rounded-xl" />
        <p className="mt-5 text-3xl font-black text-slate-950">گزارش انتخاب فرابک</p>
        <Skeleton className="mt-2 h-6 w-44" />
        <Skeleton className="h-5 w-full max-w-80" />
        <div className="mt-8 rounded-2xl bg-slate-50 p-5">
          <p className="text-xl font-bold">نیازهای ثبت‌شده</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        </div>
        <p className="mt-8 text-xl font-bold">محصولات پیشنهادی</p>
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </PublicShell>
  );
}
