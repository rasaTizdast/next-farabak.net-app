// src/app/(main)/products/_components/ProductGrid.tsx
import Link from "next/link";
import Image from "next/image";

import styles from "./ProductGrid.module.css";
import Pagination from "@/app/_components/Pagination";

interface Product {
  ProductId: number;
  Type: string;
  img1: string;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
  subcategorySlug?: string; // Add subcategorySlug here
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
  currentPage,
  totalPages,
  categorySlug,
  subcategorySlug, // Destructure subcategorySlug here
}) => {
  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.gridTitle}>{title}</h1>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <Link
            key={product.ProductId}
            href={`/products/${categorySlug ? `${categorySlug}/` : ""}${
              subcategorySlug ? `${subcategorySlug}/` : ""
            }${product.ProductId}`}
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
        totalPages={totalPages}
        basePath="/products"
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug} // Pass subcategorySlug to Pagination
      />
    </div>
  );
};

export default ProductGrid;
