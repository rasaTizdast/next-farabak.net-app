import { Suspense } from "react";

import CategorySliderWrapper from "./CategorySliderWrapper";
import type { ProductFeed } from "./GridContentServer";
import ProductGridWrapper from "./ProductGridWrapper";
import { CategorySliderSkeleton } from "./ProductListSkeletons";

interface CategoryPageWrapperProps {
  categoryName: string;
  categoryTitle: string;
  currentPage: number;
  canonicalUrl: string;
  feed: ProductFeed;
  usdRate: number | null;
}

export default function CategoryPageWrapper({
  categoryName,
  categoryTitle,
  currentPage,
  canonicalUrl,
  feed,
  usdRate,
}: CategoryPageWrapperProps) {
  const collectionItems = feed.data
    .filter((product) => product.Available)
    .map((product) => ({
      name: product.Type?.trim() || product.Name?.trim() || null,
      path: product.link,
    }));

  return (
    <>
      <ProductGridWrapper
        title={categoryTitle}
        feed={feed}
        usdRate={usdRate}
        currentPage={currentPage}
        categorySlug={categoryName}
        canonicalUrl={canonicalUrl}
        collectionItems={collectionItems}
        breadcrumbCategoryTitle={categoryTitle}
        introAddon={
          <Suspense fallback={<CategorySliderSkeleton subcategories />}>
            <CategorySliderWrapper type="subcategories" categorySlug={categoryName} />
          </Suspense>
        }
      />
    </>
  );
}
