import { Metadata } from "next";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import axios from "axios";
import { notFound } from "next/navigation";

interface SubcategoryPageProps {
  params: { category: string; subcategory: string };
  searchParams: { page?: string };
}

// Generate metadata dynamically for the subcategory
export const generateMetadata = async ({
  params,
}: SubcategoryPageProps): Promise<Metadata> => {
  const { subcategory } = params;

  try {
    // Fetch subcategory name for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getSubCategoryName/${subcategory}`
    );

    if (!res.data || !res.data.subCategoryName) {
      return {
        title: "زیر دسته بندی یافت نشد!",
        description: "زیر دسته بندی مورد نظر یافت نشد!",
      };
    }

    const subCategoryName = res.data.subCategoryName;

    return {
      title: `مشاهده محصولات زیر دسته بندی ${subCategoryName} | فرابک`,
      description: `با مرور در صفحه ${subCategoryName} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    };
  } catch (error) {
    console.error("Error fetching subcategory metadata:", error);
    return {
      title: "زیر دسته بندی یافت نشد!",
      description: "زیر دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const SubcategoryPage = async ({
  params,
  searchParams,
}: SubcategoryPageProps) => {
  const { category, subcategory } = params;
  const currentPage = parseInt(searchParams.page || "1", 10);
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
    console.error("Error fetching subcategory data:", error);
    notFound();
  }

  // API endpoint for fetching subcategory products
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subcategory}?page=${currentPage}&limit=${limit}`;

  // Breadcrumbs for navigation
  const breadcrumbs = [
    { path: "صفحه اصلی", href: "/" },
    { path: "محصولات", href: "/products" },
    { path: category, href: `/products/${category}` },
    { path: subCategoryTitle, href: `/products/${category}/${subcategory}` },
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
