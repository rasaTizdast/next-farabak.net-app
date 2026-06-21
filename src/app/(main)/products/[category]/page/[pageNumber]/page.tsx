import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=1&limit=1`,
      { next: { revalidate: 60 } }
    );

    if (!res || !res.ok) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const data = await res.json();
    if (!data.seoDetails) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const { seoDetails } = data;

    const canonicalUrl =
      params.pageNumber === "1"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/page/${params.pageNumber}`;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
};

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = parseInt(params.pageNumber || "1", 10);
  const limit = 30;

  const canonicalUrl =
    params.pageNumber === "1"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/page/${params.pageNumber}`;

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