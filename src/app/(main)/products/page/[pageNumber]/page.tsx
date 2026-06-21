import { Metadata } from "next";
import { Suspense } from "react";

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
  const currentPage = parseInt(params.pageNumber || "1", 10);

  const canonicalUrl =
    params.pageNumber === "1"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${params.pageNumber}`;

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
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

export default async function ProductsPage(props: ProductsPageProps) {
  const params = await props.params;
  const currentPage = parseInt(params.pageNumber, 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;
  const canonicalUrl =
    params.pageNumber === "1"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${params.pageNumber}`;

  const breadcrumbs = ["/", "/products"];

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
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
        />
      </Suspense>
    </>
  );
}
