import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductsByCategory } from "@/lib/data/products";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "../../../_components/BreadcrumbWrapper";
import CategoryPageWrapper from "../../../_components/CategoryPageWrapper";
import {
  BreadcrumbSkeleton,
  CategoryPageSkeleton,
} from "../../../_components/ProductListSkeletons";

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
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/page/${pageNumber}`;

  return {
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
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
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = parsePositivePageNumber(params.pageNumber);
  if (currentPage === null) notFound();
  const limit = 30;
  const pageData = await getProductsByCategory(categoryName, { page: currentPage, limit });
  if (!pageData) notFound();

  const canonicalUrl =
    currentPage === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/page/${currentPage}`;

  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
      </Suspense>
      <Suspense fallback={<CategoryPageSkeleton />}>
        <CategoryPageWrapper
          categoryName={categoryName}
          currentPage={currentPage}
          limit={limit}
          canonicalUrl={canonicalUrl}
        />
      </Suspense>
    </>
  );
}
