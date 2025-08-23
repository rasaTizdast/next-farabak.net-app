// app/products/[category]/[product]/components/ProductSpecs.tsx
import axios from "axios";

import styles from "./ProductSpecs.module.css";

interface Spec {
  productSpecsId: number;
  Title: string;
  Description: string;
}

async function getProductSpecs(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductSpecsByProductId?productId=${productId}`
    );

    if (!res) throw new Error("Failed to fetch specs");
    return res.data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ProductSpecs({ productId }: { productId: number }) {
  const specsData = await getProductSpecs(productId);

  return (
    <div className={styles.specsParent}>
      <h3>مشخصات محصول</h3>
      <div className={styles.specs}>
        {specsData.map((item: Spec, index: number) => (
          <div
            className={`${index % 2 ? styles.oddSpec : styles.evenSpec} ${styles.spec}`}
            key={item.productSpecsId}
          >
            <div className={styles.key}>{item.Title}</div>
            <div className={styles.value}>{item.Description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
