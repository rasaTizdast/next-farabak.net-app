import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import BreadcrumbWrapper from "../../_components/BreadcrumbWrapper";
import { BreadcrumbSkeleton, ProductGridSkeleton } from "../../_components/ProductListSkeletons";
import SubcategoryPageWrapper from "../../_components/SubcategoryPageWrapper";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { category, subcategory } = params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=1&limit=1`,
      { next: { revalidate: 60 } }
    );

    if (!res || !res.ok) {
      return {
        title: subcategory,
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
        title: subcategory,
        description: "دسته بندی مورد نظر یافت نشد!",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const { seoDetails } = data;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`,
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

export default async function SubcategoryPage(props: SubcategoryPageProps) {
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = 1;
  const limit = 30;

  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`;
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