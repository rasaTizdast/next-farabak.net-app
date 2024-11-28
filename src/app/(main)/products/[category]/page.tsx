import { Metadata } from "next";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import axios from "axios";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: { category: string };
}

export const generateMetadata = async ({
  params,
}: CategoryPageProps): Promise<Metadata> => {
  const categoryName = params.category;

  try {
    // Fetch category data from the API for metadata
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getCategoryName/${categoryName}`
    );

    if (!res) {
      return {
        title: "دسته بندی یافت نشد!",
        description: "دسته بندی مورد نظر یافت نشد!",
      };
    }

    return {
      title: res.data.SEO_Title,
      description: res.data.SEO_Description,
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      title: "دسته بندی یافت نشد!",
      description: "دسته بندی مورد نظر یافت نشد!",
    };
  }
};

const CategoryPage = async ({ params }: CategoryPageProps) => {
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
    console.error("Error fetching category data:", error);
    notFound();
  }

  const breadcrumbs = [
    { path: "/", href: "/" },
    { path: "/products", href: "/products" },
    {
      path: `/products/${categoryName}`,
      href: `/products/${categoryName}`,
    },
  ];

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <ProductGrid
        title={categoryTitle} // Passing dynamically fetched category title
        apiUrl={apiUrl} // Passing API URL for product fetching
        currentPage={currentPage}
        categorySlug={categoryName} // Passing categorySlug
      />
    </div>
  );
};

export default CategoryPage;
