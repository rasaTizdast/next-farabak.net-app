import { fetchProducts } from "../_utils/fetchProducts";
import Link from "next/link";
import Image from "next/image";
import styles from "./ProductGrid.module.css";
import Pagination from "@/app/_components/ui/Pagination";

interface Product {
  ProductId: number;
  Type: string;
  img1: string;
  productSlug: string;
  Slug?: string;
  link: string;
  Available: boolean;
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
              width={280}
              height={280}
              quality={100}
              src={`${process.env.LIARA_BUCKET_URL}/productImages/${
                product.productSlug || product.Slug
              }/${product.productSlug || product.Slug}-mini.webp`}
              alt={product.Type}
              loading="eager"
            />
            <h2>{product.Type}</h2>
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
