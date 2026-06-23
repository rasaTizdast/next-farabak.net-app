export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { Suspense } from "react";

import BreadcrumbWrapper from "../_components/BreadcrumbWrapper";
import ProductGridWrapper from "../_components/ProductGridWrapper";
import { BreadcrumbSkeleton, ProductGridSkeleton } from "../_components/ProductListSkeletons";

interface SearchPageProps {
  searchParams: Promise<{ q: string; page?: string }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  return {
    title: `نتایج جستجو برای "${query}"`,
    description: `مشاهده ${query} در سایت فرابک`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const limit = 0;
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=${limit}`;

  const breadcrumbs = ["/", "/products", "/products/search"];

  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <BreadcrumbWrapper breadcrumbs={breadcrumbs} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGridWrapper
          title={`نتایج جستجو برای: ${query}`}
          apiUrl={apiUrl}
          currentPage={currentPage}
        />
      </Suspense>
    </>
  );
}
