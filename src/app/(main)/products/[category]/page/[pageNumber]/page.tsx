import { Metadata } from "next";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import axios from "axios";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

// Dynamic Metadata
export const generateMetadata = async ({
  params,
}: CategoryPageProps): Promise<Metadata> => {
  const categoryName = params.category;

  try {
    // Fetch category name from the API
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getCategoryName/${categoryName}`
    );

    if (!res.data || !res.data.categoryName) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
      };
    }

    const category = res.data.categoryName;

    return {
      title: `مشاهده محصولات دسته بندی ${category} | فرابک`,
      description: `با مرور در صفحه ${category} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    };
  } catch (error) {
    console.error("Error fetching category data for metadata:", error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  const categoryName = params.category;
  const currentPage = parseInt(searchParams.page || "1", 10);
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
    console.error("Error fetching category data:", error);
    notFound(); // Trigger 404 page if category not found
  }

  // Breadcrumbs for navigation
  const breadcrumbs = [
    { path: "صفحه اصلی", href: "/" },
    { path: "محصولات", href: "/products" },
    { path: categoryTitle, href: `/products/${categoryName}` },
  ];

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <ProductGrid
        title={categoryTitle} // Dynamically fetched category title
        apiUrl={apiUrl} // API URL for products
        currentPage={currentPage}
        categorySlug={categoryName} // Category slug for additional logic if needed
      />
    </div>
  );
};

export default CategoryPage;
