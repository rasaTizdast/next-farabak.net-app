import { Skeleton } from "@/components/ui/skeleton";
import {
  advisorCategoryDefinitions,
  advisorIntentOptions,
} from "@/features/product-advisor/category-definitions";

export function FinderIntentSkeleton() {
  return (
    <div
      className="rounded-3xl bg-slate-950 p-7 text-white sm:p-12"
      role="status"
      aria-label="در حال بارگذاری راهنمای انتخاب"
    >
      <div aria-hidden="true">
        <p className="text-sm text-blue-200">نیازسنج فرابک</p>
        <p className="mt-3 text-3xl font-black">برای چه کاری محصول می‌خواهید؟</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {advisorIntentOptions.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/25 bg-white/5 p-5">
              <Skeleton className="h-6 w-40 max-w-full opacity-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinderQuestionnaireSkeleton({ slug }: { slug: string }) {
  const question = advisorCategoryDefinitions[slug]?.questions?.[0];

  if (!question) return <FinderIntentSkeleton />;

  return (
    <div
      className="rounded-3xl bg-white p-6 shadow-sm sm:p-10"
      role="status"
      aria-label="در حال بارگذاری پرسش‌های راهنمای انتخاب"
    >
      <div aria-hidden="true">
        <Skeleton className="mb-8 h-1.5 w-full rounded-full" />
        <Skeleton className="h-5 w-40" />
        <p className="mt-4 text-2xl font-black text-slate-950">{question.label}</p>
        {question.help ? <p className="mt-2 text-slate-600">{question.help}</p> : null}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <Skeleton key={option.id} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
