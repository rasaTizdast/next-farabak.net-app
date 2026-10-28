import {
  BreadcrumbSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  LineSkeleton,
} from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ProjectsLoading() {
  return (
    <PublicShell
      as="main"
      className="py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری پروژه‌ها"
    >
      <BreadcrumbSkeleton />
      <main className="flex flex-wrap items-center justify-center gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="max-w-[300px]">
            <div className="h-[200px] w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <LineSkeleton className="w-1/3" />
            <LineSkeleton className="w-1/2" />
            <LineSkeleton className="w-full" />
            <LineSkeleton className="w-4/5" />
            <ButtonSkeleton />
          </CardSkeleton>
        ))}
      </main>
    </PublicShell>
  );
}
