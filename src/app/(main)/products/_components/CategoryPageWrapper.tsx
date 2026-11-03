import { Suspense } from "react";

import { getCategoryName, getProductsByCategory } from "@/lib/data/products";

import CategorySliderWrapper from "./CategorySliderWrapper";
import ProductGridWrapper from "./ProductGridWrapper";
import { CategorySliderSkeleton, ProductGridSkeleton } from "./ProductListSkeletons";

interface CategoryPageWrapperProps {
  categoryName: string;
  currentPage: number;
  limit: number;
  canonicalUrl: string;
}

async function fetchCategoryData(categoryName: string) {
  try {
    const result = await getCategoryName(categoryName);
    if (result === null) {
      return categoryName;
    }
    return result.categoryName ?? categoryName;
  } catch {
    return categoryName;
  }
}

async function fetchCategoryProducts(categoryName: string, currentPage: number, limit: number) {
  try {
    const result = await getProductsByCategory(categoryName, { page: currentPage, limit });
    return result?.data ?? [];
  } catch {
    return [];
  }
}

export default async function CategoryPageWrapper({
  categoryName,
  currentPage,
  limit,
  canonicalUrl,
}: CategoryPageWrapperProps) {
  const [categoryTitle, categoryProducts] = await Promise.all([
    fetchCategoryData(categoryName),
    fetchCategoryProducts(categoryName, currentPage, limit),
  ]);

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=${currentPage}&limit=${limit}`;

  return (
    <>
      <Suspense fallback={<CategorySliderSkeleton />}>
        <CategorySliderWrapper type="subcategories" categorySlug={categoryName} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGridWrapper
          title={categoryTitle}
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categoryName}
          canonicalUrl={canonicalUrl}
          collectionItems={categoryProducts
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
