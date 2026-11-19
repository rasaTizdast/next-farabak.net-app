import type { ProductFeed } from "./GridContentServer";
import ProductGridWrapper from "./ProductGridWrapper";

interface SubcategoryPageWrapperProps {
  categoryName: string;
  categoryTitle: string;
  subcategoryName: string;
  subcategoryTitle: string;
  currentPage: number;
  canonicalUrl: string;
  feed: ProductFeed;
  usdRate: number | null;
}

export default function SubcategoryPageWrapper({
  categoryName,
  categoryTitle,
  subcategoryName,
  subcategoryTitle,
  currentPage,
  canonicalUrl,
  feed,
  usdRate,
}: SubcategoryPageWrapperProps) {
  const collectionItems = feed.data
    .filter((product) => product.Available)
    .map((product) => ({
      name: product.Type?.trim() || product.Name?.trim() || null,
      path: product.link,
    }));

  return (
    <ProductGridWrapper
      title={subcategoryTitle}
      feed={feed}
      usdRate={usdRate}
      currentPage={currentPage}
      categorySlug={categoryName}
      subcategorySlug={subcategoryName}
      canonicalUrl={canonicalUrl}
      collectionItems={collectionItems}
      breadcrumbCategoryTitle={categoryTitle}
      breadcrumbSubcategoryTitle={subcategoryTitle}
    />
  );
}
