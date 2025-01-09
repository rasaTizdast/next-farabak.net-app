import { Metadata } from "next";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import axios from "axios";
import { notFound } from "next/navigation";

interface SubcategoryPageProps {
  params: { category: string; subcategory: string };
}

// Generate metadata for SEO
export const generateMetadata = async ({
  params,
}: SubcategoryPageProps): Promise<Metadata> => {
  const subCategoryName = params.subcategory;

  try {
    // Fetch category data from the API for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subCategoryName}?page=1&limit=1`
    );

    if (!res || !res.data || !res.data.seoDetails) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
      };
    }

    const { seoDetails } = res.data;

    return {
      title: seoDetails.SEO_Title || `محصولات دسته‌بندی ${subCategoryName}`,
      description:
        seoDetails.SEO_Description || `محصولات دسته‌بندی ${subCategoryName}`,
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const SubcategoryPage = async ({ params }: SubcategoryPageProps) => {
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
    console.error("Error fetching subCategory data:", error);
    notFound();
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=${currentPage}&limit=${limit}`;

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
        title={subCategoryTitle}
        apiUrl={apiUrl}
        currentPage={currentPage}
        categorySlug={category}
        subcategorySlug={subcategory}
      />
    </div>
  );
};

export default SubcategoryPage;
