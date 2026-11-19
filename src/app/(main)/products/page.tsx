import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { OG_IMAGE_PATH, SITE_URL } from "@/constants/meta";
import { getAllProducts } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { parsePositivePageNumber } from "@/lib/pagination";

import BreadcrumbWrapper from "./_components/BreadcrumbWrapper";
import CategorySliderWrapper from "./_components/CategorySliderWrapper";
import ProductGridWrapper from "./_components/ProductGridWrapper";
import { BreadcrumbSkeleton, CategorySliderSkeleton } from "./_components/ProductListSkeletons";

export const instant = false;

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
    currentPage === 1 ? `${SITE_URL}/products` : `${SITE_URL}/products/page/${currentPage}`;

  return {
    title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
    description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
    openGraph: {
      title: `لیست محصولات - صفحه ${currentPage} | فرابک`,
      description: `تمامی محصولات فرابک: دوربین مداربسته ریولینک، محصولات بلک مجیک، گیت‌های کنترل تردد و دستگاه‌های ایکس‌ری با قیمت رقابتی و گارانتی. جستجو و خرید آسان تجهیزات نظارتی حرفه‌ای.`,
      url: canonicalUrl,
      images: [OG_IMAGE_PATH],
    },
    alternates: {
      canonical: pageExists ? canonicalUrl : `${SITE_URL}/products`,
    },
    robots: {
      index: pageExists,
      follow: true,
    },
  };
};

const productsBreadcrumbs = ["/", "/products"];

export default async function ProductsPage(props: ProductsPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const currentPage = parseProductsQueryPage(searchParams.page);
  if (currentPage === null) notFound();
  const limit = 30;
  const [pageData, usdRateData] = await Promise.all([
    getAllProducts({ page: currentPage, limit }),
    getUsdToRialRate(),
  ]);
  if (!pageData) notFound();

  const canonicalUrl =
    currentPage === 1 ? `${SITE_URL}/products` : `${SITE_URL}/products/page/${currentPage}`;

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={productsBreadcrumbs} />
      </Suspense>
      <Suspense fallback={<CategorySliderSkeleton />}>
        <CategorySliderWrapper type="categories" />
      </Suspense>
      <ProductGridWrapper
        title="تمامی محصولات"
        feed={pageData}
        usdRate={usdRateData.rate}
        currentPage={currentPage}
        canonicalUrl={canonicalUrl}
        collectionItems={pageData.data
          .filter((product) => product.Available)
          .map((product) => ({
            name: product.Type?.trim() || product.Name?.trim() || null,
            path: product.link,
          }))}
      />
    </>
  );
}
