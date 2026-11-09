import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductsBySubcategory } from "@/lib/data/products";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "../../../../_components/BreadcrumbWrapper";
import {
  BreadcrumbSkeleton,
  ProductGridSkeleton,
} from "../../../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../../../_components/SubcategoryPageWrapper";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    pageNumber: string;
  }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { subcategory } = params;
  const pageNumber = parsePositivePageNumber(params.pageNumber);
  if (pageNumber === null) notFound();
  const data = await getProductsBySubcategory(subcategory, { page: pageNumber, limit: 30 });

  if (!data) notFound();

  const { seoDetails } = data;
  const canonicalUrl =
    pageNumber === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${pageNumber}`;

  return {
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
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
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = parsePositivePageNumber(params.pageNumber);
  if (currentPage === null) notFound();
  const limit = 30;
  const pageData = await getProductsBySubcategory(subcategory, { page: currentPage, limit });
  if (!pageData) notFound();

  const canonicalUrl =
    currentPage === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${currentPage}`;

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
      <Suspense fallback={<ProductGridSkeleton />}>
        <SubcategoryPageWrapper
          categoryName={category}
          subcategoryName={subcategory}
          currentPage={currentPage}
          limit={limit}
          canonicalUrl={canonicalUrl}
        />
      </Suspense>
    </>
  );
}
