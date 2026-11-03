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
  if (collectionItems) {
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

  const url = canonicalUrl || `https://farabak.net/products?page=${currentPage}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: `${title} - صفحه ${currentPage} | فرابک`,
        description: `مجموعه‌ای از ${title} با کیفیت بالا و گارانتی معتبر از فرابک`,
        isPartOf: { "@type": "WebSite", "@id": "https://farabak.net" },
        about: { "@type": "Organization", "@id": "https://farabak.net" },
        mainEntity: {
          "@type": "ItemList",
          name: title,
          description: `مجموعه‌ای از ${title} شامل دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی`,
          numberOfItems: "30+",
        },
        inLanguage: "fa-IR",
      },
    ],
  };

  return (
    <script
      id={`json-ld-product-grid-${categorySlug ?? "all"}-${subcategorySlug ?? "all"}-${currentPage}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
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
