import {
  BreadcrumbSkeleton,
  ImageSkeleton,
  TextBlockSkeleton,
} from "@/app/_components/ui/PageSkeletons";

export default function ProjectDetailLoading() {
  return (
    <section
      className="w-full max-w-[1580px] animate-pulse"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <BreadcrumbSkeleton />
      <div className="mt-8 h-8 w-1/2 rounded-md bg-gray-200" />
      <div className="mt-5 mb-2 h-4 w-24 rounded bg-gray-200" />
      <div className="mb-1 h-4 w-32 rounded bg-gray-200" />
      <div className="my-8">
        <TextBlockSkeleton lines={4} />
      </div>
      <ImageSkeleton className="mx-auto mb-10 h-64 w-full rounded-xl md:h-[500px]" />
    </section>
  );
}
