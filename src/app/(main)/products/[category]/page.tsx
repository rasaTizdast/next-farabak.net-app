import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SITE_URL } from "@/constants/meta";
import { getCatalogStaticParams } from "@/lib/data/catalog-static-params";
import { getCategoryName, getProductsByCategory } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";

import BreadcrumbWrapper from "../_components/BreadcrumbWrapper";
import CategoryPageWrapper from "../_components/CategoryPageWrapper";
import { BreadcrumbSkeleton } from "../_components/ProductListSkeletons";

export const instant = false;

export async function generateStaticParams() {
  return (await getCatalogStaticParams()).categories;
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const generateMetadata = async (props: CategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const categoryName = params.category;
  const data = await getProductsByCategory(categoryName, { page: 1, limit: 30 });

  if (!data) notFound();

  const { seoDetails } = data;
  const canonicalUrl = `${SITE_URL}/products/${categoryName}`;
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
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = 1;
  const limit = 30;
  const [categoryData, categoryNameData, usdRateData] = await Promise.all([
    getProductsByCategory(categoryName, { page: currentPage, limit }),
    getCategoryName(categoryName).catch(() => null),
    getUsdToRialRate(),
  ]);
  if (!categoryData) notFound();

  const canonicalUrl = `${SITE_URL}/products/${categoryName}`;
  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  return (
    <div dir="rtl">
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
      </Suspense>
      <CategoryPageWrapper
        categoryName={categoryName}
        categoryTitle={categoryNameData?.categoryName ?? categoryName}
        currentPage={currentPage}
        canonicalUrl={canonicalUrl}
        feed={categoryData}
        usdRate={usdRateData.rate}
      />
    </div>
  );
}
