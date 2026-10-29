import { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";
import { advisorIntentOptions } from "@/features/product-advisor/category-definitions";
import { getAdvisorCategory } from "@/lib/data/productAdvisor";

import FinderWorkspace from "./FinderWorkspace";

export const metadata: Metadata = {
  title: "راهنمای انتخاب محصول | فرابک",
  description: "نیاز خود را توضیح دهید تا محصولات مناسب را با مشخصات ثبت‌شده پیدا کنید.",
};

export default async function ProductFinderPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: slug } = await searchParams;
  const data = slug ? await getAdvisorCategory(slug) : null;
  return (
    <PublicShell className="py-12 sm:py-18">
      {data ? (
        <FinderWorkspace category={data.category} products={data.products} />
      ) : (
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
      )}
    </PublicShell>
  );
}
