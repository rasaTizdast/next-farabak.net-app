import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductsBySubcategory } from "@/lib/data/products";

import BreadcrumbWrapper from "../../_components/BreadcrumbWrapper";
import { BreadcrumbSkeleton, ProductGridSkeleton } from "../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../_components/SubcategoryPageWrapper";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { category, subcategory } = params;
  let data: Awaited<ReturnType<typeof getProductsBySubcategory>>;

  try {
    data = await getProductsBySubcategory(subcategory, { page: 1, limit: 30 });
  } catch (error) {
    console.error(error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  if (!data) notFound();

  const { seoDetails } = data;
  return {
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`,
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
  const subcategoryData = await getProductsBySubcategory(subcategory, {
    page: currentPage,
    limit,
  });
  if (!subcategoryData) notFound();

  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`;
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
      <Suspense fallback={<ProductGridSkeleton />}>
        <SubcategoryPageWrapper
          categoryName={category}
          subcategoryName={subcategory}
          currentPage={currentPage}
          limit={limit}
          canonicalUrl={canonicalUrl}
        />
      </Suspense>
    </div>
  );
}
