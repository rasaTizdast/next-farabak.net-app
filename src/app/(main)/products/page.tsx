import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OG_IMAGE_PATH } from "@/constants/meta";
import { getAllProducts } from "@/lib/data/products";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "./_components/BreadcrumbWrapper";
import CategorySliderWrapper from "./_components/CategorySliderWrapper";
import ProductGridWrapper from "./_components/ProductGridWrapper";
import {
  BreadcrumbSkeleton,
  CategorySliderSkeleton,
  ProductGridSkeleton,
  ProductsPageSkeleton,
} from "./_components/ProductListSkeletons";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

const parseProductsQueryPage = (page: string | string[] | undefined) =>
  page === undefined ? 1 : typeof page === "string" ? parsePositivePageNumber(page) : null;

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const searchParams = await props.searchParams;
  const currentPage = parseProductsQueryPage(searchParams.page);
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
    title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
    description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
    openGraph: {
      title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
      description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
      images: [OG_IMAGE_PATH],
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

const productsBreadcrumbs = ["/", "/products"];

async function ProductsPageContent(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const currentPage = parseProductsQueryPage(searchParams.page);
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
        <BreadcrumbWrapper breadcrumbs={productsBreadcrumbs} />
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

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent {...props} />
    </Suspense>
  );
}
