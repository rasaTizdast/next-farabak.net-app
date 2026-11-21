import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OG_IMAGE_PATH, SITE_URL } from "@/constants/meta";
import { getCatalogStaticParams } from "@/lib/data/catalog-static-params";
import { getCategoryName, getProductsBySubcategory, getSubCategoryName } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { createRouteMetadata } from "@/lib/seo/route-metadata";

import BreadcrumbWrapper from "../../_components/BreadcrumbWrapper";
import { BreadcrumbSkeleton } from "../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../_components/SubcategoryPageWrapper";

export const instant = false;

export async function generateStaticParams({ params }: { params: { category?: string } }) {
  return (await getCatalogStaticParams()).subcategories.filter(
    (subcategory) => !params.category || subcategory.category === params.category
  );
}

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { category, subcategory } = params;
  const data = await getProductsBySubcategory(subcategory, { page: 1, limit: 30 }, category);
  const subcategoryNameData = await getSubCategoryName(subcategory).catch(() => null);

  if (!data) notFound();

  const { seoDetails } = data;
  const canonicalUrl = `${SITE_URL}/products/${category}/${subcategory}`;
  const displayName = subcategoryNameData?.subCategoryName ?? subcategory;
  const title = seoDetails?.SEO_Title || `محصولات ${displayName} | فرابک`;
  const description = seoDetails?.SEO_Description || `محصولات دسته‌بندی ${displayName}`;
  return {
    ...createRouteMetadata({ title, description, path: canonicalUrl, image: OG_IMAGE_PATH }),
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [OG_IMAGE_PATH],
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
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = 1;
  const limit = 30;
  const [subcategoryData, categoryNameData, subcategoryNameData, usdRateData] = await Promise.all([
    getProductsBySubcategory(subcategory, { page: currentPage, limit }, category),
    getCategoryName(category).catch(() => null),
    getSubCategoryName(subcategory).catch(() => null),
    getUsdToRialRate(),
  ]);
  if (!subcategoryData) notFound();

  const canonicalUrl = `${SITE_URL}/products/${category}/${subcategory}`;
  const breadcrumbs = [
    "/",
    "/products",
    `/products/${category}`,
    `/products/${category}/${subcategory}`,
  ];

  return (
    <div dir="rtl">
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
        feed={subcategoryData}
        usdRate={usdRateData.rate}
      />
    </div>
  );
}
