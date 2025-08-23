import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

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

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subcategory} | فرابک`,
      description: seoDetails.SEO_Description || `محصولات دسته‌بندی ${subcategory}`,
      alternates: {
        canonical:
          params.pageNumber === "1"
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${params.subcategory}/page/${params.pageNumber}`,
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

  // Breadcrumbs for navigation
  const breadcrumbs = [
    "/",
    "/products",
    `/products/${category}`,
    `/products/${category}/${subcategory}`,
  ];

  return (
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
  );
};

export default SubcategoryPage;
