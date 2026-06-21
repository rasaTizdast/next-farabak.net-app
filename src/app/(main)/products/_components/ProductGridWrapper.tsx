import Script from "next/script";

import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

import ProductGrid from "./ProductGrid";
import { fetchProducts } from "../_utils/fetchProducts";

interface ProductGridWrapperProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  canonicalUrl?: string;
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

export default async function ProductGridWrapper({
  title,
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
}: ProductGridWrapperProps) {
  const { products, minPrice, maxPrice, hasValidPricing } = await fetchProductsAndPricing(apiUrl);

  const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonicalUrl || `https://farabak.net/products?page=${currentPage}`,
        url: canonicalUrl || `https://farabak.net/products?page=${currentPage}`,
        name: `${title} - صفحه ${currentPage} | فرابک`,
        description: `مجموعه‌ای از ${title} با کیفیت بالا و گارانتی معتبر از فرابک`,
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
          numberOfItems: String(products.length),
          itemListElement: {
            "@type": "Product",
            name: title,
            description: `${title} با کیفیت بالا و گارانتی معتبر`,
            image: "https://farabak.net/Farabak_Logo.webp",
            brand: {
              "@type": "Brand",
              name: "فرابک",
            },
            category: "Security Equipment",
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

  return (
    <>
      <Script
        id="json-ld-product-grid"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
