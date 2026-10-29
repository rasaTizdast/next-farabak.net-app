import Script from "next/script";

import ProductGrid from "./ProductGrid";

interface ProductGridWrapperProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  canonicalUrl?: string;
}

function ProductCollectionStructuredData({
  title,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
}: Pick<
  ProductGridWrapperProps,
  "title" | "currentPage" | "categorySlug" | "subcategorySlug" | "canonicalUrl"
>) {
  const breadcrumbItems = [
    { position: 1, name: "خانه", item: "https://farabak.net" },
    { position: 2, name: "محصولات", item: "https://farabak.net/products" },
  ];

  let position = 3;
  if (categorySlug) {
    breadcrumbItems.push({
      position: position++,
      name: categorySlug,
      item: `https://farabak.net/products/${categorySlug}`,
    });
  }
  if (subcategorySlug) {
    breadcrumbItems.push({
      position: position++,
      name: subcategorySlug,
      item: `https://farabak.net/products/${categorySlug}/${subcategorySlug}`,
    });
  }
  if (currentPage > 1) {
    breadcrumbItems.push({
      position: position++,
      name: `صفحه ${currentPage}`,
      item: canonicalUrl || `https://farabak.net/products/page/${currentPage}`,
    });
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
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.map((item) => ({
            "@type": "ListItem",
            position: item.position,
            name: item.name,
            item: item.item,
          })),
        },
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
    <Script
      id={`json-ld-product-grid-${categorySlug ?? "all"}-${subcategorySlug ?? "all"}-${currentPage}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
}: ProductGridWrapperProps) {
  return (
    <>
      <ProductCollectionStructuredData
        title={title}
        currentPage={currentPage}
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
        canonicalUrl={canonicalUrl}
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
