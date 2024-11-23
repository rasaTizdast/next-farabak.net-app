// src/app/(main)/products/_components/GridContentServer.tsx

import { fetchProducts } from "../_utils/fetchProducts";
import Link from "next/link";
import Image from "next/image";
import styles from "./ProductGrid.module.css";
import Pagination from "@/app/_components/ui/Pagination";

interface Product {
  ProductId: number;
  Type: string;
  img1: string;
  Slug: string;
  link: string;
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

  return (
    <>
      <div className={styles.productGrid}>
        {products.map((product: Product) => (
          <Link
            key={product.ProductId}
            href={`/products/${product.link}`}
            className={styles.productCard}
          >
            <Image
              width={280}
              height={280}
              quality={100}
              src={`/productImages/${product.img1}`}
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
