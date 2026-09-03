import {
  BreadcrumbSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  LineSkeleton,
} from "@/app/_components/ui/PageSkeletons";

export default function MembersLoading() {
  return (
    <div className="w-full max-w-[1580px]" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <div className="flex w-full flex-wrap items-stretch justify-evenly gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton
            key={i}
            className="w-[20%] max-w-[300px] min-w-[300px] max-[768px]:min-w-[250px]"
          >
            <div className="h-[200px] w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
            <LineSkeleton className="w-2/3" />
            <ButtonSkeleton />
          </CardSkeleton>
        ))}
      </div>
    </div>
  );
}
