import { fetchProducts } from "../_utils/fetchProducts";
import Link from "next/link";
import Image from "next/image";
import styles from "./ProductGrid.module.css";
import Pagination from "@/app/_components/ui/Pagination";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

interface Product {
  ProductId: number;
  Type: string;
  img1: string;
  productSlug: string;
  Slug?: string;
  link: string;
  Available: boolean;
  Price: string;
  Discount: string;
}

interface GridContentServerProps {
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

export const GridContentServer: React.FC<GridContentServerProps> = async ({
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
}) => {
  const { data: products, pagination } = await fetchProducts(apiUrl);
  const totalPages = pagination.totalPages;

  // Get the USD to Rial rate once for all products
  const usdRate = await fetchUsdToRialRate();
  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  // Filter the products to only include those that are available
  const availableProducts = products.filter(
    (product: Product) => product.Available
  );

  return (
    <>
      <div className={styles.productGrid}>
        {availableProducts.map((product: Product) => (
          <Link
            key={product.ProductId}
            href={`/products/${product.link}`}
            className={styles.productCard}
          >
            <Image
              width={300}
              height={300}
              quality={100}
              src={`${process.env.LIARA_BUCKET_URL}/productImages/${product.img1}`}
              alt={product.Type}
              loading="eager"
            />
            <h2>{product.Type}</h2>
            <div className="font-extralight mt-3">
              {product.Price === null ||
              product.Price === undefined ||
              +product.Price === 0 ? (
                <span className="text-gray-600">
                  برای ثبت سفارش با بخش فروش تماس بگیرید
                </span>
              ) : !isValidRate ? (
                <span className="text-gray-600 font-medium">
                  برای دریافت قیمت تماس بگیرید
                </span>
              ) : product.Discount && +product.Discount > 0 ? (
                <div className="flex flex-col gap-1 items-center text-lg">
                  <span className="text-gray-500 font-light line-through">
                    {(+product.Price * usdRate).toLocaleString("fa-IR") +
                      " تومان"}
                  </span>
                  <span className="font-semibold">
                    {(
                      (+product.Price - +product.Discount) *
                      usdRate
                    ).toLocaleString("fa-IR") + " تومان"}
                  </span>
                </div>
              ) : (
                <span className="text-white text-lg font-semibold">
                  {(+product.Price * usdRate).toLocaleString("fa-IR") +
                    " تومان"}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages} // Replace with dynamic total pages if available
        basePath="/products"
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
      />
    </>
  );
};
