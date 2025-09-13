import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

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
          "@id": "https://farabak.net/#website",
        },
        about: {
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
            category: categoryTitle,
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "IRR",
              availability: "https://schema.org/InStock",
              seller: {
                "@id": "https://farabak.net",
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
