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
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
  currentPage,
  totalPages,
}) => {
  console.log(totalPages);
  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.gridTitle}>{title}</h1>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <Link
            key={product.ProductId}
            href={`/products/${product.ProductId}`}
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
        basePath="/products"
      />
    </div>
  );
};

export default ProductGrid;
