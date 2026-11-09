import { serializeJsonLd } from "@/lib/seo/json-ld";

import { buildProductCollectionSchema, type CollectionProduct } from "./product-collection-schema";
import ProductGrid from "./ProductGrid";

interface ProductGridWrapperProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  canonicalUrl?: string;
  collectionItems?: CollectionProduct[];
}

function ProductCollectionStructuredData({
  title,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
  collectionItems,
}: Pick<
  ProductGridWrapperProps,
  "title" | "currentPage" | "categorySlug" | "subcategorySlug" | "canonicalUrl" | "collectionItems"
>) {
  if (!collectionItems) return null;

  const schema = buildProductCollectionSchema({
    title: currentPage > 1 ? `${title} - صفحه ${currentPage} | فرابک` : `${title} | فرابک`,
    canonicalUrl: canonicalUrl || "https://farabak.net/products",
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
