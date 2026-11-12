import { Suspense } from "react";

import { getProductsBySubcategory, getSubCategoryName } from "@/lib/data/products";

import ProductGridWrapper from "./ProductGridWrapper";
import { ProductGridSkeleton } from "./ProductListSkeletons";

interface SubcategoryPageWrapperProps {
  categoryName: string;
  subcategoryName: string;
  currentPage: number;
  limit: number;
  canonicalUrl: string;
}

async function fetchSubcategoryData(subcategoryName: string) {
  try {
    const result = await getSubCategoryName(subcategoryName);
    if (result === null) {
      return subcategoryName;
    }
    return result.subCategoryName ?? subcategoryName;
  } catch {
    return subcategoryName;
  }
}

export default async function SubcategoryPageWrapper({
  categoryName,
  subcategoryName,
  currentPage,
  limit,
  canonicalUrl,
}: SubcategoryPageWrapperProps) {
  const [subCategoryTitle, subcategoryProducts] = await Promise.all([
    fetchSubcategoryData(subcategoryName),
    getProductsBySubcategory(subcategoryName, { page: currentPage, limit }).catch(() => null),
  ]);

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategoryName}?page=${currentPage}&limit=${limit}`;

  return (
    <>
      <Suspense fallback={<ProductGridSkeleton showSearch={false} />}>
        <ProductGridWrapper
          title={subCategoryTitle}
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categoryName}
          subcategorySlug={subcategoryName}
          canonicalUrl={canonicalUrl}
          collectionItems={(subcategoryProducts?.data ?? [])
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
