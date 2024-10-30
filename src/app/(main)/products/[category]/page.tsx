// src/app/products/[category]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/Breadcrumb";
import categoryPagesData from "@/constants/categoryPagesData.json";
import axios from "axios";

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export const generateMetadata = ({ params }: CategoryPageProps): Metadata => {
  const categoryData = categoryPagesData.find(
    (cat) => cat.slug === params.category
  );

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description: "This category does not exist.",
    };
  }

  return {
    title: `${categoryData.category} | فرابک`,
    description: `Explore ${categoryData.category} products on فرابک.`,
  };
};

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  const categoryData = categoryPagesData.find(
    (cat) => cat.slug === params.category
  );

  if (!categoryData) {
    notFound();
  }

  // Get the current page from searchParams, default to 1
  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30; // Hardcoded limit

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${categoryData.categoryId}`,
      {
        params: {
          page: currentPage,
          limit,
        },
      }
    );

    const { data: products, pagination } = response.data;
    const totalPages = pagination.totalPages;

    const breadcrumbs = [
      { path: "/", href: "/" },
      { path: "/products", href: "/products" },
      { path: `/products/${categoryData.slug}`, href: `/products/${categoryData.slug}` }, // Ensure `categoryData.slug` gives a correct value
    ];

    return (
      <div>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <ProductGrid
          title={categoryData.category}
          products={products}
          currentPage={currentPage}
          totalPages={totalPages}
          categorySlug={categoryData.slug} // Pass categorySlug here
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    notFound();
  }
};

export default CategoryPage;
