import { LoadingBlock, LoadingBreadcrumb } from "../../_components/LoadingSkeletons";

const plannerWidth =
  "mx-auto w-full max-w-[1580px] px-5 min-[992px]:px-16 min-[1200px]:px-24 sm:px-8 md:px-12 2xl:px-40";

export default function MeetingRoomLoading() {
  return (
    <div dir="rtl" role="status" aria-label="در حال بارگذاری برنامه‌ریز اتاق جلسه">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className={plannerWidth + " flow-root pt-8"}>
          <LoadingBreadcrumb />
        </div>
        <div className="min-h-screen bg-slate-50">
          <div className={plannerWidth + " py-8"}>
            <div className="mb-8 max-w-4xl">
              <LoadingBlock className="h-5 w-36 rounded-full bg-blue-100" />
              <LoadingBlock className="mt-3 h-20 w-full sm:h-24" />
              <LoadingBlock className="mt-4 h-16 w-full max-w-3xl" />
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="order-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:order-1">
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <LoadingBlock className="h-7 w-32" />
                  <LoadingBlock className="h-5 w-4/5" />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="space-y-2">
                      <LoadingBlock className="h-5 w-24" />
                      <LoadingBlock className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 space-y-5 lg:order-2">
                <div className="overflow-hidden rounded-xl bg-(--farabak-ink-deep)">
                  <LoadingBlock className="mx-5 mt-5 h-5 w-28 bg-slate-700" />
                  <LoadingBlock className="m-5 aspect-video rounded-lg bg-slate-700" />
                  <div className="grid grid-cols-3 gap-3 border-t border-white/10 px-4 py-5">
                    {Array.from({ length: 3 }, (_, index) => (
                      <LoadingBlock key={index} className="h-8 bg-slate-700" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <LoadingBlock className="h-5 w-36" />
                  <LoadingBlock className="h-10 w-32" />
                  <LoadingBlock className="h-5 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
