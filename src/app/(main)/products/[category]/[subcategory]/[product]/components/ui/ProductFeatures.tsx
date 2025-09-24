// app/products/[category]/[product]/components/ProductFeatures.tsx
import axios from "axios";

import styles from "../../ProductPage.module.css";

async function getProductFeatures(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productOverview/getProductOverview/${productId}`
    );

    if (!res) throw new Error("Failed to fetch features");

    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ProductFeatures({ productId }: { productId: number }) {
  const features = await getProductFeatures(productId);

  if (!features) {
    return <p>ویژگی برای این محصول یافت نشد</p>;
  }

  const properties = [
    features.Property1,
    features.Property2,
    features.Property3,
    features.Property4,
  ].filter((prop) => prop !== null && prop !== undefined && prop.trim() !== "");

  if (properties.length === 0) {
    return <p>ویژگی برای این محصول یافت نشد</p>;
  }

  return (
    <ul className={styles.productFeatures}>
      {properties.map((property, index) => (
        <li key={index}>{property}</li>
      ))}
    </ul>
  );
}
