import { notFound } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";

import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";
import { getProductsBySubcategory, getSubCategoryName } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { getPriceValidUntil } from "@/utils/priceValidUntil";

import ProductGridWrapper from "./ProductGridWrapper";
import { ProductGridSkeleton } from "./ProductListSkeletons";

interface Product {
  ProductId: number;
  Name: string | null;
  Type: string | null;
  Price: string | null;
  Discount: string | null;
  Available: boolean | null;
}

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

async function fetchProductsAndPricing(
  subcategoryName: string,
  currentPage: number,
  limit: number,
  usdRate: number | null
) {
  let result: Awaited<ReturnType<typeof getProductsBySubcategory>> = null;

  try {
    result = await getProductsBySubcategory(subcategoryName, { page: currentPage, limit });
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (result === null) {
    notFound();
  }

  const products = result.data as Product[];
  const availableProducts = products.filter((product: Product) => product.Available);

  let minPrice = "0";
  let maxPrice = "0";
  let hasValidPricing = false;

  if (availableProducts.length > 0) {
    const pricingPromises = availableProducts.map(async (product: Product) => {
      return await calculateProductPricing(product.Price, product.Discount, usdRate);
    });

    const pricingResults = await Promise.all(pricingPromises);
    const validPrices: number[] = [];
    for (const pricing of pricingResults) {
      if (pricing.isValidRate && pricing.originalPrice !== null) {
        validPrices.push(pricing.originalPrice);
      }
    }

    if (validPrices.length > 0) {
      minPrice = formatPriceForSchema(Math.min(...validPrices));
      maxPrice = formatPriceForSchema(Math.max(...validPrices));
      hasValidPricing = true;
    }
  }

  return { products: availableProducts, minPrice, maxPrice, hasValidPricing };
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

  const { rate } = await getUsdToRialRate();

  const { minPrice, maxPrice, hasValidPricing } = await fetchProductsAndPricing(
    subcategoryName,
    currentPage,
    limit,
    rate
  );

  const priceValidUntil = getPriceValidUntil();

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
