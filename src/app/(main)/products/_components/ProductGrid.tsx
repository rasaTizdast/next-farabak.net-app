// src/app/(main)/products/_components/ProductGrid.tsx

import { Suspense } from "react";

import SkeletonLoader from "@/app/_components/ui/SkeletonLoader";

import { GridContentServer } from "./GridContentServer"; // Server component for products
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
}) => {
  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.gridTitle}>{title}</h1>

      <Suspense fallback={<SkeletonLoader amount={15} />}>
        <GridContentServer
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
        />
      </Suspense>
    </div>
  );
};

export default ProductGrid;
