import { LineSkeleton } from "@/app/_components/ui/PageSkeletons";

export default function ActivityLoading() {
  return (
    <div
      className="mx-auto mb-4 flex w-full max-w-[1580px] animate-pulse flex-col gap-6 md:gap-8"
      role="status"
      aria-label="در حال بارگذاری"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <section key={i} className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-lg sm:p-8">
          <div className="relative pb-3">
            <div className="h-6 w-1/2 rounded-md bg-gray-200" />
            <div className="absolute inset-s-0 bottom-0 h-[3px] w-14 rounded-full bg-gray-200" />
          </div>
          <ul className="me-6 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <li key={j}>
                <LineSkeleton className={j % 3 === 0 ? "w-4/5" : "w-full"} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
