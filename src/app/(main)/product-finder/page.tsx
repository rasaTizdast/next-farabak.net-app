import { Metadata } from "next";
import { Suspense } from "react";

import { PublicShell } from "@/components/public/PublicShell";
import { advisorIntentOptions } from "@/features/product-advisor/category-definitions";
import { getAdvisorCategory } from "@/lib/data/productAdvisor";

import { FinderIntentSkeleton, FinderQuestionnaireSkeleton } from "./_components/FinderSkeletons";
import FinderWorkspace from "./FinderWorkspace";

export const metadata: Metadata = {
  title: "راهنمای انتخاب محصول | فرابک",
  description: "نیاز خود را توضیح دهید تا محصولات مناسب را با مشخصات ثبت‌شده پیدا کنید.",
};

function FinderIntent() {
  return (
    <section className="rounded-3xl bg-slate-950 p-7 text-white sm:p-12">
      <p className="text-sm text-blue-200">نیازسنج فرابک</p>
      <h1 className="mt-3 text-3xl font-black">برای چه کاری محصول می‌خواهید؟</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {advisorIntentOptions.map((item) => (
          <a
            key={item.id}
            href={`/product-finder?category=${item.categorySlug}`}
            className="rounded-2xl border border-white/25 bg-white/5 p-5 font-bold text-white transition-colors hover:border-cyan-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
}

async function FinderCategory({ slug }: { slug: string }) {
  const data = await getAdvisorCategory(slug);

  return data ? (
    <FinderWorkspace category={data.category} products={data.products} />
  ) : (
    <FinderIntent />
  );
}

type FinderSearchParams = Promise<{ category?: string }>;

async function FinderContent({ searchParams }: { searchParams: FinderSearchParams }) {
  const { category: slug } = await searchParams;
  if (!slug) return <FinderIntent />;

  return (
    <Suspense key={slug} fallback={<FinderQuestionnaireSkeleton slug={slug} />}>
      <FinderCategory slug={slug} />
    </Suspense>
  );
}

export default function ProductFinderPage({ searchParams }: { searchParams: FinderSearchParams }) {
  return (
    <PublicShell className="py-12 sm:py-18">
      <Suspense fallback={<FinderIntentSkeleton />}>
        <FinderContent searchParams={searchParams} />
      </Suspense>
    </PublicShell>
  );
}
