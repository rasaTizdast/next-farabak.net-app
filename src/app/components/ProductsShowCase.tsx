import Link from "next/link"; // Use Next.js Link for routing
import Image from "next/image"; // Import Image from Next.js
import styles from "./ProductsShowCase.module.css";
import cardData from "../constants/cardData.json"; // Ensure cardData is imported correctly

const ProductsShowCase = () => {
  const getRowClass = (index:number) => {
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
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <div className={styles.row} key={rowIndex}>
            {cardData
              .slice(rowIndex * 2, rowIndex * 2 + 2)
              .map((card, cardIndex) => (
                <Link
                  key={card.id}
                  href={card.link}
                  className={`${styles.card} ${getRowClass(
                    rowIndex * 2 + cardIndex
                  )}`}
                >
                  <Image
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    height={780}
                    width={1340}
                  />
                  <div className={styles.details}>
                    <h3>{card.title}</h3>
                    <p>{card.subTitle}</p>
                  </div>
                </Link>
              ))}
          </div>
        ))}
      </div>
      <Link
        href="/products/category/home-edition"
        className={styles.all_home_edition}
      >
        مشاهده تمامی محصولات رئولینک
      </Link>
    </div>
  );
};

export default ProductsShowCase;
