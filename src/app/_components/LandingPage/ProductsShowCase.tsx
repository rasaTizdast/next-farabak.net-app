import Link from "next/link";
import Image from "next/image";
import styles from "./ProductsShowCase.module.css";
import { prisma } from "@/lib/prisma";

async function getProducts() {
  try {
    const products = await prisma.showcase_products.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching showcase products:", error);
    throw new Error("Failed to fetch showcase products");
  }
}

const ProductsShowCase = async () => {
  const products = await getProducts();

  const getRowClass = (index: number) => {
    if (index === 0) return styles.oneThird;
    if (index === 1) return styles.twoThirds;
    if (index === 2) return styles.twoThirds;
    if (index === 3) return styles.oneThird;
    return styles.half;
  };

  return (
    <div className={styles.container}>
      <h2>محصولات رئولینک</h2>
      <div className={styles.cards}>
        {Array.from(
          { length: Math.ceil(products.length / 2) },
          (_, rowIndex) => (
            <div className={styles.row} key={rowIndex}>
              {products
                .slice(rowIndex * 2, rowIndex * 2 + 2)
                .map((product, cardIndex) => (
                  <Link
                    key={product.id}
                    href={product.link}
                    className={`${styles.card} ${getRowClass(
                      rowIndex * 2 + cardIndex
                    )}`}
                  >
                    <Image
                      src={`${process.env.LIARA_BUCKET_URL}/${product.image}`}
                      alt={product.title}
                      loading="lazy"
                      height={780}
                      width={1340}
                    />
                    <div className={styles.details}>
                      <h3>{product.title}</h3>
                      <p>{product.description}</p>
                    </div>
                  </Link>
                ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductsShowCase;
