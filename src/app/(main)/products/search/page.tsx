// src/app/products/search/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import axios from "axios";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/Breadcrumb";

interface SearchPageProps {
  searchParams: { q: string; page?: string };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || "";
  return {
    title: `نتایج جستجو برای "${query}"`,
    description: `مشاهده ${query} در سایت فرابک`,
  };
}

const fetchSearchResults = async (query: string, page: number) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search`,
      {
        params: {
          q: query,
          page,
          limit: 30, // Set the limit as needed
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    notFound();
  }
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const { products, pagination } = await fetchSearchResults(query, currentPage);

  const totalPages = pagination.totalPages;

  const breadcrumbs = [
    { path: "/", href: "/" },
    { path: "/products", href: "/products" },
    { path: "/products/search", href: "/products/search" },
  ];

  return (
    <div>
      {/* Breadcrumbs Navigation */}
      <Breadcrumb breadcrumbs={breadcrumbs} />

      {/* Product Grid with Pagination */}
      <ProductGrid
        title={`نتایج جستجو برای: ${query}`}
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
