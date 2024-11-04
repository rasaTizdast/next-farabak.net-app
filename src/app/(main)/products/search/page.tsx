// src/app/products/search/page.tsx

import { Metadata } from "next";

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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const limit = 30;
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search?q=${query}&page=${currentPage}&limit=${limit}`;

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
        apiUrl={apiUrl}
        currentPage={currentPage}
      />
    </div>
  );
}
