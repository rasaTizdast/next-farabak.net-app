import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { fetchProducts } from "@/app/(main)/products/_utils/fetchProducts";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

interface CategoryPageProps {
  params: Promise<{ category: string; pageNumber: string }>;
}

// Dynamic Metadata
export const generateMetadata = async (props: CategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const categoryName = params.category;

  try {
    // Fetch category name from the API
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=1&limit=1`
    );

    if (!res || !res.data || !res.data.seoDetails) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
      };
    }

    const { seoDetails } = res.data;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${categoryName}`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${categoryName}`,
      alternates: {
        canonical:
          params.pageNumber === "1"
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/page/${params.pageNumber}`,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const CategoryPage = async (props: CategoryPageProps) => {
  const params = await props.params;
  const categoryName = params.category;
  const currentPage = parseInt(params.pageNumber || "1", 10);
  const limit = 30;

  // API endpoint for fetching products by category
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryName}?page=${currentPage}&limit=${limit}`;

  // Fetch category title
  let categoryTitle = categoryName;

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getCategoryName/${categoryName}`
    );

    if (!res.data || !res.data.categoryName) {
      throw new Error("Category not found");
    }

    categoryTitle = res.data.categoryName;
  } catch (error) {
    console.error(error);
    notFound(); // Trigger 404 page if category not found
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

  // Breadcrumbs for navigation
  const breadcrumbs = ["/", "/products", `/products/${categoryName}`];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products/${categoryName}/page/${currentPage}`,
        url: `https://farabak.net/products/${categoryName}/page/${currentPage}`,
        name: `محصولات دسته‌بندی ${categoryTitle} - صفحه ${currentPage} | فرابک`,
        description: `صفحه ${currentPage} از محصولات ${categoryTitle} با کیفیت بالا و گارانتی معتبر از فرابک`,
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
            {
              "@type": "ListItem",
              position: 4,
              name: `صفحه ${currentPage}`,
              item: `https://farabak.net/products/${categoryName}/page/${currentPage}`,
            },
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: `محصولات ${categoryTitle} - صفحه ${currentPage}`,
          description: `صفحه ${currentPage} از مجموعه محصولات ${categoryTitle} شامل دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی`,
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
          title={categoryTitle} // Dynamically fetched category title
          apiUrl={apiUrl} // API URL for products
          currentPage={currentPage}
          categorySlug={categoryName} // Category slug for additional logic if needed
        />
      </div>
    </>
  );
};

export default CategoryPage;
