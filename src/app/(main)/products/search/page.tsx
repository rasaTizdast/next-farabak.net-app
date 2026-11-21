import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { searchProducts } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { createRouteMetadata } from "@/lib/seo/route-metadata";

import BreadcrumbWrapper from "../_components/BreadcrumbWrapper";
import ProductGridWrapper from "../_components/ProductGridWrapper";
import { BreadcrumbSkeleton } from "../_components/ProductListSkeletons";

interface SearchPageProps {
  searchParams: Promise<{ q: string; page?: string }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q?.trim() || "";
  const title = query ? `نتایج جستجو برای «${query}» | فرابک` : "جستجوی محصولات | فرابک";
  const description = query
    ? `مشاهده نتایج جستجو برای ${query} در سایت فرابک.`
    : "برای مشاهده محصولات، عبارت موردنظر خود را جستجو کنید.";
  return {
    ...createRouteMetadata({ title, description, path: "/products/search" }),
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
  };
}

const searchBreadcrumbs = ["/", "/products", "/products/search"];

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q?.trim() || "";
  if (!query) {
    return (
      <div dir="rtl">
        <BreadcrumbWrapper breadcrumbs={searchBreadcrumbs} />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-(--farabak-ink-deep)">عبارت جستجو را وارد کنید</h1>
          <p className="mt-3 leading-8 text-(--farabak-ink-muted)">
            برای پیدا کردن محصول، نام یا مدل موردنظر را در جستجوی محصولات وارد کنید.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-(--farabak-action-blue) px-5 font-semibold text-white focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            رفتن به فهرست محصولات
          </Link>
        </section>
      </div>
    );
  }
  const currentPage = parseInt(searchParams.page || "1", 10);

  const limit = 0;
  const [feed, usdRateData] = await Promise.all([
    searchProducts(query, { page: currentPage, limit }),
    getUsdToRialRate(),
  ]);

  return (
    <div dir="rtl">
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={searchBreadcrumbs} renderStructuredData />
      </Suspense>
      <ProductGridWrapper
        title={`نتایج جستجو برای: ${query}`}
        feed={feed}
        usdRate={usdRateData.rate}
        currentPage={currentPage}
      />
    </div>
  );
}
