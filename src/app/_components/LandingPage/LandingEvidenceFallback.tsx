import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";

const shimmer = "skeleton-shimmer rounded-md";

export default function LandingEvidenceFallback() {
  return (
    <div role="status" aria-label="در حال بارگذاری پروژه‌ها و مقاله‌ها">
      <section className="scroll-mt-24 bg-[#f4f7fa] py-20 md:py-28 xl:py-36">
        <PublicShell>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
            <div className="space-y-4">
              <h2 className="max-w-[17ch] text-[clamp(2.2rem,4.3vw,4.5rem)] leading-tight font-extrabold tracking-tight text-[#09243b]">
                کار را از نزدیک ببینید
              </h2>
              <p className="max-w-[55ch] text-base leading-8 text-[#475c6e]">
                پروژه‌های منتشرشده، تصویری روشن‌تر از حوزه‌های فعالیت فرابک می‌دهند.
              </p>
            </div>
            <Link
              className="font-semibold text-[#1265e8] underline underline-offset-4"
              href="/about-us/projects"
            >
              همه پروژه‌ها
            </Link>
          </div>
          <div aria-hidden="true" className="grid gap-7 lg:grid-cols-[1.4fr_0.8fr] lg:gap-12">
            <div
              className={`${shimmer} aspect-5/4 lg:row-span-2 lg:aspect-auto lg:min-h-[620px]`}
            />
            <div className={`${shimmer} aspect-8/5`} />
            <div className={`${shimmer} aspect-8/5`} />
          </div>
        </PublicShell>
      </section>

      <section className="scroll-mt-24 bg-white py-20 md:py-28 xl:py-36">
        <PublicShell>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
            <div className="space-y-4">
              <h2 className="max-w-[17ch] text-[clamp(2.2rem,4.3vw,4.5rem)] leading-tight font-extrabold tracking-tight text-[#09243b]">
                پیش از انتخاب، بخوانید
              </h2>
              <p className="max-w-[55ch] text-base leading-8 text-[#475c6e]">
                راهنماهای فرابک برای روشن شدن مسئله، قبل از مقایسه مدل‌ها.
              </p>
            </div>
            <Link
              className="font-semibold text-[#1265e8] underline underline-offset-4"
              href="/support/blog"
            >
              همه مقاله‌ها
            </Link>
          </div>
          <div aria-hidden="true" className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-x-12">
            <div className="space-y-4 lg:row-span-2">
              <div className={`${shimmer} aspect-8/5`} />
              <div className={`${shimmer} h-4 w-28`} />
              <div className={`${shimmer} h-8 w-4/5`} />
              <div className={`${shimmer} h-4 w-32`} />
            </div>
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-5"
              >
                <div className={`${shimmer} aspect-8/5`} />
                <div className="space-y-3 py-4">
                  <div className={`${shimmer} h-4 w-24`} />
                  <div className={`${shimmer} h-6 w-full`} />
                  <div className={`${shimmer} h-4 w-28`} />
                </div>
              </div>
            ))}
          </div>
        </PublicShell>
      </section>
    </div>
  );
}
