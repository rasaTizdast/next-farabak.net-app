import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import BreadcrumbWrapper from "../../../../_components/BreadcrumbWrapper";
import { BreadcrumbSkeleton, ProductGridSkeleton } from "../../../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../../../_components/SubcategoryPageWrapper";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    pageNumber: string;
  }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { subcategory } = params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=1&limit=1`,
      { next: { revalidate: 60 } }
    );

    if (!res || !res.ok) {
      return {
        title: "زیر دسته بندی یافت نشد!",
        description: "زیر دسته بندی مورد نظر یافت نشد!",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const data = await res.json();
    if (!data.seoDetails) {
      return {
        title: "زیر دسته بندی یافت نشد!",
        description: "زیر دسته بندی مورد نظر یافت نشد!",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const { seoDetails } = data;

    const canonicalUrl =
      params.pageNumber === "1"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${params.pageNumber}`;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
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
      title: "زیر دسته بندی یافت نشد!",
      description: "زیر دسته بندی مورد نظر یافت نشد!",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
};

export default async function SubcategoryPage(props: SubcategoryPageProps) {
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = parseInt(params.pageNumber || "1", 10);
  const limit = 30;

  const canonicalUrl =
    params.pageNumber === "1"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${params.pageNumber}`;

  const breadcrumbs = [
    "/",
    "/products",
    `/products/${category}`,
    `/products/${category}/${subcategory}`,
  ];

  return (
    <>
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
    </>
  );
}