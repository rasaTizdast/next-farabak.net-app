import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { SITE_URL } from "@/constants/meta";
import { getCategoryName, getProductsBySubcategory, getSubCategoryName } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "../../../../_components/BreadcrumbWrapper";
import { BreadcrumbSkeleton } from "../../../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../../../_components/SubcategoryPageWrapper";

export const instant = false;

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    pageNumber: string;
  }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { category, subcategory } = params;
  const pageNumber = parsePositivePageNumber(params.pageNumber);
  if (pageNumber === null) notFound();
  const data = await getProductsBySubcategory(
    subcategory,
    { page: pageNumber, limit: 30 },
    category
  );

  if (!data) notFound();

  const { seoDetails } = data;
  const canonicalUrl =
    pageNumber === 1
      ? `${SITE_URL}/products/${params.category}/${params.subcategory}`
      : `${SITE_URL}/products/${params.category}/${params.subcategory}/page/${pageNumber}`;

  return {
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
    openGraph: {
      title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
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

export default async function SubcategoryPage(props: SubcategoryPageProps) {
  await connection();
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = parsePositivePageNumber(params.pageNumber);
  if (currentPage === null) notFound();
  const limit = 30;
  const [pageData, categoryNameData, subcategoryNameData, usdRateData] = await Promise.all([
    getProductsBySubcategory(subcategory, { page: currentPage, limit }, category),
    getCategoryName(category).catch(() => null),
    getSubCategoryName(subcategory).catch(() => null),
    getUsdToRialRate(),
  ]);
  if (!pageData) notFound();

  const canonicalUrl =
    currentPage === 1
      ? `${SITE_URL}/products/${params.category}/${params.subcategory}`
      : `${SITE_URL}/products/${params.category}/${params.subcategory}/page/${currentPage}`;

  const breadcrumbs = [
    "/",
    "/products",
    `/products/${category}`,
    `/products/${category}/${subcategory}`,
  ];

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
      </Suspense>
      <SubcategoryPageWrapper
        categoryName={category}
        categoryTitle={categoryNameData?.categoryName ?? category}
        subcategoryName={subcategory}
        subcategoryTitle={subcategoryNameData?.subCategoryName ?? subcategory}
        currentPage={currentPage}
        canonicalUrl={canonicalUrl}
        feed={pageData}
        usdRate={usdRateData.rate}
      />
    </>
  );
}
