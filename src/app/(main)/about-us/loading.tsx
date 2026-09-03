import {
  BreadcrumbSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  LineSkeleton,
} from "@/app/_components/ui/PageSkeletons";

export default function AboutUsLoading() {
  return (
    <div
      className="flex w-full flex-col items-center px-6 py-12 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="w-full max-w-[1580px]">
        <BreadcrumbSkeleton />
        <div className="flex w-full flex-wrap items-stretch justify-evenly gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} className="max-w-[300px]">
              <div className="h-7 w-1/2 animate-pulse rounded bg-gray-200" />
              <LineSkeleton className="w-full" />
              <LineSkeleton className="w-4/5" />
              <ButtonSkeleton />
            </CardSkeleton>
          ))}
        </div>
      </div>
    </div>
  );
}
