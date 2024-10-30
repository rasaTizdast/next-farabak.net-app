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
  categorySlug?: string; // Make this optional
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
  currentPage,
  totalPages,
  categorySlug, // Destructure here
}) => {
  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.gridTitle}>{title}</h1>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <Link
            key={product.ProductId}
            href={`/products/${categorySlug ? `${categorySlug}/` : ""}${
              product.ProductId
            }`}
            className={styles.productCard}
          >
            <Image
              width={280}
              height={280}
              src={`/productImages/${product.img1}`}
              alt={product.Type}
              loading="lazy"
            />
            <h2>{product.Type}</h2>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/products" // Always keep the base path consistent
        categorySlug={categorySlug} // Pass categorySlug to Pagination
      />
    </div>
  );
};

export default ProductGrid;
