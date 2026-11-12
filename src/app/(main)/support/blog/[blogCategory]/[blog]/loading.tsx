import {
  LoadingBlock,
  SupportIntroSkeleton,
  SupportLoadingShell,
} from "../../../_components/LoadingSkeletons";

export default function BlogDetailLoading() {
  return (
    <SupportLoadingShell label="در حال بارگذاری مقاله">
      <SupportIntroSkeleton />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 md:p-10">
          <div className="mb-8 border-b border-slate-100 pb-8">
            <LoadingBlock className="mx-auto mb-6 aspect-video w-full max-w-3xl rounded-xl" />
            <LoadingBlock className="h-11 w-full rounded-xl" />
          </div>
          <LoadingBlock className="mb-8 h-32 rounded-xl bg-(--farabak-surface-blue) lg:hidden" />
          <div className="mx-auto max-w-3xl space-y-4">
            <LoadingBlock className="h-8 w-1/2" />
            <LoadingBlock className="h-4 w-full" />
            <LoadingBlock className="h-4 w-full" />
            <LoadingBlock className="h-4 w-4/5" />
          </div>
        </div>

        <div className="hidden space-y-4 lg:block">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <LoadingBlock className="h-5 w-24" />
            <LoadingBlock className="h-5 w-full" />
            <LoadingBlock className="h-5 w-4/5" />
            <LoadingBlock className="h-5 w-3/4" />
          </div>
          <LoadingBlock className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </SupportLoadingShell>
  );
}
