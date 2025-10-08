import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { fetchProducts } from "@/app/(main)/products/_utils/fetchProducts";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { calculateProductPricing, formatPriceForSchema } from "@/helpers/pricingHelper";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

// Generate metadata for SEO
export const generateMetadata = async (props: SubcategoryPageProps): Promise<Metadata> => {
  const params = await props.params;
  const { category, subcategory } = params;

  try {
    // Fetch category data from the API for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=1&limit=1`
    );

    if (!res || !res.data || !res.data.seoDetails) {
      return {
        title: subcategory,
        description: "دسته بندی مورد نظر یافت نشد!",
      };
    }

    const { seoDetails } = res.data;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${category}/${subcategory}`,
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

const SubcategoryPage = async (props: SubcategoryPageProps) => {
  const params = await props.params;
  const { category, subcategory } = params;
  const currentPage = parseInt("1", 10);
  const limit = 30;

  let subCategoryTitle = subcategory;

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getSubCategoryName/${subcategory}`
    );

    if (!res) {
      throw new Error("Failed to fetch subCategory data");
    }

    subCategoryTitle = res.data.subCategoryName;
  } catch (error) {
    console.error(error);
    notFound();
  }

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
        "@id": `https://farabak.net/products/${category}/${subcategory}`,
        url: `https://farabak.net/products/${category}/${subcategory}`,
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
              name: category,
              item: `https://farabak.net/products/${category}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: subCategoryTitle,
              item: `https://farabak.net/products/${category}/${subcategory}`,
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
          title={subCategoryTitle}
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={category}
          subcategorySlug={subcategory}
        />
      </div>
    </>
  );
};

export default SubcategoryPage;
