import { notFound } from "next/navigation";
import Script from "next/script";

import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";
import {
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
} from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";
import { getPriceValidUntil } from "@/utils/priceValidUntil";

import ProductGrid from "./ProductGrid";

interface Product {
  ProductId: number;
  Name: string | null;
  Type: string | null;
  Price: string | null;
  Discount: string | null;
  Available: boolean | null;
}

interface ProductFeed {
  data: Product[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ProductGridWrapperProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  canonicalUrl?: string;
}

async function loadProductFeed(apiUrl: string): Promise<ProductFeed> {
  let feed: ProductFeed | null = null;

  try {
    const url = new URL(apiUrl);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "30");
    const pathname = url.pathname;

    if (pathname.includes("/getAllProducts")) {
      feed = (await getAllProducts({ page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/getProductsByCategory/")) {
      const slug = pathname.split("/getProductsByCategory/")[1] || "";
      feed = (await getProductsByCategory(slug, { page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/getProductsBySubcategory/")) {
      const slug = pathname.split("/getProductsBySubcategory/")[1] || "";
      feed = (await getProductsBySubcategory(slug, { page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/api/products/search")) {
      feed = (await searchProducts(url.searchParams.get("q") || "", {
        page,
        limit,
      })) as ProductFeed;
    } else {
      throw new Error(`Unsupported product feed URL: ${apiUrl}`);
    }
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (feed === null) {
    notFound();
  }

  return feed;
}

async function fetchProductsAndPricing(apiUrl: string, usdRate: number | null) {
  const { data } = await loadProductFeed(apiUrl);
  const products = data;
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

export default async function ProductGridWrapper({
  title,
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
  canonicalUrl,
}: ProductGridWrapperProps) {
  const { rate } = await getUsdToRialRate();

  const { products, minPrice, maxPrice, hasValidPricing } = await fetchProductsAndPricing(
    apiUrl,
    rate
  );

  const priceValidUntil = getPriceValidUntil();

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

  const jsonLdString = JSON.stringify(jsonLd);

  return (
    <>
      <Script
        id="json-ld-product-grid"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
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
