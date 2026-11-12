import {
  LoadingBlock,
  SupportIntroSkeleton,
  SupportLoadingShell,
} from "../_components/LoadingSkeletons";

export default function DownloadCenterLoading() {
  return (
    <SupportLoadingShell label="در حال بارگذاری مرکز دانلود">
      <SupportIntroSkeleton actions={false} />

      <div className="space-y-6">
        {Array.from({ length: 3 }, (_, groupIndex) => (
          <div
            key={groupIndex}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-end md:justify-between md:p-8">
              <div className="w-full max-w-3xl space-y-2">
                <LoadingBlock className="h-5 w-28" />
                <LoadingBlock className="h-8 w-4/5 max-w-72" />
                <LoadingBlock className="h-5 w-full" />
              </div>
              {groupIndex < 2 ? <LoadingBlock className="h-11 w-40 shrink-0" /> : null}
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
              {Array.from({ length: 2 }, (_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex min-h-36 flex-col justify-between rounded-xl border border-slate-200 bg-(--farabak-paper) p-4"
                >
                  <div className="flex items-start gap-3">
                    <LoadingBlock className="size-11 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <LoadingBlock className="h-5 w-3/4" />
                      <LoadingBlock className="h-4 w-full" />
                    </div>
                  </div>
                  <LoadingBlock className="mt-5 h-11 w-full rounded-xl sm:w-40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SupportLoadingShell>
  );
}
