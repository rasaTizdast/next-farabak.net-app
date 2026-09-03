import { BreadcrumbSkeleton, TextBlockSkeleton } from "@/app/_components/ui/PageSkeletons";

export default function MemberDetailLoading() {
  return (
    <div className="w-full max-w-[1580px]" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <section className="flex w-full animate-pulse flex-col flex-wrap items-stretch justify-between gap-8 lg:flex-row">
        <div className="w-full max-w-[1000px] rounded-lg bg-white p-5 shadow-lg md:p-8 lg:w-[60%]">
          <div className="mb-2 h-7 w-1/3 rounded-md bg-gray-200" />
          <div className="mb-8 h-5 w-1/4 rounded bg-gray-200" />
          <TextBlockSkeleton lines={6} />
        </div>
        <aside className="flex h-fit w-full max-w-[500px] flex-col items-center gap-8 rounded-lg bg-white p-5 shadow-lg md:p-8 lg:w-[35%]">
          <div className="h-96 w-full rounded-lg bg-gray-200" />
          <div className="flex w-full flex-col gap-6">
            <div className="h-14 w-full rounded-lg bg-gray-200" />
            <div className="h-14 w-full rounded-lg bg-gray-200" />
          </div>
        </aside>
      </section>
    </div>
  );
}
