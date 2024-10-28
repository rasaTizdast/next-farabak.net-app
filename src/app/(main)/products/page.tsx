// src/app/products/page.tsx

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductsPageProps {
  searchParams: { page?: string };
}

export const generateMetadata = ({
  searchParams,
}: ProductsPageProps): Metadata => {
  const currentPage = parseInt(searchParams.page || "1", 10);

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    },
  };
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30;

  // Fetch products from API with pagination
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`
  );

  if (!response.ok) {
    notFound();
  }

  const { data: products, pagination } = await response.json();
  const totalPages = pagination.totalPages;

  return (
    <div>
      <ProductGrid
        title="تمامی محصولات"
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ProductsPage;
