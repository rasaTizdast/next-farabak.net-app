import Script from "next/script";
import { Suspense } from "react";

import { getSubCategoryName } from "@/lib/data/products";

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
  const subCategoryTitle = await fetchSubcategoryData(subcategoryName);

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategoryName}?page=${currentPage}&limit=${limit}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products/${categoryName}/${subcategoryName}`,
        url: `https://farabak.net/products/${categoryName}/${subcategoryName}`,
        name: `محصولات ${subCategoryTitle} | فرابک`,
        description: `مجموعه‌ای از محصولات ${subCategoryTitle} با کیفیت بالا و گارانتی معتبر از فرابک`,
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://farabak.net",
        },
        about: {
          "@type": "Organization",
          "@id": "https://farabak.net",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "خانه",
              item: "https://farabak.net",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "محصولات",
              item: "https://farabak.net/products",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: categoryName,
              item: `https://farabak.net/products/${categoryName}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: subCategoryTitle,
              item: `https://farabak.net/products/${categoryName}/${subcategoryName}`,
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: `محصولات ${subCategoryTitle}`,
          description: `مجموعه‌ای از محصولات ${subCategoryTitle} شامل دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی`,
          numberOfItems: "30+",
          itemListElement: {
            "@type": "Product",
            name: `محصولات ${subCategoryTitle}`,
            description: `محصولات ${subCategoryTitle} با کیفیت بالا و گارانتی معتبر`,
            image: "https://farabak.net/Farabak_Logo.webp",
            brand: {
              "@type": "Brand",
              name: "فرابک",
            },
            category: subCategoryTitle,
          },
        },
        inLanguage: "fa-IR",
      },
    ],
  };

  const jsonLdString = JSON.stringify(jsonLd);

  return (
    <>
      <Script
        id="json-ld-subcategory"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGridWrapper
          title={subCategoryTitle}
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categoryName}
          subcategorySlug={subcategoryName}
          canonicalUrl={canonicalUrl}
        />
      </Suspense>
    </>
  );
}
