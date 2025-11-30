import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import CategorySlider from "@/app/(main)/products/_components/CategorySlider";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { fetchProducts } from "@/app/(main)/products/_utils/fetchProducts";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const generateMetadata = async (props: CategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const categoryName = params.category;

  try {
    // Fetch category data from the API for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=1&limit=1`
    );

    if (!res || !res.data || !res.data.seoDetails) {
      return {
        title: categoryName,
        description: `محصولات دسته‌بندی ${categoryName}`,
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const { seoDetails } = res.data;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${categoryName}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: "دسته‌بندی یافت نشد!",
      description: "دسته‌بندی مورد نظر یافت نشد!",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
};

const CategoryPage = async (props: CategoryPageProps) => {
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = parseInt("1", 10);
  const limit = 30;

  // API URL for fetching products by category
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=${currentPage}&limit=${limit}`;

  // Fetch category data for setting the title dynamically
  let categoryTitle = categoryName;

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getCategoryName/${categoryName}`
    );

    if (!res) {
      throw new Error("Failed to fetch category data");
    }

    categoryTitle = res.data.categoryName;
  } catch (error) {
    console.error(error);
    notFound();
  }

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

  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch category data for subcategories schema
  let categoryData: any = null;
  let subcategoryItemList: any[] = [];
  try {
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/getAll`, {
      next: { revalidate: 60 },
    });
    if (categoriesRes.ok) {
      const allCategories = await categoriesRes.json();
      categoryData = allCategories.find((cat: any) => cat.Slug === categoryName);
      if (categoryData && categoryData.Subcategories) {
        subcategoryItemList = categoryData.Subcategories.filter(
          (subcat: any) => subcat.Available !== false
        ).map((subcat: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          name: subcat.Name,
          url: `https://farabak.net${subcat.Link || `/products/${categoryName}/${subcat.Slug}`}`,
        }));
      }
    }
  } catch (error) {
    console.error("Error fetching category data for schema:", error);
  }

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
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <CategorySlider type="subcategories" categorySlug={categoryName} />
        <ProductGrid
          title={categoryTitle} // Passing dynamically fetched category title
          apiUrl={apiUrl} // Passing API URL for product fetching
          currentPage={currentPage}
          categorySlug={categoryName} // Passing categorySlug
        />
      </div>
    </>
  );
};

export default CategoryPage;
