import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { fetchProducts } from "@/app/(main)/products/_utils/fetchProducts";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    pageNumber: string;
  }>;
}

// Generate metadata dynamically for the subcategory
export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { subcategory } = params;

  try {
    // Fetch subcategory name for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=1&limit=1`
    );

    if (!res || !res.data || !res.data.seoDetails) {
      return {
        title: "زیر دسته بندی یافت نشد!",
        description: "زیر دسته بندی مورد نظر یافت نشد!",
      };
    }

    const { seoDetails } = res.data;

    const canonicalUrl =
      params.pageNumber === "1"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${params.pageNumber}`;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: "زیر دسته بندی یافت نشد!",
      description: "زیر دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const SubcategoryPage = async (props: SubcategoryPageProps) => {
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = parseInt(params.pageNumber || "1", 10);
  const limit = 30;

  let subCategoryTitle = subcategory;

  try {
    // Fetch subcategory name
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getSubCategoryName/${subcategory}`
    );

    if (!res.data || !res.data.subCategoryName) {
      throw new Error("Failed to fetch subcategory data");
    }

    subCategoryTitle = res.data.subCategoryName;
  } catch (error) {
    console.error(error);
    notFound();
  }

  // API endpoint for fetching subcategory products
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=${currentPage}&limit=${limit}`;

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

  // Breadcrumbs for navigation
  const breadcrumbs = [
    "/",
    "/products",
    `/products/${category}`,
    `/products/${category}/${subcategory}`,
  ];

  const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products/${category}/${subcategory}/page/${currentPage}`,
        url: `https://farabak.net/products/${category}/${subcategory}/page/${currentPage}`,
        name: `محصولات ${subCategoryTitle} - صفحه ${currentPage} | فرابک`,
        description: `صفحه ${currentPage} از محصولات ${subCategoryTitle} با کیفیت بالا و گارانتی معتبر از فرابک`,
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
              name: category,
              item: `https://farabak.net/products/${category}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: subCategoryTitle,
              item: `https://farabak.net/products/${category}/${subcategory}`,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: `صفحه ${currentPage}`,
              item: `https://farabak.net/products/${category}/${subcategory}/page/${currentPage}`,
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: `محصولات ${subCategoryTitle} - صفحه ${currentPage}`,
          description: `صفحه ${currentPage} از مجموعه محصولات ${subCategoryTitle} شامل دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی`,
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

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <ProductGrid
          title={subCategoryTitle} // Dynamically fetched subcategory title
          apiUrl={apiUrl} // API URL for product fetching
          currentPage={currentPage}
          categorySlug={category} // Category slug for additional logic if needed
          subcategorySlug={subcategory} // Subcategory slug for additional logic if needed
        />
      </div>
    </>
  );
};

export default SubcategoryPage;
