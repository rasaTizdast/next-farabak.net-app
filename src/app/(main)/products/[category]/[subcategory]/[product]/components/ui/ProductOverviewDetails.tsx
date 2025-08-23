// app/products/[category]/[product]/components/ProductOverview.tsx
import axios from "axios";
import Image from "next/image";

import styles from "./ProductOverviewDetails.module.css";

interface OverviewDetail {
  ProductOverviewDetailsId: number;
  ProductName: string;
  Title: string | null;
  Description: string | null;
  Img: string | null;
}

async function getProductOverviewDetails(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productOverviewDetails/getProductOverviewDetails/${productId}`
    );

    if (!res) throw new Error("Failed to fetch overview details");
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function Overview({
  title,
  description,
  img,
}: {
  title: string | null;
  description: string | null;
  img: string | null;
}) {
  return (
    <div className={styles.overview}>
      <div className={styles.details}>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </div>
      {img && (
        <Image
          src={`${process.env.LIARA_BUCKET_URL}/overview-details-images${img}`}
          alt={title || "Product image"}
          width={1920}
          height={1080}
          quality={100}
          loading="lazy"
          className={styles.overviewImage}
        />
      )}
    </div>
  );
}

export default async function ProductOverviewDetails({ productId }: { productId: number }) {
  const productDetails = await getProductOverviewDetails(productId);

  if (productDetails.length === 0) {
    return <p className={styles.overviewNotFound}>اطلاعاتی یافت نشد / این محصول توضیحات ندارد</p>;
  }

  return (
    <div className={styles.overviews}>
      {productDetails.map((detail: OverviewDetail) => (
        <div className={styles.overview} key={detail.ProductOverviewDetailsId}>
          <Overview title={detail.Title} description={detail.Description} img={detail.Img} />
        </div>
      ))}
    </div>
  );
}
