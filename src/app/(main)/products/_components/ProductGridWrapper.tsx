import { serializeJsonLd } from "@/lib/seo/json-ld";

import {
  buildProductCollectionSchema,
  type CollectionBreadcrumb,
  type CollectionProduct,
} from "./product-collection-schema";
import ProductGrid from "./ProductGrid";

interface ProductGridWrapperProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  canonicalUrl?: string;
  collectionItems?: CollectionProduct[];
  breadcrumbCategoryTitle?: string;
  breadcrumbSubcategoryTitle?: string;
}

function ProductCollectionStructuredData({
  title,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
  collectionItems,
  breadcrumbCategoryTitle,
  breadcrumbSubcategoryTitle,
}: Pick<
  ProductGridWrapperProps,
  | "title"
  | "currentPage"
  | "categorySlug"
  | "subcategorySlug"
  | "canonicalUrl"
  | "collectionItems"
  | "breadcrumbCategoryTitle"
  | "breadcrumbSubcategoryTitle"
>) {
  if (!collectionItems) return null;

  const breadcrumbs: CollectionBreadcrumb[] = [
    { name: "خانه", path: "/" },
    { name: "محصولات", path: "/products" },
  ];

  if (categorySlug) {
    breadcrumbs.push({
      name: breadcrumbCategoryTitle || categorySlug,
      path: `/products/${categorySlug}`,
    });
  }
  if (subcategorySlug && categorySlug) {
    breadcrumbs.push({
      name: breadcrumbSubcategoryTitle || subcategorySlug,
      path: `/products/${categorySlug}/${subcategorySlug}`,
    });
  }
  if (currentPage > 1 && canonicalUrl) {
    breadcrumbs.push({ name: `صفحه ${currentPage}`, path: canonicalUrl });
  }

  const schema = buildProductCollectionSchema({
    title: currentPage > 1 ? `${title} - صفحه ${currentPage} | فرابک` : `${title} | فرابک`,
    canonicalUrl: canonicalUrl || "https://farabak.net/products",
    breadcrumbs,
    products: collectionItems,
  });

  return schema ? (
    <script
      id={`json-ld-product-grid-${categorySlug ?? "all"}-${subcategorySlug ?? "all"}-${currentPage}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  ) : null;
}

export default function ProductGridWrapper({
  title,
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
  collectionItems,
  breadcrumbCategoryTitle,
  breadcrumbSubcategoryTitle,
}: ProductGridWrapperProps) {
  return (
    <>
      <ProductCollectionStructuredData
        title={title}
        currentPage={currentPage}
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
        canonicalUrl={canonicalUrl}
        collectionItems={collectionItems}
        breadcrumbCategoryTitle={breadcrumbCategoryTitle}
        breadcrumbSubcategoryTitle={breadcrumbSubcategoryTitle}
      />
      <ProductGrid
        title={title}
        apiUrl={apiUrl}
        currentPage={currentPage}
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
      />
    </>
  );
}
