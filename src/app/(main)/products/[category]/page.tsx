import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductsByCategory } from "@/lib/data/products";

import BreadcrumbWrapper from "../_components/BreadcrumbWrapper";
import CategoryPageWrapper from "../_components/CategoryPageWrapper";
import { BreadcrumbSkeleton, CategoryPageSkeleton } from "../_components/ProductListSkeletons";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const generateMetadata = async (props: CategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const categoryName = params.category;
  let data: Awaited<ReturnType<typeof getProductsByCategory>>;

  try {
    data = await getProductsByCategory(categoryName, { page: 1, limit: 30 });
  } catch (error) {
    console.error(error);
    return {
      title: "دسته‌بندی یافت نشد!",
      description: "دسته‌بندی مورد نظر یافت نشد!",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${categoryName}`,
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
    title: seoDetails?.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
    description: seoDetails?.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${categoryName}`,
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
  const categoryData = await getProductsByCategory(categoryName, { page: currentPage, limit });
  if (!categoryData) notFound();

  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${categoryName}`;
  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  return (
    <div dir="rtl">
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
    </div>
  );
}
