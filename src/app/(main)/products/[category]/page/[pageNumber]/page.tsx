import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { SITE_URL } from "@/constants/meta";
import { getCategoryName, getProductsByCategory } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "../../../_components/BreadcrumbWrapper";
import CategoryPageWrapper from "../../../_components/CategoryPageWrapper";
import { BreadcrumbSkeleton } from "../../../_components/ProductListSkeletons";

export const instant = false;

interface CategoryPageProps {
  params: Promise<{ category: string; pageNumber: string }>;
}

export const generateMetadata = async (props: CategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const categoryName = params.category;
  const pageNumber = parsePositivePageNumber(params.pageNumber);
  if (pageNumber === null) notFound();
  const data = await getProductsByCategory(categoryName, { page: pageNumber, limit: 30 });

  if (!data) notFound();

  const { seoDetails } = data;
  const canonicalUrl =
    pageNumber === 1
      ? `${SITE_URL}/products/${params.category}`
      : `${SITE_URL}/products/${params.category}/page/${pageNumber}`;

  return {
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
    openGraph: {
      title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
      description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default async function CategoryPage(props: CategoryPageProps) {
  await connection();
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = parsePositivePageNumber(params.pageNumber);
  if (currentPage === null) notFound();
  const limit = 30;
  const [pageData, categoryNameData, usdRateData] = await Promise.all([
    getProductsByCategory(categoryName, { page: currentPage, limit }),
    getCategoryName(categoryName).catch(() => null),
    getUsdToRialRate(),
  ]);
  if (!pageData) notFound();

  const canonicalUrl =
    currentPage === 1
      ? `${SITE_URL}/products/${params.category}`
      : `${SITE_URL}/products/${params.category}/page/${currentPage}`;

  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
      </Suspense>
      <CategoryPageWrapper
        categoryName={categoryName}
        categoryTitle={categoryNameData?.categoryName ?? categoryName}
        currentPage={currentPage}
        canonicalUrl={canonicalUrl}
        feed={pageData}
        usdRate={usdRateData.rate}
      />
    </>
  );
}
