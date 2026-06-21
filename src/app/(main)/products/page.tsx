export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { Suspense } from "react";

import BreadcrumbWrapper from "./_components/BreadcrumbWrapper";
import CategorySliderWrapper from "./_components/CategorySliderWrapper";
import ProductGridWrapper from "./_components/ProductGridWrapper";
import {
  BreadcrumbSkeleton,
  CategorySliderSkeleton,
  ProductGridSkeleton,
} from "./_components/ProductListSkeletons";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);

  return {
    title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
    description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
    openGraph: {
      title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
      description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;
  const canonicalUrl =
    currentPage === 1
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${currentPage}`;

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
