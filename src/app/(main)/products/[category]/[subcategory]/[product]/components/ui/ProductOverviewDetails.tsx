// app/products/[category]/[product]/components/ProductOverview.tsx
import Image from "next/image";
import styles from "./ProductOverviewDetails.module.css";
import axios from "axios";

interface OverviewDetail {
  productOverviewDetailsId: number;
  [key: string]: any;
}

async function getProductOverviewDetails(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productOverviewDetails/getProductOverviewDetails/${productId}`
    );

    if (!res) throw new Error("Failed to fetch overview details");
    return res.data;
  } catch (error) {
    console.error("Error fetching product overview details:", error);
    return [];
  }
}

function Overview({
  title,
  description,
  img,
}: {
  title: string;
  description: string;
  img: string;
}) {
  return (
    <div className={styles.overview}>
      <div className={styles.details}>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </div>
      {img && (
        <Image
          src={`/overview-details-images${img}`}
          alt={title}
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

export default async function ProductOverviewDetails({
  productId,
}: {
  productId: number;
}) {
  const productDetails = await getProductOverviewDetails(productId);

  if (productDetails.length === 0) {
    return (
      <p className={styles.overviewNotFound}>
        اطلاعاتی یافت نشد / این محصول توضیحات ندارد
      </p>
    );
  }

  const renderOverviews = (detail: OverviewDetail) => {
    const overviews = [];

    for (let i = 1; i <= 16; i++) {
      const title = detail[`title${i}`];
      const description = detail[`description${i}`];
      const img = detail[`img${i}`];

      if (title && description && img) {
        overviews.push(
          <Overview
            key={`overview-${i}`}
            title={title}
            description={description}
            img={img}
          />
        );
      }
    }

    return overviews;
  };

  return (
    <div className={styles.overviews}>
      {productDetails.map((detail) => (
        <div className={styles.overviews} key={detail.productOverviewDetailsId}>
          {renderOverviews(detail)}
        </div>
      ))}
    </div>
  );
}
