import {
  LoadingBlock,
  SupportIntroSkeleton,
  SupportLoadingShell,
} from "../_components/LoadingSkeletons";

export default function FaqLoading() {
  return (
    <SupportLoadingShell label="در حال بارگذاری سوالات متداول">
      <SupportIntroSkeleton />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="mb-6 space-y-2 border-b border-slate-100 pb-5">
          <LoadingBlock className="h-5 w-24" />
          <LoadingBlock className="h-8 w-48" />
        </div>
        <div className="mx-auto max-w-3xl">
          <LoadingBlock className="mb-6 h-9 w-full rounded-lg md:mb-8 md:h-12" />
          <div className="divide-y divide-slate-200">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center justify-between gap-3 py-4">
                <LoadingBlock className="h-5 w-3/4" />
                <LoadingBlock className="size-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 rounded-2xl bg-(--farabak-surface-blue) p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="space-y-2">
          <LoadingBlock className="h-5 w-44" />
          <LoadingBlock className="h-8 w-full max-w-64" />
          <LoadingBlock className="h-5 w-full max-w-xl" />
        </div>
        <LoadingBlock className="h-11 w-28 rounded-xl" />
      </div>
    </SupportLoadingShell>
  );
}
