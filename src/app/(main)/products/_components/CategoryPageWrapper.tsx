import Script from "next/script";
import { Suspense } from "react";

import { getAllCategories } from "@/lib/data/categories";
import { getCategoryName } from "@/lib/data/products";

import CategorySliderWrapper from "./CategorySliderWrapper";
import ProductGridWrapper from "./ProductGridWrapper";
import { CategorySliderSkeleton, ProductGridSkeleton } from "./ProductListSkeletons";

interface Subcategory {
  Name: string;
  Slug: string;
  Link?: string;
}

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

async function fetchCategorySubcategories(categoryName: string) {
  try {
    const allCategories = await getAllCategories();
    const categoryData = allCategories.find((cat) => cat.Slug === categoryName);
    if (categoryData && categoryData.Subcategories) {
      return categoryData.Subcategories.filter((subcat) => subcat.Available !== false).map(
        (subcat) => ({
          Name: subcat.Name || "",
          Slug: subcat.Slug || "",
          Link: subcat.Link,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching category data for schema:", error);
  }
  return [];
}

export default async function CategoryPageWrapper({
  categoryName,
  currentPage,
  limit,
  canonicalUrl,
}: CategoryPageWrapperProps) {
  const [categoryTitle, subcategories] = await Promise.all([
    fetchCategoryData(categoryName),
    fetchCategorySubcategories(categoryName),
  ]);

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=${currentPage}&limit=${limit}`;

  const subcategoryItemList = subcategories.map((subcat: Subcategory, index: number) => ({
    "@type": "ListItem",
    position: index + 1,
    name: subcat.Name,
    url: `https://farabak.net${subcat.Link || `/products/${categoryName}/${subcat.Slug}`}`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products/${categoryName}`,
        url: `https://farabak.net/products/${categoryName}`,
        name: `محصولات دسته‌بندی ${categoryTitle} | فرابک`,
        description: `مجموعه‌ای از محصولات ${categoryTitle} با کیفیت بالا و گارانتی معتبر از فرابک`,
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
              name: categoryTitle,
              item: `https://farabak.net/products/${categoryName}`,
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: `محصولات ${categoryTitle}`,
          description: `مجموعه‌ای از محصولات ${categoryTitle} شامل دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی`,
          numberOfItems: "30+",
          itemListElement: {
            "@type": "Product",
            name: `محصولات ${categoryTitle}`,
            description: `محصولات ${categoryTitle} با کیفیت بالا و گارانتی معتبر`,
            image: "https://farabak.net/Farabak_Logo.webp",
            brand: {
              "@type": "Brand",
              name: "فرابک",
            },
            category: categoryTitle,
          },
        },
        inLanguage: "fa-IR",
      },
      {
        "@type": "ItemList",
        "@id": `https://farabak.net/products/${categoryName}#subcategories`,
        name: `دسته‌بندی‌های ${categoryTitle}`,
        description: `دسته‌بندی‌های مختلف در ${categoryTitle}`,
        numberOfItems: subcategoryItemList.length,
        itemListElement: subcategoryItemList,
      },
    ],
  };

  const jsonLdString = JSON.stringify(jsonLd);

  return (
    <>
      <Script
        id="json-ld-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
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
        />
      </Suspense>
    </>
  );
}
