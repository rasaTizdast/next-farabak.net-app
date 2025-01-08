// src/app/products/page.tsx

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Metadata } from "next";

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

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;

  // Pass paths instead of Persian names
  const breadcrumbs = [{ path: "/" }, { path: "/products" }];

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <ProductGrid
        title="تمامی محصولات"
        apiUrl={apiUrl}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ProductsPage;
