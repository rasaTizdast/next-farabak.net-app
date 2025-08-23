import { Metadata } from "next";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

interface ProductsPageProps {
  params: Promise<{ pageNumber: string }>;
}

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const params = await props.params;
  const currentPage = parseInt(params.pageNumber || "1", 10);

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    },
    alternates: {
      canonical:
        params.pageNumber === "1"
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/products`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/products/page/${params.pageNumber}`,
    },
  };
};

const ProductsPage = async (props: ProductsPageProps) => {
  const params = await props.params;
  const currentPage = parseInt(params.pageNumber, 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;

  // Breadcrumb paths
  const breadcrumbs = ["/", "/products"];

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <ProductGrid title="تمامی محصولات" apiUrl={apiUrl} currentPage={currentPage} />
    </div>
  );
};

export default ProductsPage;
