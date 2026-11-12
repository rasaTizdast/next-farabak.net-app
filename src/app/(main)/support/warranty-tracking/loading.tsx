import { LoadingBlock, SupportLoadingShell } from "../_components/LoadingSkeletons";

export default function WarrantyTrackingLoading() {
  return (
    <SupportLoadingShell label="در حال بارگذاری پیگیری گارانتی">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-8 max-w-xl md:max-w-2xl lg:max-w-3xl">
          <LoadingBlock className="mx-auto mb-2 h-8 w-2/3 sm:h-10" />
          <LoadingBlock className="mx-auto mb-10 h-5 w-4/5" />

          <div className="mb-8 flex items-start justify-between">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {index > 0 ? <LoadingBlock className="h-0.5 flex-1" /> : null}
                  <LoadingBlock className="mx-1 size-9 shrink-0 rounded-full" />
                  {index < 2 ? <LoadingBlock className="h-0.5 flex-1" /> : null}
                </div>
                <LoadingBlock className="mt-2 h-5 w-12" />
                <LoadingBlock className="mt-0.5 hidden h-4 w-16 min-[577px]:block" />
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
          <LoadingBlock className="mb-4 h-7 w-1/3" />
          <LoadingBlock className="h-5 w-2/3" />
          <div className="my-6 flex flex-col gap-3 sm:flex-row">
            <LoadingBlock className="h-12 flex-1 rounded-lg max-sm:flex-none" />
            <LoadingBlock className="h-12 rounded-lg sm:w-24" />
          </div>
        </div>
        <LoadingBlock className="mx-auto mt-12 h-5 w-4/5 max-w-md" />
      </div>
    </SupportLoadingShell>
  );
}
