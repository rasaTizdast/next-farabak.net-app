import { LoadingBlock, SupportLoadingShell } from "../../_components/LoadingSkeletons";

export default function CctvStorageLoading() {
  return (
    <SupportLoadingShell label="در حال بارگذاری ابزار برآورد ذخیره‌سازی دوربین">
      <div className="mb-8 border-b border-slate-200 pb-7 sm:mb-10">
        <LoadingBlock className="h-5 w-32" />
        <LoadingBlock className="mt-3 h-12 w-full max-w-2xl" />
        <LoadingBlock className="mt-4 h-16 w-full max-w-3xl" />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-4">
            <div className="space-y-2">
              <LoadingBlock className="h-4 w-20" />
              <LoadingBlock className="h-8 w-36" />
            </div>
            <LoadingBlock className="h-12 w-24" />
          </div>
          <LoadingBlock className="mt-6 mb-5 h-7 w-32" />
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <LoadingBlock className="h-5 w-24" />
                <LoadingBlock className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="space-y-2 border-b-2 border-(--farabak-ink-deep) pb-4">
            <LoadingBlock className="h-4 w-20" />
            <LoadingBlock className="h-8 w-28" />
          </div>
          <LoadingBlock className="mt-6 h-24 w-full bg-slate-100" />
        </div>
      </div>
    </SupportLoadingShell>
  );
}
