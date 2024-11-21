// app/products/[category]/[product]/components/ProductFeatures.tsx
import axios from "axios";
import styles from "../../ProductPage.module.css";

async function getProductFeatures(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productOverview/getProductOverview/${productId}`
      // ,{ next: { revalidate: 3600 } }
    );

    if (!res) throw new Error("Failed to fetch features");
    return res.data;
  } catch (error) {
    console.error("Error fetching product features:", error);
    return null;
  }
}

export default async function ProductFeatures({
  productId,
}: {
  productId: number;
}) {
  const features = await getProductFeatures(productId);

  if (!features) {
    return <p>No features available</p>;
  }

  return (
    <ul className={styles.productFeatures}>
      <li>{features.Property1}</li>
      <li>{features.Property2}</li>
      <li>{features.Property3}</li>
      <li>{features.Property4}</li>
    </ul>
  );
}
