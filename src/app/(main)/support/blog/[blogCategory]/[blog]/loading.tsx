import { BreadcrumbSkeleton } from "@/app/_components/ui/PageSkeletons";

export default function BlogDetailLoading() {
  return (
    <div className="w-full max-w-[1580px]" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <article className="mt-5 w-full animate-pulse rounded-lg bg-white p-5 sm:p-10">
        <header className="mb-8">
          <div className="mb-8 h-8 w-2/3 rounded-md bg-gray-200 sm:h-10" />
          <div className="mx-auto mb-6 aspect-1200/630 w-full rounded-lg bg-gray-200 lg:w-3/5" />
          <div className="mb-4 flex items-center gap-3 overflow-x-auto rounded-lg bg-gray-100 p-2">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-3 rounded-full bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-3 rounded-full bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
          </div>
        </header>

        <div className="space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 rounded bg-gray-200 ${i % 4 === 0 ? "w-11/12" : i % 3 === 0 ? "w-10/12" : "w-full"}`}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
