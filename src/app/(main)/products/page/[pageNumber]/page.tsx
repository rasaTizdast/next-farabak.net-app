import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAllProducts } from "@/lib/data/products";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "../../_components/BreadcrumbWrapper";
import CategorySliderWrapper from "../../_components/CategorySliderWrapper";
import ProductGridWrapper from "../../_components/ProductGridWrapper";
import {
  BreadcrumbSkeleton,
  CategorySliderSkeleton,
  ProductGridSkeleton,
} from "../../_components/ProductListSkeletons";

interface ProductsPageProps {
  params: Promise<{ pageNumber: string }>;
}

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const params = await props.params;
  const currentPage = parsePositivePageNumber(params.pageNumber);

  if (currentPage === null) notFound();

  let pageExists = true;
  try {
    pageExists = (await getAllProducts({ page: currentPage, limit: 30 })) !== null;
  } catch {
    // A temporary data-source failure must not turn a valid route into noindex.
  }
  if (!pageExists) notFound();

  const canonicalUrl =
    currentPage === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${currentPage}`;

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    },
    alternates: {
      canonical: pageExists ? canonicalUrl : `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
    },
    robots: {
      index: pageExists,
      follow: true,
    },
  };
};

const pageNumberBreadcrumbs = ["/", "/products"];

export default async function ProductsPage(props: ProductsPageProps) {
  const params = await props.params;
  const currentPage = parsePositivePageNumber(params.pageNumber);
  if (currentPage === null) notFound();

  const limit = 30;
  const pageData = await getAllProducts({ page: currentPage, limit });
  if (!pageData) notFound();

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;
  const canonicalUrl =
    currentPage === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${currentPage}`;

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={pageNumberBreadcrumbs} />
      </Suspense>
      <Suspense fallback={<CategorySliderSkeleton />}>
        <CategorySliderWrapper type="categories" />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGridWrapper
          title="تمامی محصولات"
          apiUrl={apiUrl}
          currentPage={currentPage}
          canonicalUrl={canonicalUrl}
          collectionItems={pageData.data
            .filter((product) => product.Available)
            .map((product) => ({
              name: product.Type?.trim() || product.Name?.trim() || null,
              path: product.link,
            }))}
        />
      </Suspense>
    </>
  );
}
