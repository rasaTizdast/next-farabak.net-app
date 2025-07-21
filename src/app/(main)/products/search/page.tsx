export const dynamic = "force-dynamic";

// src/app/products/search/page.tsx

import { Metadata } from "next";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

interface SearchPageProps {
  searchParams: Promise<{ q: string; page?: string }>;
}

export async function generateMetadata(
  props: SearchPageProps
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  return {
    title: `نتایج جستجو برای "${query}"`,
    description: `مشاهده ${query} در سایت فرابک`,
    robots: {
      index: false, // This sets the noindex directive
      follow: true, // Allows crawling of links on the page if needed
    },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const limit = 0;
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search?q=${query}&page=${currentPage}&limit=${limit}`;

  const breadcrumbs = ["/", "/products", "/products/search"];

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
