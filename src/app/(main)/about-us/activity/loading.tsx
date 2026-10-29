import { LineSkeleton } from "@/app/_components/ui/PageSkeletons";
import { PublicShell } from "@/components/public/PublicShell";

export default function ActivityLoading() {
  return (
    <PublicShell
      as="main"
      className="mb-4 animate-pulse py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری فعالیت‌ها"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <section
          key={i}
          className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-slate-200" />
            <div className="flex flex-1 flex-col gap-3 pt-1">
              <div className="h-3 w-24 rounded-full bg-slate-200" />
              <div className="h-6 w-1/2 rounded-md bg-slate-200" />
            </div>
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
    </PublicShell>
  );
}
