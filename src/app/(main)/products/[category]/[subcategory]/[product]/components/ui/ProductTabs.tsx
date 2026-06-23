"use client";

import styles from "../../ProductPage.module.css";

// Scroll function with offset
function scrollToSection(id: string) {
  const element = document.getElementById(id);
  const navHeight = document.querySelector<HTMLElement>(".productTabs")?.offsetHeight || 140; // Default to 70px if not found

  if (element) {
    const yOffset = -navHeight - 10; // Offset by nav height + some margin
    const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: yPosition,
      behavior: "smooth",
    });
  }
}

const ProductTabs = () => {
  return (
    <nav className={styles.productTabs}>
      <ul>
        <li>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollToSection("overview")}
          >
            توضیحات
          </button>
        </li>
        <li>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollToSection("blog")}
          >
            توضیحات تکمیلی
          </button>
        </li>
        <li>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollToSection("specs")}
          >
            مشخصات
          </button>
        </li>
        <li>
          <button type="button" className={styles.navButton} onClick={() => scrollToSection("faq")}>
            سوالات
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProductTabs;
