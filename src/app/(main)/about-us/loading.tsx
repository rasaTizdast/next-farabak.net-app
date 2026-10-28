import {
  BreadcrumbSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  LineSkeleton,
} from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function AboutUsLoading() {
  return (
    <PublicShell
      as="main"
      className="animate-pulse py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری درباره ما"
    >
      <div className="w-full">
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
    </PublicShell>
  );
}
