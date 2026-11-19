import { Metadata } from "next";
import { Suspense } from "react";

import { searchProducts } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";

import BreadcrumbWrapper from "../_components/BreadcrumbWrapper";
import ProductGridWrapper from "../_components/ProductGridWrapper";
import { BreadcrumbSkeleton } from "../_components/ProductListSkeletons";

interface SearchPageProps {
  searchParams: Promise<{ q: string; page?: string }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  return {
    title: `نتایج جستجو برای "${query}"`,
    description: `مشاهده ${query} در سایت فرابک`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

const searchBreadcrumbs = ["/", "/products", "/products/search"];

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
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
