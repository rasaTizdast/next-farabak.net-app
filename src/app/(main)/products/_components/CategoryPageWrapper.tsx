import axios from "axios";
import Script from "next/script";
import { Suspense } from "react";

import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

import CategorySliderWrapper from "./CategorySliderWrapper";
import ProductGridWrapper from "./ProductGridWrapper";
import { CategorySliderSkeleton, ProductGridSkeleton } from "./ProductListSkeletons";
import { fetchProducts } from "../_utils/fetchProducts";

interface CategoryPageWrapperProps {
  categoryName: string;
  currentPage: number;
  limit: number;
  canonicalUrl: string;
}

async function fetchCategoryData(categoryName: string) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getCategoryName/${categoryName}`
    );
    return res.data.categoryName;
  } catch {
    return categoryName;
  }
}

async function fetchCategorySubcategories(categoryName: string) {
  try {
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/getAll`, {
      next: { revalidate: 60 },
    });
    if (!categoriesRes.ok) return [];
    const allCategories = await categoriesRes.json();
    const categoryData = allCategories.find((cat: any) => cat.Slug === categoryName);
    if (categoryData && categoryData.Subcategories) {
      return categoryData.Subcategories.filter((subcat: any) => subcat.Available !== false);
    }
  } catch (error) {
    console.error("Error fetching category data for schema:", error);
  }
  return [];
}

async function fetchProductsAndPricing(apiUrl: string) {
  const { data: products } = await fetchProducts(apiUrl);
  const availableProducts = products.filter((product: any) => product.Available);

  let minPrice = "0";
  let maxPrice = "0";
  let hasValidPricing = false;

  if (availableProducts.length > 0) {
    const pricingPromises = availableProducts.map(async (product: any) => {
      return await calculateProductPricing(product.Price, product.Discount);
    });

    const pricingResults = await Promise.all(pricingPromises);
    const validPrices = pricingResults
      .filter((pricing) => pricing.isValidRate && pricing.originalPrice !== null)
      .map((pricing) => pricing.originalPrice!);

    if (validPrices.length > 0) {
      minPrice = formatPriceForSchema(Math.min(...validPrices));
      maxPrice = formatPriceForSchema(Math.max(...validPrices));
      hasValidPricing = true;
    }
  }

  return { products: availableProducts, minPrice, maxPrice, hasValidPricing };
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

  const { minPrice, maxPrice, hasValidPricing } = await fetchProductsAndPricing(apiUrl);

  const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const subcategoryItemList = subcategories.map((subcat: any, index: number) => ({
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
            offers: {
              "@type": "Offer",
              priceSpecification: hasValidPricing
                ? {
                    "@type": "PriceSpecification",
                    price: minPrice,
                    priceCurrency: "IRR",
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    valueAddedTaxIncluded: true,
                  }
                : {
                    "@type": "PriceSpecification",
                    price: "0",
                    priceCurrency: "IRR",
                    valueAddedTaxIncluded: true,
                  },
              priceValidUntil: priceValidUntil,
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "IR",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 7,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
              shippingDetails: [
                {
                  "@type": "OfferShippingDetails",
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "IR",
                  },
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: "0",
                    currency: "IRR",
                  },
                  deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                      "@type": "QuantitativeValue",
                      minValue: 1,
                      maxValue: 5,
                      unitCode: "DAY",
                    },
                    transitTime: {
                      "@type": "QuantitativeValue",
                      minValue: 2,
                      maxValue: 5,
                      unitCode: "DAY",
                    },
                  },
                },
              ],
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                "@id": "https://farabak.net",
                name: "فرابک",
              },
            },
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

  return (
    <>
      <Script
        id="json-ld-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
