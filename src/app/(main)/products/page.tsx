export const dynamic = "force-dynamic";

// src/app/products/page.tsx

import { Metadata } from "next";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { fetchProducts } from "@/app/(main)/products/_utils/fetchProducts";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
    },
  };
};

const ProductsPage = async (props: ProductsPageProps) => {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;

  // Fetch products to calculate pricing
  const { data: products } = await fetchProducts(apiUrl);
  const availableProducts = products.filter((product: any) => product.Available);

  // Calculate pricing for JSON-LD
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

  // Pass paths instead of Persian names
  const breadcrumbs = ["/", "/products"];

  const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products?page=${currentPage}`,
        url: `https://farabak.net/products?page=${currentPage}`,
        name: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
        description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
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
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: "محصولات فرابک",
          description:
            "مجموعه‌ای از محصولات نظارتی و امنیتی شامل دوربین‌های مداربسته ریولینک و محصولات امنیتی Smiths Detection و Ceia",
          numberOfItems: "30+",
          itemListElement: {
            "@type": "Product",
            name: "محصولات نظارتی و امنیتی",
            description: "دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی با کیفیت بالا",
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
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <ProductGrid title="تمامی محصولات" apiUrl={apiUrl} currentPage={currentPage} />
      </div>
    </>
  );
};

export default ProductsPage;
