import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { Metadata } from "next";

interface ProductsPageProps {
  params: { pageNumber: string };
}

export const generateMetadata = ({ params }: ProductsPageProps): Metadata => {
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

const ProductsPage = async ({ params }: ProductsPageProps) => {
  const currentPage = parseInt(params.pageNumber, 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;

  // Breadcrumb paths
  const breadcrumbs = [
    { path: "/", href: "/" },
    { path: "/products", href: "/products" },
  ];

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
