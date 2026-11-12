import { LoadingBlock, SupportLoadingShell } from "../../_components/LoadingSkeletons";

export default function XrayFitLoading() {
  return (
    <SupportLoadingShell
      label="در حال بارگذاری ابزار بررسی محل نصب ایکس‌ری"
      className="py-8 sm:py-12"
    >
      <div className="mt-8 max-w-4xl">
        <LoadingBlock className="h-5 w-32" />
        <LoadingBlock className="mt-3 h-12 w-full max-w-2xl" />
        <LoadingBlock className="mt-4 h-16 w-full max-w-3xl" />
        <LoadingBlock className="mt-4 h-20 w-full rounded-none border-r-4 border-(--farabak-action-blue) bg-slate-50" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
            <LoadingBlock className="h-4 w-20" />
            <LoadingBlock className="mt-1 h-5 w-32" />
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }, (_, index) => (
                <LoadingBlock key={index} className="h-1.5 rounded-full" />
              ))}
            </div>
            <LoadingBlock className="mt-3 h-10 w-full" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <LoadingBlock className="h-5 w-28" />
            <LoadingBlock className="h-12 w-32" />
          </div>
          <LoadingBlock className="h-7 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <LoadingBlock className="h-12 w-full" />
            <LoadingBlock className="h-12 w-full" />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-t-4 border-slate-200 border-t-(--farabak-action-blue) bg-white p-5 shadow-sm sm:p-7">
          <LoadingBlock className="h-5 w-32" />
          <LoadingBlock className="mt-2 h-14 w-full" />
          <LoadingBlock className="mt-3 h-12 w-full" />
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <LoadingBlock className="h-5 w-4/5" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <LoadingBlock key={index} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SupportLoadingShell>
  );
}
